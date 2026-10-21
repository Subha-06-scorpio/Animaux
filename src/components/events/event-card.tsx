"use client";

import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, Clock, IndianRupee, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { PlaceholderArt } from "@/components/art/placeholder";
import type { PublicEvent } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/types";
import { cn, formatDate, formatFee, formatTime, participationLabel } from "@/lib/utils";

export function StatusPill({ status, className }: { status: PublicEvent["status"]; className?: string }) {
  return (
    <span className={cn("tag", status.open ? "border-gold/50 bg-night/70 text-gold" : "border-ivory/20 bg-night/80 text-mist", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status.open ? "bg-gold animate-pulse" : "bg-mist")} />
      {status.label}
    </span>
  );
}

export function EventCard({ event, onRegister, index = 0 }: { event: PublicEvent; onRegister: (e: PublicEvent) => void; index?: number }) {
  const singular = CATEGORY_LABELS[event.category].replace(/s$/, "").replace("Quizze", "Quiz");
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05 }}
      className="group card relative flex flex-col overflow-hidden transition-colors hover:border-gold/40"
    >
      <Link href={`/events/${event.slug}`} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden>
        {event.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.posterUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full transition duration-700 group-hover:scale-105">
            <PlaceholderArt seed={event.slug} label="Poster placeholder" labelAt="bottom" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-midnight to-transparent" />
      </Link>
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span className="tag border-ivory/25 bg-night/70 text-ivory backdrop-blur">{singular}</span>
        {event.isSample && <span className="tag border-ember/60 bg-night/70 text-ember-bright backdrop-blur">Sample</span>}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-2">
        <StatusPill status={event.status} className="mb-3 self-start" />
        <h3 className="font-display text-2xl leading-tight">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-gold focus:outline-none">
            {event.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ivory/70">{event.shortDescription}</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-ivory/75">
          <div className="flex items-center gap-2"><CalendarDays size={14} className="text-gold" /><dt className="sr-only">Date</dt><dd>{formatDate(event.eventDate, { day: "numeric", month: "short" })}</dd></div>
          <div className="flex items-center gap-2"><Clock size={14} className="text-gold" /><dt className="sr-only">Time</dt><dd>{formatTime(event.startTime) || "TBA"}</dd></div>
          <div className="col-span-2 flex items-center gap-2"><MapPin size={14} className="shrink-0 text-gold" /><dt className="sr-only">Venue</dt><dd className="truncate">{event.venue}</dd></div>
          <div className="flex items-center gap-2"><Users size={14} className="text-gold" /><dt className="sr-only">Participation</dt><dd>{participationLabel(event)}</dd></div>
          <div className="flex items-center gap-2"><IndianRupee size={14} className="text-gold" /><dt className="sr-only">Fee</dt><dd>{formatFee(event.fee)}</dd></div>
        </dl>
        <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
          Deadline · {formatDate(event.deadline, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
        </p>
        <div className="relative z-10 mt-6 flex items-center gap-3 pt-1">
          <button type="button" onClick={() => onRegister(event)} disabled={!event.status.open} className={cn("btn flex-1 py-2.5", event.status.open ? "btn-primary" : "cursor-not-allowed border border-ivory/15 text-mist")}>
            {event.status.open ? "Register Now" : event.status.label}
          </button>
          <Link href={`/events/${event.slug}`} className="btn btn-ghost px-3 py-2.5" aria-label={`Details for ${event.name}`}>
            Details <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
