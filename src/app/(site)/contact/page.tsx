import { Building2, Mail, MapPin, Phone, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero, SectionHeading } from "@/components/ui/section-heading";
import { getPublicEvents, getSettings, getVisible } from "@/lib/queries";
import { isPlaceholder, telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact & Help Desk", description: "Questions about ANIMAUX 2026 events, registration, schedules or rules? Reach the help desk." };

export default async function ContactPage() {
  const [s, events, faqs] = await Promise.all([getSettings(), getPublicEvents(), getVisible("faqs")]);
  const wa = whatsappLink(s.whatsapp, `Hi! I have a question about ${s.name} ${s.edition}.`);

  const cards = [
    { icon: Building2, k: "Organised by", v: `${s.department}, ${s.college}` },
    { icon: MapPin, k: "Address", v: s.address },
    { icon: Mail, k: "Festival email", v: s.email, href: s.email && `mailto:${s.email}` },
    { icon: Phone, k: "General coordinator", v: s.phone, href: !isPlaceholder(s.phone) ? telLink(s.phone) : undefined },
  ];

  return (
    <>
      <PageHero eyebrow="Help desk" title={<>Lost in the <em className="text-gold">woods</em>?</>} intro="Questions about events, registrations, schedules, rules or a technical hiccup — send a signal and we’ll find you.">
        <div className="mt-8 flex flex-wrap gap-3">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><WhatsAppIcon className="h-4 w-4" /> WhatsApp enquiry</a>
          ) : (
            <span className="btn cursor-default border border-ivory/15 text-mist"><WhatsAppIcon className="h-4 w-4" /> WhatsApp number coming soon</span>
          )}
          {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><InstagramIcon className="h-4 w-4" /> Instagram</a>}
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          {cards.map(({ icon: Icon, k, v, href }) => (
            <div key={k} className="card flex gap-4 p-5">
              <Icon size={20} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-mist">{k}</p>
                {href ? <a href={href} className="mt-1 block text-ivory hover:text-gold">{v}</a> : <p className="mt-1 text-ivory">{v}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="Send a message" title="Ask the help desk" />
          <div className="mt-8"><ContactForm /></div>
        </div>
      </section>

      <section className="border-y border-ivory/10 bg-night py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Event coordinators" title="Talk to the right person" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li key={e.id} className="rounded-2xl border border-ivory/10 p-5">
                <Link href={`/events/${e.slug}`} className="font-display text-lg hover:text-gold">{e.name}</Link>
                <p className="mt-1 text-sm text-ivory/70">{e.coordinatorName}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-gold/90">
                  {isPlaceholder(e.coordinatorPhone) ? <span className="text-mist">{e.coordinatorPhone}</span> : <a href={telLink(e.coordinatorPhone)} className="hover:text-ember-bright">{e.coordinatorPhone}</a>}
                  {e.coordinatorEmail && <a href={`mailto:${e.coordinatorEmail}`} className="hover:text-ember-bright">{e.coordinatorEmail}</a>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="paper py-20" id="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading tone="paper" eyebrow="Field FAQ" title="Questions we hear a lot" align="center" />
          <div className="mt-10 divide-y divide-forest/15 rounded-2xl border border-forest/15 bg-ivory/70">
            {faqs.map((f) => (
              <details key={f.id} className="group px-6 py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-xl text-forest">
                  {f.question}
                  <Plus className="shrink-0 text-ember transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="pb-6 leading-relaxed text-forest/80">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
