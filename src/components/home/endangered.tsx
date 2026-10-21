"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SpeciesGlyph } from "@/components/art/motifs";
import { Reveal } from "@/components/ui/reveal";
import { IUCN_SCALE, species, type IucnCode } from "@/content/species";
import { cn } from "@/lib/utils";

const TONE: Record<IucnCode, string> = {
  LC: "bg-olive/70 text-ivory",
  NT: "bg-moss text-midnight",
  VU: "bg-gold text-midnight",
  EN: "bg-ember text-midnight",
  CR: "bg-[#a2442a] text-ivory",
  EW: "bg-[#5b2a1e] text-ivory",
  EX: "bg-night text-ivory border border-ivory/30",
};

export function Endangered() {
  const [focus, setFocus] = useState<IucnCode | null>(null);
  const info = IUCN_SCALE.find((s) => s.code === focus);

  return (
    <section id="endangered" className="relative overflow-hidden bg-gradient-to-b from-midnight via-forest to-midnight py-24 sm:py-32" aria-labelledby="endangered-title">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Exhibit 02 · Species on the edge</p>
            <h2 id="endangered-title" className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
              Endangered Species
              <span className="mt-2 block font-mono text-base tracking-[0.35em] text-ember-bright sm:text-lg">— PROTECT THEIR FUTURE</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="text-lg leading-relaxed text-ivory/75 lg:col-span-5">
            Habitat loss, trafficking and a changing climate are pushing species toward the edge. Every one of them holds a place in
            a web we all depend on — and every one of them can still be saved.
          </Reveal>
        </div>

        {/* IUCN scale */}
        <Reveal className="mt-14">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-mist">IUCN Red List categories — tap to explore</p>
          <div className="flex overflow-hidden rounded-full border border-ivory/15" role="group" aria-label="IUCN Red List categories">
            {IUCN_SCALE.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setFocus(focus === c.code ? null : c.code)}
                aria-pressed={focus === c.code}
                title={c.label}
                className={cn(
                  "flex-1 py-3 font-mono text-xs font-semibold tracking-widest transition",
                  TONE[c.code],
                  focus && focus !== c.code ? "opacity-35" : "opacity-100",
                )}
              >
                {c.code}
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-[1.5rem] text-sm text-ivory/75" aria-live="polite">
            {info ? (
              <>
                <strong className="text-gold">{info.label}:</strong> {info.note}
              </>
            ) : (
              "From Least Concern to Extinct — the global scale scientists use to measure extinction risk."
            )}
          </p>
        </Reveal>

        {/* Specimen cards */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {species.map((sp, i) => {
            const dim = focus && focus !== sp.status;
            return (
              <Reveal as="li" key={sp.scientific} delay={(i % 4) * 0.06}>
                <motion.div
                  animate={{ opacity: dim ? 0.3 : 1, scale: dim ? 0.98 : 1 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ivory/10 bg-night/60 p-6 transition-colors hover:border-gold/40"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[0.6rem] tracking-[0.3em] text-mist">SPECIMEN {String(i + 1).padStart(3, "0")}</span>
                    <span className={cn("rounded-md px-2 py-0.5 font-mono text-[0.65rem] font-semibold", TONE[sp.status])} title={IUCN_SCALE.find((c) => c.code === sp.status)?.label}>
                      {sp.status}
                    </span>
                  </div>
                  <SpeciesGlyph kind={sp.glyph} className="my-6 h-16 w-16 text-gold/80 transition duration-500 group-hover:scale-110 group-hover:text-gold" />
                  <h3 className="font-display text-2xl leading-tight">{sp.common}</h3>
                  <p className="font-display italic text-gold/90">{sp.scientific}</p>
                  <p className="mt-4 text-sm leading-relaxed text-ivory/75">{sp.fact}</p>
                  <div className="mt-auto pt-5">
                    <p className="border-t border-dashed border-ivory/15 pt-4 text-xs leading-relaxed text-mist transition group-hover:text-ivory/80 group-focus:text-ivory/80">
                      <span className="mr-1 font-mono uppercase tracking-widest text-ember-bright">Field note ›</span>
                      {sp.clue}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-mist">
          Status per the IUCN Red List of Threatened Species. Assessments change — see{" "}
          <a href="https://www.iucnredlist.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">iucnredlist.org</a> for the latest.
        </p>
      </div>
    </section>
  );
}
