"use client";

// ─────────────────────────────────────────────
// AESTHETICA STUDIO — the site editor (staff only).
// Reach it at /#/studio — no public link anywhere on the site.
// Recognised logins only: staff accounts are managed in the Staff tab.
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Lock, LogOut, ExternalLink, LayoutDashboard, ImageIcon, Home, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { useStudioConfig } from "@/lib/worlds-config";
import { WorldsManager } from "./worlds-manager";
import { WorldEditor } from "./world-editor";
import { MediaLibrary } from "./media-library";
import { SiteSettingsForm } from "./site-settings";
import { StaffPanel, type StaffMe } from "./staff-panel";

type Tab = "worlds" | "media" | "site" | "staff";

export function LoginGate({ onUnlock }: { onUnlock: (me: StaffMe) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const r = await fetch("/api/studio/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const d = await r.json().catch(() => ({}) as { error?: string; user?: StaffMe });
    setBusy(false);
    if (r.ok && d.user) {
      onUnlock(d.user);
    } else {
      setError(d.error || "Unrecognised login — this studio is for staff only.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a10] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[15px] font-black text-black">Æ</span>
          <div>
            <h1 className="text-[17px] font-bold text-white">AESTHETICA Studio</h1>
            <p className="text-[12px] text-white/45">Staff access only — recognised logins required.</p>
          </div>
        </div>
        <label className="studio-label" htmlFor="studio-user">Username</label>
        <input
          id="studio-user"
          type="text"
          className="studio-input"
          value={username}
          autoFocus
          autoCapitalize="none"
          autoComplete="username"
          onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your staff username"
        />
        <label className="studio-label mt-3" htmlFor="studio-pass">Password</label>
        <input
          id="studio-pass"
          type="password"
          className="studio-input"
          value={password}
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
        {error && <p className="mt-2 text-[12.5px] text-[#ff5c7a]">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !username || !password}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] py-2.5 text-[14px] font-semibold text-black disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {busy ? "Checking…" : "Sign in to the Studio"}
        </button>
        <p className="mt-4 text-[11.5px] leading-relaxed text-white/35">
          This editor is reserved for the museum's staff. If you need access, ask the owner to
          create an account for you in the Staff tab.
        </p>
      </div>
    </div>
  );
}

export function Studio() {
  const navigate = useApp((s) => s.navigate);
  const worlds = useStudioConfig((s) => s.worlds);
  const reload = useStudioConfig((s) => s.reload);
  const [me, setMe] = useState<StaffMe | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("worlds");
  const [editing, setEditing] = useState<string | null>(null);
  const [mediaKey] = useState(0);

  useEffect(() => {
    fetch("/api/studio/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          setMe(d.user as StaffMe);
          setAuthed(true);
          void reload();
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
    return (
      <LoginGate
        onUnlock={(user) => {
          setMe(user);
          setAuthed(true);
          void reload();
        }}
      />
    );
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
            <span
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:flex"
              title={`Signed in as ${me.username} (${me.role})`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] to-[#7df2d8] text-[9px] font-black text-black">
                {me.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-[12px] font-medium text-white/80">{me.username}</span>
              <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                me.role === "owner" ? "bg-[#ff2e88]/20 text-[#ff8ec2]" : "bg-white/10 text-white/60"
              }`}>
                {me.role}
              </span>
            </span>
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
