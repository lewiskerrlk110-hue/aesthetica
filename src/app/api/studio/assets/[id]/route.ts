import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/studio-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const asset = await db.studioAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await unlink(path.join(process.cwd(), "public", asset.url));
  } catch {
    /* file already gone */
  }
  await db.studioAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
