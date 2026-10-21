"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ScheduleItem } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

const KIND: Record<ScheduleItem["kind"], string> = {
  ceremony: "border-gold/60 text-gold",
  event: "border-ember/60 text-ember-bright",
  break: "border-ivory/20 text-mist",
  other: "border-olive text-moss",
};

export function Timeline({ items, dayLabels }: { items: ScheduleItem[]; dayLabels: Record<number, string> }) {
  const days = [...new Set(items.map((i) => i.day))].sort((a, b) => a - b);
  const [day, setDay] = useState(days[0] ?? 1);
  const list = items.filter((i) => i.day === day).sort((a, b) => a.time.localeCompare(b.time) || a.sortOrder - b.sortOrder);

  if (!items.length) return <p className="text-ivory/60">The schedule will be published soon.</p>;

  return (
    <div>
      <div role="tablist" aria-label="Festival days" className="inline-flex rounded-full border border-ivory/15 bg-night/60 p-1">
        {days.map((d) => (
          <button key={d} role="tab" aria-selected={day === d} type="button" onClick={() => setDay(d)} className={cn("relative rounded-full px-5 py-2.5 text-sm font-semibold transition", day === d ? "text-midnight" : "text-ivory/75 hover:text-gold")}>
            {day === d && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", damping: 26, stiffness: 300 }} />}
            <span className="relative">
              Day {d}
              {dayLabels[d] && <span className="ml-2 font-normal opacity-75">{dayLabels[d]}</span>}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ol key={day} role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="relative mt-10 space-y-4 before:absolute before:left-[5.25rem] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-gold/60 before:via-ivory/15 before:to-transparent sm:before:left-[7.5rem]">
          {list.map((it) => (
            <li key={it.id} className="relative flex gap-6 sm:gap-10">
              <div className="w-[4.5rem] shrink-0 pt-4 text-right sm:w-24">
                <p className="font-mono text-sm text-ivory">{formatTime(it.time)}</p>
                {it.endTime && <p className="font-mono text-[0.65rem] text-mist">to {formatTime(it.endTime)}</p>}
              </div>
              <span aria-hidden className={cn("absolute left-[5.25rem] top-5 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-midnight sm:left-[7.5rem]", it.kind === "break" ? "border-mist" : "border-gold")} />
              <div className={cn("flex-1 rounded-2xl border p-4 sm:p-5", it.kind === "break" ? "border-dashed border-ivory/10 bg-transparent" : "border-ivory/10 bg-night/50")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("tag", KIND[it.kind])}>{it.kind}</span>
                </div>
                <h3 className="mt-2 font-display text-xl">{it.title}</h3>
                {it.venue && <p className="mt-1 flex items-center gap-1.5 text-sm text-ivory/65"><MapPin size={13} className="text-gold" /> {it.venue}</p>}
                {it.eventSlug && (
                  <Link href={`/events/${it.eventSlug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:text-ember-bright">
                    Event details & registration <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </motion.ol>
      </AnimatePresence>
    </div>
  );
}
