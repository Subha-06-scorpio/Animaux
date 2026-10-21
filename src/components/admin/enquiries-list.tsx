"use client";

import { Mail, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEnquiryAction, setEnquiryStatusAction } from "@/app/actions/admin";
import type { Enquiry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const TONE = { new: "border-ember/60 text-ember-bright", in_progress: "border-gold/60 text-gold", resolved: "border-ivory/20 text-mist" };

export function EnquiriesList({ items }: { items: Enquiry[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"open" | "resolved" | "all">("open");
  const [, start] = useTransition();
  const shown = items.filter((e) => tab === "all" || (tab === "open" ? e.status !== "resolved" : e.status === "resolved"));
  const act = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="mt-8">
      <div className="inline-flex rounded-full border border-ivory/15 p-1 text-sm" role="tablist">
        {(["open", "resolved", "all"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-gold text-midnight" : "text-ivory/70"}`}>{t}</button>
        ))}
      </div>
      <ul className="mt-6 space-y-3">
        {shown.map((e) => (
          <li key={e.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{e.name} <span className="text-sm text-mist">· {e.email}{e.phone && ` · ${e.phone}`}</span></p>
                <p className="mt-0.5 text-xs text-mist">{e.category} · {formatDateTime(e.createdAt)}</p>
              </div>
              <span className={`tag ${TONE[e.status]}`}>{e.status.replace("_", " ")}</span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-ivory/85">{e.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: your ANIMAUX enquiry (${e.category})`)}`} className="btn btn-ghost py-1.5 text-xs"><Mail size={13} /> Reply by email</a>
              <select value={e.status} onChange={(x) => act(() => setEnquiryStatusAction(e.id, x.target.value as Enquiry["status"]))} className="rounded-full border border-ivory/15 bg-night px-3 py-1.5 text-xs" aria-label="Status">
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <button type="button" onClick={() => confirm("Delete this enquiry?") && act(() => deleteEnquiryAction(e.id))} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-ivory/60 hover:text-ember-bright" aria-label="Delete"><Trash2 size={15} /></button>
            </div>
          </li>
        ))}
        {!shown.length && <li className="py-12 text-center text-mist">No enquiries here.</li>}
      </ul>
    </div>
  );
}
