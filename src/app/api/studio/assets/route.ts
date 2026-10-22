import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/studio-auth";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assets = await db.studioAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
}
