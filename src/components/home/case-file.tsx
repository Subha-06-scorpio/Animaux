"use client";

import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SpeciesGlyph } from "@/components/art/motifs";
import { cn } from "@/lib/utils";

/**
 * "Solve the case" mini-exhibit. The case is fictional; the science in each
 * clue is real (pangolins are the only mammals covered in keratin scales).
 */
const CLUES = [
  { tag: "A", kind: "Seizure report", text: "A parcel declared as “dried fish scales” is stopped at a port. Inside: hundreds of hard, overlapping, plate-like scales." },
  { tag: "B", kind: "Lab · chemistry", text: "The scales are made of keratin — the protein in your fingernails — with no bone inside. Fish scales and crocodilian scutes don’t match." },
  { tag: "C", kind: "Intelligence", text: "Buyers want the scales for use in traditional medicine — a demand that drives one of the world’s largest illegal wildlife trades." },
  { tag: "D", kind: "Lab · DNA barcoding", text: "The sequence matches a mammal native to the Indian subcontinent." },
];

const SUSPECTS = [
  { id: "tortoise", name: "Indian Star Tortoise", glyph: "rosette", verdict: "Close — star tortoises are heavily trafficked too, mostly as pets. But their shells are bone covered in keratin, and the lab says mammal." },
  { id: "pangolin", name: "Indian Pangolin", glyph: "scale", verdict: "Case closed. The Indian pangolin (Manis crassicaudata) is the only mammal covered in keratin scales — and one of the most trafficked mammals on Earth. It is listed as Endangered." },
  { id: "gharial", name: "Gharial", glyph: "snout", verdict: "Not this time. Gharials are reptiles, and their armour plates are reinforced with bone. Check clue D." },
] as const;

export function CaseFile() {
  const [revealed, setRevealed] = useState(1);
  const [guess, setGuess] = useState<string | null>(null);
  const solved = guess === "pangolin";
  const picked = SUSPECTS.find((s) => s.id === guess);

  return (
    <section id="case" className="relative overflow-hidden bg-night py-24 sm:py-32" aria-labelledby="case-title">
      <div className="topo absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Interactive exhibit · Crime scene investigation</p>
          <h2 id="case-title" className="display mt-4 text-5xl sm:text-6xl">The Case of the <em className="text-gold">Missing Scales</em></h2>
          <p className="mx-auto mt-4 max-w-xl text-ivory/70">Reveal the evidence, one clue at a time. Then name the species. A fictional case, built on real wildlife forensics.</p>
        </div>

        {/* Case folder */}
        <div className="relative mt-14 rounded-3xl border border-gold/25 bg-[linear-gradient(160deg,#2a2016,#1c150e_45%,#17110c)] p-5 shadow-2xl sm:p-10">
          <span aria-hidden className="absolute -top-4 left-10 rounded-t-xl border border-b-0 border-gold/25 bg-[#2a2016] px-5 py-1.5 font-mono text-[0.65rem] tracking-[0.3em] text-gold">CASE № ANX-26-014</span>
          <motion.span
            aria-hidden
            initial={false}
            animate={{ opacity: solved ? 1 : 0, scale: solved ? 1 : 1.6, rotate: -12 }}
            transition={{ type: "spring", damping: 12 }}
            className="pointer-events-none absolute right-6 top-6 z-10 rounded-lg border-4 border-ember px-4 py-1 font-mono text-xl font-bold tracking-[0.2em] text-ember sm:right-10 sm:text-2xl"
          >
            CASE CLOSED
          </motion.span>

          <div className="grid gap-8 lg:grid-cols-5">
            <ol className="space-y-3 lg:col-span-3" aria-live="polite">
              {CLUES.map((c, i) => {
                const shown = i < revealed;
                return (
                  <li key={c.tag} className={cn("flex gap-4 rounded-2xl border p-4 transition", shown ? "border-ivory/15 bg-midnight/70" : "border-dashed border-ivory/10")}>
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                      <svg viewBox="0 0 48 48" className="absolute inset-0" aria-hidden>
                        <path d="M6 42 L24 6 L42 42 Z" fill={shown ? "#cfa96b" : "none"} stroke="#cfa96b" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                      <span className={cn("relative mt-3 font-mono text-xs font-bold", shown ? "text-night" : "text-gold")}>{c.tag}</span>
                    </span>
                    {shown ? (
                      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-gold">Evidence {c.tag} · {c.kind}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ivory/85 sm:text-base">{c.text}</p>
                      </motion.div>
                    ) : (
                      <p className="self-center font-mono text-xs uppercase tracking-[0.25em] text-mist">Sealed evidence bag</p>
                    )}
                  </li>
                );
              })}
              {revealed < CLUES.length && (
                <li>
                  <button type="button" onClick={() => setRevealed((r) => r + 1)} className="btn btn-gold mt-2">
                    <Search size={16} /> Open evidence {CLUES[revealed].tag}
                  </button>
                </li>
              )}
            </ol>

            <div className="lg:col-span-2">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-mist">Line-up · who is the victim species?</p>
              <div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-1">
                {SUSPECTS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setGuess(s.id)}
                    aria-pressed={guess === s.id}
                    className={cn(
                      "group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition lg:flex-row lg:text-left",
                      guess === s.id ? (s.id === "pangolin" ? "border-gold bg-gold/10" : "border-ember bg-ember/10") : "border-ivory/15 hover:border-gold/60",
                    )}
                  >
                    <SpeciesGlyph kind={s.glyph} className="h-10 w-10 shrink-0 text-gold" />
                    <span>
                      <span className="block font-mono text-[0.6rem] tracking-[0.25em] text-mist">SUSPECT {i + 1}</span>
                      <span className="block font-display text-base sm:text-lg">{s.name}</span>
                    </span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {picked && (
                  <motion.div key={picked.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={cn("mt-5 rounded-2xl border p-4 text-sm leading-relaxed", solved ? "border-gold/50 bg-forest/60" : "border-ember/50 bg-ember/10")}>
                    {picked.verdict}
                    {solved ? (
                      <Link href="/events?category=competition" className="mt-3 block font-semibold text-gold hover:text-ember-bright">Think you can crack a harder one? See the forensic events →</Link>
                    ) : (
                      revealed < CLUES.length && <p className="mt-2 text-mist">Tip: open more evidence first.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {guess && (
                <button type="button" onClick={() => { setGuess(null); setRevealed(1); }} className="mt-4 inline-flex items-center gap-2 text-xs text-mist hover:text-gold">
                  <RotateCcw size={13} /> Reset the case
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
