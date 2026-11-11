import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsExplorer } from "@/components/events/events-explorer";
import { PageHero } from "@/components/ui/section-heading";
import { getPublicEvents } from "@/lib/queries";

export const metadata: Metadata = { title: "Register", description: "Register for ANIMAUX 2026 events — no account needed." };

const STEPS = [
  ["01", "Choose an event", "Use search or the category filters."],
  ["02", "Fill the short form", "Add your team if it’s a team event."],
  ["03", "Get your ID", "A unique registration ID, instantly."],
];

export default async function RegisterPage() {
  const events = await getPublicEvents();
  return (
    <>
      <PageHero eyebrow="Registration desk" title={<>Open your <em className="text-gold">case file</em>.</>} intro="Name, college, year, contact number — that’s it. No account needed. Register for as many main events as you like; the form remembers your details on this device.">
        <ol className="mt-10 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="rounded-2xl border border-ivory/10 bg-night/40 p-5">
              <span className="font-mono text-xs tracking-[0.3em] text-gold">{n}</span>
              <p className="mt-2 font-display text-xl">{t}</p>
              <p className="text-sm text-ivory/60">{d}</p>
            </li>
          ))}
        </ol>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Suspense>
          <EventsExplorer events={events} />
        </Suspense>
      </section>
    </>
  );
}
