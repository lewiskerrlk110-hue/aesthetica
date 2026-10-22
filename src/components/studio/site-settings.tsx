"use client";

// STUDIO — Main Page: everything about the museum's homepage —
// hero copy, how the worlds are presented (grid or carousel), and an
// optional hero background media layer over the cosmic canvas.
import { useEffect, useState } from "react";
import { Save, LayoutGrid, GalleryHorizontal, ImagePlus, X } from "lucide-react";
import { useStudioConfig } from "@/lib/worlds-config";
import { MediaPicker } from "./media-library";
import type { SiteSettings, PortalsLayout } from "@/lib/studio";

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
    <div className="max-w-2xl space-y-9">
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
  );
}
