// Shared domain types. Field names here are camelCase; the Supabase adapter
// maps them to snake_case columns (see supabase/migrations).

export const EVENT_CATEGORIES = ["competition", "workshop", "quiz", "creative", "game"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  competition: "Competitions",
  workshop: "Workshops",
  quiz: "Quizzes",
  creative: "Creative",
  game: "Games",
};

export type ExtraQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "file"; // file = participant photo upload
  options?: string[];
  required?: boolean;
};

export type FestEvent = {
  id: string;
  slug: string;
  name: string;
  category: EventCategory;
  tier: "main" | "mini"; // mini events are on-the-spot: no online registration
  tagline: string;
  shortDescription: string;
  description: string;
  posterUrl: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  venue: string;
  participation: "individual" | "team";
  teamMin: number;
  teamMax: number;
  fee: number | null; // null = to be announced, 0 = free
  deadline: string; // ISO datetime
  rules: string[];
  eligibility: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  registrationOpen: boolean;
  visible: boolean;
  capacity: number | null;
  extraQuestions: ExtraQuestion[];
  sortOrder: number;
  isSample: boolean;
};

export const TEAM_GROUPS = ["faculty", "leadership", "organizing"] as const;
export type TeamGroup = (typeof TEAM_GROUPS)[number];

export const TEAM_SECTIONS: Record<TeamGroup, string[]> = {
  faculty: ["Teacher in Charge", "Faculty Mentors"],
  leadership: ["Coordinators", "Advisory"],
  organizing: ["Events", "Creatives", "Social Media and Photography", "Logistics", "Productions", "Marketing", "Public Relations", "Hospitality", "Volunteers"],
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  group: TeamGroup;
  section: string;
  bio: string;
  photoUrl: string;
  socialUrl: string;
  spiritAnimal: string;
  visible: boolean;
  sortOrder: number;
  isSample: boolean;
};

export const GALLERY_CATEGORIES = [
  "Behind the Scenes",
  "Preparations",
  "Team Meetings",
  "Posters and Artwork",
  "Event Highlights",
  "Photography",
  "Videos and Reels",
  "Memories from Previous Editions",
] as const;

export type GalleryItem = {
  id: string;
  type: "image" | "video";
  url: string; // empty = placeholder artwork
  thumbnailUrl: string;
  caption: string;
  category: string;
  takenOn: string; // YYYY-MM-DD or ""
  eventLabel: string;
  aspect: "portrait" | "landscape" | "square";
  visible: boolean;
  sortOrder: number;
  isSample: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedOn: string;
  pinned: boolean;
  visible: boolean;
  sortOrder: number;
};

export type ScheduleItem = {
  id: string;
  day: number;
  time: string;
  endTime: string;
  title: string;
  venue: string;
  kind: "ceremony" | "event" | "break" | "other";
  eventSlug: string;
  visible: boolean;
  sortOrder: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  sortOrder: number;
};

export type FestivalSettings = {
  name: string;
  edition: string;
  theme: string;
  tagline: string;
  manifesto: string;
  startDate: string; // ISO datetime, drives the countdown
  endDate: string;
  datesConfirmed: boolean;
  department: string;
  college: string;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  email: string;
  phone: string;
  contacts: string[]; // "Name | +91 phone" — shown on contact page & footer
  whatsapp: string; // digits only, with country code
  instagram: string;
  brochureUrl: string;
  registrationsOpen: boolean;
  guidelines: string[];
};

export type Collections = {
  events: FestEvent;
  team: TeamMember;
  gallery: GalleryItem;
  announcements: Announcement;
  schedule: ScheduleItem;
  faqs: Faq;
};
export type CollectionName = keyof Collections;

export type TeamMemberEntry = { name: string; email: string; phone: string };

export type Registration = {
  id: string;
  regCode: string;
  eventId: string;
  eventName: string;
  fullName: string;
  institution: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  teamName: string;
  teamMembers: TeamMemberEntry[];
  answers: Record<string, string>;
  status: "confirmed" | "attended" | "cancelled";
  emailSent: boolean;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
};

export type EventStatus =
  | { open: true; label: string }
  | { open: false; label: string; reason: "closed" | "deadline" | "full" | "paused" | "walkin" };
