"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, requirePermission, signInLocal, signOutAll, supabaseServer, can } from "@/lib/auth";
import { dataMode, env } from "@/lib/config";
import { repo } from "@/lib/data";
import { admin as serviceClient } from "@/lib/data/supabase";
import { contentSchemas, settingsSchema } from "@/lib/schemas";
import { clientIp, rateLimit } from "@/lib/security";
import type { CollectionName, Collections, Enquiry, Registration } from "@/lib/types";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" });
const flatten = (issues: { path: PropertyKey[]; message: string }[]) =>
  Object.fromEntries(issues.map((i) => [i.path.map(String).join("."), i.message]));
const refresh = () => revalidatePath("/", "layout");

// ---------- auth ----------

export async function loginAction(_: unknown, form: FormData): Promise<{ error: string }> {
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000).ok) return { error: "Too many attempts. Try again in 15 minutes." };

  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (dataMode === "local") {
    if (!env.localAdminPassword) return { error: "Local admin is disabled. Set LOCAL_ADMIN_PASSWORD in .env.local (development only)." };
    if (!(await signInLocal(password))) return { error: "Incorrect password." };
  } else {
    const sb = await supabaseServer();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: "Incorrect email or password." };
    if (!(await getAdmin())) {
      await sb.auth.signOut();
      return { error: "This account does not have dashboard access. Ask an admin to add you." };
    }
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOutAll();
  redirect("/admin/login");
}

// ---------- content collections ----------

export async function saveItemAction<C extends CollectionName>(collection: C, item: Collections[C]): Promise<ActionResult> {
  try {
    await requirePermission("content.write");
    const parsed = contentSchemas[collection].safeParse(item);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error.issues) };
    const value = parsed.data as Collections[C];

    if (collection === "events") {
      const all = await repo().list("events");
      const ev = value as Collections["events"];
      if (all.some((e) => e.slug === ev.slug && e.id !== ev.id)) return { ok: false, error: "Another event already uses this URL slug.", fieldErrors: { slug: "Slug already in use" } };
    }
    await repo().upsert(collection, value);
    refresh();
    return { ok: true, message: "Saved" };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteItemAction(collection: CollectionName, id: string): Promise<ActionResult> {
  try {
    await requirePermission("content.write");
    if (collection === "events") {
      const regs = await repo().listRegistrations({ eventId: id });
      if (regs.length) return { ok: false, error: `This event has ${regs.length} registration(s). Hide it or close registration instead of deleting.` };
    }
    await repo().remove(collection, id);
    refresh();
    return { ok: true, message: "Deleted" };
  } catch (e) {
    return fail(e);
  }
}

export async function reorderAction(collection: CollectionName, ids: string[]): Promise<ActionResult> {
  try {
    await requirePermission("content.write");
    await repo().setSortOrders(collection, ids);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  try {
    await requirePermission("settings.write");
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error.issues) };
    await repo().saveSettings(parsed.data);
    refresh();
    return { ok: true, message: "Festival settings saved" };
  } catch (e) {
    return fail(e);
  }
}

// ---------- registrations & enquiries ----------

export async function setRegistrationStatusAction(id: string, status: Registration["status"]): Promise<ActionResult> {
  try {
    await requirePermission("registrations.write");
    if (!["confirmed", "attended", "cancelled"].includes(status)) throw new Error("Invalid status");
    await repo().updateRegistration(id, { status });
    revalidatePath("/admin/registrations");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRegistrationAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("registrations.delete");
    await repo().deleteRegistration(id);
    revalidatePath("/admin/registrations");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setEnquiryStatusAction(id: string, status: Enquiry["status"]): Promise<ActionResult> {
  try {
    await requirePermission("enquiries.write");
    if (!["new", "in_progress", "resolved"].includes(status)) throw new Error("Invalid status");
    await repo().updateEnquiry(id, status);
    revalidatePath("/admin/enquiries");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEnquiryAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("enquiries.write");
    await repo().deleteEnquiry(id);
    revalidatePath("/admin/enquiries");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------- media uploads ----------

export type UploadTicket =
  | { mode: "supabase"; url: string; anonKey: string; bucket: string; path: string; token: string; publicUrl: string }
  | { mode: "local" };

const ALLOWED = /^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm|quicktime)|application\/pdf)$/;

/** Issues a one-time signed upload URL so large files go straight to Supabase Storage. */
export async function createUploadAction(fileName: string, contentType: string, folder: string): Promise<UploadTicket | { error: string }> {
  const user = await getAdmin();
  if (!can(user, "content.write") && !can(user, "settings.write")) return { error: "Not authorised" };
  if (!ALLOWED.test(contentType)) return { error: "Only images, videos (mp4/webm/mov) and PDFs can be uploaded." };
  if (dataMode === "local") return { mode: "local" };

  const ext = (fileName.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
  const path = `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await serviceClient().storage.from(env.storageBucket).createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not create upload URL" };
  const publicUrl = serviceClient().storage.from(env.storageBucket).getPublicUrl(path).data.publicUrl;
  return { mode: "supabase", url: env.supabaseUrl, anonKey: env.supabaseAnonKey, bucket: env.storageBucket, path, token: data.token, publicUrl };
}
