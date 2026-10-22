"use client";

// ─────────────────────────────────────────────
// AESTHETICA — the sign-in portal at /#/studio.
// Anyone can create a member account (posting privileges);
// recognised staff (owner/editor) get the studio on sign-in.
// Staff emails stay server-side: never rendered publicly, never committed.
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Lock, LogOut, ExternalLink, LayoutDashboard, ImageIcon, Home, Users, UserPlus, Palette } from "lucide-react";
import { useApp } from "@/lib/store";
import { useStudioConfig } from "@/lib/worlds-config";
import { handleOf, type SessionUser } from "@/lib/session";
import { WorldsManager } from "./worlds-manager";
import { WorldEditor } from "./world-editor";
import { MediaLibrary } from "./media-library";
import { SiteSettingsForm } from "./site-settings";
import { StaffPanel } from "./staff-panel";

type Tab = "worlds" | "media" | "site" | "staff";
type PortalMode = "signin" | "register";

function PortalCard() {
  const navigate = useApp((s) => s.navigate);
  const [mode, setMode] = useState<PortalMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const endpoint = mode === "signin" ? "/api/studio/auth" : "/api/studio/register";
    const payload = mode === "signin" ? { email, password } : { name, email, password };
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => ({}) as { error?: string; user?: SessionUser });
    setBusy(false);
    if (r.ok && d.user) {
      window.location.hash = "#/";
      window.location.reload();
    } else {
      setError(d.error || "Something went wrong — try again.");
    }
  };

  const inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !busy) submit();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0a10] px-4">
      {/* faint aurora backdrop for the portal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(600px 320px at 22% 18%, rgba(255,46,136,0.35), transparent 60%), radial-gradient(560px 300px at 78% 82%, rgba(125,242,216,0.22), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[16px] font-black text-black shadow-[0_0_28px_-6px_rgba(255,46,136,0.7)]">Æ</span>
            <div>
              <h1 className="text-[17px] font-bold text-white">AESTHETICA</h1>
              <p className="text-[12px] font-semibold tracking-[0.18em] text-white/55">ACCOUNT PORTAL</p>
            </div>
          </div>

          {/* mode switch */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
            {(["signin", "register"] as PortalMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[13px] transition-colors ${
                  mode === m ? "bg-white/12 font-semibold text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {m === "signin" ? <Lock className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <>
              <label className="studio-label" htmlFor="portal-name">Display name</label>
              <input
                id="portal-name"
                type="text"
                className="studio-input"
                value={name}
                maxLength={40}
                onKeyDown={inputKeyDown}
                onChange={(e) => setName(e.target.value)}
                placeholder="How you appear on your posts"
              />
            </>
          )}
          <label className={`studio-label ${mode === "register" ? "mt-3" : ""}`} htmlFor="portal-email">Email</label>
          <input
            id="portal-email"
            type="email"
            className="studio-input"
            value={email}
            autoFocus
            autoCapitalize="none"
            autoComplete="email"
            onKeyDown={inputKeyDown}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label className="studio-label mt-3" htmlFor="portal-pass">Password</label>
          <input
            id="portal-pass"
            type="password"
            className="studio-input"
            value={password}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onKeyDown={inputKeyDown}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
          />
          {error && <p className="mt-2 text-[12.5px] text-[#ff5c7a]">{error}</p>}
          <button
            onClick={submit}
            disabled={busy || !email || !password || (mode === "register" && name.trim().length < 2)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] py-2.5 text-[14px] font-semibold text-black disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create my account"}
          </button>
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-white/35">
            {mode === "signin"
              ? "Members post artwork and notes · recognised staff unlock the studio"
              : "Free account — post to the museum the moment you join"}
          </p>
        </div>
        <button
          onClick={() => navigate({ view: "home" })}
          className="relative mx-auto mt-5 block text-[12.5px] text-white/45 transition-colors hover:text-white"
        >
          ← Back to the museum
        </button>
      </div>
    </div>
  );
}

/** What a member sees at #/studio — they have posting rights, not studio keys. */
function MemberCard({ user }: { user: SessionUser }) {
  const navigate = useApp((s) => s.navigate);
  const signOut = async () => {
    await fetch("/api/studio/auth", { method: "DELETE" });
    navigate({ view: "home" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a10] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center shadow-2xl">
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[16px] font-black text-black">Æ</span>
        <h1 className="text-[17px] font-bold text-white">Welcome, {handleOf(user)}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/50">
          You're signed in with a member account — you can post artwork and leave notes across the
          museum. The studio itself is reserved for staff.
        </p>
        <button
          onClick={() => navigate({ view: "upload" })}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] py-2.5 text-[14px] font-semibold text-black"
        >
          <Palette className="h-4 w-4" />
          Post your work
        </button>
        <button
          onClick={() => navigate({ view: "home" })}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 py-2.5 text-[13.5px] text-white/70 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Back to the museum
        </button>
        <button
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/40 transition-colors hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Studio() {
  const navigate = useApp((s) => s.navigate);
  const worlds = useStudioConfig((s) => s.worlds);
  const reload = useStudioConfig((s) => s.reload);
  const [me, setMe] = useState<SessionUser | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("worlds");
  const [editing, setEditing] = useState<string | null>(null);
  const [mediaKey] = useState(0);

  useEffect(() => {
    fetch("/api/studio/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          setMe(d.user as SessionUser);
          setAuthed(true);
          if (d.user.role === "owner" || d.user.role === "editor") void reload();
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0a10]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ff2e88] border-t-transparent" />
      </div>
    );
  }

  if (!authed || !me) {
    return <PortalCard />;
  }

  // Members: posting privileges only — bounce them out of the studio.
  if (me.role !== "owner" && me.role !== "editor") {
    return <MemberCard user={me} />;
  }

  const editingDef = editing ? worlds.find((w) => w.id === editing) : null;

  const logout = async () => {
    await fetch("/api/studio/auth", { method: "DELETE" });
    setMe(null);
    setAuthed(false);
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "worlds", label: "Worlds", icon: LayoutDashboard },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "site", label: "Main Page", icon: Home },
    { id: "staff", label: "Staff", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0b0a10] text-white">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0a10]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[11px] font-black text-black">Æ</span>
          <span className="text-[14px] font-bold tracking-[0.22em]">STUDIO</span>
          <nav className="ml-4 flex gap-1" aria-label="Studio sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setEditing(null); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                  tab === t.id ? "bg-white/12 font-semibold text-white" : "text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => navigate({ view: "home" })}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-white/60 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View museum
            </button>
            <button onClick={logout} aria-label="Sign out of the Studio" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7">
        {tab === "worlds" && (
          editingDef ? (
            <WorldEditor def={editingDef} onBack={() => setEditing(null)} />
          ) : (
            <WorldsManager onEdit={(slug) => { setEditing(slug); }} />
          )
        )}
        {tab === "media" && <MediaLibrary refreshKey={mediaKey} />}
        {tab === "site" && <SiteSettingsForm />}
        {tab === "staff" && <StaffPanel me={me} onMeChange={setMe} />}
      </main>

      <footer className="border-t border-white/8 py-6 text-center text-[11.5px] text-white/30">
        AESTHETICA Studio · staff only · every change is live the moment you save · draft responsibly
      </footer>
    </div>
  );
}
