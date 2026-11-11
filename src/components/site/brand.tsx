import Link from "next/link";
import { Paw } from "@/components/art/motifs";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/schedule", label: "Schedule" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="ANIMAUX’26 — home">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-forest/60 transition group-hover:rotate-12 group-hover:border-gold">
        <Paw className="h-4.5 w-4.5 text-gold" />
      </span>
      <span className="leading-none">
        <span className="block font-title text-lg font-bold tracking-[0.12em] text-ivory">ANIMAUX<span className="text-gold">’26</span></span>
        <span className="block font-mono text-[0.55rem] tracking-[0.3em] text-gold">THE SURVIVAL FILES</span>
      </span>
    </Link>
  );
}
