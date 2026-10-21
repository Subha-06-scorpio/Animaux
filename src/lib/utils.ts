import { clsx, type ClassValue } from "clsx";
import type { EventStatus, FestEvent, FestivalSettings } from "./types";

export const cn = (...c: ClassValue[]) => clsx(c);

/** All dates are displayed in the festival's time zone so server and browser agree. */
export const FEST_TZ = process.env.NEXT_PUBLIC_FEST_TIMEZONE || "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "TBA";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-IN", { timeZone: /^\d{4}-\d{2}-\d{2}$/.test(iso) ? "UTC" : FEST_TZ, ...opts }).format(d);
}

export const formatDateTime = (iso: string) =>
  formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function formatTime(hhmm: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function participationLabel(e: Pick<FestEvent, "participation" | "teamMin" | "teamMax">) {
  if (e.participation === "individual") return "Individual";
  return e.teamMin === e.teamMax ? `Team of ${e.teamMin}` : `Team · ${e.teamMin}–${e.teamMax}`;
}

export const formatFee = (fee: number | null) => (fee === null ? "TBA" : fee === 0 ? "Free" : `₹${fee}`);

export function eventStatus(ev: FestEvent, settings: Pick<FestivalSettings, "registrationsOpen">, count: number, now = Date.now()): EventStatus {
  if (!settings.registrationsOpen) return { open: false, reason: "paused", label: "Registrations paused" };
  if (!ev.registrationOpen) return { open: false, reason: "closed", label: "Registration closed" };
  if (ev.deadline && now > Date.parse(ev.deadline)) return { open: false, reason: "deadline", label: "Registration ended" };
  if (ev.capacity && count >= ev.capacity) return { open: false, reason: "full", label: "Event full" };
  const left = ev.capacity ? ev.capacity - count : null;
  return { open: true, label: left !== null && left <= 10 ? `Only ${left} spot${left === 1 ? "" : "s"} left` : "Registration open" };
}

export const whatsappLink = (digits: string, text = "") =>
  digits ? `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "";

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** True for obviously placeholder values (used to soften links that go nowhere). */
export const isPlaceholder = (s: string) => !s || /placeholder|example\.com|00000 00000/i.test(s);

/** Festival UTC offset used by admin date-time inputs (IST by default). */
export const FEST_OFFSET = process.env.NEXT_PUBLIC_FEST_TZ_OFFSET || "+05:30";
const offsetMinutes = () => {
  const m = FEST_OFFSET.match(/^([+-])(\d{2}):(\d{2})$/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 330;
};
export function toLocalInput(iso: string) {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t + offsetMinutes() * 60000).toISOString().slice(0, 16);
}
export const fromLocalInput = (v: string) => (v ? `${v}:00${FEST_OFFSET}` : "");

/** "Wednesday, 2 December 2026" for one-day fests, otherwise a range. */
export function festivalDateLabel(s: Pick<FestivalSettings, "startDate" | "endDate" | "datesConfirmed">) {
  if (!s.datesConfirmed) return "Dates to be announced";
  const day = (iso: string) => formatDate(iso, { day: "numeric", month: "long", year: "numeric" });
  if (day(s.startDate) === day(s.endDate)) return formatDate(s.startDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${formatDate(s.startDate, { day: "numeric", month: "long" })} – ${day(s.endDate)}`;
}
