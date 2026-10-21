import { Feather, FootprintTrail, Paw } from "@/components/art/motifs";
import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  { n: "01", t: "Investigate", d: "Step into wildlife forensics — where a feather, a footprint or a fragment of DNA can crack a case." },
  { n: "02", t: "Protect", d: "Meet the species on the edge and the people, science and ideas fighting to keep them here." },
  { n: "03", t: "Celebrate", d: "Quizzes, art, photography, games and workshops — a whole festival of curiosity, built by students." },
];

export function Intro({ manifesto }: { manifesto: string }) {
  return (
    <section id="discover" className="paper relative overflow-hidden py-24 sm:py-32">
      <Paw aria-hidden className="absolute -right-10 top-10 h-64 w-64 rotate-12 text-forest/[0.05]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow text-olive">Field journal · Entry 01</p>
          <h2 className="display mt-4 text-5xl text-forest sm:text-6xl">
            Listen closely.
            <br />
            <em className="text-ember">The wild is talking.</em>
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
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-ember">
              Somewhere out there, a pangolin is curling into an armoured ball, a hornbill is quietly planting a forest one seed at a
              time, and a forensic scientist is reading a single strand of hair like a page from a diary. <strong>ANIMAUX</strong> is where
              we go looking for those stories.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              It is the annual festival of the Department of Zoology, SVKM’s Mithibai College — one day of wildlife, science and wild ideas on 2 December 2026. Solve a mock
              wildlife-crime case. Defend your research. Out-quiz your friends. Sketch an endangered species. Find out why every
              species — the charismatic and the overlooked — deserves a future.
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
