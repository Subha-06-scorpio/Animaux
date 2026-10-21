"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { enquiryAction } from "@/app/actions/public";
import { ENQUIRY_CATEGORIES, enquirySchema, type EnquiryInput } from "@/lib/schemas";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    setServerError("");
    const res = await enquiryAction(v);
    if (res.ok) {
      reset();
      setDone(true);
      return;
    }
    setServerError(res.error);
    for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof EnquiryInput, { message: m });
  });

  if (done)
    return (
      <div className="card flex flex-col items-center p-10 text-center" role="status">
        <CheckCircle2 size={44} className="text-gold" />
        <h3 className="display mt-5 text-3xl">Message received.</h3>
        <p className="mt-3 text-ivory/70">Our help desk will get back to you by email — usually within a day.</p>
        <button type="button" onClick={() => setDone(false)} className="btn btn-ghost mt-6">Send another</button>
      </div>
    );

  const inv = (e: unknown) => ({ "aria-invalid": e ? true : undefined });
  return (
    <form onSubmit={onSubmit} noValidate className="card relative space-y-5 p-6 sm:p-8">
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Name *</label>
          <input id="c-name" className="field" autoComplete="name" {...inv(errors.name)} {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="c-email">Email *</label>
          <input id="c-email" type="email" className="field" autoComplete="email" {...inv(errors.email)} {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="c-phone">Phone <span className="text-mist">(optional)</span></label>
          <input id="c-phone" type="tel" className="field" autoComplete="tel" {...inv(errors.phone)} {...register("phone")} />
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="c-cat">Enquiry about *</label>
          <select id="c-cat" className="field" defaultValue="" {...inv(errors.category)} {...register("category")}>
            <option value="" disabled>Choose a topic</option>
            {ENQUIRY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <p className="field-error">{errors.category.message}</p>}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-msg">Message *</label>
        <textarea id="c-msg" rows={5} className="field" placeholder="Which event, what happened, how can we help?" {...inv(errors.message)} {...register("message")} />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>
      {serverError && <p role="alert" className="rounded-xl border border-ember/50 bg-ember/10 px-4 py-3 text-sm">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full sm:w-auto">
        {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send message <Send size={16} /></>}
      </button>
    </form>
  );
}
