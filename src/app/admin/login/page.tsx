import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Paw } from "@/components/art/motifs";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";
import { dataMode, env } from "@/lib/config";

export const metadata: Metadata = { title: "Organiser login", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="topo flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="card w-full max-w-sm p-8">
        <Paw className="h-8 w-8 text-gold" />
        <h1 className="display mt-4 text-3xl">Organiser login</h1>
        <p className="mt-1 text-sm text-mist">ANIMAUX 2026 dashboard</p>
        {dataMode === "local" && (
          <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs text-ivory/80">
            Local development mode — Supabase is not configured.{" "}
            {env.localAdminPassword ? "Use the LOCAL_ADMIN_PASSWORD from .env.local." : "Set LOCAL_ADMIN_PASSWORD in .env.local to enable login."}
          </p>
        )}
        <div className="mt-6"><LoginForm mode={dataMode} /></div>
      </div>
    </main>
  );
}
