import { z } from "zod";
import { EVENT_CATEGORIES, TEAM_GROUPS, type FestEvent } from "./types";

// ---------- Public forms (shared by client + server) ----------

const phoneRe = /^\+?[0-9][0-9\s-]{8,16}[0-9]$/;
const trimmed = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const required = (label: string, max = 120) => trimmed(max).min(2, `${label} is required`);

export const phoneField = z
  .string()
  .trim()
  .regex(phoneRe, "Enter a valid phone number (10–15 digits, + allowed)");

export const YEARS = ["1st year (UG)", "2nd year (UG)", "3rd year (UG)", "4th year (UG)", "1st year (PG)", "2nd year (PG)", "PhD / Research", "Other"] as const;

const memberSchema = z.object({
  name: required("Member name", 80),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Invalid email")]),
  phone: z.union([z.literal(""), phoneField]),
});

type RegEvent = Pick<FestEvent, "participation" | "teamMin" | "teamMax" | "extraQuestions">;

export function registrationSchema(ev: RegEvent) {
  const isTeam = ev.participation === "team";
  const minOthers = isTeam ? Math.max(0, ev.teamMin - 1) : 0;
  const maxOthers = isTeam ? Math.max(0, ev.teamMax - 1) : 0;

  return z
    .object({
      eventId: z.string().uuid(),
      fullName: required("Full name", 80),
      institution: required("College / institution", 150),
      department: required("Department", 100),
      year: z.enum(YEARS, { message: "Select your year" }),
      email: z.string().trim().toLowerCase().email("Enter a valid email address").max(160),
      phone: phoneField,
      teamName: isTeam ? required("Team name", 60) : z.string().max(0).optional().default(""),
      teamMembers: z
        .array(memberSchema)
        .min(minOthers, `Add at least ${minOthers} other member${minOthers === 1 ? "" : "s"}`)
        .max(maxOthers, maxOthers === 0 ? "This is an individual event" : `At most ${maxOthers} other members`),
      answers: z.record(z.string(), z.string().trim().max(1000)).default({}),
      consent: z.literal(true, { message: "Please confirm your details are correct" }),
      // Honeypot — real users never see or fill this.
      website: z.string().max(0).optional().default(""),
    })
    .superRefine((v, ctx) => {
      for (const q of ev.extraQuestions) {
        const a = v.answers[q.id]?.trim() ?? "";
        if (q.required && !a) ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "This answer is required" });
        if (a && q.type === "select" && q.options?.length && !q.options.includes(a))
          ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Choose one of the options" });
      }
      const emails = [v.email, ...v.teamMembers.map((m) => m.email)].filter(Boolean);
      if (new Set(emails).size !== emails.length)
        ctx.addIssue({ code: "custom", path: ["teamMembers"], message: "Each team member needs a different email" });
    });
}
export type RegistrationInput = z.input<ReturnType<typeof registrationSchema>>;

export const ENQUIRY_CATEGORIES = ["Events", "Registration", "Schedule", "Rules & eligibility", "Technical issue", "Other"] as const;

export const enquirySchema = z.object({
  name: required("Name", 80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(160),
  phone: z.union([z.literal(""), phoneField]).default(""),
  category: z.enum(ENQUIRY_CATEGORIES, { message: "Choose a category" }),
  message: trimmed(2000).min(10, "Tell us a little more (10+ characters)"),
  website: z.string().max(0).optional().default(""),
});
export type EnquiryInput = z.input<typeof enquirySchema>;

// ---------- Admin content (server-side validation) ----------

const id = z.string().uuid();
const url = z.union([z.literal(""), z.string().trim().max(1000).refine((s) => s.startsWith("/") || /^https?:\/\//.test(s), "Must be a URL or /path")]);
const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")]);
const time = z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM")]);
const text = (max = 200) => z.string().trim().max(max);

export const contentSchemas = {
  events: z
    .object({
      id,
      slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only").max(80),
      name: text(120).min(2),
      category: z.enum(EVENT_CATEGORIES),
      shortDescription: text(240),
      description: text(4000),
      posterUrl: url,
      eventDate: date,
      startTime: time,
      endTime: time,
      venue: text(150),
      participation: z.enum(["individual", "team"]),
      teamMin: z.number().int().min(1).max(20),
      teamMax: z.number().int().min(1).max(20),
      fee: z.number().int().min(0).max(100000).nullable(),
      deadline: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid deadline"),
      rules: z.array(text(400)).max(30),
      eligibility: text(400),
      coordinatorName: text(100),
      coordinatorPhone: text(30),
      coordinatorEmail: z.union([z.literal(""), z.string().email()]),
      registrationOpen: z.boolean(),
      visible: z.boolean(),
      capacity: z.number().int().min(1).max(100000).nullable(),
      extraQuestions: z
        .array(
          z.object({
            id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
            label: text(200).min(1),
            type: z.enum(["text", "textarea", "select"]),
            options: z.array(text(100)).optional(),
            required: z.boolean().optional(),
          }),
        )
        .max(10),
      sortOrder: z.number().int(),
      isSample: z.boolean(),
    })
    .refine((e) => e.teamMax >= e.teamMin, { path: ["teamMax"], message: "Max team size must be ≥ min" }),
  team: z.object({
    id,
    name: text(100).min(1),
    role: text(120),
    group: z.enum(TEAM_GROUPS),
    section: text(80).min(1),
    bio: text(400),
    photoUrl: url,
    socialUrl: url,
    spiritAnimal: text(60),
    visible: z.boolean(),
    sortOrder: z.number().int(),
    isSample: z.boolean(),
  }),
  gallery: z.object({
    id,
    type: z.enum(["image", "video"]),
    url,
    thumbnailUrl: url,
    caption: text(300),
    category: text(80).min(1),
    takenOn: date,
    eventLabel: text(80),
    aspect: z.enum(["portrait", "landscape", "square"]),
    visible: z.boolean(),
    sortOrder: z.number().int(),
    isSample: z.boolean(),
  }),
  announcements: z.object({
    id,
    title: text(150).min(2),
    body: text(2000),
    publishedOn: date,
    pinned: z.boolean(),
    visible: z.boolean(),
    sortOrder: z.number().int(),
  }),
  schedule: z.object({
    id,
    day: z.number().int().min(1).max(10),
    time,
    endTime: time,
    title: text(150).min(2),
    venue: text(150),
    kind: z.enum(["ceremony", "event", "break", "other"]),
    eventSlug: text(80),
    visible: z.boolean(),
    sortOrder: z.number().int(),
  }),
  faqs: z.object({
    id,
    question: text(300).min(3),
    answer: text(3000),
    visible: z.boolean(),
    sortOrder: z.number().int(),
  }),
} as const;

export const settingsSchema = z.object({
  name: text(60).min(1),
  edition: text(20),
  theme: text(120),
  tagline: text(240),
  manifesto: text(400),
  startDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date"),
  endDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date"),
  datesConfirmed: z.boolean(),
  department: text(150),
  college: text(200),
  address: text(400),
  mapEmbedUrl: z.union([z.literal(""), z.string().url().startsWith("https://www.google.com/maps/embed", "Paste the Google Maps ‘Embed a map’ src URL")]),
  mapLink: url,
  email: z.union([z.literal(""), z.string().email()]),
  phone: text(30),
  whatsapp: z.string().regex(/^\d{0,15}$/, "Digits only, including country code (e.g. 9198xxxxxxxx)"),
  instagram: url,
  brochureUrl: url,
  registrationsOpen: z.boolean(),
  guidelines: z.array(text(400)).max(30),
});
