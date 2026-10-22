"use client";

import { useMemo } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { DreamJournal, Postcards, MemoryFragments, CloudAtlas, SleepyRadio } from "@/components/features/dreamcore-features";

// ————— Living environment: the meadow at the edge of the map, past midnight —————
// Distilled from the anotherworldcore reference reel: a starry twilight sky with
// one bright evening star, a great cumulus lit pink-gold from the horizon, a faint
// rainbow, dusk-green hills folding into a wildflower meadow, a pond still holding
// the sky's light, a house tethered to the heavens on its floating island, and a
// neon roadside kiosk — the Bar of Dreams — glowing for no one in particular.

function DreamEnv() {
  const reduced = useApp((s) => s.fxReduced);
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const horizon = h * 0.68;

    // — sky: deep indigo through periwinkle into a pink horizon glow
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#0d1233");
    sky.addColorStop(0.45, "#26306b");
    sky.addColorStop(0.78, "#55508f");
    sky.addColorStop(1, "#b878b8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    // horizon glow — the light the clouds feed on
    const glow = ctx.createRadialGradient(w * 0.42, horizon, 10, w * 0.42, horizon, w * 0.55);
    glow.addColorStop(0, "rgba(255,190,215,0.5)");
    glow.addColorStop(1, "rgba(255,190,215,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, horizon);

    // — starfield (upper sky)
    for (let i = 0; i < 92; i++) {
      const sx = (((i * 197.3) % 100) / 100) * w;
      const sy = (((i * 131.7) % 100) / 100) * horizon * 0.82;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t / 1100 + i * 1.71));
      ctx.fillStyle =
        i % 9 === 0
          ? `rgba(255,190,220,${0.75 * tw})`
          : i % 7 === 0
            ? `rgba(150,210,255,${0.75 * tw})`
            : `rgba(240,240,255,${0.8 * tw})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.7 + (i % 4) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // the evening star — bright planet with halo + cross glint
    const ex = w * 0.64, ey = h * 0.13;
    const halo = ctx.createRadialGradient(ex, ey, 1, ex, ey, h * 0.075);
    halo.addColorStop(0, "rgba(235,240,255,0.9)");
    halo.addColorStop(0.25, "rgba(200,215,255,0.28)");
    halo.addColorStop(1, "rgba(200,215,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(ex - h * 0.08, ey - h * 0.08, h * 0.16, h * 0.16);
    ctx.strokeStyle = "rgba(240,245,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ex - 7, ey); ctx.lineTo(ex + 7, ey);
    ctx.moveTo(ex, ey - 7); ctx.lineTo(ex, ey + 7);
    ctx.stroke();
    ctx.fillStyle = "#f4f6ff";
    ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();

    // — the great cumulus, lit pink-gold from the horizon
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
    // dark violet-blue under-shadow
    blob(0, 0.2, 1.12, "#3a3270", 0.6);
    // body
    blob(0, 0, 1.0, "#6b5492", 0.95);
    blob(0.85, 0.1, 0.7, "#6b5492", 0.9);
    blob(-0.9, 0.12, 0.65, "#6b5492", 0.9);
    blob(0.3, -0.28, 0.62, "#7a5f9e", 0.9);
    blob(-0.35, -0.16, 0.55, "#7a5f9e", 0.9);
    blob(1.35, 0.22, 0.45, "#614c86", 0.85);
    blob(-1.3, 0.24, 0.42, "#614c86", 0.85);
    // lit lower half (pink)
    blob(0, 0.16, 0.75, "#f0a8c8", 0.85);
    blob(0.6, 0.2, 0.5, "#e898c0", 0.8);
    blob(-0.55, 0.22, 0.48, "#f0a8c8", 0.8);
    blob(1.0, 0.26, 0.34, "#e090b8", 0.75);
    // golden core — light from the horizon
    const core = ctx.createRadialGradient(cx, cy + s * 0.22, s * 0.05, cx, cy + s * 0.22, s * 0.95);
    core.addColorStop(0, "rgba(255,205,150,0.7)");
    core.addColorStop(1, "rgba(255,205,150,0)");
    ctx.fillStyle = core;
    ctx.fillRect(cx - s * 1.4, cy - s * 0.2, s * 2.8, s * 1.4);
    // top highlights
    blob(0.15, -0.3, 0.4, "#f4d0e8", 0.8);
    blob(-0.25, -0.22, 0.34, "#eec4e4", 0.7);

    // two distant drifting clouds
    for (let i = 0; i < 2; i++) {
      const dx = w * (i === 0 ? 0.76 : 0.13) + Math.sin(t / 11000 + i * 2.4) * w * 0.02;
      const dy = horizon - h * (i === 0 ? 0.3 : 0.37);
      const ds = Math.min(w, h) * (i === 0 ? 0.09 : 0.07);
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = "#6a5590";
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
      ctx.strokeStyle = c + "0.13)";
      ctx.beginPath();
      ctx.arc(rbCx, rbCy, rbR - i * 4.5, Math.PI * 1.02, Math.PI * 1.58);
      ctx.stroke();
    });

    // — hills (dusk green, pink rim light on the crests)
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
    ctx.fillStyle = "#47745e";
    ctx.fill();
    hillPath(horizon + 2, h * 0.055);
    ctx.strokeStyle = "rgba(255,175,210,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
    // near
    hillPath(horizon + h * 0.06, h * 0.075);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = "#33604e";
    ctx.fill();
    hillPath(horizon + h * 0.06, h * 0.075);
    ctx.strokeStyle = "rgba(255,175,210,0.28)"; ctx.lineWidth = 1.2; ctx.stroke();

    // — meadow
    const meadow = ctx.createLinearGradient(0, horizon + h * 0.06, 0, h);
    meadow.addColorStop(0, "#2c5244");
    meadow.addColorStop(1, "#152e28");
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

    // — pond holding the sky's light (cloud reflection, shimmer, ripple rings)
    const px = w * 0.22, py = h * 0.86, prx = w * 0.15, pry = h * 0.05;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2); ctx.clip();
    const pw = ctx.createLinearGradient(0, py - pry, 0, py + pry);
    pw.addColorStop(0, "#26305c");
    pw.addColorStop(1, "#101736");
    ctx.fillStyle = pw;
    ctx.fillRect(px - prx, py - pry, prx * 2, pry * 2);
    const rf = ctx.createLinearGradient(0, py - pry, 0, py + pry);
    rf.addColorStop(0, "rgba(255,158,210,0.5)");
    rf.addColorStop(0.6, "rgba(255,158,210,0.12)");
    rf.addColorStop(1, "rgba(255,158,210,0)");
    ctx.fillStyle = rf;
    ctx.fillRect(px - prx, py - pry, prx * 2, pry * 2);
    ctx.strokeStyle = "rgba(255,220,240,0.35)";
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
    ctx.strokeStyle = `rgba(255,200,230,${0.35 * (1 - rp)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(px + prx * 0.2, py + pry * 0.15, prx * 0.25 * rp + 2, pry * 0.5 * rp + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    const rp2 = (t / 2600 + 0.5) % 1;
    ctx.strokeStyle = `rgba(255,200,230,${0.3 * (1 - rp2)})`;
    ctx.beginPath();
    ctx.ellipse(px - prx * 0.25, py - pry * 0.1, prx * 0.2 * rp2 + 2, pry * 0.42 * rp2 + 1, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "rgba(255,190,220,0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2); ctx.stroke();

    // — dream motes drifting upward
    for (let i = 0; i < 14; i++) {
      const mx = ((i * 173.3 + t * 0.008) % (w + 40)) - 20;
      const my = h * 0.35 + ((i * 97.7 + t * 0.014) % (h * 0.55));
      ctx.fillStyle = i % 3 === 0 ? "rgba(255,180,220,0.5)" : "rgba(255,255,255,0.42)";
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
            style={{ background: "linear-gradient(to top, rgba(255,235,250,0.45), rgba(255,235,250,0.05))" }}
          />
          <svg viewBox="0 0 150 112" className="h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="dc-earth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4a3a58" />
                <stop offset="1" stopColor="#241d3d" />
              </linearGradient>
              <linearGradient id="dc-grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4d8266" />
                <stop offset="1" stopColor="#33604e" />
              </linearGradient>
              <linearGradient id="dc-roof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffb8dc" />
                <stop offset="1" stopColor="#ff8ac4" />
              </linearGradient>
            </defs>
            <polygon points="12,46 138,46 128,74 112,88 92,104 78,92 60,108 46,86 30,74" fill="url(#dc-earth)" />
            <path d="M60 86 L58 98 M92 100 L94 108 M110 84 L114 94" stroke="#1a1430" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M6 44 Q40 34 75 38 Q112 42 144 46 Q112 54 75 54 Q38 54 6 44 Z" fill="url(#dc-grass)" />
            <path d="M6 44 Q40 34 75 38 Q112 42 144 46" stroke="#ffb0d6" strokeWidth="1.4" fill="none" opacity="0.7" />
            <rect x="86" y="9" width="5" height="9" fill="#e8c8d8" />
            <rect x="58" y="20" width="34" height="20" fill="#f6ecf4" />
            <polygon points="54,20 75,6 96,20" fill="url(#dc-roof)" />
            <rect x="64" y="26" width="8" height="8" fill="#ffd898" style={{ filter: "drop-shadow(0 0 5px #ffcf80)" }} />
            <rect x="80" y="26" width="7" height="14" fill="#c8a8e0" />
            <circle cx="30" cy="42" r="2" fill="#ff9ed2" />
            <circle cx="44" cy="45" r="1.6" fill="#fff2fa" />
            <circle cx="112" cy="46" r="1.8" fill="#c8a8ee" />
            <circle cx="126" cy="47" r="1.5" fill="#ff9ed2" />
          </svg>
        </div>

        {/* the Bar of Dreams — neon roadside kiosk glowing at the meadow's edge */}
        <div className="absolute" style={{ right: "6%", bottom: "12%", width: "min(190px, 24vw)" }}>
          <svg viewBox="0 0 190 158" className="h-auto w-full" aria-hidden>
            <ellipse cx="95" cy="146" rx="82" ry="9" fill="rgba(255,200,150,0.18)" />
            {/* poles */}
            <rect x="30" y="60" width="3" height="10" fill="#3a3260" />
            <rect x="157" y="60" width="3" height="10" fill="#3a3260" />
            {/* body + warm window */}
            <rect x="30" y="68" width="130" height="74" rx="4" fill="#241f42" stroke="#3a3260" strokeWidth="1.5" />
            <rect x="44" y="80" width="102" height="46" rx="3" fill="#ffd898" style={{ filter: "drop-shadow(0 0 10px rgba(255,190,120,0.55))" }} />
            <rect x="44" y="92" width="102" height="2" fill="#b07850" opacity="0.7" />
            <rect x="44" y="106" width="102" height="2" fill="#b07850" opacity="0.7" />
            {/* bottles on the shelves */}
            {[[50, 86, "#ff9ed2"], [58, 87, "#9ee8e0"], [66, 86, "#c8a8ee"], [80, 87, "#fff2fa"], [96, 86, "#ffd8a8"], [112, 87, "#9ee8e0"], [126, 86, "#ff9ed2"],
              [52, 100, "#9ee8e0"], [64, 101, "#ffd8a8"], [84, 100, "#ff9ed2"], [100, 101, "#c8a8ee"], [118, 100, "#fff2fa"]].map(([bx, by, bc], i) => (
              <rect key={i} x={bx as number} y={by as number} width="5" height={i % 3 === 0 ? 6 : 5} rx="1" fill={bc as string} opacity="0.9" />
            ))}
            {/* counter */}
            <rect x="40" y="126" width="110" height="9" rx="2" fill="#4a4272" />
            {/* striped canopy (pink / cream / cyan, like the gas station) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={`st${i}`} x={22 + i * 18.25} y="46" width="18.25" height="20" fill={["#ff9ed2", "#fff2fa", "#9ee8e0", "#fff2fa"][i % 4]} />
            ))}
            <rect x="22" y="46" width="146" height="20" fill="none" stroke="#241f42" strokeWidth="1.5" />
            <rect x="22" y="63" width="146" height="4" fill="rgba(20,16,44,0.35)" />
            {/* neon sign */}
            <text
              x="95" y="36" textAnchor="middle" fontSize="21"
              fill="#ffd8f0"
              className="dc-glow"
              style={{ fontFamily: "var(--font-caveat), cursive", filter: "drop-shadow(0 0 5px #ff9ed2) drop-shadow(0 0 13px rgba(255,158,210,0.55))" }}
            >
              Bar of Dreams
            </text>
            {/* sign sparkle */}
            <path d="M158 26 l1.2 3.4 3.4 1.2 -3.4 1.2 -1.2 3.4 -1.2 -3.4 -3.4 -1.2 3.4 -1.2 Z" fill="#fff2fa" className="dc-glow" style={{ animationDelay: "-1.7s" }} />
            {/* stools */}
            {[[58], [90], [122]].map(([sx], i) => (
              <g key={`s${i}`}>
                <rect x={sx as number} y="140" width="15" height="4.5" rx="2" fill="#16122e" />
                <path d={`M${(sx as number) + 3} 144 L${(sx as number) + 1} 152 M${(sx as number) + 12} 144 L${(sx as number) + 14} 152`} stroke="#16122e" strokeWidth="1.6" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 62%, rgba(8,10,28,0.55))" }} />
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
