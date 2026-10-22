// Server-side auth for the Studio: recognised staff logins (username + password).
// Accounts live in the StaffUser table; sessions are HMAC-signed cookies that
// stay valid only while the account exists. The first owner account is seeded
// lazily from STAFF_OWNER_USER / STAFF_OWNER_PASS (defaults: lewis / aesthetica-owner).
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const STUDIO_COOKIE = "aes_studio";
const SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  username: string;
  role: string; // owner | editor
}

// ————— password hashing (scrypt, no extra deps) —————

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `s1:${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [v, salt, hash] = stored.split(":");
  if (v !== "s1" || !salt || !hash) return false;
  const test = scryptSync(pw, salt, 64);
  const orig = Buffer.from(hash, "hex");
  return test.length === orig.length && timingSafeEqual(test, orig);
}

// ————— signed session tokens —————

function secret(): string {
  return process.env.STUDIO_SECRET || "aesthetica-studio-secret-v1";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function makeSessionToken(username: string): string {
  const exp = Date.now() + SESSION_MS;
  const payload = `${Buffer.from(username).toString("base64url")}.${exp}`;
  return `v1.${payload}.${sign(payload)}`;
}

function parseSessionToken(raw: string | undefined): string | null {
  if (!raw?.startsWith("v1.")) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [, b64u, expStr, sig] = parts;
  const payload = `${b64u}.${expStr}`;
  const good = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expStr) < Date.now()) return null;
  try {
    const username = Buffer.from(b64u, "base64url").toString("utf8");
    return username || null;
  } catch {
    return null;
  }
}

// ————— staff account bootstrap —————

/** Create the first owner account if the staff table is empty. */
export async function ensureSeedStaff(): Promise<void> {
  const count = await db.staffUser.count();
  if (count > 0) return;
  const username = (process.env.STAFF_OWNER_USER || "lewis").trim();
  const password = process.env.STAFF_OWNER_PASS || "aesthetica-owner";
  await db.staffUser.create({
    data: { username, passwordHash: hashPassword(password), role: "owner" },
  });
}

// ————— session resolution —————

/** Resolve the current session cookie to a live StaffUser (revocation-safe). */
export async function sessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const username = parseSessionToken(jar.get(STUDIO_COOKIE)?.value);
  if (!username) return null;
  const user = await db.staffUser.findUnique({ where: { username } });
  if (!user) return null;
  return { id: user.id, username: user.username, role: user.role };
}

export async function isAuthed(): Promise<boolean> {
  return (await sessionUser()) !== null;
}

/** Current user must be an owner (for staff management endpoints). */
export async function isOwner(): Promise<boolean> {
  const u = await sessionUser();
  return u?.role === "owner";
}
