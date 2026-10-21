import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, json } from "@/lib/api-utils";

// Memory Fragments — short evocative notes.
// Sample fragments are seeded with isSample=true and labelled;
// user submissions are real contributions.

export async function GET(req: NextRequest) {
  const fragments = await db.memoryFragment.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return json({ fragments });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (user.id === "anon") return bad("Identity required", 401);
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return bad("Write a fragment first");
  if (text.length > 280) return bad("Fragments stay short — 280 characters");
  const fragment = await db.memoryFragment.create({
    data: {
      text,
      authorName: user.name,
      authorId: user.id,
      isSample: false,
      artworkId: typeof body?.artworkId === "string" ? body.artworkId : null,
    },
  });
  return json({ fragment }, 201);
}
