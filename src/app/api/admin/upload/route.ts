import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { can, getAdmin } from "@/lib/auth";
import { dataMode } from "@/lib/config";
import { UPLOAD_DIR } from "@/lib/uploads";

/** Local development uploads only. In Supabase mode files go straight to Storage via signed URLs. */
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif",
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "application/pdf": "pdf",
};

export async function POST(req: Request) {
  if (dataMode !== "local") return NextResponse.json({ error: "Use signed uploads in Supabase mode" }, { status: 400 });
  const user = await getAdmin();
  if (!can(user, "content.write") && !can(user, "settings.write")) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "File too large (100 MB max)" }, { status: 413 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/media/${name}` });
}
