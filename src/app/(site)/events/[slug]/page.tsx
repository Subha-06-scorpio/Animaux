import { ArrowLeft, CalendarDays, Clock, Hourglass, IndianRupee, Mail, MapPin, Phone, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Paw } from "@/components/art/motifs";
import { PlaceholderArt } from "@/components/art/placeholder";
import { StatusPill } from "@/components/events/event-card";
import { RegisterButton } from "@/components/events/event-grid";
import { WhatsAppIcon } from "@/components/ui/icons";
import { getPublicEvent } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatDate, formatDateTime, formatFee, formatTime, isPlaceholder, participationLabel, telLink, whatsappLink } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const ev = await getPublicEvent((await params).slug);
  return ev ? { title: ev.name, description: ev.shortDescription } : { title: "Event not found" };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const ev = await getPublicEvent((await params).slug);
  if (!ev) notFound();

  const digits = ev.coordinatorPhone.replace(/\D/g, "");
  const realPhone = !isPlaceholder(ev.coordinatorPhone) && digits.length >= 10;
  const facts = [
    { icon: CalendarDays, k: "Date", v: formatDate(ev.eventDate, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) },
    { icon: Clock, k: "Time", v: ev.startTime ? `${formatTime(ev.startTime)}${ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}` : "TBA" },
    { icon: MapPin, k: "Venue", v: ev.venue },
    { icon: Users, k: "Participation", v: participationLabel(ev) },
    { icon: IndianRupee, k: "Registration fee", v: formatFee(ev.fee) },
    { icon: Hourglass, k: "Register by", v: formatDateTime(ev.deadline) },
  ];

  return (
    <article>
      <header className="relative overflow-hidden bg-forest pt-28 pb-14 sm:pt-36">
        <div className="absolute inset-0 opacity-40">
          {ev.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ev.posterUrl} alt="" className="h-full w-full object-cover blur-sm" />
          ) : (
            <PlaceholderArt seed={ev.slug} compact />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-ivory/70 hover:text-gold">
            <ArrowLeft size={16} /> All events
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="tag border-ivory/25 text-ivory">{CATEGORY_LABELS[ev.category]}</span>
            {ev.isSample && <span className="tag border-ember/60 text-ember-bright">Sample event — details to be confirmed</span>}
            <StatusPill status={ev.status} />
          </div>
          <h1 className="display mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{ev.name}</h1>
          <p className="mt-5 max-w-2xl text-lg text-ivory/80">{ev.shortDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <RegisterButton event={ev} />
            <a href="#coordinator" className="btn btn-ghost">Contact coordinator</a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <section>
            <h2 className="eyebrow">The brief</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ivory/85">{ev.description}</p>
          </section>
          {ev.rules.length > 0 && (
            <section>
              <h2 className="eyebrow">Rules</h2>
              <ol className="mt-5 space-y-3">
                {ev.rules.map((r, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-ivory/10 bg-night/40 p-4">
                    <span className="font-mono text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-ivory/85">{r}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section>
            <h2 className="eyebrow">Eligibility</h2>
            <p className="mt-4 text-ivory/85">{ev.eligibility || "Open to all students."}</p>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <div className="card p-6 lg:sticky lg:top-24">
            <p className="eyebrow">Event dossier</p>
            <dl className="mt-5 divide-y divide-ivory/10">
              {facts.map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-start gap-4 py-3.5">
                  <Icon size={18} className="mt-0.5 shrink-0 text-gold" />
                  <dt className="w-32 shrink-0 text-sm text-mist">{k}</dt>
                  <dd className="text-sm text-ivory">{v}</dd>
                </div>
              ))}
              {ev.capacity && (
                <div className="flex items-start gap-4 py-3.5">
                  <Paw className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" />
                  <dt className="w-32 shrink-0 text-sm text-mist">Capacity</dt>
                  <dd className="text-sm text-ivory">{ev.capacity} {ev.participation === "team" ? "teams" : "participants"}</dd>
                </div>
              )}
            </dl>
            <RegisterButton event={ev} className={ev.status.open ? "btn btn-primary mt-6 w-full" : "btn mt-6 w-full cursor-not-allowed border border-ivory/15 text-mist"} />

            <div id="coordinator" className="mt-8 scroll-mt-28 border-t border-ivory/10 pt-6">
              <p className="eyebrow">Event coordinator</p>
              <p className="mt-3 font-display text-xl">{ev.coordinatorName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {realPhone ? (
                  <>
                    <a href={telLink(ev.coordinatorPhone)} className="tag border-ivory/20 py-2 hover:border-gold hover:text-gold"><Phone size={12} /> {ev.coordinatorPhone}</a>
                    <a href={whatsappLink(digits.length === 10 ? `91${digits}` : digits, `Hi! I have a question about ${ev.name} at ANIMAUX 2026.`)} target="_blank" rel="noopener noreferrer" className="tag border-ivory/20 py-2 hover:border-gold hover:text-gold"><WhatsAppIcon className="h-3 w-3" /> WhatsApp</a>
                  </>
                ) : (
                  <span className="tag border-ivory/15 py-2 text-mist"><Phone size={12} /> {ev.coordinatorPhone} (placeholder)</span>
                )}
                {ev.coordinatorEmail && (
                  <a href={`mailto:${ev.coordinatorEmail}?subject=${encodeURIComponent(ev.name)}`} className="tag border-ivory/20 py-2 hover:border-gold hover:text-gold"><Mail size={12} /> {ev.coordinatorEmail}</a>
                )}
              </div>
              <p className="mt-4 text-xs text-mist">
                Or send a message through the <Link href="/contact" className="underline hover:text-gold">help desk</Link>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
