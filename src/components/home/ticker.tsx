import { CrimeTape } from "@/components/art/crime-tape";
import type { Announcement } from "@/lib/types";

/** Announcements as crossed crime-scene tape under the hero. */
export function Ticker({ items }: { items: Announcement[] }) {
  const news = items.map((a) => a.title);
  return (
    <div className="relative z-10 -mt-10 h-36 overflow-hidden sm:h-40">
      <CrimeTape tone="ember" reverse items={["Do not cross", "Evidence zone", "Investigation in progress"]} className="absolute -left-24 -right-24 top-10 rotate-[3deg] opacity-80" />
      <CrimeTape label="Announcements" items={["Crime scene — do not cross", ...news, "ANIMAUX 2026"]} className="absolute -left-24 -right-24 top-14 -rotate-2" />
    </div>
  );
}
