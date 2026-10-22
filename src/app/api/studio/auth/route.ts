import { NextRequest, NextResponse } from "next/server";
import {
  STUDIO_COOKIE,
  ensureSeedStaff,
  isAuthed,
  isValidEmail,
  makeSessionToken,
  sessionUser,
  verifyPassword,
} from "@/lib/studio-auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await sessionUser();
  return NextResponse.json({
    ok: user !== null,
    user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  await ensureSeedStaff();

  const user = await db.staffUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Unrecognised login — check your email and password." },
      { status: 401 },
    );
  }

  const resp = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  resp.cookies.set(STUDIO_COOKIE, makeSessionToken(user.email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resp;
}

export async function DELETE() {
  const resp = NextResponse.json({ ok: true, authed: await isAuthed() });
  resp.cookies.set(STUDIO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return resp;
}
