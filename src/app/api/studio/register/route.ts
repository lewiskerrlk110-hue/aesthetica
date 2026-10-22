import { NextRequest, NextResponse } from "next/server";
import {
  STUDIO_COOKIE,
  ensureSeedStaff,
  hashPassword,
  isValidEmail,
  makeSessionToken,
} from "@/lib/studio-auth";
import { db } from "@/lib/db";

/**
 * Public registration: anyone can create a member account.
 * Members can post artworks and comments; studio privileges are reserved
 * for recognised staff (owner/editor) assigned by the site owner.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json({ error: "Display name must be 2–40 characters." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await ensureSeedStaff();

  const exists = await db.staffUser.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "An account with that email already exists — sign in instead." },
      { status: 409 },
    );
  }

  const user = await db.staffUser.create({
    data: { email, name, passwordHash: hashPassword(password), role: "member" },
  });

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
