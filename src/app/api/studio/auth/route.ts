import { NextRequest, NextResponse } from "next/server";
import { STUDIO_COOKIE, checkPin, isAuthed, studioToken } from "@/lib/studio-auth";

export async function GET() {
  return NextResponse.json({ ok: await isAuthed() });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { pin?: string };
  if (!body.pin || !checkPin(body.pin)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set(STUDIO_COOKIE, studioToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resp;
}

export async function DELETE() {
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set(STUDIO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return resp;
}
