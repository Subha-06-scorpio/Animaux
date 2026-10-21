"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaceholderArt } from "@/components/art/placeholder";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const ASPECT = { portrait: "aspect-[3/4]", landscape: "aspect-[4/3]", square: "aspect-square" };

export function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}
const isFile = (url: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/storage/v1/object/");

function Thumb({ item }: { item: GalleryItem }) {
  const yt = item.type === "video" ? youtubeId(item.url) : null;
  const src = item.thumbnailUrl || (item.type === "image" ? item.url : yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "");
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={item.caption} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />;
  if (item.type === "video" && item.url && isFile(item.url))
    return <video src={`${item.url}#t=0.5`} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-hidden />;
  return (
    <div className="h-full w-full transition duration-700 group-hover:scale-105">
      <PlaceholderArt seed={item.id} label={item.type === "video" ? "Video placeholder" : "Photo placeholder"} />
    </div>
  );
}

export function GalleryExplorer({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState<string>("All");
  const [index, setIndex] = useState<number | null>(null);
  const cats = useMemo(() => {
    const used = new Set(items.map((i) => i.category));
    return ["All", ...GALLERY_CATEGORIES.filter((c) => used.has(c)), ...[...used].filter((c) => !(GALLERY_CATEGORIES as readonly string[]).includes(c))];
  }, [items]);
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Gallery categories">
        {cats.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", cat === c ? "border-gold bg-gold text-midnight" : "border-ivory/15 text-ivory/80 hover:border-gold/60")}>
            {c}
          </button>
        ))}
      </div>

      <motion.div layout className="masonry mt-8 columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
        <AnimatePresence mode="popLayout">
          {shown.map((item, i) => (
            <motion.figure layout key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden rounded-2xl border border-ivory/10 text-left" aria-label={`Open ${item.type}: ${item.caption}`}>
                <div className={ASPECT[item.aspect]}>
                  <Thumb item={item} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                {item.type === "video" && (
                  <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/40 bg-night/60 backdrop-blur transition group-hover:scale-110 group-hover:border-gold group-hover:text-gold">
                    <Play size={20} className="ml-0.5" />
                  </span>
                )}
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-gold">{item.eventLabel || item.category}</span>
                  <span className="mt-1 block text-sm text-ivory/90">{item.caption}</span>
                </figcaption>
              </button>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>
      {!shown.length && <p className="mt-10 text-center text-ivory/60">Nothing here yet — this chapter is still being filmed.</p>}

      <AnimatePresence>{index !== null && shown[index] && <Lightbox items={shown} index={index} setIndex={setIndex} />}</AnimatePresence>
    </>
  );
}

function Lightbox({ items, index, setIndex }: { items: GalleryItem[]; index: number; setIndex: (i: number | null) => void }) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback((d: number) => setIndex((index + d + items.length) % items.length), [index, items.length, setIndex]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, setIndex]);

  const yt = item.type === "video" ? youtubeId(item.url) : null;

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={item.caption} className="fixed inset-0 z-[70] flex flex-col bg-night/95 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between p-4">
        <span className="font-mono text-xs tracking-[0.3em] text-mist">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <button ref={closeRef} type="button" onClick={() => setIndex(null)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold">
          <X size={20} />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && setIndex(null)}>
        <AnimatePresence mode="wait">
          <motion.div key={item.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex max-h-full w-full max-w-5xl flex-col items-center">
            {item.type === "image" && item.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption} className="max-h-[72svh] w-auto rounded-xl object-contain" />
            ) : yt ? (
              <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} title={item.caption} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-xl" />
            ) : item.type === "video" && item.url && isFile(item.url) ? (
              <video src={item.url} poster={item.thumbnailUrl || undefined} controls autoPlay playsInline className="max-h-[72svh] w-auto rounded-xl" />
            ) : item.type === "video" && item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Watch on the original site <ExternalLink size={16} /></a>
            ) : (
              <div className={cn("w-full max-w-xl overflow-hidden rounded-xl", ASPECT[item.aspect])}>
                <PlaceholderArt seed={item.id} label="Media placeholder — upload from the admin dashboard" />
              </div>
            )}
            <div className="mt-4 max-w-2xl text-center">
              <p className="text-ivory/90">{item.caption}</p>
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-gold">
                {[item.category, item.eventLabel, item.takenOn && formatDate(item.takenOn)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-night/60 hover:border-gold hover:text-gold sm:left-6">
              <ChevronLeft />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-night/60 hover:border-gold hover:text-gold sm:right-6">
              <ChevronRight />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
