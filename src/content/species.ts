/**
 * Species Spotlight + forensic exhibit content (edited in code).
 *
 * Conservation statuses follow the IUCN Red List as known at the time of
 * writing. Statuses are reassessed periodically — please verify each one on
 * https://www.iucnredlist.org before the festival and edit here if needed.
 * Facts are deliberately qualitative (no population numbers) so nothing
 * goes out of date or is stated without a source.
 */
export type IucnCode = "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";

export const IUCN_SCALE: { code: IucnCode; label: string; note: string }[] = [
  { code: "LC", label: "Least Concern", note: "Widespread and abundant for now." },
  { code: "NT", label: "Near Threatened", note: "Close to qualifying for a threatened category." },
  { code: "VU", label: "Vulnerable", note: "Facing a high risk of extinction in the wild." },
  { code: "EN", label: "Endangered", note: "Facing a very high risk of extinction in the wild." },
  { code: "CR", label: "Critically Endangered", note: "Facing an extremely high risk of extinction in the wild." },
  { code: "EW", label: "Extinct in the Wild", note: "Survives only in captivity or outside its natural range." },
  { code: "EX", label: "Extinct", note: "No reasonable doubt that the last individual has died." },
];

export type Species = {
  common: string;
  scientific: string;
  status: IucnCode;
  fact: string;
  clue: string; // forensic / field-ID angle
  glyph: "stripe" | "scale" | "feather" | "snout" | "tail" | "tusk" | "mane" | "rosette";
};

export const species: Species[] = [
  {
    common: "Indian Pangolin",
    scientific: "Manis crassicaudata",
    status: "EN",
    fact: "Its overlapping scales are made of keratin — the same protein as human fingernails.",
    clue: "Pangolins are among the most trafficked mammals; seized scales are identified to species in forensic labs.",
    glyph: "scale",
  },
  {
    common: "Gharial",
    scientific: "Gavialis gangeticus",
    status: "CR",
    fact: "Adult males grow a bulbous knob on the snout tip, called a ‘ghara’ after an earthen pot.",
    clue: "Its long, slender snout is built for catching fish, not large prey.",
    glyph: "snout",
  },
  {
    common: "Bengal Tiger",
    scientific: "Panthera tigris",
    status: "EN",
    fact: "No two tigers share the same stripe pattern — it works like a fingerprint.",
    clue: "Camera traps identify individual tigers by matching stripe patterns.",
    glyph: "stripe",
  },
  {
    common: "Great Indian Bustard",
    scientific: "Ardeotis nigriceps",
    status: "CR",
    fact: "One of the heaviest flying birds in the world.",
    clue: "Collisions with overhead power lines are a major threat to the species.",
    glyph: "feather",
  },
  {
    common: "Red Panda",
    scientific: "Ailurus fulgens",
    status: "EN",
    fact: "Not a close relative of the giant panda — it sits in a family of its own, Ailuridae.",
    clue: "Despite being classed as a carnivore, it eats mostly bamboo.",
    glyph: "tail",
  },
  {
    common: "Lion-tailed Macaque",
    scientific: "Macaca silenus",
    status: "EN",
    fact: "Found only in the rainforests of the Western Ghats.",
    clue: "Recognisable by its silver-white mane and tufted, lion-like tail.",
    glyph: "mane",
  },
  {
    common: "Asian Elephant",
    scientific: "Elephas maximus",
    status: "EN",
    fact: "Only some males grow tusks; females have small ‘tushes’ or none at all.",
    clue: "Cross-hatched ‘Schreger lines’ in cut ivory help examiners identify elephant ivory.",
    glyph: "tusk",
  },
  {
    common: "Snow Leopard",
    scientific: "Panthera uncia",
    status: "VU",
    fact: "Unlike tigers and lions, snow leopards cannot roar.",
    clue: "Its thick, long tail helps with balance and doubles as a scarf against the cold.",
    glyph: "rosette",
  },
];

export const evidence = [
  {
    tag: "01",
    title: "DNA Barcoding",
    teaser: "A short gene sequence can name a species.",
    body: "Forensic scientists compare short, standardised DNA regions — like a supermarket barcode — against reference libraries to identify a species from meat, skin, or even a fragment of bone.",
  },
  {
    tag: "02",
    title: "Hair & Feather Microscopy",
    teaser: "A single strand holds a pattern.",
    body: "Under a microscope, the scale pattern on a hair’s surface and the shape of its central core (the medulla) differ between species — enough to tell a leopard hair from a dog’s.",
  },
  {
    tag: "03",
    title: "Tracks & Pugmarks",
    teaser: "Every footprint tells a story.",
    body: "Field researchers photograph, measure and cast tracks in plaster to learn which animal passed, which way it went, and roughly when.",
  },
  {
    tag: "04",
    title: "Seized-Product Analysis",
    teaser: "Is it ivory? Is it real?",
    body: "Examiners study textures, growth patterns and chemistry to tell genuine wildlife products from fakes and to trace them back to the species they came from.",
  },
];
