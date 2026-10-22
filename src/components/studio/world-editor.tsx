"use client";

// STUDIO — World editor: rename a world, recolor its theme, assign a
// background media wash (built-ins), build its whole scene (customs), and
// the Type & FX / Position labs — genre font packs, hero title effects,
// hero layout controls — all mirrored live in the preview panel.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RotateCcw, Save, Trash2, Sparkles } from "lucide-react";
import { WORLDS } from "@/lib/aesthetics";
import type { PortalWorldDef, SceneDoc, WorldThemePatch, BgSettings } from "@/lib/studio";
import { GENRE_PACKS, effectClass, fontStack, type GenrePack } from "@/lib/studio";
import { useStudioConfig, publishWorldDraft, type WorldDraftPatch } from "@/lib/worlds-config";
import { SceneEditor } from "./scene-editor";
import { MediaPicker } from "./media-library";
import { FontPicker, EffectPicker, AlignPicker, SliderRow, type AlignValue } from "./design-controls";
import { LivePreview } from "./preview-panel";
import { BLEND_MODES } from "@/lib/studio";

const THEME_FIELDS: { key: keyof WorldThemePatch; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "bg2", label: "Background 2" },
  { key: "fg", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "accent2", label: "Accent 2" },
  { key: "panelBorder", label: "Panel border" },
];

type EditorTab = "identity" | "type" | "position" | "theme" | "background" | "scene";

export function WorldEditor({ def, onBack }: { def: PortalWorldDef; onBack: () => void }) {
  const reload = useStudioConfig((s) => s.reload);
  const [name, setName] = useState(def.name);
  const [epithet, setEpithet] = useState(def.epithet);
  const [blurb, setBlurb] = useState(def.portalBlurb);
  const [theme, setTheme] = useState<WorldThemePatch>(def.theme || {});
  const [bgMediaUrl, setBgMediaUrl] = useState<string | null>(def.bgMediaUrl || null);
  const [bgSettings, setBgSettings] = useState<Partial<BgSettings>>({ opacity: 0.5, blend: "normal", fit: "cover", dim: 0.25, ...(def.bgSettings || {}) });
  const [scene, setScene] = useState<SceneDoc>(def.scene || { bg: "#0d0b14", layers: [] });
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // custom worlds open straight into the scene builder
  const [tab, setTab] = useState<EditorTab>(() => (def.kind === "custom" ? "scene" : "identity"));

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

  // ——— live preview: stream this world's unsaved edits into every open page ———
  useEffect(() => {
    const t = setTimeout(() => {
      publishWorldDraft(def.id, {
        name,
        epithet,
        portalBlurb: blurb,
        theme,
        bgMediaUrl,
        ...(def.kind === "custom" ? { scene } : { bgSettings: bgSettings as WorldDraftPatch["bgSettings"] }),
      });
    }, 160);
    return () => clearTimeout(t);
  }, [def.id, def.kind, name, epithet, blurb, theme, bgMediaUrl, bgSettings, scene]);

  // leaving this editor (world switch or unmount) drops its draft
  useEffect(() => {
    const id = def.id;
    return () => publishWorldDraft(id, null);
  }, [def.id]);

  const dirty = useMemo(() => {
    const bgDefault = { opacity: 0.5, blend: "normal", fit: "cover", dim: 0.25, ...(def.bgSettings || {}) };
    return (
      name !== def.name ||
      epithet !== def.epithet ||
      blurb !== def.portalBlurb ||
      JSON.stringify(theme) !== JSON.stringify(def.theme || {}) ||
      bgMediaUrl !== (def.bgMediaUrl || null) ||
      JSON.stringify(bgSettings) !== JSON.stringify(bgDefault) ||
      (def.kind === "custom" && JSON.stringify(scene) !== JSON.stringify(def.scene || {}))
    );
  }, [def, name, epithet, blurb, theme, bgMediaUrl, bgSettings, scene]);

  // static defaults for reset hints + effect tinting
  const staticDef = WORLDS.find((w) => w.id === def.id);
  const effAccent = theme.accent || staticDef?.accent || "#ff2e88";
  const effAccent2 = theme.accent2 || staticDef?.accent2 || "#7df2d8";
  const displayStack = fontStack(theme.fontDisplay);

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
      publishWorldDraft(def.id, null); // drop the draft — saved data takes over
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
      publishWorldDraft(def.id, null);
      await reload();
      onBack();
      return;
    }
    if (!confirm(`Reset all Studio changes for "${def.name}" back to the original?`)) return;
    await fetch(`/api/studio/worlds/${def.id}`, { method: "DELETE" });
    publishWorldDraft(def.id, null);
    await reload();
    onBack();
  };

  const setThemeKey = (k: keyof WorldThemePatch, v: string | null) => {
    setTheme((t) => ({ ...t, [k]: v }));
  };

  const applyPack = (p: GenrePack) =>
    setTheme((t) => ({
      ...t,
      fontDisplay: p.fontDisplay,
      fontBody: p.fontBody,
      epithetFont: p.epithetFont || "",
      titleEffect: p.effect,
    }));

  const packActive = (p: GenrePack) =>
    theme.fontDisplay === p.fontDisplay &&
    theme.fontBody === p.fontBody &&
    (theme.titleEffect ?? "none") === p.effect;

  const tabs: { id: EditorTab; label: string; show: boolean }[] = [
    { id: "identity", label: "Identity", show: true },
    { id: "type", label: "Type & FX", show: true },
    { id: "position", label: "Position", show: true },
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

      {/* editor + live preview */}
      <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          {tab === "identity" && (
            <div className="max-w-xl space-y-4">
              <div>
                <label className="studio-label">World name</label>
                <input className="studio-input" value={name} maxLength={48} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="studio-label">Epithet (the tagline)</label>
                <input className="studio-input" value={epithet} maxLength={80} onChange={(e) => setEpithet(e.target.value)} />
                <p className="mt-1.5 text-[11.5px] text-white/40">
                  Give it a script voice with a genre font — see the Type &amp; FX tab.
                </p>
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

          {tab === "type" && (
            <div className="space-y-9">
              {/* ——— genre packs ——— */}
              <section>
                <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">
                  <Sparkles className="h-3.5 w-3.5 text-[#ffb347]" /> Genre packs
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
                  One click sets the display font, body font, epithet script and a hero title effect —
                  curated pairings for each internet aesthetic, like an 80s brand mark.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {GENRE_PACKS.map((p) => {
                    const tuned = p.worlds.includes(def.id);
                    const eff = effectClass(p.effect);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPack(p)}
                        aria-pressed={packActive(p)}
                        className={`relative rounded-xl border p-4 text-left transition-colors ${
                          packActive(p) ? "border-[#ff2e88] bg-[#ff2e88]/10" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        {tuned && (
                          <span className="absolute right-3 top-3 rounded-full bg-[#7df2d8]/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#7df2d8]">
                            Tuned
                          </span>
                        )}
                        <p
                          className={`truncate text-[21px] font-black leading-tight ${eff}`}
                          style={{
                            fontFamily: fontStack(p.fontDisplay) ?? undefined,
                            ["--w-accent" as string]: effAccent,
                            ["--w-accent2" as string]: effAccent2,
                            color: eff ? undefined : "#f4f1fa",
                          }}
                        >
                          {p.sample}
                        </p>
                        <p className="mt-2.5 text-[13px] font-semibold text-white">{p.label}</p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{p.blurb}</p>
                        {p.epithetFont && (
                          <p
                            className="mt-1.5 truncate text-[15px] text-[#ff9ecb]"
                            style={{ fontFamily: fontStack(p.epithetFont) ?? undefined }}
                          >
                            {epithet || "script accent"}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ——— individual fonts ——— */}
              <section>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Fonts</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
                  Or fine-tune each slot yourself — every specimen renders in the real font.
                </p>
                <div className="mt-4 space-y-6">
                  <div>
                    <label className="studio-label">Display font — headings &amp; hero title</label>
                    <FontPicker
                      value={theme.fontDisplay || ""}
                      onChange={(k) => setThemeKey("fontDisplay", k || null)}
                      defaultLabel="World default"
                    />
                  </div>
                  <div>
                    <label className="studio-label">Body font — paragraphs &amp; buttons</label>
                    <FontPicker
                      value={theme.fontBody || ""}
                      onChange={(k) => setThemeKey("fontBody", k || null)}
                      defaultLabel="World default"
                    />
                  </div>
                  <div>
                    <label className="studio-label">Epithet font — the tagline&apos;s own voice</label>
                    <p className="mb-2 text-[11.5px] text-white/40">
                      A flowing script here (try Mrs Saint Delafield) gives the pink-ink signature look.
                    </p>
                    <FontPicker
                      value={theme.epithetFont || ""}
                      onChange={(k) => setThemeKey("epithetFont", k || null)}
                      defaultLabel="Match the epithet styling"
                    />
                  </div>
                </div>
              </section>

              {/* ——— title effects ——— */}
              <section>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Hero title effect</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
                  The treatment on the world-page headline — chrome metal, neon glow, holographic sheen and friends.
                </p>
                <div className="mt-4">
                  <EffectPicker
                    value={theme.titleEffect || "none"}
                    onChange={(v) => setThemeKey("titleEffect", v === "none" ? null : v)}
                    accent={effAccent}
                    accent2={effAccent2}
                    fontFamily={displayStack ?? undefined}
                    sample={name || "AESTHETICA"}
                  />
                </div>
                <button
                  onClick={() => setTheme((t) => ({ ...t, fontDisplay: undefined, fontBody: undefined, epithetFont: undefined, titleEffect: undefined }))}
                  className="mt-4 flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> Reset all typography to the world default
                </button>
              </section>
            </div>
          )}

          {tab === "position" && (
            <div className="max-w-2xl space-y-7">
              <p className="text-[12.5px] leading-relaxed text-white/45">
                {def.kind === "custom"
                  ? "Layout of the world-page hero. Fine per-element positioning (X/Y/size/rotation of every scene layer) lives in the Scene builder tab — drag or nudge there."
                  : "Layout of the world-page hero: where the title block sits, how tall it breathes, and how wide the content column below runs."}
              </p>
              <div className="max-w-md">
                <SliderRow
                  label="Hero title size"
                  value={theme.titleScale ?? 1}
                  min={0.5}
                  max={2}
                  step={0.05}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onReset={() => setThemeKey("titleScale", null)}
                  onChange={(v) => setTheme((t) => ({ ...t, titleScale: v }))}
                />
                <p className="mt-1 text-[11px] text-white/35">100% is the built-in size.</p>
              </div>
              <div>
                <label className="studio-label">Hero text alignment</label>
                <AlignPicker
                  value={(theme.heroAlign as AlignValue) || "center"}
                  onChange={(v) => setTheme((t) => ({ ...t, heroAlign: v }))}
                />
              </div>
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <SliderRow
                  label="Hero height"
                  value={theme.heroHeight ?? 62}
                  min={40}
                  max={120}
                  unit="vh"
                  onReset={() => setThemeKey("heroHeight", null)}
                  onChange={(v) => setTheme((t) => ({ ...t, heroHeight: v }))}
                />
                <SliderRow
                  label="Vertical offset"
                  value={theme.heroOffsetY ?? 0}
                  min={-25}
                  max={25}
                  step={0.5}
                  unit="vh"
                  onReset={() => setThemeKey("heroOffsetY", null)}
                  onChange={(v) => setTheme((t) => ({ ...t, heroOffsetY: v }))}
                />
                <SliderRow
                  label="Content column width"
                  value={theme.contentWidth ?? 80}
                  min={48}
                  max={110}
                  unit="rem"
                  onReset={() => setThemeKey("contentWidth", null)}
                  onChange={(v) => setTheme((t) => ({ ...t, contentWidth: v }))}
                />
              </div>
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
                    <label className="studio-label">Opacity — {Math.round((bgSettings.opacity ?? 0.5) * 100)}%</label>
                    <input type="range" min={0} max={1} step={0.02} className="w-full accent-[#ff2e88]" value={bgSettings.opacity} onChange={(e) => setBgSettings({ ...bgSettings, opacity: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="studio-label">Darkening wash — {Math.round((bgSettings.dim ?? 0.25) * 100)}%</label>
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
                    <select className="studio-input" value={bgSettings.fit} onChange={(e) => setBgSettings({ ...bgSettings, fit: e.target.value as BgSettings["fit"] })}>
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

        {/* ——— live preview ——— */}
        <div className="w-full shrink-0 xl:sticky xl:top-[72px] xl:w-[540px]">
          <LivePreview path={`/#/world/${def.id}`} />
        </div>
      </div>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(url) => setBgMediaUrl(url)} />
    </div>
  );
}
