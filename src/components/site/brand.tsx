import Link from "next/link";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/schedule", label: "Schedule" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="ANIMAUX’26 — home">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 bg-midnight transition group-hover:rotate-12 group-hover:border-gold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-paw-128.png" alt="" width={26} height={26} className="h-6.5 w-6.5" />
      </span>
      <span className="leading-none">
        <span className="block font-title text-lg font-bold tracking-[0.12em] text-ivory">ANIMAUX<span className="text-gold">’26</span></span>
        <span className="block font-mono text-[0.55rem] tracking-[0.3em] text-gold">THE SURVIVAL FILES</span>
      </span>
    </Link>
  );
}
