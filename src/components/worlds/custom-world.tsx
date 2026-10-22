"use client";

// ─────────────────────────────────────────────
// Custom worlds: JSON scene-graph renderer.
// One <SceneStage> renders any SceneDoc — used full-bleed by the world
// page and scaled-down inside homepage portal cards (geometry is % and
// font sizes are cqh, so everything scales with the container).
// ─────────────────────────────────────────────
import { useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { themeVarsFor, fontStack, effectClass, type PortalWorldDef, type SceneDoc, type SceneLayer } from "@/lib/studio";
import { WorldGallery } from "./world-shell";
import type { WorldDef } from "@/lib/aesthetics";

const VIDEO_RE = /\.(mp4|webm|mov|ogv)(\?|$)/i;

/** Outer geometry box of a layer — shared by the renderer and the editor's
 *  selection handles so they always line up. */
export function layerBoxStyle(l: SceneLayer): React.CSSProperties {
  return {
    left: `${l.x}%`,
    top: `${l.y}%`,
    width: `${l.w}%`,
    height: `${l.h}%`,
    zIndex: l.z + 1,
  };
}

export function LayerContent({ l }: { l: SceneLayer }) {
  if (l.type === "media" && l.url) {
    const fit = l.fit || "cover";
    if (VIDEO_RE.test(l.url) || l.url.startsWith("blob:")) {
      return (
        <video
          src={l.url}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full"
          style={{ objectFit: fit }}
        />
      );
    }
    return (
       
      <img
        src={l.url}
        alt={l.name || "scene layer"}
        draggable={false}
        className="h-full w-full select-none"
        style={{ objectFit: fit }}
      />
    );
  }
  if (l.type === "text") {
    const libFont = fontStack(l.fontKey);
    const fam =
      libFont ??
      (l.font === "mono"
        ? "var(--w-font-mono, ui-monospace, monospace)"
        : l.font === "body"
          ? "var(--w-font-body, sans-serif)"
          : "var(--w-font-display, sans-serif)");
    return (
      <div
        className="h-full w-full whitespace-pre-wrap"
        style={{
          fontFamily: fam,
          fontSize: `${l.fontSize ?? 6}cqh`,
          fontWeight: l.weight ?? 700,
          fontStyle: l.italic ? "italic" : "normal",
          letterSpacing: `${l.letterSpacing ?? 0}em`,
          color: l.color || "#ffffff",
          textAlign: (l.align as "left" | "center" | "right") || "center",
          lineHeight: 1.18,
          display: "flex",
          alignItems: "center",
          justifyContent:
            l.align === "left" ? "flex-start" : l.align === "right" ? "flex-end" : "center",
        }}
      >
        {l.text}
      </div>
    );
  }
  if (l.type === "shape") {
    return (
      <div
        className="h-full w-full"
        style={{
          background: l.fill || "#ffffff",
          borderRadius: l.variant === "ellipse" ? "50%" : `${l.radius ?? 0}px`,
          border: l.stroke ? `${l.strokeWidth ?? 1}px solid ${l.stroke}` : undefined,
        }}
      />
    );
  }
  if (l.type === "gradient") {
    return (
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(${l.angle ?? 160}deg, ${l.from || "#ff2e88"}, ${l.to || "transparent"})`,
        }}
      />
    );
  }
  return null;
}

function SceneLayerView({ l }: { l: SceneLayer }) {
  const animClass = l.anim && l.anim !== "none" ? `s-anim-${l.anim}` : "";
  return (
    <div className="absolute" style={{ ...layerBoxStyle(l), opacity: l.opacity ?? 1 }}>
      <div
        className="h-full w-full"
        style={{
          transform: l.rotate ? `rotate(${l.rotate}deg)` : undefined,
          mixBlendMode: (l.blend && l.blend !== "normal" ? l.blend : undefined) as React.CSSProperties["mixBlendMode"],
        }}
      >
        <div
          className="h-full w-full s-parallax"
          style={{ "--d": String(l.depth ?? 0) } as React.CSSProperties}
        >
          <div className={`h-full w-full ${animClass}`} style={{ animationDuration: `${l.animDur ?? 6}s` }}>
            <LayerContent l={l} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Render a SceneDoc inside any container. */
export function SceneStage({
  doc,
  className,
  style,
  parallaxWindow,
}: {
  doc: SceneDoc | null | undefined;
  className?: string;
  style?: React.CSSProperties;
  parallaxWindow?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parallaxWindow) return;
    const setVars = (mx: number, my: number) => {
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty("--px", String(mx));
      el.style.setProperty("--py", String(my));
    };
    const onMove = (e: MouseEvent) => {
      setVars((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onLeave = () => setVars(0, 0);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [parallaxWindow]);

  return (
    <div
      ref={rootRef}
      className={`studio-stage ${className || ""}`}
      style={{ background: doc?.bg || "#0d0b14", ...style }}
    >
      {(doc?.layers || []).map((l) => (
        <SceneLayerView key={l.id} l={l} />
      ))}
    </div>
  );
}

/** Full world page for a Studio-created custom world. */
export function CustomWorldPage({ def }: { def: PortalWorldDef }) {
  const navigate = useApp((s) => s.navigate);
  const route = useApp((s) => s.route);
  const fxReduced = useApp((s) => s.fxReduced);
  const tab = route.view === "world" ? route.tab : undefined;
  const vars = themeVarsFor(def) as React.CSSProperties;
  const num = String(def.index).padStart(2, "0");
  const defAsWorld = {
    ...def,
    galleryStyle: "photographic",
    archive: [],
    related: [],
  } as unknown as WorldDef;

  return (
    <div className="w-page" data-world={def.id} style={vars}>
      {/* living scene — fixed, behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <SceneStage doc={def.scene} parallaxWindow={!fxReduced} className="h-full w-full" />
      </div>

      <div className="relative z-10">
        {/* HERO — Studio "Type & layout" aware (align / height / offset / title scale) */}
        <section
          className={`relative mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-14 ${
            def.theme?.heroAlign === "left"
              ? "items-start text-left"
              : def.theme?.heroAlign === "right"
                ? "items-end text-right"
                : "items-center text-center"
          }`}
          style={{
            minHeight: def.theme?.heroHeight ? `${def.theme.heroHeight}vh` : undefined,
            transform: def.theme?.heroOffsetY ? `translateY(${def.theme.heroOffsetY}vh)` : undefined,
          }}
        >
          <button onClick={() => navigate({ view: "home" })} className="w-tag mb-8 !text-[11px]" aria-label="Back to all worlds">
            ← all worlds
          </button>
          <p className="text-[12px] font-bold uppercase tracking-[0.5em]" style={{ color: def.accent, textShadow: `0 0 18px ${def.accent}66` }}>
            World {num}
          </p>
          {(() => {
            const fx = effectClass(def.theme?.titleEffect);
            return (
              <>
                <h1
                  className={`w-display w-hero-title mt-4 font-black ${fx}`}
                  style={fx ? undefined : { color: def.fg, textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
                >
                  {def.name}
                </h1>
                <p
                  className="mt-4 opacity-90"
                  style={{
                    color: def.accent2,
                    textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                    fontFamily: fontStack(def.theme?.epithetFont) ?? undefined,
                    fontSize: def.theme?.epithetFont ? "30px" : undefined,
                    lineHeight: def.theme?.epithetFont ? 1.3 : undefined,
                  }}
                >
                  {def.epithet}
                </p>
              </>
            );
 })()}
          <p className="mx-auto mt-5 max-w-2xl text-balance text-[15.5px] leading-relaxed opacity-80">{def.short}</p>
        </section>

        {/* GALLERY */}
        {tab === "gallery" && (
          <section
            id="w-content"
            className="relative z-10 mx-auto max-w-7xl scroll-mt-16 px-4 py-14"
            style={{ maxWidth: def.theme?.contentWidth ? `${def.theme.contentWidth}rem` : undefined }}
          >
            <WorldGallery world={defAsWorld} />
          </section>
        )}

        {/* TAB SWITCHER — floating */}
        <div className="pointer-events-none sticky bottom-5 z-30 flex justify-center pb-2">
          <div className="w-panel pointer-events-auto flex items-center gap-1 !rounded-full px-2 py-1.5" style={{ boxShadow: "var(--w-shadow)" }}>
            <button
              onClick={() => navigate({ view: "world", world: def.id, tab: undefined })}
              aria-current={!tab}
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-all ${!tab ? "font-semibold" : "opacity-65 hover:opacity-100"}`}
              style={!tab ? { background: def.accent, color: "#0b0518" } : undefined}
            >
              World
            </button>
            <button
              onClick={() => navigate({ view: "world", world: def.id, tab: "gallery" })}
              aria-current={tab === "gallery"}
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-all ${tab === "gallery" ? "font-semibold" : "opacity-65 hover:opacity-100"}`}
              style={tab === "gallery" ? { background: def.accent, color: "#0b0518" } : undefined}
            >
              Gallery
            </button>
          </div>
        </div>
        <div className="h-16" aria-hidden />
      </div>
    </div>
  );
}
