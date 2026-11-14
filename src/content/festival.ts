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
  contacts: [
    "Aditya Dubey | +91 91372 84809",
    "Subha Nandula | +91 84540 26143",
    "Niharika Kambli (Events) | +91 99208 24982",
    "Mrugank Karandikar (Marketing) | +91 77386 56645",
  ],
  sponsorContact: "Mrugank Karandikar | +91 77386 56645",
  // "Name | Department" — from the organisers' volunteer list; edit in Admin → Festival settings
  volunteers: [
    "Shifa Khan | Creatives",
    "Pratham Matal | Productions",
    "Aaryan Chitnis | Events",
    "Sara Salahuddin | Social Media and Photography",
    "Sehrish Khan | Creatives",
    "Adiba Ansari | Creatives",
    "Khushi | Public Relations",
    "Kiran Dubey | Social Media and Photography",
    "Sriyarani Malla | Social Media and Photography",
    "Shweta Nayak | Events",
    "Mahashweta Rane | Events",
    "Moksh Patel | Events",
    "Riddhima Mishra | Events",
    "Fazil Siddiqui | Productions",
    "Gurleen Saini | Creatives",
    "Tanisha Chotai | Creatives",
    "Swati Jha | Logistics",
    "Heer Pandya | Creatives",
    "Zohra | Hospitality",
  ],
  volunteersPhotoUrl: "",
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
    "Winners of competition events take home goodies — the decision of the judges and organising committee is final.",
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
    body: "ANIMAUX'26 — Echoes of the Wild: The Survival Files — 8 main events and 6 mini events, hosted by the Department of Zoology. The full event schedule is now on the Schedule page.",
    publishedOn: "2026-10-21",
    pinned: false,
    visible: true,
    sortOrder: 1,
  },
];

const s = (n: number) => `5c000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

// Official timings (2 December 2026). Add venues/rooms from Admin → Schedule.
const slot = (n: number, time: string, endTime: string, title: string, eventSlug = "", kind: ScheduleItem["kind"] = "event"): ScheduleItem => ({
  id: s(n), day: 1, time, endTime, title, venue: "", kind, eventSlug, visible: true, sortOrder: n,
});

export const scheduleSeed: ScheduleItem[] = [
  slot(1, "09:00", "10:30", "Inauguration — Echoes of the Wild: The Survival Files", "", "ceremony"),
  slot(2, "10:30", "", "7 Steps", "7-steps"),
  slot(3, "10:30", "", "Strokes of Wild — coaster making", "strokes-of-wild"),
  slot(4, "11:00", "", "Flood Zone: Survive the Wild", "flood-zone"),
  slot(5, "11:30", "", "The Last Trace — Round 1", "the-last-trace"),
  slot(6, "12:30", "13:00", "Break", "", "break"),
  slot(7, "13:00", "", "Wild Shark Tank: Eco-Startup Pitch", "wild-shark-tank"),
  slot(8, "13:00", "", "The Poacher’s Tale", "the-poachers-tale"),
  slot(9, "13:30", "", "Trace Evidence Relay", "trace-evidence-relay"),
  slot(10, "14:15", "", "The Last Trace — Round 2", "the-last-trace"),
  slot(11, "16:00", "", "Closing ceremony & prize distribution", "", "ceremony"),
];

const f = (n: number) => `fa000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

export const faqsSeed: Faq[] = [
  { id: f(1), question: "How do I register?", answer: "Open the Events page, pick one of the 8 main events and press “Register Now”. Fill in your name, college, year and contact number (plus your team, for team events). You instantly get a unique registration ID on screen — no account needed.", visible: true, sortOrder: 0 },
  { id: f(2), question: "Can I take part in more than one event?", answer: "Yes. Register separately for each event — the form remembers your details on your phone, so the next one takes seconds. Event timings will be announced; we’ll try to avoid clashes.", visible: true, sortOrder: 1 },
  { id: f(3), question: "Can students from other colleges participate?", answer: "ANIMAUX welcomes investigators from across campuses. Check each event page for any eligibility notes, or call the coordinators to confirm.", visible: true, sortOrder: 2 },
  { id: f(4), question: "Is there a registration fee?", answer: "No — every ANIMAUX’26 event is free to enter. Just register for the main events online; mini events are walk-in.", visible: true, sortOrder: 3 },
  { id: f(5), question: "How do team registrations work?", answer: "The team leader registers once for the whole team: a team name, plus each member’s name. Team sizes and team limits (for example, 5 teams for The Last Trace) are shown on each event.", visible: true, sortOrder: 4 },
  { id: f(6), question: "What are mini events?", answer: "Six quick, on-the-spot games — Wildlife Pictionary, Wild Aim, Wild Eye, Fingerprint Paintings, Who Am I? and the Memory Game. Just walk in on 2 December; no online registration needed.", visible: true, sortOrder: 5 },
  { id: f(7), question: "How do I submit my photo for Shutter Safari?", answer: "Upload it in the registration form for Shutter Safari (JPG, PNG or WebP, up to 10 MB). Large photos are resized automatically before upload.", visible: true, sortOrder: 6 },
  { id: f(8), question: "Who do I contact with questions?", answer: "For event questions call Niharika (+91 99208 24982); for anything else call Aditya (+91 91372 84809) or Subha (+91 84540 26143), email animaux.zoology@gmail.com, or use the help desk form on the Contact page. Sponsors: Mrugank (+91 77386 56645).", visible: true, sortOrder: 7 },
];
