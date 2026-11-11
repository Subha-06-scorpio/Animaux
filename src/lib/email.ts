import "server-only";
import { emailConfigured, env } from "./config";
import type { FestEvent, FestivalSettings, Registration } from "./types";
import { formatDate, formatTime } from "./utils";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends the registration confirmation through Resend (https://resend.com).
 * Returns false (without throwing) when email is not configured or fails —
 * the registration itself is already saved at that point.
 */
export async function sendRegistrationEmail(reg: Registration, ev: FestEvent, s: FestivalSettings): Promise<boolean> {
  if (!emailConfigured) return false;
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
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [reg.email],
        reply_to: s.email || undefined,
        subject: `${s.name} ${s.edition} — ${ev.name} registration ${reg.regCode}`,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  }
}
