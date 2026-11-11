import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { can, requirePage } from "@/lib/auth";
import { dataMode, notifyConfigured } from "@/lib/config";
import { sheetConfigured } from "@/lib/sheets";
import { repo } from "@/lib/data";
import { eventStatus, formatDateTime } from "@/lib/utils";

export default async function Overview({ searchParams }: PageProps<"/admin">) {
  const user = await requirePage();
  const denied = (await searchParams).denied;
  const r = repo();
  const [events, settings, counts, regs, enquiries, team, gallery] = await Promise.all([
    r.list("events"),
    r.getSettings(),
    r.registrationCounts(),
    can(user, "registrations.read") ? r.listRegistrations() : Promise.resolve([]),
    can(user, "enquiries.read") ? r.listEnquiries() : Promise.resolve([]),
    r.list("team"),
    r.list("gallery"),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const openEvents = events.filter((e) => e.visible && eventStatus(e, settings, counts[e.id] ?? 0).open).length;
  const newEnq = enquiries.filter((e) => e.status === "new").length;

  const checklist = [
    { done: dataMode === "supabase", label: "Connect Supabase (database, login, media storage)" },
    { done: sheetConfigured(), label: "Connect the Google Sheet (registrations copied to the festival Gmail)" },
    { done: notifyConfigured, label: "Connect Resend (a registration email to the festival inbox)" },
    { done: settings.datesConfirmed, label: "Confirm festival dates (Festival settings)" },
    { done: !settings.college.includes("placeholder"), label: "Add college name and address" },
    { done: !events.some((e) => e.isSample), label: "Replace sample events with the real event list" },
    { done: !team.some((m) => m.isSample), label: "Replace placeholder team members" },
    { done: gallery.some((g) => g.url), label: "Upload the first gallery photos" },
  ];

  const stats = [
    { k: "Registrations", v: total, href: "/admin/registrations" },
    { k: "Open events", v: `${openEvents}/${events.filter((e) => e.visible).length}`, href: "/admin/events" },
    { k: "New enquiries", v: newEnq, href: "/admin/enquiries" },
    { k: "Registrations open", v: settings.registrationsOpen ? "Yes" : "Paused", href: "/admin/settings" },
  ];

  return (
    <div className="space-y-10">
      {denied && <p className="rounded-xl border border-ember/50 bg-ember/10 px-4 py-3 text-sm">Your role doesn’t have access to that page.</p>}
      <header>
        <p className="eyebrow">Overview</p>
        <h1 className="display mt-2 text-4xl">Welcome back to base camp.</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.k} href={s.href} className="card p-5 transition hover:border-gold/40">
            <p className="text-xs uppercase tracking-widest text-mist">{s.k}</p>
            <p className="mt-2 font-display text-4xl">{s.v}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-2xl">Registrations by event</h2>
          <ul className="mt-4 divide-y divide-ivory/10 text-sm">
            {events.map((e) => {
              const st = eventStatus(e, settings, counts[e.id] ?? 0);
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className={`h-2 w-2 rounded-full ${st.open ? "bg-gold" : "bg-mist/50"}`} title={st.label} />
                  <Link href={`/admin/registrations?event=${e.id}`} className="flex-1 hover:text-gold">{e.name}{!e.visible && <span className="ml-2 text-xs text-mist">(hidden)</span>}</Link>
                  <span className="font-mono">{counts[e.id] ?? 0}{e.capacity ? `/${e.capacity}` : ""}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-2xl">Go-live checklist</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                {c.done ? <CheckCircle2 size={18} className="shrink-0 text-gold" /> : <Circle size={18} className="shrink-0 text-mist" />}
                <span className={c.done ? "text-ivory/60 line-through" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {regs.length > 0 && (
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Latest registrations</h2>
            <Link href="/admin/registrations" className="text-sm text-gold hover:underline">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-ivory/10 text-sm">
            {regs.slice(0, 6).map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="font-mono text-gold">{x.regCode}</span>
                <span className="flex-1">{x.fullName} · <span className="text-mist">{x.eventName}</span></span>
                <span className="text-xs text-mist">{formatDateTime(x.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
