"use client";

// STUDIO — Worlds manager: drag to reorder how the museum lists its worlds,
// hide/show any of them, create new custom worlds, open them in the editor.
import { useState } from "react";
import {
  DndContext, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useStudioConfig } from "@/lib/worlds-config";
import type { PortalWorldDef } from "@/lib/studio";

function Row({
  w,
  onEdit,
  onToggleHidden,
}: {
  w: PortalWorldDef;
  onEdit: () => void;
  onToggleHidden: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: w.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
        isDragging ? "z-50 border-[#ff2e88] bg-[#ff2e88]/10 shadow-xl" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      } ${w.hidden ? "opacity-50" : ""}`}
    >
      <button {...attributes} {...listeners} aria-label={`Reorder ${w.name}`} className="cursor-grab touch-none text-white/30 hover:text-white/70 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 shrink-0 text-center text-[11px] font-bold text-white/35">{String(w.index).padStart(2, "0")}</span>
      <span className="h-6 w-6 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${w.accent}, ${w.accent2})`, boxShadow: `0 0 10px -2px ${w.accent}` }} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-white">
          {w.name}
          {w.kind === "custom" && (
            <span className="rounded-full bg-[#7df2d8]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7df2d8]">custom</span>
          )}
          {w.hidden && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">hidden</span>
          )}
        </p>
        <p className="truncate text-[11.5px] text-white/45">{w.epithet}</p>
      </div>
      <span className="hidden shrink-0 font-mono text-[10.5px] text-white/30 sm:block">/#/world/{w.id}</span>
      <button onClick={onToggleHidden} aria-label={w.hidden ? `Show ${w.name}` : `Hide ${w.name}`} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
        {w.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button onClick={onEdit} aria-label={`Edit ${w.name}`} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

export function WorldsManager({ onEdit }: { onEdit: (slug: string) => void }) {
  const worlds = useStudioConfig((s) => s.worlds);
  const reload = useStudioConfig((s) => s.reload);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEpithet, setNewEpithet] = useState("");
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = worlds.findIndex((w) => w.id === active.id);
    const newIdx = worlds.findIndex((w) => w.id === over.id);
    const next = arrayMove(worlds, oldIdx, newIdx);
    // optimistic local reorder
    useStudioConfig.setState({ worlds: next.map((w, i) => ({ ...w, index: i + 1 })) });
    await fetch("/api/studio/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((w, i) => ({ slug: w.id, order: i + 1 })) }),
    });
    await reload();
  };

  const toggleHidden = async (w: PortalWorldDef) => {
    await fetch(`/api/studio/worlds/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !w.hidden }),
    });
    await reload();
  };

  const createWorld = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    const r = await fetch("/api/studio/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, epithet: newEpithet }),
    });
    setBusy(false);
    if (r.ok) {
      const d = await r.json();
      setCreating(false);
      setNewName("");
      setNewEpithet("");
      await reload();
      onEdit(d.world.slug);
    }
  };

  const deleteWorld = async (w: PortalWorldDef) => {
    if (w.kind === "custom") {
      if (!confirm(`Delete "${w.name}" permanently? Its scene and settings will be lost.`)) return;
      await fetch(`/api/studio/worlds/${w.id}`, { method: "DELETE" });
      await reload();
    } else {
      if (!confirm(`Reset "${w.name}" to its original look and position?`)) return;
      await fetch(`/api/studio/worlds/${w.id}`, { method: "DELETE" });
      await reload();
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/55">
          Drag to reorder — the museum, nav and footer follow this order. Hidden worlds stay
          editable but invisible to visitors.
        </p>
        <button
          onClick={() => setCreating(!creating)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-3.5 py-2 text-[13px] font-semibold text-black"
        >
          <Plus className="h-4 w-4" /> New world
        </button>
      </div>

      {creating && (
        <div className="mb-4 rounded-xl border border-[#7df2d8]/25 bg-[#7df2d8]/[0.06] p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-white">
            <Sparkles className="h-4 w-4 text-[#7df2d8]" /> Create a custom world
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="studio-label">Name (required)</label>
              <input className="studio-input" value={newName} maxLength={40} placeholder="e.g. Solarpunk" onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="studio-label">Epithet</label>
              <input className="studio-input" value={newEpithet} maxLength={60} placeholder="e.g. The Green Tomorrow" onChange={(e) => setNewEpithet(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={createWorld} disabled={busy || !newName.trim()} className="rounded-lg bg-white px-4 py-1.5 text-[13px] font-semibold text-black disabled:opacity-40">
              {busy ? "Creating…" : "Create & open editor"}
            </button>
            <button onClick={() => setCreating(false)} className="rounded-lg border border-white/15 px-4 py-1.5 text-[13px] text-white/70 hover:text-white">
              Cancel
            </button>
          </div>
          <p className="mt-2 text-[11.5px] text-white/40">
            New worlds start with a starter scene (gradient + title) that you reshape in the Scene builder.
          </p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={worlds.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {worlds.map((w) => (
              <Row key={w.id} w={w} onEdit={() => onEdit(w.id)} onToggleHidden={() => toggleHidden(w)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-[12px] leading-relaxed text-white/45">
        <p><span className="font-semibold text-white/70">Tip:</span> built-in worlds keep their hand-crafted canvas art —
        the editor changes their copy, colors, order, visibility and adds a background media wash. For a fully
        from-scratch look, create a custom world and design every layer yourself.</p>
      </div>
    </div>
  );
}
