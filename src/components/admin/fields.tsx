"use client";

import { ImageUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { createUploadAction } from "@/app/actions/admin";
import type { ExtraQuestion } from "@/lib/types";
import { compressImage } from "@/lib/image";
import { cn, fromLocalInput, toLocalInput } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  help?: string;
  span?: 1 | 2;
  placeholder?: string;
} & (
  | { type: "text" | "textarea" | "date" | "time" | "datetime" | "email" | "url"; suggestions?: string[] }
  | { type: "number"; nullable?: boolean; nullLabel?: string }
  | { type: "select"; options: (string | { value: string | number; label: string })[]; numeric?: boolean }
  | { type: "boolean" }
  | { type: "lines" }
  | { type: "media"; accept: string; folder: string }
  | { type: "questions" }
);

type Props = { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string };

export function FieldControl({ field: f, value, onChange, error }: Props) {
  const id = useId();
  const inv = error ? { "aria-invalid": true as const } : {};
  let control: React.ReactNode;

  switch (f.type) {
    case "textarea":
      control = <textarea id={id} rows={4} className="field" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} {...inv} />;
      break;
    case "number":
      control = (
        <div className="flex items-center gap-3">
          <input id={id} type="number" className="field" value={value === null || value === undefined ? "" : String(value)} disabled={f.nullable && value === null} onChange={(e) => onChange(e.target.value === "" ? (f.nullable ? null : 0) : Number(e.target.value))} {...inv} />
          {f.nullable && (
            <label className="flex shrink-0 items-center gap-2 text-xs text-ivory/75">
              <input type="checkbox" checked={value === null} onChange={(e) => onChange(e.target.checked ? null : 0)} className="accent-[#cfa96b]" /> {f.nullLabel ?? "None"}
            </label>
          )}
        </div>
      );
      break;
    case "select":
      control = (
        <select id={id} className="field" value={String(value ?? "")} onChange={(e) => onChange(f.numeric ? Number(e.target.value) : e.target.value)} {...inv}>
          {f.options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      );
      break;
    case "boolean":
      return (
        <label className={cn("flex items-start gap-3 rounded-xl border border-ivory/10 p-3", f.span === 2 && "sm:col-span-2")}>
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#cfa96b]" />
          <span>
            <span className="text-sm font-medium">{f.label}</span>
            {f.help && <span className="block text-xs text-mist">{f.help}</span>}
          </span>
        </label>
      );
    case "lines":
      control = (
        <textarea id={id} rows={4} className="field font-mono text-sm" value={((value as string[]) ?? []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} placeholder="One per line" {...inv} />
      );
      break;
    case "media":
      control = <MediaInput id={id} value={String(value ?? "")} onChange={onChange} accept={f.accept} folder={f.folder} />;
      break;
    case "questions":
      control = <QuestionsEditor value={(value as ExtraQuestion[]) ?? []} onChange={onChange} />;
      break;
    case "datetime":
      control = <input id={id} type="datetime-local" className="field" value={toLocalInput(String(value ?? ""))} onChange={(e) => onChange(fromLocalInput(e.target.value))} {...inv} />;
      break;
    default: {
      const listId = "suggestions" in f && f.suggestions ? `${id}-list` : undefined;
      control = (
        <>
          <input id={id} type={f.type} list={listId} className="field" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} {...inv} />
          {listId && <datalist id={listId}>{("suggestions" in f ? f.suggestions : [])?.map((s) => <option key={s} value={s} />)}</datalist>}
        </>
      );
    }
  }

  return (
    <div className={cn(f.span === 2 && "sm:col-span-2")}>
      <label htmlFor={id} className="label">{f.label}</label>
      {control}
      {f.help && <p className="mt-1 text-xs text-mist">{f.help}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export async function uploadFile(raw: File, folder: string): Promise<string> {
  const file = await compressImage(raw);
  const ticket = await createUploadAction(file.name, file.type, folder);
  if ("error" in ticket) throw new Error(ticket.error);
  if (ticket.mode === "local") {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  }
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(ticket.url, ticket.anonKey, { auth: { persistSession: false } });
  const { error } = await sb.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return ticket.publicUrl;
}

export function MediaInput({ id, value, onChange, accept, folder }: { id: string; value: string; onChange: (v: string) => void; accept: string; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isImg = value && !/\.(mp4|webm|mov|pdf)(\?|$)/i.test(value) && !/youtu/.test(value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste a link, or upload →" />
        <label className={cn("btn btn-ghost shrink-0 cursor-pointer px-4", busy && "pointer-events-none opacity-60")}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImageUp size={16} />}
          <span className="hidden sm:inline">{busy ? "Uploading" : "Upload"}</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setErr("");
              try {
                onChange(await uploadFile(file, folder));
              } catch (x) {
                setErr(x instanceof Error ? x.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {err && <p className="field-error">{err}</p>}
      {isImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Preview" className="h-28 rounded-lg border border-ivory/10 object-cover" />
      )}
    </div>
  );
}

function QuestionsEditor({ value, onChange }: { value: ExtraQuestion[]; onChange: (v: ExtraQuestion[]) => void }) {
  const set = (i: number, patch: Partial<ExtraQuestion>) => onChange(value.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  return (
    <div className="space-y-3">
      {value.map((q, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-ivory/10 p-3 sm:grid-cols-6">
          <input className="field sm:col-span-3" value={q.label} placeholder="Question" onChange={(e) => set(i, { label: e.target.value })} aria-label="Question text" />
          <select className="field sm:col-span-2" value={q.type} onChange={(e) => set(i, { type: e.target.value as ExtraQuestion["type"] })} aria-label="Answer type">
            <option value="text">Short answer</option>
            <option value="textarea">Long answer</option>
            <option value="select">Choose from options</option>
            <option value="file">Photo upload</option>
          </select>
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="btn btn-ghost px-3" aria-label="Remove question"><Trash2 size={14} /></button>
          {q.type === "select" && (
            <input className="field sm:col-span-4" value={(q.options ?? []).join(", ")} placeholder="Options, separated by commas" onChange={(e) => set(i, { options: e.target.value.split(",").map((s) => s.trimStart()) })} onBlur={(e) => set(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} aria-label="Options" />
          )}
          <label className="flex items-center gap-2 text-xs sm:col-span-2">
            <input type="checkbox" checked={!!q.required} onChange={(e) => set(i, { required: e.target.checked })} className="accent-[#cfa96b]" /> Required
          </label>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { id: `q${Date.now().toString(36)}`, label: "", type: "text", required: false }])} className="btn btn-ghost py-2 text-xs">
        <Plus size={14} /> Add question
      </button>
    </div>
  );
}
