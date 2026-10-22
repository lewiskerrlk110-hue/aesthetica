"use client";

import { useApp } from "@/lib/store";
import { useEffect } from "react";
import { type WorldDef } from "@/lib/aesthetics";
import { useStudioConfig } from "@/lib/worlds-config";
import { effectClass, fontStack } from "@/lib/studio";
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
  // Studio "Type & layout" overrides for this world (positioning + title scale;
  // fonts arrive via the injected --w-font-* CSS variables).
  const studioTheme = useStudioConfig((s) => s.worlds.find((w) => w.id === world.id)?.theme);
  const heroAlign = studioTheme?.heroAlign ?? "center";
  const heroAlignCls =
    heroAlign === "left" ? "items-start text-left" : heroAlign === "right" ? "items-end text-right" : "items-center text-center";
  // Hero title effect: an explicit Studio pick wins; otherwise fall back to
  // the world's built-in signature treatment (retrowave neon, y2k holo, …).
  const fx =
    studioTheme?.titleEffect !== undefined
      ? effectClass(studioTheme.titleEffect)
      : world.id === "retrowave"
        ? "neon-text"
        : world.id === "y2k"
          ? "holo-text"
          : world.id === "vaporwave"
            ? "vapor-text"
            : "";
  const epithetFont = fontStack(studioTheme?.epithetFont);

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
        <section
          className={`relative mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-14 ${heroAlignCls}`}
          style={{
            minHeight: studioTheme?.heroHeight ? `${studioTheme.heroHeight}vh` : undefined,
            transform: studioTheme?.heroOffsetY ? `translateY(${studioTheme.heroOffsetY}vh)` : undefined,
          }}
        >
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
            className={`w-display w-hero-title mt-4 font-black ${fx}`}
            style={fx ? undefined : { color: world.fg }}
          >
            {world.name}
          </h1>
          <p
            className="mt-4 opacity-90"
            style={{
              color: world.accent2,
              textShadow: epithetFont ? "0 1px 6px rgba(0,0,0,0.4)" : "0 1px 10px rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.35)",
              fontFamily: epithetFont ?? undefined,
              fontSize: epithetFont ? "30px" : undefined,
              lineHeight: epithetFont ? 1.3 : undefined,
            }}
          >
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
        <section
          id="w-content"
          className="relative z-10 mx-auto max-w-7xl scroll-mt-16 px-4 py-14"
          style={{ maxWidth: studioTheme?.contentWidth ? `${studioTheme.contentWidth}rem` : undefined }}
        >
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
