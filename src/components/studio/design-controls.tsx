"use client";

// STUDIO — shared design controls: font pickers with live specimen
// previews, visual title-effect tiles and a 3-way alignment segmented
// control. Used by the Main Page editor and the per-world "Type & FX" tab.
import { FONT_LIBRARY, FONT_GENRES, TITLE_EFFECTS, effectClass, type FontGenre } from "@/lib/studio";
import { AlignLeft, AlignCenter, AlignRight, RotateCcw } from "lucide-react";

/** Grid of font specimen cards, grouped by genre. value === "" means "(default)". */
export function FontPicker({
  value,
  onChange,
  allowDefault = true,
  defaultLabel = "World default",
}: {
  value: string;
  onChange: (key: string) => void;
  allowDefault?: boolean;
  defaultLabel?: string;
}) {
  const groups = (Object.keys(FONT_GENRES) as FontGenre[])
    .map((g) => ({ genre: g, fonts: FONT_LIBRARY.filter((f) => f.genre === g) }))
    .filter((g) => g.fonts.length > 0);

  return (
    <div className="space-y-3">
      {allowDefault && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-pressed={value === ""}
          className={`w-full rounded-xl border p-3 text-left transition-colors ${
            value === "" ? "border-[#ff2e88] bg-[#ff2e88]/10" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <p className="text-[16px] font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            Aa Bb 123
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-white/80">{defaultLabel}</p>
          <p className="text-[10.5px] text-white/40">keeps the built-in font</p>
        </button>
      )}
      {groups.map((g) => (
        <div key={g.genre}>
          <p
            className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: FONT_GENRES[g.genre].color }}
          >
            {FONT_GENRES[g.genre].label}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {g.fonts.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange(f.key)}
                aria-pressed={value === f.key}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  value === f.key ? "border-[#ff2e88] bg-[#ff2e88]/10" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <p className="truncate text-[16px] text-white" style={{ fontFamily: f.stack }}>
                  Aa Bb 123
                </p>
                <p className="mt-1.5 truncate text-[11px] font-medium text-white/80">{f.label}</p>
                <p className="truncate text-[10.5px] text-white/40">{f.hint}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Visual title-effect tiles — each renders real text with the real effect,
 *  tinted by the world's accent pair. Pass accent/accent2 for accuracy. */
export function EffectPicker({
  value,
  onChange,
  accent = "#ff2e88",
  accent2 = "#7df2d8",
  fontFamily,
  sample = "AESTHETICA",
}: {
  value: string;
  onChange: (v: string) => void;
  accent?: string;
  accent2?: string;
  fontFamily?: string;
  sample?: string;
}) {
  const vars = { "--w-accent": accent, "--w-accent2": accent2 } as React.CSSProperties;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TITLE_EFFECTS.map((e) => {
        const cls = effectClass(e.value);
        const selected = value === e.value || (!value && e.value === "none");
        return (
          <button
            key={e.value}
            type="button"
            onClick={() => onChange(e.value)}
            aria-pressed={selected}
            className={`rounded-xl border p-3 transition-colors ${
              selected ? "border-[#ff2e88] bg-[#ff2e88]/10" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            <p
              className={`truncate text-[19px] font-black leading-tight ${cls}`}
              style={{ ...vars, fontFamily: fontFamily || undefined, color: cls ? undefined : "#f4f1fa" }}
            >
              {sample}
            </p>
            <p className="mt-2 text-[11px] font-medium text-white/80">{e.label}</p>
            <p className="truncate text-[10.5px] text-white/40">{e.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

export type AlignValue = "left" | "center" | "right";

/** Three-way hero alignment segmented control. */
export function AlignPicker({
  value,
  onChange,
}: {
  value: AlignValue;
  onChange: (v: AlignValue) => void;
}) {
  const opts: { v: AlignValue; icon: typeof AlignLeft; label: string }[] = [
    { v: "left", icon: AlignLeft, label: "Left" },
    { v: "center", icon: AlignCenter, label: "Center" },
    { v: "right", icon: AlignRight, label: "Right" },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-white/12">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] transition-colors ${
            value === o.v ? "bg-[#ff2e88] font-semibold text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <o.icon className="h-3.5 w-3.5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Labelled range slider with a reset-to-default affordance. */
export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  format,
  onReset,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onReset?: () => void;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="studio-label !mb-0">{label}</label>
        <span className="flex items-center gap-2 text-[11.5px] text-white/55">
          {format ? format(value) : `${value}${unit}`}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label={`Reset ${label}`}
              className="rounded p-0.5 text-white/40 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        className="mt-1 w-full accent-[#ff2e88]"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
