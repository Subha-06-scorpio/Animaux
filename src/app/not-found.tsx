import Link from "next/link";
import { Paw } from "@/components/art/motifs";

export default function NotFound() {
  return (
    <main className="topo flex min-h-screen flex-col items-center justify-center bg-midnight px-6 text-center">
      <div className="flex gap-4 opacity-60">
        {[0, 1, 2].map((i) => <Paw key={i} className="h-6 w-6 rotate-90 text-gold" style={{ transform: `rotate(90deg) translateX(${i % 2 ? 8 : -8}px)` }} />)}
      </div>
      <p className="eyebrow mt-8">Error 404 · Trail gone cold</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">These tracks lead nowhere.</h1>
      <p className="mt-4 max-w-md text-ivory/70">The page you’re looking for has wandered off. Let’s get you back to familiar territory.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">Back to base camp</Link>
        <Link href="/events" className="btn btn-ghost">Browse events</Link>
      </div>
    </main>
  );
}
