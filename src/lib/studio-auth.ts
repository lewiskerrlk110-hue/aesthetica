// Server-side auth for the Staff Portal: recognised staff logins (email + password).
// Accounts live in the StaffUser table; sessions are HMAC-signed cookies that
// stay valid only while the account exists. The first owner is bootstrapped
// ONLY from the STAFF_OWNER_EMAIL / STAFF_OWNER_PASS environment variables —
// no credentials are ever hardcoded in source, and the database holding staff
// emails is local-only (gitignored).
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const STUDIO_COOKIE = "aes_studio";
const SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  email: string;
  role: string; // owner | editor
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
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

export function makeSessionToken(email: string): string {
  const exp = Date.now() + SESSION_MS;
  const payload = `${Buffer.from(email).toString("base64url")}.${exp}`;
  return `v1.${payload}.${sign(payload)}`;
}

function parseSessionToken(raw: string | undefined): string | null {
  if (!raw?.startsWith("v1.")) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [, b64e, expStr, sig] = parts;
  const payload = `${b64e}.${expStr}`;
  const good = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expStr) < Date.now()) return null;
  try {
    const email = Buffer.from(b64e, "base64url").toString("utf8");
    return EMAIL_RE.test(email) ? email : null;
  } catch {
    return null;
  }
}

// ————— staff account bootstrap (env-only, default-deny) —————

/**
 * Create the first owner account if the staff table is empty AND the
 * STAFF_OWNER_EMAIL / STAFF_OWNER_PASS environment variables are set.
 * With no env vars the portal has no accounts at all — nobody gets in.
 */
export async function ensureSeedStaff(): Promise<void> {
  const count = await db.staffUser.count();
  if (count > 0) return;
  const email = (process.env.STAFF_OWNER_EMAIL || "").trim().toLowerCase();
  const password = process.env.STAFF_OWNER_PASS || "";
  if (!email || !password || !isValidEmail(email) || password.length < 8) return;
  await db.staffUser.create({
    data: { email, passwordHash: hashPassword(password), role: "owner" },
  });
}

// ————— session resolution —————

/** Resolve the current session cookie to a live StaffUser (revocation-safe). */
export async function sessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const email = parseSessionToken(jar.get(STUDIO_COOKIE)?.value);
  if (!email) return null;
  const user = await db.staffUser.findUnique({ where: { email } });
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export async function isAuthed(): Promise<boolean> {
  return (await sessionUser()) !== null;
}

/** Current user must be an owner (for staff management endpoints). */
export async function isOwner(): Promise<boolean> {
  const u = await sessionUser();
  return u?.role === "owner";
}
