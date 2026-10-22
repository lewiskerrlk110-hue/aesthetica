"use client";

// STUDIO — World editor: rename a world, recolor its theme, assign a
// background media wash (built-ins), or build its whole scene (customs).
import { useMemo, useState } from "react";
import { ArrowLeft, RotateCcw, Save, Trash2 } from "lucide-react";
import { WORLDS } from "@/lib/aesthetics";
import type { PortalWorldDef, SceneDoc, WorldThemePatch } from "@/lib/studio";
import { useStudioConfig } from "@/lib/worlds-config";
import { SceneEditor } from "./scene-editor";
import { MediaPicker } from "./media-library";
import { BLEND_MODES } from "@/lib/studio";

const THEME_FIELDS: { key: keyof WorldThemePatch; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "bg2", label: "Background 2" },
  { key: "fg", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "accent2", label: "Accent 2" },
  { key: "panelBorder", label: "Panel border" },
];

export function WorldEditor({ def, onBack }: { def: PortalWorldDef; onBack: () => void }) {
  const reload = useStudioConfig((s) => s.reload);
  const [name, setName] = useState(def.name);
  const [epithet, setEpithet] = useState(def.epithet);
  const [blurb, setBlurb] = useState(def.portalBlurb);
  const [theme, setTheme] = useState<WorldThemePatch>(def.theme || {});
  const [bgMediaUrl, setBgMediaUrl] = useState<string | null>(def.bgMediaUrl || null);
  const [bgSettings, setBgSettings] = useState({ opacity: 0.5, blend: "normal", fit: "cover", dim: 0.25, ...(def.bgSettings || {}) });
  const [scene, setScene] = useState<SceneDoc>(def.scene || { bg: "#0d0b14", layers: [] });
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // custom worlds open straight into the scene builder
  const [tab, setTab] = useState<"identity" | "theme" | "background" | "scene">(
    () => (def.kind === "custom" ? "scene" : "identity"),
  );

  // re-sync the whole draft when a different world is opened (render-time adjustment)
  const [lastSlug, setLastSlug] = useState(def.id);
  if (lastSlug !== def.id) {
    setLastSlug(def.id);
    setName(def.name);
    setEpithet(def.epithet);
    setBlurb(def.portalBlurb);
    setTheme(def.theme || {});
    setBgMediaUrl(def.bgMediaUrl || null);
    setBgSettings({ opacity: 0.5, blend: "normal", fit: "cover", dim: 0.25, ...(def.bgSettings || {}) });
    setScene(def.scene || { bg: "#0d0b14", layers: [] });
    setSelectedLayer(null);
    setTab(def.kind === "custom" ? "scene" : "identity");
  }

  const dirty = useMemo(() => {
    if (def.kind === "custom") {
      return JSON.stringify(scene) !== JSON.stringify(def.scene || {});
    }
    return (
      name !== def.name || epithet !== def.epithet || blurb !== def.portalBlurb ||
      JSON.stringify(theme) !== JSON.stringify(def.theme || {}) ||
      bgMediaUrl !== (def.bgMediaUrl || null)
    );
  }, [def, name, epithet, blurb, theme, bgMediaUrl, scene]);

  // static defaults for reset hints
  const staticDef = WORLDS.find((w) => w.id === def.id);

  const save = async () => {
    setSaving(true);
    const body: Record<string, unknown> = { name, epithet, portalBlurb: blurb };
    if (def.kind === "builtin") {
      body.theme = theme;
      body.bgMediaUrl = bgMediaUrl;
      body.bgSettings = bgSettings;
    } else {
      body.theme = theme;
      body.scene = scene;
    }
    const r = await fetch(`/api/studio/worlds/${def.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (r.ok) {
      setSavedAt(new Date().toLocaleTimeString());
      await reload();
    } else {
      const d = await r.json().catch(() => ({}));
      alert(d.error || "Could not save");
    }
  };

  const resetWorld = async () => {
    if (def.kind === "custom") {
      if (!confirm(`Delete the world "${def.name}" permanently?`)) return;
      await fetch(`/api/studio/worlds/${def.id}`, { method: "DELETE" });
      await reload();
      onBack();
      return;
    }
    if (!confirm(`Reset all Studio changes for "${def.name}" back to the original?`)) return;
    await fetch(`/api/studio/worlds/${def.id}`, { method: "DELETE" });
    await reload();
    onBack();
  };

  const setThemeKey = (k: keyof WorldThemePatch, v: string | null) => {
    setTheme((t) => ({ ...t, [k]: v }));
  };

  const tabs: { id: typeof tab; label: string; show: boolean }[] = [
    { id: "identity", label: "Identity", show: true },
    { id: "theme", label: "Theme colors", show: true },
    { id: "background", label: "Background media", show: def.kind === "builtin" },
    { id: "scene", label: "Scene builder", show: def.kind === "custom" },
  ];

  return (
    <div>
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/80 hover:bg-white/10">
          <ArrowLeft className="h-3.5 w-3.5" /> All worlds
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-bold text-white">{def.name}</h2>
          <p className="text-[11.5px] text-white/45">
            {def.kind === "builtin" ? "Built-in world — editable via overrides" : "Custom world — full scene builder"} · /#/world/{def.id}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {savedAt && <span className="text-[11.5px] text-[#7df2d8]">Saved {savedAt}</span>}
          {dirty && <span className="text-[11.5px] text-[#ffb347]">Unsaved changes</span>}
          <button
            onClick={resetWorld}
            className="flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-[12.5px] text-white/60 hover:border-[#ff5c7a]/50 hover:text-[#ff5c7a]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {def.kind === "custom" ? "Delete world" : "Reset"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-1.5 text-[13px] font-semibold text-black disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 flex gap-1 border-b border-white/10">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3.5 py-2 text-[13px] transition-colors ${
              tab === t.id ? "border-[#ff2e88] font-semibold text-white" : "border-transparent text-white/50 hover:text-white/85"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "identity" && (
          <div className="max-w-xl space-y-4">
            <div>
              <label className="studio-label">World name</label>
              <input className="studio-input" value={name} maxLength={48} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="studio-label">Epithet (the tagline)</label>
              <input className="studio-input" value={epithet} maxLength={80} onChange={(e) => setEpithet(e.target.value)} />
            </div>
            <div>
              <label className="studio-label">Portal blurb (shown on hover)</label>
              <textarea className="studio-input min-h-[70px]" value={blurb} maxLength={280} onChange={(e) => setBlurb(e.target.value)} />
            </div>
            <p className="text-[12px] leading-relaxed text-white/40">
              The name, epithet and blurb update the portal card on the homepage, the nav dropdown
              and the world page hero. {def.kind === "custom" ? "The slug /#/world/" + def.id + " is permanent." : ""}
            </p>
          </div>
        )}

        {tab === "theme" && (
          <div className="grid max-w-3xl gap-5 md:grid-cols-[1fr_260px]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {THEME_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="studio-label">{f.label}</label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      className="studio-color !h-[30px] !w-10 shrink-0"
                      value={String(theme[f.key] || "#000000")}
                      onChange={(e) => setThemeKey(f.key, e.target.value)}
                      aria-label={f.label}
                    />
                    <input
                      className="studio-input"
                      value={String(theme[f.key] || "")}
                      placeholder={staticDef ? String((staticDef as unknown as Record<string, string>)[f.key === "panelBorder" ? "accent" : f.key] || "") : ""}
                      onChange={(e) => setThemeKey(f.key, e.target.value || null)}
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="studio-label">Corner radius</label>
                <input
                  className="studio-input"
                  value={theme.radius || ""}
                  placeholder="e.g. 1rem / 0.5rem"
                  onChange={(e) => setThemeKey("radius", e.target.value || null)}
                />
              </div>
            </div>
            <div>
              <p className="studio-label">Live preview strip</p>
              <div
                className="overflow-hidden rounded-xl border border-white/10"
                style={{ background: theme.bg || staticDef?.bg || "#0d0b14" }}
              >
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: theme.accent || staticDef?.accent }}>World preview</p>
                  <p className="mt-1 text-[17px] font-bold" style={{ color: theme.fg || staticDef?.fg }}>{name}</p>
                  <p className="text-[12px] italic" style={{ color: theme.accent2 || staticDef?.accent2 }}>{epithet}</p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold text-black" style={{ background: theme.accent || staticDef?.accent }}>Primary</span>
                    <span className="rounded-full px-3 py-1 text-[11px] text-black" style={{ background: theme.accent2 || staticDef?.accent2 }}>Secondary</span>
                    <span className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: theme.panelBorder || "rgba(255,255,255,0.2)", color: theme.fg || staticDef?.fg }}>Panel</span>
                  </div>
                  <div className="mt-3 rounded-lg border p-2.5 text-[11.5px]" style={{ borderColor: theme.panelBorder || "rgba(255,255,255,0.2)", background: theme.bg2 || "rgba(255,255,255,0.04)", color: theme.fg || staticDef?.fg }}>
                    A panel that uses the world's variables.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTheme({})}
                className="mt-3 flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" /> Clear all theme overrides
              </button>
            </div>
          </div>
        )}

        {tab === "background" && def.kind === "builtin" && (
          <div className="max-w-2xl space-y-5">
            <p className="text-[13px] leading-relaxed text-white/55">
              Assign an image, GIF or video as a living background wash. It sits between the
              world's own canvas environment and its content — dial opacity and blend to taste.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-24 w-40 overflow-hidden rounded-xl border border-white/12 bg-black/50">
                {bgMediaUrl ? (
                  /\.(mp4|webm|mov)(\?|$)/i.test(bgMediaUrl) ? (
                    <video src={bgMediaUrl} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                  ) : (
                     
                    <img src={bgMediaUrl} alt="Background preview" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-[11.5px] text-white/35">No media assigned</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setPickerOpen(true)} className="rounded-lg bg-white/10 px-3.5 py-2 text-[13px] text-white hover:bg-white/20">
                  {bgMediaUrl ? "Replace media" : "Choose media"}
                </button>
                {bgMediaUrl && (
                  <button onClick={() => setBgMediaUrl(null)} className="rounded-lg border border-white/12 px-3.5 py-2 text-[12.5px] text-white/60 hover:text-white">
                    Remove background
                  </button>
                )}
              </div>
            </div>
            {bgMediaUrl && (
              <div className="grid max-w-md grid-cols-2 gap-3">
                <div>
                  <label className="studio-label">Opacity — {Math.round(bgSettings.opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.02} className="w-full accent-[#ff2e88]" value={bgSettings.opacity} onChange={(e) => setBgSettings({ ...bgSettings, opacity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="studio-label">Darkening wash — {Math.round(bgSettings.dim * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.02} className="w-full accent-[#ff2e88]" value={bgSettings.dim} onChange={(e) => setBgSettings({ ...bgSettings, dim: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="studio-label">Blend mode</label>
                  <select className="studio-input" value={bgSettings.blend} onChange={(e) => setBgSettings({ ...bgSettings, blend: e.target.value })}>
                    {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="studio-label">Fit</label>
                  <select className="studio-input" value={bgSettings.fit} onChange={(e) => setBgSettings({ ...bgSettings, fit: e.target.value })}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Stretch</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "scene" && def.kind === "custom" && (
          <SceneEditor doc={scene} onChange={setScene} selectedId={selectedLayer} onSelect={setSelectedLayer} />
        )}
      </div>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(url) => setBgMediaUrl(url)} />
    </div>
  );
}
