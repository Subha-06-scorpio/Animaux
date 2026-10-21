import { TEAM_SECTIONS, type TeamGroup, type TeamMember } from "@/lib/types";

/**
 * SEED CONTENT — PLACEHOLDER TEAM.
 * No real people are listed. Replace from Admin → Team (add photos, names,
 * roles, reorder, hide). Counts per section are only for layout preview.
 */
const COUNTS: Record<string, number> = {
  "Head of Department": 1,
  "Faculty Coordinators": 2,
  "Supporting Teachers": 3,
  "Festival Chairperson": 1,
  "General Secretary": 1,
  "Core Committee": 4,
  "Event Heads": 4,
  Volunteers: 4,
};

const ANIMALS = [
  "Clouded leopard", "Hornbill", "Pangolin", "Gharial", "Red panda", "Otter", "Barn owl",
  "Snow leopard", "Indian bison", "Flying squirrel", "Sloth bear", "Peacock spider",
  "Olive ridley", "Malabar civet", "Dhole", "Kingfisher",
];

let n = 0;
const roleFor = (section: string) => (section.endsWith("Team") ? "Team member" : section.replace(/s$/, ""));

export const teamSeed: TeamMember[] = (Object.keys(TEAM_SECTIONS) as TeamGroup[]).flatMap((group) =>
  TEAM_SECTIONS[group].flatMap((section) =>
    Array.from({ length: COUNTS[section] ?? 2 }, () => {
      n += 1;
      return {
        id: `7e000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
        name: `Placeholder Name ${n}`,
        role: roleFor(section),
        group,
        section,
        bio: "Short introduction goes here (placeholder).",
        photoUrl: "",
        socialUrl: "",
        spiritAnimal: ANIMALS[n % ANIMALS.length],
        visible: true,
        sortOrder: n,
        isSample: true,
      } satisfies TeamMember;
    }),
  ),
);
