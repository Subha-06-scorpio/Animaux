import type { MetadataRoute } from "next";
import { getPublicEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = ["", "/about", "/events", "/register", "/team", "/gallery", "/schedule", "/contact"].map((p) => ({ url: `${base}${p}` }));
  const events = (await getPublicEvents()).map((e) => ({ url: `${base}/events/${e.slug}` }));
  return [...pages, ...events];
}
