"use client";

import { useMemo } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { DreamJournal, Postcards, MemoryFragments, CloudAtlas, SleepyRadio } from "@/components/features/dreamcore-features";

// ————— Living environment: layered dream landscape —————
function DreamEnv() {
  const reduced = useApp((s) => s.fxReduced);
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const horizon = h * 0.7;
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#78c8f5");
    sky.addColorStop(0.65, "#c9e8fb");
    sky.addColorStop(1, "#fff8ef");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    // sun glow
    const g = ctx.createRadialGradient(w * 0.72, horizon * 0.42, 10, w * 0.72, horizon * 0.42, h * 0.4);
    g.addColorStop(0, "rgba(255,230,160,0.65)");
    g.addColorStop(1, "rgba(255,230,160,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, horizon);

    // clouds — three depth layers drifting
    const drawCloud = (x: number, y: number, s: number, color: string, alpha: number) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      const blobs: [number, number, number][] = [[0, 0, 1], [0.9, 0.18, 0.72], [-0.95, 0.22, 0.66], [0.35, -0.3, 0.6], [-0.4, -0.12, 0.5]];
      for (const [dx, dy, r] of blobs) {
        ctx.beginPath();
        ctx.ellipse(x + dx * s, y + dy * s, r * s, r * s * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const layers = [
      { speed: 0.008, y: [0.18, 0.34], s: [64, 96], color: "#f7b4d0", alpha: 0.9 },
      { speed: 0.016, y: [0.4, 0.52], s: [44, 66], color: "#ffa77d", alpha: 0.75 },
      { speed: 0.03, y: [0.56, 0.64], s: [30, 44], color: "#ffe6a0", alpha: 0.7 },
    ];
    for (const L of layers) {
      for (let i = 0; i < 4; i++) {
        const x = ((i * w * 0.42 + t * L.speed) % (w + 320)) - 160;
        const y = horizon * (L.y[0] + (i % 2) * (L.y[1] - L.y[0]));
        const s = L.s[0] + (i % 3) * ((L.s[1] - L.s[0]) / 2);
        drawCloud(x, y, s, L.color, L.alpha);
      }
    }

    // distant hills
    ctx.fillStyle = "#c9b7f2";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.quadraticCurveTo(w * 0.22, horizon - h * 0.09, w * 0.42, horizon - h * 0.02);
    ctx.quadraticCurveTo(w * 0.6, horizon + h * 0.02, w * 0.78, horizon - h * 0.05);
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    // meadow
    const meadow = ctx.createLinearGradient(0, horizon, 0, h);
    meadow.addColorStop(0, "#a9d5a1");
    meadow.addColorStop(1, "#8bc48a");
    ctx.fillStyle = meadow;
    ctx.fillRect(0, horizon, w, h - horizon);

    // country road converging
    ctx.fillStyle = "#e8ddc8";
    ctx.beginPath();
    ctx.moveTo(w * 0.46, horizon);
    ctx.lineTo(w * 0.53, horizon);
    ctx.lineTo(w * 0.68, h);
    ctx.lineTo(w * 0.25, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.setLineDash([14, 18]);
    ctx.lineDashOffset = -(t * 0.02) % 32;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.495, horizon + 4);
    ctx.lineTo(w * 0.47, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // swaying flowers
    for (let i = 0; i < 26; i++) {
      const fx = (i * 97.3) % w;
      const fy = horizon + 20 + ((i * 61.7) % (h - horizon - 40));
      const sway = Math.sin(t / 800 + i) * 3;
      const c = i % 3 === 0 ? "#e26fa8" : i % 3 === 1 ? "#fff8ef" : "#ffe6a0";
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(fx + sway, fy, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(90,130,90,0.6)";
      ctx.beginPath();
      ctx.moveTo(fx + sway, fy + 3);
      ctx.lineTo(fx, fy + 9);
      ctx.stroke();
    }

    // floating particles
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 14; i++) {
      const px = (i * 173.3 + t * 0.012) % w;
      const py = h * 0.3 + ((i * 97.7 + t * 0.006) % (h * 0.5));
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { reduced });

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(255,248,239,0.35))" }} />
    </>
  );
}

export function DreamcorePage() {
  const world = WORLD_MAP.dreamcore;
  const env = useMemo(() => <DreamEnv />, []);
  const features = (
    <>
      <DreamJournal />
      <Postcards />
      <MemoryFragments />
      <CloudAtlas />
      <SleepyRadio />
    </>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
