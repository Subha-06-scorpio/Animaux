import type { Metadata } from "next";
import Link from "next/link";
import { Helix } from "@/components/art/motifs";
import { Endangered } from "@/components/home/endangered";
import { Forensics } from "@/components/home/forensics";
import { Intro } from "@/components/home/intro";
import { Reveal } from "@/components/ui/reveal";
import { PageHero, SectionHeading } from "@/components/ui/section-heading";
import { getPublicEvents, getSettings } from "@/lib/queries";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "About", description: "What ANIMAUX 2026: Echoes of the Wild is about — wildlife, forensics, biodiversity and conservation." };

const EXPECT: Record<string, string> = {
  competition: "Crack cases, defend research and go head-to-head.",
  workshop: "Hands-on sessions with specimens, tools and techniques.",
  quiz: "Fast rounds for people who know their fauna.",
  creative: "Photography, art and storytelling inspired by the wild.",
  game: "Trails, hunts and play — learning by running around.",
};

export default async function AboutPage() {
  const [s, events] = await Promise.all([getSettings(), getPublicEvents()]);
  const cats = EVENT_CATEGORIES.filter((c) => events.some((e) => e.category === c));
  return (
    <>
      <PageHero eyebrow={`About ${s.name} ${s.edition}`} title={<>{s.theme}.</>} intro={s.tagline} />
      <Intro manifesto={s.manifesto} />
      <section className="relative overflow-hidden bg-midnight py-24">
        <Helix className="absolute -right-6 top-0 hidden h-full text-olive/20 md:block" turns={5} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="What to expect" title="Ways into the wild" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((c, i) => (
              <Reveal as="li" key={c} delay={i * 0.06}>
                <Link href={`/events?category=${c}`} className="card group block h-full p-6 transition hover:border-gold/50">
                  <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 font-display text-2xl group-hover:text-gold">{CATEGORY_LABELS[c]}</h3>
                  <p className="mt-2 text-sm text-ivory/65">{EXPECT[c]}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <Forensics />
      <Endangered />
    </>
  );
}
