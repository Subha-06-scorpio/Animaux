import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/** Deterministic PRNG so server and client render identical "random" art. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Paw({ className, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className={className} {...p}>
      <ellipse cx="16" cy="21.5" rx="7" ry="6" />
      <ellipse cx="7.5" cy="13" rx="2.6" ry="3.4" transform="rotate(-18 7.5 13)" />
      <ellipse cx="12.8" cy="8" rx="2.6" ry="3.6" transform="rotate(-6 12.8 8)" />
      <ellipse cx="19.2" cy="8" rx="2.6" ry="3.6" transform="rotate(6 19.2 8)" />
      <ellipse cx="24.5" cy="13" rx="2.6" ry="3.4" transform="rotate(18 24.5 13)" />
    </svg>
  );
}

/** A diagonal trail of paw prints used as a section transition. */
export function FootprintTrail({ className, steps = 7 }: { className?: string; steps?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none flex items-center justify-center gap-6 py-8", className)}>
      {Array.from({ length: steps }, (_, i) => (
        <Paw
          key={i}
          className="h-4 w-4 text-gold/40"
          style={{ transform: `rotate(90deg) translateX(${i % 2 ? 7 : -7}px)`, opacity: 0.25 + (i / steps) * 0.75 }}
        />
      ))}
    </div>
  );
}

export function Fingerprint({ className }: { className?: string }) {
  const r = rng(7);
  return (
    <svg viewBox="0 0 200 240" fill="none" aria-hidden className={className}>
      {Array.from({ length: 16 }, (_, i) => {
        const rx = 10 + i * 5.6;
        const ry = 14 + i * 6.6;
        const c = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
        const gap = 6 + r() * 26;
        return (
          <ellipse
            key={i}
            cx="100"
            cy="125"
            rx={rx}
            ry={ry}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray={`${c * (0.2 + r() * 0.5)} ${gap} ${c * 0.25} ${gap * 1.6}`}
            strokeDashoffset={r() * c}
            transform={`rotate(${-8 + r() * 16} 100 125)`}
            opacity={0.55 + r() * 0.45}
          />
        );
      })}
    </svg>
  );
}

export function Helix({ className, turns = 3 }: { className?: string; turns?: number }) {
  const W = 120;
  const H = 60 * turns * 2;
  const pts = (phase: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const y = (i / 120) * H;
      const x = W / 2 + Math.sin((y / H) * turns * 2 * Math.PI + phase) * (W / 2 - 8);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join("");
  const rungs = Array.from({ length: turns * 8 }, (_, i) => {
    const y = ((i + 0.5) / (turns * 8)) * H;
    const a = (y / H) * turns * 2 * Math.PI;
    return { y, x1: W / 2 + Math.sin(a) * (W / 2 - 8), x2: W / 2 + Math.sin(a + Math.PI) * (W / 2 - 8), d: Math.cos(a) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden className={className}>
      {rungs.map((r, i) => (
        <line key={i} x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke="currentColor" strokeOpacity={0.25 + Math.abs(r.d) * 0.35} strokeWidth="1.5" />
      ))}
      <path d={pts(0)} stroke="currentColor" strokeWidth="2.5" />
      <path d={pts(Math.PI)} stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.6" />
    </svg>
  );
}

/** Procedural palm/fern frond silhouette. */
export function Frond({
  length = 320,
  leaflets = 16,
  curve = 0.35,
  seed = 1,
  className,
}: {
  length?: number;
  leaflets?: number;
  curve?: number;
  seed?: number;
  className?: string;
}) {
  const r = rng(seed);
  const spine = (t: number) => ({ x: t * length, y: Math.sin(t * Math.PI * 0.9) * -length * curve * 0.4 + t * t * length * curve * 0.5 });
  const leaves = [];
  for (let i = 1; i <= leaflets; i++) {
    const t = i / (leaflets + 1);
    const p = spine(t);
    const q = spine(t + 0.01);
    const base = Math.atan2(q.y - p.y, q.x - p.x);
    const len = length * 0.32 * Math.sin(Math.PI * (0.15 + t * 0.85)) * (0.85 + r() * 0.3);
    for (const side of [-1, 1]) {
      const a = base + side * (0.95 - t * 0.35) + (r() - 0.5) * 0.15;
      const tip = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };
      const w = len * 0.16;
      const nx = Math.cos(a + Math.PI / 2) * w;
      const ny = Math.sin(a + Math.PI / 2) * w;
      const m = { x: (p.x + tip.x) / 2, y: (p.y + tip.y) / 2 + len * 0.08 };
      leaves.push(
        `M${p.x.toFixed(1)} ${p.y.toFixed(1)}Q${(m.x + nx).toFixed(1)} ${(m.y + ny).toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}Q${(m.x - nx).toFixed(1)} ${(m.y - ny).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}Z`,
      );
    }
  }
  const spinePath = Array.from({ length: 30 }, (_, i) => {
    const p = spine(i / 29);
    return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join("");
  return (
    <svg viewBox={`-20 ${-length * 0.55} ${length + 40} ${length * 1.1}`} aria-hidden className={className}>
      <path d={leaves.join("")} fill="currentColor" />
      <path d={spinePath} stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}

/** Broad tropical leaf silhouette (pointed tip) with veins cut out. */
export function BroadLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 380" aria-hidden className={className}>
      <path fill="currentColor" d="M97 380l2-82C42 288 2 222 8 150 14 82 62 34 100 0c38 34 86 82 92 150 6 72-34 138-91 148l2 82z" />
      <g stroke="#0b110f" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M100 296Q98 150 100 14" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 270 - i * 27;
          const spread = Math.sin(((i + 1) / 10) * Math.PI) * 78 + 8;
          return (
            <g key={i}>
              <path d={`M100 ${y}Q${100 - spread * 0.5} ${y - 14} ${100 - spread} ${y - 40}`} />
              <path d={`M100 ${y}Q${100 + spread * 0.5} ${y - 14} ${100 + spread} ${y - 40}`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function Feather({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={className}>
      <path d="M50 6C30 10 16 26 14 50l-4 8" />
      <path d="M50 6c2 18-10 36-34 42" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${18 + i * 4.5} ${44 - i * 5.5}l${8 - i * 0.4} ${-2 + i * 0.4}`} />
      ))}
    </svg>
  );
}

/** Small abstract field-guide glyphs for species cards. */
export function SpeciesGlyph({ kind, className }: { kind: string; className?: string }) {
  const s = { stroke: "currentColor", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };
  const g: Record<string, React.ReactNode> = {
    stripe: [0, 1, 2, 3, 4].map((i) => <path key={i} {...s} d={`M${12 + i * 10} 10q${6 + (i % 2) * 4} 20 -2 44`} />),
    scale: [0, 1, 2].flatMap((row) =>
      [0, 1, 2, 3].map((c) => <path key={`${row}${c}`} {...s} d={`M${8 + c * 12 + (row % 2) * 6} ${18 + row * 12}q6 10 12 0`} />),
    ),
    feather: <Feather className="h-full w-full" />,
    snout: <path {...s} d="M6 34h40q12 0 12-4t-12-4H6M46 26q8-6 12 4" />,
    tail: [0, 1, 2, 3].map((i) => <path key={i} {...s} strokeWidth={i % 2 ? 5 : 2} strokeOpacity={i % 2 ? 0.5 : 1} d={`M${10 + i * 11} 54q-4-22 ${10 + i * 4}-44`} />),
    mane: Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <path key={i} {...s} d={`M${32 + Math.cos(a) * 10} ${32 + Math.sin(a) * 10}L${32 + Math.cos(a) * 24} ${32 + Math.sin(a) * 24}`} />;
    }),
    tusk: <path {...s} d="M10 12q0 34 26 42q10 3 18-2M18 12q2 26 20 32" />,
    rosette: [
      [16, 18], [40, 14], [28, 34], [50, 40], [14, 46],
    ].map(([x, y], i) => <path key={i} {...s} d={`M${x - 6} ${y}a6 6 0 1 1 3 5`} />),
  };
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      {g[kind] ?? g.stripe}
    </svg>
  );
}
