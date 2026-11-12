import type { TeamGroup, TeamMember } from "@/lib/types";

/**
 * SEED CONTENT — ANIMAUX 2026 core committee, from the organisers' theme doc
 * ("The minds behind the mystery"). Photos can be replaced from Admin → Team.
 */
type Row = [name: string, role: string, group: TeamGroup, section: string, bio: string];

const ROWS: Row[] = [
  ["Dr. Shouriehebal Soni", "Teacher in Charge", "faculty", "Teacher in Charge", "Guides the investigation and keeps the science sharp."],
  ["Aditya Dubey", "Coordinator", "leadership", "Coordinators", "Oversees the investigation, connecting every department’s clues to bring the complete case together."],
  ["Subha Nandula", "Coordinator", "leadership", "Coordinators", "Keeps the mission on track, turning scattered leads into one coordinated operation."],
  ["Veer Bhardwaj", "Advisory", "leadership", "Advisory", "Offers the expert perspective, helping the team navigate tricky clues and crucial decisions."],
  ["Niharika Kambli", "Head · Events", "organizing", "Events", "Designs mysteries worth solving, turning the fest’s theme into challenges that test every investigator."],
  ["Tisya Soneta", "Sub-Head · Events", "organizing", "Events", "Takes each case from briefing to final reveal, keeping the action organised and the suspense alive."],
  ["Tanvi Vichare", "Head · Creatives", "organizing", "Creatives", "Crafts the scene of intrigue, turning handmade details into a world waiting to be investigated."],
  ["Manasi Baranwal", "Sub-Head · Creatives", "organizing", "Creatives", "Brings the case files to life through imaginative props, décor and a sharp eye for detail."],
  ["Sana Shaikh", "Head · Social Media and Photography", "organizing", "Social Media and Photography", "Broadcasts the latest case updates, drawing curious minds into the Animaux investigation."],
  ["Yunus Sayyed", "Sub-Head · Social Media and Photography", "organizing", "Social Media and Photography", "Captures the evidence, preserving every discovery and celebration in the visual casebook."],
  ["Tia Crasto", "Head · Logistics", "organizing", "Logistics", "Guards the official case files, keeping registrations, records and documentation in precise order."],
  ["Malav Mistry", "Head · Productions", "organizing", "Productions", "Sources the tools of the investigation, ensuring every build and event has the materials it needs."],
  ["Mrugank Karandikar", "Head · Marketing", "organizing", "Marketing", "Follows promising leads to secure the funds and partnerships that power the investigation."],
  ["Anisha Sagare", "Sub-Head · Marketing", "organizing", "Marketing", "Builds the network of sponsors and stalls, bringing vital backing to the Animaux operation."],
  ["Mihika Mishra", "Head · Public Relations", "organizing", "Public Relations", "Takes the case across campuses, turning college visits and conversations into invitations to investigate."],
  ["Prachi Gupta", "Head · Hospitality", "organizing", "Hospitality", "Makes investigation headquarters a welcoming space, keeping guests, teachers and participants well cared for."],
  ["Raj Jatrara", "Sub-Head · Hospitality", "organizing", "Hospitality", "Keeps investigation headquarters running smoothly, so every guest and participant feels at home."],
];

/** Two-line department mottos from the theme doc, shown on the Team page. */
export const DEPARTMENT_MOTTOS: Record<string, string> = {
  Logistics: "Every registration logged, every case file in place. We keep the records straight, so you can crack the case!",
  Events: "Wild challenges, puzzling clues, and mysteries to unravel. We turn every competition into a case worth cracking!",
  "Social Media and Photography": "We leak the teasers and capture the evidence. Every wild moment goes on record — no memories left missing!",
  Marketing: "We follow the money trail and bring the sponsors on board. From funds to stalls, we give this wild investigation its backing!",
  "Public Relations": "Taking the case across classrooms, corridors, and colleges. We spread the word and recruit curious minds for the investigation!",
  Hospitality: "Our suspects? Empty plates and unattended guests. We keep everyone cared for — no interrogation required!",
  Productions: "Every investigation needs a toolkit — we track down the supplies. From creative builds to event essentials, we make the mission possible!",
  Creatives: "We build the scene, handcraft the props, and leave imagination’s fingerprints. Every detail is handmade, every corner suspiciously creative!",
};

/** Portraits in public/team/<name-slug>.jpg (background removed, branded backdrop). */
const NO_PHOTO = new Set(["Dr. Shouriehebal Soni"]);
const photoFor = (name: string) =>
  NO_PHOTO.has(name) ? "" : `/team/${name.toLowerCase().replace(/[^a-z\s-]/g, "").trim().replace(/\s+/g, "-")}.jpg`;

export const teamSeed: TeamMember[] = ROWS.map(([name, role, group, section, bio], i) => ({
  id: `7e000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  name,
  role,
  group,
  section,
  bio,
  photoUrl: photoFor(name),
  socialUrl: "",
  spiritAnimal: "",
  visible: true,
  sortOrder: i,
  isSample: false,
}));
