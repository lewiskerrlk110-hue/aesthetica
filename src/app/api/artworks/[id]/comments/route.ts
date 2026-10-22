import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bad, json } from "@/lib/api-utils";
import { sessionUser } from "@/lib/studio-auth";

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
  // Commenting is for signed-in accounts only; the author is forced server-side.
  const session = await sessionUser();
  if (!session) return bad("Sign in to leave a note", 401);
  const { id } = await params;
  const art = await db.artwork.findUnique({ where: { id }, select: { id: true } });
  if (!art) return bad("Not found", 404);
  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return bad("Comment cannot be empty");
  if (text.length > 600) return bad("Comment too long (max 600 chars)");
  const comment = await db.comment.create({
    data: {
      artworkId: id,
      authorId: `acct:${session.id}`,
      authorName: session.name || session.email.split("@")[0],
      body: text,
    },
  });
  return json({ comment }, 201);
}
