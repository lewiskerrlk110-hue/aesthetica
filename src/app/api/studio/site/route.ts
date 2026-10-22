import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/studio-auth";
import { DEFAULT_SITE } from "@/lib/studio";
import { releaseUploadedMedia } from "@/lib/media-cleanup";

export async function GET() {
  const rows = await db.siteSetting.findMany();
  const site: Record<string, string> = {};
  for (const r of rows) site[r.key] = r.value;
  return NextResponse.json({ site: { ...DEFAULT_SITE, ...site } });
}

export async function PUT(req: NextRequest) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<typeof DEFAULT_SITE>;
  // capture the current hero media so a replaced/cleared upload can be released
  const oldHero = await db.siteSetting.findUnique({ where: { key: "heroMediaUrl" } });
  for (const key of Object.keys(DEFAULT_SITE) as (keyof typeof DEFAULT_SITE)[]) {
    if (body[key] !== undefined) {
      await db.siteSetting.upsert({
        where: { key },
        create: { key, value: body[key] },
        update: { value: body[key] },
      });
    }
  }
  // housekeeping: swapping/clearing the hero background releases the old upload
  if (
    body.heroMediaUrl !== undefined &&
    oldHero?.value &&
    oldHero.value !== body.heroMediaUrl
  ) {
    await releaseUploadedMedia(oldHero.value);
  }
  const rows = await db.siteSetting.findMany();
  const site: Record<string, string> = {};
  for (const r of rows) site[r.key] = r.value;
  return NextResponse.json({ site: { ...DEFAULT_SITE, ...site } });
}
