import { CalendarDays, Download, ExternalLink, Hourglass, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Timeline } from "@/components/schedule/timeline";
import { InstagramIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { PageHero, SectionHeading } from "@/components/ui/section-heading";
import { getPublicEvents, getSettings, getVisible } from "@/lib/queries";
import { festivalDateLabel, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Schedule & Festival Info", description: "ANIMAUX 2026 dates, schedule, venue, directions, deadlines and participant guidelines." };

export default async function SchedulePage() {
  const [s, schedule, events, announcements] = await Promise.all([getSettings(), getVisible("schedule"), getPublicEvents(), getVisible("announcements")]);
  const start = new Date(s.startDate);
  const dayLabels = Object.fromEntries(
    [...new Set(schedule.map((i) => i.day))].map((d) => [d, s.datesConfirmed ? formatDate(new Date(start.getTime() + (d - 1) * 86400000).toISOString(), { weekday: "short", day: "numeric", month: "short" }) : ""]),
  );
  const deadlines = [...events].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <>
      <PageHero eyebrow="Expedition plan" title={<>Schedule & <em className="text-gold">field notes</em>.</>} intro="Everything you need before you set out: dates, the full timeline, how to reach us, deadlines and the ground rules.">
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ivory/10 bg-night/40 p-5">
            <CalendarDays className="text-gold" size={20} />
            <p className="mt-3 text-sm text-mist">Festival dates</p>
            <p className="font-display text-xl">{festivalDateLabel(s)}</p>
          </div>
          <div className="rounded-2xl border border-ivory/10 bg-night/40 p-5">
            <MapPin className="text-gold" size={20} />
            <p className="mt-3 text-sm text-mist">Venue</p>
            <p className="font-display text-xl">{s.college}</p>
          </div>
          <div className="rounded-2xl border border-ivory/10 bg-night/40 p-5">
            <Download className="text-gold" size={20} />
            <p className="mt-3 text-sm text-mist">Festival brochure</p>
            {s.brochureUrl ? (
              <a href={s.brochureUrl} target="_blank" rel="noopener noreferrer" className="font-display text-xl text-gold hover:text-ember-bright">View brochure</a>
            ) : (
              <p className="font-display text-xl text-ivory/60">Coming soon</p>
            )}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Timeline" title="The full schedule" intro={schedule.some((i) => !i.time) ? "Event timings will be announced soon — check back here or follow the announcements." : undefined} />
        <div className="mt-10">
          <Timeline items={schedule} dayLabels={dayLabels} />
        </div>
      </section>

      <section className="border-y border-ivory/10 bg-night py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <a href="/animaux26-flyer.jpg" target="_blank" className="group mx-auto block w-full max-w-md overflow-hidden rounded-2xl border border-gold/30 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/animaux26-flyer.jpg" alt="Official ANIMAUX’26 poster: Echoes of the Wild — The Survival Files, 2nd December 2026, with the 8 main events and contacts" width={902} height={1280} loading="lazy" className="h-auto w-full transition duration-700 group-hover:scale-[1.02]" />
          </a>
          <div>
            <SectionHeading eyebrow="Official poster" title="The case at a glance" intro="Eight main events, one day, one investigation. Save it, share it, send it to your class group." />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/animaux26-flyer.jpg" download="ANIMAUX26-poster.jpg" className="btn btn-gold"><Download size={16} /> Download poster</a>
              {s.brochureUrl && (
                <a href={s.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Open brochure <ExternalLink size={16} /></a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="paper py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading tone="paper" eyebrow="Getting here" title="Venue & directions" />
            <p className="mt-6 text-forest/85">{s.department}, {s.college}<br />{s.address}</p>
            <div className="mt-6 aspect-[4/3] overflow-hidden rounded-2xl border border-forest/15 bg-parchment">
              {s.mapEmbedUrl ? (
                <iframe src={s.mapEmbedUrl} title="Map to the venue" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full" />
              ) : (
                <div className="topo flex h-full flex-col items-center justify-center p-6 text-center text-forest/70">
                  <MapPin size={28} className="text-ember" />
                  <p className="mt-3 font-display text-xl text-forest">Map coming soon</p>
                  <p className="text-sm">Add a Google Maps embed link from Admin → Festival settings.</p>
                </div>
              )}
            </div>
            {s.mapLink && (
              <a href={s.mapLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-semibold text-ember hover:text-forest">
                Open in Google Maps <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div>
            <SectionHeading tone="paper" eyebrow="Ground rules" title="Participant guidelines" />
            <ol className="mt-6 space-y-3">
              {s.guidelines.map((g, i) => (
                <Reveal as="li" key={i} delay={i * 0.04} className="flex gap-4 border-b border-forest/10 pb-3 text-forest/85">
                  <span className="font-mono text-sm text-olive">{String(i + 1).padStart(2, "0")}</span>
                  {g}
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Don’t miss the window" title="Registration deadlines" />
          <ul className="mt-8 divide-y divide-ivory/10 rounded-2xl border border-ivory/10">
            {deadlines.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <Link href={`/events/${e.slug}`} className="font-medium hover:text-gold">{e.name}</Link>
                <span className={`flex shrink-0 items-center gap-2 font-mono text-xs ${e.status.open ? "text-gold" : "text-mist line-through"}`}>
                  <Hourglass size={12} /> {formatDateTime(e.deadline)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeading eyebrow="Latest" title="Announcements" />
          <ul className="mt-8 space-y-4">
            {announcements.map((a) => (
              <li key={a.id} className="card p-5">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-gold">{a.pinned && "● Pinned · "}{formatDate(a.publishedOn)}</p>
                <h3 className="mt-2 font-display text-xl">{a.title}</h3>
                <p className="mt-1 text-sm text-ivory/70">{a.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gold/30 bg-forest/40 p-5">
            <InstagramIcon className="h-8 w-8 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-display text-lg">Social updates</p>
              <p className="text-sm text-ivory/65">Reels, reveals and last-minute news land on Instagram first.</p>
            </div>
            {s.instagram ? (
              <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-gold py-2">Follow</a>
            ) : (
              <span className="text-xs text-mist">Link coming soon</span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
