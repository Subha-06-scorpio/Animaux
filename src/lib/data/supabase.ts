import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { festivalSeed } from "@/content/festival";
import { env } from "../config";
import type { CollectionName, Enquiry, FestivalSettings, Registration } from "../types";
import { DuplicateRegistrationError, type Repo } from "./repo";

/**
 * Supabase adapter. Uses the service-role key and therefore runs on the server
 * only; every caller is responsible for authorisation (see lib/auth.ts).
 * Row Level Security is enabled on every table (see migrations), so the
 * public anon key alone can only read published content.
 */
export const TABLES: Record<CollectionName, string> = {
  events: "events",
  team: "team_members",
  gallery: "gallery_items",
  announcements: "announcements",
  schedule: "schedule_items",
  faqs: "faqs",
};

let client: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  client ??= createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const snake = (k: string) => k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const mapKeys = (o: Record<string, unknown>, fn: (k: string) => string) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [fn(k), v]));
export const toRow = (o: object) => mapKeys(o as Record<string, unknown>, snake);
const fromRow = <T>(o: Record<string, unknown>) => mapKeys(o, camel) as T;

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) throw new Error(`Database error: ${res.error.message}`);
  return res.data;
}

const REG_COLUMNS =
  "id, reg_code, event_id, event_name, full_name, institution, department, year, email, phone, team_name, team_members, answers, status, email_sent, created_at";

export const supabaseRepo: Repo = {
  mode: "supabase",
  async list(c) {
    const rows = check(await admin().from(TABLES[c]).select("*").order("sort_order"));
    return (rows ?? []).map((r) => fromRow(r)) as never;
  },
  async get(c, id) {
    const row = check(await admin().from(TABLES[c]).select("*").eq("id", id).maybeSingle());
    return (row ? fromRow(row) : null) as never;
  },
  async upsert(c, item) {
    check(await admin().from(TABLES[c]).upsert(toRow(item)));
  },
  async remove(c, id) {
    check(await admin().from(TABLES[c]).delete().eq("id", id));
  },
  async setSortOrders(c, ids) {
    await Promise.all(ids.map((id, i) => admin().from(TABLES[c]).update({ sort_order: i }).eq("id", id).then(check)));
  },

  async getSettings() {
    const row = check(await admin().from("festival_settings").select("data").eq("id", 1).maybeSingle());
    return { ...festivalSeed, ...((row?.data as Partial<FestivalSettings>) ?? {}) };
  },
  async saveSettings(s) {
    check(await admin().from("festival_settings").upsert({ id: 1, data: s }));
  },

  async createRegistration(r, ipHash) {
    const res = await admin().from("registrations").insert({ ...toRow(r), ip_hash: ipHash });
    if (res.error?.code === "23505") {
      throw new DuplicateRegistrationError(res.error.message.includes("phone") ? "phone" : "email");
    }
    check(res);
  },
  async listRegistrations(f = {}) {
    let q = admin().from("registrations").select(REG_COLUMNS).order("created_at", { ascending: false }).limit(5000);
    if (f.eventId) q = q.eq("event_id", f.eventId);
    if (f.status) q = q.eq("status", f.status);
    if (f.q) {
      const s = f.q.replace(/[^\p{L}\p{N}@.+\- ]/gu, "").trim();
      if (s) q = q.or(["reg_code", "full_name", "email", "phone", "institution", "team_name"].map((c) => `${c}.ilike.%${s}%`).join(","));
    }
    return (check(await q) ?? []).map((r) => fromRow<Registration>(r));
  },
  async registrationCounts() {
    const rows = check(await admin().from("registrations").select("event_id").neq("status", "cancelled").limit(20000));
    const out: Record<string, number> = {};
    for (const r of rows ?? []) out[r.event_id as string] = (out[r.event_id as string] ?? 0) + 1;
    return out;
  },
  async updateRegistration(id, patch) {
    check(await admin().from("registrations").update(toRow(patch)).eq("id", id));
  },
  async deleteRegistration(id) {
    check(await admin().from("registrations").delete().eq("id", id));
  },

  async createEnquiry(e) {
    check(await admin().from("enquiries").insert(toRow(e)));
  },
  async listEnquiries() {
    const rows = check(await admin().from("enquiries").select("*").order("created_at", { ascending: false }).limit(2000));
    return (rows ?? []).map((r) => fromRow<Enquiry>(r));
  },
  async updateEnquiry(id, status) {
    check(await admin().from("enquiries").update({ status }).eq("id", id));
  },
  async deleteEnquiry(id) {
    check(await admin().from("enquiries").delete().eq("id", id));
  },
};
