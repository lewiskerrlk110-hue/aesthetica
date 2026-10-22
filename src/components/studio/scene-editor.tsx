"use client";

// STUDIO — Scene editor: build a custom world's scene graph on an interactive
// canvas. Drag to move, handles to resize, inspector for everything else.
// Geometry is % of the stage; font sizes are cqh so scenes scale anywhere.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Trash2, Copy, ArrowUp, ArrowDown, Type, Square, Image as ImageIcon, Blend,
} from "lucide-react";
import { LayerContent, layerBoxStyle } from "@/components/worlds/custom-world";
import {
  ANIM_LABELS, BLEND_MODES, newLayerId,
  type SceneAnim, type SceneDoc, type SceneLayer, type SceneLayerType,
} from "@/lib/studio";
import { MediaPicker } from "./media-library";

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface DragState {
  id: string;
  mode: "move" | "resize";
  handle?: Handle;
  startX: number;
  startY: number;
  orig: SceneLayer;
  rect: DOMRect;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function SceneEditor({
  doc,
  onChange,
  selectedId,
  onSelect,
}: {
  doc: SceneDoc;
  onChange: (next: SceneDoc) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = doc.layers.find((l) => l.id === selectedId) || null;
  const ordered = [...doc.layers].sort((a, b) => b.z - a.z); // topmost first

  const patch = useCallback(
    (id: string, p: Partial<SceneLayer>) => {
      onChange({
        ...doc,
        layers: doc.layers.map((l) => (l.id === id ? { ...l, ...p } : l)),
      });
    },
    [doc, onChange],
  );

  // ————— pointer interactions —————
  const beginDrag = (e: React.PointerEvent, layer: SceneLayer, mode: "move" | "resize", handle?: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      id: layer.id, mode, handle,
      startX: e.clientX, startY: e.clientY,
      orig: { ...layer }, rect,
    };
    onSelect(layer.id);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ((e.clientX - d.startX) / d.rect.width) * 100;
      const dy = ((e.clientY - d.startY) / d.rect.height) * 100;
      if (d.mode === "move") {
        patch(d.id, { x: clamp(d.orig.x + dx, -40, 130), y: clamp(d.orig.y + dy, -40, 130) });
        return;
      }
      const h = d.handle!;
      let { x, y, w, hgt } = { x: d.orig.x, y: d.orig.y, w: d.orig.w, hgt: d.orig.h };
      if (h.includes("e")) w = d.orig.w + dx;
      if (h.includes("w")) { w = d.orig.w - dx; x = d.orig.x + dx; }
      if (h.includes("s")) hgt = d.orig.h + dy;
      if (h.includes("n")) { hgt = d.orig.h - dy; y = d.orig.y + dy; }
      if (w < 2) { if (h.includes("w")) x = d.orig.x + d.orig.w - 2; w = 2; }
      if (hgt < 2) { if (h.includes("n")) y = d.orig.y + d.orig.h - 2; hgt = 2; }
      patch(d.id, { x, y, w, h: hgt });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [patch]);

  // ————— layer ops —————
  const addLayer = (type: SceneLayerType) => {
    const base: SceneLayer = {
      id: newLayerId(),
      type,
      x: 20, y: 30, w: 40, h: 30,
      z: (doc.layers.reduce((m, l) => Math.max(m, l.z), 0) || 0) + 1,
      opacity: 1,
    };
    if (type === "text") Object.assign(base, { text: "New text", fontSize: 6, color: "#ffffff", weight: 700, align: "center", font: "display", name: "Text" });
    if (type === "shape") Object.assign(base, { variant: "rect", fill: "#ff2e88", radius: 12, name: "Shape" });
    if (type === "gradient") Object.assign(base, { from: "#ff2e88", to: "transparent", angle: 160, blend: "screen", name: "Gradient" });
    if (type === "media") Object.assign(base, { fit: "cover", name: "Media" });
    onChange({ ...doc, layers: [...doc.layers, base] });
    onSelect(base.id);
    if (type === "media") setPickerOpen(true);
  };

  const removeLayer = (id: string) => {
    onChange({ ...doc, layers: doc.layers.filter((l) => l.id !== id) });
    if (selectedId === id) onSelect(null);
  };

  const duplicateLayer = (l: SceneLayer) => {
    const copy = { ...l, id: newLayerId(), z: l.z + 1, x: l.x + 2, y: l.y + 2, name: l.name ? `${l.name} copy` : undefined };
    onChange({ ...doc, layers: [...doc.layers, copy] });
    onSelect(copy.id);
  };

  // ————— keyboard: delete + nudge —————
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!selected) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeLayer(selected.id);
      }
      const step = e.shiftKey ? 2 : 0.5;
      if (e.key === "ArrowLeft") { e.preventDefault(); patch(selected.id, { x: selected.x - step }); }
      if (e.key === "ArrowRight") { e.preventDefault(); patch(selected.id, { x: selected.x + step }); }
      if (e.key === "ArrowUp") { e.preventDefault(); patch(selected.id, { y: selected.y - step }); }
      if (e.key === "ArrowDown") { e.preventDefault(); patch(selected.id, { y: selected.y + step }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
     
  }, [selected, patch, removeLayer]);

  const reorderZ = (l: SceneLayer, dir: 1 | -1) => {
    // swap z with the neighbour in the ordered list
    const idx = ordered.findIndex((x) => x.id === l.id);
    const other = ordered[idx + (dir === 1 ? -1 : 1)];
    if (!other) return;
    const zl = l.z, zo = other.z;
    onChange({ ...doc, layers: doc.layers.map((x) => (x.id === l.id ? { ...x, z: zo } : x.id === other.id ? { ...x, z: zl } : x)) });
  };

  const handles: { h: Handle; cls: string }[] = [
    { h: "nw", cls: "-left-1.5 -top-1.5 cursor-nwse-resize" },
    { h: "n", cls: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize" },
    { h: "ne", cls: "-right-1.5 -top-1.5 cursor-nesw-resize" },
    { h: "e", cls: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
    { h: "se", cls: "-right-1.5 -bottom-1.5 cursor-nwse-resize" },
    { h: "s", cls: "left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize" },
    { h: "sw", cls: "-left-1.5 -bottom-1.5 cursor-nesw-resize" },
    { h: "w", cls: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[170px_1fr_250px]">
      {/* ——— LAYER LIST ——— */}
      <div className="order-2 lg:order-1">
        <p className="studio-label">Layers · top first</p>
        <div className="flex flex-col gap-1">
          {ordered.map((l) => (
            <div
              key={l.id}
              onClick={() => onSelect(l.id)}
              className={`group flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[12px] transition-colors ${
                selectedId === l.id ? "border-[#ff2e88]/70 bg-[#ff2e88]/10 text-white" : "border-white/8 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]"
              }`}
            >
              <span className="shrink-0 opacity-60">
                {l.type === "text" ? <Type className="h-3 w-3" /> : l.type === "media" ? <ImageIcon className="h-3 w-3" /> : l.type === "gradient" ? <Blend className="h-3 w-3" /> : <Square className="h-3 w-3" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{l.name || (l.type === "text" ? l.text : l.type)}</span>
              <span className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button aria-label="Bring forward" onClick={(e) => { e.stopPropagation(); reorderZ(l, 1); }} className="p-0.5 hover:text-white"><ArrowUp className="h-3 w-3" /></button>
                <button aria-label="Send backward" onClick={(e) => { e.stopPropagation(); reorderZ(l, -1); }} className="p-0.5 hover:text-white"><ArrowDown className="h-3 w-3" /></button>
                <button aria-label="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateLayer(l); }} className="p-0.5 hover:text-white"><Copy className="h-3 w-3" /></button>
                <button aria-label="Delete layer" onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }} className="p-0.5 hover:text-[#ff5c7a]"><Trash2 className="h-3 w-3" /></button>
              </span>
            </div>
          ))}
          {doc.layers.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/15 px-2 py-4 text-center text-[11.5px] text-white/40">
              No layers yet — add one from the toolbar.
            </p>
          )}
        </div>
      </div>

      {/* ——— STAGE ——— */}
      <div className="order-1 lg:order-2">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="studio-label !mb-0 mr-1">Add:</span>
          {(["media", "text", "shape", "gradient"] as SceneLayerType[]).map((t) => (
            <button
              key={t}
              onClick={() => addLayer(t)}
              className="rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11.5px] capitalize text-white/80 transition-colors hover:border-[#ff2e88]/60 hover:text-white"
            >
              + {t}
            </button>
          ))}
          <span className="ml-auto text-[10.5px] text-white/30">drag to move · handles to resize · ⌫ to remove</span>
        </div>
        <div
          ref={stageRef}
          className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl border border-white/12"
          style={{ background: doc.bg || "#0d0b14" }}
          onPointerDown={(e) => {
            if (e.target === stageRef.current) onSelect(null);
          }}
        >
          {[...doc.layers].sort((a, b) => a.z - b.z).map((l) => {
            const isSel = l.id === selectedId;
            return (
              <div
                key={l.id}
                className={`absolute ${isSel ? "ring-2 ring-[#ff2e88]" : "hover:ring-1 hover:ring-white/40"}`}
                style={{ ...layerBoxStyle(l), opacity: l.opacity }}
                onPointerDown={(e) => beginDrag(e, l, "move")}
              >
                <div
                  className="pointer-events-none h-full w-full"
                  style={{
                    transform: l.rotate ? `rotate(${l.rotate}deg)` : undefined,
                    mixBlendMode: l.blend && l.blend !== "normal" ? (l.blend as React.CSSProperties["mixBlendMode"]) : undefined,
                  }}
                >
                  <LayerContent l={l} />
                </div>
                {isSel && (
                  <>
                    <span className="pointer-events-none absolute -top-5 left-0 rounded bg-[#ff2e88] px-1.5 py-0.5 text-[9px] font-bold text-black">
                      {l.name || l.type}
                    </span>
                    {handles.map(({ h, cls }) => (
                      <span
                        key={h}
                        onPointerDown={(e) => beginDrag(e, l, "resize", h)}
                        className={`absolute h-3 w-3 rounded-full border-2 border-[#ff2e88] bg-white ${cls}`}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
          {doc.layers.length === 0 && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-white/40">
              Empty stage — add your first layer above
            </p>
          )}
        </div>
        {/* stage background */}
        <div className="mt-3 flex items-center gap-2">
          <p className="studio-label !mb-0 w-28 shrink-0">Stage background</p>
          <input
            className="studio-input"
            value={doc.bg || ""}
            placeholder="css background, e.g. linear-gradient(180deg,#0d0b14,#1a0a2e)"
            onChange={(e) => onChange({ ...doc, bg: e.target.value })}
          />
        </div>
      </div>

      {/* ——— INSPECTOR ——— */}
      <div className="order-3">
        <p className="studio-label">Inspector</p>
        {!selected ? (
          <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-[12px] text-white/40">
            Select a layer on the stage or in the list to edit it.
          </p>
        ) : (
          <div className="max-h-[58vh] space-y-2.5 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 studio-scroll">
            <div>
              <label className="studio-label">Name</label>
              <input className="studio-input" value={selected.name || ""} onChange={(e) => patch(selected.id, { name: e.target.value })} />
            </div>

            {selected.type === "text" && (
              <>
                <div>
                  <label className="studio-label">Text</label>
                  <textarea className="studio-input min-h-[64px]" value={selected.text || ""} onChange={(e) => patch(selected.id, { text: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="studio-label">Size (cqh)</label>
                    <input type="number" min={1} max={60} step={0.5} className="studio-input" value={selected.fontSize ?? 6} onChange={(e) => patch(selected.id, { fontSize: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="studio-label">Weight</label>
                    <select className="studio-input" value={selected.weight ?? 700} onChange={(e) => patch(selected.id, { weight: Number(e.target.value) })}>
                      {[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="studio-label">Font</label>
                    <select className="studio-input" value={selected.font || "display"} onChange={(e) => patch(selected.id, { font: e.target.value as SceneLayer["font"] })}>
                      <option value="display">Display</option>
                      <option value="body">Body</option>
                      <option value="mono">Mono</option>
                    </select>
                  </div>
                  <div>
                    <label className="studio-label">Align</label>
                    <select className="studio-input" value={selected.align || "center"} onChange={(e) => patch(selected.id, { align: e.target.value as SceneLayer["align"] })}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="studio-label">Color</label>
                    <input type="color" className="studio-color" value={selected.color || "#ffffff"} onChange={(e) => patch(selected.id, { color: e.target.value })} />
                  </div>
                  <div>
                    <label className="studio-label">Tracking (em)</label>
                    <input type="number" step={0.02} min={-0.1} max={1} className="studio-input" value={selected.letterSpacing ?? 0} onChange={(e) => patch(selected.id, { letterSpacing: Number(e.target.value) })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[12px] text-white/70">
                  <input type="checkbox" checked={!!selected.italic} onChange={(e) => patch(selected.id, { italic: e.target.checked })} />
                  Italic
                </label>
              </>
            )}

            {selected.type === "media" && (
              <>
                <div>
                  <label className="studio-label">Source</label>
                  <div className="flex gap-1.5">
                    <input className="studio-input" value={selected.url || ""} placeholder="pick or paste a media URL" onChange={(e) => patch(selected.id, { url: e.target.value })} />
                    <button onClick={() => setPickerOpen(true)} className="shrink-0 rounded-lg bg-white/10 px-2.5 text-[12px] text-white hover:bg-white/20">Pick</button>
                  </div>
                </div>
                <div>
                  <label className="studio-label">Fit</label>
                  <select className="studio-input" value={selected.fit || "cover"} onChange={(e) => patch(selected.id, { fit: e.target.value as SceneLayer["fit"] })}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Stretch</option>
                  </select>
                </div>
              </>
            )}

            {selected.type === "shape" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="studio-label">Variant</label>
                  <select className="studio-input" value={selected.variant || "rect"} onChange={(e) => patch(selected.id, { variant: e.target.value as SceneLayer["variant"] })}>
                    <option value="rect">Rectangle</option>
                    <option value="ellipse">Ellipse</option>
                  </select>
                </div>
                <div>
                  <label className="studio-label">Fill</label>
                  <input type="color" className="studio-color" value={selected.fill || "#ff2e88"} onChange={(e) => patch(selected.id, { fill: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label">Radius (px)</label>
                  <input type="number" min={0} max={400} className="studio-input" value={selected.radius ?? 0} onChange={(e) => patch(selected.id, { radius: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="studio-label">Stroke</label>
                  <input className="studio-input" placeholder="#hex or none" value={selected.stroke || ""} onChange={(e) => patch(selected.id, { stroke: e.target.value || undefined })} />
                </div>
              </div>
            )}

            {selected.type === "gradient" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="studio-label">From</label>
                  <input type="color" className="studio-color" value={selected.from || "#ff2e88"} onChange={(e) => patch(selected.id, { from: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label">To</label>
                  <input className="studio-input" value={selected.to || "transparent"} onChange={(e) => patch(selected.id, { to: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="studio-label">Angle — {selected.angle ?? 160}°</label>
                  <input type="range" min={0} max={360} className="w-full accent-[#ff2e88]" value={selected.angle ?? 160} onChange={(e) => patch(selected.id, { angle: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {/* common controls */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
              <div><label className="studio-label">X %</label><input type="number" step={0.5} className="studio-input" value={Math.round(selected.x * 10) / 10} onChange={(e) => patch(selected.id, { x: Number(e.target.value) })} /></div>
              <div><label className="studio-label">Y %</label><input type="number" step={0.5} className="studio-input" value={Math.round(selected.y * 10) / 10} onChange={(e) => patch(selected.id, { y: Number(e.target.value) })} /></div>
              <div><label className="studio-label">W %</label><input type="number" step={0.5} min={1} className="studio-input" value={Math.round(selected.w * 10) / 10} onChange={(e) => patch(selected.id, { w: Number(e.target.value) })} /></div>
              <div><label className="studio-label">H %</label><input type="number" step={0.5} min={1} className="studio-input" value={Math.round(selected.h * 10) / 10} onChange={(e) => patch(selected.id, { h: Number(e.target.value) })} /></div>
              <div><label className="studio-label">Z order</label><input type="number" step={1} className="studio-input" value={selected.z} onChange={(e) => patch(selected.id, { z: Number(e.target.value) })} /></div>
              <div><label className="studio-label">Rotate °</label><input type="number" step={1} className="studio-input" value={selected.rotate ?? 0} onChange={(e) => patch(selected.id, { rotate: Number(e.target.value) })} /></div>
            </div>
            <div>
              <label className="studio-label">Opacity — {Math.round((selected.opacity ?? 1) * 100)}%</label>
              <input type="range" min={0} max={1} step={0.02} className="w-full accent-[#ff2e88]" value={selected.opacity ?? 1} onChange={(e) => patch(selected.id, { opacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="studio-label">Parallax depth — {selected.depth ?? 0}</label>
              <input type="range" min={0} max={1} step={0.05} className="w-full accent-[#ff2e88]" value={selected.depth ?? 0} onChange={(e) => patch(selected.id, { depth: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="studio-label">Animation</label>
                <select className="studio-input" value={selected.anim || "none"} onChange={(e) => patch(selected.id, { anim: e.target.value as SceneAnim })}>
                  {Object.entries(ANIM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="studio-label">Speed (s)</label>
                <input type="number" min={1} max={60} step={0.5} className="studio-input" value={selected.animDur ?? 6} onChange={(e) => patch(selected.id, { animDur: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="studio-label">Blend mode</label>
              <select className="studio-input" value={selected.blend || "normal"} onChange={(e) => patch(selected.id, { blend: e.target.value })}>
                {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(url) => selected && patch(selected.id, { url })} />
    </div>
  );
}
