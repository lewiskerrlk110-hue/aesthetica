"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { Dice5 } from "lucide-react";

// ————— Environment: the wallpaper — banded sun, ruins, checkerboard, solids —————

function BandedSun({ size = 190 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="vapor-sun-grad" cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#ffe0f0" />
          <stop offset="0.55" stopColor="#ffa8d8" />
          <stop offset="1" stopColor="#ef74be" />
        </radialGradient>
        <mask id="vapor-sun-mask">
          <rect width="200" height="200" fill="#fff" />
          <rect x="0" y="118" width="200" height="9" fill="#000" />
          <rect x="0" y="139" width="200" height="11" fill="#000" />
          <rect x="0" y="162" width="200" height="13" fill="#000" />
          <rect x="0" y="187" width="200" height="13" fill="#000" />
        </mask>
      </defs>
      <circle cx="100" cy="100" r="88" fill="url(#vapor-sun-grad)" mask="url(#vapor-sun-mask)" />
    </svg>
  );
}

function WireMountains() {
  return (
    <svg className="absolute inset-x-0 bottom-[34%] w-full" height="150" viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden>
      <g stroke="#5d3f9e" strokeWidth="1.4" fill="none" opacity="0.85">
        <path d="M0 96 L70 44 L130 88 L200 30 L268 84 L330 52 L420 98 L500 40 L580 92 L660 58 L750 100 L830 46 L910 90 L990 60 L1080 96 L1150 70 L1200 92" fill="#4a2f86" fillOpacity="0.45" />
        <path d="M0 128 L90 88 L170 122 L260 78 L350 120 L450 84 L540 126 L640 86 L730 124 L820 92 L920 126 L1020 90 L1120 124 L1200 100 L1200 150 L0 150 Z" fill="#3a2470" fillOpacity="0.6" />
        <path d="M200 30 L200 150 M420 98 L420 150 M660 58 L660 150 M830 46 L830 150 M1020 90 L1020 150" opacity="0.5" />
        <path d="M0 112 L1200 112 M0 132 L1200 132" opacity="0.35" />
      </g>
    </svg>
  );
}

function Column({ x, bottom, h, opacity = 1 }: { x: string; bottom: string; h: number; opacity?: number }) {
  return (
    <svg className="absolute" style={{ left: x, bottom, height: h, opacity }} width={h * 0.34} height={h} viewBox="0 0 60 176" aria-hidden>
      <defs>
        <linearGradient id="vapor-col-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6c8e6" />
          <stop offset="0.5" stopColor="#d898cc" />
          <stop offset="1" stopColor="#a464aa" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="48" height="10" rx="2" fill="#f6d4ec" />
      <rect x="10" y="16" width="40" height="9" fill="#e4aacd" />
      <circle cx="15" cy="20" r="5" fill="#f2bede" />
      <circle cx="45" cy="20" r="5" fill="#f2bede" />
      <rect x="12" y="25" width="36" height="126" fill="url(#vapor-col-grad)" />
      <path d="M20 25 V151 M30 25 V151 M40 25 V151" stroke="#9a58a4" strokeWidth="1.6" opacity="0.55" />
      <rect x="6" y="151" width="48" height="9" fill="#c883c0" />
      <rect x="2" y="160" width="56" height="10" rx="2" fill="#eebcd8" />
    </svg>
  );
}

function Palm({ x, bottom, h, flip = false, color = "#3a2470" }: { x: string; bottom: string; h: number; flip?: boolean; color?: string }) {
  return (
    <svg
      className="absolute"
      style={{ left: x, bottom, height: h, transform: flip ? "scaleX(-1)" : undefined }}
      width={h * 0.72}
      height={h}
      viewBox="0 0 140 200"
      aria-hidden
    >
      <path d="M66 200 C64 152 60 112 72 70 L84 72 C74 114 76 154 80 200 Z" fill={color} />
      <g fill={color}>
        <path d="M78 70 Q44 34 8 40 Q46 50 74 78 Z" />
        <path d="M78 68 Q36 54 14 78 Q52 72 76 80 Z" />
        <path d="M78 70 Q54 96 40 122 Q68 96 80 80 Z" />
        <path d="M78 68 Q116 30 140 44 Q102 48 80 78 Z" />
        <path d="M78 68 Q120 56 132 82 Q96 74 78 80 Z" />
        <path d="M78 70 Q108 98 118 124 Q90 96 76 80 Z" />
      </g>
      <circle cx="78" cy="72" r="7" fill={color} />
    </svg>
  );
}

function Penrose({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="72" height="72" viewBox="0 0 100 100" aria-hidden>
      <path d="M50 6 L95 84 L5 84 Z" fill="#f07ac0" stroke="#ffe0f0" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 38 L68 70 L32 70 Z" fill="#c488d4" />
      <path d="M50 38 L32 70 L5 84 Z" fill="#e09ad8" />
      <path d="M50 38 L68 70 L95 84 Z" fill="#b45ac0" />
      <path d="M32 70 L68 70 L95 84 L5 84 Z" fill="#ffc2e2" />
    </svg>
  );
}

function VaporBust() {
  return (
    <div className="ambient-bob absolute bottom-[13%] left-1/2 -translate-x-1/2 opacity-95">
      <svg width="180" height="248" viewBox="0 0 170 240" aria-hidden>
        <defs>
          <linearGradient id="vapor-marble" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbeef8" />
            <stop offset="0.55" stopColor="#ddc9de" />
            <stop offset="1" stopColor="#b394bc" />
          </linearGradient>
          <linearGradient id="vapor-plinth" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4e2f0" />
            <stop offset="1" stopColor="#c4a0c8" />
          </linearGradient>
        </defs>
        <ellipse cx="85" cy="233" rx="62" ry="7" fill="#1a0e30" opacity="0.45" />
        <g transform="translate(14.6,4) scale(1.28)">
          <path d="M30 138 L36 96 Q40 86 46 84 L46 76 Q36 68 36 52 Q36 30 55 30 Q74 30 74 52 Q74 68 64 76 L64 84 Q70 86 74 96 L80 138 Z" fill="url(#vapor-marble)" />
          <ellipse cx="55" cy="52" rx="19" ry="22" fill="#fbeef8" />
          <path d="M42 40 Q55 34 68 40 M40 50 Q48 58 58 56 M46 30 Q55 24 66 32 Q72 40 72 50" stroke="#a888b0" strokeWidth="1.6" fill="none" />
          <path d="M47 96 Q55 100 63 96" stroke="#a888b0" strokeWidth="1.4" fill="none" />
        </g>
        <polygon points="35,192 135,192 127,185 43,185" fill="#efe0ee" />
        <rect x="35" y="192" width="100" height="36" fill="url(#vapor-plinth)" />
        <rect x="57" y="200" width="56" height="17" fill="#140b22" />
        <text x="85" y="212" textAnchor="middle" fontSize="9.5" fill="#f5ecff" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.5px" }}>
          未来はここにある
        </text>
      </svg>
    </div>
  );
}

function VaporEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* sunset sky */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#7b4fb0 0%,#a86fd0 34%,#dfa0da 58%,#f6c1dd 74%,#f2b0d4 100%)" }} />
      {/* clouds */}
      <div className="cloud-blob absolute left-[20%] top-[30%] h-8 w-40 bg-white/55" style={{ animation: "cloud-drift 34s linear infinite" }} />
      <div className="cloud-blob absolute right-[16%] top-[42%] h-6 w-32 bg-[#ffd7ee]/60" style={{ animation: "cloud-drift 46s linear infinite reverse" }} />
      <div className="cloud-blob absolute left-[42%] top-[20%] h-5 w-24 bg-white/40" style={{ animation: "cloud-drift 40s linear infinite", animationDelay: "-18s" }} />
      {/* banded sun */}
      <div className="ambient-soft absolute left-1/2 top-[10%] -translate-x-1/2" style={{ filter: "drop-shadow(0 0 42px #ff9ed288)" }}>
        <BandedSun />
      </div>
      <WireMountains />
      {/* ruins */}
      <Column x="70%" bottom="27%" h={230} />
      <Column x="82%" bottom="27%" h={196} opacity={0.85} />
      <Column x="90%" bottom="27%" h={168} opacity={0.7} />
      {/* palms */}
      <Palm x="-1%" bottom="24%" h={260} />
      <Palm x="10%" bottom="23%" h={200} color="#472a70" flip />
      {/* checkerboard floor */}
      <div
        className="absolute inset-x-[-20%] bottom-[-12%] h-[46%]"
        style={{
          background: "repeating-conic-gradient(#8a5fb8 0% 25%, #bd8ed4 0% 50%) 50% / 64px 64px",
          transform: "perspective(360px) rotateX(54deg)",
          transformOrigin: "top",
          maskImage: "linear-gradient(to bottom, black 52%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 52%, transparent)",
        }}
      />
      {/* floating solids */}
      <div className="ambient-float absolute left-[13%] top-[26%] h-14 w-14 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #eafcf8, #7de8d8 45%, #3aa898 80%, #8ff0e0)", animationDelay: "-3s" }} />
      <div className="ambient-float absolute right-[30%] bottom-[36%] h-12 w-12 rounded-full" style={{ background: "radial-gradient(circle at 34% 30%, #e8d4ff, #b48ae0 48%, #7a4fb0 85%, #cdb4ff)", animationDelay: "-8s" }} />
      <svg className="ambient-float absolute left-[5%] top-[14%]" width="66" height="66" viewBox="0 0 100 100" style={{ animationDelay: "-5s" }} aria-hidden>
        <polygon points="50 4 96 50 50 96 4 50" fill="#ef74be" stroke="#ffd7ee" strokeWidth="3" />
        <polygon points="50 22 78 50 50 78 22 50" fill="#d860ac" />
      </svg>
      <svg className="ambient-float absolute right-[9%] bottom-[33%]" width="58" height="52" viewBox="0 0 100 90" style={{ animationDelay: "-11s" }} aria-hidden>
        <polygon points="50 4 96 84 4 84" fill="#7de8d8" stroke="#d2fff6" strokeWidth="3" />
        <polygon points="50 26 74 72 26 72" fill="#4cb8a8" />
      </svg>
      <Penrose className="ambient-float absolute right-[19%] top-[13%]" style={{ animationDelay: "-6s", filter: "drop-shadow(0 4px 18px #b0489888)" }} />
      {/* plinth + bust */}
      <VaporBust />
      {/* vertical neon */}
      <div className="absolute right-[2%] top-[26%] hidden flex-col items-center gap-2 sm:flex">
        <span className="neon-future font-mono text-[22px] leading-none tracking-[0.3em]">過去未来</span>
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden style={{ filter: "drop-shadow(0 0 6px #ff9ed2)" }}>
          <polygon points="20 4 37 34 3 34" fill="none" stroke="#ff9ed2" strokeWidth="2.5" />
        </svg>
      </div>
      {/* occasional glitch band */}
      <div className="absolute inset-x-0 top-[52%] h-[3px] bg-white/25" style={{ animation: "glitch-a 6s steps(1) infinite" }} />
      <div className="crt-vignette absolute inset-0" />
    </div>
  );
}

// ————— Win95 draggable windows —————

interface WinState { id: string; x: string; y: string; z: number }

function Win95Buttons({ onClose }: { onClose?: () => void }) {
  return (
    <span className="flex items-center gap-[2px]" onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="win95-btn" aria-hidden tabIndex={-1}>_</button>
      <button type="button" className="win95-btn" aria-hidden tabIndex={-1}>□</button>
      <button type="button" className="win95-btn" aria-label="Close window" onClick={onClose}>×</button>
    </span>
  );
}

function DraggableWindow({
  win,
  onFocus,
  onClose,
  title,
  width,
  children,
}: {
  win: WinState;
  onFocus: () => void;
  onClose?: () => void;
  title: string;
  width?: string;
  children: React.ReactNode;
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
      className="win95 absolute touch-none select-none"
      style={{ left: win.x, top: win.y, zIndex: win.z, width: width ?? "min(240px, 72vw)" }}
      onPointerDown={onFocus}
    >
      <div className="win95-bar" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} role="toolbar" aria-label={`Drag window ${title}`}>
        <span className="flex-1 truncate">{title}</span>
        <Win95Buttons onClose={onClose} />
      </div>
      <div>{children}</div>
    </div>
  );
}

/* window bodies, ported from the reference wallpaper */

function DreamExeBody() {
  return (
    <svg width="100%" height="96" viewBox="0 0 220 96" aria-label="A crescent moon over a pink sky">
      <defs>
        <linearGradient id="vapor-dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7db8e8" />
          <stop offset="1" stopColor="#d8aee4" />
        </linearGradient>
      </defs>
      <rect width="220" height="96" fill="url(#vapor-dsky)" />
      <circle cx="132" cy="42" r="21" fill="#f8f0ff" />
      <circle cx="141" cy="37" r="18" fill="url(#vapor-dsky)" />
      <circle cx="42" cy="24" r="1.6" fill="#fff" /><circle cx="72" cy="60" r="1.2" fill="#fff" opacity="0.8" />
      <circle cx="24" cy="70" r="1.4" fill="#fff" opacity="0.7" /><circle cx="188" cy="70" r="1.6" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function EpiphanyBody() {
  return (
    <div className="relative flex h-[104px] flex-col items-center justify-center overflow-hidden" style={{ background: "linear-gradient(120deg,#cfe0ff 0%,#f5c1e8 38%,#ffffff 62%,#b8d8f8 100%)" }}>
      <div className="cloud-blob absolute left-2 top-3 h-5 w-20 bg-white/80" />
      <div className="cloud-blob absolute right-3 bottom-4 h-4 w-16 bg-white/70" />
      <p className="text-[17px] font-bold tracking-[0.2em] text-[#3a2a5a]">夢を信じて</p>
      <p className="mt-0.5 font-mono text-[9.5px] text-[#6a5a8a]">believe in dreams</p>
    </div>
  );
}

function SystemDataBody() {
  const glyph = "absolute grid place-items-center text-[#e8e8f0]";
  return (
    <div className="relative h-[132px] bg-[#060608]">
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="104" height="104" viewBox="0 0 104 104" aria-hidden>
        <g stroke="#e8e8f0" strokeWidth="1" fill="none">
          <circle cx="52" cy="52" r="42" />
          <ellipse cx="52" cy="52" rx="42" ry="16" />
          <ellipse cx="52" cy="52" rx="26" ry="42" />
          <ellipse cx="52" cy="52" rx="10" ry="42" />
          <line x1="10" y1="52" x2="94" y2="52" />
          <line x1="18" y1="30" x2="86" y2="30" /><line x1="18" y1="74" x2="86" y2="74" />
        </g>
      </svg>
      <span className={`${glyph} left-2 top-2 h-6 w-6`}>
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden><g stroke="#e8e8f0" fill="none"><ellipse cx="10" cy="7" rx="9" ry="6" /><circle cx="10" cy="7" r="2.4" /></g></svg>
      </span>
      <span className={`${glyph} right-2 top-2 h-6 w-6 text-[11px]`}>◇</span>
      <span className={`${glyph} left-2 top-1/2 h-6 w-6 -translate-y-1/2`}>
        <svg width="12" height="22" viewBox="0 0 12 22" aria-hidden><g stroke="#e8e8f0" fill="none"><path d="M2 6 H10 M1 3 H11 M3 6 V19 M6 6 V19 M9 6 V19 M1 19.5 H11" /></g></svg>
      </span>
      <span className={`${glyph} right-2 top-1/2 h-6 w-6 -translate-y-1/2`}>
        <svg width="12" height="22" viewBox="0 0 12 22" aria-hidden><g stroke="#e8e8f0" fill="none"><path d="M2 6 H10 M1 3 H11 M3 6 V19 M6 6 V19 M9 6 V19 M1 19.5 H11" /></g></svg>
      </span>
      <span className={`${glyph} bottom-2 left-6 h-6 w-6 text-[11px]`}>◇</span>
      <span className={`${glyph} bottom-2 right-6 h-6 w-6 text-[11px]`}>◆</span>
    </div>
  );
}

const ASCII_ART = String.raw`   (   ☾   )
 ·   ⋆   ·   ⋆
 \  \  |  /  /
 ~ ~ ~ ~ ~ ~ ~
   ▐▌ ▌ ▐ ▐▌
   ▐▌ ▌ ▐ ▐▌
   ▀▀▀▀▀▀▀▀
    ^   ^   ^`;

function AsciiBody() {
  return <pre className="overflow-hidden px-2 py-1.5 text-left font-mono text-[10px] leading-[1.35] text-[#2a2440]">{ASCII_ART}</pre>;
}

function ThoughtsBody() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <p className="flex-1 font-mono text-[11.5px] leading-snug text-[#2a2440]">It&apos;s all in your mind</p>
      <svg width="34" height="46" viewBox="0 0 40 54" aria-hidden className="opacity-90">
        <path d="M6 50 L9 30 Q10 26 13 25 L13 21 Q8 17 8 11 Q8 2 20 2 Q32 2 32 11 Q32 17 27 21 L27 25 Q30 26 31 30 L34 50 Z" fill="#d8cfe0" />
        <ellipse cx="20" cy="11" rx="10" ry="11" fill="#e8e0ec" />
        <path d="M13 6 Q20 2 27 8" stroke="#a898b8" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}

function LoadingBody() {
  return (
    <div className="flex items-center gap-2 px-2 py-2.5">
      <div className="win95-inset h-[15px] flex-1 bg-[#d6d2ce] p-[2px]">
        <div className="win95-fill h-full" />
      </div>
      <span className="font-mono text-[11px] text-[#2a2440]">98%</span>
    </div>
  );
}

function ErrorBody({ onOk }: { onOk: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[#ffb8d8] px-3 pb-3 pt-2.5 text-center">
      <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden>
        <path d="M2 2 H17 L24 9 V28 H2 Z" fill="#fff" stroke="#5a3d8a" strokeWidth="1.5" />
        <path d="M17 2 V9 H24" fill="none" stroke="#5a3d8a" strokeWidth="1.5" />
        <path d="M6 14 H20 M6 18 H20 M6 22 H14" stroke="#c86ba8" strokeWidth="1.4" />
      </svg>
      <p className="font-mono text-[12px] text-[#402040]">Reality not found.</p>
      <button type="button" className="win95-btn win95-btn-lg" onClick={onOk}>OK</button>
    </div>
  );
}

// ————— Desktop: 7 processes, drag / focus / close / taskbar —————

const PROCESS_DEFS: Record<string, { title: string; width: string; x: string; y: string; body: React.ReactNode }> = {
  dream: {
    title: "dream.exe", width: "min(210px, 62vw)", x: "2.5%", y: "4%",
    body: <DreamExeBody />,
  },
  epiphany: {
    title: "untitled - epiphany", width: "min(225px, 66vw)", x: "min(69%, calc(100% - 232px))", y: "4%",
    body: <EpiphanyBody />,
  },
  system: {
    title: "system.data", width: "min(235px, 70vw)", x: "min(43%, calc(100% - 240px))", y: "24%",
    body: <SystemDataBody />,
  },
  error: {
    title: "error", width: "min(205px, 62vw)", x: "5%", y: "37%",
    body: null,
  },
  ascii: {
    title: "ascii.txt", width: "min(175px, 52vw)", x: "min(76%, calc(100% - 182px))", y: "33%",
    body: <AsciiBody />,
  },
  thoughts: {
    title: "thoughts.exe", width: "min(200px, 60vw)", x: "min(58%, calc(100% - 206px))", y: "min(63%, calc(100% - 130px))",
    body: <ThoughtsBody />,
  },
  loading: {
    title: "loading....", width: "min(220px, 64vw)", x: "4%", y: "min(72%, calc(100% - 84px))",
    body: <LoadingBody />,
  },
};

const PROCESS_ORDER = ["dream", "epiphany", "system", "error", "ascii", "thoughts", "loading"];

function DesktopExplorer() {
  const [wins, setWins] = useState<WinState[]>(
    PROCESS_ORDER.map((id, i) => ({ id, x: PROCESS_DEFS[id].x, y: PROCESS_DEFS[id].y, z: i + 1 })),
  );
  const [closed, setClosed] = useState<string[]>([]);
  const zTop = useRef(PROCESS_ORDER.length);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (restoreTimer.current) clearTimeout(restoreTimer.current); }, []);

  const focus = (id: string) => {
    zTop.current += 1;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: zTop.current } : w)));
  };
  const close = useCallback((id: string) => {
    setClosed((c) => (c.includes(id) ? c : [...c, id]));
    // reality restores itself — the error dialog always comes back
    if (id === "error") {
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
      restoreTimer.current = setTimeout(() => setClosed((c) => c.filter((x) => x !== "error")), 2600);
    }
  }, []);
  const reopen = (id: string) => setClosed((c) => c.filter((x) => x !== id));

  return (
    <div
      className="relative h-[470px] overflow-hidden rounded-[var(--w-radius)] border border-[var(--w-panel-border)] md:h-[540px]"
      style={{ background: "linear-gradient(180deg,#7b4fb0 0%,#b06ac8 42%,#f0a8d0 72%,#8a5fb8 100%)" }}
    >
      {/* wallpaper scene inside the desktop */}
      <div className="pointer-events-none absolute left-1/2 top-[9%] -translate-x-1/2 opacity-90"><BandedSun size={110} /></div>
      <div
        className="pointer-events-none absolute inset-x-[-16%] bottom-[-6%] h-[30%]"
        style={{
          background: "repeating-conic-gradient(#7a4fae 0% 25%, #b078cc 0% 50%) 50% / 44px 44px",
          transform: "perspective(300px) rotateX(56deg)",
          transformOrigin: "top",
          maskImage: "linear-gradient(to bottom, black 46%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 46%, transparent)",
        }}
      />
      {wins.map((w) => {
        if (closed.includes(w.id)) return null;
        const def = PROCESS_DEFS[w.id];
        return (
          <DraggableWindow key={w.id} win={w} onFocus={() => focus(w.id)} onClose={() => close(w.id)} title={def.title} width={def.width}>
            {w.id === "error" ? <ErrorBody onOk={() => close("error")} /> : def.body}
          </DraggableWindow>
        );
      })}
      {/* taskbar */}
      <div className="win95 absolute inset-x-0 bottom-0 z-[999] flex items-center gap-1.5 px-1.5 py-1">
        <span className="win95-btn win95-start flex items-center gap-1">⌂ start</span>
        {closed.length === 0 ? (
          <span className="flex-1 truncate pl-1 font-mono text-[9.5px] text-[#4a4452]">7 processes running · nothing is loading · drag the title bars</span>
        ) : (
          closed.map((id) => (
            <button key={id} type="button" onClick={() => reopen(id)} className="win95-btn win95-chip truncate" title={`Restore ${PROCESS_DEFS[id].title}`}>
              {PROCESS_DEFS[id].title}
            </button>
          ))
        )}
      </div>
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
  "A progress bar that has said 98% since 1997.",
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
            A true 1995 desktop: drag the navy title bars, click × to close a window, restore it
            from the taskbar below. The error dialog refuses to stay closed — reality not found.
            The loading bar has been at 98% for three decades. It is fine.
          </p>
        </div>
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
