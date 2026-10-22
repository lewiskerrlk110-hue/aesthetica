// Server-side media housekeeping for the Studio.
// When a background/hero slot swaps to new media (or is cleared), the OLD
// uploaded file should not linger in public/uploads as an orphan. This
// helper releases an uploaded URL — deleting the StudioAsset row and the
// file on disk — but only when no other content still references it.
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

/** True if the url points at a Studio-uploaded file (/uploads/<name>). */
export function isUploadedUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith("/uploads/") && !url.includes("..") && !url.includes("//");
}

/** Every /uploads/ url embedded in a JSON blob (scene layers etc.). */
export function uploadedUrlsInJson(json: string | null | undefined): string[] {
  if (!json) return [];
  return [...new Set(json.match(/\/uploads\/[A-Za-z0-9._-]+/g) ?? [])];
}

/** Does ANY live content still point at this url? */
async function stillReferenced(url: string, except?: { worldSlug?: string }): Promise<boolean> {
  const [overrides, site, customs, artworks, fragments] = await Promise.all([
    db.worldOverride.findMany({ where: { bgMediaUrl: url }, select: { slug: true } }),
    db.siteSetting.count({ where: { value: url } }),
    db.customWorld.findMany({ select: { slug: true, scene: true } }),
    db.artwork.count({ where: { imageUrl: url } }),
    db.memoryFragment.count({ where: { text: { contains: url } } }),
  ]);
  // world override refs: ignore the world currently being saved/reset
  if (overrides.some((o) => o.slug !== except?.worldSlug)) return true;
  if (site > 0) return true;
  if (customs.some((c) => uploadedUrlsInJson(c.scene).includes(url))) return true;
  if (artworks > 0 || fragments > 0) return true;
  return false;
}

/**
 * Release an uploaded media url: delete its StudioAsset row and the file on
 * disk — unless other content still references it. Safe to call on any url
 * (non-uploaded urls are ignored). Returns true when a file was removed.
 */
export async function releaseUploadedMedia(
  url: string | null | undefined,
  except?: { worldSlug?: string },
): Promise<boolean> {
  if (!isUploadedUrl(url)) return false;
  const target = url!;
  try {
    if (await stillReferenced(target, except)) return false;
    await db.studioAsset.deleteMany({ where: { url: target } });
    try {
      await unlink(path.join(process.cwd(), "public", target));
    } catch {
      /* file already gone — the row cleanup still mattered */
    }
    return true;
  } catch {
    /* housekeeping must never break the save */
    return false;
  }
}

/** Release every uploaded url that disappeared from a scene JSON rewrite. */
export async function releaseRemovedSceneMedia(oldJson: string | null | undefined, newJson: string | null | undefined): Promise<void> {
  const kept = new Set(uploadedUrlsInJson(newJson));
  const removed = uploadedUrlsInJson(oldJson).filter((u) => !kept.has(u));
  for (const url of removed) await releaseUploadedMedia(url);
}
