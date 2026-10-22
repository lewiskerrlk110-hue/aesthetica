// Server-side auth for the Studio: single shared PIN (env STUDIO_PIN, default "aesthetica").
import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const STUDIO_COOKIE = "aes_studio";

function pin() {
  return process.env.STUDIO_PIN || "aesthetica";
}

export function studioToken(): string {
  return createHmac("sha256", pin()).update("aesthetica-studio-v1").digest("hex").slice(0, 32);
}

export function checkPin(input: string): boolean {
  return input === pin();
}

/** Read the request cookie store (server components / route handlers). */
export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(STUDIO_COOKIE)?.value === studioToken();
}
