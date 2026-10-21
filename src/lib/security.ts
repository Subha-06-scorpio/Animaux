import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { env } from "./config";

/**
 * Simple fixed-window rate limiter kept in memory.
 * Good enough for a single server / a few serverless instances; for strict
 * global limits swap this for Upstash Redis (see docs/SETUP.md).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  return b.count > limit ? { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Store a salted hash, never the raw IP. */
export const hashIp = (ip: string) => createHash("sha256").update(env.ipSalt + ip).digest("hex").slice(0, 32);

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L confusion

/** e.g. ANX26-FOR-7K2QD */
export function makeRegCode(slug: string) {
  const prefix = slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  const bytes = randomBytes(5);
  const tail = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `ANX26-${prefix}-${tail}`;
}
