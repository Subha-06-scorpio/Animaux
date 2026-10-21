import type { Metadata } from "next";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { can, requirePage } from "@/lib/auth";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Registrations" };

export default async function RegistrationsPage({ searchParams }: PageProps<"/admin/registrations">) {
  const user = await requirePage("registrations.read");
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const filters = { event: one(sp.event), q: one(sp.q), status: one(sp.status) };
  const r = repo();
  const [regs, events] = await Promise.all([
    r.listRegistrations({ eventId: filters.event || undefined, q: filters.q || undefined, status: filters.status || undefined }),
    r.list("events"),
  ]);
  return (
    <div>
      <p className="eyebrow">Participants</p>
      <h1 className="display mt-2 text-4xl">Registrations</h1>
      <RegistrationsTable
        regs={regs}
        events={events.map(({ id, name, extraQuestions }) => ({ id, name, extraQuestions }))}
        filters={filters}
        canDelete={can(user, "registrations.delete")}
        canWrite={can(user, "registrations.write")}
      />
    </div>
  );
}
