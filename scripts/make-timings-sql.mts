/**
 * Writes supabase/update-timings.sql: updates ONLY event times and the schedule
 * from src/content, leaving every other dashboard edit untouched.
 *   npx tsx scripts/make-timings-sql.mts
 */
import { writeFileSync } from "node:fs";
import { eventsSeed } from "../src/content/events";
import { scheduleSeed } from "../src/content/festival";

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const lines = [
  "-- ANIMAUX'26 — timing update. Changes event times + the schedule only. Safe to re-run.",
  "begin;",
  ...eventsSeed
    .filter((e) => e.startTime)
    .map((e) => `update public.events set start_time = ${q(e.startTime)}, end_time = ${q(e.endTime)}, rules = ${q(JSON.stringify(e.rules))}::jsonb where slug = ${q(e.slug)};`),
  `delete from public.schedule_items where id::text like '5c000000-%' and id not in (${scheduleSeed.map((s) => q(s.id)).join(", ")});`,
  ...scheduleSeed.map(
    (s) =>
      `insert into public.schedule_items (id, day, time, end_time, title, venue, kind, event_slug, visible, sort_order) values (${q(s.id)}, ${s.day}, ${q(s.time)}, ${q(s.endTime)}, ${q(s.title)}, ${q(s.venue)}, ${q(s.kind)}, ${q(s.eventSlug)}, ${s.visible}, ${s.sortOrder}) on conflict (id) do update set time = excluded.time, end_time = excluded.end_time, title = excluded.title, kind = excluded.kind, event_slug = excluded.event_slug, sort_order = excluded.sort_order;`,
  ),
  "commit;",
  "",
];
writeFileSync("supabase/update-timings.sql", lines.join("\n"));
console.log("wrote supabase/update-timings.sql");
