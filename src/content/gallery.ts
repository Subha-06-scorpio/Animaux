import type { GalleryItem } from "@/lib/types";

/**
 * SEED CONTENT — PLACEHOLDER GALLERY.
 * Items with an empty `url` render as illustrated placeholder frames.
 * Upload real photos/videos from Admin → Gallery.
 */
const G: Array<[string, GalleryItem["aspect"], string, GalleryItem["type"]?]> = [
  ["Behind the Scenes", "portrait", "Late-night poster session (placeholder)"],
  ["Preparations", "landscape", "Setting up the evidence stations (placeholder)"],
  ["Team Meetings", "square", "First core-committee meeting (placeholder)"],
  ["Posters and Artwork", "portrait", "Theme poster draft (placeholder)"],
  ["Event Highlights", "landscape", "Event highlight (placeholder)"],
  ["Photography", "portrait", "Field photography (placeholder)"],
  ["Videos and Reels", "portrait", "Teaser reel (placeholder)", "video"],
  ["Memories from Previous Editions", "landscape", "A previous edition (placeholder)"],
  ["Photography", "landscape", "Birding walk (placeholder)"],
  ["Behind the Scenes", "square", "Volunteers briefing (placeholder)"],
  ["Posters and Artwork", "square", "Mascot sketch (placeholder)"],
  ["Preparations", "portrait", "Specimen labels (placeholder)"],
  ["Videos and Reels", "landscape", "Behind-the-scenes reel (placeholder)", "video"],
  ["Memories from Previous Editions", "portrait", "Prize distribution (placeholder)"],
];

export const gallerySeed: GalleryItem[] = G.map(([category, aspect, caption, type], i) => ({
  id: `9a000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  type: type ?? "image",
  url: "",
  thumbnailUrl: "",
  caption,
  category,
  takenOn: "",
  eventLabel: "",
  aspect,
  visible: true,
  sortOrder: i,
  isSample: true,
}));
