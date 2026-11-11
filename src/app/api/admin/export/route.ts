import { NextResponse, type NextRequest } from "next/server";
import { can, getAdmin } from "@/lib/auth";
import { repo } from "@/lib/data";

const cell = (v: unknown) => {
  let s = String(v ?? "");
  // Neutralise spreadsheet formula injection, but leave plain numbers like "+91 98765 43210" alone.
  if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-][\d\s-]+$/.test(s))) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV export of registrations (respects the same filters as the dashboard). */
export async function GET(req: NextRequest) {
  const user = await getAdmin();
  if (!can(user, "registrations.read")) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const r = repo();
  const [regs, events] = await Promise.all([
    r.listRegistrations({ eventId: sp.get("event") || undefined, q: sp.get("q") || undefined, status: sp.get("status") || undefined }),
    r.list("events"),
  ]);
  const questionIds = [...new Set(regs.flatMap((x) => Object.keys(x.answers)))];
  const qLabel = (id: string) => events.flatMap((e) => e.extraQuestions).find((q) => q.id === id)?.label ?? id;
  const maxMembers = Math.max(0, ...regs.map((x) => x.teamMembers.length));

  const header = [
    "Registration ID", "Event", "Status", "Registered at", "Full name", "College", "Year", "Contact number", "Email", "Team name",
    ...Array.from({ length: maxMembers }, (_, i) => [`Member ${i + 2} name`, `Member ${i + 2} phone`]).flat(),
    ...questionIds.map(qLabel),
    "Email sent",
  ];
  const rows = regs.map((x) => [
    x.regCode, x.eventName, x.status, x.createdAt, x.fullName, x.institution, x.year, x.phone, x.email, x.teamName,
    ...Array.from({ length: maxMembers }, (_, i) => [x.teamMembers[i]?.name, x.teamMembers[i]?.phone]).flat(),
    ...questionIds.map((q) => x.answers[q]),
    x.emailSent ? "yes" : "no",
  ]);
  const csv = "﻿" + [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  const ev = events.find((e) => e.id === sp.get("event"));
  const name = `animaux-registrations-${ev?.slug ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}
