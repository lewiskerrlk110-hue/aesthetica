import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, json } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  if (user.id === "anon") return bad("Identity required", 401);
  const { id } = await params;
  const art = await db.artwork.findUnique({ where: { id } });
  if (!art) return bad("Not found", 404);

  const existing = await db.bookmark.findUnique({
    where: { artworkId_userId: { artworkId: id, userId: user.id } },
  });

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
    return json({ bookmarked: false });
  }
  await db.bookmark.create({ data: { artworkId: id, userId: user.id } });
  return json({ bookmarked: true });
}
