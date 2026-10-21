import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, json, bad } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId") || "";
  const art = await db.artwork.findUnique({
    where: { id },
    include: {
      _count: { select: { comments: true, likes: true, bookmarks: true } },
      comments: { orderBy: { createdAt: "desc" }, take: 50 },
      ...(userId
        ? {
            likes: { where: { userId }, select: { id: true } },
            bookmarks: { where: { userId }, select: { id: true } },
          }
        : {}),
    },
  });
  if (!art) return bad("Not found", 404);

  // related artworks: same aesthetic, exclude self
  const related = await db.artwork.findMany({
    where: { aesthetic: art.aesthetic, id: { not: art.id } },
    orderBy: [{ likeCount: "desc" }],
    take: 6,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      aesthetic: true,
      authorName: true,
      likeCount: true,
    },
  });

  const { likes, bookmarks, ...rest } = art as typeof art & {
    likes?: { id: string }[];
    bookmarks?: { id: string }[];
  };
  return json({
    artwork: {
      ...rest,
      liked: likes ? likes.length > 0 : false,
      bookmarked: bookmarks ? bookmarks.length > 0 : false,
    },
    related,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  const { id } = await params;
  const art = await db.artwork.findUnique({ where: { id } });
  if (!art) return bad("Not found", 404);
  if (art.authorId !== user.id) return bad("You can only remove your own uploads", 403);
  await db.artwork.delete({ where: { id } });
  return json({ ok: true });
}

// increments view count
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const art = await db.artwork.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => null);
  if (!art) return bad("Not found", 404);
  return json({ ok: true, viewCount: art.viewCount });
}
