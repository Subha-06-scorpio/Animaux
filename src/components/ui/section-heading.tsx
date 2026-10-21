import { Frond } from "@/components/art/motifs";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  tone = "dark",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  tone?: "dark" | "paper";
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", tone === "paper" && "text-olive")}>{eyebrow}</p>
      <h2 className={cn("display mt-4 text-4xl sm:text-5xl lg:text-6xl", tone === "paper" ? "text-forest" : "text-ivory")}>{title}</h2>
      {intro && <p className={cn("mt-5 text-lg leading-relaxed", tone === "paper" ? "text-forest/80" : "text-ivory/70")}>{intro}</p>}
    </Reveal>
  );
}

/** Page header used by inner pages. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-ivory/10 bg-gradient-to-b from-forest to-midnight pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="topo absolute inset-0 opacity-70" aria-hidden />
      <div aria-hidden className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <Frond seed={eyebrow.length} length={460} className="pointer-events-none absolute -right-40 top-6 hidden w-[40rem] -scale-x-100 rotate-[18deg] animate-sway text-forest-2 opacity-90 md:block" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg text-ivory/75">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
