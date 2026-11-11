import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Frond } from "@/components/art/motifs";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { FestivalSettings } from "@/lib/types";
import { parseContacts, telLink, whatsappLink } from "@/lib/utils";
import { Logo, NAV } from "./brand";

export function Footer({ s }: { s: FestivalSettings }) {
  const wa = whatsappLink(s.whatsapp, `Hi! I have a question about ${s.name} ${s.edition}.`);
  return (
    <footer className="relative overflow-hidden border-t border-ivory/10 bg-night">
      <Frond seed={42} className="pointer-events-none absolute -right-24 -top-10 w-[520px] rotate-[200deg] text-forest/70" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug text-ivory/90">“{s.manifesto}”</p>
          <p className="mt-6 text-sm text-mist">
            {s.name} {s.edition} — {s.theme}
            <br />
            Organised by the {s.department}, {s.college}
          </p>
          <div className="mt-6 flex gap-3">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold">
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold">
                <WhatsAppIcon className="h-4.5 w-4.5" />
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold">
                <Mail size={17} />
              </a>
            )}
          </div>
        </div>
        <nav className="md:col-span-3" aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-y-2 text-sm text-ivory/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-gold">{n.label}</Link>
              </li>
            ))}
            <li><Link href="/register" className="text-ember-bright hover:text-gold">Register</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="eyebrow mb-4">Reach us</p>
          <ul className="space-y-3 text-sm text-ivory/80">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{s.address}</li>
            {s.email && <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>}
            {(parseContacts(s.contacts).length ? parseContacts(s.contacts) : s.phone ? [{ name: "", phone: s.phone }] : []).map((c) => (
              <li key={c.phone} className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-gold" /><a href={telLink(c.phone)} className="hover:text-gold">{c.name && `${c.name.split(" ")[0]} · `}{c.phone}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-mist sm:flex-row sm:justify-between sm:px-6">
          <p>© {s.edition} {s.name} · {s.department}</p>
          <p className="font-mono tracking-widest">EVERY SPECIES HAS A STORY</p>
        </div>
      </div>
    </footer>
  );
}
