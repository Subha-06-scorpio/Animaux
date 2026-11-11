"use client";

import { motion } from "motion/react";
import { createElement } from "react";
import {
  ArrowUpRight, Brain, Camera, CalendarDays, Clock, Eye, Fingerprint, Flame, Footprints, IndianRupee, Lightbulb,
  MapPin, Palette, PencilLine, Search, Target, Users, Waves, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { PublicEvent } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/types";
import { capacityLabel, cn, formatDate, formatFee, formatTime, participationLabel } from "@/lib/utils";

/** Evidence icon per event (falls back by category) — used where there is no poster image. */
const ICONS: Record<string, LucideIcon> = {
  "the-last-trace": Footprints,
  "trace-evidence-relay": Fingerprint,
  "wild-shark-tank": Lightbulb,
  "the-poachers-tale": Flame,
  "flood-zone": Waves,
  "7-steps": Footprints,
  "shutter-safari": Camera,
  "strokes-of-wild": Palette,
  "wildlife-pictionary": PencilLine,
  "wild-aim": Target,
  "wild-eye": Eye,
  "fingerprint-paintings": Fingerprint,
  "who-am-i": Search,
  "memory-game": Brain,
};
const BY_CATEGORY: Record<string, LucideIcon> = { competition: Search, workshop: Brain, quiz: Brain, creative: Palette, game: Target };
export const eventIcon = (e: Pick<PublicEvent, "slug" | "category">) => ICONS[e.slug] ?? BY_CATEGORY[e.category] ?? Search;

/** Renders the evidence icon for an event (static lookup, not a component created per render). */
export function EventIcon({ event, ...props }: { event: Pick<PublicEvent, "slug" | "category">; className?: string; strokeWidth?: number }) {
  return createElement(eventIcon(event), props);
}

export function StatusPill({ status, className }: { status: PublicEvent["status"]; className?: string }) {
  const walkin = !status.open && status.reason === "walkin";
  return (
    <span className={cn("tag", status.open ? "border-gold/50 bg-night/70 text-gold" : walkin ? "border-moss/50 bg-night/70 text-moss" : "border-ivory/20 bg-night/80 text-mist", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status.open ? "bg-gold animate-pulse" : walkin ? "bg-moss" : "bg-mist")} />
      {status.label}
    </span>
  );
}

export function EventCard({ event, onRegister, index = 0, number }: { event: PublicEvent; onRegister: (e: PublicEvent) => void; index?: number; number?: number }) {
  const singular = CATEGORY_LABELS[event.category].replace(/s$/, "").replace("Quizze", "Quiz");
  const mini = event.tier === "mini";
  const limit = capacityLabel(event);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05 }}
      className="group card relative flex flex-col overflow-hidden transition-colors hover:border-gold/40"
    >
      {/* Case-file header: poster if uploaded, otherwise numeral + evidence icon (flyer style) */}
      <Link href={`/events/${event.slug}`} className={cn("relative block overflow-hidden border-b border-ivory/10", mini ? "aspect-[16/6]" : "aspect-[16/8]")} tabIndex={-1} aria-hidden>
        {event.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.posterUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="relative h-full w-full bg-[radial-gradient(120%_120%_at_85%_20%,#3a2a1b,#17110c_70%)]">
            <div className="topo absolute inset-0 opacity-80" />
            <EventIcon event={event} strokeWidth={1.1} className="absolute -right-4 top-1/2 h-[120%] w-auto -translate-y-1/2 text-gold/15 transition duration-700 group-hover:scale-110 group-hover:text-gold/25" />
            {number !== undefined && (
              <span className="absolute bottom-2 left-5 font-title text-6xl leading-none text-gold-soft/90 sm:text-7xl">{number}.</span>
            )}
          </div>
        )}
      </Link>
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span className="tag border-ivory/25 bg-night/70 text-ivory backdrop-blur">{mini ? "Mini event" : singular}</span>
        {event.isSample && <span className="tag border-ember/60 bg-night/70 text-ember-bright backdrop-blur">Sample</span>}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-4">
        <StatusPill status={event.status} className="mb-3 self-start" />
        <h3 className="font-display text-2xl leading-tight">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-gold focus:outline-none">
            {event.name}
          </Link>
        </h3>
        {event.tagline && <p className="mt-1 font-display text-sm italic text-gold/90">{event.tagline}</p>}
        <p className="mt-2 line-clamp-3 text-sm text-ivory/70">{event.shortDescription}</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-ivory/75">
          <div className="flex items-center gap-2"><Users size={14} className="shrink-0 text-gold" /><dt className="sr-only">Participation</dt><dd>{participationLabel(event)}</dd></div>
          {limit ? (
            <div className="flex items-center gap-2 font-semibold text-gold-soft"><Users size={14} className="shrink-0 text-ember-bright" /><dt className="sr-only">Limit</dt><dd>{limit}</dd></div>
          ) : (
            <div className="flex items-center gap-2"><IndianRupee size={14} className="shrink-0 text-gold" /><dt className="sr-only">Fee</dt><dd>Fee: {formatFee(event.fee)}</dd></div>
          )}
          <div className="flex items-center gap-2"><CalendarDays size={14} className="shrink-0 text-gold" /><dt className="sr-only">Date</dt><dd>{formatDate(event.eventDate, { day: "numeric", month: "short" })}</dd></div>
          <div className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-gold" /><dt className="sr-only">Time</dt><dd>{formatTime(event.startTime) || "Time TBA"}</dd></div>
          <div className="col-span-2 flex items-center gap-2"><MapPin size={14} className="shrink-0 text-gold" /><dt className="sr-only">Venue</dt><dd className="truncate">{event.venue}</dd></div>
        </dl>
        {!mini && (
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
            Register by {formatDate(event.deadline, { day: "numeric", month: "short" })}
          </p>
        )}
        <div className="relative z-10 mt-auto flex items-center gap-3 pt-6">
          {mini ? (
            <span className="btn flex-1 cursor-default border border-moss/40 py-2.5 text-moss">Walk in on 2 Dec</span>
          ) : (
            <button type="button" onClick={() => onRegister(event)} disabled={!event.status.open} className={cn("btn flex-1 whitespace-nowrap px-4 py-2.5", event.status.open ? "btn-primary" : "cursor-not-allowed border border-ivory/15 text-mist")}>
              {event.status.open ? "Register Now" : event.status.label}
            </button>
          )}
          <Link href={`/events/${event.slug}`} className="btn btn-ghost whitespace-nowrap px-3 py-2.5" aria-label={`Details for ${event.name}`}>
            Details <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
