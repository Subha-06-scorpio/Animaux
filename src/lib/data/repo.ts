import type { CollectionName, Collections, Enquiry, FestivalSettings, Registration } from "../types";

export class DuplicateRegistrationError extends Error {
  constructor(public field: "email" | "phone") {
    super(`Already registered with this ${field}`);
  }
}

export type RegistrationFilter = { eventId?: string; q?: string; status?: string };

/** Storage-agnostic data access. Implemented by the Supabase and local adapters. */
export interface Repo {
  mode: "supabase" | "local";
  list<C extends CollectionName>(c: C): Promise<Collections[C][]>;
  get<C extends CollectionName>(c: C, id: string): Promise<Collections[C] | null>;
  upsert<C extends CollectionName>(c: C, item: Collections[C]): Promise<void>;
  remove(c: CollectionName, id: string): Promise<void>;
  setSortOrders(c: CollectionName, ids: string[]): Promise<void>;

  getSettings(): Promise<FestivalSettings>;
  saveSettings(s: FestivalSettings): Promise<void>;

  /** Throws DuplicateRegistrationError if an active registration exists for this event + email/phone. */
  createRegistration(r: Registration, ipHash: string): Promise<void>;
  listRegistrations(f?: RegistrationFilter): Promise<Registration[]>;
  registrationCounts(): Promise<Record<string, number>>;
  updateRegistration(id: string, patch: Partial<Pick<Registration, "status" | "emailSent">>): Promise<void>;
  deleteRegistration(id: string): Promise<void>;

  createEnquiry(e: Enquiry): Promise<void>;
  listEnquiries(): Promise<Enquiry[]>;
  updateEnquiry(id: string, status: Enquiry["status"]): Promise<void>;
  deleteEnquiry(id: string): Promise<void>;
}

export function matchesRegistration(r: Registration, f: RegistrationFilter) {
  if (f.eventId && r.eventId !== f.eventId) return false;
  if (f.status && r.status !== f.status) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [r.regCode, r.fullName, r.email, r.phone, r.institution, r.teamName, ...r.teamMembers.map((m) => m.name)]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export const normalizePhone = (p: string) => p.replace(/[^\d]/g, "").slice(-10);
