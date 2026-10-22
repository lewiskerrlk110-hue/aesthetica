import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, json, bad, parseTags } from "@/lib/api-utils";
import { sessionUser } from "@/lib/studio-auth";

const AESTHETICS = [
  "retrowave",
  "synthwave",
  "vaporwave",
  "y2k",
  "dreamcore",
  "cyberpunk",
  "liminal",
  "backrooms",
];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const aesthetic = sp.get("aesthetic");
  const tag = sp.get("tag");
  const q = sp.get("q");
  const featured = sp.get("featured");
  const authorId = sp.get("authorId");
  const bookmarkedBy = sp.get("bookmarkedBy");
  const sort = sp.get("sort") || "recent";
  const limit = Math.min(parseInt(sp.get("limit") || "60", 10) || 60, 100);
  const userId = sp.get("userId") || "";

  const where: Record<string, unknown> = {};
  if (aesthetic && AESTHETICS.includes(aesthetic)) where.aesthetic = aesthetic;
  if (featured === "1") where.featured = true;
  if (authorId) where.authorId = authorId;
  if (tag) where.tags = { contains: tag };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q.toLowerCase() } },
      { authorName: { contains: q } },
    ];
  }
  if (bookmarkedBy) {
    const marks = await db.bookmark.findMany({ where: { userId: bookmarkedBy } });
    where.id = { in: marks.map((m) => m.artworkId) };
  }

  const orderBy =
    sort === "popular" ? [{ likeCount: "desc" as const }, { viewCount: "desc" as const }] : [{ createdAt: "desc" as const }];

  const artworks = await db.artwork.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      _count: { select: { comments: true, likes: true, bookmarks: true } },
      ...(userId
        ? {
            likes: { where: { userId }, select: { id: true } },
            bookmarks: { where: { userId }, select: { id: true } },
          }
        : {}),
    },
  });

  return json({
    artworks: artworks.map((a) => {
      const { likes, bookmarks, ...rest } = a as typeof a & {
        likes?: { id: string }[];
        bookmarks?: { id: string }[];
      };
      return {
        ...rest,
        liked: likes ? likes.length > 0 : false,
        bookmarked: bookmarks ? bookmarks.length > 0 : false,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  // Posting is for signed-in accounts only; the author is forced server-side.
  const session = await sessionUser();
  if (!session) return bad("Sign in to post your work", 401);
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");
  const { title, description, imageUrl, aesthetic, medium, tags, year } = body as Record<string, unknown>;
  if (!title || typeof title !== "string" || title.trim().length === 0)
    return bad("Title required");
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("data:image/"))
    return bad("Image data URL required");
  if (imageUrl.length > 3_500_000) return bad("Image too large (max ~2.5MB)", 413);
  if (!aesthetic || !AESTHETICS.includes(aesthetic as string))
    return bad("Unknown aesthetic");

  const art = await db.artwork.create({
    data: {
      title: title.trim().slice(0, 120),
      description: typeof description === "string" ? description.trim().slice(0, 600) : null,
      imageUrl,
      aesthetic: aesthetic as string,
      medium: typeof medium === "string" ? medium : "digital",
      year: typeof year === "number" ? Math.round(year) : null,
      authorName: session.name || session.email.split("@")[0],
      authorId: `acct:${session.id}`,
      tags: parseTags(typeof tags === "string" ? tags : Array.isArray(tags) ? tags.join(",") : "").join(","),
      featured: false,
    },
  });
  return json({ artwork: art }, 201);
}
