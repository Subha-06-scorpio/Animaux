import type { FestEvent } from "@/lib/types";

/** Flyer numbering: main events are numbered 1…n in display order. */
export function mainEventNumbers(events: Pick<FestEvent, "id" | "tier">[]) {
  return Object.fromEntries(events.filter((e) => e.tier === "main").map((e, i) => [e.id, i + 1])) as Record<string, number>;
}
