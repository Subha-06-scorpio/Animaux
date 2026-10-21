"use server";

import { randomUUID } from "node:crypto";
import { repo, DuplicateRegistrationError } from "@/lib/data";
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
