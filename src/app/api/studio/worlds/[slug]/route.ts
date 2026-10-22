import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/studio-auth";
import { WORLD_IDS } from "@/lib/aesthetics";
import { parseSections, stringifySections, WORLD_SECTIONS } from "@/lib/studio";
import { releaseUploadedMedia, releaseRemovedSceneMedia } from "@/lib/media-cleanup";

type Body = {
  order?: number;
  hidden?: boolean;
  name?: string;
  epithet?: string;
  portalBlurb?: string;
  theme?: Record<string, string>;
  bgMediaUrl?: string | null;
  bgSettings?: Record<string, unknown>;
  scene?: { bg?: string; layers: unknown[] };
  sections?: { order?: string[]; hidden?: string[] } | null;
};

/** Auth: update a built-in world's override or a custom world. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as Body;

  if ((WORLD_IDS as string[]).includes(slug)) {
    // built-in → merge into the override row
    const existing = await db.worldOverride.findUnique({ where: { slug } });
    const exTheme = existing?.theme ? JSON.parse(existing.theme) : {};
    const exBg = existing?.bgSettings ? JSON.parse(existing.bgSettings) : {};
    // null / "" values in the patch clear keys (used by the Studio's reset)
    const mergePatch = (base: Record<string, unknown>, patch?: Record<string, unknown>) => {
      if (patch === undefined) return undefined;
      const merged = { ...base, ...patch };
      for (const k of Object.keys(merged)) {
        if (merged[k] === null || merged[k] === "") delete merged[k];
      }
      return JSON.stringify(merged);
    };
    const themeStr = mergePatch(exTheme, body.theme);
    const bgStr = mergePatch(exBg, body.bgSettings);
    // world-page section layout (order + hidden blocks) — null resets to default
    const sectionsStr =
      body.sections !== undefined
        ? body.sections === null
          ? null
          : stringifySections(parseSections(JSON.stringify(body.sections), [...WORLD_SECTIONS]))
        : undefined;
    const data = {
      order: body.order ?? existing?.order ?? null,
      hidden: body.hidden ?? existing?.hidden ?? false,
      name: body.name !== undefined ? body.name : existing?.name,
      epithet: body.epithet !== undefined ? body.epithet : existing?.epithet,
      portalBlurb: body.portalBlurb !== undefined ? body.portalBlurb : existing?.portalBlurb,
      theme: themeStr !== undefined ? themeStr : existing?.theme ?? null,
      bgMediaUrl: body.bgMediaUrl !== undefined ? body.bgMediaUrl : existing?.bgMediaUrl,
      bgSettings: bgStr !== undefined ? bgStr : existing?.bgSettings ?? null,
      sections: sectionsStr !== undefined ? sectionsStr : existing?.sections ?? null,
    };
    const row = await db.worldOverride.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    // housekeeping: replacing/clearing the background media releases the old upload
    if (
      body.bgMediaUrl !== undefined &&
      existing?.bgMediaUrl &&
      existing.bgMediaUrl !== body.bgMediaUrl
    ) {
      await releaseUploadedMedia(existing.bgMediaUrl, { worldSlug: slug });
    }
    return NextResponse.json({ override: row });
  }

  // custom world
  const cw = await db.customWorld.findUnique({ where: { slug } });
  if (!cw) return NextResponse.json({ error: "World not found" }, { status: 404 });
  const exTheme = cw.theme ? JSON.parse(cw.theme) : {};
  const sceneStr = body.scene !== undefined ? JSON.stringify(body.scene) : undefined;
  const data: Record<string, string | number | boolean> = {
    name: body.name !== undefined ? body.name : cw.name,
    epithet: body.epithet !== undefined ? body.epithet : cw.epithet,
    portalBlurb: body.portalBlurb !== undefined ? body.portalBlurb : cw.portalBlurb,
    order: body.order ?? cw.order,
    hidden: body.hidden ?? cw.hidden,
    theme:
      body.theme !== undefined ? JSON.stringify({ ...exTheme, ...body.theme }) : cw.theme,
    scene: sceneStr !== undefined ? sceneStr : cw.scene,
  };
  const row = await db.customWorld.update({ where: { slug }, data });
  // housekeeping: scene rewrites may have dropped media layers — release them
  if (sceneStr !== undefined) {
    await releaseRemovedSceneMedia(cw.scene, sceneStr);
  }
  return NextResponse.json({ world: row });
}

/** Auth: DELETE resets a built-in override, or deletes a custom world. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  if ((WORLD_IDS as string[]).includes(slug)) {
    const existing = await db.worldOverride.findUnique({ where: { slug } });
    await db.worldOverride.deleteMany({ where: { slug } });
    // reset releases the world's uploaded background wash, if any
    if (existing?.bgMediaUrl) {
      await releaseUploadedMedia(existing.bgMediaUrl, { worldSlug: slug });
    }
    return NextResponse.json({ ok: true, reset: true });
  }
  const cw = await db.customWorld.findUnique({ where: { slug } });
  if (!cw) return NextResponse.json({ error: "World not found" }, { status: 404 });
  await db.customWorld.delete({ where: { slug } });
  await releaseRemovedSceneMedia(cw.scene, null);
  return NextResponse.json({ ok: true });
}
