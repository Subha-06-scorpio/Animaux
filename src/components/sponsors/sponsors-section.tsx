import { Handshake, Mail } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FestivalSettings, Sponsor } from "@/lib/types";

/** Sponsor logos (managed in Admin → Sponsors) plus a standing invitation to partner. */
export function SponsorsSection({ sponsors, s }: { sponsors: Sponsor[]; s: FestivalSettings }) {
  const mail = `mailto:${s.email}?subject=${encodeURIComponent(`Sponsorship — ${s.name}’${s.edition.slice(-2)}`)}`;
  return (
    <section id="sponsors" className="relative border-t border-ivory/10 bg-night py-24" aria-labelledby="sponsors-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          eyebrow="Backing the investigation"
          title={<span id="sponsors-heading">Our <em className="text-gold">sponsors</em></span>}
          intro={sponsors.length ? "ANIMAUX’26 is made possible by partners who believe every species deserves a future." : undefined}
        />

        {sponsors.length > 0 && (
          <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap items-stretch justify-center gap-4">
            {sponsors.map((sp, i) => {
              const inner = (
                <>
                  <span className="grid h-20 w-full place-items-center">
                    {sp.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sp.logoUrl} alt={sp.name} loading="lazy" className="max-h-20 max-w-full object-contain" />
                    ) : (
                      <span className="font-title text-xl font-bold text-midnight">{sp.name}</span>
                    )}
                  </span>
                  {sp.tier && <span className="mt-3 block font-mono text-[0.6rem] uppercase tracking-[0.25em] text-olive">{sp.tier}</span>}
                </>
              );
              return (
                <Reveal as="li" key={sp.id} delay={(i % 4) * 0.05} className="w-[calc(50%-0.5rem)] sm:w-56">
                  {sp.website ? (
                    <a href={sp.website} target="_blank" rel="noopener noreferrer" className="block h-full rounded-2xl bg-parchment p-5 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(207,169,107,0.6)]">
                      {inner}
                    </a>
                  ) : (
                    <div className="h-full rounded-2xl bg-parchment p-5 text-center">{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>
        )}

        <Reveal className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-gold/30 bg-forest/40 p-8 text-center sm:p-10">
          <Handshake className="text-gold" size={32} />
          <h3 className="font-display text-2xl sm:text-3xl">Partner with ANIMAUX’26</h3>
          <p className="max-w-xl text-ivory/75">
            Put your brand at the heart of the Department of Zoology’s festival at {s.college} on 2 December — stalls, prizes, goodies and event partnerships. Our Marketing team, led by Mrugank Karandikar and Anisha Sagare, would love to hear from you.
          </p>
          {s.email && (
            <a href={mail} className="btn btn-gold"><Mail size={16} /> Become a sponsor</a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
