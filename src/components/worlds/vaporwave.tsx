"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useApp } from "@/lib/store";
import { Dice5, GripHorizontal } from "lucide-react";

// ————— Environment: checkerboard floor, floating windows, glitch —————
function VaporEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#2a1e3f 0%,#8f5f9e 48%,#e8a1c4 78%,#7df2d8 100%)" }} />
      {/* sun */}
      <div className="absolute left-1/2 top-[16%] h-24 w-24 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle at 38% 32%, #fff6fa, #ffb3d9 55%, #b47cd8)", boxShadow: "0 0 60px 10px #ffb3d966" }} />
      {/* floating windows */}
      <div className="ambient-float absolute left-[8%] top-[22%] hidden md:block">
        <div className="retro-window w-44 rotate-[-4deg]">
          <div className="retro-window-bar"><span className="h-2 w-2 rounded-full bg-[#ff9ecb]" />広告.mp3</div>
          <div className="p-2 font-mono text-[9px] leading-relaxed text-[#7df2d8]">NOW PLAYING: 現代のコンピュー (slowed + reverb)</div>
        </div>
      </div>
      <div className="ambient-soft absolute right-[10%] top-[30%] hidden md:block" style={{ animationDelay: "-4s" }}>
        <div className="retro-window w-40 rotate-[3deg]">
          <div className="retro-window-bar"><span className="h-2 w-2 rounded-full bg-[#7df2d8]" />recycle.bin</div>
          <div className="p-2 font-mono text-[9px] text-[#ff9ecb]">4,096 objects · all obsolete</div>
        </div>
      </div>
      {/* marble bust silhouette */}
      <div className="ambient-bob absolute bottom-[24%] left-1/2 -translate-x-1/2 opacity-90">
        <svg width="110" height="150" viewBox="0 0 110 150" aria-hidden>
          <defs>
            <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f5ede0" /><stop offset="0.5" stopColor="#cfc4b8" /><stop offset="1" stopColor="#a89890" />
            </linearGradient>
          </defs>
          <ellipse cx="55" cy="140" rx="34" ry="8" fill="#00000033" />
          <path d="M30 138 L36 96 Q40 86 46 84 L46 76 Q36 68 36 52 Q36 30 55 30 Q74 30 74 52 Q74 68 64 76 L64 84 Q70 86 74 96 L80 138 Z" fill="url(#marble)" />
          <ellipse cx="55" cy="52" rx="19" ry="22" fill="#f5ede0" />
          <path d="M42 40 Q55 34 68 40" stroke="#a89890" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      {/* checkerboard floor */}
      <div
        className="absolute inset-x-[-20%] bottom-[-10%] h-[42%]"
        style={{
          background: "repeating-conic-gradient(#3d2b5c 0% 25%, #6d5a94 0% 50%) 50% / 60px 60px",
          transform: "perspective(340px) rotateX(52deg)",
          transformOrigin: "top",
          maskImage: "linear-gradient(to bottom, black 55%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
        }}
      />
      {/* drifting chrome sphere */}
      <div className="ambient-float absolute right-[22%] bottom-[38%] h-12 w-12 rounded-full" style={{ background: "radial-gradient(circle at 30% 28%, #ffffff, #cfd8e8 40%, #7a86a8 72%, #e8eef8)", animationDelay: "-2s" }} />
      {/* occasional glitch band */}
      <div className="absolute inset-x-0 top-[52%] h-[3px] bg-white/20" style={{ animation: "glitch-a 6s steps(1) infinite" }} />
      <div className="crt-vignette absolute inset-0" />
    </div>
  );
}

// ————— Draggable windows —————
interface WinState { id: string; x: number; y: number; z: number }

function DraggableWindow({
  win,
  onFocus,
  children,
  title,
  accent,
}: {
  win: WinState;
  onFocus: () => void;
  children: React.ReactNode;
  title: string;
  accent: string;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus();
    const rect = ref.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const el = ref.current!;
    const parent = el.offsetParent as HTMLElement;
    const maxX = parent.clientWidth - el.offsetWidth;
    const maxY = parent.clientHeight - 44;
    el.style.left = `${Math.max(0, Math.min(maxX, e.clientX - parent.getBoundingClientRect().left - drag.current.dx))}px`;
    el.style.top = `${Math.max(0, Math.min(maxY, e.clientY - parent.getBoundingClientRect().top - drag.current.dy))}px`;
  };
  const onPointerUp = () => { drag.current = null; };

  return (
    <div
      ref={ref}
      className="retro-window absolute w-[min(300px,78vw)] touch-none select-none"
      style={{ left: win.x, top: win.y, zIndex: win.z }}
      onPointerDown={onFocus}
    >
      <div
        className="retro-window-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="toolbar"
        aria-label={`Drag window ${title}`}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <span className="flex-1 truncate">{title}</span>
        <GripHorizontal className="h-3 w-3 opacity-50" />
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function DesktopExplorer() {
  const [wins, setWins] = useState<WinState[]>([
    { id: "a", x: 8, y: 16, z: 1 },
    { id: "b", x: 240, y: 96, z: 2 },
    { id: "c", x: 90, y: 210, z: 3 },
  ]);
  const zTop = useRef(3);
  const focus = (id: string) => {
    zTop.current += 1;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: zTop.current } : w)));
  };

  const ARTIFACTS: Record<string, { title: string; accent: string; body: React.ReactNode }> = {
    a: {
      title: "read_me.first",
      accent: "#7df2d8",
      body: (
        <p className="text-[12.5px] leading-relaxed opacity-85">
          Welcome to the desktop of a machine nobody remembers buying.
          These windows are draggable — arrange the ruins however you like.
          Nothing here is loading. Nothing here needs to.
        </p>
      ),
    },
    b: {
      title: "shopping_mall.txt",
      accent: "#ff9ecb",
      body: (
        <p className="text-[12.5px] leading-relaxed opacity-85">
          Foot traffic: 0. Fountain: operational since 1988.
          The food court still plays the same six-second loop.
          Historians call this feeling <em>Mallsoft</em>. The fountain does not.
        </p>
      ),
    },
    c: {
      title: "aesthetic.ini",
      accent: "#cdb4ff",
      body: (
        <div className="space-y-1.5 font-mono text-[11px] opacity-85">
          <p>busts=classical</p>
          <p>palette=pastel</p>
          <p>compression=artefact</p>
          <p>sincerity=0.6</p>
          <p>irony=0.8</p>
          <p className="opacity-60">; they were never opposites</p>
        </div>
      ),
    },
  };

  return (
    <div className="relative h-[380px] overflow-hidden rounded-[var(--w-radius)] border border-[var(--w-panel-border)]" style={{ background: "linear-gradient(160deg,#1c1430,#46246b)" }}>
      {wins.map((w) => {
        const cfg = ARTIFACTS[w.id];
        return (
          <DraggableWindow key={w.id} win={w} onFocus={() => focus(w.id)} title={cfg.title} accent={cfg.accent}>
            {cfg.body}
          </DraggableWindow>
        );
      })}
      <p className="absolute bottom-2 right-3 font-mono text-[10px] opacity-40">drag the title bars · click to focus</p>
    </div>
  );
}

// ————— Random artefact discovery —————
const ARTEFACTS = [
  "A PalmPilot with one appointment, recurring forever: 'be here'.",
  "A demo disc with nineteen playable trials and one locked file named DREAM.",
  "A shareware floppy whose label reads 'you have 27 days left'.",
  "A dial tone that almost sounds like a choir if you hum along.",
  "A screensaver of a hallway that never appears in the actual building.",
  "A mall map where every store is 'SPECIALTY RETAIL'.",
  "A fax of a photograph of a fax of a bust.",
];

function ArtefactButton() {
  const [artifact, setArtifact] = useState<string | null>(null);
  const roll = useCallback(() => {
    setArtifact(ARTEFACTS[Math.floor(Math.random() * ARTEFACTS.length)]);
  }, []);
  return (
    <div className="w-panel flex flex-col items-start gap-3 px-5 py-4">
      <button onClick={roll} className="w-btn" aria-live="polite">
        <Dice5 className="h-4 w-4" /> Discover a random artefact
      </button>
      {artifact && <p className="text-[14px] italic leading-relaxed opacity-85">“{artifact}”</p>}
    </div>
  );
}

export function VaporwavePage() {
  const world = WORLD_MAP.vaporwave;
  const env = <VaporEnv />;
  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-[1.4fr_1fr]">
      <DesktopExplorer />
      <div className="flex flex-col gap-5">
        <ArtefactButton />
        <div className="w-panel px-5 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-widest opacity-70">Field note</p>
          <p className="mt-2 text-[13.5px] leading-relaxed opacity-80">
            The glitch bands and colour separation you see are deliberate — controlled corruption,
            subtle enough to keep the page readable. Drag the desktop windows above: interaction
            is the point, not decoration.
          </p>
        </div>
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
