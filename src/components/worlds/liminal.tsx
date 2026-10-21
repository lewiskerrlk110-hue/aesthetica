"use client";

import { useState, useCallback } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { MapPin, Dices } from "lucide-react";

// ————— Environment: barely-moving fluorescent interior —————
function LiminalEnv() {
  const reduced = useApp((s) => s.fxReduced);
  const ref = useCanvasLoop((ctx, w, h, t) => {
    // slow camera drift via offset
    const drift = Math.sin(t / 9000) * 12;
    const horizon = h * 0.5;

    // ceiling
    ctx.fillStyle = "#e7e1d1";
    ctx.fillRect(0, 0, w, h * 0.34);
    // ceiling tiles
    ctx.strokeStyle = "rgba(160,152,132,0.35)";
    ctx.lineWidth = 1;
    for (let x = -((drift * 2) % 80); x < w; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 30, h * 0.34);
      ctx.stroke();
    }
    for (let y = 20; y < h * 0.34; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y - 8);
      ctx.stroke();
    }

    // fluorescent panels
    for (let i = 0; i < 3; i++) {
      const px = w * (0.2 + i * 0.3) - drift;
      const flicker = 0.82 + 0.18 * Math.sin(t / 400 + i * 2) * (Math.random() > 0.985 ? 0.4 : 1);
      ctx.fillStyle = `rgba(253,248,232,${0.75 * flicker})`;
      ctx.fillRect(px, h * 0.06, 90, 18);
      ctx.fillStyle = `rgba(253,248,232,${0.12 * flicker})`;
      ctx.fillRect(px - 30, h * 0.06, 150, 40);
    }

    // back wall
    ctx.fillStyle = "#d8d2c4";
    ctx.fillRect(0, h * 0.34, w, horizon - h * 0.34);

    // corridor opening
    ctx.fillStyle = "#c4beae";
    ctx.beginPath();
    ctx.moveTo(w * 0.34 - drift * 0.5, h * 0.34);
    ctx.lineTo(w * 0.66 - drift * 0.5, h * 0.34);
    ctx.lineTo(w * 0.6 - drift * 0.3, horizon);
    ctx.lineTo(w * 0.4 - drift * 0.3, horizon);
    ctx.closePath();
    ctx.fill();

    // side walls with perspective doors
    ctx.fillStyle = "#cfc9bb";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.34 - drift * 0.5, h * 0.34);
    ctx.lineTo(w * 0.4 - drift * 0.3, horizon);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c7c1b1";
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.66 - drift * 0.5, h * 0.34);
    ctx.lineTo(w * 0.6 - drift * 0.3, horizon);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // doors on left wall
    for (let d = 0; d < 3; d++) {
      const p = 0.25 + d * 0.22;
      const dx0 = w * 0.34 * (1 - p) - drift * (1 - p * 0.6);
      const top = h * 0.34 + (horizon - h * 0.34) * p * 0.5;
      const bot = h * (0.5 + p * 0.4);
      ctx.fillStyle = "#b3a98c";
      ctx.fillRect(dx0 + 30 * (1 - p), top, 26 * (1 - p * 0.4), bot - top);
    }

    // floor
    const fl = ctx.createLinearGradient(0, horizon, 0, h);
    fl.addColorStop(0, "#b8b2a2");
    fl.addColorStop(1, "#a8a294");
    ctx.fillStyle = fl;
    ctx.fillRect(0, horizon, w, h - horizon);
    // floor tile lines
    ctx.strokeStyle = "rgba(90,86,70,0.18)";
    for (let i = -4; i < 12; i++) {
      const p = i / 8;
      const y = horizon + Math.pow(p, 1.6) * (h - horizon) + Math.pow(p, 1.6) * 30;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // sign on back wall
    ctx.fillStyle = "#efe9da";
    ctx.fillRect(w * 0.44 - drift * 0.4, h * 0.4, w * 0.12, h * 0.05);
    ctx.fillStyle = "#7a7466";
    ctx.font = `${Math.round(h * 0.022)}px sans-serif`;
    ctx.fillText("CORRIDOR B", w * 0.455 - drift * 0.4, h * 0.435);

    // overall wash
    ctx.fillStyle = "rgba(216,210,196,0.12)";
    ctx.fillRect(0, 0, w, h);
  }, { reduced });

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(216,210,196,0.25), rgba(216,210,196,0.05) 40%, rgba(216,210,196,0.3))" }} />
    </>
  );
}

// ————— Location directory + random discovery —————
const LOCATIONS = [
  { name: "The Mall, Second Floor", type: "retail", desc: "Between the closed smoothie kiosk and the fountain that still runs. The skylights make it noon forever.", tags: "mall, skylight, fountain" },
  { name: "Hotel Corridor 4", type: "transit", desc: "Forty-two identical doors. The ice machine hums in a room you will never find.", tags: "hotel, repetition, hum" },
  { name: "Municipal Pool, Off-Season", type: "civic", desc: "Blue tiles, still water, lifeguard chair vacant since October. The echo arrives late.", tags: "pool, tiles, echo" },
  { name: "Airport, Gate 12", type: "transit", desc: "The departure board shows one flight, always boarding, never called.", tags: "airport, waiting" },
  { name: "School Corridor, August", type: "civic", desc: "Four hundred footsteps' worth of lino. The radiators tick to nobody.", tags: "school, summer, lino" },
  { name: "Underpass at the Ring Road", type: "infrastructure", desc: "A short cut between two car parks, lit by one tube that buzzes in E flat.", tags: "underpass, buzz" },
  { name: "Office Lobby, After Hours", type: "workplace", desc: "The reception desk with a bell and no one to ring it to.", tags: "office, bell" },
  { name: "Stairwell 9", type: "transit", desc: "Nine flights, identical landings, a window on the sixth that shows a wall.", tags: "stairs, window" },
];

const TYPES = ["all", "retail", "transit", "civic", "infrastructure", "workplace"];

function Directory() {
  const navigate = useApp((s) => s.navigate);
  const [type, setType] = useState("all");
  const [random, setRandom] = useState<(typeof LOCATIONS)[number] | null>(null);

  const roll = useCallback(() => {
    setRandom(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
  }, []);

  const list = type === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.type === type);

  return (
    <div className="w-panel p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MapPin className="h-5 w-5 w-accent" /> The Directory of Empty Places
          </h2>
          <p className="mt-0.5 text-[12.5px] text-[var(--w-fg-dim)]">A map of interconnected liminal environments. Select a district, or let one choose you.</p>
        </div>
        <button onClick={roll} className="w-btn" aria-live="polite">
          <Dices className="h-4 w-4" /> Random discovery
        </button>
      </header>

      {random && (
        <div className="mb-4 rounded-lg border-l-4 bg-[var(--w-panel)] p-4" style={{ borderColor: "var(--w-accent)" }} role="status">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">You found</p>
          <p className="mt-0.5 text-[16px] font-semibold">{random.name}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed opacity-80">{random.desc}</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TYPES.map((tp) => (
          <button key={tp} onClick={() => setType(tp)} aria-pressed={type === tp} className="w-tag" style={type === tp ? { color: "var(--w-fg)", borderColor: "var(--w-accent)" } : undefined}>
            {tp === "all" ? "everywhere" : tp}
          </button>
        ))}
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-2">
        {list.map((l) => (
          <li key={l.name}>
            <button
              className="w-full rounded-lg border border-[var(--w-panel-border)] p-3.5 text-left transition-all hover:border-[var(--w-accent)] hover:bg-white/[0.04]"
              onClick={() => navigate({ view: "search", q: l.tags.split(",")[0].trim() })}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold">{l.name}</span>
                <span className="rounded-full bg-[var(--w-accent)]/15 px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--w-accent)" }}>{l.type}</span>
              </span>
              <span className="mt-1 block text-[12.5px] leading-relaxed opacity-65">{l.desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LiminalPage() {
  const world = WORLD_MAP.liminal;
  const env = <LiminalEnv />;
  const features = (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-6">
      <Directory />
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
