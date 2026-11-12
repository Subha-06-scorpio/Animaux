import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import { PageHero, SectionHeading } from "@/components/ui/section-heading";
import { MemberCard } from "@/components/team/member-card";
import { DEPARTMENT_MOTTOS } from "@/content/team";
import { getSettings, getVisible } from "@/lib/queries";
import { TEAM_SECTIONS, type TeamGroup, type TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "Meet the Team", description: "The minds behind the mystery: mentors, coordinators and departments of ANIMAUX’26 at SVKM's Mithibai College." };

/** Faculty + leadership share one "command" row; departments get unit panels. */
const BLOCKS = [
  { id: "command", groups: ["faculty", "leadership"] as TeamGroup[], eyebrow: "Case command", title: "Mentors & Coordinators", intro: "Keeping the science sharp and steering ANIMAUX from the first clue to the final verdict." },
  { id: "organizing", groups: ["organizing"] as TeamGroup[], eyebrow: "The task force", title: "Departments", intro: "The minds behind the mystery — eight departments, one investigation." },
];

function sectionsFor(group: TeamGroup, members: TeamMember[]) {
  const known = TEAM_SECTIONS[group];
  const extra = [...new Set(members.filter((m) => m.group === group && !known.includes(m.section)).map((m) => m.section))];
  return [...known, ...extra]
    .map((section) => ({ section, people: members.filter((m) => m.group === group && m.section === section) }))
    .filter((s) => s.people.length);
}

export default async function TeamPage() {
  const [members, settings] = await Promise.all([getVisible("team"), getSettings()]);
  const volunteers = settings.volunteers ?? [];
  const volunteersPhoto = settings.volunteersPhotoUrl ?? "";
  const hasSample = members.some((m) => m.isSample);
  const command = (["faculty", "leadership"] as TeamGroup[]).flatMap((g) => sectionsFor(g, members).flatMap((s) => s.people));
  const units = sectionsFor("organizing", members);

  return (
    <>
      <PageHero eyebrow="Meet the team" title={<>The pack behind <em className="text-gold">the wild</em>.</>} intro="ANIMAUX is built by the students and mentors of the Department of Zoology, SVKM’s Mithibai College — people who couldn’t stop asking questions about the natural world.">
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Team sections">
          {BLOCKS.map((b) => (
            <a key={b.id} href={`#${b.id}`} className="tag border-ivory/20 py-2 text-ivory/80 hover:border-gold hover:text-gold">{b.title}</a>
          ))}
          {(volunteers.length > 0 || volunteersPhoto) && (
            <a href="#volunteers" className="tag border-ivory/20 py-2 text-ivory/80 hover:border-gold hover:text-gold">Volunteers</a>
          )}
        </nav>
        {hasSample && <p className="mt-6 text-sm text-mist">Some entries are placeholders until the team list is final.</p>}
      </PageHero>

      {command.length > 0 && (
        <section id="command" className="scroll-mt-20 bg-midnight py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow={BLOCKS[0].eyebrow} title={BLOCKS[0].title} intro={BLOCKS[0].intro} />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {command.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 0.06}>
                  <MemberCard m={m} size="md" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {units.length > 0 && (
        <section id="organizing" className="scroll-mt-20 bg-night py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow={BLOCKS[1].eyebrow} title={BLOCKS[1].title} intro={BLOCKS[1].intro} />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {units.map(({ section, people }, si) => (
                <Reveal key={section} delay={(si % 4) * 0.05} className="rounded-2xl border border-ivory/10 bg-midnight/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-title text-base font-bold uppercase tracking-[0.12em] text-gold">{section}</h3>
                    <span className="font-mono text-[0.6rem] tracking-widest text-mist">UNIT {String(si + 1).padStart(2, "0")}</span>
                  </div>
                  {DEPARTMENT_MOTTOS[section] && <p className="mb-4 text-sm leading-relaxed text-ivory/70">{DEPARTMENT_MOTTOS[section]}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    {people.map((m) => <MemberCard key={m.id} m={m} size="sm" />)}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {(volunteers.length > 0 || volunteersPhoto) && (
        <section id="volunteers" className="scroll-mt-20 bg-midnight py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow="Boots on the ground" title="Volunteers" intro="The field team that keeps every case running — from the first clue to the final verdict." />
            {volunteersPhoto && (
              <Reveal className="mt-12 overflow-hidden rounded-3xl border border-gold/25 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={volunteersPhoto} alt="ANIMAUX’26 volunteers group photo" loading="lazy" className="w-full object-cover" />
              </Reveal>
            )}
            {volunteers.length > 0 && (
              <Reveal className="mt-10">
                <p className="eyebrow mb-4">{volunteers.length} volunteer{volunteers.length === 1 ? "" : "s"}</p>
                <ul className="flex flex-wrap gap-2">
                  {volunteers.map((v) => (
                    <li key={v} className="rounded-full border border-ivory/15 bg-night/60 px-4 py-2 text-sm text-ivory/90">{v}</li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      )}
    </>
  );
}
