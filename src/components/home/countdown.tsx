"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { k: "Days", v: Math.floor(s / 86400) },
    { k: "Hours", v: Math.floor((s % 86400) / 3600) },
    { k: "Minutes", v: Math.floor((s % 3600) / 60) },
    { k: "Seconds", v: s % 60 },
  ];
}

export function Countdown({ start, end, confirmed, className }: { start: string; end: string; confirmed: boolean; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const s = Date.parse(start);
  const e = Date.parse(end);
  if (now !== null && now >= s) {
    return (
      <p className={cn("font-mono text-sm tracking-[0.3em] text-gold", className)}>
        {now <= e ? "● THE WILD IS LIVE — HAPPENING NOW" : "THANK YOU FOR JOINING THE WILD"}
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Time until the festival begins">
        {parts(now === null ? 0 : s - now).map(({ k, v }) => (
          <div key={k} className="min-w-[4.25rem] rounded-xl border border-ivory/15 bg-night/50 px-3 py-2.5 text-center backdrop-blur-md sm:min-w-[5.25rem]">
            <div className="font-display text-3xl tabular-nums text-ivory sm:text-4xl" suppressHydrationWarning>
              {now === null ? "--" : String(v).padStart(2, "0")}
            </div>
            <div className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-gold/80">{k}</div>
          </div>
        ))}
      </div>
      {!confirmed && <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">Provisional date · final dates to be announced</p>}
    </div>
  );
}
