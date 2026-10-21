"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Move, Maximize2 } from "lucide-react";

// ————— First-person maze explorer (canvas raycaster) —————
// Yellow rooms, fluorescent ceiling panels, damp carpet.
// 15x15 grid; 1 = wall, 0 = open. Spawn in a corner room.
const MAP = [
  "111111111111111",
  "100000001000001",
  "101111001011101",
  "101000001010001",
  "101011110010101",
  "100010000010101",
  "111010111110101",
  "100010000000101",
  "101111011111101",
  "100000010000001",
  "111011010111111",
  "100001010000001",
  "101101011101111",
  "100000000000001",
  "111111111111111",
];
const W = MAP.length;
const H = MAP[0].length;

const isWall = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return true;
  return MAP[yi][xi] === "1";
};

export function BackroomsExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entered, setEntered] = useState(false);
  const [fps, setFps] = useState(0);
  const keys = useRef<Record<string, boolean>>({});
  const state = useRef({
    px: 1.5,
    py: 13.5,
    dir: 0,
    fog: 0,
    flick: 1,
  });
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const reducedRef = useRef(false);

  // controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!entered) return;
      keys.current[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [entered]);

  const step = useCallback((dt: number, ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const s = state.current;
    const speed = 2.1 * (dt / 1000);
    const rot = 1.9 * (dt / 1000);
    const k = keys.current;
    let mx = 0;
    let my = 0;
    if (k["w"] || k["arrowup"]) { mx += Math.cos(s.dir); my += Math.sin(s.dir); }
    if (k["s"] || k["arrowdown"]) { mx -= Math.cos(s.dir); my -= Math.sin(s.dir); }
    if (k["a"] || k["arrowleft"]) s.dir -= rot;
    if (k["d"] || k["arrowright"]) s.dir += rot;
    if (k["q"]) { mx -= Math.sin(s.dir); my += Math.cos(s.dir); }
    if (k["e"]) { mx += Math.sin(s.dir); my -= Math.cos(s.dir); }
    const len = Math.hypot(mx, my) || 1;
    const nx = s.px + (mx / len) * speed * (mx || my ? 1 : 0);
    const ny = s.py + (my / len) * speed * (mx || my ? 1 : 0);
    if (!isWall(nx, s.py)) s.px = nx;
    if (!isWall(s.px, ny)) s.py = ny;

    // fluorescent flicker
    s.flick = Math.random() > 0.96 ? 0.55 + Math.random() * 0.3 : Math.min(1, s.flick + 0.04);

    // ceiling with tile grid
    const ceil = ctx.createLinearGradient(0, 0, 0, h / 2);
    ceil.addColorStop(0, "#a3924e");
    ceil.addColorStop(1, "#77692f");
    ctx.fillStyle = ceil;
    ctx.fillRect(0, 0, w, h / 2);
    // tile rows converge toward the horizon
    for (let i = 1; i <= 8; i++) {
      const yy = (h / 2) * (1 - Math.pow(0.82, i));
      ctx.lineWidth = Math.max(0.5, 2.2 * (1 - yy / (h / 2)) + 0.4);
      ctx.strokeStyle = "rgba(52,42,15,0.32)";
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(w, yy);
      ctx.stroke();
    }
    // converging joist lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(52,42,15,0.2)";
    for (let j = -4; j <= 4; j++) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + j * (w * 0.17), 0);
      ctx.stroke();
    }
    // louvered fluorescent panels
    ctx.save();
    ctx.globalAlpha = 0.85 * s.flick;
    for (let i = -3; i <= 3; i++) {
      const panX = w / 2 + i * (w * 0.24) - (s.dir % 1) * 40;
      ctx.fillStyle = `rgba(253,243,192,${0.08 * s.flick})`;
      ctx.fillRect(panX - 30, h * 0.02, w * 0.13 + 60, h * 0.16);
      ctx.fillStyle = "rgba(56,48,20,0.95)";
      ctx.fillRect(panX - w * 0.072, h * 0.052, w * 0.144, h * 0.062);
      ctx.fillStyle = `rgba(253,243,192,${0.82 * s.flick})`;
      for (let b = 0; b < 3; b++) {
        ctx.fillRect(panX - w * 0.062 + b * (w * 0.047), h * 0.06, w * 0.036, h * 0.046);
      }
    }
    ctx.restore();

    // floor — damp carpet, darker toward the horizon
    const fl = ctx.createLinearGradient(0, h / 2, 0, h);
    fl.addColorStop(0, "#241e0c");
    fl.addColorStop(0.35, "#453b18");
    fl.addColorStop(1, "#57491f");
    ctx.fillStyle = fl;
    ctx.fillRect(0, h / 2, w, h / 2);
    // pool of light under the nearest fixture
    const pool = ctx.createRadialGradient(w / 2, h * 0.78, 10, w / 2, h * 0.78, w * 0.28);
    pool.addColorStop(0, "rgba(253,246,210,0.1)");
    pool.addColorStop(1, "rgba(253,246,210,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(0, h / 2, w, h / 2);
    // carpet texture dots
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 90; i++) {
      const fx = ((i * 137.5 + performance.now() * 0.01) % w);
      const fy = h / 2 + ((i * 61.7) % (h / 2));
      ctx.fillRect(fx, fy, 2, 2);
    }

    // raycast walls
    const fov = Math.PI / 3;
    const numRays = Math.floor(w / 3);
    for (let r = 0; r < numRays; r++) {
      const angle = s.dir - fov / 2 + (r / numRays) * fov;
      const dist = castRay(s.px, s.py, angle);
      const corrected = dist * Math.cos(angle - s.dir);
      const wallH = Math.min(h, (h * 1.1) / Math.max(0.08, corrected));
      const shade = Math.max(0.12, 1 - corrected / 9);
      const x = (r / numRays) * w;
      // mustard walls with faint panel seams
      ctx.fillStyle = `rgb(${Math.round(184 * shade + 26)},${Math.round(166 * shade + 24)},${Math.round(82 * shade + 14)},1)`;
      ctx.fillRect(x, h / 2 - wallH / 2, w / numRays + 1, wallH);
      if (r % 9 < 2) {
        ctx.fillStyle = `rgba(96,84,32,${0.16 * shade})`;
        ctx.fillRect(x, h / 2 - wallH / 2, w / numRays + 1, wallH);
      }
      // darker baseboard
      ctx.fillStyle = `rgba(80,70,30,${0.5 * shade})`;
      ctx.fillRect(x, h / 2 + wallH / 2 - wallH * 0.06, w / numRays + 1, wallH * 0.06);
    }

    // fog vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, `rgba(16,12,4,${0.6 + s.fog * 0.2})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // occasional analog noise band
    if (Math.random() > 0.985) {
      ctx.fillStyle = "rgba(255,255,240,0.045)";
      ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 3);
    }
  }, []);

  const castRay = (px: number, py: number, angle: number): number => {
    // DDA
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    let mapX = Math.floor(px);
    let mapY = Math.floor(py);
    const deltaX = Math.abs(1 / (cos || 1e-9));
    const deltaY = Math.abs(1 / (sin || 1e-9));
    const stepX = cos < 0 ? -1 : 1;
    const stepY = sin < 0 ? -1 : 1;
    let sideX = (cos < 0 ? px - mapX : mapX + 1 - px) * deltaX;
    let sideY = (sin < 0 ? py - mapY : mapY + 1 - py) * deltaY;
    let dist = 0;
    for (let i = 0; i < 64; i++) {
      if (sideX < sideY) {
        sideX += deltaX;
        mapX += stepX;
        dist = sideX - deltaX;
      } else {
        sideY += deltaY;
        mapY += stepY;
        dist = sideY - deltaY;
      }
      if (mapX < 0 || mapY < 0 || mapX >= W || mapY >= H) return 64;
      if (MAP[mapY][mapX] === "1") break;
    }
    return Math.min(64, dist);
  };

  useEffect(() => {
    if (!entered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let frames = 0;
    let fpsTime = 0;
    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - (lastRef.current || now));
      lastRef.current = now;
      const rect = canvas.getBoundingClientRect();
      step(dt, ctx, rect.width, rect.height);
      frames++;
      if (now - fpsTime > 1000) {
        setFps(frames);
        frames = 0;
        fpsTime = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    if (!reducedRef.current) rafRef.current = requestAnimationFrame(loop);
    else step(0, ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [entered, step]);

  const holdBtn = (key: string, label: string) => (
    <button
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--w-panel-border)] bg-[var(--w-panel)] text-lg select-none active:bg-[var(--w-accent)]/25"
      onPointerDown={(e) => { e.preventDefault(); keys.current[key] = true; }}
      onPointerUp={() => { keys.current[key] = false; }}
      onPointerLeave={() => { keys.current[key] = false; }}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className="w-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--w-panel-border)] px-4 py-2.5">
        <p className="flex items-center gap-2 font-[var(--font-ibm-plex-mono)] text-[12px] uppercase tracking-widest opacity-75">
          <Move className="h-4 w-4" /> Level 0 — first-person explorer
        </p>
        <span className="font-[var(--font-ibm-plex-mono)] text-[10.5px] opacity-40">{entered ? `${fps} fps · noclip stable` : "standby"}</span>
      </div>
      <div className="relative aspect-[16/9] w-full bg-black">
        {entered ? (
          <>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            {/* scanlines + vignette overlays */}
            <div className="scanlines absolute inset-0" />
            {/* touch controls */}
            <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1.5 opacity-80 md:hidden">
              <div />
              {holdBtn("w", "▲")}
              <div />
              {holdBtn("a", "◀")}
              {holdBtn("s", "▼")}
              {holdBtn("d", "▶")}
            </div>
            <button
              className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 font-[var(--font-ibm-plex-mono)] text-[11px] text-[#efe9d0] backdrop-blur hover:bg-black/75"
              onClick={() => { setEntered(false); keys.current = {}; }}
            >
              Exit the maze
            </button>
          </>
        ) : (
          <button
            onClick={() => setEntered(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#1c1808] to-[#0f0d06]"
          >
            <span className="font-[var(--font-ibm-plex-mono)] text-[11px] uppercase tracking-[0.4em] text-[#d8c34a]/70">no_clip.exe</span>
            <span className="text-2xl font-bold text-[#efe9d0] transition-colors group-hover:text-white">Enter the Backrooms</span>
            <span className="max-w-sm px-6 text-center text-[13px] leading-relaxed text-[#efe9d0]/55">
              WASD or arrow keys to walk. The rooms repeat. The hum does not mean anyone is home.
              You can always exit — you are a visitor here.
            </span>
            <span className="mt-2 rounded-full border border-[#d8c34a]/40 px-5 py-2 font-[var(--font-ibm-plex-mono)] text-[12px] text-[#d8c34a] transition-colors group-hover:bg-[#d8c34a]/15">
              &gt; begin descent
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
