"use client";

// Studio configuration store: fetches the merged world list + site settings
// once on boot, with graceful fallback to the static registry.
//
// ─── Live draft bridge ───
// The Studio publishes UNSAVED edits to localStorage + a BroadcastChannel;
// every open page (tabs, windows, the Studio's live-preview iframe) applies
// the draft on top of the fetched config, so changes appear instantly in
// the preview — before "Save" is ever pressed. Drafts are cleared on save
// or when the editor closes.
import { create } from "zustand";
import { WORLDS } from "./aesthetics";
import {
  DEFAULT_SITE,
  buildMergedWorlds,
  type PortalWorldDef,
  type SiteSettings,
  type BgSettings,
  type SceneDoc,
  type SectionsConfig,
  type WorldThemePatch,
} from "./studio";

interface StudioConfigState {
  worlds: PortalWorldDef[];
  site: SiteSettings;
  loaded: boolean;
  reload: () => Promise<void>;
  /** Live preview draft currently applied (null = showing saved state). */
  draft: StudioDraft | null;
  applyDraft: (d: StudioDraft | null) => void;
}

// ————— Draft shapes —————

export interface WorldDraftPatch {
  name?: string;
  epithet?: string;
  portalBlurb?: string;
  hidden?: boolean;
  theme?: Partial<WorldThemePatch>;
  bgMediaUrl?: string | null;
  bgSettings?: Partial<BgSettings>;
  scene?: SceneDoc;
  sections?: SectionsConfig | null;
}

export interface StudioDraft {
  /** Per-world unsaved patches keyed by world id. */
  worlds: Record<string, WorldDraftPatch>;
  /** Unsaved main-page settings patch. */
  site?: Partial<SiteSettings> | null;
  ts: number;
}

const DRAFT_KEY = "aesthetica:studio-draft";
const DRAFT_CHANNEL = "aesthetica-studio-draft";

// module-level base (saved) data; `worlds`/`site` in the store are draft-applied
let baseWorlds: PortalWorldDef[] = [];
let baseSite: SiteSettings = DEFAULT_SITE;

function mergeWorld(w: PortalWorldDef, p: WorldDraftPatch | undefined): PortalWorldDef {
  if (!p) return w;
  return {
    ...w,
    ...("name" in p ? { name: p.name! } : {}),
    ...("epithet" in p ? { epithet: p.epithet! } : {}),
    ...("portalBlurb" in p ? { portalBlurb: p.portalBlurb! } : {}),
    ...("hidden" in p ? { hidden: !!p.hidden } : {}),
    ...("bgMediaUrl" in p ? { bgMediaUrl: p.bgMediaUrl } : {}),
    theme:
      p.theme || w.theme
        ? ({ ...(w.theme || {}), ...(p.theme || {}) } as WorldThemePatch)
        : w.theme,
    bgSettings:
      p.bgSettings || w.bgSettings
        ? ({ ...(w.bgSettings || {}), ...(p.bgSettings || {}) } as BgSettings)
        : w.bgSettings,
    ...("sections" in p ? { sections: p.sections } : {}),
    ...("scene" in p ? { scene: p.scene } : {}),
  };
}

function applyDraftTo(
  worlds: PortalWorldDef[],
  site: SiteSettings,
  draft: StudioDraft | null,
): { worlds: PortalWorldDef[]; site: SiteSettings } {
  if (!draft) return { worlds, site };
  return {
    worlds: worlds.map((w) => mergeWorld(w, draft.worlds[w.id])),
    site: draft.site ? { ...site, ...draft.site } : site,
  };
}

function readStoredDraft(): StudioDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as StudioDraft;
    if (!d || typeof d !== "object") return null;
    return { worlds: d.worlds || {}, site: d.site || null, ts: d.ts || 0 };
  } catch {
    return null;
  }
}

function writeStoredDraft(d: StudioDraft | null) {
  try {
    if (!d || (Object.keys(d.worlds).length === 0 && !d.site)) localStorage.removeItem(DRAFT_KEY);
    else localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable — preview still works via BroadcastChannel */
  }
}

function broadcast(d: StudioDraft | null) {
  // apply locally (the publisher's own window) and fan out to every other
  // open page/tab/iframe via the channel
  useStudioConfig.getState().applyDraft(d);
  try {
    const ch = getChannel();
    ch?.postMessage(d ? { ...d, ts: Date.now() } : null);
  } catch {
    /* channel unavailable */
  }
}

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel && "BroadcastChannel" in window) {
    try {
      channel = new BroadcastChannel(DRAFT_CHANNEL);
    } catch {
      channel = null;
    }
  }
  return channel;
}

let bridgeBooted = false;
/** Subscribe every open page to Studio draft updates (idempotent). */
export function initDraftBridge() {
  if (typeof window === "undefined" || bridgeBooted) return;
  bridgeBooted = true;
  const ingest = (d: StudioDraft | null) => useStudioConfig.getState().applyDraft(d);
  getChannel()?.addEventListener("message", (e) => ingest((e as MessageEvent).data ?? null));
  // cross-tab fallback (storage events don't fire in the same tab)
  window.addEventListener("storage", (e) => {
    if (e.key === DRAFT_KEY) ingest(readStoredDraft());
  });
  // pick up a draft published before this page finished booting
  const stored = readStoredDraft();
  if (stored) ingest(stored);
}

// ————— Studio-side publishers —————

/** Push (or update) an unsaved world patch into the live preview. */
export function publishWorldDraft(id: string, patch: WorldDraftPatch | null) {
  if (typeof window === "undefined") return;
  const current = readStoredDraft() ?? { worlds: {}, site: null, ts: 0 };
  if (patch) current.worlds[id] = { ...current.worlds[id], ...patch };
  else delete current.worlds[id];
  const next: StudioDraft = { ...current, ts: Date.now() };
  writeStoredDraft(next);
  broadcast(next);
}

/** Push (or update) unsaved main-page settings into the live preview. */
export function publishSiteDraft(patch: Partial<SiteSettings> | null) {
  if (typeof window === "undefined") return;
  const current = readStoredDraft() ?? { worlds: {}, site: null, ts: 0 };
  if (patch) current.site = { ...(current.site || {}), ...patch };
  else current.site = null;
  const next: StudioDraft = { ...current, ts: Date.now() };
  writeStoredDraft(next);
  broadcast(next);
}

/** Drop every unsaved change from the live preview (used after saving). */
export function clearDraft() {
  writeStoredDraft(null);
  broadcast(null);
}

function staticFallback(): PortalWorldDef[] {
  return buildMergedWorlds(WORLDS, [], []);
}

export const useStudioConfig = create<StudioConfigState>((set) => ({
  worlds: staticFallback(),
  site: DEFAULT_SITE,
  loaded: false,
  draft: null,
  reload: async () => {
    try {
      const r = await fetch("/api/studio/worlds", { cache: "no-store" });
      if (!r.ok) throw new Error("config unavailable");
      const d = (await r.json()) as { worlds: PortalWorldDef[]; site?: Partial<SiteSettings> };
      baseWorlds = d.worlds?.length ? d.worlds : staticFallback();
      baseSite = { ...DEFAULT_SITE, ...(d.site || {}) };
      const { worlds, site } = applyDraftTo(baseWorlds, baseSite, readStoredDraft());
      set({ worlds, site, loaded: true });
    } catch {
      baseWorlds = staticFallback();
      baseSite = DEFAULT_SITE;
      const { worlds, site } = applyDraftTo(baseWorlds, baseSite, readStoredDraft());
      set({ worlds, site, loaded: true });
    }
  },
  applyDraft: (d) => {
    const { worlds, site } = applyDraftTo(baseWorlds, baseSite, d);
    set({ worlds, site, draft: d });
  },
}));

/** The visible world list (hidden worlds filtered out). */
export function useStudioWorlds(): PortalWorldDef[] {
  return useStudioConfig((s) => s.worlds).filter((w) => !w.hidden);
}

/** Kick off the config fetch (called once from the root page). */
export function initStudioConfig() {
  initDraftBridge();
  void useStudioConfig.getState().reload();
}
