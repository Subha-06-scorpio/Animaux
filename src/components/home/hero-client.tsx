"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { FEST_TZ } from "@/lib/utils";

export function HeroTitle({ name, edition, theme }: { name: string; edition: string; theme: string }) {
  const short = `${name}’${edition.slice(-2)}`;
  const [lead, rest] = theme.includes(":") ? theme.split(/:\s*/, 2) : [theme, ""];
  return (
    <h1 id="hero-title" className="mt-5">
      <span className="sr-only">{`${short} — ${theme}`}</span>
      <span aria-hidden className="block overflow-hidden pb-2">
        <motion.span
          initial={{ y: "105%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-wild block font-title text-[clamp(2.4rem,11vw,10.5rem)] font-bold leading-[0.95] tracking-[0.02em]"
        >
          {short}
        </motion.span>
      </span>
      <motion.span
        aria-hidden
        initial={{ opacity: 0, letterSpacing: "0.5em" }}
        animate={{ opacity: 1, letterSpacing: "0.22em" }}
        transition={{ delay: 0.6, duration: 1.4, ease: "easeOut" }}
        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-title text-sm uppercase text-gold-soft sm:text-xl"
      >
        <span>{lead}</span>
        {rest && (
          <>
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-ivory">{rest}</span>
          </>
        )}
      </motion.span>
    </h1>
  );
}

export function HudClock({ className }: { className?: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: FEST_TZ, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);
  return <div className={className}>{t ? `T ${t} IST` : " "}</div>;
}
