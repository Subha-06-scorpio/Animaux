import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BroadLeaf, Frond, Paw, rng } from "@/components/art/motifs";
import type { FestivalSettings } from "@/lib/types";
import { festivalDateLabel } from "@/lib/utils";
import { Countdown } from "./countdown";
import { HeroTitle, HudClock } from "./hero-client";

const r = rng(2026);
const FIREFLIES = Array.from({ length: 28 }, () => ({
  left: `${r() * 100}%`,
  top: `${35 + r() * 60}%`,
  size: 2 + r() * 3,
  delay: `${-r() * 14}s`,
  dur: `${10 + r() * 10}s`,
  dx: `${(r() - 0.5) * 120}px`,
  o: 0.4 + r() * 0.6,
}));

const EYES = [
  { left: "9%", top: "58%", delay: "0s", scale: 1 },
  { left: "86%", top: "48%", delay: "2.6s", scale: 0.8 },
  { left: "72%", top: "78%", delay: "4.9s", scale: 0.6 },
];

function Corner({ className }: { className: string }) {
  return <span aria-hidden className={`absolute h-8 w-8 border-gold/60 ${className}`} />;
}

export function Hero({ s }: { s: FestivalSettings }) {
  const dateLine = festivalDateLabel(s);

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-night" aria-labelledby="hero-title">
      {/* Sky + moonlight */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_10%,rgba(207,169,107,0.22),transparent_60%),radial-gradient(70%_70%_at_20%_100%,rgba(122,100,64,0.35),transparent_70%),linear-gradient(180deg,#0e0a07_0%,#2a1e14_55%,#0e0a07_100%)]" />
      <div aria-hidden className="topo absolute inset-0 opacity-50" />

      {/* Moon */}
      <div aria-hidden className="absolute right-[-12rem] top-[6%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(243,232,210,0.20),rgba(207,169,107,0.10)_45%,transparent_70%)] sm:right-[-4rem] lg:right-[6%]" />
      <div aria-hidden className="absolute right-[-6rem] top-[16%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_45%_40%,#efe6cf,#c9b282_60%,#8f7a4f)] opacity-[0.16] blur-[1px] sm:right-[2rem] lg:right-[14%]" />
      <Frond seed={14} length={420} className="pointer-events-none absolute right-[-8rem] top-[24%] w-[30rem] -scale-x-100 rotate-[14deg] animate-sway text-night/95 [animation-delay:-1s] sm:right-[-4rem] lg:w-[38rem]" />

      {/* Back foliage */}
      <div aria-hidden className="absolute inset-0 text-forest-2">
        <Frond seed={3} length={520} className="absolute -left-40 top-[8%] w-[46rem] origin-left rotate-[12deg] animate-sway opacity-80" />
        <Frond seed={9} length={520} className="absolute -right-48 top-[2%] w-[48rem] -scale-x-100 rotate-[-6deg] animate-sway opacity-80 [animation-delay:-3s]" />
      </div>

      {/* Fireflies */}
      <div aria-hidden className="absolute inset-0">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-soft animate-drift"
            style={{
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              animationDelay: f.delay,
              animationDuration: f.dur,
              boxShadow: "0 0 10px 2px rgba(230,204,152,0.55)",
              ["--dx" as string]: f.dx,
              ["--o" as string]: f.o,
            }}
          />
        ))}
      </div>

      {/* Eyes in the dark */}
      <div aria-hidden className="absolute inset-0">
        {EYES.map((e, i) => (
          <div key={i} className="absolute flex gap-3 animate-blink" style={{ left: e.left, top: e.top, animationDelay: e.delay, transform: `scale(${e.scale})` }}>
            {[0, 1].map((k) => (
              <span key={k} className="h-2 w-3.5 rounded-[50%] bg-[radial-gradient(circle_at_50%_50%,#fff3c4,#cf7a3f_45%,transparent_70%)] shadow-[0_0_18px_6px_rgba(207,122,63,0.45)]" />
            ))}
          </div>
        ))}
      </div>

      {/* Front foliage */}
      <div aria-hidden className="absolute inset-0 text-night">
        <BroadLeaf className="absolute -bottom-24 -left-16 h-[26rem] origin-bottom rotate-[18deg] animate-sway sm:h-[34rem]" />
        <Frond seed={21} length={460} className="absolute -bottom-36 -right-40 w-[40rem] origin-bottom rotate-[-35deg] -scale-x-100 animate-sway [animation-delay:-5s]" />
        <BroadLeaf className="absolute -bottom-32 right-[18%] hidden h-[22rem] origin-bottom rotate-[-14deg] animate-sway [animation-delay:-2s] md:block" />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-midnight to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/75 via-night/25 to-transparent lg:from-night/50 lg:via-transparent" />

      {/* Camera-trap HUD */}
      <div aria-hidden className="pointer-events-none absolute inset-x-6 top-20 bottom-6 hidden sm:block lg:inset-x-10 lg:top-24">
        <Corner className="left-0 top-0 border-l border-t" />
        <Corner className="right-0 top-0 border-r border-t" />
        <Corner className="bottom-0 left-0 border-b border-l" />
        <Corner className="bottom-0 right-0 border-b border-r" />
        <div className="absolute left-12 top-2 flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] text-ivory/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ember" /> REC · CAM-TRAP 07
        </div>
        <div className="absolute right-12 top-2 font-mono text-[0.65rem] tracking-[0.3em] text-ivory/50">IR · NIGHT VISION</div>
        <HudClock className="absolute bottom-2 right-12 font-mono text-[0.65rem] tracking-[0.3em] text-ivory/50" />
        <div className="absolute bottom-2 left-12 hidden font-mono text-[0.65rem] tracking-[0.3em] text-ivory/50 lg:block">SUBJECT: UNIDENTIFIED · MOTION DETECTED</div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-36 sm:px-6 sm:pb-40 lg:pt-36">
        <p className="eyebrow">{s.department} presents</p>
        <HeroTitle name={s.name} edition={s.edition} theme={s.theme} />
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/80 sm:text-xl">{s.tagline}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/events" className="btn btn-primary group">
            Explore Events <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          <Link href="/register" className="btn btn-gold">Register Now</Link>
          <Link href="/team" className="btn btn-ghost">Meet the Team</Link>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-8">
          <Countdown start={s.startDate} end={s.endDate} confirmed={s.datesConfirmed} />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ivory/60">
            {dateLine}
            <br />
            {s.college}
          </p>
        </div>
      </div>

      <a href="#discover" className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-gold/80 transition hover:text-gold" aria-label="Scroll to discover">
        <span className="font-mono text-[0.6rem] tracking-[0.35em]">FOLLOW THE TRACKS</span>
        <span className="flex flex-col items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Paw key={i} className="h-3.5 w-3.5 rotate-180 animate-pulse" style={{ animationDelay: `${i * 0.3}s`, transform: `translateX(${i % 2 ? 6 : -6}px) rotate(180deg)` }} />
          ))}
        </span>
      </a>
    </section>
  );
}
