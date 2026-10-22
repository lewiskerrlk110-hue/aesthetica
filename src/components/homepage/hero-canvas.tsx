"use client";

import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";

// ————— Universe hero — "The Constellation of Eight Worlds" —————
// Deep space holds the whole museum: eight nebulae tinted in each world's
// colour, a slow spiral galaxy at the centre, a three-layer twinkling
// starfield, shooting stars — and a constellation of eight world-stars
// that take turns to flare, connecting every room of the museum.

// one tint per world, spread across the spectrum
const TINTS = ["#ff2e88", "#ff8a5c", "#d8c34a", "#7df2d8", "#23e6ff", "#78c8f5", "#8a5fd0", "#b48aff"];

// deterministic pseudo-random from an index — stable star positions, no state
function rnd(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function twinkle(t: number, i: number, speed: number) {
  return 0.72 + 0.28 * Math.sin(t * speed + i * 2.39);
}

export function HeroCanvas() {
  const reduced = useApp((s) => s.fxReduced);

  const ref = useCanvasLoop((ctx, w, h, t) => {
    const m = Math.min(w, h);

    // ——— deep space ———
    const space = ctx.createLinearGradient(0, 0, 0, h);
    space.addColorStop(0, "#050310");
    space.addColorStop(0.42, "#0a0618");
    space.addColorStop(0.78, "#130b28");
    space.addColorStop(1, "#1a1033");
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, w, h);

    // ——— eight world-tinted nebulae, drifting almost imperceptibly ———
    for (let i = 0; i < 8; i++) {
      const nx = (0.1 + 0.8 * rnd(i * 3 + 1)) * w + Math.sin(t * 0.00005 + i * 1.7) * m * 0.02;
      const ny = (0.06 + 0.62 * rnd(i * 3 + 2)) * h + Math.cos(t * 0.00004 + i * 2.3) * m * 0.015;
      const nr = m * (0.26 + 0.24 * rnd(i * 3 + 3));
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      ng.addColorStop(0, rgba(TINTS[i], 0.16));
      ng.addColorStop(0.55, rgba(TINTS[i], 0.06));
      ng.addColorStop(1, rgba(TINTS[i], 0));
      ctx.fillStyle = ng;
      ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    }

    // ——— spiral galaxy: the museum at the centre of the universe ———
    const gx = w * 0.5;
    const gy = h * 0.68;
    const grx = m * 0.3;
    const gry = m * 0.115;

    const halo = ctx.createRadialGradient(gx, gy, 0, gx, gy, m * 0.46);
    halo.addColorStop(0, "rgba(201,184,255,0.09)");
    halo.addColorStop(0.5, "rgba(155,232,255,0.035)");
    halo.addColorStop(1, "rgba(155,232,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(1, gry / grx); // squash into perspective
    const rot = t * 0.00004;
    for (let arm = 0; arm < 2; arm++) {
      for (let s = 0; s < 110; s++) {
        const th = (s / 110) * Math.PI * 2.35 + arm * Math.PI + rot;
        const rr = grx * (0.1 + 0.92 * Math.pow(s / 110, 1.45));
        const jx = (rnd(arm * 997 + s * 3) - 0.5) * grx * 0.07;
        const jy = (rnd(arm * 997 + s * 3 + 1) - 0.5) * grx * 0.07;
        const px = Math.cos(th) * rr + jx;
        const py = Math.sin(th) * rr + jy;
        const fade = 1 - s / 130;
        const sz = 0.5 + rnd(arm * 997 + s * 3 + 2) * 1.15;
        ctx.globalAlpha = Math.max(0, fade * (0.42 + rnd(s + arm * 13) * 0.44));
        ctx.fillStyle = s < 40 ? "#ffe9c9" : s % 9 === 0 ? "#ffb3e6" : "#bfe0ff";
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // cluster specks between the arms
    for (let s = 0; s < 46; s++) {
      const th = rnd(s * 5 + 61) * Math.PI * 2;
      const rr = grx * (0.12 + 0.8 * Math.pow(rnd(s * 5 + 62), 1.3));
      ctx.globalAlpha = 0.16 + rnd(s * 5 + 63) * 0.22;
      ctx.fillStyle = "#dfe8ff";
      ctx.beginPath();
      ctx.arc(Math.cos(th) * rr, Math.sin(th) * rr, 0.4 + rnd(s * 5 + 64) * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // galactic core
    const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, m * 0.085);
    core.addColorStop(0, "rgba(255,248,235,0.75)");
    core.addColorStop(0.35, "rgba(255,225,180,0.3)");
    core.addColorStop(1, "rgba(255,225,180,0)");
    ctx.fillStyle = core;
    ctx.fillRect(gx - m * 0.09, gy - m * 0.09, m * 0.18, m * 0.18);

    // ——— starfield: three depth layers ———
    const layers = [
      { n: 150, rMin: 0.35, rMax: 1.0, aBase: 0.28, spMin: 0.0006, spMax: 0.0016 },
      { n: 64, rMin: 0.8, rMax: 1.7, aBase: 0.5, spMin: 0.0005, spMax: 0.0013 },
      { n: 24, rMin: 1.4, rMax: 2.4, aBase: 0.72, spMin: 0.0004, spMax: 0.001 },
    ];
    let starIdx = 0;
    for (let li = 0; li < layers.length; li++) {
      const L = layers[li];
      for (let s = 0; s < L.n; s++) {
        const i = starIdx++;
        const x = rnd(i * 7 + 11) * w;
        const y = rnd(i * 7 + 12) * h;
        const r = L.rMin + rnd(i * 7 + 13) * (L.rMax - L.rMin);
        const a = (L.aBase + rnd(i * 7 + 14) * 0.42) * twinkle(t, i, L.spMin + rnd(i * 7 + 15) * (L.spMax - L.spMin));
        const tint = i % 11 === 0 ? TINTS[i % 8] : "#ffffff";
        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = tint;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // cross glints on the brightest few of the near layer
        if (li === 2 && r > 2.1) {
          ctx.globalAlpha = Math.min(1, a) * 0.5;
          ctx.strokeStyle = tint;
          ctx.lineWidth = 0.7;
          const gl = r * 3.4;
          ctx.beginPath();
          ctx.moveTo(x - gl, y);
          ctx.lineTo(x + gl, y);
          ctx.moveTo(x, y - gl);
          ctx.lineTo(x, y + gl);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // ——— the constellation of eight worlds ———
    const P = 1350; // ms per flare step
    const active = (t / P) % 8;
    const pts: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const base = (i / 8) * Math.PI * 2 - Math.PI / 2 + (rnd(i * 13 + 5) - 0.5) * 0.6;
      const px = w * (0.5 + Math.cos(base) * (0.34 + rnd(i * 13 + 6) * 0.09));
      const py = h * (0.46 + Math.sin(base) * (0.3 + rnd(i * 13 + 7) * 0.08));
      pts.push([px, py]);
    }
    // constellation lines — each segment brightens as a neighbouring star flares
    ctx.strokeStyle = "#c9c4ff";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const dA = Math.min(Math.abs(active - i), 8 - Math.abs(active - i));
      const dB = Math.min(Math.abs(active - j), 8 - Math.abs(active - j));
      const dd = Math.min(dA, dB);
      const env = Math.exp(-dd * dd * 1.6);
      ctx.globalAlpha = 0.1 + env * 0.4;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
    }
    // world-stars, each glowing in its world's colour
    for (let i = 0; i < 8; i++) {
      const d = Math.min(Math.abs(active - i), 8 - Math.abs(active - i));
      const env = Math.exp(-d * d * 1.9);
      const px = pts[i][0];
      const py = pts[i][1];
      const glowR = m * (0.028 + 0.03 * env);
      const gg = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      gg.addColorStop(0, rgba(TINTS[i], 0.55 + 0.4 * env));
      gg.addColorStop(0.4, rgba(TINTS[i], 0.2 + 0.3 * env));
      gg.addColorStop(1, rgba(TINTS[i], 0));
      ctx.fillStyle = gg;
      ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + env * 1.2, 0, Math.PI * 2);
      ctx.fill();
      if (env > 0.5) {
        // four-point glint while flaring
        ctx.globalAlpha = Math.min(1, (env - 0.5) * 1.6);
        ctx.strokeStyle = TINTS[i];
        ctx.lineWidth = 1;
        const gl = m * 0.018;
        ctx.beginPath();
        ctx.moveTo(px - gl, py);
        ctx.lineTo(px + gl, py);
        ctx.moveTo(px, py - gl);
        ctx.lineTo(px, py + gl);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ——— shooting stars ———
    const PERIOD = 6200;
    const LIFE = 1100;
    const su = t % PERIOD;
    if (su < LIFE) {
      const seed = Math.floor(t / PERIOD);
      const p = su / LIFE;
      const sx0 = w * (0.12 + 0.76 * rnd(seed * 31 + 3));
      const sy0 = h * (0.04 + 0.3 * rnd(seed * 31 + 4));
      const ang = Math.PI * (0.68 + 0.16 * rnd(seed * 31 + 5));
      const dist = m * 0.42;
      const hx = sx0 + Math.cos(ang) * dist * p;
      const hy = sy0 + Math.sin(ang) * dist * p;
      const tail = m * (0.06 + 0.05 * p);
      const tx = hx - Math.cos(ang) * tail;
      const ty = hy - Math.sin(ang) * tail;
      const a = Math.sin(Math.PI * p);
      const sg = ctx.createLinearGradient(hx, hy, tx, ty);
      sg.addColorStop(0, `rgba(255,255,255,${(0.9 * a).toFixed(3)})`);
      sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = sg;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 5);
      hg.addColorStop(0, `rgba(255,255,255,${(0.8 * a).toFixed(3)})`);
      hg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(hx - 5, hy - 5, 10, 10);
    }

    // ——— vignette + blend into the page below ———
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.42, w / 2, h / 2, h * 0.98);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(3,2,8,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    const blend = ctx.createLinearGradient(0, h * 0.86, 0, h);
    blend.addColorStop(0, "rgba(13,11,20,0)");
    blend.addColorStop(1, "rgba(13,11,20,0.9)");
    ctx.fillStyle = blend;
    ctx.fillRect(0, h * 0.86, w, h * 0.14);
  }, { reduced });

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
