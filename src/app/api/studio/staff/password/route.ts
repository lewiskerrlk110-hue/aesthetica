import { NextRequest, NextResponse } from "next/server";
import { hashPassword, isAuthed, sessionUser, verifyPassword } from "@/lib/studio-auth";
import { db } from "@/lib/db";

/** Any signed-in staff member: change their own password. */
export async function POST(req: NextRequest) {
  const me = await sessionUser();
  if (!(await isAuthed()) || !me) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    current?: string;
    next?: string;
  };
  const current = body.current || "";
  const next = body.next || "";
  if (next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const user = await db.staffUser.findUnique({ where: { username: me.username } });
  if (!user || !verifyPassword(current, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await db.staffUser.update({
    where: { username: me.username },
    data: { passwordHash: hashPassword(next) },
  });
  return NextResponse.json({ ok: true });
}
