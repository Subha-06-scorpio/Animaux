"use client";

import { Loader2, Lock } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";

export function LoginForm({ mode }: { mode: "supabase" | "local" }) {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="space-y-4">
      {mode === "supabase" && (
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="field" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-ember/50 bg-ember/10 px-4 py-3 text-sm">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Sign in
      </button>
    </form>
  );
}
