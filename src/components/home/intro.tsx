import { Feather, FootprintTrail, Paw } from "@/components/art/motifs";
import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  { n: "01", t: "Investigate", d: "Trace tracks, unravel clues and see how science helps investigate wildlife crime." },
  { n: "02", t: "Survive", d: "Decode animal adaptations and the links between predators, prey and their changing habitats — nature’s survival stories." },
  { n: "03", t: "Celebrate", d: "Pitches, photography, art and games — a whole day of curiosity and the excitement of asking “why?”." },
];

export function Intro({ manifesto }: { manifesto: string }) {
  return (
    <section id="discover" className="paper relative overflow-hidden py-24 sm:py-32">
      <Paw aria-hidden className="absolute -right-10 top-10 h-64 w-64 rotate-12 text-forest/[0.05]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow text-olive">Case briefing · File 01</p>
          <h2 className="display mt-4 text-5xl text-forest sm:text-6xl">
            The wilderness is a casebook.
            <br />
            <em className="text-ember">Science is the toolkit.</em>
          </h2>
          <div className="mt-10 flex items-center gap-8">
            <Feather className="h-16 w-16 text-olive" />
            <span aria-hidden className="-rotate-12 rounded-md border-[3px] border-ember/80 px-3 py-1 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ember/80 mix-blend-multiply">
              Case open · 02.12.26
            </span>
          </div>
        </Reveal>
        <div className="space-y-6 text-lg leading-relaxed text-forest/85 lg:col-span-7">
          <Reveal>
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-title first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-ember">
              Every footprint becomes a clue, every feather a piece of evidence, every echo a hint of a story waiting to be uncovered.
              <strong> ANIMAUX 2026 — Echoes of the Wild: The Survival Files</strong> turns the Zoology Department’s celebration into a
              lively hunt for life in the wild.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Step into the role of a wildlife investigator. Explore the mysteries of survival, decode the secrets behind animal
              adaptations, and examine the connections between predators, prey and their changing habitats. From tracing tracks and
              unravelling clues to exploring how science helps investigate wildlife crime, ANIMAUX invites you to look beyond what
              meets the eye — on 2 December 2026 at SVKM’s Mithibai College.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-display text-2xl italic text-forest">“{manifesto}”</p>
          </Reveal>
        </div>
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-forest/15 bg-forest/15 px-0 sm:grid-cols-3 mx-4 sm:mx-6 xl:mx-auto">
        {PILLARS.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.08} className="group bg-ivory p-8 transition hover:bg-parchment sm:p-10">
            <span className="font-mono text-xs tracking-[0.3em] text-olive">{p.n}</span>
            <h3 className="display mt-6 text-4xl text-forest transition group-hover:text-ember">{p.t}</h3>
            <p className="mt-4 text-forest/75">{p.d}</p>
          </Reveal>
        ))}
      </div>
      <FootprintTrail className="mt-10 [&_svg]:text-olive/60" />
    </section>
  );
}
