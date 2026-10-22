import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, bad } from "@/lib/api-utils";

const SEL = {
  id: true,
  title: true,
  imageUrl: true,
  aesthetic: true,
  medium: true,
  year: true,
  authorName: true,
  likeCount: true,
  tags: true,
} as const;

// Candidate pool for the client-side "visually similar" ranking:
// tag matches first (rarest signal), then same medium, then the same
// aesthetic as a broad fallback — deduped, capped at 30 for fast
// in-browser histogram comparison.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const art = await db.artwork.findUnique({
    where: { id },
    select: { id: true, aesthetic: true, medium: true, tags: true },
  });
  if (!art) return bad("Not found", 404);

  const tagWords = art.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [tagMatch, sameMedium, sameAesthetic] = await Promise.all([
    tagWords.length
      ? db.artwork.findMany({
          where: {
            id: { not: id },
            OR: tagWords.map((t) => ({ tags: { contains: t } })),
          },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: SEL,
        })
      : Promise.resolve([]),
    db.artwork.findMany({
      where: { id: { not: id }, medium: art.medium },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: SEL,
    }),
    db.artwork.findMany({
      where: { id: { not: id }, aesthetic: art.aesthetic },
      orderBy: { likeCount: "desc" },
      take: 12,
      select: SEL,
    }),
  ]);

  const seen = new Set([id]);
  const candidates: (typeof sameAesthetic) = [];
  for (const list of [tagMatch, sameMedium, sameAesthetic]) {
    for (const a of list) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        candidates.push(a);
      }
    }
  }

  return json({ candidates: candidates.slice(0, 30) });
}
