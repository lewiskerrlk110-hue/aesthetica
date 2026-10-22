"use client";

// Client-side session hook: resolves the signed-in account (member or staff)
// from /api/studio/auth. Null user = visitor; role drives privileges
// (member → post, owner/editor → studio).
import { useCallback, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string; // owner | editor | member
}

interface SessionState {
  loading: boolean;
  user: SessionUser | null;
  refresh: () => Promise<void>;
}

let cache: { user: SessionUser | null; ts: number } | null = null;
const listeners = new Set<(u: SessionUser | null) => void>();

function broadcast(user: SessionUser | null) {
  cache = { user, ts: Date.now() };
  listeners.forEach((fn) => fn(user));
}

export function useSession(): SessionState {
  const [user, setUser] = useState<SessionUser | null>(cache?.user ?? null);
  const [loading, setLoading] = useState(cache === null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/studio/auth", { cache: "no-store" });
      const d = (await r.json()) as { ok: boolean; user: SessionUser | null };
      broadcast(d.ok && d.user ? d.user : null);
    } catch {
      broadcast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.add(setUser);
    if (cache === null || Date.now() - cache.ts > 30_000) void refresh();
    return () => { listeners.delete(setUser); };
  }, [refresh]);

  // Sign-in / sign-out from other tabs or the studio propagates on focus.
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return { loading, user, refresh };
}

/** Display handle: account name if set, else the email's local part. */
export function handleOf(user: SessionUser | null): string {
  if (!user) return "";
  return user.name?.trim() || user.email.split("@")[0];
}
