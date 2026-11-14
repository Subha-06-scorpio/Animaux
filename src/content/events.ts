import type { FestEvent } from "@/lib/types";

/**
 * SEED CONTENT — ANIMAUX'26 events, from the organisers' event overview,
 * the theme doc and the official flyer. Times, venues and fees were not
 * provided yet, so they show as "TBA" until filled in from Admin → Events.
 */
const BASE = {
  eventDate: "2026-12-02",
  startTime: "",
  endTime: "",
  venue: "SVKM's Mithibai College",
  fee: 0, // all ANIMAUX'26 events are free
  deadline: "2026-11-30T23:59:00+05:30",
  coordinatorName: "Niharika Kambli (Head · Events)",
  coordinatorPhone: "+91 99208 24982",
  coordinatorEmail: "animaux.zoology@gmail.com",
  registrationOpen: true,
  visible: true,
  isSample: false,
} satisfies Partial<FestEvent>;

type Input = Pick<FestEvent, "slug" | "name" | "category" | "tier" | "shortDescription" | "description"> &
  Partial<Omit<FestEvent, "id" | "sortOrder">>;

let n = 0;
const ev = (e: Input): FestEvent => {
  n += 1;
  return {
    ...BASE,
    id: `e1000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    tagline: "",
    prize: "",
    participation: "individual",
    teamMin: 1,
    teamMax: 1,
    capacity: null,
    rules: [],
    eligibility: "",
    extraQuestions: [],
    sortOrder: n,
    ...e,
    posterUrl: e.posterUrl ?? `/events/${e.slug}.jpg`, // illustrated artwork, see scripts/event-art.mjs
  };
};

export const eventsSeed: FestEvent[] = [
  // ───────────── MAIN EVENTS (as numbered on the flyer) ─────────────
  ev({
    slug: "the-last-trace",
    prize: "Winners get goodies",
    name: "The Last Trace",
    tagline: "The flagship investigation of ANIMAUX'26.",
    category: "competition",
    tier: "main",
    startTime: "11:30",
    shortDescription:
      "An endangered animal found dead under suspicious circumstances. 45 minutes to hunt clues, decode forensic reports and crack the case.",
    description:
      "The forest holds a secret — and your team has just 45 minutes to uncover it. An endangered animal has been found dead under suspicious circumstances, leaving behind scattered clues, conflicting accounts, and a trail that demands a closer look. Enter The Last Trace, the flagship event of Animaux 2026, where the chase of a treasure hunt meets the suspense of an escape room in a wildlife-forensics investigation.\n\nFollow the trail, hunt for hidden evidence, and solve interconnected puzzles to piece together what happened. Examine mock forensic reports, reconstruct the timeline, question the suspects’ stories, and establish the motive. But finding a clue is only half the challenge: collect and label it correctly, or risk having crucial evidence declared compromised. Can your team connect the final dots and escape with the truth — or will the wild keep its secret?",
    participation: "team",
    teamMin: 2,
    teamMax: 5,
    capacity: 4,
    rules: [
      "Round 1: 11:30 AM · Round 2: 2:15 PM.",
      "Participation: 4 teams, up to 5 members each.",
      "Duration: approximately 45 minutes per session.",
      "One continuous investigation combining clue-hunting, puzzles and case-solving.",
      "Evidence must be collected and labelled correctly — mishandled clues may be declared compromised.",
    ],
  }),
  ev({
    slug: "trace-evidence-relay",
    prize: "Winners get goodies",
    name: "Trace Evidence Relay",
    tagline: "Follow the Clues. Beat the Clock.",
    category: "competition",
    tier: "main",
    capacity: 4,
    startTime: "13:30",
    shortDescription:
      "A fast-paced race through hands-on forensic checkpoints: soil pH matching, fingerprint lifting, mock fur comparison and chemical colour tests.",
    description:
      "A little soil, a stray strand of fur, an almost invisible fingerprint — could you spot the clues that others overlook? Trace Evidence Relay sends your team through a series of hands-on forensic checkpoints, each testing a different investigative skill. Match soil samples using pH tests, lift fingerprints, compare mock fur samples, and interpret colour changes in a simulated chemical test.\n\nWhether your team tackles the stations together or sends members forward in relay turns, clear communication and careful observation will be your strongest tools. Every checkpoint demands both speed and precision: rushing ahead won’t help if the evidence points elsewhere! Bring your sharpest eyes and steadiest hands — this race belongs to the team that can think like investigators.",
    participation: "team",
    teamMin: 2,
    teamMax: 4,
    rules: [
      "Format: team-based forensic station relay.",
      "Participation: 4 teams, up to 4 members each.",
      "Station-based progression featuring four task types.",
    ],
  }),
  ev({
    slug: "wild-shark-tank",
    prize: "Winners get goodies",
    name: "Wild Shark Tank: Eco-Startup Pitch",
    tagline: "Pitch for the Planet. Negotiate for the Wild.",
    category: "competition",
    tier: "main",
    capacity: 7,
    startTime: "13:00",
    shortDescription:
      "Pitch a business, product or technology that tackles a wildlife or environmental challenge — and survive the Sharks’ questions.",
    description:
      "The wild has problems. Your team might have the next big solution. Step into Wild Shark Tank, where conservation meets entrepreneurship and bold ideas face some sharp questions. Develop a business, product, or technology that addresses a wildlife or environmental challenge, then convince a panel of “Sharks” that your solution deserves their backing.\n\nA compelling pitch is just the beginning. Explain how your idea works, defend your business model, demonstrate its conservation impact, and navigate simulated investment negotiations. Reach the top three, and a surprise challenge will test your ability to adapt when the conditions change. Will your idea stand up to scrutiny — or get eaten alive in the tank?",
    participation: "team",
    teamMin: 2,
    teamMax: 6,
    rules: [
      "Format: team-based eco-startup pitch competition.",
      "Participation: 6–7 teams of 2–6 members each.",
      "Rounds: live pitches with questions and simulated negotiations, followed by a surprise challenge for the top three teams.",
    ],
    extraQuestions: [
      { id: "idea", label: "Your startup idea in one or two lines", type: "textarea", required: true },
    ],
  }),
  ev({
    slug: "the-poachers-tale",
    name: "The Poacher’s Tale",
    tagline: "Protect the Sanctuary. Suspect Everyone.",
    category: "game",
    tier: "main",
    capacity: 20,
    teamMax: 1,
    teamMin: 1,
    participation: "individual",
    startTime: "13:00",
    shortDescription:
      "Rangers build the Sanctuary Fund while secret Poachers work against them. Tell true or tall wildlife tales, cross-examine, and vote at the Campfire Council.",
    description:
      "Welcome to the sanctuary, where everyone claims to be a protector — but not everyone is telling the truth. In The Poacher’s Tale, Rangers work together to complete missions and build a shared Sanctuary Fund while secret Poachers hide among them, waiting for their chance to strike. Every conversation could reveal a clue, conceal a lie, or turn an ally into your prime suspect.\n\nDuring Wild Truth or Tall Tale, teams present true or invented wildlife stories while their opponents cross-examine, debate, and deliver a verdict. Those decisions influence suspicion, clues, and protection before the Campfire Council votes to banish a suspected Poacher. Then night falls, and the hidden threat makes its move. Can the Rangers expose every Poacher before the enemy matches their numbers or the Sanctuary Fund collapses?",
    rules: [
      "Format: social-deduction game with secret Ranger and Poacher roles.",
      "Participation: individual, 15–20 participants.",
      "Rangers win by banishing every Poacher; Poachers win by matching the Rangers’ numbers or collapsing the Fund.",
    ],
    eligibility: "Individual entry — not a team event. 15–20 participants.",
  }),
  ev({
    slug: "flood-zone",
    name: "Flood Zone: Survive the Wild",
    tagline: "Limited Ground. Changing Rules. Every Step Counts.",
    category: "game",
    tier: "main",
    eligibility: "Individual entry — not a team event. 15–20 participants.",
    startTime: "11:00",
    shortDescription:
      "The water is rising and safe ground is running out. Cross the danger zone on limited platforms, read the animal calls and outlast the flood.",
    description:
      "The water is rising, safe ground is vanishing, and only the sharpest survivors will make it across. Flood Zone: Survive the Wild drops you into a simulated flood, fire or trap zone where a handful of safe platforms is all that stands between you and the water. Every move is yours alone: choose your footing carefully, plan your next step, and stay on the platforms as the zone keeps shifting.\n\nJust when you think you have the route figured out, animal-call signals change the rules and force you to adapt on the spot. Later rounds test your investigator’s instincts: follow the evidence to find the safer path instead of trusting luck. Make it to the final and you’ll face one last responsibility — carrying a toy baby animal to safety without losing your ground. In the wild, survival isn’t about being the fastest; it’s about reading the signs and keeping your nerve.",
    participation: "individual",
    teamMin: 1,
    teamMax: 1,
    capacity: 20,
    rules: [
      "Format: migration and survival challenge.",
      "Participation: individual, 15–20 participants.",
      "Animal-call signals change the rules mid-round; finalists carry a toy baby animal to safety.",
    ],
  }),
  ev({
    slug: "7-steps",
    name: "7 Steps",
    tagline: "Trust Your Knowledge. Earn Your Next Move.",
    category: "quiz",
    tier: "main",
    eligibility: "Individual entry — not a team event. 15–20 participants.",
    capacity: 20,
    teamMax: 1,
    teamMin: 1,
    participation: "individual",
    startTime: "10:30",
    shortDescription:
      "The counter has turned away. Answer right to step forward, wrong to step back — how far can you get before they turn around?",
    description:
      "The counter has turned away, the countdown has begun, and every answer could change your position. In 7 Steps, participants line up behind a volunteer facing backwards while other volunteers put their knowledge to the test. A correct answer earns you one step forward; a wrong answer sends you one step back. There’s no team to carry you through this one — your progress rests on your own answers.\n\nAs the counting continues, every question becomes a chance to gain ground or lose it. Keep your thoughts clear, resist the pressure, and make each response count. How far can you advance before the counter finishes and turns around?",
    rules: [
      "Format: individual question-and-step game.",
      "Participation: 15–20 participants.",
      "Countdown-based gameplay.",
    ],
  }),
  ev({
    slug: "shutter-safari",
    prize: "Winners get goodies",
    name: "Shutter Safari: Photography Competition",
    tagline: "Every picture has a story — what will yours reveal?",
    category: "creative",
    tier: "main",
    shortDescription:
      "Capture the beauty, mystery and unexpected details of the natural world — and upload your photograph when you register.",
    description:
      "Every picture has a story — what will yours reveal? Capture the beauty, mystery, and unexpected details of the natural world through your lens. From a bird in motion to the tiny life hidden beneath a leaf, turn an ordinary moment into an extraordinary frame.\n\nPlay with light, perspective, and composition to create a photograph that makes people pause and look closer. Whether you focus on wildlife, plants, or nature’s fascinating patterns, let your creativity shine and show us the wild through your eyes!",
    extraQuestions: [
      { id: "photo", label: "Upload your photograph (JPG, PNG or WebP · up to 10 MB)", type: "file", required: true },
      { id: "caption", label: "Title or caption for your photo", type: "text", required: false },
    ],
    eligibility: "Details to be announced.",
  }),
  ev({
    slug: "strokes-of-wild",
    name: "Strokes of Wild",
    tagline: "Small canvas, wild possibilities!",
    category: "creative",
    tier: "main",
    rules: [
      "Participation: individual, up to 20 participants.",
    ],
    capacity: 20,
    teamMax: 1,
    teamMin: 1,
    participation: "individual",
    startTime: "10:30",
    shortDescription:
      "Turn a simple coaster into a colourful celebration of nature — animal designs, leafy patterns, marine scenes or a conservation message.",
    description:
      "Small canvas, wild possibilities! Turn a simple coaster into a colourful celebration of nature with animal-inspired designs, leafy patterns, marine scenes, or a conservation message close to your heart. Experiment with colours and details to create something that’s both useful and uniquely yours.\n\nWhether your style is bold, playful, or beautifully minimal, this is your chance to bring the natural world to the table. Let your imagination run wild, one coaster at a time!",
    eligibility: "Individual entry — not a team event. Up to 20 participants.",
  }),

  // ───────────── MINI EVENTS (on the spot, no online registration) ─────────────
  ev({
    slug: "wildlife-pictionary",
    name: "Wildlife Pictionary",
    category: "game",
    tier: "mini",
    shortDescription: "Draw it, act it, guess it — animal names, behaviours and wildlife terms, with animal-call rounds.",
    description:
      "A timed drawing-and-acting game in which participants communicate animal names, behaviours, and wildlife terms without directly naming them. Team members rotate as the artist or performer while their teammates guess, with animal calls and soundscapes providing prompts in special rounds.",
    participation: "team",
    teamMin: 2,
    teamMax: 4,
    rules: ["2–4 members per team."],
  }),
  ev({
    slug: "wild-aim",
    name: "Wild Aim: Tranq & Snap Shooting Range",
    category: "game",
    tier: "mini",
    shortDescription: "Carnival-style ranger and wildlife-vet tasks with foam darts, soft-ball targets and phone photography.",
    description:
      "Identify animal calls, aim at designated targets, or photograph hidden and moving cutouts, depending on the station. The entire activity uses props rather than real animals or wildlife equipment. The dart station has 3–4 lanes.",
    rules: ["Props only — no real animals or wildlife equipment.", "Dart station: 3–4 players at a time."],
  }),
  ev({
    slug: "wild-eye",
    name: "Wild Eye",
    category: "quiz",
    tier: "mini",
    shortDescription: "See it once, hear it once — then answer. A rapid observation and memory challenge.",
    description:
      "Participants briefly view an animal-related image, video or object — or hear a sound — before answering questions without a repeat. Questions test species identity, markings, orientation, visible features and background details.",
    participation: "team",
    teamMin: 1,
    teamMax: 3,
    rules: ["Solo or teams of 2–3."],
  }),
  ev({
    slug: "fingerprint-paintings",
    name: "Fingerprint Paintings",
    category: "creative",
    tier: "mini",
    shortDescription: "Turn your fingerprints into animal illustrations — a keepsake, or part of a shared wildlife mural.",
    description:
      "A relaxed creative activity in which participants use their fingerprints to form animal illustrations, adding details with pens or markers. Reference cards guide simple designs, with an optional forensic-themed introduction to fingerprint identification.",
  }),
  ev({
    slug: "who-am-i",
    name: "Who Am I?",
    category: "quiz",
    tier: "mini",
    shortDescription: "A zoomed-in picture. One animal. Can you name it?",
    description: "Participants are shown a zoomed-in picture of an animal and must identify it from that detail alone.",
  }),
  ev({
    slug: "memory-game",
    name: "Memory Game",
    category: "game",
    tier: "mini",
    shortDescription: "20 cards, 10 animal pairs, 30 seconds. Match at least 5.",
    description:
      "Twenty cards are laid out — two of each animal, placed randomly. Match the pairs within 30 seconds; you need at least five matches to clear the round.",
  }),
];
