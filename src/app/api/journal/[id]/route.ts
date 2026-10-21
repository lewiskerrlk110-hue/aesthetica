import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, json, parseTags } from "@/lib/api-utils";

// Lookup: ?shareId=... returns a published entry only (share links).
// Otherwise requires ownership.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  const { id } = await params;
  const shareId = req.nextUrl.searchParams.get("shareId");

  if (shareId) {
    const entry = await db.journalEntry.findUnique({ where: { shareId } });
    if (!entry || !entry.published) return bad("This entry is private or no longer shared", 404);
    return json({ entry: { ...entry, mine: false } });
  }

  const entry = await db.journalEntry.findUnique({ where: { id } });
  if (!entry) return bad("Not found", 404);
  if (entry.userId !== user.id) return bad("This journal is private", 403);
  return json({ entry: { ...entry, mine: true } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  const { id } = await params;
  const existing = await db.journalEntry.findUnique({ where: { id } });
  if (!existing) return bad("Not found", 404);
  if (existing.userId !== user.id) return bad("You can only edit your own entries", 403);

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string" && body.title.trim()) data.title = body.title.trim().slice(0, 140);
  if (typeof body?.body === "string" && body.body.trim()) data.body = body.body.trim().slice(0, 8000);
  if (typeof body?.mood === "string") data.mood = body.mood.slice(0, 32) || null;
  if (typeof body?.location === "string") data.location = body.location.slice(0, 80) || null;
  if (typeof body?.tags === "string") data.tags = parseTags(body.tags).join(",");
  if (typeof body?.published === "boolean") data.published = body.published;

  const entry = await db.journalEntry.update({ where: { id }, data });
  return json({ entry: { ...entry, mine: true } });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getUser(req);
  const { id } = await params;
  const existing = await db.journalEntry.findUnique({ where: { id } });
  if (!existing) return bad("Not found", 404);
  if (existing.userId !== user.id) return bad("You can only delete your own entries", 403);
  await db.journalEntry.delete({ where: { id } });
  return json({ ok: true });
}
