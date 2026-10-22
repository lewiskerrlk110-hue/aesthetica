import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/studio-auth";
import { WORLD_IDS } from "@/lib/aesthetics";

/** Auth: bulk-save world ordering from the drag-and-drop manager. */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    order?: { slug: string; order: number }[];
  };
  const list = body.order || [];
  for (const { slug, order } of list) {
    if ((WORLD_IDS as string[]).includes(slug)) {
      await db.worldOverride.upsert({
        where: { slug },
        create: { slug, order },
        update: { order },
      });
    } else {
      await db.customWorld.updateMany({ where: { slug }, data: { order } });
    }
  }
  return NextResponse.json({ ok: true });
}
