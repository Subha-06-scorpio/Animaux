"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2, Mail, Minus, Phone, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { registerAction, type RegisterResult } from "@/app/actions/public";
import { Paw } from "@/components/art/motifs";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { PublicEvent } from "@/lib/queries";
import { registrationSchema, YEARS, type RegistrationInput } from "@/lib/schemas";
import { cn, formatDate, formatFee, formatTime, isPlaceholder, telLink, whatsappLink } from "@/lib/utils";

const STORE_KEY = "animaux-participant";
type Saved = Pick<RegistrationInput, "fullName" | "institution" | "department" | "year" | "email" | "phone">;

function loadSaved(): Partial<Saved> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("input,button")?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);
  return ref;
}

export function RegistrationDialog({ event, onClose }: { event: PublicEvent; onClose: () => void }) {
  const ref = useDialog(onClose);
  const [result, setResult] = useState<Extract<RegisterResult, { ok: true }> | null>(null);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-night/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-title"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative flex max-h-[94svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-ivory/15 bg-midnight shadow-2xl sm:rounded-3xl"
      >
        <header className="relative shrink-0 overflow-hidden border-b border-ivory/10 bg-gradient-to-br from-forest to-midnight px-6 py-5 pr-16">
          <div className="topo absolute inset-0 opacity-60" aria-hidden />
          <p className="eyebrow relative">{result ? "Registration confirmed" : "Register · " + (event.participation === "team" ? `Team of ${event.teamMin}–${event.teamMax}` : "Individual")}</p>
          <h2 id="reg-title" className="relative mt-1 font-display text-2xl sm:text-3xl">{event.name}</h2>
          <p className="relative mt-1 text-xs text-mist">
            {formatDate(event.eventDate)} {event.startTime && `· ${formatTime(event.startTime)}`} · {event.venue} · Fee: {formatFee(event.fee)}
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold">
            <X size={18} />
          </button>
        </header>
        <div key={result ? "done" : "form"} className="overflow-y-auto overscroll-contain">
          {result ? <Success result={result} event={event} onClose={onClose} onAgain={() => setResult(null)} /> : <RegistrationForm event={event} onDone={setResult} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="field-error" role="alert">{msg}</p> : null;
}

function RegistrationForm({ event, onDone }: { event: PublicEvent; onDone: (r: Extract<RegisterResult, { ok: true }>) => void }) {
  const schema = useMemo(() => registrationSchema(event), [event]);
  const isTeam = event.participation === "team";
  const minOthers = isTeam ? event.teamMin - 1 : 0;
  const maxOthers = isTeam ? event.teamMax - 1 : 0;
  const [serverError, setServerError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      eventId: event.id,
      fullName: "",
      institution: "",
      department: "",
      email: "",
      phone: "",
      teamName: "",
      teamMembers: Array.from({ length: minOthers }, () => ({ name: "", email: "", phone: "" })),
      answers: {},
      website: "",
    },
  });
  const members = useFieldArray({ control, name: "teamMembers" });

  // Prefill personal details from a previous registration on this device.
  useEffect(() => {
    const saved = loadSaved();
    if (saved.email) reset((v) => ({ ...v, ...saved }));
  }, [reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    const res = await registerAction(values);
    if (res.ok) {
      try {
        const { fullName, institution, department, year, email, phone } = values;
        localStorage.setItem(STORE_KEY, JSON.stringify({ fullName, institution, department, year, email, phone }));
      } catch {}
      onDone(res);
      return;
    }
    setServerError(res.error);
    for (const [path, message] of Object.entries(res.fieldErrors ?? {})) setError(path as keyof RegistrationInput, { message });
  });

  const e = errors as FieldErrors<RegistrationInput> & { answers?: Record<string, { message?: string }> };
  const aria = (has: unknown) => ({ "aria-invalid": has ? true : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 p-6">
      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label>
          Website <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <fieldset className="space-y-4">
        <legend className="eyebrow mb-4">{isTeam ? "Team leader" : "Your details"}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="fullName">Full name *</label>
            <input id="fullName" className="field" autoComplete="name" {...aria(e.fullName)} {...register("fullName")} />
            <Err msg={e.fullName?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="institution">College / institution *</label>
            <input id="institution" className="field" autoComplete="organization" {...aria(e.institution)} {...register("institution")} />
            <Err msg={e.institution?.message} />
          </div>
          <div>
            <label className="label" htmlFor="department">Department *</label>
            <input id="department" className="field" placeholder="e.g. Zoology" {...aria(e.department)} {...register("department")} />
            <Err msg={e.department?.message} />
          </div>
          <div>
            <label className="label" htmlFor="year">Year *</label>
            <select id="year" className="field" defaultValue="" {...aria(e.year)} {...register("year")}>
              <option value="" disabled>Select year</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <Err msg={e.year?.message} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email *</label>
            <input id="email" type="email" inputMode="email" autoComplete="email" className="field" {...aria(e.email)} {...register("email")} />
            <Err msg={e.email?.message} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone / WhatsApp *</label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98xxxxxxxx" className="field" {...aria(e.phone)} {...register("phone")} />
            <Err msg={e.phone?.message} />
          </div>
        </div>
      </fieldset>

      {isTeam && (
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-4">Your team</legend>
          <div>
            <label className="label" htmlFor="teamName">Team name *</label>
            <input id="teamName" className="field" {...aria(e.teamName)} {...register("teamName")} />
            <Err msg={e.teamName?.message} />
          </div>
          <p className="text-sm text-mist">
            You + {minOthers === maxOthers ? minOthers : `${minOthers}–${maxOthers}`} other member{maxOthers === 1 ? "" : "s"}. Email and phone are optional for members.
          </p>
          <ol className="space-y-3">
            {members.fields.map((f, i) => (
              <li key={f.id} className="rounded-2xl border border-ivory/10 bg-night/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest text-gold">MEMBER {i + 2}</span>
                  {members.fields.length > minOthers && (
                    <button type="button" onClick={() => members.remove(i)} className="flex items-center gap-1 text-xs text-mist hover:text-ember-bright">
                      <Minus size={14} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="sr-only" htmlFor={`m${i}n`}>Member {i + 2} name</label>
                    <input id={`m${i}n`} className="field" placeholder="Full name *" {...aria(e.teamMembers?.[i]?.name)} {...register(`teamMembers.${i}.name`)} />
                    <Err msg={e.teamMembers?.[i]?.name?.message} />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`m${i}e`}>Member {i + 2} email</label>
                    <input id={`m${i}e`} type="email" className="field" placeholder="Email" {...aria(e.teamMembers?.[i]?.email)} {...register(`teamMembers.${i}.email`)} />
                    <Err msg={e.teamMembers?.[i]?.email?.message} />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`m${i}p`}>Member {i + 2} phone</label>
                    <input id={`m${i}p`} type="tel" className="field" placeholder="Phone" {...aria(e.teamMembers?.[i]?.phone)} {...register(`teamMembers.${i}.phone`)} />
                    <Err msg={e.teamMembers?.[i]?.phone?.message} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Err msg={e.teamMembers?.message ?? e.teamMembers?.root?.message} />
          {members.fields.length < maxOthers && (
            <button type="button" onClick={() => members.append({ name: "", email: "", phone: "" })} className="btn btn-ghost py-2 text-xs">
              <Plus size={14} /> Add member
            </button>
          )}
        </fieldset>
      )}

      {event.extraQuestions.length > 0 && (
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-4">A few event questions</legend>
          {event.extraQuestions.map((q) => {
            const id = `q-${q.id}`;
            const err = e.answers?.[q.id]?.message;
            return (
              <div key={q.id}>
                <label className="label" htmlFor={id}>{q.label}{q.required && " *"}</label>
                {q.type === "select" ? (
                  <select id={id} className="field" defaultValue="" {...aria(err)} {...register(`answers.${q.id}`)}>
                    <option value="">Select…</option>
                    {q.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : q.type === "textarea" ? (
                  <textarea id={id} rows={3} className="field" {...aria(err)} {...register(`answers.${q.id}`)} />
                ) : (
                  <input id={id} className="field" {...aria(err)} {...register(`answers.${q.id}`)} />
                )}
                <Err msg={err} />
              </div>
            );
          })}
        </fieldset>
      )}

      <div className="space-y-4 border-t border-ivory/10 pt-6">
        <label className="flex items-start gap-3 text-sm text-ivory/80">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#C4A46A]" {...register("consent")} />
          <span>I confirm these details are correct and I have read the event rules and eligibility. My details will be used only to organise ANIMAUX.</span>
        </label>
        <Err msg={e.consent?.message} />

        <AnimatePresence>
          {serverError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-ember/50 bg-ember/10 px-4 py-3 text-sm text-ivory">
              {serverError}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-4 text-base">
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Registering…</> : <>Confirm registration <Paw className="h-4 w-4" /></>}
        </button>
        <p className="text-center text-xs text-mist">No account needed. Registration closes {formatDate(event.deadline, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}.</p>
      </div>
    </form>
  );
}

function Success({ result, event, onClose, onAgain }: { result: Extract<RegisterResult, { ok: true }>; event: PublicEvent; onClose: () => void; onAgain: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.regCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const digits = event.coordinatorPhone.replace(/\D/g, "");
  const hasPhone = !isPlaceholder(event.coordinatorPhone) && digits.length >= 10;

  return (
    <div className="p-6 text-center sm:p-10">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/60 bg-forest">
        <Paw className="h-9 w-9 text-gold" />
      </motion.div>
      <h3 className="display mt-6 text-4xl">You&apos;re in the wild.</h3>
      <p className="mt-3 text-ivory/75">Your spot for <strong>{result.eventName}</strong> is confirmed. Keep this registration ID — you&apos;ll need it at the venue.</p>

      <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-dashed border-gold/60 bg-night/60 px-5 py-4">
        <span className="font-mono text-xl tracking-[0.15em] text-gold sm:text-2xl" aria-label={`Registration ID ${result.regCode.split("").join(" ")}`}>{result.regCode}</span>
        <button type="button" onClick={copy} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold" aria-label="Copy registration ID">
          {copied ? <Check size={16} className="text-gold" /> : <Copy size={16} />}
        </button>
      </div>
      <p className="mt-4 text-sm text-mist" role="status">
        {result.emailSent ? `A confirmation email is on its way to ${result.email}.` : "Email confirmations aren't switched on yet — please screenshot or note down this ID."}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onClose} className="btn btn-primary">Register for another event</button>
        <button type="button" onClick={onAgain} className="btn btn-ghost">Register someone else</button>
      </div>

      <div className="mt-8 border-t border-ivory/10 pt-6 text-sm text-ivory/70">
        <p>Questions? Contact {event.coordinatorName}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {hasPhone && (
            <>
              <a href={telLink(event.coordinatorPhone)} className="tag border-ivory/20 py-1.5 hover:border-gold hover:text-gold"><Phone size={12} /> Call</a>
              <a href={whatsappLink(digits.length === 10 ? `91${digits}` : digits, `Hi, I registered for ${event.name} (${result.regCode}).`)} target="_blank" rel="noopener noreferrer" className="tag border-ivory/20 py-1.5 hover:border-gold hover:text-gold"><WhatsAppIcon className="h-3 w-3" /> WhatsApp</a>
            </>
          )}
          {event.coordinatorEmail && (
            <a href={`mailto:${event.coordinatorEmail}?subject=${encodeURIComponent(`${event.name} — ${result.regCode}`)}`} className="tag border-ivory/20 py-1.5 hover:border-gold hover:text-gold"><Mail size={12} /> Email</a>
          )}
        </div>
      </div>
    </div>
  );
}

export const registerButtonClass = (open: boolean) => cn("btn w-full sm:w-auto", open ? "btn-primary" : "cursor-not-allowed border border-ivory/15 text-mist");
