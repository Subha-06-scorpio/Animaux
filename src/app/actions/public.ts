"use server";

import { randomUUID } from "node:crypto";
import { dataMode, env } from "@/lib/config";
import { repo, DuplicateRegistrationError } from "@/lib/data";
import { admin as serviceClient } from "@/lib/data/supabase";
import { SUBMISSION_MAX_BYTES, SUBMISSION_TYPES } from "@/lib/uploads";
import { sendRegistrationEmail } from "@/lib/email";
import { enquirySchema, registrationSchema } from "@/lib/schemas";
import { clientIp, hashIp, makeRegCode, rateLimit } from "@/lib/security";
import type { Registration } from "@/lib/types";
import { eventStatus } from "@/lib/utils";

type FieldErrors = Record<string, string>;
export type RegisterResult =
  | { ok: true; regCode: string; eventName: string; emailSent: boolean; email: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

const flatten = (issues: { path: PropertyKey[]; message: string }[]) =>
  Object.fromEntries(issues.map((i) => [i.path.map(String).join("."), i.message]));

export async function registerAction(input: unknown): Promise<RegisterResult> {
  try {
    const ip = await clientIp();
    const limit = rateLimit(`reg:${ip}`, 15, 10 * 60_000);
    if (!limit.ok) return { ok: false, error: `Too many attempts. Please try again in ${Math.ceil(limit.retryAfter / 60)} min.` };

    const eventId = (input as { eventId?: unknown })?.eventId;
    if (typeof eventId !== "string") return { ok: false, error: "Please choose an event." };

    const r = repo();
    const [ev, settings, counts] = await Promise.all([r.get("events", eventId), r.getSettings(), r.registrationCounts()]);
    if (!ev || !ev.visible) return { ok: false, error: "This event could not be found." };

    const status = eventStatus(ev, settings, counts[ev.id] ?? 0);
    if (!status.open) return { ok: false, error: `${status.label} for ${ev.name}.` };

    const parsed = registrationSchema(ev).safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error.issues) };
    const d = parsed.data;
    if (d.website) return { ok: true, regCode: "ANX26-OK", eventName: ev.name, emailSent: false, email: d.email }; // bot: pretend success

    // Uploaded photos must live in our own submissions folder.
    const submissionPrefix = dataMode === "local" ? "/media/submissions/" : `${env.supabaseUrl}/storage/v1/object/public/${env.storageBucket}/submissions/${ev.slug}/`;
    for (const q of ev.extraQuestions) {
      const a = d.answers[q.id];
      if (q.type === "file" && a && !a.startsWith(submissionPrefix)) {
        return { ok: false, error: "Please upload your photo again.", fieldErrors: { [`answers.${q.id}`]: "Please upload your photo again" } };
      }
    }

    // Only keep answers to questions this event actually asks.
    const answers = Object.fromEntries(ev.extraQuestions.map((q) => [q.id, d.answers[q.id] ?? ""]).filter(([, v]) => v));

    const base: Omit<Registration, "regCode"> = {
      id: randomUUID(),
      eventId: ev.id,
      eventName: ev.name,
      fullName: d.fullName,
      institution: d.institution,
      department: d.department,
      year: d.year,
      email: d.email,
      phone: d.phone,
      teamName: ev.participation === "team" ? d.teamName : "",
      teamMembers: ev.participation === "team" ? d.teamMembers : [],
      answers,
      status: "confirmed",
      emailSent: false,
      createdAt: new Date().toISOString(),
    };

    let reg: Registration | null = null;
    for (let attempt = 0; attempt < 4 && !reg; attempt++) {
      const candidate = { ...base, regCode: makeRegCode(ev.slug) };
      try {
        await r.createRegistration(candidate, hashIp(ip));
        reg = candidate;
      } catch (e) {
        if (e instanceof DuplicateRegistrationError) {
          return {
            ok: false,
            error: `This ${e.field === "email" ? "email address" : "phone number"} is already registered for ${ev.name}. Lost your ID? Contact the help desk.`,
            fieldErrors: { [e.field]: `Already registered for this event` },
          };
        }
        if (!(e instanceof Error && /reg_code/.test(e.message))) throw e; // retry only on ID collision
      }
    }
    if (!reg) throw new Error("Could not allocate a registration ID");

    const emailSent = await sendRegistrationEmail(reg, ev, settings);
    if (emailSent) await r.updateRegistration(reg.id, { emailSent: true });

    return { ok: true, regCode: reg.regCode, eventName: ev.name, emailSent, email: reg.email };
  } catch (e) {
    console.error("registerAction failed", e);
    return { ok: false, error: "Something went wrong on our side and your registration was not saved. Please try again in a moment." };
  }
}

export type EnquiryResult = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function enquiryAction(input: unknown): Promise<EnquiryResult> {
  try {
    const ip = await clientIp();
    const limit = rateLimit(`enq:${ip}`, 5, 10 * 60_000);
    if (!limit.ok) return { ok: false, error: "You've sent several messages already — please wait a few minutes." };

    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error.issues) };
    const { website, ...d } = parsed.data;
    if (website) return { ok: true };

    await repo().createEnquiry({ id: randomUUID(), ...d, status: "new", createdAt: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    console.error("enquiryAction failed", e);
    return { ok: false, error: "We couldn't send your message right now. Please email us instead." };
  }
}

export type SubmissionTicket =
  | { ok: true; mode: "local" }
  | { ok: true; mode: "supabase"; url: string; anonKey: string; bucket: string; path: string; token: string; publicUrl: string }
  | { ok: false; error: string };

/** Signed upload URL for a participant photo (only for events that ask for one). */
export async function createSubmissionUploadAction(eventId: string, contentType: string, size: number): Promise<SubmissionTicket> {
  try {
    const ip = await clientIp();
    if (!rateLimit(`upload:${ip}`, 10, 10 * 60_000).ok) return { ok: false, error: "Too many uploads — try again in a few minutes." };
    const ext = SUBMISSION_TYPES[contentType];
    if (!ext) return { ok: false, error: "Please upload a JPG, PNG or WebP image." };
    if (!(size > 0 && size <= SUBMISSION_MAX_BYTES)) return { ok: false, error: "Photo must be smaller than 10 MB." };
    const ev = await repo().get("events", eventId);
    if (!ev?.visible || !ev.extraQuestions.some((q) => q.type === "file")) return { ok: false, error: "This event does not accept uploads." };
    if (dataMode === "local") return { ok: true, mode: "local" };

    const path = `submissions/${ev.slug}/${randomUUID()}.${ext}`;
    const storage = serviceClient().storage.from(env.storageBucket);
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) return { ok: false, error: "Upload is unavailable right now. Please try again." };
    return { ok: true, mode: "supabase", url: env.supabaseUrl, anonKey: env.supabaseAnonKey, bucket: env.storageBucket, path, token: data.token, publicUrl: storage.getPublicUrl(path).data.publicUrl };
  } catch (e) {
    console.error("createSubmissionUploadAction failed", e);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
