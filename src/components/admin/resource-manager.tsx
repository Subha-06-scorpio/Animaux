"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteItemAction, reorderAction, saveItemAction } from "@/app/actions/admin";
import type { CollectionName, Collections } from "@/lib/types";
import { FieldControl } from "./fields";
import { CONFIG, type ResourceConfig } from "./resource-config";

type Item = Collections[CollectionName];

export function Toast({ msg, onDone }: { msg: { text: string; tone: "ok" | "err" } | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, msg.tone === "ok" ? 2500 : 6000);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return (
    <AnimatePresence>
      {msg && (
        <motion.div role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[80] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${msg.tone === "ok" ? "border-gold/50 bg-forest" : "border-ember/60 bg-[#3a1d12]"}`}>
          {msg.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ResourceManager<C extends CollectionName>({ collection, items: initial }: { collection: C; items: Collections[C][] }) {
  const cfg = CONFIG[collection] as unknown as ResourceConfig<CollectionName>;
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<{ item: Item; isNew: boolean } | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const [pending, start] = useTransition();

  // Re-sync when the server sends fresh data (after router.refresh()).
  const [lastInitial, setLastInitial] = useState(initial);
  if (lastInitial !== initial) {
    setLastInitial(initial);
    setItems(initial);
  }

  const shown = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter(
      (i) =>
        (!filter || String((i as Record<string, unknown>)[cfg.filter!.field]) === filter) &&
        (!s || `${cfg.label(i)} ${cfg.meta(i)}`.toLowerCase().includes(s)),
    );
  }, [items, q, filter, cfg]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (res.message) setToast({ text: res.message, tone: "ok" });
        after?.();
        router.refresh();
      } else setToast({ text: res.error ?? "Failed", tone: "err" });
    });

  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    run(() => reorderAction(collection, next.map((x) => x.id)));
  };

  const toggle = (item: Item) => {
    const next = { ...item, visible: !item.visible } as Item;
    setItems((xs) => xs.map((x) => (x.id === item.id ? next : x)));
    run(() => saveItemAction(collection, next as Collections[C]));
  };

  const remove = (item: Item) => {
    if (!confirm(`Delete “${cfg.label(item)}”? This cannot be undone.`)) return;
    run(() => deleteItemAction(collection, item.id), () => setItems((xs) => xs.filter((x) => x.id !== item.id)));
  };

  const maxSort = Math.max(-1, ...items.map((i) => i.sortOrder));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="display mt-2 text-4xl">{cfg.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-ivory/65">{cfg.description}</p>
        </div>
        <button type="button" onClick={() => setEditing({ item: cfg.blank(maxSort + 1), isNew: true })} className="btn btn-primary">
          <Plus size={16} /> Add {cfg.singular}
        </button>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search</span>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cfg.title.toLowerCase()}…`} className="field py-2.5 pl-10" />
        </label>
        {cfg.filter && (
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field py-2.5 sm:w-56" aria-label={`Filter by ${cfg.filter.label}`}>
            <option value="">All {cfg.filter.label.toLowerCase()}s</option>
            {cfg.filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>

      <ul className="mt-6 divide-y divide-ivory/10 overflow-hidden rounded-2xl border border-ivory/10">
        {shown.map((item) => {
          const thumb = cfg.thumb?.(item);
          return (
            <li key={item.id} className={`flex items-center gap-3 px-4 py-3 ${item.visible ? "" : "opacity-55"}`}>
              {cfg.thumb && (
                <span className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ivory/10 bg-forest sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                </span>
              )}
              <button type="button" onClick={() => setEditing({ item, isNew: false })} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium hover:text-gold">{cfg.label(item)}</span>
                <span className="block truncate text-xs text-mist">{cfg.meta(item)}</span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                {!q && !filter && (
                  <>
                    <IconBtn label="Move up" onClick={() => move(item.id, -1)}><ArrowUp size={15} /></IconBtn>
                    <IconBtn label="Move down" onClick={() => move(item.id, 1)}><ArrowDown size={15} /></IconBtn>
                  </>
                )}
                <IconBtn label={item.visible ? "Hide from website" : "Show on website"} onClick={() => toggle(item)}>{item.visible ? <Eye size={15} /> : <EyeOff size={15} />}</IconBtn>
                {cfg.publicHref && <a href={cfg.publicHref(item)} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-ivory/60 hover:bg-ivory/5 hover:text-gold" aria-label="Open on website"><ExternalLink size={15} /></a>}
                <IconBtn label="Edit" onClick={() => setEditing({ item, isNew: false })}><Pencil size={15} /></IconBtn>
                <IconBtn label="Delete" onClick={() => remove(item)} danger><Trash2 size={15} /></IconBtn>
              </div>
            </li>
          );
        })}
        {!shown.length && <li className="px-4 py-10 text-center text-sm text-mist">Nothing here yet.</li>}
      </ul>
      {pending && <p className="mt-3 flex items-center gap-2 text-xs text-mist"><Loader2 size={12} className="animate-spin" /> Saving…</p>}

      <AnimatePresence>
        {editing && (
          <Editor
            key={editing.item.id}
            cfg={cfg}
            initial={editing.item}
            isNew={editing.isNew}
            onClose={() => setEditing(null)}
            onSaved={(saved) => {
              setItems((xs) => (xs.some((x) => x.id === saved.id) ? xs.map((x) => (x.id === saved.id ? saved : x)) : [...xs, saved]));
              setEditing(null);
              setToast({ text: "Saved — live on the website", tone: "ok" });
              router.refresh();
            }}
            save={(it) => saveItemAction(collection, it as Collections[C])}
          />
        )}
      </AnimatePresence>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`grid h-8 w-8 place-items-center rounded-lg text-ivory/60 hover:bg-ivory/5 ${danger ? "hover:text-ember-bright" : "hover:text-gold"}`}>
      {children}
    </button>
  );
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

function Editor({ cfg, initial, isNew, onClose, onSaved, save }: {
  cfg: ResourceConfig<CollectionName>;
  initial: Item;
  isNew: boolean;
  onClose: () => void;
  onSaved: (i: Item) => void;
  save: (i: Item) => Promise<{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }>;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>(initial as unknown as Record<string, unknown>);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (name: string, v: unknown) =>
    setDraft((d) => {
      const next = { ...d, [name]: v };
      if (name === "name" && "slug" in d && (isNew || !d.slug)) next.slug = slugify(String(v));
      if (name === "participation" && v === "individual") Object.assign(next, { teamMin: 1, teamMax: 1 });
      return next;
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const clean = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, Array.isArray(v) && v.every((x) => typeof x === "string") ? v.map((s: string) => s.trim()).filter(Boolean) : v]));
    const res = await save(clean as unknown as Item);
    setSaving(false);
    if (res.ok) onSaved(clean as unknown as Item);
    else {
      setError(res.error ?? "Could not save");
      setErrors(res.fieldErrors ?? {});
    }
  };

  return (
    <motion.div className="fixed inset-0 z-[70] flex justify-end bg-night/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={`${isNew ? "Add" : "Edit"} ${cfg.singular}`}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="flex h-full w-full max-w-2xl flex-col border-l border-ivory/10 bg-midnight"
      >
        <header className="flex items-center justify-between border-b border-ivory/10 px-6 py-4">
          <h2 className="font-display text-2xl">{isNew ? `Add ${cfg.singular}` : `Edit ${cfg.singular}`}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold"><X size={16} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {cfg.fields.map((f) => (
              <FieldControl key={f.name} field={f} value={draft[f.name]} onChange={(v) => set(f.name, v)} error={errors[f.name] ?? Object.entries(errors).find(([k]) => k.startsWith(`${f.name}.`))?.[1]} />
            ))}
          </div>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-ivory/10 px-6 py-4">
          <p className="text-sm text-ember-bright" role="alert">{error}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button disabled={saving} className="btn btn-primary">{saving && <Loader2 size={16} className="animate-spin" />} Save</button>
          </div>
        </footer>
      </motion.form>
    </motion.div>
  );
}
