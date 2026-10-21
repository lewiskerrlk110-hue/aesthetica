import { NextRequest } from "next/server";

// Extract anonymous identity from request headers.
export function getUser(req: NextRequest | Request): { id: string; name: string } {
  const headers = req.headers;
  const id = headers.get("x-user-id") || "anon";
  const name = decodeURIComponent(headers.get("x-user-name") || "Anonymous Dreamer");
  return { id, name: name.slice(0, 48) };
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function bad(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9- ]/gi, ""))
        .filter((t) => t.length > 0 && t.length <= 24),
    ),
  ).slice(0, 8);
}
