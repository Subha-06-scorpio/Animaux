import type { TeamGroup, TeamMember } from "@/lib/types";

/**
 * SEED CONTENT — ANIMAUX 2026 TEAM (as shared by the organisers).
 * Photos, intros and social links can be added from Admin → Team.
 * Please double-check name spellings before launch.
 */
type Row = [name: string, role: string, group: TeamGroup, section: string];

const ROWS: Row[] = [
  ["Dr. Shouriehebal Soni", "Teacher in Charge", "faculty", "Teacher in Charge"],
  ["Veer Bharadwaj", "Advisory", "leadership", "Advisory"],
  ["Subha Nandula", "Festival Coordinator", "leadership", "Festival Coordinators"],
  ["Aditya Dubey", "Festival Coordinator", "leadership", "Festival Coordinators"],
  ["Niharika Kamble", "Head · Events", "organizing", "Events"],
  ["Tisya Soneta", "Sub-Head · Events", "organizing", "Events"],
  ["Tia Crasto", "Head · Logistics", "organizing", "Logistics"],
  ["Malav Mistry", "Head · Productions", "organizing", "Productions"],
  ["Tanvi Vichare", "Head · Creatives", "organizing", "Creatives"],
  ["Manasi Baranwal", "Sub-Head · Creatives", "organizing", "Creatives"],
  ["Sana Shaikh", "Head · Social Media", "organizing", "Social Media"],
  ["Yunus Sayyed", "Sub-Head · Social Media", "organizing", "Social Media"],
  ["Mrugank Karandikar", "Head · Marketing", "organizing", "Marketing"],
  ["Anisha Sagare", "Sub-Head · Marketing", "organizing", "Marketing"],
  ["Mihika Mishra", "Head · PR", "organizing", "PR"],
  ["Prachi Gupta", "Head · Hospitality", "organizing", "Hospitality"],
  ["Richa", "Sub-Head · Hospitality", "organizing", "Hospitality"],
];

export const teamSeed: TeamMember[] = ROWS.map(([name, role, group, section], i) => ({
  id: `7e000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  name,
  role,
  group,
  section,
  bio: "",
  photoUrl: "",
  socialUrl: "",
  spiritAnimal: "",
  visible: true,
  sortOrder: i,
  isSample: false,
}));
