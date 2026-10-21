import { cn } from "@/lib/utils";

/**
 * Crime-scene barrier tape. Purely decorative unless `label` is given
 * (then the text is exposed once to screen readers).
 */
export function CrimeTape({ items, className, reverse, tone = "gold", label }: { items: string[]; className?: string; reverse?: boolean; tone?: "gold" | "ember"; label?: string }) {
  const run = [...items, ...items, ...items, ...items];
  return (
    <div className={cn("relative overflow-hidden border-y-2 border-night py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]", tone === "gold" ? "bg-gold text-night" : "bg-ember text-night", className)} aria-label={label} role={label ? "marquee" : undefined}>
      {label && <ul className="sr-only">{items.map((t) => <li key={t}>{t}</li>)}</ul>}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(-45deg,#0b110f_0_8px,transparent_8px_16px)] opacity-80" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-[repeating-linear-gradient(-45deg,#0b110f_0_8px,transparent_8px_16px)] opacity-80" />
      <div aria-hidden className={cn("flex w-max animate-marquee gap-8 whitespace-nowrap py-1 pr-8 hover:[animation-play-state:paused]", reverse && "[animation-direction:reverse]")}>
        {run.map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-mono text-xs font-semibold uppercase tracking-[0.3em]">
            {t}
            <span className="text-[0.6rem]">▲</span>
          </span>
        ))}
      </div>
    </div>
  );
}
