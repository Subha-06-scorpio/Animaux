import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import { PageHero, SectionHeading } from "@/components/ui/section-heading";
import { MemberCard } from "@/components/team/member-card";
import { getVisible } from "@/lib/queries";
import { TEAM_SECTIONS, type TeamGroup, type TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "Meet the Team", description: "The faculty, student leaders and organising teams behind ANIMAUX 2026." };

const GROUPS: Record<TeamGroup, { eyebrow: string; title: string; intro: string }> = {
  faculty: { eyebrow: "The elders of the pack", title: "Faculty & Mentors", intro: "The guides who keep the science sharp and the expedition on course." },
  leadership: { eyebrow: "Leading the herd", title: "Student Leadership", intro: "The core committee steering ANIMAUX from first idea to final ceremony." },
  organizing: { eyebrow: "The colony", title: "Organising Teams", intro: "Designers, storytellers, techies, hosts, movers and makers — every role matters in an ecosystem." },
};

function sectionsFor(group: TeamGroup, members: TeamMember[]) {
  const known = TEAM_SECTIONS[group];
  const extra = [...new Set(members.filter((m) => m.group === group && !known.includes(m.section)).map((m) => m.section))];
  return [...known, ...extra]
    .map((section) => ({ section, people: members.filter((m) => m.group === group && m.section === section) }))
    .filter((s) => s.people.length);
}

export default async function TeamPage() {
  const members = await getVisible("team");
  const hasSample = members.some((m) => m.isSample);

  return (
    <>
      <PageHero eyebrow="Meet the team" title={<>The pack behind <em className="text-gold">the wild</em>.</>} intro="ANIMAUX is built by students and mentors who couldn’t stop asking questions about the natural world. Hover a card to meet their spirit animal.">
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Team sections">
          {(Object.keys(GROUPS) as TeamGroup[]).map((g) => (
            <a key={g} href={`#${g}`} className="tag border-ivory/20 py-2 text-ivory/80 hover:border-gold hover:text-gold">{GROUPS[g].title}</a>
          ))}
        </nav>
        {hasSample && <p className="mt-6 text-sm text-mist">Names and photos shown are placeholders until the team list is published.</p>}
      </PageHero>

      {(Object.keys(GROUPS) as TeamGroup[]).map((group, gi) => {
        const sections = sectionsFor(group, members);
        if (!sections.length) return null;
        const size = group === "organizing" ? "sm" : "md";
        return (
          <section key={group} id={group} className={`scroll-mt-20 py-20 ${gi % 2 ? "bg-night" : "bg-midnight"}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <SectionHeading eyebrow={GROUPS[group].eyebrow} title={GROUPS[group].title} intro={GROUPS[group].intro} />
              <div className="mt-14 space-y-14">
                {sections.map(({ section, people }) => (
                  <div key={section}>
                    <Reveal className="mb-6 flex items-center gap-4">
                      <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{section}</h3>
                      <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                      <span className="font-mono text-xs text-mist">{String(people.length).padStart(2, "0")}</span>
                    </Reveal>
                    <div className={size === "sm" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-4"}>
                      {people.map((m, i) => (
                        <Reveal key={m.id} delay={(i % 5) * 0.05}>
                          <MemberCard m={m} size={size} />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
