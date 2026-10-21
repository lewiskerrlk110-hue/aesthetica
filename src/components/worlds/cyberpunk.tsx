"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { CloudRain, RadioTower } from "lucide-react";

// ————— Environment: rooftop over the neon wall —————
// A silhouette figure at the roof edge, railing lined with disc devices,
// a dense wall of sign-plastered towers, aerial traffic and holo weather.
interface Ship { x: number; y: number; v: number; s: number }
interface Burst { x: number; y: number; start: number; color: string }
interface Drop { x: number; y: number; v: number; len: number }

const BURST_COLORS = ["#ffd166", "#4de8ff", "#ff4fd8"];

function CyberEnv() {
  const reduced = useApp((s) => s.fxReduced);
  const shipsRef = useRef<Ship[] | null>(null);
  const dropsRef = useRef<Drop[] | null>(null);
  const burstsRef = useRef<Burst[]>([]);
  const nextBurstRef = useRef(1600);
  const pingRef = useRef(-1e9);
  const lastPingRef = useRef(-1e9);

  // city-wide signal pulse, fired by the "Ping the city" control
  useEffect(() => {
    const onPing = () => {
      pingRef.current = performance.now();
    };
    window.addEventListener("cyber-ping", onPing);
    return () => window.removeEventListener("cyber-ping", onPing);
  }, []);

  const ref = useCanvasLoop((ctx, w, h, t, dt) => {
    if (!shipsRef.current) {
      shipsRef.current = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random(),
        y: 0.10 + Math.random() * 0.36,
        v: (0.010 + Math.random() * 0.018) * (i % 2 ? 1 : -1),
        s: 0.55 + Math.random() * 0.7,
      }));
    }
    if (!dropsRef.current) {
      dropsRef.current = Array.from({ length: 70 }, () => ({
        x: Math.random(),
        y: Math.random(),
        v: 0.5 + Math.random() * 0.8,
        len: 7 + Math.random() * 12,
      }));
    }

    const nowAbs = performance.now();
    const pingAge = nowAbs - pingRef.current;
    const flare =
      pingAge >= 0 && pingAge < 1600 ? 1 + 1.2 * Math.exp(-pingAge / 420) : 1;

    // golden burst marks a fresh ping (detected here, not in the effect)
    if (pingRef.current !== lastPingRef.current) {
      lastPingRef.current = pingRef.current;
      burstsRef.current.push({ x: 0.5, y: 0.27, start: t, color: "#ffd166" });
    }

    // scheduled holographic weather
    if (t > nextBurstRef.current) {
      nextBurstRef.current = t + 2800 + Math.random() * 2600;
      burstsRef.current.push({
        x: 0.14 + Math.random() * 0.72,
        y: 0.10 + Math.random() * 0.34,
        start: t,
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
      });
    }
    burstsRef.current = burstsRef.current.filter((b) => t - b.start < 1700);

    // ——— sky: deep violet falling into magenta horizon glow
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#150c33");
    sky.addColorStop(0.45, "#2a1554");
    sky.addColorStop(0.78, "#4a1f66");
    sky.addColorStop(1, "#7c3080");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // sparse violet stars
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 173.3) % 100) / 100;
      const sy = (((i * 61.7) % 100) / 100) * 0.42;
      const tw = 0.5 + 0.5 * Math.sin(t / 700 + i * 2.1);
      ctx.fillStyle = `rgba(214,196,255,${(0.12 + 0.2 * tw).toFixed(3)})`;
      ctx.fillRect(sx * w, sy * h, 1.4, 1.4);
    }

    const roofY = h * 0.875; // where the city meets the foreground roof

    // ——— tower wall — 3 depth planes, sign-plastered
    const planes = [
      { n: 12, hMin: 0.34, hMax: 0.60, color: "#241649", win: 0.14, seed: 17 },
      { n: 9, hMin: 0.46, hMax: 0.74, color: "#190e3b", win: 0.22, seed: 53 },
      { n: 6, hMin: 0.58, hMax: 0.94, color: "#0d0824", win: 0.30, seed: 91 },
    ];
    planes.forEach((p, pi) => {
      for (let i = 0; i < p.n; i++) {
        const bw = w / p.n + 16;
        const bx = i * bw - (pi * 23) % bw * 0.4;
        const r = ((i * 97 + p.seed) % 100) / 100;
        const bh = h * (p.hMin + r * (p.hMax - p.hMin));
        const top = roofY - bh;
        ctx.fillStyle = p.color;
        ctx.fillRect(bx, top, bw, h - top);

        // window grids — cyan majority, pink + warm minority
        const cols = Math.max(2, Math.floor(bw / 22));
        const rows = Math.max(3, Math.floor(bh / 24));
        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            const s2 = (i * 31 + ry * 7 + cx * 13 + p.seed) % 23;
            if (s2 % 4 === 0) continue;
            const color =
              s2 % 7 === 0 ? "#ffd166" : s2 % 3 === 0 ? "#ff4fd8" : "#4de8ff";
            ctx.fillStyle = rgba(color, p.win);
            ctx.fillRect(bx + 4 + cx * (bw / cols), top + 12 + ry * 24, 3.5, 5);
          }
        }

        // vertical neon bars on mid + near planes
        if (pi >= 1) {
          const sn = pi === 1 ? 2 : 3;
          for (let s = 0; s < sn; s++) {
            const sr = ((i * 61 + s * 29 + p.seed) % 100) / 100;
            if (sr < 0.2) continue;
            const sx2 = bx + bw * (0.16 + 0.62 * (((s * 37 + i * 13) % 10) / 10));
            const sy2 = top + bh * (0.12 + 0.3 * sr);
            const sh2 = bh * (0.16 + 0.16 * (((s * 17) % 10) / 10));
            const color = sr > 0.7 ? "#ff4fd8" : sr > 0.45 ? "#4de8ff" : "#ff3b52";
            ctx.fillStyle = rgba(color, (0.45 + 0.12 * Math.sin(t / 260 + i + s)) * flare);
            ctx.shadowColor = color;
            ctx.shadowBlur = 12 * flare;
            ctx.fillRect(sx2, sy2, 6, sh2);
            ctx.shadowBlur = 0;
          }
        }

        // near plane: pink rooftop trim + red beacons
        if (pi === 2) {
          if ((i * 41 + p.seed) % 10 < 7) {
            ctx.fillStyle = rgba("#ff4fd8", (0.65 + 0.2 * Math.sin(t / 320 + i)) * flare);
            ctx.shadowColor = "#ff4fd8";
            ctx.shadowBlur = 14 * flare;
            ctx.fillRect(bx, top, bw, 2.4);
            ctx.shadowBlur = 0;
          }
          if ((i * 23) % 10 < 5) {
            const bk = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t / 640 + i * 2.4));
            ctx.fillStyle = rgba("#ff2a3c", bk);
            ctx.beginPath();
            ctx.arc(bx + bw / 2, top - 6, 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    // ——— holo weather: expanding light bursts between the planes
    for (const b of burstsRef.current) {
      const u = Math.min(1, (t - b.start) / 1600);
      const br = 6 + u * 46;
      const balpha = (1 - u) * 0.85;
      const bx0 = b.x * w;
      const by0 = b.y * h;
      ctx.strokeStyle = rgba(b.color, balpha * 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx0, by0, br, 0, Math.PI * 2);
      ctx.stroke();
      for (let pi2 = 0; pi2 < 8; pi2++) {
        const ang = (pi2 / 8) * Math.PI * 2 + b.start;
        const pd = br * 1.15;
        ctx.fillStyle = rgba(b.color, balpha * 0.7);
        ctx.beginPath();
        ctx.arc(bx0 + Math.cos(ang) * pd, by0 + Math.sin(ang) * pd, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(b.color, balpha * 0.5);
      ctx.beginPath();
      ctx.arc(bx0, by0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // low haze pooling between planes
    const mist = ctx.createLinearGradient(0, roofY - h * 0.42, 0, roofY);
    mist.addColorStop(0, "rgba(158, 84, 168, 0)");
    mist.addColorStop(0.75, "rgba(158, 84, 168, 0.13)");
    mist.addColorStop(1, "rgba(196, 96, 160, 0.20)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, roofY - h * 0.42, w, h * 0.42);

    // horizon glow bath — the neon wall bleeds pink light into the air
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const bath = ctx.createRadialGradient(w * 0.5, roofY, 10, w * 0.5, roofY, h * 0.62);
    bath.addColorStop(0, "rgba(214, 70, 168, 0.30)");
    bath.addColorStop(0.5, "rgba(150, 60, 170, 0.12)");
    bath.addColorStop(1, "rgba(150, 60, 170, 0)");
    ctx.fillStyle = bath;
    ctx.fillRect(0, roofY - h * 0.62, w, h * 0.62);
    ctx.restore();

    // ——— hero signage — reference boards
    const drawVBoard = (x: number, y: number, bw2: number, bh2: number, text: string, color: string) => {
      ctx.fillStyle = "rgba(10, 6, 26, 0.92)";
      ctx.fillRect(x - bw2 / 2 - 3, y - 3, bw2 + 6, bh2 + 6);
      ctx.strokeStyle = rgba(color, 0.5 * flare);
      ctx.lineWidth = 1;
      ctx.strokeRect(x - bw2 / 2 - 3, y - 3, bw2 + 6, bh2 + 6);
      ctx.save();
      ctx.translate(x, y + bh2 / 2);
      ctx.rotate(Math.PI / 2);
      ctx.font = `700 ${Math.round(bw2 * 0.58)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const flick = 0.86 + 0.14 * Math.sin(t / 130 + x);
      ctx.globalAlpha = Math.min(1, flick * flare);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14 * flare;
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    const drawHBoard = (x: number, y: number, bw2: number, bh2: number, text: string, color: string) => {
      ctx.fillStyle = "rgba(10, 6, 26, 0.92)";
      ctx.fillRect(x - bw2 / 2, y - bh2 / 2, bw2, bh2);
      ctx.strokeStyle = rgba(color, 0.4 * flare);
      ctx.lineWidth = 1;
      ctx.strokeRect(x - bw2 / 2, y - bh2 / 2, bw2, bh2);
      ctx.font = `700 ${Math.round(bh2 * 0.58)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const flick = 0.8 + 0.2 * Math.sin(t / 210 + x * 0.01);
      ctx.globalAlpha = Math.min(1, flick * flare);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 * flare;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    drawVBoard(w * 0.775, h * 0.24, 34, h * 0.24, "NR 70", "#ff5fd8");
    drawVBoard(w * 0.83, h * 0.36, 26, h * 0.13, "NO", "#ff7ae0");
    drawVBoard(w * 0.705, h * 0.30, 24, h * 0.20, "NINERIO", "#ff4fd8");
    drawHBoard(w * 0.545, h * 0.70, w * 0.11, h * 0.042, "VALLEY", "#ff3b52");
    drawHBoard(w * 0.63, h * 0.545, w * 0.05, h * 0.03, "707", "#ffd166");

    // cyan holo koi — three shimmering sine arcs drifting in the sky
    const koiX = w * 0.35;
    const koiY = h * 0.2 + Math.sin(t / 1400) * 6;
    ctx.save();
    ctx.strokeStyle = rgba("#4de8ff", (0.5 + 0.15 * Math.sin(t / 300)) * flare);
    ctx.shadowColor = "#4de8ff";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    for (let seg = 0; seg < 3; seg++) {
      ctx.beginPath();
      for (let px = 0; px <= 60; px++) {
        const u = px / 60;
        const wx = koiX + u * w * 0.16;
        const wy = koiY + Math.sin(u * 6.2 + t / 420 + seg * 1.1) * 9 * (1 - u * 0.4) + seg * 7;
        if (px === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.shadowBlur = 0;

    // billboard face screen — left tower, scan-lit portrait
    const bbX = w * 0.055;
    const bbY = h * 0.3;
    const bbW = w * 0.1;
    const bbH = h * 0.2;
    ctx.fillStyle = "rgba(8, 5, 22, 0.9)";
    ctx.fillRect(bbX, bbY, bbW, bbH);
    const faceCx = bbX + bbW / 2;
    const faceCy = bbY + bbH * 0.42;
    ctx.fillStyle = rgba("#8fe8ff", 0.16);
    ctx.beginPath();
    ctx.arc(faceCx, faceCy, bbW * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(faceCx, bbY + bbH * 0.86, bbW * 0.44, bbH * 0.28, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(5, 3, 16, 0.5)";
    for (let sy3 = bbY; sy3 < bbY + bbH; sy3 += 4) ctx.fillRect(bbX, sy3, bbW, 1.6);
    ctx.strokeStyle = rgba("#4de8ff", 0.45 * flare);
    ctx.strokeRect(bbX, bbY, bbW, bbH);

    // ——— aerial traffic: dark hulls, pink engine trails
    for (const ship of shipsRef.current) {
      ship.x += ship.v * (dt / 1000);
      if (ship.x > 1.15) ship.x = -0.15;
      if (ship.x < -0.15) ship.x = 1.15;
      const dir = Math.sign(ship.v);
      const sxp = ship.x * w;
      const syp = ship.y * h + Math.sin(t / 900 + ship.s * 9) * 4;
      const sc = 16 * ship.s;
      const trail = ctx.createLinearGradient(sxp - dir * sc * 2.6, syp, sxp, syp);
      trail.addColorStop(0, rgba("#ff4fd8", 0));
      trail.addColorStop(1, rgba("#ff4fd8", 0.5));
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sxp - dir * sc * 2.6, syp);
      ctx.lineTo(sxp, syp);
      ctx.stroke();
      ctx.fillStyle = "#0a0618";
      ctx.beginPath();
      ctx.ellipse(sxp, syp, sc * 0.9, sc * 0.22, dir > 0 ? -0.06 : 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba("#4de8ff", 0.8);
      ctx.fillRect(sxp + dir * sc * 0.7, syp - 1.5, 3, 3);
    }

    // ——— ping shockwave: double ring racing out from the signal tower
    if (pingAge >= 0 && pingAge < 1300) {
      const pr = pingAge / 1300;
      const ringR = pr * Math.max(w, h) * 0.9;
      const ringAlpha = (1 - pr) * 0.55;
      ctx.strokeStyle = rgba("#ff4fd8", ringAlpha);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.27, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = rgba("#4de8ff", ringAlpha * 0.7);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.27, ringR * 0.86, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ——— foreground rooftop
    ctx.fillStyle = "#050310";
    ctx.fillRect(0, roofY, w, h - roofY);
    // left raised slab with diagonal edge
    ctx.fillStyle = "#070512";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.lineTo(w * 0.24, h * 0.868);
    ctx.lineTo(w * 0.28, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    // antennas + dish silhouettes
    ctx.strokeStyle = "#070512";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.8);
    ctx.lineTo(w * 0.06, h * 0.7);
    ctx.moveTo(w * 0.1, h * 0.815);
    ctx.lineTo(w * 0.1, h * 0.735);
    ctx.stroke();
    ctx.fillStyle = "#070512";
    ctx.beginPath();
    ctx.arc(w * 0.145, h * 0.79, 9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineTo(w * 0.145, h * 0.79);
    ctx.closePath();
    ctx.fill();
    const tipK = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 700));
    ctx.fillStyle = rgba("#ff2a3c", tipK);
    ctx.beginPath();
    ctx.arc(w * 0.06, h * 0.7, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // hooded figure at the roof edge — hands in pockets, city rim light
    const figX = w * 0.165;
    const figH = h * 0.125;
    const bobY = reduced ? 0 : Math.sin(t / 1100) * 1.4;
    ctx.save();
    ctx.translate(figX, h * 0.845 + bobY);
    ctx.fillStyle = "#08061a";
    // legs
    ctx.fillRect(-figH * 0.13, -figH * 0.42, figH * 0.095, figH * 0.42);
    ctx.fillRect(figH * 0.028, -figH * 0.42, figH * 0.095, figH * 0.42);
    // torso, slight forward lean
    ctx.beginPath();
    ctx.moveTo(-figH * 0.16, -figH * 0.4);
    ctx.lineTo(-figH * 0.13, -figH * 0.78);
    ctx.quadraticCurveTo(0, -figH * 0.88, figH * 0.15, -figH * 0.8);
    ctx.lineTo(figH * 0.185, -figH * 0.4);
    ctx.closePath();
    ctx.fill();
    // hood + head
    ctx.beginPath();
    ctx.arc(figH * 0.035, -figH * 0.88, figH * 0.105, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-figH * 0.1, -figH * 0.82);
    ctx.quadraticCurveTo(figH * 0.02, -figH * 1.02, figH * 0.16, -figH * 0.86);
    ctx.quadraticCurveTo(figH * 0.06, -figH * 0.94, -figH * 0.1, -figH * 0.82);
    ctx.closePath();
    ctx.fill();
    // pink rim light from the neon wall
    ctx.strokeStyle = rgba("#ff4fd8", 0.4);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(figH * 0.035, -figH * 0.88, figH * 0.105, -0.9, 0.7);
    ctx.stroke();
    ctx.restore();

    // railing lined with disc devices — full width, right of the slab
    const railY = h * 0.885;
    ctx.fillStyle = "#0a0718";
    ctx.fillRect(w * 0.28, railY, w * 0.72, 2.6);
    ctx.fillRect(w * 0.28, railY + h * 0.038, w * 0.72, 1.8);
    const postGap = Math.max(38, w / 24);
    for (let px = w * 0.28; px <= w + 4; px += postGap) {
      ctx.fillRect(px, railY, 2.4, h * 0.045);
      ctx.beginPath();
      ctx.arc(px + postGap / 2, railY + 1.2, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0d0a1e";
      ctx.fill();
      ctx.strokeStyle = rgba("#4de8ff", 0.3 + 0.18 * Math.sin(t / 500 + px * 0.02));
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // ——— light rain
    ctx.strokeStyle = rgba("#9fb0e8", 0.3);
    ctx.lineWidth = 1;
    for (const d of dropsRef.current) {
      d.y += d.v * (dt / 900);
      if (d.y > 1) {
        d.y = -0.05;
        d.x = Math.random();
      }
      ctx.globalAlpha = 0.12 + d.v * 0.16;
      ctx.beginPath();
      ctx.moveTo(d.x * w, d.y * h);
      ctx.lineTo(d.x * w - 2, d.y * h + d.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(2,0,10,0.6)");
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
    literature: "#ff4fd8",
    film: "#ff3b52",
    anime: "#ffd166",
    architecture: "#4de8ff",
    games: "#b48aff",
  };
  return (
    <div className="w-scroll overflow-x-auto pb-3">
      <div className="relative flex min-w-[900px] gap-0 px-2 pt-8">
        <div className="absolute left-0 right-0 top-[26px] h-px" style={{ background: "linear-gradient(90deg, transparent, #ff4fd855 8%, #ff4fd855 92%, transparent)" }} />
        {TIMELINE.map((e, i) => (
          <button
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            className="group relative flex w-[150px] shrink-0 flex-col items-center px-1.5 text-center"
            aria-expanded={active === i}
          >
            <span
              className="absolute top-[20px] h-3 w-3 rounded-full border-2 transition-transform group-hover:scale-125"
              style={{ borderColor: KIND_COLOR[e.kind], background: "#150c33", boxShadow: `0 0 12px ${KIND_COLOR[e.kind]}` }}
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
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <CloudRain className="h-5 w-5 w-accent" />
          <div className="min-w-0 flex-1">
            <h2 className="w-display text-xl font-bold">The Visual Timeline</h2>
            <p className="text-[12.5px] text-[var(--w-fg-dim)]">How the movement moved — from page to screen to street. Documented milestones only.</p>
          </div>
          <button
            className="w-btn shrink-0"
            onClick={() => window.dispatchEvent(new CustomEvent("cyber-ping"))}
          >
            <RadioTower className="h-4 w-4 w-accent" />
            Ping the city
          </button>
        </header>
        <Timeline />
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
