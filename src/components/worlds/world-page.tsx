"use client";

import { useApp } from "@/lib/store";
import { useEffect } from "react";
import { type WorldDef } from "@/lib/aesthetics";
import { WorldGallery, WorldArchive, RelatedWorlds } from "./world-shell";

export function WorldPage({
  world,
  environment,
  heroExtra,
  features,
}: {
  world: WorldDef;
  environment: React.ReactNode;
  heroExtra?: React.ReactNode;
  features?: React.ReactNode;
}) {
  const route = useApp((s) => s.route);
  const navigate = useApp((s) => s.navigate);
  const tab = route.view === "world" ? route.tab : undefined;

  // scroll content into view when switching tabs
  useEffect(() => {
    if (tab) {
      const t = setTimeout(() => {
        document.getElementById("w-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [tab]);

  return (
    <div className="w-page" data-world={world.id}>
      {/* living environment — fixed, behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {environment}
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-14 text-center">
          <button
            onClick={() => navigate({ view: "home" })}
            className="w-tag mb-8 !text-[11px]"
            aria-label="Back to all worlds"
          >
            ← all worlds
          </button>
          <p
            className="text-[12px] font-bold uppercase tracking-[0.5em]"
            style={{ color: world.accent, textShadow: `0 0 18px ${world.accent}66` }}
          >
            World 0{world.index}
          </p>
          <h1
            className={`w-display mt-4 text-5xl font-black leading-none md:text-7xl ${
              world.id === "retrowave" ? "neon-text" : world.id === "y2k" ? "holo-text" : world.id === "vaporwave" ? "vapor-text" : ""
            }`}
            style={
              world.id === "retrowave" || world.id === "y2k" || world.id === "vaporwave"
                ? undefined
                : { color: world.fg }
            }
          >
            {world.name}
          </h1>
          <p className="mt-4 text-[17px] italic opacity-90" style={{ color: world.accent2, textShadow: "0 1px 10px rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.35)" }}>
            {world.epithet}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-[15.5px] leading-relaxed opacity-80">
            {world.short}
          </p>
          {heroExtra}
        </section>

        {/* UNIQUE FEATURES */}
        {features && <div className="relative z-10">{features}</div>}

        {/* GALLERY / ARCHIVE */}
        <section id="w-content" className="relative z-10 mx-auto max-w-7xl scroll-mt-16 px-4 py-14">
          {tab === "archive" ? (
            <WorldArchive world={world} />
          ) : (
            <WorldGallery world={world} />
          )}
        </section>

        {/* TAB SWITCHER — floating */}
        <div className="pointer-events-none sticky bottom-5 z-30 flex justify-center pb-2">
          <div className="w-panel pointer-events-auto flex items-center gap-1 !rounded-full px-2 py-1.5" style={{ boxShadow: "var(--w-shadow)" }}>
            <button
              onClick={() => navigate({ view: "world", world: world.id, tab: undefined })}
              aria-current={!tab}
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-all ${!tab ? "font-semibold" : "opacity-65 hover:opacity-100"}`}
              style={!tab ? { background: world.accent, color: world.id === "dreamcore" || world.id === "liminal" ? "#21324a" : "#0b0518" } : undefined}
            >
              World
            </button>
            <button
              onClick={() => navigate({ view: "world", world: world.id, tab: "gallery" })}
              aria-current={tab === "gallery"}
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-all ${tab === "gallery" ? "font-semibold" : "opacity-65 hover:opacity-100"}`}
              style={tab === "gallery" ? { background: world.accent, color: world.id === "dreamcore" || world.id === "liminal" ? "#21324a" : "#0b0518" } : undefined}
            >
              Gallery
            </button>
            <button
              onClick={() => navigate({ view: "world", world: world.id, tab: "archive" })}
              aria-current={tab === "archive"}
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-all ${tab === "archive" ? "font-semibold" : "opacity-65 hover:opacity-100"}`}
              style={tab === "archive" ? { background: world.accent, color: world.id === "dreamcore" || world.id === "liminal" ? "#21324a" : "#0b0518" } : undefined}
            >
              Archive
            </button>
          </div>
        </div>

        <RelatedWorlds world={world} />
      </div>
    </div>
  );
}
