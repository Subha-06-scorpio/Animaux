import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsExplorer } from "@/components/events/events-explorer";
import { PageHero } from "@/components/ui/section-heading";
import { getPublicEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Events",
  description: "Competitions, workshops, quizzes, creative challenges and games at ANIMAUX 2026. Search, filter and register online.",
};

export default async function EventsPage() {
  const events = await getPublicEvents();
  const hasSample = events.some((e) => e.isSample);
  return (
    <>
      <PageHero
        eyebrow="Open case files · 2 December 2026"
        title={<>Choose your <em className="text-gold">case</em>.</>}
        intro="Six main events — investigations, challenges and creative missions. Read the brief, check the rules and register in under two minutes, solo or as a team."
      >
        {hasSample && (
          <p className="mt-6 inline-block rounded-xl border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ivory/85">
            Events marked <strong className="text-ember-bright">Sample</strong> are placeholders — final names, rules, fees and timings will be announced.
          </p>
        )}
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Suspense>
          <EventsExplorer events={events} />
        </Suspense>
      </section>
    </>
  );
}
