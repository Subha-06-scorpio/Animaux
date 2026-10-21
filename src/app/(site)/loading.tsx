import { Paw } from "@/components/art/motifs";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => <Paw key={i} className="h-5 w-5 animate-pulse text-gold" style={{ animationDelay: `${i * 0.2}s` }} />)}
      </div>
    </div>
  );
}
