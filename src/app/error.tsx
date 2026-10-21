"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Signal lost</p>
      <h1 className="display mt-4 text-4xl sm:text-6xl">Something went wrong in the undergrowth.</h1>
      <p className="mt-4 max-w-md text-ivory/70">Please try again. If it keeps happening, contact the help desk.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">Try again</button>
    </main>
  );
}
