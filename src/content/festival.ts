import type { Announcement, Faq, FestivalSettings, ScheduleItem } from "@/lib/types";

/**
 * SEED CONTENT — festival-wide settings.
 *
 * Everything marked "placeholder" must be replaced with real details.
 * After the database is connected, edit these from Admin → Festival settings
 * instead of this file (this file only seeds an empty database).
 */
export const festivalSeed: FestivalSettings = {
  name: "ANIMAUX",
  edition: "2026",
  theme: "Echoes of the Wild: The Survival Files",
  tagline: "Every footprint is a clue, every feather is evidence, and every species has a survival story.",
  manifesto: "The wilderness is your casebook. Follow the echoes, examine the evidence, and open The Survival Files!",
  // Confirmed: Wednesday, 2 December 2026 (one day). Event timings to be announced.
  startDate: "2026-12-02T09:00:00+05:30",
  endDate: "2026-12-02T18:00:00+05:30",
  datesConfirmed: true,
  department: "Department of Zoology",
  college: "SVKM's Mithibai College",
  address:
    "Mithibai College of Arts, Chauhan Institute of Science & Amrutben Jivanlal College of Commerce and Economics (Empowered Autonomous), Vile Parle (West), Mumbai 400056",
  mapEmbedUrl: "https://www.google.com/maps?q=Mithibai+College,+Vile+Parle+West,+Mumbai&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Mithibai+College+Vile+Parle+West+Mumbai",
  email: "animaux.zoology@gmail.com",
  phone: "+91 91372 84809",
  contacts: ["Aditya Dubey | +91 91372 84809", "Subha Nandula | +91 84540 26143"],
  whatsapp: "",
  instagram: "https://www.instagram.com/animaux.mithibai/",
  brochureUrl: "https://canva.link/nziclf8o20e187l",
  registrationsOpen: true,
  guidelines: [
    "Carry your college ID card and your ANIMAUX registration ID on 2 December.",
    "Report to your event venue at least 15 minutes before it begins.",
    "Team events are registered once, by the team leader, with every member's name.",
    "Mini events are on the spot — no online registration needed.",
    "Crime-scene props and evidence are for investigation only — look, note, and don’t touch unless told.",
    "The decision of the judges and organising committee is final.",
  ],
};

export const announcementsSeed: Announcement[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    title: "Registrations are open for all 8 main events",
    body: "Pick your case and register online in two minutes — solo or as a team. Mini events are on the spot.",
    publishedOn: "2026-10-20",
    pinned: true,
    visible: true,
    sortOrder: 0,
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    title: "Save the date: 2 December 2026 · SVKM's Mithibai College",
    body: "ANIMAUX'26 — Echoes of the Wild: The Survival Files — 8 main events and 6 mini events, hosted by the Department of Zoology. Event timings will be published here.",
    publishedOn: "2026-10-21",
    pinned: false,
    visible: true,
    sortOrder: 1,
  },
];

const s = (n: number) => `5c000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

// Timings not announced yet: slots without a time show as "TBA" and keep this order.
const slot = (n: number, title: string, kind: ScheduleItem["kind"], eventSlug = "", time = ""): ScheduleItem => ({
  id: s(n), day: 1, time, endTime: "", title, venue: "", kind, eventSlug, visible: true, sortOrder: n,
});

export const scheduleSeed: ScheduleItem[] = [
  slot(1, "Check-in at the registration desk", "other"),
  slot(2, "Opening — Echoes of the Wild: The Survival Files", "ceremony"),
  slot(3, "The Last Trace", "event", "the-last-trace"),
  slot(4, "Trace Evidence Relay", "event", "trace-evidence-relay"),
  slot(5, "Wild Shark Tank: Eco-Startup Pitch", "event", "wild-shark-tank"),
  slot(6, "The Poacher’s Tale", "event", "the-poachers-tale"),
  slot(7, "Flood Zone: Survive the Wild", "event", "flood-zone"),
  slot(8, "7 Steps", "event", "7-steps"),
  slot(9, "Shutter Safari: Photography Competition", "event", "shutter-safari"),
  slot(10, "Strokes of Wild", "event", "strokes-of-wild"),
  slot(11, "Mini events — Pictionary, Wild Aim, Wild Eye, Fingerprint Paintings, Who Am I?, Memory Game", "other"),
  slot(12, "Verdicts, prize distribution & closing", "ceremony"),
];

const f = (n: number) => `fa000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

export const faqsSeed: Faq[] = [
  { id: f(1), question: "How do I register?", answer: "Open the Events page, pick one of the 8 main events and press “Register Now”. Fill in your name, college, year and contact number (plus your team, for team events). You instantly get a unique registration ID on screen — no account needed.", visible: true, sortOrder: 0 },
  { id: f(2), question: "Can I take part in more than one event?", answer: "Yes. Register separately for each event — the form remembers your details on your phone, so the next one takes seconds. Event timings will be announced; we’ll try to avoid clashes.", visible: true, sortOrder: 1 },
  { id: f(3), question: "Can students from other colleges participate?", answer: "ANIMAUX welcomes investigators from across campuses. Check each event page for any eligibility notes, or call the coordinators to confirm.", visible: true, sortOrder: 2 },
  { id: f(4), question: "Are there registration fees?", answer: "Fees, if any, are shown on each event card. “Fee: TBA” means it hasn’t been announced yet.", visible: true, sortOrder: 3 },
  { id: f(5), question: "How do team registrations work?", answer: "The team leader registers once for the whole team: a team name, plus each member’s name. Team sizes and team limits (for example, 5 teams for The Last Trace) are shown on each event.", visible: true, sortOrder: 4 },
  { id: f(6), question: "What are mini events?", answer: "Six quick, on-the-spot games — Wildlife Pictionary, Wild Aim, Wild Eye, Fingerprint Paintings, Who Am I? and the Memory Game. Just walk in on 2 December; no online registration needed.", visible: true, sortOrder: 5 },
  { id: f(7), question: "How do I submit my photo for Shutter Safari?", answer: "Upload it in the registration form for Shutter Safari (JPG, PNG or WebP, up to 10 MB). Large photos are resized automatically before upload.", visible: true, sortOrder: 6 },
  { id: f(8), question: "Who do I contact with questions?", answer: "Call Aditya (+91 91372 84809) or Subha (+91 84540 26143), email animaux.zoology@gmail.com, or use the help desk form on the Contact page.", visible: true, sortOrder: 7 },
];
