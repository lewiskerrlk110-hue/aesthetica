"use client";

import { useRef } from "react";
import { useCanvasLoop, hexToRgb, lerp } from "@/lib/canvas";
import { useApp } from "@/lib/store";

// Palette sequence through the eight worlds — the hero slowly cycles
// through each world's atmosphere (sky, horizon, motif colour).
const PHASES = [
  { skyTop: "#1a0a2e", skyMid: "#54123f", horizon: "#ff8a5c", glow: "#ff2e88", motif: "grid" }, // retrowave
  { skyTop: "#0d0221", skyMid: "#31065c", horizon: "#ff38e4", glow: "#23e6ff", motif: "grid" }, // synthwave
  { skyTop: "#2a1e3f", skyMid: "#c86bb1", horizon: "#7df2d8", glow: "#ff9ecb", motif: "bust" }, // vaporwave
  { skyTop: "#16213a", skyMid: "#4a5f8f", horizon: "#9be8ff", glow: "#ffb3e6", motif: "chrome" }, // y2k
  { skyTop: "#78c8f5", skyMid: "#c9e8fb", horizon: "#ffe6a0", glow: "#f7b4d0", motif: "cloud" }, // dreamcore
  { skyTop: "#050810", skyMid: "#0a1220", horizon: "#00e5ff", glow: "#ff2a3c", motif: "city" }, // cyberpunk
  { skyTop: "#d8d2c4", skyMid: "#e7e1d1", horizon: "#b3a98c", glow: "#8f9b7a", motif: "hall" }, // liminal
  { skyTop: "#1c1808", skyMid: "#6e6230", horizon: "#d8c34a", glow: "#9fae5a", motif: "rooms" }, // backrooms
];

const PHASE_MS = 9000; // each world's atmosphere lingers ~9s
const FADE_MS = 3500; // crossfade window

function phaseAt(t: number) {
  const cycle = PHASES.length * PHASE_MS;
  const x = t % cycle;
  const i = Math.floor(x / PHASE_MS);
  const local = x - i * PHASE_MS;
  const next = (i + 1) % PHASES.length;
  let a = 1;
  if (local > PHASE_MS - FADE_MS) a = (PHASE_MS - local) / FADE_MS;
  return { i, next, a };
}

function mixHex(c1: string, c2: string, a: number) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return `rgb(${Math.round(lerp(r1, r2, 1 - a))},${Math.round(lerp(g1, g2, 1 - a))},${Math.round(lerp(b1, b2, 1 - a))})`;
}

export function HeroCanvas() {
  const reduced = useApp((s) => s.fxReduced);

  const ref = useCanvasLoop((ctx, w, h, t) => {
    const { i, next, a } = phaseAt(t);
    const A = PHASES[i];
    const B = PHASES[next];
    const skyTop = mixHex(A.skyTop, B.skyTop, a);
    const skyMid = mixHex(A.skyMid, B.skyMid, a);
    const horizon = mixHex(A.horizon, B.horizon, a);
    const glow = mixHex(A.glow, B.glow, a);

    const horizonY = h * 0.62;

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyMid);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizonY);

    // glow orb
    const orbR = Math.min(w, h) * 0.16;
    const ox = w * 0.5;
    const oy = horizonY - orbR * 0.4;
    const og = ctx.createRadialGradient(ox, oy, orbR * 0.1, ox, oy, orbR * 2.4);
    og.addColorStop(0, mixHex(A.glow, "#ffffff", 0.1));
    og.addColorStop(0.4, skyMid);
    og.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = og;
    ctx.fillRect(0, 0, w, horizonY);

    const orbFill = ctx.createLinearGradient(0, oy - orbR, 0, oy + orbR);
    orbFill.addColorStop(0, mixHex("#ffe6a0", horizon, 0.35));
    orbFill.addColorStop(1, glow);
    ctx.fillStyle = orbFill;
    ctx.beginPath();
    ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
    ctx.fill();

    // scanline stripes across the orb
    ctx.fillStyle = skyTop;
    for (let s = 0; s < 5; s++) {
      const sy = oy - orbR * 0.25 + s * (orbR * 0.34);
      ctx.globalAlpha = 0.82;
      ctx.fillRect(ox - orbR, sy, orbR * 2, 3 + s * 2.2);
    }
    ctx.globalAlpha = 1;

    // motif layer — fragments of each world drifting through
    ctx.save();
    if (A.motif === "grid" || B.motif === "grid") {
      const ga = A.motif === "grid" ? a : 1 - a;
      ctx.globalAlpha = ga * 0.5;
      ctx.strokeStyle = mixHex(A.glow, B.glow, a);
      ctx.lineWidth = 1.2;
      for (let k = -10; k <= 10; k++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + k * (w / 22), horizonY);
        ctx.lineTo(w / 2 + k * (w / 3.2), h);
        ctx.stroke();
      }
      for (let r = 0; r < 7; r++) {
        const yy = horizonY + Math.pow(r / 7, 2.2) * (h - horizonY);
        ctx.globalAlpha = ga * 0.5 * (0.25 + (r / 7) * 0.75);
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(w, yy);
        ctx.stroke();
      }
    }
    if (A.motif === "city" || B.motif === "city") {
      const ga = A.motif === "city" ? a : 1 - a;
      ctx.globalAlpha = ga * 0.75;
      ctx.fillStyle = skyTop;
      for (let b = 0; b < 14; b++) {
        const bw = w / 12;
        const bx = b * bw - 10;
        const bh = 30 + ((b * 97) % 130) * (h / 600);
        ctx.fillRect(bx, horizonY - bh, bw, bh);
        ctx.fillStyle = mixHex(A.horizon, B.horizon, a);
        for (let wy = 0; wy < 4; wy++) {
          if ((b + wy) % 3 === 0) ctx.fillRect(bx + bw * 0.25, horizonY - bh + 10 + wy * 24, bw * 0.18, 5);
        }
        ctx.fillStyle = skyTop;
      }
    }
    if (A.motif === "cloud" || B.motif === "cloud") {
      const ga = A.motif === "cloud" ? a : 1 - a;
      ctx.globalAlpha = ga * 0.8;
      ctx.fillStyle = mixHex(A.horizon, "#ffffff", 0.45);
      for (let c = 0; c < 5; c++) {
        const cx = ((c * 250 + t * 0.012) % (w + 300)) - 150;
        const cy = 60 + (c % 3) * 70;
        for (const [dx, dy, r] of [[0, 0, 34], [30, 8, 26], [-32, 10, 24], [10, -12, 22]]) {
          ctx.beginPath();
          ctx.ellipse(cx + dx, cy + dy, r, r * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (A.motif === "chrome" || B.motif === "chrome") {
      const ga = A.motif === "chrome" ? a : 1 - a;
      const cx = w * 0.78;
      const cy = h * 0.24;
      const cg = ctx.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, 44);
      cg.addColorStop(0, "#ffffff");
      cg.addColorStop(0.5, mixHex(A.horizon, "#8fa8c8", 0.4));
      cg.addColorStop(1, mixHex(A.glow, "#3a4a66", 0.5));
      ctx.globalAlpha = ga * 0.9;
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 34 + Math.sin(t / 900) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // horizon band + ground
    const ground = ctx.createLinearGradient(0, horizonY, 0, h);
    ground.addColorStop(0, mixHex(horizon, "#000000", 0.25));
    ground.addColorStop(1, mixHex(skyTop, "#000000", 0.55));
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // atmospheric haze at horizon
    const haze = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 40);
    haze.addColorStop(0, "rgba(0,0,0,0)");
    haze.addColorStop(0.5, mixHex(horizon, "rgba(0,0,0,0)", 0.66));
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - 60, w, 100);

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 0.95);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, { reduced });

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
