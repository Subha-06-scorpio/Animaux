import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { dataMode } from "@/lib/config";
import { repo } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/security";
import { SUBMISSION_MAX_BYTES, SUBMISSION_TYPES, UPLOAD_DIR } from "@/lib/uploads";

/**
 * Participant photo upload (e.g. Shutter Safari) — LOCAL DEVELOPMENT ONLY.
 * In Supabase mode the browser uploads straight to Storage with a signed URL
 * from createSubmissionUploadAction.
 */
export async function POST(req: Request) {
  if (dataMode !== "local") return NextResponse.json({ error: "Not available" }, { status: 404 });
  const ip = await clientIp();
  if (!rateLimit(`upload:${ip}`, 10, 10 * 60_000).ok) return NextResponse.json({ error: "Too many uploads — try again in a few minutes." }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  const eventId = String(form.get("eventId") ?? "");
  const ev = await repo().get("events", eventId);
  if (!ev?.visible || !ev.extraQuestions.some((q) => q.type === "file")) return NextResponse.json({ error: "This event does not accept uploads." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = SUBMISSION_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 415 });
  if (file.size > SUBMISSION_MAX_BYTES) return NextResponse.json({ error: "Photo is larger than 10 MB." }, { status: 413 });

  const dir = path.join(UPLOAD_DIR, "submissions");
  await fs.mkdir(dir, { recursive: true });
  const name = `${ev.slug}-${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/media/submissions/${name}` });
}
