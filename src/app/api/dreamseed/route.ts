import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, bad } from "@/lib/api-utils";

// Serves Dreamcore lore content (postcards, cloud atlas) and
// Backrooms lore (levels, notes). All items are museum-seeded
// samples; community fiction is labelled in the UI.
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  switch (type) {
    case "postcards":
      return json({ postcards: await db.postcard.findMany({ orderBy: { createdAt: "asc" } }) });
    case "locations":
      return json({ locations: await db.cloudLocation.findMany({ orderBy: { createdAt: "asc" } }) });
    case "levels":
      return json({ levels: await db.backroomsLevel.findMany({ orderBy: { identifier: "asc" } }) });
    case "notes":
      return json({ notes: await db.backroomsNote.findMany({ orderBy: { createdAt: "asc" } }) });
    default:
      return bad("Unknown type");
  }
}
