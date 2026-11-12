import "server-only";
import { eventsSeed } from "@/content/events";
import { teamSeed } from "@/content/team";
import { repo } from "./data";
import type { EventStatus, FestEvent } from "./types";
import { eventStatus } from "./utils";

/** Public read helpers. Hidden items never leave the server. */

/**
 * Built-in artwork and team portraits ship with the site (public/events, public/team).
 * If a database row has no image yet (e.g. seed.sql not re-run), fall back to them.
 */
const EVENT_ART = new Map(eventsSeed.map((e) => [e.slug, e.posterUrl]));
const TEAM_PHOTO = new Map(teamSeed.filter((m) => m.photoUrl).map((m) => [m.name.toLowerCase(), m.photoUrl]));

export type PublicEvent = FestEvent & { status: EventStatus };

export async function getSettings() {
  return repo().getSettings();
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const r = repo();
  const [events, settings, counts] = await Promise.all([r.list("events"), r.getSettings(), r.registrationCounts()]);
  return events
    .filter((e) => e.visible)
    .map((e) => ({ ...e, posterUrl: e.posterUrl || EVENT_ART.get(e.slug) || "", status: eventStatus(e, settings, counts[e.id] ?? 0) }));
}

export async function getPublicEvent(slug: string) {
  return (await getPublicEvents()).find((e) => e.slug === slug) ?? null;
}

export async function getVisible<C extends "team" | "gallery" | "announcements" | "schedule" | "faqs" | "sponsors">(c: C) {
  const items = (await repo().list(c)).filter((i) => i.visible);
  if (c === "team") {
    return items.map((m) => {
      const t = m as unknown as { name: string; photoUrl: string };
      return { ...m, photoUrl: t.photoUrl || TEAM_PHOTO.get(t.name.toLowerCase()) || "" };
    }) as typeof items;
  }
  return items;
}

/** Sponsors are optional: if the sponsors table isn't migrated yet, show none rather than failing the page. */
export async function getSponsors() {
  try {
    return await getVisible("sponsors");
  } catch (e) {
    console.error("Sponsors unavailable (run supabase/migrations/20261112000000_prizes_sponsors.sql)", e);
    return [];
  }
}
