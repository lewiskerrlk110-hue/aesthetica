import { NextRequest, NextResponse } from "next/server";
import { ensureSeedStaff, isAuthed, isOwner, isValidEmail, hashPassword } from "@/lib/studio-auth";
import { db } from "@/lib/db";

/** Owner: list the staff roster (owner/editor accounts only — members are not staff). */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Only the owner can view staff." }, { status: 403 });
  }
  await ensureSeedStaff();
  const users = await db.staffUser.findMany({
    where: { role: { in: ["owner", "editor"] } },
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }],
  });
  return NextResponse.json({ users });
}

/** Owner: add a staff account (email + password + role). */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Only the owner can manage staff." }, { status: 403 });
  }
  await ensureSeedStaff();

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    role?: string;
  };
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = body.role === "owner" ? "owner" : "editor";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const exists = await db.staffUser.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "That email is already on the staff list." }, { status: 409 });
  }

  const user = await db.staffUser.create({
    data: { email, passwordHash: hashPassword(password), role },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, user });
}
