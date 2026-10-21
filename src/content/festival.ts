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
  theme: "Echoes of the Wild",
  tagline: "Every footprint tells a story. Every species deserves a future.",
  manifesto:
    "Where the wilderness speaks, science investigates, and every species has a story.",
  // Confirmed: Wednesday, 2 December 2026 (one day). Timings are provisional.
  startDate: "2026-12-02T09:00:00+05:30",
  endDate: "2026-12-02T18:00:00+05:30",
  datesConfirmed: true,
  department: "Department of Zoology",
  college: "SVKM's Mithibai College",
  address: "Vile Parle (West), Mumbai 400056 — confirm full address",
  mapEmbedUrl: "https://www.google.com/maps?q=Mithibai+College,+Vile+Parle+West,+Mumbai&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Mithibai+College+Vile+Parle+West+Mumbai",
  email: "animaux@example.com",
  phone: "+91 00000 00000",
  whatsapp: "",
  instagram: "",
  brochureUrl: "",
  registrationsOpen: true,
  guidelines: [
    "Carry your college ID card and your ANIMAUX registration ID.",
    "Report to the event venue at least 15 minutes before your event begins.",
    "Teams must be registered by the team leader; one registration per team.",
    "Live animals and animal products are not permitted on campus as exhibits.",
    "Crime-scene props and evidence at forensic events are for investigation only — look, note, don’t touch unless told.",
    "The decision of the judges and organizing committee is final.",
    "[Add or edit guidelines from Admin → Festival settings]",
  ],
};

export const announcementsSeed: Announcement[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    title: "Registrations are open",
    body: "Pick your events and register online — individual and team registrations are both supported. Replace this text from Admin → Announcements.",
    publishedOn: "2026-10-20",
    pinned: true,
    visible: true,
    sortOrder: 0,
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    title: "Save the date: 2 December 2026 · SVKM's Mithibai College",
    body: "ANIMAUX 2026 — Echoes of the Wild — is a one-day festival hosted by the Department of Zoology. Event timings and the brochure will be published here.",
    publishedOn: "2026-10-21",
    pinned: false,
    visible: true,
    sortOrder: 1,
  },
];

const s = (n: number) => `5c000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

export const scheduleSeed: ScheduleItem[] = [
  { id: s(1), day: 1, time: "09:00", endTime: "09:45", title: "Check-in at the registration desk", venue: "Main foyer (placeholder)", kind: "other", eventSlug: "", visible: true, sortOrder: 0 },
  { id: s(2), day: 1, time: "10:00", endTime: "10:45", title: "Opening ceremony — Echoes of the Wild", venue: "Auditorium (placeholder)", kind: "ceremony", eventSlug: "", visible: true, sortOrder: 1 },
  { id: s(3), day: 1, time: "11:00", endTime: "13:00", title: "Forensic Case Challenge (sample)", venue: "Zoology Lab 1 (placeholder)", kind: "event", eventSlug: "forensic-case-challenge", visible: true, sortOrder: 2 },
  { id: s(4), day: 1, time: "11:00", endTime: "13:00", title: "Scientific Poster Presentation (sample)", venue: "Exhibition Corridor (placeholder)", kind: "event", eventSlug: "poster-presentation", visible: true, sortOrder: 3 },
  { id: s(5), day: 1, time: "13:00", endTime: "14:00", title: "Lunch break", venue: "Canteen", kind: "break", eventSlug: "", visible: true, sortOrder: 4 },
  { id: s(6), day: 1, time: "14:00", endTime: "15:30", title: "Wildlife Quiz (sample)", venue: "Seminar Hall (placeholder)", kind: "event", eventSlug: "wildlife-quiz", visible: true, sortOrder: 5 },
  { id: s(7), day: 1, time: "14:00", endTime: "16:00", title: "Biodiversity Trail Hunt (sample)", venue: "Campus grounds (placeholder)", kind: "event", eventSlug: "biodiversity-trail-hunt", visible: true, sortOrder: 6 },
  { id: s(8), day: 1, time: "14:00", endTime: "16:00", title: "Wild Canvas — Sketch & Paint (sample)", venue: "Studio Room (placeholder)", kind: "event", eventSlug: "wild-canvas", visible: true, sortOrder: 7 },
  { id: s(9), day: 1, time: "16:30", endTime: "17:30", title: "Verdicts, prize distribution & closing ceremony", venue: "Auditorium (placeholder)", kind: "ceremony", eventSlug: "", visible: true, sortOrder: 8 },
];

const f = (n: number) => `fa000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

export const faqsSeed: Faq[] = [
  { id: f(1), question: "How do I register?", answer: "Open the Events page, choose an event and press “Register Now”. Fill in the short form and you will instantly receive a unique registration ID on screen (and by email, once email is enabled). No account is needed.", visible: true, sortOrder: 0 },
  { id: f(2), question: "Can I participate in multiple events?", answer: "Yes. Register separately for each event — the form remembers your details on your device so the next registration takes seconds. Please check the schedule to avoid clashing timings.", visible: true, sortOrder: 1 },
  { id: f(3), question: "Can students from other colleges participate?", answer: "Eligibility is listed on every event card. [Placeholder — confirm the inter-college policy with the organizing committee.]", visible: true, sortOrder: 2 },
  { id: f(4), question: "Are there registration fees?", answer: "Fees, if any, are shown on each event card. Events marked “Fee: TBA” are still being finalised. [Placeholder — add payment instructions here once confirmed.]", visible: true, sortOrder: 3 },
  { id: f(5), question: "How do team registrations work?", answer: "The team leader registers once for the whole team, enters a team name and the details of every member. Team size limits are shown on the event card. Each person should appear in only one team per event.", visible: true, sortOrder: 4 },
  { id: f(6), question: "How do I contact an event coordinator?", answer: "Every event card lists its coordinator. You can also use the Help Desk form on the Contact page — choose the event as your enquiry category and we will route it.", visible: true, sortOrder: 5 },
];
