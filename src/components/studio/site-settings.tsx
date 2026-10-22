"use client";

// STUDIO — Site settings: the museum's homepage copy.
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useStudioConfig } from "@/lib/worlds-config";
import type { SiteSettings } from "@/lib/studio";

export function SiteSettingsForm() {
  const site = useStudioConfig((s) => s.site);
  const reload = useStudioConfig((s) => s.reload);
  const [draft, setDraft] = useState<SiteSettings>(site);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <textarea className="studio-input min-h-[110px]" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      ) : (
        <input className="studio-input" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
      )}
      {hint && <p className="mt-1.5 text-[11.5px] text-white/40">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      {field("heroEyebrow", "Hero eyebrow", "The small uppercase line above the AESTHETICA wordmark.")}
      {field("heroSub", "Hero description", "The paragraph under the wordmark on the homepage.", true)}
      {field("portalsKicker", "Portals kicker", "Small line above the world grid — e.g. “Choose a door”.")}
      {field("portalsTitle", "Portals title", "Heading of the world grid — e.g. “The Eight Worlds”.")}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-2 text-[13px] font-semibold text-black disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save site settings"}
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
