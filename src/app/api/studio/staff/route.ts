import { NextRequest, NextResponse } from "next/server";
import { ensureSeedStaff, isAuthed, isOwner, sessionUser, hashPassword } from "@/lib/studio-auth";
import { db } from "@/lib/db";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;

/** Owner: list the staff roster. */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }
  await ensureSeedStaff();
  const users = await db.staffUser.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }],
  });
  return NextResponse.json({ users });
}

/** Owner: add a staff account (username + password + role). */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Only the owner can manage staff." }, { status: 403 });
  }
  await ensureSeedStaff();

  const body = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
    role?: string;
  };
  const username = (body.username || "").trim();
  const password = body.password || "";
  const role = body.role === "owner" ? "owner" : "editor";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–24 characters (letters, numbers, . _ -)." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const exists = await db.staffUser.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const user = await db.staffUser.create({
    data: { username, passwordHash: hashPassword(password), role },
    select: { id: true, username: true, role: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, user });
}
