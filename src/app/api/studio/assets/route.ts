import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/studio-auth";

export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assets = await db.studioAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
}
