"use client";

// STUDIO — shared section reorganiser: a drag-to-reorder list with per-row
// show/hide toggles. Used by the Main Page tab (homepage sections) and the
// world editor's Sections tab (world-page blocks). Purely presentational —
// the parent owns the SectionsConfig state and persistence.
import {
  DndContext, PointerSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react";
import type { SectionsConfig } from "@/lib/studio";

export interface SectionRowDef {
  id: string;
  label: string;
  desc: string;
}

function Row({
  row,
  hidden,
  onToggle,
}: {
  row: SectionRowDef;
  hidden: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
        isDragging ? "z-50 border-[#ff2e88] bg-[#ff2e88]/10 shadow-xl" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      } ${hidden ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${row.label}`}
        className="cursor-grab touch-none text-white/30 hover:text-white/70 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-[#ff2e88]/70 to-[#7df2d8]/70" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[13.5px] font-semibold text-white">
          {row.label}
          {hidden && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">hidden</span>
          )}
        </p>
        <p className="truncate text-[11.5px] text-white/45">{row.desc}</p>
      </div>
      <button
        onClick={onToggle}
        aria-label={hidden ? `Show ${row.label}` : `Hide ${row.label}`}
        className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
      >
        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SectionsEditor({
  rows,
  value,
  canonical,
  onChange,
  onReset,
}: {
  /** Metadata for every section id (label + description). */
  rows: SectionRowDef[];
  /** Current config (parsed; may be the default). */
  value: SectionsConfig;
  /** Canonical id order — used to (re)build the list display order. */
  canonical: string[];
  onChange: (next: SectionsConfig) => void;
  /** Optional "back to the default layout" affordance. */
  onReset?: () => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const meta = new Map(rows.map((r) => [r.id, r]));
  // display in the configured order, then any canonical ids not yet in it
  const ordered = [...value.order.filter((id) => meta.has(id)), ...canonical.filter((id) => !value.order.includes(id) && meta.has(id))];

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ordered.indexOf(String(active.id));
    const to = ordered.indexOf(String(over.id));
    const nextOrder = arrayMove(ordered, from, to);
    onChange({ order: nextOrder, hidden: value.hidden });
  };

  const toggle = (id: string) => {
    const hidden = value.hidden.includes(id)
      ? value.hidden.filter((h) => h !== id)
      : [...value.hidden, id];
    onChange({ order: value.order, hidden });
  };

  const untouched =
    value.hidden.length === 0 && canonical.every((id, i) => (value.order[i] ?? id) === id);

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {ordered.map((id) => (
              <Row
                key={id}
                row={meta.get(id)!}
                hidden={value.hidden.includes(id)}
                onToggle={() => toggle(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {onReset && !untouched && (
        <button onClick={onReset} className="mt-3 flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white">
          <RotateCcw className="h-3 w-3" /> Restore the default layout
        </button>
      )}
    </div>
  );
}
