"use client";

import { create } from "zustand";
import type { WorldId } from "./aesthetics";

export type Route =
  | { view: "home" }
  | { view: "world"; world: WorldId; tab?: string }
  | { view: "artwork"; id: string; back?: string }
  | { view: "search"; q?: string }
  | { view: "profile" }
  | { view: "upload" }
  | { view: "shared"; shareId: string };

interface AppState {
  route: Route;
  searchOpen: boolean;
  fxReduced: boolean;
  navigate: (route: Route) => void;
  setSearchOpen: (open: boolean) => void;
  setFxReduced: (v: boolean) => void;
}

function parseHash(): Route {
  if (typeof window === "undefined") return { view: "home" };
  const h = window.location.hash.replace(/^#\/?/, "");
  const [path, query] = h.split("?");
  const seg = path.split("/").filter(Boolean);
  if (seg[0] === "world" && seg[1]) {
    return {
      view: "world",
      world: seg[1] as WorldId,
      tab: seg[2] || undefined,
    };
  }
  if (seg[0] === "artwork" && seg[1]) return { view: "artwork", id: seg[1] };
  if (seg[0] === "search") return { view: "search", q: new URLSearchParams(query || "").get("q") || "" };
  if (seg[0] === "profile") return { view: "profile" };
  if (seg[0] === "upload") return { view: "upload" };
  if (seg[0] === "shared" && seg[1]) return { view: "shared", shareId: seg[1] };
  return { view: "home" };
}

function toHash(route: Route): string {
  switch (route.view) {
    case "world":
      return `#/world/${route.world}${route.tab ? `/${route.tab}` : ""}`;
    case "artwork":
      return `#/artwork/${route.id}`;
    case "search":
      return `#/search?q=${encodeURIComponent(route.q || "")}`;
    case "profile":
      return "#/profile";
    case "upload":
      return "#/upload";
    case "shared":
      return `#/shared/${route.shareId}`;
    default:
      return "#/";
  }
}

export const useApp = create<AppState>((set, get) => ({
  route: { view: "home" },
  searchOpen: false,
  fxReduced: false,
  navigate: (route) => {
    const hash = toHash(route);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      set({ route });
    }
    // scroll to top on navigation unless it's a tab switch
    if (!(route.view === "world" && route.tab)) window.scrollTo({ top: 0 });
  },
  setSearchOpen: (open) => set({ searchOpen: open }),
  setFxReduced: (v) => {
    set({ fxReduced: v });
    try {
      localStorage.setItem("aesthetica_fx", v ? "off" : "on");
      document.documentElement.classList.toggle("fx-off", v);
    } catch {
      /* private mode */
    }
  },
}));

export function initRouter() {
  if (typeof window === "undefined") return () => {};
  useApp.setState({ route: parseHash() });
  useApp.setState({
    fxReduced:
      localStorage.getItem("aesthetica_fx") === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  const apply = () => useApp.setState({ route: parseHash() });
  window.addEventListener("hashchange", apply);
  document.documentElement.classList.toggle("fx-off", useApp.getState().fxReduced);
  return () => window.removeEventListener("hashchange", apply);
}

// helper to open search with a query
export function doSearch(q: string) {
  useApp.getState().setSearchOpen(false);
  useApp.getState().navigate({ view: "search", q });
}
