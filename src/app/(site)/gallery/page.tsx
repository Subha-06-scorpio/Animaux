import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { PageHero } from "@/components/ui/section-heading";
import { getVisible } from "@/lib/queries";

export const metadata: Metadata = { title: "The Wild Gallery", description: "Photos, reels and behind-the-scenes moments from ANIMAUX 2026 and previous editions." };

export default async function GalleryPage() {
  const items = await getVisible("gallery");
  return (
    <>
      <PageHero eyebrow="The Wild Gallery" title={<>A documentary of <em className="text-gold">us</em>.</>} intro="Late-night poster sessions, first meetings, evidence boards, reels and the moments in between — the making of ANIMAUX 2026, frame by frame.">
        {items.some((i) => i.isSample) && <p className="mt-6 text-sm text-mist">Illustrated frames are placeholders — real photos and videos will appear here as they are uploaded.</p>}
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <GalleryExplorer items={items} />
      </section>
    </>
  );
}
