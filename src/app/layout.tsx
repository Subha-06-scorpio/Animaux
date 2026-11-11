import type { Metadata, Viewport } from "next";
import { Cinzel, Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/ui/motion-provider";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK", "opsz"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-cinzel", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ANIMAUX’26 — Echoes of the Wild: The Survival Files", template: "%s · ANIMAUX’26" },
  description:
    "ANIMAUX’26: Echoes of the Wild — The Survival Files. The Department of Zoology, SVKM's Mithibai College festival of wildlife forensics and survival stories — 2 December 2026. Explore events and register online.",
  keywords: ["ANIMAUX 2026", "zoology fest", "wildlife forensics", "conservation", "biodiversity", "college festival"],
  openGraph: {
    title: "ANIMAUX’26 — Echoes of the Wild: The Survival Files",
    description: "Every footprint is a clue, every feather is evidence. 2 December 2026 · SVKM's Mithibai College.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#17110c" };

// Content is edited live from the admin dashboard, so render on request.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${cinzel.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body className="min-h-screen">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
