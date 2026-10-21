"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { FEST_TZ } from "@/lib/utils";

export function HeroTitle({ name, edition, theme }: { name: string; edition: string; theme: string }) {
  return (
    <h1 id="hero-title" className="mt-5">
      <span className="sr-only">{`${name} ${edition} — ${theme}`}</span>
      <span aria-hidden className="block overflow-hidden">
        <motion.span
          initial={{ y: "105%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="display text-gradient-gold block text-[clamp(4rem,15vw,11.5rem)] font-normal tracking-[0.02em]"
        >
          {name}
        </motion.span>
      </span>
      <span aria-hidden className="mt-1 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="display text-outline text-[clamp(2.75rem,8vw,6rem)]"
        >
          {edition}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.32em" }}
          transition={{ delay: 0.7, duration: 1.4, ease: "easeOut" }}
          className="font-mono text-sm uppercase text-gold sm:text-lg"
        >
          {theme}
        </motion.span>
      </span>
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
