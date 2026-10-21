"use client";

import { useMemo, useRef, useState } from "react";
import { WORLD_MAP, type WorldId } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { Play, MapPin, Sunrise } from "lucide-react";

// ————— Living environment: layered neon horizon —————
function RetrowaveEnv({ hour }: { hour: number }) {
  const speedRef = useRef(1);
  const reduced = useApp((s) => s.fxReduced);

  const ref = useCanvasLoop((ctx, w, h, t, dt) => {
    // time-of-day palette: 0-24h maps through dusk cycle
    const h01 = hour / 24;
    const dusk = Math.max(0, 1 - Math.abs(h01 - 0.82) * 6); // ~19:45 peak dusk
    const night = Math.max(0, 1 - Math.abs(h01 - 0.98) * 5);
    const day = Math.max(0, 1 - Math.abs(h01 - 0.45) * 3);

    const mix = (a: number, b: number, ta: number) => a * ta + b * (1 - ta);
    const top = `rgb(${mix(26, 10, day)},${mix(8, 6, day)},${mix(46, 24, day)})`;
    const mid = `rgb(${Math.round(mix(84, 40, day))},${Math.round(mix(18, 20, day))},${Math.round(mix(63, 52, day))})`;
    const hor = `rgb(${Math.round(mix(255, 120, day))},${Math.round(mix(138, 90, day))},${Math.round(mix(92, 160, day))})`;

    const horizonY = h * 0.64;

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, top);
    sky.addColorStop(1, mid);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizonY);

    // stars when night
    if (night > 0.1) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 * night})`;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 61.8) % (horizonY * 0.6);
        const tw = 0.5 + 0.5 * Math.sin(t / 600 + i);
        ctx.globalAlpha = night * tw;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    }

    // sun
    const sunR = Math.min(w, h) * 0.15;
    const sy = horizonY - sunR * (0.35 + dusk * 0.55);
    const sg = ctx.createLinearGradient(0, sy - sunR, 0, sy + sunR);
    sg.addColorStop(0, "#ffe6a0");
    sg.addColorStop(0.55, "#ff8a5c");
    sg.addColorStop(1, "#ff2e88");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(w * 0.5, sy, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = top;
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.85;
      ctx.fillRect(w * 0.5 - sunR, sy - sunR * 0.3 + i * sunR * 0.28, sunR * 2, 3 + i * 2.4);
    }
    ctx.globalAlpha = 1;

    // distant city silhouette
    ctx.fillStyle = "rgba(12,4,26,0.9)";
    for (let b = 0; b < 22; b++) {
      const bw = w / 26;
      const bh = 16 + ((b * 53) % 70);
      ctx.fillRect(b * bw + (b % 3) * 6, horizonY - bh, bw, bh);
    }
    // city lights
    ctx.fillStyle = rgba("#ffb347", 0.75);
    for (let l = 0; l < 30; l++) {
      if (l % 3 === 0) continue;
      ctx.fillRect(((l * 47) % w), horizonY - 8 - ((l * 13) % 50), 2, 2);
    }

    // ground
    ctx.fillStyle = "#0b0518";
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // perspective grid scrolling
    speedRef.current = Math.min(6, speedRef.current + dt * 0.0004);
    const speed = speedRef.current;
    ctx.strokeStyle = rgba("#ff2e88", 0.8);
    ctx.lineWidth = 1.3;
    for (let k = -12; k <= 12; k++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + k * (w / 30), horizonY);
      ctx.lineTo(w / 2 + k * (w / 2.6), h);
      ctx.stroke();
    }
    const scroll = (t * 0.00022 * speed) % 1;
    for (let r = 0; r < 9; r++) {
      const p = ((r / 9 + scroll) % 1) ** 2.4;
      const yy = horizonY + p * (h - horizonY);
      ctx.globalAlpha = 0.15 + p;
      ctx.strokeStyle = rgba("#23e6ff", 0.8);
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(w, yy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // road glow center
    const rg = ctx.createLinearGradient(0, horizonY, 0, h);
    rg.addColorStop(0, rgba("#ff2e88", 0.25));
    rg.addColorStop(0.25, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // haze
    const haze = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 30);
    haze.addColorStop(0, rgba("#ff8a5c", 0));
    haze.addColorStop(0.5, rgba("#ff8a5c", 0.3));
    haze.addColorStop(1, rgba("#ff8a5c", 0));
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - 50, w, 80);

    // vignette + grain handled by CSS overlays
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, { reduced });

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="film-grain absolute inset-0" />
      <div className="crt-vignette absolute inset-0" />
    </>
  );
}

// ————— Unique interactions —————
function SunsetSlider({ hour, setHour }: { hour: number; setHour: (h: number) => void }) {
  const label = `${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;
  return (
    <div className="w-panel flex items-center gap-4 px-5 py-4">
      <Sunrise className="h-5 w-5 shrink-0 w-accent2" aria-hidden />
      <div className="flex-1">
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-widest opacity-70" htmlFor="sunset-slider">
          Time over the highway — {label}
        </label>
        <input
          id="sunset-slider"
          type="range"
          min={0}
          max={24}
          step={0.25}
          value={hour}
          onChange={(e) => setHour(parseFloat(e.target.value))}
          className="w-full accent-[var(--w-accent)]"
          aria-valuetext={label}
        />
      </div>
    </div>
  );
}

function CruiseButton() {
  const navigate = useApp((s) => s.navigate);
  const [cruising, setCruising] = useState(false);
  const destinations: WorldId[] = ["synthwave", "vaporwave", "y2k", "dreamcore", "cyberpunk", "liminal", "backrooms"];

  const cruise = () => {
    setCruising(true);
    setTimeout(() => {
      const dest = destinations[Math.floor(Math.random() * destinations.length)];
      navigate({ view: "world", world: dest });
    }, 1400);
  };

  return (
    <button onClick={cruise} className="w-btn-primary w-btn !px-5" disabled={cruising}>
      {cruising ? <Play className="h-4 w-4 animate-pulse" /> : <MapPin className="h-4 w-4" />}
      {cruising ? "Cruising into the unknown…" : "Cruise to a random world"}
    </button>
  );
}

export function RetrowavePage() {
  const world = WORLD_MAP.retrowave;
  const [hour, setHour] = useState(19.75);
  const env = useMemo(() => <RetrowaveEnv hour={hour} />, [hour]);

  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-2">
      <SunsetSlider hour={hour} setHour={setHour} />
      <div className="w-panel flex flex-col justify-center gap-2.5 px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-widest opacity-70">Night driver's log</p>
        <p className="text-[14px] leading-relaxed opacity-80">
          The highway runs on a 24-hour sky. Pull the slider toward dusk for the classic
          neon sunset, or push through midnight until the stars take over — then hit
          the cruise button and let the road choose your next world.
        </p>
        <div className="mt-1"><CruiseButton /></div>
      </div>
    </div>
  );

  return <WorldPage world={world} environment={env} features={features} />;
}
