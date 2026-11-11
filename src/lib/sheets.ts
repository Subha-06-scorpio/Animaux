import "server-only";
import { env } from "./config";
import type { Enquiry, FestEvent, Registration } from "./types";

/**
 * Appends registrations and help-desk messages to a Google Sheet owned by the
 * festival Gmail, through the Apps Script in integrations/google-sheet/Code.gs.
 * The database stays the source of truth; the sheet is a live copy that only
 * ever gains rows (status changes made in the dashboard are not synced).
 */
export const sheetConfigured = () => Boolean(env.sheetWebhookUrl && env.sheetSecret);

const istTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
const absolute = (url: string) => (url.startsWith("/") ? `${env.siteUrl.replace(/\/$/, "")}${url}` : url);

async function post(payload: object) {
  if (!sheetConfigured()) return false;
  try {
    // Apps Script answers a POST with a redirect to the result; the row is already written by then.
    const res = await fetch(env.sheetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: env.sheetSecret }),
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    const ok = res.status === 302 || res.ok;
    if (!ok) console.error("Google Sheet sync failed", res.status, await res.text());
    return ok;
  } catch (e) {
    console.error("Google Sheet sync failed", e);
    return false;
  }
}

export function appendRegistrationToSheet(reg: Registration, ev: FestEvent) {
  const questions = ev.extraQuestions.map((q) => [q.label, q.type === "file" && reg.answers[q.id] ? absolute(reg.answers[q.id]) : reg.answers[q.id] ?? ""]);
  const headers = ["Registered at (IST)", "Registration ID", "Event", "Full name", "College", "Year", "Contact number", "Email", "Team name", "Team size", "Team members", ...questions.map(([h]) => h)];
  const row = [
    istTime(reg.createdAt),
    reg.regCode,
    reg.eventName,
    reg.fullName,
    reg.institution,
    reg.year,
    reg.phone,
    reg.email,
    reg.teamName,
    reg.teamName ? reg.teamMembers.length + 1 : 1,
    reg.teamMembers.map((m) => [m.name, m.phone].filter(Boolean).join(" · ")).join("; "),
    ...questions.map(([, v]) => v),
  ];
  return post({ kind: "registration", event: ev.name, headers, row });
}

export function appendEnquiryToSheet(e: Enquiry) {
  return post({
    kind: "enquiry",
    headers: ["Received at (IST)", "Name", "Email", "Phone", "Topic", "Message"],
    row: [istTime(e.createdAt), e.name, e.email, e.phone, e.category, e.message],
  });
}
