import type { Announcement } from "@/lib/types";
import { Paw } from "@/components/art/motifs";

/** Slow announcement marquee under the hero. Duplicated once for a seamless loop. */
export function Ticker({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  const row = items.map((a) => a.title);
  return (
    <div className="relative overflow-hidden border-y border-gold/20 bg-forest py-3" aria-label="Announcements">
      <ul className="sr-only">{row.map((t) => <li key={t}>{t}</li>)}</ul>
      <div aria-hidden className="flex w-max animate-marquee gap-10 whitespace-nowrap pr-10 hover:[animation-play-state:paused]">
        {[...row, ...row, ...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.25em] text-gold-soft">
            {t}
            <Paw className="h-3 w-3 text-ember" />
          </span>
        ))}
      </div>
    </div>
  );
}
