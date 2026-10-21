import "server-only";
import { repo } from "./data";
import type { EventStatus, FestEvent } from "./types";
import { eventStatus } from "./utils";

/** Public read helpers. Hidden items never leave the server. */

export type PublicEvent = FestEvent & { status: EventStatus };

export async function getSettings() {
  return repo().getSettings();
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const r = repo();
  const [events, settings, counts] = await Promise.all([r.list("events"), r.getSettings(), r.registrationCounts()]);
  return events
    .filter((e) => e.visible)
    .map((e) => ({ ...e, status: eventStatus(e, settings, counts[e.id] ?? 0) }));
}

export async function getPublicEvent(slug: string) {
  return (await getPublicEvents()).find((e) => e.slug === slug) ?? null;
}

export async function getVisible<C extends "team" | "gallery" | "announcements" | "schedule" | "faqs">(c: C) {
  const items = await repo().list(c);
  return items.filter((i) => i.visible);
}
