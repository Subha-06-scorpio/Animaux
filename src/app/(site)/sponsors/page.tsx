import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors/sponsors-section";
import { PageHero } from "@/components/ui/section-heading";
import { getSettings, getSponsors } from "@/lib/queries";

export const metadata: Metadata = { title: "Sponsors", description: "The sponsors and partners backing ANIMAUX’26 — and how to partner with us." };

export default async function SponsorsPage() {
  const [s, sponsors] = await Promise.all([getSettings(), getSponsors()]);
  return (
    <>
      <PageHero
        eyebrow="Backing the investigation"
        title={<>Our <em className="text-gold">sponsors</em> &amp; partners</>}
        intro="ANIMAUX’26 is powered by partners who believe every species deserves a future. Thank you for backing the Survival Files."
      />
      <SponsorsSection sponsors={sponsors} s={s} hideHeading />
    </>
  );
}
