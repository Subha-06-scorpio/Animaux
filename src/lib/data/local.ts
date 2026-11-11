import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { eventsSeed } from "@/content/events";
import { announcementsSeed, faqsSeed, festivalSeed, scheduleSeed } from "@/content/festival";
import { gallerySeed } from "@/content/gallery";
import { teamSeed } from "@/content/team";
import type { CollectionName, Collections, Enquiry, FestivalSettings, Registration } from "../types";
import { DuplicateRegistrationError, matchesRegistration, normalizePhone, type Repo } from "./repo";

/**
 * Development-only JSON file store. Seeded from src/content on first use.
 * Writes are serialised through a promise chain and saved atomically.
 */
type Db = { [C in CollectionName]: Collections[C][] } & {
  settings: FestivalSettings;
  registrations: (Registration & { ipHash: string })[];
  enquiries: Enquiry[];
};

const FILE = path.join(process.env.LOCAL_DATA_DIR ?? path.join(process.cwd(), ".data"), "db.json");

const seed = (): Db => ({
  events: eventsSeed,
  team: teamSeed,
  gallery: gallerySeed,
  announcements: announcementsSeed,
  schedule: scheduleSeed,
  faqs: faqsSeed,
  sponsors: [],
  settings: festivalSeed,
  registrations: [],
  enquiries: [],
});

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Db> {
  try {
    return { ...seed(), ...(JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<Db>) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    return seed(); // file is created on the first write

  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await read();
    const out = await fn(db);
    await write(db);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export const localRepo: Repo = {
  mode: "local",
  async list(c) {
    const db = await read();
    return [...db[c]].sort(bySort) as never;
  },
  async get(c, id) {
    const db = await read();
    return ((db[c] as { id: string }[]).find((x) => x.id === id) ?? null) as never;
  },
  upsert(c, item) {
    return mutate((db) => {
      const list = db[c] as { id: string }[];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else list.push(item);
    });
  },
  remove(c, id) {
    return mutate((db) => {
      (db as Record<string, unknown>)[c] = (db[c] as { id: string }[]).filter((x) => x.id !== id);
    });
  },
  setSortOrders(c, ids) {
    return mutate((db) => {
      for (const item of db[c] as { id: string; sortOrder: number }[]) {
        const i = ids.indexOf(item.id);
        if (i >= 0) item.sortOrder = i;
      }
    });
  },
  async getSettings() {
    return { ...festivalSeed, ...(await read()).settings };
  },
  saveSettings(s) {
    return mutate((db) => {
      db.settings = s;
    });
  },
  createRegistration(r, ipHash) {
    return mutate((db) => {
      const active = db.registrations.filter((x) => x.eventId === r.eventId && x.status !== "cancelled");
      if (r.email && active.some((x) => x.email === r.email)) throw new DuplicateRegistrationError("email");
      if (active.some((x) => normalizePhone(x.phone) === normalizePhone(r.phone))) throw new DuplicateRegistrationError("phone");
      db.registrations.push({ ...r, ipHash });
    });
  },
  async listRegistrations(f = {}) {
    const db = await read();
    return db.registrations
      .filter((r) => matchesRegistration(r, f))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ ipHash, ...r }) => r)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async registrationCounts() {
    const db = await read();
    const out: Record<string, number> = {};
    for (const r of db.registrations) if (r.status !== "cancelled") out[r.eventId] = (out[r.eventId] ?? 0) + 1;
    return out;
  },
  updateRegistration(id, patch) {
    return mutate((db) => {
      const r = db.registrations.find((x) => x.id === id);
      if (r) Object.assign(r, patch);
    });
  },
  deleteRegistration(id) {
    return mutate((db) => {
      db.registrations = db.registrations.filter((x) => x.id !== id);
    });
  },
  createEnquiry(e) {
    return mutate((db) => {
      db.enquiries.push(e);
    });
  },
  async listEnquiries() {
    return [...(await read()).enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  updateEnquiry(id, status) {
    return mutate((db) => {
      const e = db.enquiries.find((x) => x.id === id);
      if (e) e.status = status;
    });
  },
  deleteEnquiry(id) {
    return mutate((db) => {
      db.enquiries = db.enquiries.filter((x) => x.id !== id);
    });
  },
};
