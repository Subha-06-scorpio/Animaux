import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/ui/motion-provider";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK", "opsz"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ANIMAUX 2026 — Echoes of the Wild", template: "%s · ANIMAUX 2026" },
  description:
    "ANIMAUX 2026: Echoes of the Wild — the Department of Zoology's festival of wildlife, forensics, biodiversity and conservation. Explore events and register online.",
  keywords: ["ANIMAUX 2026", "zoology fest", "wildlife forensics", "conservation", "biodiversity", "college festival"],
  openGraph: {
    title: "ANIMAUX 2026 — Echoes of the Wild",
    description: "Every footprint tells a story. Every species deserves a future.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#101816" };

// Content is edited live from the admin dashboard, so render on request.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body className="min-h-screen">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
