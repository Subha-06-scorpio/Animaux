"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Fingerprint, Helix } from "@/components/art/motifs";
import { Reveal } from "@/components/ui/reveal";
import { evidence } from "@/content/species";
import { cn } from "@/lib/utils";

export function Forensics() {
  const [open, setOpen] = useState<string>("01");
  return (
    <section id="forensics" className="relative overflow-hidden bg-midnight py-24 sm:py-32" aria-labelledby="forensics-title">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_20%,rgba(185,101,47,0.12),transparent_70%)]" />
      <Helix className="absolute -left-10 top-10 hidden h-[36rem] text-olive/25 lg:block" turns={4} />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="tag border-ember/50 text-ember-bright">Case file № ANX-26</span>
              <span className="tag border-ivory/20 text-mist">Status: open</span>
            </div>
            <h2 id="forensics-title" className="display mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Wildlife Forensics
              <span className="mt-2 block font-mono text-base tracking-[0.35em] text-gold sm:text-lg">— UNCOVER THE TRUTH</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory/75">
              Wildlife crime leaves evidence like any other crime. Forensic scientists read hair, feathers, bone, tracks and DNA to
              identify species, trace seized products and bring cases to court. At ANIMAUX, you get to play investigator.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="relative mt-12 aspect-[5/4] max-w-md overflow-hidden rounded-3xl border border-ivory/10 bg-night/80">
            <div className="absolute inset-0 topo opacity-80" />
            <Fingerprint className="absolute inset-0 m-auto h-[78%] text-gold/70" />
            <div className="absolute inset-x-0 top-0 h-full">
              <div className="h-1/2 w-full animate-scan border-b-2 border-ember/80 bg-gradient-to-b from-transparent to-ember/15" />
            </div>
            <div className="absolute left-4 top-4 font-mono text-[0.6rem] tracking-[0.3em] text-ivory/60">SAMPLE #0417 · LATENT PRINT</div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between font-mono text-[0.6rem] tracking-[0.25em] text-gold/80">
              <span>ANALYSING…</span>
              <span>MATCH: ?</span>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <p className="eyebrow">Evidence board</p>
            <p className="mt-3 text-ivory/70">Open each marker to see how investigators make the wild testify.</p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {evidence.map((e, i) => {
              const isOpen = open === e.tag;
              return (
                <Reveal as="li" key={e.tag} delay={i * 0.06} className={cn("overflow-hidden rounded-2xl border transition-colors", isOpen ? "border-gold/50 bg-forest/60" : "border-ivory/10 bg-night/40 hover:border-ivory/25")}>
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? "" : e.tag)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-5 p-5 text-left"
                      >
                        <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                          {/* Evidence tent marker */}
                          <svg viewBox="0 0 48 48" className="absolute inset-0" aria-hidden>
                            <path d="M6 42 L24 6 L42 42 Z" fill={isOpen ? "#cfa96b" : "transparent"} stroke="#cfa96b" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                          <span className={cn("relative mt-3 font-mono text-xs font-semibold", isOpen ? "text-midnight" : "text-gold")}>{e.tag}</span>
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-2xl">{e.title}</span>
                          <span className="block text-sm text-ivory/60">{e.teaser}</span>
                        </span>
                        <Plus className={cn("shrink-0 text-gold transition-transform duration-300", isOpen && "rotate-45")} />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}>
                          <p className="px-5 pb-6 pl-[5.25rem] leading-relaxed text-ivory/80">{e.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </Reveal>
              );
            })}
          </ul>
          <Reveal delay={0.2}>
            <Link href="/events?category=competition" className="btn btn-ghost mt-8">
              Take on the forensic events
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
