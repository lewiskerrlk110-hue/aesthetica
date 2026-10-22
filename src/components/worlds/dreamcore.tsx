"use client";

import { useEffect, useMemo, useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba, hexToRgb } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { DreamJournal, Postcards, MemoryFragments, CloudAtlas, SleepyRadio } from "@/components/features/dreamcore-features";
import { Play, Pause, Sunrise } from "lucide-react";

// ————— Living environment: the meadow at the edge of the map, on a 24-hour sky —————
// The anotherworldcore reference reel is the anchor look (twilight, 21:12). A sky
// console now turns the whole scene — canvas, clouds, meadow, tethered island and
// the Bar of Dreams — through deep night, dawn, dream-day noon, golden hour and
// back into starlight, by slider, preset or an automatic cycle.

// ————— 24-hour palette —————
type SkyPalette = {
  day: number; // 0 = deep night, 1 = high dream-day
  sky: [string, string, string, string];
  glow: string;
  glowA: number;
  stars: number; // multiplier on star brightness
  eve: number; // evening star presence
  cloudShadow: string;
  cloudBody: string;
  cloudSide: string;
  cloudTop: string;
  cloudLit: string;
  cloudLitSide: string;
  cloudHi: string;
  cloudHi2: string;
  coreA: number;
  hillFar: string;
  hillNear: string;
  rim: string;
  rimFar: number;
  rimNear: number;
  meadow: [string, string];
  pond: [string, string];
  refl: string;
  reflA: number;
  shimmer: number;
  rainbow: number;
  motes: number;
  scrim: number; // top scrim keeps the hero title readable against a bright sky
  bottom: number; // grounding gradient along the bottom edge
};

const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
};

const rgbaMix = (a: string, b: string, t: number, alpha: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgba(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)},${alpha})`;
};

const lerpNum = (a: number, b: number, t: number) => a + (b - a) * t;

const P_NIGHT: SkyPalette = {
  day: 0,
  sky: ["#070a24", "#141a4a", "#2e3060", "#6a4f88"],
  glow: "#ffbed7", glowA: 0.22,
  stars: 1.25, eve: 1,
  cloudShadow: "#2c2456", cloudBody: "#4e3f78", cloudSide: "#453768", cloudTop: "#5a4784",
  cloudLit: "#b886b0", cloudLitSide: "#a87ba6", cloudHi: "#cfa8d0", cloudHi2: "#c49cc8", coreA: 0.3,
  hillFar: "#3a5f4e", hillNear: "#284c3c", rim: "#ffafd2", rimFar: 0.25, rimNear: 0.15,
  meadow: ["#223f34", "#0d1f1a"],
  pond: ["#1c2448", "#0b1030"], refl: "#ff9ed2", reflA: 0.4, shimmer: 0.28,
  rainbow: 0.1, motes: 0.85, scrim: 0, bottom: 0.6,
};

const P_DAWN: SkyPalette = {
  day: 0.22,
  sky: ["#1a2150", "#3c3c78", "#8a6398", "#ffb388"],
  glow: "#ffc088", glowA: 0.5,
  stars: 0.4, eve: 0.55,
  cloudShadow: "#4a4178", cloudBody: "#7c5f96", cloudSide: "#6d5386", cloudTop: "#8a6aa4",
  cloudLit: "#ffbe9e", cloudLitSide: "#f0a890", cloudHi: "#ffe2c4", cloudHi2: "#f8d4b8", coreA: 0.85,
  hillFar: "#52755e", hillNear: "#3d6550", rim: "#ffc9a0", rimFar: 0.5, rimNear: 0.35,
  meadow: ["#3a5f4a", "#1a352c"],
  pond: ["#343e64", "#161e40"], refl: "#ffb894", reflA: 0.45, shimmer: 0.32,
  rainbow: 0.15, motes: 0.6, scrim: 0.14, bottom: 0.45,
};

const P_MORNING: SkyPalette = {
  day: 0.8,
  sky: ["#3a62ac", "#6f97cc", "#a8c4e4", "#ffdcc4"],
  glow: "#ffe0c0", glowA: 0.4,
  stars: 0, eve: 0,
  cloudShadow: "#7d88bc", cloudBody: "#b4bce0", cloudSide: "#a5add6", cloudTop: "#c4c8e8",
  cloudLit: "#ffe4dc", cloudLitSide: "#f8d4cc", cloudHi: "#fff4ec", cloudHi2: "#f8ecf0", coreA: 0.45,
  hillFar: "#6a9070", hillNear: "#4f7a5e", rim: "#ffe0b8", rimFar: 0.4, rimNear: 0.28,
  meadow: ["#4d7c58", "#2a5342"],
  pond: ["#557bb0", "#2b4772"], refl: "#ffd8c0", reflA: 0.35, shimmer: 0.3,
  rainbow: 0.17, motes: 0.4, scrim: 0.32, bottom: 0.3,
};

const P_NOON: SkyPalette = {
  day: 1,
  sky: ["#4a74be", "#82aade", "#b8d4ee", "#ffe8d0"],
  glow: "#fff0d8", glowA: 0.35,
  stars: 0, eve: 0,
  cloudShadow: "#8a94c4", cloudBody: "#c6cdea", cloudSide: "#b4bce2", cloudTop: "#d4d8f0",
  cloudLit: "#fff0ea", cloudLitSide: "#ffe2e0", cloudHi: "#ffffff", cloudHi2: "#fdf4f6", coreA: 0.35,
  hillFar: "#79a37a", hillNear: "#5c8a66", rim: "#fff0c8", rimFar: 0.35, rimNear: 0.25,
  meadow: ["#5a8c62", "#32664a"],
  pond: ["#6394c8", "#3a5c8c"], refl: "#ffe8d8", reflA: 0.3, shimmer: 0.28,
  rainbow: 0.17, motes: 0.3, scrim: 0.36, bottom: 0.26,
};

const P_GOLDEN: SkyPalette = {
  day: 0.45,
  sky: ["#3a4a90", "#7c689c", "#c8869a", "#ffbe98"],
  glow: "#ffc890", glowA: 0.5,
  stars: 0, eve: 0.15,
  cloudShadow: "#6a5a94", cloudBody: "#9a7aa8", cloudSide: "#8a6c98", cloudTop: "#a884b4",
  cloudLit: "#ffc0a8", cloudLitSide: "#f4a894", cloudHi: "#ffe4cc", cloudHi2: "#fcd8c4", coreA: 0.8,
  hillFar: "#63805e", hillNear: "#4a6c52", rim: "#ffb890", rimFar: 0.5, rimNear: 0.35,
  meadow: ["#4a7350", "#26453a"],
  pond: ["#3d4d78", "#1d2a4e"], refl: "#ffbe9c", reflA: 0.5, shimmer: 0.32,
  rainbow: 0.14, motes: 0.45, scrim: 0.16, bottom: 0.42,
};

const P_SUNSET: SkyPalette = {
  day: 0.12,
  sky: ["#141a48", "#33306a", "#6f5490", "#d8849e"],
  glow: "#ffbed7", glowA: 0.55,
  stars: 0.5, eve: 0.6,
  cloudShadow: "#3d3468", cloudBody: "#67528c", cloudSide: "#5c4a80", cloudTop: "#745c9a",
  cloudLit: "#f4a4c4", cloudLitSide: "#e896b6", cloudHi: "#f8cce4", cloudHi2: "#eec2dc", coreA: 0.75,
  hillFar: "#45705c", hillNear: "#33604c", rim: "#ffafd2", rimFar: 0.5, rimNear: 0.32,
  meadow: ["#2d5244", "#142c26"],
  pond: ["#26305a", "#101838"], refl: "#ff9ec4", reflA: 0.5, shimmer: 0.34,
  rainbow: 0.12, motes: 0.7, scrim: 0.05, bottom: 0.52,
};

// The reference-reel look — every value here mirrors the original scene exactly.
const P_TWILIGHT: SkyPalette = {
  day: 0,
  sky: ["#0d1233", "#26306b", "#55508f", "#b878b8"],
  glow: "#ffbed7", glowA: 0.5,
  stars: 1, eve: 1,
  cloudShadow: "#3a3270", cloudBody: "#6b5492", cloudSide: "#614c86", cloudTop: "#7a5f9e",
  cloudLit: "#f0a8c8", cloudLitSide: "#e290bc", cloudHi: "#f4d0e8", cloudHi2: "#eec4e4", coreA: 0.7,
  hillFar: "#47745e", hillNear: "#33604e", rim: "#ffafd2", rimFar: 0.45, rimNear: 0.28,
  meadow: ["#2c5244", "#152e28"],
  pond: ["#26305c", "#101736"], refl: "#ff9ed2", reflA: 0.5, shimmer: 0.35,
  rainbow: 0.13, motes: 1, scrim: 0, bottom: 0.55,
};

const P_NIGHTFALL: SkyPalette = {
  day: 0,
  sky: ["#0a0e2c", "#1c224e", "#3c3a70", "#8a6098"],
  glow: "#ffbed7", glowA: 0.3,
  stars: 1.15, eve: 1,
  cloudShadow: "#302858", cloudBody: "#564480", cloudSide: "#4c3c74", cloudTop: "#63508c",
  cloudLit: "#c890b8", cloudLitSide: "#b884ae", cloudHi: "#d8b4d8", cloudHi2: "#cca8cc", coreA: 0.4,
  hillFar: "#3d6452", hillNear: "#2b5140", rim: "#ffafd2", rimFar: 0.3, rimNear: 0.18,
  meadow: ["#25453a", "#10231e"],
  pond: ["#1e284c", "#0c1230"], refl: "#ff9ed2", reflA: 0.42, shimmer: 0.3,
  rainbow: 0.11, motes: 0.9, scrim: 0, bottom: 0.58,
};

const KEYS: { h: number; p: SkyPalette }[] = [
  { h: 0, p: P_NIGHT },
  { h: 4.6, p: P_NIGHT },
  { h: 6.4, p: P_DAWN },
  { h: 8.4, p: P_MORNING },
  { h: 13, p: P_NOON },
  { h: 17.6, p: P_GOLDEN },
  { h: 19.9, p: P_SUNSET },
  { h: 21.2, p: P_TWILIGHT },
  { h: 22.8, p: P_NIGHTFALL },
];

function lerpPalette(a: SkyPalette, b: SkyPalette, t: number): SkyPalette {
  const c = (x: string, y: string) => mix(x, y, t);
  return {
    day: lerpNum(a.day, b.day, t),
    sky: [c(a.sky[0], b.sky[0]), c(a.sky[1], b.sky[1]), c(a.sky[2], b.sky[2]), c(a.sky[3], b.sky[3])],
    glow: c(a.glow, b.glow), glowA: lerpNum(a.glowA, b.glowA, t),
    stars: lerpNum(a.stars, b.stars, t), eve: lerpNum(a.eve, b.eve, t),
    cloudShadow: c(a.cloudShadow, b.cloudShadow), cloudBody: c(a.cloudBody, b.cloudBody),
    cloudSide: c(a.cloudSide, b.cloudSide), cloudTop: c(a.cloudTop, b.cloudTop),
    cloudLit: c(a.cloudLit, b.cloudLit), cloudLitSide: c(a.cloudLitSide, b.cloudLitSide),
    cloudHi: c(a.cloudHi, b.cloudHi), cloudHi2: c(a.cloudHi2, b.cloudHi2),
    coreA: lerpNum(a.coreA, b.coreA, t),
    hillFar: c(a.hillFar, b.hillFar), hillNear: c(a.hillNear, b.hillNear),
    rim: c(a.rim, b.rim), rimFar: lerpNum(a.rimFar, b.rimFar, t), rimNear: lerpNum(a.rimNear, b.rimNear, t),
    meadow: [c(a.meadow[0], b.meadow[0]), c(a.meadow[1], b.meadow[1])],
    pond: [c(a.pond[0], b.pond[0]), c(a.pond[1], b.pond[1])],
    refl: c(a.refl, b.refl), reflA: lerpNum(a.reflA, b.reflA, t), shimmer: lerpNum(a.shimmer, b.shimmer, t),
    rainbow: lerpNum(a.rainbow, b.rainbow, t), motes: lerpNum(a.motes, b.motes, t),
    scrim: lerpNum(a.scrim, b.scrim, t), bottom: lerpNum(a.bottom, b.bottom, t),
  };
}

function skyAt(tod: number): SkyPalette {
  for (let i = 0; i < KEYS.length; i++) {
    const cur = KEYS[i];
    const nxt = KEYS[i + 1] ?? { h: 24, p: KEYS[0].p };
    if (tod >= cur.h && tod <= nxt.h) {
      const raw = (tod - cur.h) / (nxt.h - cur.h);
      const s = raw * raw * (3 - 2 * raw); // smoothstep between keyframes
      return lerpPalette(cur.p, nxt.p, s);
    }
  }
  return KEYS[KEYS.length - 1].p;
}

// Sun rides an arc from 05:48 to 20:06; below the horizon it never draws.
function sunAltitude(tod: number) {
  const rise = 5.8, set = 20.1;
  if (tod <= rise || tod >= set) return 0;
  return Math.sin(((tod - rise) / (set - rise)) * Math.PI);
}

// ————— Living environment —————
function DreamEnv({ tod }: { tod: number }) {
  const reduced = useApp((s) => s.fxReduced);
  const P = useMemo(() => skyAt(tod), [tod]);
  const day = P.day;
  const glowK = 1 - day * 0.85; // window + neon glow strength

  const ref = useCanvasLoop((ctx, w, h, t) => {
    const horizon = h * 0.68;

    // — sky: four interpolated stops down to the horizon
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, P.sky[0]);
    sky.addColorStop(0.45, P.sky[1]);
    sky.addColorStop(0.78, P.sky[2]);
    sky.addColorStop(1, P.sky[3]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    // horizon glow — the light the clouds feed on
    const glow = ctx.createRadialGradient(w * 0.42, horizon, 10, w * 0.42, horizon, w * 0.55);
    glow.addColorStop(0, rgba(P.glow, P.glowA));
    glow.addColorStop(1, rgba(P.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, horizon);

    // — starfield (upper sky), fading out with the day
    if (P.stars > 0.02) {
      for (let i = 0; i < 92; i++) {
        const sx = (((i * 197.3) % 100) / 100) * w;
        const sy = (((i * 131.7) % 100) / 100) * horizon * 0.82;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t / 1100 + i * 1.71));
        ctx.fillStyle =
          i % 9 === 0
            ? rgba("#ffbedc", 0.75 * tw * P.stars)
            : i % 7 === 0
              ? rgba("#96d2ff", 0.75 * tw * P.stars)
              : rgba("#f0f0ff", 0.8 * tw * P.stars);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + (i % 4) * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // the evening star — bright planet with halo + cross glint
    if (P.eve > 0.02) {
      const ex = w * 0.64, ey = h * 0.13;
      const halo = ctx.createRadialGradient(ex, ey, 1, ex, ey, h * 0.075);
      halo.addColorStop(0, rgba("#ebf0ff", 0.9 * P.eve));
      halo.addColorStop(0.25, rgba("#c8d7ff", 0.28 * P.eve));
      halo.addColorStop(1, rgba("#c8d7ff", 0));
      ctx.fillStyle = halo;
      ctx.fillRect(ex - h * 0.08, ey - h * 0.08, h * 0.16, h * 0.16);
      ctx.strokeStyle = rgba("#f0f5ff", 0.5 * P.eve);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ex - 7, ey); ctx.lineTo(ex + 7, ey);
      ctx.moveTo(ex, ey - 7); ctx.lineTo(ex, ey + 7);
      ctx.stroke();
      ctx.fillStyle = rgba("#f4f6ff", Math.min(1, 0.25 + P.eve));
      ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
    }

    // — the dream-day sun, rising along its arc (drawn behind the cumulus)
    const alt = sunAltitude(tod);
    const sunA = Math.min(1, Math.max(0, (alt - 0.02) * 6));
    if (sunA > 0.01) {
      const sr = Math.min(w, h) * 0.105;
      const sx = w * 0.79; // right of the hero text block, under the rainbow arc
      const sy = horizon - alt * h * 0.4 + sr * 0.25;
      const pale = Math.min(1, alt * 1.6); // low sun is warm, high sun is pale
      const sunHalo = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 3.2);
      sunHalo.addColorStop(0, rgba(mix("#ffcf8e", "#fff3d0", pale), 0.32 * sunA));
      sunHalo.addColorStop(1, rgba(mix("#ffcf8e", "#fff3d0", pale), 0));
      ctx.fillStyle = sunHalo;
      ctx.fillRect(sx - sr * 3.2, sy - sr * 3.2, sr * 6.4, sr * 6.4);
      const disc = ctx.createRadialGradient(sx - sr * 0.2, sy - sr * 0.25, sr * 0.1, sx, sy, sr);
      disc.addColorStop(0, mix("#fff8e4", "#fffdf6", pale));
      disc.addColorStop(0.65, mix("#ffe4a0", "#fff3cc", pale));
      disc.addColorStop(1, mix("#ffc276", "#ffe3a8", pale));
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // — the great cumulus, relit by the time of day
    const cx = w * 0.38 + Math.sin(t / 14000) * w * 0.012;
    const cy = horizon - h * 0.16 + Math.sin(t / 9000) * 3;
    const s = Math.min(w, h) * 0.3;
    const blob = (dx: number, dy: number, r: number, fill: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(cx + dx * s, cy + dy * s, r * s, r * s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    // dark under-shadow
    blob(0, 0.2, 1.12, P.cloudShadow, 0.6);
    // body
    blob(0, 0, 1.0, P.cloudBody, 0.95);
    blob(0.85, 0.1, 0.7, P.cloudBody, 0.9);
    blob(-0.9, 0.12, 0.65, P.cloudBody, 0.9);
    blob(0.3, -0.28, 0.62, P.cloudTop, 0.9);
    blob(-0.35, -0.16, 0.55, P.cloudTop, 0.9);
    blob(1.35, 0.22, 0.45, P.cloudSide, 0.85);
    blob(-1.3, 0.24, 0.42, P.cloudSide, 0.85);
    // lit lower half
    blob(0, 0.16, 0.75, P.cloudLit, 0.85);
    blob(0.6, 0.2, 0.5, P.cloudLitSide, 0.8);
    blob(-0.55, 0.22, 0.48, P.cloudLit, 0.8);
    blob(1.0, 0.26, 0.34, P.cloudLitSide, 0.75);
    // golden core — light from the horizon
    const core = ctx.createRadialGradient(cx, cy + s * 0.22, s * 0.05, cx, cy + s * 0.22, s * 0.95);
    core.addColorStop(0, rgba("#ffcd96", P.coreA));
    core.addColorStop(1, rgba("#ffcd96", 0));
    ctx.fillStyle = core;
    ctx.fillRect(cx - s * 1.4, cy - s * 0.2, s * 2.8, s * 1.4);
    // top highlights
    blob(0.15, -0.3, 0.4, P.cloudHi, 0.8);
    blob(-0.25, -0.22, 0.34, P.cloudHi2, 0.7);

    // two distant drifting clouds
    for (let i = 0; i < 2; i++) {
      const dx = w * (i === 0 ? 0.76 : 0.13) + Math.sin(t / 11000 + i * 2.4) * w * 0.02;
      const dy = horizon - h * (i === 0 ? 0.3 : 0.37);
      const ds = Math.min(w, h) * (i === 0 ? 0.09 : 0.07);
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = P.cloudBody;
      for (const [ox, oy, r] of [[0, 0, 1], [0.8, 0.1, 0.62], [-0.75, 0.12, 0.58], [0.2, -0.25, 0.5]] as [number, number, number][]) {
        ctx.beginPath();
        ctx.ellipse(dx + ox * ds, dy + oy * ds, r * ds, r * ds * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // — faint pastel rainbow fragment on the right
    const rbColors = ["rgba(255,150,160,", "rgba(255,200,140,", "rgba(255,240,170,", "rgba(150,230,170,", "rgba(140,190,255,", "rgba(190,150,255,"];
    const rbCx = w * 0.85, rbCy = horizon + h * 0.05, rbR = h * 0.5;
    ctx.lineWidth = 3.5;
    rbColors.forEach((c, i) => {
      ctx.strokeStyle = c + P.rainbow + ")";
      ctx.beginPath();
      ctx.arc(rbCx, rbCy, rbR - i * 4.5, Math.PI * 1.02, Math.PI * 1.58);
      ctx.stroke();
    });

    // — hills with rim-lit crests
    const hillPath = (base: number, amp: number) => {
      ctx.beginPath();
      ctx.moveTo(0, base - amp * 0.18);
      ctx.quadraticCurveTo(w * 0.18, base - amp, w * 0.38, base - amp * 0.35);
      ctx.quadraticCurveTo(w * 0.56, base + amp * 0.15, w * 0.74, base - amp * 0.55);
      ctx.quadraticCurveTo(w * 0.88, base - amp * 0.75, w, base - amp * 0.3);
    };
    // far
    hillPath(horizon + 2, h * 0.055);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = P.hillFar;
    ctx.fill();
    hillPath(horizon + 2, h * 0.055);
    ctx.strokeStyle = rgba(P.rim, P.rimFar); ctx.lineWidth = 1.5; ctx.stroke();
    // near
    hillPath(horizon + h * 0.06, h * 0.075);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = P.hillNear;
    ctx.fill();
    hillPath(horizon + h * 0.06, h * 0.075);
    ctx.strokeStyle = rgba(P.rim, P.rimNear); ctx.lineWidth = 1.2; ctx.stroke();

    // — meadow
    const meadow = ctx.createLinearGradient(0, horizon + h * 0.06, 0, h);
    meadow.addColorStop(0, P.meadow[0]);
    meadow.addColorStop(1, P.meadow[1]);
    ctx.fillStyle = meadow;
    ctx.fillRect(0, horizon + h * 0.06, w, h);

    // — wildflowers, denser and taller toward the viewer
    for (let i = 0; i < 64; i++) {
      const fx = (((i * 149.3) % 100) / 100) * w;
      const fy = horizon + h * 0.1 + (((i * 83.7) % 100) / 100) * (h - horizon - h * 0.13);
      const depth = Math.min(1, (fy - horizon) / (h - horizon));
      const r = 1.4 + depth * 2.4;
      const sway = Math.sin(t / 850 + i * 1.3) * (1.5 + depth * 2);
      const c = i % 5 === 0 ? "#ffd8a8" : i % 3 === 0 ? "#ff9ed2" : i % 3 === 1 ? "#c8a8ee" : "#fff2fa";
      ctx.strokeStyle = "rgba(16,40,34,0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx + sway, fy);
      ctx.quadraticCurveTo(fx + sway * 0.4, fy + r * 2, fx, fy + r * 3.4);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(fx + sway, fy, r, 0, Math.PI * 2);
      ctx.fill();
      if (i % 6 === 0) {
        ctx.fillStyle = "rgba(255,180,220,0.22)";
        ctx.beginPath(); ctx.arc(fx + sway, fy, r * 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // — pond holding the sky's light (reflection, shimmer, ripple rings)
    const px = w * 0.22, py = h * 0.86, prx = w * 0.15, pry = h * 0.05;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2); ctx.clip();
    const pw = ctx.createLinearGradient(0, py - pry, 0, py + pry);
    pw.addColorStop(0, P.pond[0]);
    pw.addColorStop(1, P.pond[1]);
    ctx.fillStyle = pw;
    ctx.fillRect(px - prx, py - pry, prx * 2, pry * 2);
    const rf = ctx.createLinearGradient(0, py - pry, 0, py + pry);
    rf.addColorStop(0, rgba(P.refl, P.reflA));
    rf.addColorStop(0.6, rgba(P.refl, P.reflA * 0.24));
    rf.addColorStop(1, rgba(P.refl, 0));
    ctx.fillStyle = rf;
    ctx.fillRect(px - prx, py - pry, prx * 2, pry * 2);
    ctx.strokeStyle = rgba("#ffdcf0", P.shimmer);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const ly = py - pry * 0.6 + i * pry * 0.35;
      const off = Math.sin(t / 900 + i * 2) * prx * 0.12;
      ctx.beginPath();
      ctx.moveTo(px - prx * 0.55 + off, ly);
      ctx.lineTo(px + prx * (0.1 + (i % 3) * 0.2) + off, ly);
      ctx.stroke();
    }
    const rp = (t / 2600) % 1;
    ctx.strokeStyle = rgba("#ffc8e6", P.shimmer * (1 - rp));
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(px + prx * 0.2, py + pry * 0.15, prx * 0.25 * rp + 2, pry * 0.5 * rp + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    const rp2 = (t / 2600 + 0.5) % 1;
    ctx.strokeStyle = rgba("#ffc8e6", P.shimmer * 0.85 * (1 - rp2));
    ctx.beginPath();
    ctx.ellipse(px - prx * 0.25, py - pry * 0.1, prx * 0.2 * rp2 + 2, pry * 0.42 * rp2 + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = rgba(P.refl, 0.18 * (P.reflA / 0.5));
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2); ctx.stroke();

    // — dream motes drifting upward
    for (let i = 0; i < 14; i++) {
      const mx = ((i * 173.3 + t * 0.008) % (w + 40)) - 20;
      const my = h * 0.35 + ((i * 97.7 + t * 0.014) % (h * 0.55));
      ctx.fillStyle = i % 3 === 0 ? rgba("#ffb4dc", 0.5 * P.motes) : rgba("#ffffff", 0.42 * P.motes);
      ctx.beginPath(); ctx.arc(mx, my, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }, { reduced });

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 overflow-hidden">
        {/* the tethered island — a house hanging from the heavens by a thread */}
        <div className="dc-sway absolute" style={{ left: "8%", top: "12%", width: "min(150px, 19vw)" }}>
          <div
            className="absolute bottom-full left-1/2 h-[14vh] w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(to top, ${rgbaMix("#ffebfa", "#6e5f8c", day, 0.42)}, ${rgbaMix("#ffebfa", "#6e5f8c", day, 0.05)})`,
            }}
          />
          <svg viewBox="0 0 150 112" className="h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="dc-earth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={mix("#4a3a58", "#8a7596", day)} />
                <stop offset="1" stopColor={mix("#241d3d", "#544868", day)} />
              </linearGradient>
              <linearGradient id="dc-grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={mix("#4d8266", "#78b284", day)} />
                <stop offset="1" stopColor={mix("#33604e", "#5a966c", day)} />
              </linearGradient>
              <linearGradient id="dc-roof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={mix("#ffb8dc", "#ffc6e4", day)} />
                <stop offset="1" stopColor={mix("#ff8ac4", "#ff9ed0", day)} />
              </linearGradient>
            </defs>
            <polygon points="12,46 138,46 128,74 112,88 92,104 78,92 60,108 46,86 30,74" fill="url(#dc-earth)" />
            <path d="M60 86 L58 98 M92 100 L94 108 M110 84 L114 94" stroke={mix("#1a1430", "#3a3450", day)} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M6 44 Q40 34 75 38 Q112 42 144 46 Q112 54 75 54 Q38 54 6 44 Z" fill="url(#dc-grass)" />
            <path d="M6 44 Q40 34 75 38 Q112 42 144 46" stroke={mix("#ffb0d6", "#ffe6b8", day)} strokeWidth="1.4" fill="none" opacity={0.7 - day * 0.2} />
            <rect x="86" y="9" width="5" height="9" fill={mix("#e8c8d8", "#f4e2ea", day)} />
            <rect x="58" y="20" width="34" height="20" fill={mix("#f6ecf4", "#fdf8f6", day)} />
            <polygon points="54,20 75,6 96,20" fill="url(#dc-roof)" />
            <rect
              x="64" y="26" width="8" height="8" fill={mix("#ffd898", "#fff2d0", day)}
              style={{ filter: `drop-shadow(0 0 ${Math.max(0.5, 5 * glowK)}px rgba(255,207,128,${0.25 + 0.65 * glowK}))` }}
            />
            <rect x="80" y="26" width="7" height="14" fill={mix("#c8a8e0", "#d8c0ec", day)} />
            <circle cx="30" cy="42" r="2" fill="#ff9ed2" />
            <circle cx="44" cy="45" r="1.6" fill="#fff2fa" />
            <circle cx="112" cy="46" r="1.8" fill="#c8a8ee" />
            <circle cx="126" cy="47" r="1.5" fill="#ff9ed2" />
          </svg>
        </div>

        {/* the Bar of Dreams — roadside kiosk: neon at night, pastel diner by day */}
        <div className="absolute" style={{ right: "6%", bottom: "12%", width: "min(190px, 24vw)" }}>
          <svg viewBox="0 0 190 158" className="h-auto w-full" aria-hidden>
            <ellipse cx="95" cy="146" rx="82" ry="9" fill={rgbaMix("#ffc896", "#ffe8c8", day, 0.18 - day * 0.13)} />
            {/* poles */}
            <rect x="30" y="60" width="3" height="10" fill={mix("#3a3260", "#6a6290", day)} />
            <rect x="157" y="60" width="3" height="10" fill={mix("#3a3260", "#6a6290", day)} />
            {/* body + warm window */}
            <rect x="30" y="68" width="130" height="74" rx="4" fill={mix("#241f42", "#565078", day)} stroke={mix("#3a3260", "#767098", day)} strokeWidth="1.5" />
            <rect
              x="44" y="80" width="102" height="46" rx="3" fill={mix("#ffd898", "#fff4e4", day)}
              style={{ filter: `drop-shadow(0 0 ${Math.max(1, 10 * glowK)}px rgba(255,190,120,${0.08 + 0.5 * glowK}))` }}
            />
            <rect x="44" y="92" width="102" height="2" fill={mix("#b07850", "#c89070", day)} opacity="0.7" />
            <rect x="44" y="106" width="102" height="2" fill={mix("#b07850", "#c89070", day)} opacity="0.7" />
            {/* bottles on the shelves */}
            {[[50, 86, "#ff9ed2"], [58, 87, "#9ee8e0"], [66, 86, "#c8a8ee"], [80, 87, "#fff2fa"], [96, 86, "#ffd8a8"], [112, 87, "#9ee8e0"], [126, 86, "#ff9ed2"],
              [52, 100, "#9ee8e0"], [64, 101, "#ffd8a8"], [84, 100, "#ff9ed2"], [100, 101, "#c8a8ee"], [118, 100, "#fff2fa"]].map(([bx, by, bc], i) => (
              <rect key={i} x={bx as number} y={by as number} width="5" height={i % 3 === 0 ? 6 : 5} rx="1" fill={bc as string} opacity="0.9" />
            ))}
            {/* counter */}
            <rect x="40" y="126" width="110" height="9" rx="2" fill={mix("#4a4272", "#8a82ac", day)} />
            {/* striped canopy (pink / cream / cyan, like the gas station) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={`st${i}`} x={22 + i * 18.25} y="46" width="18.25" height="20" fill={["#ff9ed2", "#fff2fa", "#9ee8e0", "#fff2fa"][i % 4]} />
            ))}
            <rect x="22" y="46" width="146" height="20" fill="none" stroke={mix("#241f42", "#565078", day)} strokeWidth="1.5" />
            <rect x="22" y="63" width="146" height="4" fill={rgbaMix("#14102c", "#3a3654", day, 0.35 - day * 0.2)} />
            {/* neon sign — glowing at night, pastel script by day */}
            <text
              x="95" y="36" textAnchor="middle" fontSize="21"
              fill={mix("#ffd8f0", "#ff9ed2", day)}
              className="dc-glow"
              style={{ fontFamily: "var(--font-caveat), cursive", filter: `drop-shadow(0 0 ${Math.max(0.5, 5 * glowK)}px #ff9ed2) drop-shadow(0 0 ${Math.max(1, 13 * glowK)}px rgba(255,158,210,${0.55 * glowK}))` }}
            >
              Bar of Dreams
            </text>
            {/* sign sparkle */}
            <path d="M158 26 l1.2 3.4 3.4 1.2 -3.4 1.2 -1.2 3.4 -1.2 -3.4 -3.4 -1.2 3.4 -1.2 Z" fill="#fff2fa" className="dc-glow" style={{ animationDelay: "-1.7s" }} />
            {/* stools */}
            {[[58], [90], [122]].map(([sx], i) => (
              <g key={`s${i}`}>
                <rect x={sx as number} y="140" width="15" height="4.5" rx="2" fill={mix("#16122e", "#3a3654", day)} />
                <path d={`M${(sx as number) + 3} 144 L${(sx as number) + 1} 152 M${(sx as number) + 12} 144 L${(sx as number) + 14} 152`} stroke={mix("#16122e", "#3a3654", day)} strokeWidth="1.6" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      {/* top scrim — keeps the hero title readable against a bright day sky */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(10,12,30,${P.scrim}), transparent 34%)` }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 62%, rgba(8,10,28,${P.bottom}))` }} />
    </>
  );
}

// ————— Sky console: slider, presets and the automatic day cycle —————
const PRESETS: [string, number][] = [
  ["Midnight", 0.5],
  ["Dawn", 6.4],
  ["Noon", 13],
  ["Dusk", 21.2],
];

function SkyConsole({
  tod, setTod, playing, setPlaying,
}: {
  tod: number;
  setTod: (v: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
}) {
  const totalMin = Math.round((((tod % 24) + 24) % 24) * 60) % (24 * 60);
  const label = `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  return (
    <div className="w-panel mx-auto mt-8 w-full max-w-xl px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Sunrise className="h-5 w-5 shrink-0 w-accent2" aria-hidden />
        <label className="text-[12px] font-semibold uppercase tracking-widest opacity-70" htmlFor="sky-slider">
          Sky over the meadow — <span className="w-accent">{label}</span>
        </label>
        <button onClick={() => setPlaying(!playing)} className="w-btn w-btn-primary ml-auto !px-4 !py-1.5 !text-[12px]" aria-pressed={playing}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause the sky" : "Turn the sky"}
        </button>
      </div>
      <input
        id="sky-slider"
        type="range"
        min={0}
        max={24}
        step={0.1}
        value={tod}
        onChange={(e) => setTod(parseFloat(e.target.value))}
        className="mt-3 w-full accent-[var(--w-accent)]"
        aria-valuetext={label}
      />
      <div className="mt-2.5 flex flex-wrap gap-2">
        {PRESETS.map(([name, v]) => (
          <button
            key={name}
            onClick={() => setTod(v)}
            aria-label={`Set the sky to ${name}`}
            className={`w-tag !text-[11px] transition-colors ${Math.abs(tod - v) < 0.35 ? "!border-[var(--w-accent)] !text-[var(--w-accent)]" : ""}`}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed opacity-60">
        {playing
          ? "The meadow is turning — a full day passes in 48 seconds, from starlight back to starlight."
          : "Drag the sky through dawn, noon and golden hour — or let the whole day turn by itself."}
      </p>
    </div>
  );
}

export function DreamcorePage() {
  const world = WORLD_MAP.dreamcore;
  const [tod, setTod] = useState(21.2);
  const [playing, setPlaying] = useState(false);

  // automatic day cycle — a full 24h in 48 seconds, wrapping at midnight
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      setTod((v) => (v + dt * (24 / 48000)) % 24);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const env = useMemo(() => <DreamEnv tod={tod} />, [tod]);
  const features = useMemo(
    () => (
      <>
        <DreamJournal />
        <Postcards />
        <MemoryFragments />
        <CloudAtlas />
        <SleepyRadio />
      </>
    ),
    [],
  );
  const heroExtra = <SkyConsole tod={tod} setTod={setTod} playing={playing} setPlaying={setPlaying} />;

  return <WorldPage world={world} environment={env} features={features} heroExtra={heroExtra} />;
}
