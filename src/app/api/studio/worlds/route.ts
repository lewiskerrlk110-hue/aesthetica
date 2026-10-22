import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/studio-auth";
import { WORLDS } from "@/lib/aesthetics";
import {
  buildMergedWorlds,
  slugify,
  starterScene,
  type OverrideRow,
  type CustomRow,
} from "@/lib/studio";

/** Public: the merged world configuration the museum renders from. */
export async function GET() {
  const [overrides, customs, siteRows] = await Promise.all([
    db.worldOverride.findMany(),
    db.customWorld.findMany(),
    db.siteSetting.findMany(),
  ]);
  const site: Record<string, string> = {};
  for (const r of siteRows) site[r.key] = r.value;
  return NextResponse.json({
    worlds: buildMergedWorlds(WORLDS, overrides as OverrideRow[], customs as CustomRow[]),
    site,
  });
}

/** Auth: create a custom world. */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    epithet?: string;
    portalBlurb?: string;
  };
  const name = (body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // unique slug
  let slug = slugify(name);
  let n = 2;
  while (await db.customWorld.findUnique({ where: { slug } })) {
    slug = `${slugify(name)}-${n++}`;
  }
  const maxOrder = await db.customWorld.aggregate({ _max: { order: true } });
  const row = await db.customWorld.create({
    data: {
      slug,
      name,
      epithet: body.epithet?.trim() || "A Custom World",
      portalBlurb: body.portalBlurb?.trim() || "A world built in the Studio.",
      order: (maxOrder._max.order ?? 100) + 1,
      theme: JSON.stringify({ accent: "#ff2e88", accent2: "#7df2d8", bg: "#0d0b14", fg: "#f4f1fa" }),
      scene: JSON.stringify(starterScene(name)),
    },
  });
  return NextResponse.json({ world: row });
}
