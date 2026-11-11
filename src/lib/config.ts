import "server-only";

/** Server-only environment detection. Never import this from client components. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "media",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  organiserEmail: process.env.ORGANISER_EMAIL ?? "",
  sheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "",
  sheetSecret: process.env.GOOGLE_SHEET_SECRET ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim().replace(/\/+$/, ""),
  localAdminPassword: process.env.LOCAL_ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.LOCAL_SESSION_SECRET ?? "",
  ipSalt: process.env.IP_HASH_SALT ?? "animaux-default-salt",
};

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceKey);
/** Participant confirmations need a verified sending domain (EMAIL_FROM). */
export const emailConfigured = Boolean(env.resendKey && env.emailFrom);
/**
 * Organiser copies only need a Resend key: Resend's shared test sender
 * (onboarding@resend.dev) may email the address the Resend account was created
 * with — so create it with the festival inbox.
 */
export const notifyConfigured = Boolean(env.resendKey);

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
