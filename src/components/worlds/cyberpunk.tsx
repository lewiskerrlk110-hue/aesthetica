"use client";

import { useMemo, useRef, useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { CloudRain } from "lucide-react";

// ————— Environment: layered rain megacity —————
interface Raindrop { x: number; y: number; v: number; len: number }

function CyberEnv() {
  const reduced = useApp((s) => s.fxReduced);
  const dropsRef = useRef<Raindrop[] | null>(null);

  const ref = useCanvasLoop((ctx, w, h, t, dt) => {
    if (!dropsRef.current) {
      dropsRef.current = Array.from({ length: 110 }, () => ({
        x: Math.random(),
        y: Math.random(),
        v: 0.5 + Math.random() * 0.8,
        len: 8 + Math.random() * 14,
      }));
    }
    const drops = dropsRef.current;
    const horizon = h * 0.86;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#050810");
    sky.addColorStop(0.7, "#0a1220");
    sky.addColorStop(1, "#12203a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    // building layers — 3 depth planes
    const planes = [
      { n: 9, hMin: 0.3, hMax: 0.62, color: "#0c1626", win: 0.05, offset: 0 },
      { n: 12, hMin: 0.42, hMax: 0.8, color: "#0a1220", win: 0.1, offset: 130 },
      { n: 7, hMin: 0.55, hMax: 0.95, color: "#060a14", win: 0.16, offset: 300 },
    ];
    for (const p of planes) {
      for (let i = 0; i < p.n; i++) {
        const bw = w / p.n + 14;
        const bx = i * bw - ((p.offset * 0.3) % bw);
        const bh = h * (p.hMin + (((i * 97 + p.offset) % 100) / 100) * (p.hMax - p.hMin));
        ctx.fillStyle = p.color;
        ctx.fillRect(bx, horizon - bh, bw, bh);
        // windows
        for (let wy = 0; wy < Math.floor(bh / 26); wy++) {
          for (let wx = 0; wx < 3; wx++) {
            const seed = (i * 31 + wy * 7 + wx * 13 + p.offset) % 17;
            if (seed % 3 === 0) continue;
            ctx.fillStyle = seed % 5 === 0 ? rgba("#ff2a3c", 0.5) : rgba("#00e5ff", 0.55);
            ctx.fillRect(bx + 8 + wx * (bw / 3.4), horizon - bh + 10 + wy * 26, 7, 4);
          }
        }
      }
    }

    // distant sign glows
    const signs: [number, number, string, string][] = [
      [0.18, 0.3, "#ff2a3c", "未来通"],
      [0.55, 0.22, "#00e5ff", "NEXUS"],
      [0.8, 0.38, "#ff2a3c", "24H"],
    ];
    for (const [fx, fy, color, label] of signs) {
      const flick = 0.75 + 0.25 * Math.sin(t / 300 + fx * 10);
      ctx.globalAlpha = flick;
      ctx.font = `${Math.round(h * 0.035)}px monospace`;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillText(label, w * fx, h * fy);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // steam vents
    for (let s = 0; s < 3; s++) {
      const sx = w * (0.25 + s * 0.28);
      const steam = ctx.createRadialGradient(sx, horizon, 4, sx, horizon - 40, 70);
      const phase = ((t / 2600 + s * 0.4) % 1);
      steam.addColorStop(0, rgba("#8fb4cc", 0.16 * (1 - phase)));
      steam.addColorStop(1, rgba("#8fb4cc", 0));
      ctx.fillStyle = steam;
      ctx.fillRect(sx - 70, horizon - 110, 140, 110);
    }

    // ground reflection
    const gr = ctx.createLinearGradient(0, horizon, 0, h);
    gr.addColorStop(0, "#0a1424");
    gr.addColorStop(1, "#050810");
    ctx.fillStyle = gr;
    ctx.fillRect(0, horizon, w, h - horizon);
    // neon reflections
    for (const [fx,, color] of signs) {
      const refl = ctx.createLinearGradient(0, horizon, 0, h);
      refl.addColorStop(0, rgba(color, 0.22));
      refl.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = refl;
      ctx.fillRect(w * fx - 30, horizon, 120, h - horizon);
    }

    // rain
    ctx.strokeStyle = rgba("#7fb4d8", 0.35);
    ctx.lineWidth = 1;
    for (const d of drops) {
      d.y += d.v * (dt / 900);
      if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
      const dx = d.x * w;
      const dy = d.y * h;
      ctx.globalAlpha = 0.16 + d.v * 0.18;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx - 2, dy + d.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, { reduced });

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="film-grain absolute inset-0 opacity-60" />
    </>
  );
}

// ————— Cinematic visual timeline —————
const TIMELINE = [
  { year: "1968", title: "Do Androids Dream of Electric Sheep?", body: "Philip K. Dick asks what remains of identity when memory can be manufactured. The question becomes cyberpunk's engine.", kind: "literature" },
  { year: "1982", title: "Blade Runner", body: "Ridley Scott and visual futurist Syd Mead render the megacity: rain, neon, monumental towers. The movement's visual grammar is born on screen.", kind: "film" },
  { year: "1983", title: "'Cyberpunk' — Bruce Bethke", body: "The short story gives the movement its name: kids with keyboards, corporations with armies.", kind: "literature" },
  { year: "1984", title: "Neuromancer", body: "William Gibson's debut consolidates the genre — console cowboys, corporate arcologies, the matrix. It wins the Hugo, Nebula and Philip K. Dick awards.", kind: "literature" },
  { year: "1988", title: "Akira", body: "Katsuhiro Otomo's Neo-Tokyo: biker gangs, psychic awakening, city-scale destruction. Cyberpunk enters world animation.", kind: "anime" },
  { year: "1992", title: "Snow Crash", body: "Neal Stephenson's metaverse satire sends the genre spiralling into virtual worlds and linguistic viruses.", kind: "literature" },
  { year: "1994", title: "Kowloon Walled City demolished", body: "The self-built Hong Kong enclave — 50,000 people in a single unplanned structure — is razed. It remains the movement's most cited real architecture.", kind: "architecture" },
  { year: "1995", title: "Ghost in the Shell", body: "Mamoru Oshii's film fuses cyberpunk with contemplative philosophy: bodies as shells, identity as signal.", kind: "anime" },
  { year: "1999", title: "The Matrix", body: "The Wachowskis close the century's cycle, translating Gibson's cyberspace into mainstream cinema.", kind: "film" },
  { year: "2020", title: "Cyberpunk 2077", body: "The video game introduces the label to new generations — four decades after the movement began on the printed page.", kind: "games" },
];

function Timeline() {
  const [active, setActive] = useState<number | null>(null);
  const KIND_COLOR: Record<string, string> = {
    literature: "#00e5ff",
    film: "#ff2a3c",
    anime: "#ffb347",
    architecture: "#9fae5a",
    games: "#d9b8ff",
  };
  return (
    <div className="w-scroll overflow-x-auto pb-3">
      <div className="relative flex min-w-[900px] gap-0 px-2 pt-8">
        <div className="absolute left-0 right-0 top-[26px] h-px" style={{ background: "linear-gradient(90deg, transparent, #00e5ff55 8%, #00e5ff55 92%, transparent)" }} />
        {TIMELINE.map((e, i) => (
          <button
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            className="group relative flex w-[150px] shrink-0 flex-col items-center px-1.5 text-center"
            aria-expanded={active === i}
          >
            <span
              className="absolute top-[20px] h-3 w-3 rounded-full border-2 transition-transform group-hover:scale-125"
              style={{ borderColor: KIND_COLOR[e.kind], background: "#050810", boxShadow: `0 0 12px ${KIND_COLOR[e.kind]}` }}
            />
            <span className="mb-6 font-[var(--font-ibm-plex-mono)] text-[13px] font-medium" style={{ color: KIND_COLOR[e.kind] }}>
              {e.year}
            </span>
            <span className="mt-3 text-[12.5px] font-semibold leading-snug">{e.title}</span>
            <span
              className="mt-2 overflow-hidden text-[11.5px] leading-relaxed opacity-70 transition-all"
              style={{ maxHeight: active === i ? 120 : 0 }}
            >
              {e.body}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11.5px] opacity-45">Tap a node to expand · colour indicates medium</p>
    </div>
  );
}

export function CyberpunkPage() {
  const world = WORLD_MAP.cyberpunk;
  const env = useMemo(() => <CyberEnv />, []);
  const features = (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-6">
      <div className="w-panel p-6">
        <header className="mb-4 flex items-center gap-3">
          <CloudRain className="h-5 w-5 w-accent" />
          <div>
            <h2 className="w-display text-xl font-bold">The Visual Timeline</h2>
            <p className="text-[12.5px] text-[var(--w-fg-dim)]">How the movement moved — from page to screen to street. Documented milestones only.</p>
          </div>
        </header>
        <Timeline />
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
