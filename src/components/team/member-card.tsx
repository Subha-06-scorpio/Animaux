import { ArrowUpRight } from "lucide-react";
import { Paw } from "@/components/art/motifs";
import { PlaceholderArt } from "@/components/art/placeholder";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function MemberCard({ m, size = "md" }: { m: TeamMember; size?: "lg" | "md" | "sm" }) {
  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-ivory/10 bg-night/50 transition duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_60px_-25px_rgba(207,169,107,0.45)]")}>
      <div className="relative aspect-[4/5] overflow-hidden">
        {m.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.photoUrl} alt={`Portrait of ${m.name}`} loading="lazy" decoding="async" className="h-full w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <>
            <PlaceholderArt seed={m.id} compact label={`Photo placeholder for ${m.name}`} />
            <span aria-hidden className={cn("absolute inset-x-0 top-0 grid h-3/5 place-items-center font-display text-ivory/70", size === "sm" ? "text-3xl" : "text-6xl")}>{initials(m.name)}</span>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
        {m.spiritAnimal && (
          <span className="absolute left-3 top-3 tag translate-y-[-150%] border-gold/50 bg-night/80 text-gold opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Paw className="h-3 w-3" /> {m.spiritAnimal}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className={cn("font-display leading-tight", size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base")}>{m.name}</h3>
          <p className={cn("mt-0.5 font-mono uppercase tracking-[0.18em] text-gold", size === "sm" ? "text-[0.55rem]" : "text-[0.65rem]")}>{size === "sm" ? m.role.replace(` · ${m.section}`, "") : m.role}</p>
        </div>
      </div>
      {(m.bio || m.socialUrl) && size !== "sm" && (
        <div className="flex items-start justify-between gap-3 p-4 pt-3">
          <p className="text-sm text-ivory/65">{m.bio}</p>
          {m.socialUrl && (
            <a href={m.socialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on social media`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold">
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      )}
      {m.socialUrl && size === "sm" && (
        <a href={m.socialUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`${m.name} on social media`} />
      )}
    </article>
  );
}
