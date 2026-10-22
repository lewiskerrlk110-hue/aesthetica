"use client";

// Studio configuration store: fetches the merged world list + site settings
// once on boot, with graceful fallback to the static registry.
import { create } from "zustand";
import { WORLDS } from "./aesthetics";
import {
  DEFAULT_SITE,
  buildMergedWorlds,
  type PortalWorldDef,
  type SiteSettings,
} from "./studio";

interface StudioConfigState {
  worlds: PortalWorldDef[];
  site: SiteSettings;
  loaded: boolean;
  reload: () => Promise<void>;
}

function staticFallback(): PortalWorldDef[] {
  return buildMergedWorlds(WORLDS, [], []);
}

export const useStudioConfig = create<StudioConfigState>((set) => ({
  worlds: staticFallback(),
  site: DEFAULT_SITE,
  loaded: false,
  reload: async () => {
    try {
      const r = await fetch("/api/studio/worlds", { cache: "no-store" });
      if (!r.ok) throw new Error("config unavailable");
      const d = (await r.json()) as { worlds: PortalWorldDef[]; site?: Partial<SiteSettings> };
      set({
        worlds: d.worlds?.length ? d.worlds : staticFallback(),
        site: { ...DEFAULT_SITE, ...(d.site || {}) },
        loaded: true,
      });
    } catch {
      set({ worlds: staticFallback(), site: DEFAULT_SITE, loaded: true });
    }
  },
}));

/** The visible world list (hidden worlds filtered out). */
export function useStudioWorlds(): PortalWorldDef[] {
  return useStudioConfig((s) => s.worlds).filter((w) => !w.hidden);
}

/** Kick off the config fetch (called once from the root page). */
export function initStudioConfig() {
  void useStudioConfig.getState().reload();
}
