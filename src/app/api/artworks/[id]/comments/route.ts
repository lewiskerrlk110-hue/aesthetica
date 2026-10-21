import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, json } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const comments = await db.comment.findMany({
    where: { artworkId: id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  if (user.id === "anon") return bad("Identity required", 401);
  const { id } = await params;
  const art = await db.artwork.findUnique({ where: { id }, select: { id: true } });
  if (!art) return bad("Not found", 404);
  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return bad("Comment cannot be empty");
  if (text.length > 600) return bad("Comment too long (max 600 chars)");
  const comment = await db.comment.create({
    data: { artworkId: id, authorId: user.id, authorName: user.name, body: text },
  });
  return json({ comment }, 201);
}
