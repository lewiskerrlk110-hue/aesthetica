import { NextRequest, NextResponse } from "next/server";
import { isAuthed, isOwner, sessionUser } from "@/lib/studio-auth";
import { db } from "@/lib/db";

/** Owner: remove a staff account. Guards: cannot remove yourself, cannot remove the last owner. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Only the owner can manage staff." }, { status: 403 });
  }

  const { id } = await params;
  const me = await sessionUser();
  const target = await db.staffUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (me && target.email === me.email) {
    return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 });
  }
  if (target.role === "owner") {
    const owners = await db.staffUser.count({ where: { role: "owner" } });
    if (owners <= 1) {
      return NextResponse.json({ error: "There must be at least one owner." }, { status: 400 });
    }
  }

  await db.staffUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
