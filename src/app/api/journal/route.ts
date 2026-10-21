import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, json, parseTags } from "@/lib/api-utils";

// Dream Journal — entries are PRIVATE by default and scoped to the
// anonymous device identity on the server. `published` entries appear
// in the community stream only when explicitly published by the owner.

export async function GET(req: NextRequest) {
  const user = getUser(req);
  const scope = req.nextUrl.searchParams.get("scope") || "mine";

  if (scope === "published") {
    const entries = await db.journalEntry.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        body: true,
        mood: true,
        location: true,
        tags: true,
        published: true,
        shareId: true,
        createdAt: true,
        userId: true,
      },
    });
    // author display names come from identity pool; we only expose title/mood/tag metadata
    return json({
      entries: entries.map((e) => ({ ...e, body: e.published ? e.body : "", mine: false })),
    });
  }

  if (user.id === "anon") return json({ entries: [] });
  const entries = await db.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return json({ entries: entries.map((e) => ({ ...e, mine: true })) });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (user.id === "anon") return bad("Identity required", 401);
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!title) return bad("Give the dream a title");
  if (!text) return bad("Write something about the dream");
  if (title.length > 140) return bad("Title too long");
  if (text.length > 8000) return bad("Entry too long");

  const entry = await db.journalEntry.create({
    data: {
      userId: user.id,
      title: title.slice(0, 140),
      body: text.slice(0, 8000),
      mood: typeof body?.mood === "string" ? body.mood.slice(0, 32) : null,
      location: typeof body?.location === "string" ? body.location.slice(0, 80) : null,
      tags: parseTags(typeof body?.tags === "string" ? body.tags : "").join(","),
      published: false, // always private by default
    },
  });
  return json({ entry: { ...entry, mine: true } }, 201);
}
