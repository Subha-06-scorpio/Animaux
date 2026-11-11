"use client";

import { ChevronDown, Download, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { deleteRegistrationAction, setRegistrationStatusAction } from "@/app/actions/admin";
import type { FestEvent, Registration } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Toast } from "./resource-manager";

export function RegistrationsTable({ regs, events, filters, canDelete, canWrite }: {
  regs: Registration[];
  events: Pick<FestEvent, "id" | "name" | "extraQuestions">[];
  filters: { event: string; q: string; status: string };
  canDelete: boolean;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const [pending, start] = useTransition();
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  const qLabel = (id: string) => events.flatMap((e) => e.extraQuestions).find((q) => q.id === id)?.label ?? id;

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setToast({ text: r.error ?? "Failed", tone: "err" });
      router.refresh();
    });

  return (
    <div>
      <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]" action="/admin/registrations">
        <select name="event" defaultValue={filters.event} className="field py-2.5" aria-label="Event">
          <option value="">All events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input name="q" defaultValue={filters.q} placeholder="Search name, email, phone, ID, team…" className="field py-2.5" aria-label="Search" />
        <select name="status" defaultValue={filters.status} className="field py-2.5" aria-label="Status">
          <option value="">Any status</option>
          <option value="confirmed">Confirmed</option>
          <option value="attended">Attended</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-gold py-2.5">Filter</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-mist">{regs.length} registration{regs.length === 1 ? "" : "s"} {pending && <Loader2 size={12} className="ml-2 inline animate-spin" />}</p>
        <a href={`/api/admin/export${qs ? `?${qs}` : ""}`} className="btn btn-ghost py-2"><Download size={15} /> Export CSV</a>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-ivory/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-night text-xs uppercase tracking-widest text-mist">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory/10">
            {regs.map((r) => (
              <Fragment key={r.id}>
                <tr className={r.status === "cancelled" ? "opacity-50" : ""}>
                  <td className="px-4 py-3 font-mono text-xs text-gold">{r.regCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.fullName}</p>
                    <p className="text-xs text-mist">{[r.institution, r.department, r.year].filter(Boolean).join(" · ")}</p>
                    {r.teamName && <p className="text-xs text-gold/80">Team “{r.teamName}” · {r.teamMembers.length + 1} members</p>}
                  </td>
                  <td className="px-4 py-3">{r.eventName}</td>
                  <td className="px-4 py-3 text-xs">
                    <a href={`tel:${r.phone}`} className="block hover:text-gold">{r.phone}</a>
                    {r.email && <a href={`mailto:${r.email}`} className="block text-mist hover:text-gold">{r.email}</a>}
                  </td>
                  <td className="px-4 py-3 text-xs text-mist">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} disabled={!canWrite} onChange={(e) => act(() => setRegistrationStatusAction(r.id, e.target.value as Registration["status"]))} className="rounded-lg border border-ivory/15 bg-night px-2 py-1 text-xs" aria-label={`Status for ${r.regCode}`}>
                      <option value="confirmed">Confirmed</option>
                      <option value="attended">Attended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {(r.teamMembers.length > 0 || Object.keys(r.answers).length > 0) && (
                        <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} aria-label="Show details" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ivory/5"><ChevronDown size={15} className={open === r.id ? "rotate-180" : ""} /></button>
                      )}
                      {canDelete && (
                        <button type="button" onClick={() => confirm(`Delete registration ${r.regCode}? Prefer “Cancelled” to keep a record.`) && act(() => deleteRegistrationAction(r.id))} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ivory/5 hover:text-ember-bright"><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
                {open === r.id && (
                  <tr className="bg-night/60">
                    <td colSpan={7} className="px-4 py-4 text-xs">
                      {r.teamMembers.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-1 uppercase tracking-widest text-mist">Team members</p>
                          <ol className="list-decimal space-y-0.5 pl-5">
                            {r.teamMembers.map((m, i) => <li key={i}>{m.name} {m.email && `· ${m.email}`} {m.phone && `· ${m.phone}`}</li>)}
                          </ol>
                        </div>
                      )}
                      {Object.entries(r.answers).map(([k, v]) =>
                        /^(https:\/\/|\/media\/)/.test(v) ? (
                          <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-3 hover:text-gold">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={v} alt="" className="h-16 w-16 rounded-lg object-cover" /> {qLabel(k)} — open full size
                          </a>
                        ) : (
                          <p key={k}><span className="text-mist">{qLabel(k)}:</span> {v}</p>
                        ),
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!regs.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-mist">No registrations match.</td></tr>}
          </tbody>
        </table>
      </div>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
