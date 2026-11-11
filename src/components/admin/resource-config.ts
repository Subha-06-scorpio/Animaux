import type { Field } from "./fields";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  GALLERY_CATEGORIES,
  TEAM_GROUPS,
  TEAM_SECTIONS,
  type CollectionName,
  type Collections,
} from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

/**
 * Describes how each content collection is listed and edited in the dashboard.
 * Adding a field here (and to lib/types + lib/schemas + the SQL table) is all
 * it takes to make it editable.
 */
export type ResourceConfig<C extends CollectionName> = {
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  blank: (sortOrder: number) => Collections[C];
  label: (i: Collections[C]) => string;
  meta: (i: Collections[C]) => string;
  thumb?: (i: Collections[C]) => string | undefined;
  filter?: { field: keyof Collections[C] & string; label: string; options: { value: string; label: string }[] };
  publicHref?: (i: Collections[C]) => string;
};

const uuid = () => crypto.randomUUID();
const inAWeek = () => new Date(Date.now() + 7 * 86400000).toISOString();

export const CONFIG: { [C in CollectionName]: ResourceConfig<C> } = {
  events: {
    title: "Events",
    singular: "event",
    description: "Add, edit, hide or close events. Changes go live immediately.",
    label: (e) => e.name,
    meta: (e) => `${e.tier === "mini" ? "MINI · " : ""}${CATEGORY_LABELS[e.category]} · ${formatDate(e.eventDate)} ${formatTime(e.startTime)} · ${e.participation === "team" ? `team ${e.teamMin}–${e.teamMax}` : "individual"} · ${e.registrationOpen ? "registration open" : "registration CLOSED"}${e.isSample ? " · SAMPLE" : ""}`,
    thumb: (e) => e.posterUrl || undefined,
    publicHref: (e) => `/events/${e.slug}`,
    filter: { field: "category", label: "Category", options: EVENT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })) },
    blank: (sortOrder) => ({
      id: uuid(), slug: "", name: "", category: "competition", tier: "main", tagline: "", prize: "", shortDescription: "", description: "", posterUrl: "",
      eventDate: "", startTime: "", endTime: "", venue: "", participation: "individual", teamMin: 1, teamMax: 1, fee: null,
      deadline: inAWeek(), rules: [], eligibility: "", coordinatorName: "", coordinatorPhone: "", coordinatorEmail: "",
      registrationOpen: true, visible: false, capacity: null, extraQuestions: [], sortOrder, isSample: false,
    }),
    fields: [
      { name: "name", label: "Event name", type: "text", span: 2 },
      { name: "slug", label: "URL slug", type: "text", help: "Used in the link: /events/your-slug (lowercase, dashes)." },
      { name: "category", label: "Category", type: "select", options: EVENT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })) },
      { name: "tier", label: "Event type", type: "select", options: [{ value: "main", label: "Main event (online registration)" }, { value: "mini", label: "Mini event (on the spot, no registration)" }] },
      { name: "tagline", label: "Tagline (optional)", type: "text" },
      { name: "prize", label: "Prize badge (optional)", type: "text", placeholder: "Winners get goodies", help: "Shown as a 🏆 badge on the event card and page." },
      { name: "shortDescription", label: "Short description (card)", type: "textarea", span: 2 },
      { name: "description", label: "Full description", type: "textarea", span: 2 },
      { name: "posterUrl", label: "Poster / image", type: "media", accept: "image/*", folder: "posters", span: 2 },
      { name: "eventDate", label: "Event date", type: "date" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "startTime", label: "Start time", type: "time" },
      { name: "endTime", label: "End time", type: "time" },
      { name: "participation", label: "Participation", type: "select", options: [{ value: "individual", label: "Individual" }, { value: "team", label: "Team" }] },
      { name: "fee", label: "Registration fee (₹)", type: "number", nullable: true, nullLabel: "TBA", help: "0 = free." },
      { name: "teamMin", label: "Min team size (incl. leader)", type: "number" },
      { name: "teamMax", label: "Max team size (incl. leader)", type: "number" },
      { name: "deadline", label: "Registration deadline", type: "datetime" },
      { name: "capacity", label: "Capacity (registrations)", type: "number", nullable: true, nullLabel: "Unlimited" },
      { name: "registrationOpen", label: "Registration open", type: "boolean", help: "Untick to close registration now." },
      { name: "visible", label: "Visible on website", type: "boolean" },
      { name: "rules", label: "Rules", type: "lines", span: 2 },
      { name: "eligibility", label: "Eligibility", type: "textarea", span: 2 },
      { name: "coordinatorName", label: "Coordinator name", type: "text" },
      { name: "coordinatorPhone", label: "Coordinator phone", type: "text", placeholder: "+91 98xxxxxxxx" },
      { name: "coordinatorEmail", label: "Coordinator email", type: "email", span: 2 },
      { name: "extraQuestions", label: "Extra registration questions", type: "questions", span: 2 },
      { name: "isSample", label: "Mark as sample (shows a ‘Sample’ badge)", type: "boolean", span: 2 },
    ],
  },
  team: {
    title: "Team",
    singular: "member",
    description: "Profiles on the Meet the Team page. Use the arrows to reorder within the list.",
    label: (m) => m.name,
    meta: (m) => `${m.section} · ${m.role}${m.isSample ? " · PLACEHOLDER" : ""}`,
    thumb: (m) => m.photoUrl || undefined,
    filter: { field: "group", label: "Group", options: TEAM_GROUPS.map((g) => ({ value: g, label: { faculty: "Faculty & Mentors", leadership: "Student Leadership", organizing: "Organising Teams" }[g] })) },
    blank: (sortOrder) => ({ id: uuid(), name: "", role: "", group: "organizing", section: "Volunteers", bio: "", photoUrl: "", socialUrl: "", spiritAnimal: "", visible: true, sortOrder, isSample: false }),
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role / designation", type: "text" },
      { name: "group", label: "Group", type: "select", options: [{ value: "faculty", label: "Faculty & Mentors" }, { value: "leadership", label: "Student Leadership" }, { value: "organizing", label: "Organising Teams" }] },
      { name: "section", label: "Section", type: "text", suggestions: Object.values(TEAM_SECTIONS).flat(), help: "Pick from the list or type a new section." },
      { name: "photoUrl", label: "Photo", type: "media", accept: "image/*", folder: "team", span: 2 },
      { name: "bio", label: "Short introduction (optional)", type: "textarea", span: 2 },
      { name: "spiritAnimal", label: "Spirit animal (optional, shown on hover)", type: "text" },
      { name: "socialUrl", label: "Social link (optional)", type: "url" },
      { name: "visible", label: "Visible on website", type: "boolean" },
      { name: "isSample", label: "Placeholder entry", type: "boolean" },
    ],
  },
  gallery: {
    title: "Gallery",
    singular: "item",
    description: "Upload photos and videos, or paste YouTube links. Images are resized automatically before upload.",
    label: (g) => g.caption || "(no caption)",
    meta: (g) => `${g.type} · ${g.category}${g.url ? "" : " · no media yet"}`,
    thumb: (g) => g.thumbnailUrl || (g.type === "image" ? g.url : undefined) || undefined,
    filter: { field: "category", label: "Category", options: GALLERY_CATEGORIES.map((c) => ({ value: c, label: c })) },
    blank: (sortOrder) => ({ id: uuid(), type: "image", url: "", thumbnailUrl: "", caption: "", category: "Behind the Scenes", takenOn: "", eventLabel: "", aspect: "landscape", visible: true, sortOrder, isSample: false }),
    fields: [
      { name: "type", label: "Type", type: "select", options: [{ value: "image", label: "Photo" }, { value: "video", label: "Video / reel" }] },
      { name: "category", label: "Category", type: "select", options: [...GALLERY_CATEGORIES] },
      { name: "url", label: "Photo or video", type: "media", accept: "image/*,video/mp4,video/webm,video/quicktime", folder: "gallery", span: 2, help: "Upload a file, or paste a YouTube / Instagram link for videos." },
      { name: "thumbnailUrl", label: "Video thumbnail (optional)", type: "media", accept: "image/*", folder: "gallery", span: 2 },
      { name: "caption", label: "Caption", type: "text", span: 2 },
      { name: "eventLabel", label: "Event label (optional)", type: "text" },
      { name: "takenOn", label: "Date (optional)", type: "date" },
      { name: "aspect", label: "Shape", type: "select", options: [{ value: "landscape", label: "Landscape" }, { value: "portrait", label: "Portrait" }, { value: "square", label: "Square" }] },
      { name: "visible", label: "Visible on website", type: "boolean" },
      { name: "isSample", label: "Placeholder entry", type: "boolean" },
    ],
  },
  schedule: {
    title: "Schedule",
    singular: "slot",
    description: "The timeline on the Schedule page. Slots are sorted by day and time automatically.",
    label: (s) => s.title,
    meta: (s) => `Day ${s.day} · ${formatTime(s.time)}${s.endTime ? `–${formatTime(s.endTime)}` : ""} · ${s.venue}`,
    blank: (sortOrder) => ({ id: uuid(), day: 1, time: "10:00", endTime: "", title: "", venue: "", kind: "event", eventSlug: "", visible: true, sortOrder }),
    fields: [
      { name: "title", label: "Title", type: "text", span: 2 },
      { name: "day", label: "Day", type: "select", numeric: true, options: [1, 2, 3, 4].map((d) => ({ value: d, label: `Day ${d}` })) },
      { name: "kind", label: "Type", type: "select", options: ["ceremony", "event", "break", "other"] },
      { name: "time", label: "Start", type: "time" },
      { name: "endTime", label: "End", type: "time" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "eventSlug", label: "Linked event slug (optional)", type: "text", help: "Adds a link to that event's page." },
      { name: "visible", label: "Visible on website", type: "boolean" },
    ],
  },
  announcements: {
    title: "Announcements",
    singular: "announcement",
    description: "Shown in the homepage ticker, homepage and schedule page. Pinned items appear first.",
    label: (a) => a.title,
    meta: (a) => `${formatDate(a.publishedOn)}${a.pinned ? " · pinned" : ""}`,
    blank: (sortOrder) => ({ id: uuid(), title: "", body: "", publishedOn: new Date().toISOString().slice(0, 10), pinned: false, visible: true, sortOrder }),
    fields: [
      { name: "title", label: "Title", type: "text", span: 2 },
      { name: "body", label: "Message", type: "textarea", span: 2 },
      { name: "publishedOn", label: "Date", type: "date" },
      { name: "pinned", label: "Pinned", type: "boolean" },
      { name: "visible", label: "Visible on website", type: "boolean" },
    ],
  },
  sponsors: {
    title: "Sponsors",
    singular: "sponsor",
    description: "Logos in the Sponsors section on the homepage and footer. Upload a logo (PNG with a transparent background looks best).",
    label: (s) => s.name,
    meta: (s) => [s.tier, s.website].filter(Boolean).join(" · "),
    thumb: (s) => s.logoUrl || undefined,
    blank: (sortOrder) => ({ id: uuid(), name: "", tier: "Partner", logoUrl: "", website: "", visible: true, sortOrder }),
    fields: [
      { name: "name", label: "Sponsor name", type: "text" },
      { name: "tier", label: "Type", type: "text", suggestions: ["Title sponsor", "Co-sponsor", "Partner", "Food partner", "Media partner", "Gifting partner"] },
      { name: "logoUrl", label: "Logo", type: "media", accept: "image/*", folder: "sponsors", span: 2 },
      { name: "website", label: "Website or Instagram link (optional)", type: "url", span: 2 },
      { name: "visible", label: "Visible on website", type: "boolean" },
    ],
  },
  faqs: {
    title: "FAQs",
    singular: "question",
    description: "The FAQ accordion on the Contact page.",
    label: (f) => f.question,
    meta: (f) => f.answer.slice(0, 90),
    blank: (sortOrder) => ({ id: uuid(), question: "", answer: "", visible: true, sortOrder }),
    fields: [
      { name: "question", label: "Question", type: "text", span: 2 },
      { name: "answer", label: "Answer", type: "textarea", span: 2 },
      { name: "visible", label: "Visible on website", type: "boolean" },
    ],
  },
};
