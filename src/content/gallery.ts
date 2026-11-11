import type { GalleryItem } from "@/lib/types";
import { eventsSeed } from "./events";

/**
 * SEED CONTENT — the official poster and the illustrated artwork of each main
 * event. Upload real photos and reels from Admin → Gallery as the fest happens.
 */
const item = (n: number, url: string, caption: string, eventLabel: string, aspect: GalleryItem["aspect"]): GalleryItem => ({
  id: `9a000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  type: "image",
  url,
  thumbnailUrl: "",
  caption,
  category: "Posters and Artwork",
  takenOn: "",
  eventLabel,
  aspect,
  visible: true,
  sortOrder: n,
  isSample: false,
});

export const gallerySeed: GalleryItem[] = [
  item(100, "/animaux26-flyer.jpg", "Official poster — Echoes of the Wild: The Survival Files", "ANIMAUX’26", "portrait"),
  ...eventsSeed
    .filter((e) => e.tier === "main")
    .map((e, i) => item(101 + i, e.posterUrl, `${e.name} — event artwork`, `Main event ${i + 1}`, "landscape")),
];
