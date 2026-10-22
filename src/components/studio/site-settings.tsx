"use client";

// STUDIO — Main Page: everything about the museum's homepage —
// hero copy, typography & wordmark effects, positioning, how the worlds
// are presented (grid or carousel), an optional hero background media
// layer over the cosmic canvas — all mirrored live in the preview panel.
import { useEffect, useState } from "react";
import { Save, LayoutGrid, GalleryHorizontal, ImagePlus, X } from "lucide-react";
import { useStudioConfig, publishSiteDraft } from "@/lib/worlds-config";
import { MediaPicker } from "./media-library";
import { FontPicker, EffectPicker, AlignPicker, SliderRow, type AlignValue } from "./design-controls";
import { LivePreview } from "./preview-panel";
import type { SiteSettings, PortalsLayout } from "@/lib/studio";
import { fontStack } from "@/lib/studio";

const LAYOUT_OPTIONS: { value: PortalsLayout; icon: typeof LayoutGrid; title: string; desc: string }[] = [
  {
    value: "grid",
    icon: LayoutGrid,
    title: "Grid",
    desc: "A responsive mosaic of portals — every world visible at once, four per row on desktop.",
  },
  {
    value: "carousel",
    icon: GalleryHorizontal,
    title: "Carousel",
    desc: "One grand portal at a time — swipe or drag, step with arrows, jump with the dots.",
  },
];

export function SiteSettingsForm() {
  const site = useStudioConfig((s) => s.site);
  const reload = useStudioConfig((s) => s.reload);
  const [draft, setDraft] = useState<SiteSettings>(site);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // re-sync the draft whenever the saved settings change (render-time adjustment)
  const [lastSite, setLastSite] = useState(site);
  if (lastSite !== site) {
    setLastSite(site);
    setDraft(site);
  }

  // live preview: stream unsaved main-page edits into every open page
  useEffect(() => {
    const t = setTimeout(() => publishSiteDraft(draft), 160);
    return () => clearTimeout(t);
  }, [draft]);
  useEffect(() => () => publishSiteDraft(null), []);

  const save = async () => {
    setSaving(true);
    const r = await fetch("/api/studio/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      publishSiteDraft(null); // drop the draft — saved data takes over
      await reload();
    }
  };

  const field = (key: keyof SiteSettings, label: string, hint?: string, textarea?: boolean) => (
    <div>
      <label className="studio-label">{label}</label>
      {textarea ? (
        <textarea className="studio-input min-h-[110px]" value={draft[key] as string} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      ) : (
        <input className="studio-input" value={draft[key] as string} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      )}
      {hint && <p className="mt-1.5 text-[11.5px] text-white/40">{hint}</p>}
    </div>
  );

  const heroOpacity = Math.min(1, Math.max(0, parseFloat(draft.heroMediaOpacity) || 0.55));
  const heroIsVideo = /\.(mp4|webm|mov|ogv)(\?|$)/i.test(draft.heroMediaUrl);

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="max-w-2xl min-w-0 flex-1 space-y-9">
      {/* ——— Hero copy ——— */}
      <section className="space-y-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Hero copy</h3>
        {field("heroEyebrow", "Hero eyebrow", "The small uppercase line above the AESTHETICA wordmark.")}
        {field("heroSub", "Hero description", "The paragraph under the wordmark on the homepage.", true)}
      </section>

      {/* ——— Hero background media ——— */}
      <section className="space-y-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Hero background</h3>
        <p className="text-[11.5px] leading-relaxed text-white/40">
          Layer an image, GIF or video over the living cosmic canvas. Leave empty to keep the starfield.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative h-28 w-48 shrink-0 overflow-hidden rounded-xl border border-white/12 bg-black/40">
            {draft.heroMediaUrl ? (
              heroIsVideo ? (
                <video src={draft.heroMediaUrl} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={draft.heroMediaUrl} alt="Hero background preview" className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#0d0b14] to-[#2b1040] text-[11px] text-white/40">
                Cosmic canvas (default)
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-white/20"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {draft.heroMediaUrl ? "Replace media" : "Choose media"}
            </button>
            {draft.heroMediaUrl && (
              <button
                onClick={() => setDraft({ ...draft, heroMediaUrl: "" })}
                className="flex items-center gap-1.5 rounded-lg border border-white/12 px-3.5 py-2 text-[12.5px] text-white/70 hover:border-[#ff5c7a] hover:text-[#ff5c7a]"
              >
                <X className="h-3.5 w-3.5" />
                Remove — back to the canvas
              </button>
            )}
          </div>
        </div>
        {draft.heroMediaUrl && (
          <div className="max-w-sm">
            <label className="studio-label">Media opacity — {Math.round(heroOpacity * 100)}%</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              className="w-full accent-[#ff2e88]"
              value={heroOpacity}
              onChange={(e) => setDraft({ ...draft, heroMediaOpacity: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-white/35">Low opacity lets the stars shine through; 100% replaces them.</p>
          </div>
        )}
        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(url) => setDraft({ ...draft, heroMediaUrl: url })}
          acceptKinds={["image", "video"]}
        />
      </section>

      {/* ——— Typography ——— */}
      <section className="space-y-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Typography</h3>
        <div>
          <label className="studio-label">Display font — headings & wordmark</label>
          <FontPicker
            value={draft.fontDisplay}
            onChange={(k) => setDraft({ ...draft, fontDisplay: k })}
            defaultLabel="Site default"
          />
        </div>
        <div>
          <label className="studio-label">Body font — paragraphs & buttons</label>
          <FontPicker
            value={draft.fontBody}
            onChange={(k) => setDraft({ ...draft, fontBody: k })}
            defaultLabel="Site default"
          />
        </div>
        <div className="max-w-md">
          <SliderRow
            label="Hero title size"
            value={Math.min(1.6, Math.max(0.6, parseFloat(draft.heroTitleScale) || 1))}
            min={0.6}
            max={1.6}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onReset={() => setDraft({ ...draft, heroTitleScale: "1" })}
            onChange={(v) => setDraft({ ...draft, heroTitleScale: String(v) })}
          />
          <p className="mt-1 text-[11px] text-white/35">Scales the AESTHETICA hero wordmark; 100% is the built-in size.</p>
        </div>
        <div>
          <label className="studio-label">Wordmark effect</label>
          <p className="mb-2 text-[11.5px] text-white/40">
            The treatment on AESTHETICA itself — chrome metal, neon halo, holographic sheen…
          </p>
          <EffectPicker
            value={draft.heroTitleEffect || "none"}
            onChange={(v) => setDraft({ ...draft, heroTitleEffect: v === "none" ? "" : v })}
            accent="#ff2e88"
            accent2="#9be8ff"
            fontFamily={fontStack(draft.fontDisplay) ?? undefined}
            sample="AESTHETICA"
          />
        </div>
      </section>

      {/* ——— Hero layout ——— */}
      <section className="space-y-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Hero positioning</h3>
        <div>
          <label className="studio-label">Text alignment</label>
          <AlignPicker
            value={(draft.heroAlign as AlignValue) || "center"}
            onChange={(v) => setDraft({ ...draft, heroAlign: v })}
          />
        </div>
        <div className="grid max-w-2xl gap-x-8 gap-y-4 sm:grid-cols-2">
          <SliderRow
            label="Hero height"
            value={Math.min(140, Math.max(50, parseInt(draft.heroHeight, 10) || 88))}
            min={50}
            max={140}
            unit="vh"
            onReset={() => setDraft({ ...draft, heroHeight: "88" })}
            onChange={(v) => setDraft({ ...draft, heroHeight: String(v) })}
          />
          <SliderRow
            label="Vertical offset"
            value={Math.min(25, Math.max(-25, parseFloat(draft.heroOffsetY) || 0))}
            min={-25}
            max={25}
            step={0.5}
            unit="vh"
            onReset={() => setDraft({ ...draft, heroOffsetY: "0" })}
            onChange={(v) => setDraft({ ...draft, heroOffsetY: String(v) })}
          />
          <SliderRow
            label="Copy column width"
            value={Math.min(72, Math.max(32, parseInt(draft.heroCopyWidth, 10) || 56))}
            min={32}
            max={72}
            unit="rem"
            onReset={() => setDraft({ ...draft, heroCopyWidth: "" })}
            onChange={(v) => setDraft({ ...draft, heroCopyWidth: String(v) })}
          />
        </div>
        <p className="text-[11.5px] text-white/40">
          Alignment re-flows the eyebrow, wordmark, copy and buttons; offset nudges the whole hero block up or down.
        </p>
      </section>

      {/* ——— Portals presentation ——— */}
      <section className="space-y-5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">Portals copy</h3>
        {field("portalsKicker", "Portals kicker", "Small line above the worlds — e.g. “Choose a door”.")}
        {field("portalsTitle", "Portals title", "Heading of the worlds section — e.g. “All Worlds”.")}
      </section>

      {/* ——— Presentation ——— */}
      <section className="space-y-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-white/45">How the worlds are presented</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {LAYOUT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setDraft({ ...draft, portalsLayout: o.value })}
              aria-pressed={draft.portalsLayout === o.value}
              className={`rounded-xl border p-4 text-left transition-colors ${
                draft.portalsLayout === o.value
                  ? "border-[#ff2e88] bg-[#ff2e88]/10"
                  : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <o.icon className={`h-5 w-5 ${draft.portalsLayout === o.value ? "text-[#ff2e88]" : "text-white/60"}`} />
              <p className="mt-2 text-[14px] font-semibold text-white">{o.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">{o.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-[11.5px] text-white/40">Applies to the worlds section on the main page the moment you save.</p>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-2 text-[13px] font-semibold text-black disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save main page"}
        </button>
        {saved && <span className="text-[12.5px] text-[#7df2d8]">Saved — the homepage reflects this immediately.</span>}
      </div>
      <p className="text-[12px] leading-relaxed text-white/40">
        World counts, portal cards and the footer adjust automatically to your world list — adding
        or hiding worlds updates the museum everywhere, including these labels.
      </p>
      </div>

      {/* ——— live preview ——— */}
      <div className="w-full shrink-0 xl:sticky xl:top-[72px] xl:w-[540px]">
        <LivePreview path="/#/" />
      </div>
    </div>
  );
}
