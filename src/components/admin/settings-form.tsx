"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveSettingsAction } from "@/app/actions/admin";
import type { FestivalSettings } from "@/lib/types";
import { FieldControl, type Field } from "./fields";
import { Toast } from "./resource-manager";

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Registrations",
    fields: [{ name: "registrationsOpen", label: "Accept registrations (master switch)", type: "boolean", span: 2, help: "Untick to pause registrations for every event at once." }],
  },
  {
    title: "Identity",
    fields: [
      { name: "name", label: "Festival name", type: "text" },
      { name: "edition", label: "Edition / year", type: "text" },
      { name: "theme", label: "Theme", type: "text" },
      { name: "tagline", label: "Hero tagline", type: "text" },
      { name: "manifesto", label: "Manifesto line", type: "textarea", span: 2 },
    ],
  },
  {
    title: "Dates",
    fields: [
      { name: "startDate", label: "Festival starts (drives the countdown)", type: "datetime" },
      { name: "endDate", label: "Festival ends", type: "datetime" },
      { name: "datesConfirmed", label: "Dates are confirmed", type: "boolean", span: 2, help: "Until ticked, the site says “dates to be announced”." },
    ],
  },
  {
    title: "Venue & contact",
    fields: [
      { name: "department", label: "Department", type: "text" },
      { name: "college", label: "College / institution", type: "text" },
      { name: "address", label: "Address", type: "textarea", span: 2 },
      { name: "mapEmbedUrl", label: "Google Maps embed URL", type: "url", span: 2, help: "Google Maps → Share → Embed a map → copy only the src=\"…\" link (or a …&output=embed link)." },
      { name: "mapLink", label: "Google Maps link (directions)", type: "url", span: 2 },
      { name: "email", label: "Festival email", type: "email" },
      { name: "phone", label: "General coordinator phone", type: "text" },
      { name: "whatsapp", label: "WhatsApp number (digits with country code)", type: "text", placeholder: "9198xxxxxxxx" },
      { name: "instagram", label: "Instagram URL", type: "url" },
      { name: "brochureUrl", label: "Brochure (PDF)", type: "media", accept: "application/pdf", folder: "brochure", span: 2 },
    ],
  },
  { title: "Participant guidelines", fields: [{ name: "guidelines", label: "Guidelines (one per line)", type: "lines", span: 2 }] },
];

export function SettingsForm({ initial }: { initial: FestivalSettings }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "err" } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const clean = { ...draft, guidelines: (draft.guidelines as string[]).map((s) => s.trim()).filter(Boolean) };
    const res = await saveSettingsAction(clean);
    setSaving(false);
    if (res.ok) {
      setErrors({});
      setToast({ text: res.message ?? "Saved", tone: "ok" });
      router.refresh();
    } else {
      setErrors(res.fieldErrors ?? {});
      setToast({ text: res.error, tone: "err" });
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-8">
      {SECTIONS.map((s) => (
        <fieldset key={s.title} className="card p-6">
          <legend className="sr-only">{s.title}</legend>
          <h2 className="mb-5 font-display text-2xl">{s.title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {s.fields.map((f) => <FieldControl key={f.name} field={f} value={draft[f.name]} onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))} error={errors[f.name]} />)}
          </div>
        </fieldset>
      ))}
      <div className="sticky bottom-4 flex justify-end">
        <button disabled={saving} className="btn btn-primary shadow-2xl">{saving && <Loader2 size={16} className="animate-spin" />} Save settings</button>
      </div>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </form>
  );
}
