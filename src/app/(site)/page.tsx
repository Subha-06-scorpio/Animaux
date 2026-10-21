import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FootprintTrail, Paw } from "@/components/art/motifs";
import { PlaceholderArt } from "@/components/art/placeholder";
import { EventGrid } from "@/components/events/event-grid";
import { CaseFile } from "@/components/home/case-file";
import { Endangered } from "@/components/home/endangered";
import { Forensics } from "@/components/home/forensics";
import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { Ticker } from "@/components/home/ticker";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicEvents, getSettings, getVisible } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function Home() {
  const [s, events, announcements, gallery] = await Promise.all([getSettings(), getPublicEvents(), getVisible("announcements"), getVisible("gallery")]);
  const featured = [...events].sort((a, b) => Number(b.status.open) - Number(a.status.open)).slice(0, 3);
  const pinned = announcements.filter((a) => a.pinned).concat(announcements.filter((a) => !a.pinned)).slice(0, 3);

  return (
    <>
      <Hero s={s} />
      <Ticker items={announcements} />
      <Intro manifesto={s.manifesto} />
      <Forensics />
      <CaseFile />
      <FootprintTrail className="bg-midnight" />
      <Endangered />

      {/* Events */}
      <section className="relative bg-midnight py-24 sm:py-32" aria-labelledby="events-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Choose your expedition" title={<span id="events-heading">Events worth <em className="text-gold">chasing</em></span>} intro="Competitions, workshops, quizzes, creative challenges and games — register in two clicks." />
            <Link href="/events" className="btn btn-ghost shrink-0 self-start md:self-auto">
              All {events.length} events <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12">
            <EventGrid events={featured} />
          </div>
        </div>
      </section>

      {/* Announcements + gallery teaser */}
      <section className="paper py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading tone="paper" eyebrow="Dispatches from the field" title="Announcements" />
            <ul className="mt-8 space-y-4">
              {pinned.map((a, i) => (
                <Reveal as="li" key={a.id} delay={i * 0.06} className="rounded-2xl border border-forest/15 bg-ivory/70 p-5">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-olive">
                    {a.pinned && <span className="mr-2 text-ember">● Pinned</span>}
                    {formatDate(a.publishedOn)}
                  </p>
                  <h3 className="mt-2 font-display text-xl text-forest">{a.title}</h3>
                  <p className="mt-1 text-sm text-forest/75">{a.body}</p>
                </Reveal>
              ))}
              {!pinned.length && <p className="text-forest/70">No announcements yet — check back soon.</p>}
            </ul>
            <Link href="/schedule" className="mt-6 inline-flex items-center gap-2 font-semibold text-ember hover:text-forest">
              Schedule & festival info <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading tone="paper" eyebrow="The Wild Gallery" title="A documentary in the making" />
            <Reveal className="mt-8 grid h-[26rem] grid-cols-3 grid-rows-2 gap-3">
              {gallery.slice(0, 5).map((g, i) => (
                <Link key={g.id} href="/gallery" className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""} ${i > 2 ? "hidden sm:block" : ""}`}>
                  {g.url && g.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.thumbnailUrl || g.url} alt={g.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full transition duration-700 group-hover:scale-105"><PlaceholderArt seed={g.id} compact /></div>
                  )}
                  <span className="absolute bottom-3 left-3 right-3 truncate text-xs text-ivory/90">{g.category}</span>
                </Link>
              ))}
            </Reveal>
            <Link href="/gallery" className="mt-6 inline-flex items-center gap-2 font-semibold text-ember hover:text-forest">
              Enter the gallery <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-forest py-24 text-center sm:py-32">
        <div className="topo absolute inset-0" aria-hidden />
        <Paw aria-hidden className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 text-night/30" />
        <Reveal className="relative mx-auto max-w-3xl px-4">
          <p className="eyebrow">Your footprint starts here</p>
          <h2 className="display mt-5 text-5xl sm:text-7xl">Answer the call of the wild.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ivory/75">{s.manifesto}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-8 py-4 text-base">Register Now</Link>
            <Link href="/contact" className="btn btn-ghost px-8 py-4 text-base">Ask a question</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
