import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api-utils";

// Homepage stats: trending tags, featured creators, counts.
export async function GET(_req: NextRequest) {
  const [total, comments, artworks, creators] = await Promise.all([
    db.artwork.count(),
    db.comment.count(),
    db.artwork.findMany({
      select: { tags: true, authorName: true, authorId: true, likeCount: true },
    }),
    db.artwork.groupBy({
      by: ["authorName", "authorId"],
      where: { authorId: { not: "curator" } },
      _count: { id: true },
      _sum: { likeCount: true },
    }),
  ]);

  const tagCount: Record<string, number> = {};
  for (const a of artworks) {
    for (const t of (a.tags || "").split(",").filter(Boolean)) {
      tagCount[t] = (tagCount[t] || 0) + 1;
    }
  }
  const trending = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([tag, count]) => ({ tag, count }));

  const featuredCreators = creators
    .map((c) => ({
      name: c.authorName,
      id: c.authorId,
      works: c._count.id,
      likes: c._sum.likeCount || 0,
    }))
    .sort((a, b) => b.likes - a.likes || b.works - a.works)
    .slice(0, 6);

  return json({ total, comments, trending, featuredCreators });
}
