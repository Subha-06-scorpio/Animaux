import "server-only";

/** Server-only environment detection. Never import this from client components. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "media",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  localAdminPassword: process.env.LOCAL_ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.LOCAL_SESSION_SECRET ?? "",
  ipSalt: process.env.IP_HASH_SALT ?? "animaux-default-salt",
};

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceKey);
export const emailConfigured = Boolean(env.resendKey && env.emailFrom);

/**
 * "local" mode stores data in a JSON file (.data/db.json). It exists so the
 * site can be developed and tested before Supabase is set up. It is refused
 * on Vercel, where the filesystem is not persistent.
 */
export const dataMode: "supabase" | "local" = supabaseConfigured ? "supabase" : "local";

export function assertLocalModeAllowed() {
  if (dataMode === "local" && process.env.VERCEL) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    );
  }
}
