import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/studio-auth";

const MAX_BYTES = 60 * 1024 * 1024; // 60MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "weba",
};

function kindOf(mime: string): string {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  if (!/^(image|video|audio)\//.test(mime)) {
    return NextResponse.json({ error: `Unsupported type: ${mime}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 60MB)" }, { status: 413 });
  }

  const ext =
    EXT_BY_MIME[mime] ||
    (file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase().slice(0, 5) : "bin");
  const stored = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, stored), buf);

  const asset = await db.studioAsset.create({
    data: {
      url: `/uploads/${stored}`,
      filename: file.name || stored,
      stored,
      kind: kindOf(mime),
      mime,
      size: file.size,
    },
  });
  return NextResponse.json({ asset });
}
