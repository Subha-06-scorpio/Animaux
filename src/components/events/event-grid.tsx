"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { PublicEvent } from "@/lib/queries";
import { EventCard } from "./event-card";
import { RegistrationDialog } from "./registration-dialog";

/** Plain grid of event cards with an inline registration dialog. */
export function EventGrid({ events, className }: { events: PublicEvent[]; className?: string }) {
  const [active, setActive] = useState<PublicEvent | null>(null);
  return (
    <>
      <div className={className ?? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
        {events.map((e, i) => (
          <EventCard key={e.id} event={e} index={i} onRegister={setActive} />
        ))}
      </div>
      <AnimatePresence>{active && <RegistrationDialog key={active.id} event={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </>
  );
}

/** Single register button (event detail page). */
export function RegisterButton({ event, className }: { event: PublicEvent; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" disabled={!event.status.open} onClick={() => setOpen(true)} className={className ?? (event.status.open ? "btn btn-primary" : "btn cursor-not-allowed border border-ivory/15 text-mist")}>
        {event.status.open ? "Register Now" : event.status.label}
      </button>
      <AnimatePresence>{open && <RegistrationDialog event={event} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
