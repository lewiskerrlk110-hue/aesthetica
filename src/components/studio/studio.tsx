"use client";

// ─────────────────────────────────────────────
// AESTHETICA STUDIO — the site editor.
// Reach it at /#/studio (or the wrench button in the nav).
// Worlds · Media · Site — protected by a shared PIN.
// ─────────────────────────────────────────────
import { useEffect, useState } from "react";
import { Lock, LogOut, ExternalLink, LayoutDashboard, ImageIcon, Settings2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useStudioConfig } from "@/lib/worlds-config";
import { WorldsManager } from "./worlds-manager";
import { WorldEditor } from "./world-editor";
import { MediaLibrary } from "./media-library";
import { SiteSettingsForm } from "./site-settings";

type Tab = "worlds" | "media" | "site";

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const r = await fetch("/api/studio/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setBusy(false);
    if (r.ok) onUnlock();
    else setError("Incorrect PIN — try again.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a10] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[15px] font-black text-black">Æ</span>
          <div>
            <h1 className="text-[17px] font-bold text-white">AESTHETICA Studio</h1>
            <p className="text-[12px] text-white/45">The editor for every part of the museum.</p>
          </div>
        </div>
        <label className="studio-label" htmlFor="studio-pin">Studio PIN</label>
        <input
          id="studio-pin"
          type="password"
          className="studio-input"
          value={pin}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your PIN"
        />
        {error && <p className="mt-2 text-[12.5px] text-[#ff5c7a]">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !pin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] py-2.5 text-[14px] font-semibold text-black disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {busy ? "Checking…" : "Unlock the Studio"}
        </button>
        <p className="mt-4 text-[11.5px] leading-relaxed text-white/35">
          Tip: the default PIN is <code className="rounded bg-white/10 px-1 py-0.5">aesthetica</code> — change it any
          time by setting the STUDIO_PIN environment variable.
        </p>
      </div>
    </div>
  );
}

export function Studio() {
  const navigate = useApp((s) => s.navigate);
  const worlds = useStudioConfig((s) => s.worlds);
  const reload = useStudioConfig((s) => s.reload);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("worlds");
  const [editing, setEditing] = useState<string | null>(null);
  const [mediaKey] = useState(0);

  useEffect(() => {
    fetch("/api/studio/auth")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(!!d.ok);
        if (d.ok) void reload();
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

  if (!authed) {
    return <PinGate onUnlock={() => { setAuthed(true); void reload(); }} />;
  }

  const editingDef = editing ? worlds.find((w) => w.id === editing) : null;

  const logout = async () => {
    await fetch("/api/studio/auth", { method: "DELETE" });
    setAuthed(false);
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "worlds", label: "Worlds", icon: LayoutDashboard },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "site", label: "Site", icon: Settings2 },
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
            <button onClick={logout} aria-label="Lock the Studio" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
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
      </main>

      <footer className="border-t border-white/8 py-6 text-center text-[11.5px] text-white/30">
        AESTHETICA Studio · every change is live the moment you save · draft responsibly
      </footer>
    </div>
  );
}
