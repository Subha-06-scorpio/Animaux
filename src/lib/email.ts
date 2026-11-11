import "server-only";
import { emailConfigured, env, notifyConfigured } from "./config";
import type { Enquiry, FestEvent, FestivalSettings, Registration } from "./types";
import { formatDate, formatTime } from "./utils";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends the registration confirmation through Resend (https://resend.com).
 * Returns false (without throwing) when email is not configured or fails —
 * the registration itself is already saved at that point.
 */
export async function sendRegistrationEmail(reg: Registration, ev: FestEvent, s: FestivalSettings): Promise<boolean> {
  if (!emailConfigured || !reg.email) return false;
  const when = `${formatDate(ev.eventDate)}${ev.startTime ? `, ${formatTime(ev.startTime)}` : ""}`;
  const team = reg.teamName
    ? `<p><strong>Team:</strong> ${esc(reg.teamName)}<br/>${[reg.fullName, ...reg.teamMembers.map((m) => m.name)].map(esc).join(", ")}</p>`
    : "";
  const html = `
  <div style="font-family:Arial,sans-serif;background:#17110c;color:#f3e8d2;padding:32px">
    <p style="letter-spacing:4px;color:#cfa96b;font-size:12px;margin:0">${esc(s.name)} ${esc(s.edition)} · ${esc(s.theme.toUpperCase())}</p>
    <h1 style="font-family:Georgia,serif;font-weight:400">You're in, ${esc(reg.fullName.split(" ")[0])}.</h1>
    <p>Your registration for <strong>${esc(ev.name)}</strong> is confirmed.</p>
    <p style="font-size:22px;letter-spacing:2px;color:#cfa96b;border:1px solid #cfa96b;display:inline-block;padding:8px 14px">${esc(reg.regCode)}</p>
    <p><strong>When:</strong> ${esc(when)}<br/><strong>Venue:</strong> ${esc(ev.venue)}</p>
    ${team}
    <p>Keep this ID handy — you'll need it at the venue. Questions? Reply to this email or contact ${esc(ev.coordinatorName)} (${esc(ev.coordinatorPhone)}).</p>
    <p style="color:#9aa597;font-size:12px">${esc(s.department)}, ${esc(s.college)}</p>
  </div>`;
  return send({ from: env.emailFrom, to: reg.email, replyTo: s.email, subject: `${s.name} ${s.edition} — ${ev.name} registration ${reg.regCode}`, html });
}

async function send(m: { from: string; to: string; replyTo?: string; subject: string; html: string }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo || undefined, subject: m.subject, html: m.html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  }
}

const organiserInbox = (s: FestivalSettings) => env.organiserEmail || s.email;
const organiserFrom = () => env.emailFrom || "ANIMAUX'26 Registrations <onboarding@resend.dev>";
const absolute = (url: string) => (url.startsWith("/") ? `${env.siteUrl.replace(/\/$/, "")}${url}` : url);
const row = (k: string, v: string) =>
  v ? `<tr><td style="padding:6px 12px 6px 0;color:#7a6440;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${v}</td></tr>` : "";

/** Sends a copy of every registration to the festival inbox (e.g. animaux.zoology@gmail.com). */
export async function notifyOrganisersOfRegistration(reg: Registration, ev: FestEvent, s: FestivalSettings): Promise<boolean> {
  const to = organiserInbox(s);
  if (!notifyConfigured || !to) return false;
  const answers = ev.extraQuestions
    .filter((q) => reg.answers[q.id])
    .map((q) => {
      const v = reg.answers[q.id];
      return row(q.label, q.type === "file" ? `<a href="${esc(absolute(v))}">View uploaded photo</a>` : esc(v));
    })
    .join("");
  const members = reg.teamMembers.map((m, i) => row(`Member ${i + 2}`, esc([m.name, m.phone].filter(Boolean).join(" · ")))).join("");
  const html = `
  <div style="font-family:Arial,sans-serif;color:#17110c">
    <h2 style="margin:0 0 4px">New registration · ${esc(ev.name)}</h2>
    <p style="margin:0 0 16px;color:#7a6440">${esc(reg.regCode)} · ${esc(new Date(reg.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</p>
    <table style="border-collapse:collapse;font-size:14px">
      ${row("Name", esc(reg.fullName))}${row("College", esc(reg.institution))}${row("Year", esc(reg.year))}
      ${row("Contact", esc(reg.phone))}${row("Email", esc(reg.email))}${row("Team", esc(reg.teamName))}${members}${answers}
    </table>
    <p style="margin-top:16px;font-size:12px;color:#7a6440">Full list and CSV export: ${esc(env.siteUrl)}/admin/registrations</p>
  </div>`;
  return send({
    from: organiserFrom(),
    to,
    replyTo: reg.email,
    subject: `[ANIMAUX'26] ${ev.name} — ${reg.teamName || reg.fullName} (${reg.regCode})`,
    html,
  });
}

/** Sends help-desk messages to the festival inbox; reply goes straight to the sender. */
export async function notifyOrganisersOfEnquiry(e: Enquiry, s: FestivalSettings): Promise<boolean> {
  const to = organiserInbox(s);
  if (!notifyConfigured || !to) return false;
  const html = `
  <div style="font-family:Arial,sans-serif;color:#17110c">
    <h2 style="margin:0 0 12px">Help desk · ${esc(e.category)}</h2>
    <table style="border-collapse:collapse;font-size:14px">${row("From", esc(e.name))}${row("Email", esc(e.email))}${row("Phone", esc(e.phone))}</table>
    <p style="white-space:pre-line;margin-top:12px">${esc(e.message)}</p>
  </div>`;
  return send({ from: organiserFrom(), to, replyTo: e.email, subject: `[ANIMAUX'26 help desk] ${e.category} — ${e.name}`, html });
}
