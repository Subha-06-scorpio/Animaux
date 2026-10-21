import { cn } from "@/lib/utils";
import { BroadLeaf, Frond, Paw, rng } from "./motifs";

const PALETTES = [
  ["#16352a", "#0b110f", "#c4a46a"],
  ["#2a3320", "#101816", "#c76a37"],
  ["#1b2b26", "#0b110f", "#8b9a6b"],
  ["#30291c", "#101816", "#c4a46a"],
  ["#14302a", "#0b110f", "#dcc394"],
];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

/**
 * Illustrated stand-in for photos that haven't been uploaded yet.
 * Clearly labelled so nobody mistakes it for final artwork.
 */
export function PlaceholderArt({ seed, label = "Photo placeholder", className, compact, labelAt = "top" }: { seed: string; label?: string; className?: string; compact?: boolean; labelAt?: "top" | "bottom" }) {
  const h = hash(seed);
  const r = rng(h);
  const [a, b, accent] = PALETTES[Math.abs(h) % PALETTES.length];
  const variant = Math.abs(h) % 3;
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background: `radial-gradient(120% 90% at ${20 + r() * 60}% ${10 + r() * 30}%, ${a}, ${b})` }}
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-0 topo opacity-60" />
      {variant === 0 && <Frond seed={h} className="absolute -bottom-6 -left-10 w-[130%] rotate-[-8deg] text-night/80" />}
      {variant === 1 && <BroadLeaf className="absolute -right-6 -bottom-10 h-[110%] rotate-12 text-night/70" />}
      {variant === 2 && (
        <div className="absolute inset-0 flex items-center justify-center gap-5 rotate-[-20deg] opacity-40">
          {[0, 1, 2, 3].map((i) => (
            <Paw key={i} className="h-6 w-6" style={{ color: accent, transform: `translateY(${i % 2 ? 10 : -10}px) rotate(90deg)` }} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
      {!compact && (
        <span className={cn("absolute font-mono text-[0.6rem] uppercase tracking-[0.25em]", labelAt === "top" ? "left-3 top-3" : "bottom-3 right-3")} style={{ color: accent }}>
          ◦ {label}
        </span>
      )}
    </div>
  );
}
