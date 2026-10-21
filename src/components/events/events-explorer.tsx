"use client";

import { AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Paw } from "@/components/art/motifs";
import type { PublicEvent } from "@/lib/queries";
import { CATEGORY_LABELS, EVENT_CATEGORIES, type EventCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EventCard } from "./event-card";
import { RegistrationDialog } from "./registration-dialog";

export function EventsExplorer({ events }: { events: PublicEvent[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const initialCat = params.get("category") as EventCategory | null;
  const [category, setCategory] = useState<EventCategory | "all">(initialCat && EVENT_CATEGORIES.includes(initialCat) ? initialCat : "all");
  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [participation, setParticipation] = useState<"all" | "individual" | "team">("all");

  // ?register=<slug> deep-links straight into the registration form.
  const registerSlug = params.get("register");
  const active = events.find((e) => e.slug === registerSlug && e.status.open) ?? null;
  // Native history updates keep useSearchParams in sync without a server round trip.
  const openReg = (e: PublicEvent) => window.history.pushState(null, "", `${pathname}?register=${e.slug}`);
  const closeReg = useCallback(() => window.history.replaceState(null, "", pathname), [pathname]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events.filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (participation === "all" || e.participation === participation) &&
        (!onlyOpen || e.status.open) &&
        (!s || `${e.name} ${e.shortDescription} ${e.venue}`.toLowerCase().includes(s)),
    );
  }, [events, q, category, onlyOpen, participation]);

  const counts = useMemo(() => Object.fromEntries(EVENT_CATEGORIES.map((c) => [c, events.filter((e) => e.category === c).length])), [events]);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-y border-ivory/10 bg-night/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border lg:top-20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search events</span>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, venues…" className="field rounded-full py-2.5 pl-11" type="search" />
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0" role="group" aria-label="Filter by category">
            {(["all", ...EVENT_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition",
                  category === c ? "border-gold bg-gold text-midnight" : "border-ivory/15 text-ivory/80 hover:border-gold/60",
                )}
              >
                {c === "all" ? `All · ${events.length}` : `${CATEGORY_LABELS[c]} · ${counts[c]}`}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ivory/75">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-[#C4A46A]" /> Open for registration only
          </label>
          <label className="flex items-center gap-2">
            Format
            <select value={participation} onChange={(e) => setParticipation(e.target.value as typeof participation)} className="rounded-full border border-ivory/15 bg-night px-3 py-1">
              <option value="all">Any</option>
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </label>
          <span className="ml-auto font-mono tracking-widest text-mist" aria-live="polite">{filtered.length} FOUND</span>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} onRegister={openReg} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <Paw className="h-10 w-10 text-gold/50" />
          <p className="mt-4 font-display text-2xl">No tracks found.</p>
          <p className="mt-2 text-ivory/60">Try a different search or category.</p>
          <button type="button" onClick={() => { setQ(""); setCategory("all"); setOnlyOpen(false); setParticipation("all"); }} className="btn btn-ghost mt-6">
            <X size={14} /> Clear filters
          </button>
        </div>
      )}

      <AnimatePresence>{active && <RegistrationDialog key={active.id} event={active} onClose={closeReg} />}</AnimatePresence>
    </>
  );
}
