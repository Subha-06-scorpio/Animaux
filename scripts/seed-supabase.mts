/**
 * Loads the sample content from src/content into an EMPTY Supabase project.
 *   npm run seed            → inserts content only where tables are empty
 *   npm run seed -- --force → upserts sample rows even if tables have data
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { eventsSeed } from "../src/content/events";
import { announcementsSeed, faqsSeed, festivalSeed, scheduleSeed } from "../src/content/festival";
import { gallerySeed } from "../src/content/gallery";
import { teamSeed } from "../src/content/team";

process.loadEnvFile?.(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const force = process.argv.includes("--force");
const sb = createClient(url, key, { auth: { persistSession: false } });
const snake = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`), v]));

const sets: [string, object[]][] = [
  ["events", eventsSeed],
  ["team_members", teamSeed],
  ["gallery_items", gallerySeed],
  ["announcements", announcementsSeed],
  ["schedule_items", scheduleSeed],
  ["faqs", faqsSeed],
];

for (const [table, rows] of sets) {
  const { count, error } = await sb.from(table).select("id", { count: "exact", head: true });
  if (error) throw new Error(`${table}: ${error.message} — did you run the migration?`);
  if (count && !force) {
    console.log(`• ${table}: has ${count} rows, skipped`);
    continue;
  }
  const res = await sb.from(table).upsert(rows.map(snake));
  if (res.error) throw new Error(`${table}: ${res.error.message}`);
  console.log(`✓ ${table}: ${rows.length} sample rows`);
}

const { data: settings } = await sb.from("festival_settings").select("id").eq("id", 1).maybeSingle();
if (!settings || force) {
  await sb.from("festival_settings").upsert({ id: 1, data: festivalSeed });
  console.log("✓ festival_settings");
}
console.log("Done.");
