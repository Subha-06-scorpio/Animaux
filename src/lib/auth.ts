import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dataMode, env } from "./config";
import { admin as serviceClient } from "./data/supabase";

/**
 * Admin authentication + role-based authorisation.
 *
 * Supabase mode: Supabase Auth (email + password). A signed-in user is only an
 * admin if they also have a row in `admin_users` (see migrations).
 * Local mode (development only): a single password from LOCAL_ADMIN_PASSWORD,
 * kept in an HMAC-signed, httpOnly cookie.
 */
export const ROLES = ["admin", "editor", "registrations"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  "content.write": ["admin", "editor"],
  "settings.write": ["admin"],
  "registrations.read": ["admin", "registrations"],
  "registrations.write": ["admin", "registrations"],
  "registrations.delete": ["admin"],
  "enquiries.read": ["admin", "registrations"],
  "enquiries.write": ["admin", "registrations"],
} as const satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export type AdminUser = { email: string; role: Role };

export const can = (u: AdminUser | null, p: Permission) => !!u && (PERMISSIONS[p] as readonly Role[]).includes(u.role);

const LOCAL_COOKIE = "anx_admin";
const LOCAL_TTL = 8 * 60 * 60 * 1000;

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component — the proxy refreshes the session instead.
        }
      },
    },
  });
}

const localSecret = () => env.sessionSecret || `${env.localAdminPassword}::animaux-local`;
const sign = (payload: string) => createHmac("sha256", localSecret()).update(payload).digest("base64url");

export async function getAdmin(): Promise<AdminUser | null> {
  if (dataMode === "local") {
    if (!env.localAdminPassword) return null;
    const raw = (await cookies()).get(LOCAL_COOKIE)?.value;
    if (!raw) return null;
    const [payload, sig] = raw.split(".");
    if (!payload || !sig) return null;
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp: number };
    return data.exp > Date.now() ? { email: "local-admin", role: "admin" } : null;
  }

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await serviceClient().from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!row || !ROLES.includes(row.role as Role)) return null;
  return { email: data.user.email ?? "", role: row.role as Role };
}

/** For pages: redirect to login when signed out, or show a 403 notice. */
export async function requirePage(p?: Permission) {
  const u = await getAdmin();
  if (!u) redirect("/admin/login");
  if (p && !can(u, p)) redirect("/admin?denied=1");
  return u;
}

/** For server actions / route handlers: throw instead of redirecting. */
export async function requirePermission(p: Permission) {
  const u = await getAdmin();
  if (!can(u, p)) throw new Error("Not authorised");
  return u!;
}

export async function signInLocal(password: string) {
  if (!env.localAdminPassword) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(env.localAdminPassword);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + LOCAL_TTL })).toString("base64url");
  (await cookies()).set(LOCAL_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && env.siteUrl.startsWith("https"),
    path: "/",
    maxAge: LOCAL_TTL / 1000,
  });
  return true;
}

export async function signOutAll() {
  if (dataMode === "local") (await cookies()).delete(LOCAL_COOKIE);
  else await (await supabaseServer()).auth.signOut();
}
