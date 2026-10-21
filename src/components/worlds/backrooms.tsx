"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { BackroomsExplorer } from "@/components/features/backrooms-explorer";
import { authHeaders } from "@/lib/identity";
import { useToast } from "@/hooks/use-toast";
import { Radio, FileText, Volume2, VolumeX, Signal, Map as MapIcon } from "lucide-react";

// ————— Environment: Level 0 — one-point perspective colonnade —————
// Rebuilt from a game-render reference: mono-yellow hallway, tiled drop
// ceiling with louvered fluorescents, square pillars receding into gloom,
// damp carpet, a hazmat explorer reading a note, and something on the ceiling.
// Everything structural lives in one SVG (viewBox 1600x900, slice) so the
// perspective stays pixel-consistent at any viewport aspect ratio.
const FOG = (o: number) => `rgba(33,25,9,${o})`;

const PILLARS = [
  // painted far → near so nearer columns overlap farther ones
  { cx: 741.5, w: 15, top: 361, bottom: 457, fog: 0.56 },
  { cx: 871.5, w: 18.7, top: 351, bottom: 468, fog: 0.52, side: "left" },
  { cx: 696, w: 27, top: 327, bottom: 497, fog: 0.46 },
  { cx: 943, w: 37.4, top: 298, bottom: 531, fog: 0.4, side: "left" },
  { cx: 605, w: 51, top: 259, bottom: 577, fog: 0.32 },
  { cx: 1073, w: 71.4, top: 201, bottom: 646, fog: 0.24, side: "left" },
  { cx: 442.5, w: 93.5, top: 138, bottom: 721, fog: 0.16 },
  { cx: 1352.5, w: 144.5, top: -7, bottom: 894, fog: 0.08, side: "left" },
  { cx: 150, w: 170, top: -80, bottom: 980, fog: 0 },
] as const;

// ceiling grid rows: y position + half-width (the plane narrows toward the far opening)
const CEIL_ROWS = [
  { y: 10, hw: 780, sw: 3.4 },
  { y: 36, hw: 730, sw: 3.1 },
  { y: 74, hw: 654, sw: 2.8 },
  { y: 126, hw: 551, sw: 2.4 },
  { y: 190, hw: 437, sw: 2 },
  { y: 265, hw: 290, sw: 1.5 },
  { y: 330, hw: 149, sw: 1.1 },
];
// converging joist lines: top-edge x → far-opening x
const CEIL_JOISTS = [-150, 120, 360, 580, 800, 1020, 1240, 1480, 1750];

function LightFixture({ y, w, h, delay, dur }: { y: number; w: number; h: number; delay: number; dur: number }) {
  const gap = w * 0.06;
  const barW = (w - 3 * gap) / 4;
  const x0 = 800 - w / 2;
  return (
    <g className="ambient-flicker" style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
      <ellipse cx={800} cy={y + h / 2} rx={w * 0.95} ry={h * 1.15} fill="url(#lightGlow)" opacity={0.55} />
      <rect x={x0 - 5} y={y - 4} width={w + 10} height={h + 8} rx={2} fill="#3e3616" />
      {[0, 1, 2, 3].map((b) => (
        <rect key={b} x={x0 + b * (barW + gap)} y={y} width={barW} height={h} rx={1.5} fill="#fdf6d2" />
      ))}
    </g>
  );
}

function Pillar({ p }: { p: (typeof PILLARS)[number] }) {
  const sideW = Math.max(3, p.w * 0.18);
  const sideX = "side" in p && p.side === "left" ? p.cx - p.w / 2 - sideW : p.cx + p.w / 2;
  return (
    <g>
      <rect x={sideX} y={p.top} width={sideW} height={p.bottom - p.top} fill="#4c4019" />
      <rect x={p.cx - p.w / 2} y={p.top} width={p.w} height={p.bottom - p.top} fill="url(#pillarG)" />
      <rect x={p.cx - p.w / 2} y={p.top} width={p.w} height={p.bottom - p.top} fill={FOG(p.fog)} />
    </g>
  );
}

// long-limbed entity, clinging to the ceiling between the right columns
function CeilingCrawler() {
  return (
    <g>
      <ellipse cx={1180} cy={360} rx={46} ry={130} fill="rgba(20,14,4,0.3)" filter="url(#soft2)" />
      <g className="bl-sway" style={{ transformOrigin: "1150px 240px" }}>
        <g stroke="#191309" strokeLinecap="round" fill="none">
          <path d="M1148,252 C1136,330 1108,430 1064,548" strokeWidth={7} />
          <path d="M1160,248 C1190,300 1224,352 1248,392" strokeWidth={6} />
          <path d="M1140,238 C1110,220 1080,212 1046,210" strokeWidth={5} />
          <path d="M1154,252 C1148,300 1160,340 1152,368" strokeWidth={5} />
          <path d="M1144,246 C1100,290 1052,318 1004,338" strokeWidth={4} />
        </g>
        <ellipse cx={1152} cy={244} rx={21} ry={13} fill="#191309" />
        <ellipse cx={1171} cy={252} rx={12} ry={9} fill="#191309" transform="rotate(24 1171 252)" />
      </g>
    </g>
  );
}

// hazmat explorer, back turned, reading the note pinned to the column
function HazmatReader() {
  return (
    <g className="bl-bob">
      <ellipse cx={1000} cy={663} rx={36} ry={8} fill="rgba(8,6,2,0.4)" filter="url(#soft)" />
      <rect x={988} y={594} width={11} height={60} fill="#6f6828" />
      <rect x={1001} y={594} width={11} height={60} fill="#5f5922" />
      <rect x={985} y={648} width={16} height={13} rx={2} fill="#16120a" />
      <rect x={999} y={648} width={16} height={13} rx={2} fill="#16120a" />
      <rect x={981} y={526} width={38} height={74} rx={11} fill="url(#suitG)" />
      <rect x={988} y={534} width={24} height={46} rx={6} fill="#7a7330" />
      <line x1={992} y1={540} x2={992} y2={574} stroke="#5c5524" strokeWidth={2} />
      <line x1={1008} y1={540} x2={1008} y2={574} stroke="#5c5524" strokeWidth={2} />
      <rect x={975} y={532} width={9} height={54} rx={4.5} fill="#a49c42" />
      <circle cx={979.5} cy={590} r={5} fill="#4aa8a0" />
      <g transform="rotate(-100 1015 536)">
        <rect x={1011} y={536} width={9} height={46} rx={4.5} fill="#a49c42" />
        <circle cx={1015.5} cy={586} r={5} fill="#4aa8a0" />
      </g>
      <circle cx={1000} cy={512} r={14} fill="url(#suitG)" />
      <circle cx={1000} cy={512} r={14} fill="none" stroke="#6f6828" strokeWidth={2} />
      <circle cx={998} cy={516} r={6} fill="#8f8736" />
    </g>
  );
}

// a second explorer, further down the hall, mid-stride
function HazmatRunner() {
  return (
    <g className="bl-bob" style={{ animationDelay: "-2.6s", animationDuration: "4.4s" }} opacity={0.9}>
      <ellipse cx={668} cy={547} rx={22} ry={5} fill="rgba(8,6,2,0.4)" filter="url(#soft)" />
      <rect x={662} y={506} width={9} height={34} fill="#57511f" transform="rotate(12 666 506)" />
      <rect x={669} y={506} width={9} height={34} fill="#4c4619" transform="rotate(-16 673 506)" />
      <rect x={655} y={466} width={23} height={44} rx={9} fill="#8f8838" transform="rotate(-8 666 488)" />
      <rect x={660} y={472} width={13} height={26} rx={4} fill="#6e6730" />
      <rect x={653} y={471} width={7} height={26} rx={3.5} fill="#7d7630" transform="rotate(14 656 471)" />
      <rect x={674} y={471} width={7} height={26} rx={3.5} fill="#7d7630" transform="rotate(-20 677 471)" />
      <circle cx={666} cy={458} r={9} fill="#8f8838" />
    </g>
  );
}

// pencil-scribbled note, pinned to the nearest right column
function PinnedNote() {
  return (
    <g transform="rotate(-4 1056 527)">
      <rect x={1046} y={512} width={21} height={28} fill="#efe8d0" stroke="rgba(40,32,12,0.25)" />
      <line x1={1050} y1={520} x2={1062} y2={520} stroke="#8a8060" strokeWidth={1.2} />
      <line x1={1050} y1={526} x2={1060} y2={526} stroke="#8a8060" strokeWidth={1.2} />
      <circle cx={1055} cy={533} r={2.6} fill="none" stroke="#8a8060" strokeWidth={1} />
      <line x1={1055} y1={535.6} x2={1055} y2={539} stroke="#8a8060" strokeWidth={1} />
    </g>
  );
}

const CONTACT_SHADOWS = [
  { cx: 742, cy: 459, rx: 11, ry: 2.5 },
  { cx: 872, cy: 470, rx: 13, ry: 3 },
  { cx: 696, cy: 499, rx: 19, ry: 4 },
  { cx: 943, cy: 533, rx: 25, ry: 5 },
  { cx: 605, cy: 579, rx: 34, ry: 7 },
  { cx: 1073, cy: 648, rx: 48, ry: 10 },
  { cx: 442, cy: 723, rx: 62, ry: 13 },
  { cx: 1352, cy: 896, rx: 96, ry: 18 },
];

function BackroomsEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="ceilG" x1="0" y1="0" x2="0" y2="375" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#cab97f" />
            <stop offset="1" stopColor="#857641" />
          </linearGradient>
          <linearGradient id="wallL" x1="0" y1="0" x2="740" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#bda75c" />
            <stop offset="1" stopColor="#6e5f28" />
          </linearGradient>
          <linearGradient id="wallR" x1="860" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6e5f28" />
            <stop offset="1" stopColor="#bda75c" />
          </linearGradient>
          <linearGradient id="floorG" x1="0" y1="435" x2="0" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1f1908" />
            <stop offset="0.35" stopColor="#453b18" />
            <stop offset="1" stopColor="#57491f" />
          </linearGradient>
          <linearGradient id="pillarG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b89f4c" />
            <stop offset="1" stopColor="#6f6128" />
          </linearGradient>
          <linearGradient id="suitG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcb24e" />
            <stop offset="1" stopColor="#8a8234" />
          </linearGradient>
          <linearGradient id="farG" x1="0" y1="375" x2="0" y2="435" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#141006" />
            <stop offset="1" stopColor="#050401" />
          </linearGradient>
          <radialGradient id="lightGlow">
            <stop offset="0" stopColor="rgba(253,246,210,0.5)" />
            <stop offset="1" stopColor="rgba(253,246,210,0)" />
          </radialGradient>
          <radialGradient id="poolG">
            <stop offset="0" stopColor="rgba(253,246,210,0.14)" />
            <stop offset="1" stopColor="rgba(253,246,210,0)" />
          </radialGradient>
          <pattern id="carpet" width="72" height="72" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="16" r="1.6" fill="rgba(0,0,0,0.35)" />
            <circle cx="44" cy="8" r="1.3" fill="rgba(0,0,0,0.3)" />
            <circle cx="60" cy="34" r="1.7" fill="rgba(0,0,0,0.32)" />
            <circle cx="26" cy="44" r="1.2" fill="rgba(0,0,0,0.3)" />
            <circle cx="8" cy="58" r="1.5" fill="rgba(0,0,0,0.34)" />
            <circle cx="52" cy="62" r="1.2" fill="rgba(0,0,0,0.28)" />
            <circle cx="34" cy="24" r="1.1" fill="rgba(255,244,200,0.1)" />
            <circle cx="64" cy="52" r="1.2" fill="rgba(255,244,200,0.08)" />
          </pattern>
          <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="soft2" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <clipPath id="ceilClip"><polygon points="0,0 1600,0 860,375 740,375" /></clipPath>
          <clipPath id="floorClip"><polygon points="740,435 860,435 1600,900 0,900" /></clipPath>
        </defs>

        {/* ceiling plane + tile grid + fixtures */}
        <polygon points="0,0 1600,0 860,375 740,375" fill="url(#ceilG)" />
        <g clipPath="url(#ceilClip)">
          {CEIL_ROWS.map((r) => (
            <line key={`r${r.y}`} x1={800 - r.hw} y1={r.y} x2={800 + r.hw} y2={r.y} stroke="rgba(58,47,17,0.38)" strokeWidth={r.sw} />
          ))}
          {CEIL_JOISTS.map((x) => (
            <line key={`j${x}`} x1={x} y1={0} x2={800 + (x - 800) * 0.075} y2={375} stroke="rgba(58,47,17,0.3)" strokeWidth={2} />
          ))}
        </g>
        <LightFixture y={46} w={236} h={56} delay={0} dur={9} />
        <LightFixture y={138} w={152} h={40} delay={-2.4} dur={7.4} />
        <LightFixture y={250} w={90} h={24} delay={-4.1} dur={10.2} />
        <LightFixture y={328} w={48} h={14} delay={-6.3} dur={8.3} />

        {/* side walls + damp stains */}
        <polygon points="0,0 740,375 740,435 0,900" fill="url(#wallL)" />
        <polygon points="1600,0 860,375 860,435 1600,900" fill="url(#wallR)" />
        <ellipse cx={300} cy={620} rx={140} ry={90} fill="rgba(40,30,10,0.3)" filter="url(#soft2)" />
        <ellipse cx={1290} cy={540} rx={120} ry={80} fill="rgba(40,30,10,0.3)" filter="url(#soft2)" />
        <ellipse cx={620} cy={470} rx={80} ry={46} fill="rgba(40,30,10,0.24)" filter="url(#soft2)" />
        <ellipse cx={980} cy={455} rx={60} ry={36} fill="rgba(40,30,10,0.24)" filter="url(#soft2)" />

        {/* the hallway continues into the dark */}
        <rect x={740} y={375} width={120} height={60} fill="url(#farG)" />
        <rect x={752} y={387} width={96} height={36} fill="#241d0a" opacity={0.6} />
        <rect x={788} y={398} width={24} height={6} fill="#d9cfa0" opacity={0.45} />
        <rect x={740} y={375} width={120} height={60} fill={FOG(0.4)} />

        {/* damp carpet + pools of light */}
        <polygon points="740,435 860,435 1600,900 0,900" fill="url(#floorG)" />
        <g clipPath="url(#floorClip)">
          <rect x={0} y={435} width={1600} height={465} fill="url(#carpet)" opacity={0.55} />
          <ellipse cx={800} cy={690} rx={230} ry={58} fill="url(#poolG)" />
          <ellipse cx={800} cy={556} rx={150} ry={32} fill="url(#poolG)" />
          <ellipse cx={800} cy={478} rx={88} ry={16} fill="url(#poolG)" />
          {CONTACT_SHADOWS.map((s) => (
            <ellipse key={`s${s.cx}`} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="rgba(10,8,2,0.35)" filter="url(#soft)" />
          ))}
        </g>

        {/* colonnade, actors, grime — painter's order far → near */}
        <Pillar p={PILLARS[0]} />
        <Pillar p={PILLARS[1]} />
        <Pillar p={PILLARS[2]} />
        <Pillar p={PILLARS[3]} />
        <Pillar p={PILLARS[4]} />
        <HazmatRunner />
        <CeilingCrawler />
        <Pillar p={PILLARS[5]} />
        <PinnedNote />
        <HazmatReader />
        <Pillar p={PILLARS[6]} />
        <Pillar p={PILLARS[7]} />
        <Pillar p={PILLARS[8]} />
        <path d="M0,900 L740,435" stroke="rgba(26,20,7,0.45)" strokeWidth={30} fill="none" filter="url(#soft)" />
        <path d="M1600,900 L860,435" stroke="rgba(26,20,7,0.45)" strokeWidth={30} fill="none" filter="url(#soft)" />
        <path d="M0,0 L740,375" stroke="rgba(40,32,12,0.22)" strokeWidth={16} fill="none" filter="url(#soft)" />
        <path d="M1600,0 L860,375" stroke="rgba(40,32,12,0.22)" strokeWidth={16} fill="none" filter="url(#soft)" />
      </svg>

      {/* atmosphere: far gloom, light haze, vignette, analog wear */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(30% 22% at 50% 45%, rgba(26,19,6,0.6), transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(46% 30% at 50% 10%, rgba(253,246,210,0.1), transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(115% 90% at 50% 42%, transparent 28%, rgba(14,11,4,0.68) 82%, rgba(6,5,2,0.88) 100%)" }} />
      <div className="film-grain absolute inset-0 opacity-70" />
      <div className="scanlines absolute inset-0 opacity-30" />
    </div>
  );
}

// ————— The Radio Room —————
// Synthesized static, interference and fictional stations.
// Clearly labelled as sound design, not real recordings.
const RADIO_STATIONS = [
  { id: "static", name: "87.5 — dead air", desc: "Carrier wave and nothing else", kind: "static" },
  { id: "hum", name: "92.3 — THE HUM", desc: "The building's own frequency", kind: "hum" },
  { id: "numbers", name: "104.7 — numbers", desc: "A repeating count, direction unknown", kind: "numbers" },
  { id: "message", name: "109.2 — tape loop", desc: "A found message on repeat", kind: "message" },
] as const;

function RadioRoom() {
  const { toast } = useToast();
  const [tuned, setTuned] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.35);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [level, setLevel] = useState(0);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    gainRef.current = null;
    setTuned(null);
    setLevel(0);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const tune = async (id: string) => {
    if (tuned === id) { stop(); return; }
    stop();
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    ctxRef.current = ac;
    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);
    gainRef.current = master;
    const stops: (() => void)[] = [];
    const meter = ac.createAnalyser();
    meter.fftSize = 128;
    master.connect(meter);

    // noise bed for every station
    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ac.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const nf = ac.createBiquadFilter();
    nf.type = "bandpass";
    const ng = ac.createGain();

    if (id === "static") {
      nf.frequency.value = 3000;
      ng.gain.value = 0.5;
      noise.connect(nf).connect(ng).connect(master);
      noise.start();
      stops.push(() => noise.stop());
    }

    if (id === "hum") {
      nf.frequency.value = 120;
      ng.gain.value = 0.08;
      noise.connect(nf).connect(ng).connect(master);
      noise.start();
      const o = ac.createOscillator();
      o.frequency.value = 60;
      o.type = "sawtooth";
      const og = ac.createGain();
      og.gain.value = 0.09;
      o.connect(og).connect(master);
      o.start();
      stops.push(() => { noise.stop(); o.stop(); });
    }

    if (id === "numbers") {
      nf.frequency.value = 1800;
      ng.gain.value = 0.16;
      noise.connect(nf).connect(ng).connect(master);
      noise.start();
      // beep sequence
      const beep = (f: number, dur: number, when: number) => {
        const o = ac.createOscillator();
        o.frequency.value = f;
        const g = ac.createGain();
        g.gain.setValueAtTime(0.001, when);
        g.gain.exponentialRampToValueAtTime(0.22, when + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, when + dur);
        o.connect(g).connect(master);
        o.start(when);
        o.stop(when + dur + 0.05);
      };
      const loop = () => {
        const t0 = ac.currentTime + 0.1;
        [880, 880, 660, 880, 990].forEach((f, i) => beep(f, 0.16, t0 + i * 0.5));
        [660, 660, 660].forEach((f, i) => beep(f, 0.16, t0 + 4 + i * 0.5));
      };
      loop();
      const iv = setInterval(loop, 7000);
      stops.push(() => { noise.stop(); clearInterval(iv); });
    }

    if (id === "message") {
      nf.frequency.value = 1000;
      ng.gain.value = 0.14;
      noise.connect(nf).connect(ng).connect(master);
      noise.start();
      // "voice-like" filtered sawtooth bursts
      const say = (when: number, base: number, dur: number) => {
        const o = ac.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(base, when);
        o.frequency.linearRampToValueAtTime(base * (0.85 + Math.random() * 0.3), when + dur);
        const f = ac.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 700;
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(0.14, when + dur * 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        o.connect(f).connect(g).connect(master);
        o.start(when);
        o.stop(when + dur + 0.05);
      };
      const loop = () => {
        let t = ac.currentTime + 0.2;
        const words = [0.5, 0.35, 0.6, 0.3, 0.8, 0.4];
        words.forEach((dur, i) => { say(t, 110 + (i % 3) * 18, dur); t += dur + 0.18; });
      };
      loop();
      const iv = setInterval(loop, 6500);
      stops.push(() => { noise.stop(); clearInterval(iv); });
    }

    stopRef.current = () => stops.forEach((s) => s());
    setTuned(id);

    // VU meter
    const data = new Uint8Array(meter.frequencyBinCount);
    const tick = () => {
      meter.getByteFrequencyData(data);
      setLevel(data.reduce((s, v) => s + v, 0) / (data.length * 255));
      if (ctxRef.current === ac) requestAnimationFrame(tick);
    };
    tick();
  };

  return (
    <div className="w-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--w-panel-border)] px-4 py-2.5">
        <p className="flex items-center gap-2 font-[var(--font-ibm-plex-mono)] text-[12px] uppercase tracking-widest opacity-75">
          <Radio className="h-4 w-4" /> The Radio Room
        </p>
        <span className="flex items-center gap-1.5 font-[var(--font-ibm-plex-mono)] text-[10.5px] opacity-50">
          <Signal className="h-3 w-3" style={{ opacity: tuned ? 1 : 0.3 }} /> {tuned ? "signal locked" : "scanning"}
        </span>
      </div>
      <div className="p-5">
        {/* radio panel */}
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-[var(--w-panel-border)] bg-black/30 p-4">
          <div className="flex h-16 flex-1 items-center gap-[3px] overflow-hidden rounded bg-black/60 px-3" aria-hidden>
            {Array.from({ length: 36 }, (_, i) => (
              <span
                key={i}
                className="w-1 rounded-sm bg-[#d8c34a] transition-all duration-75"
                style={{ height: `${8 + Math.abs(Math.sin(i * 1.7 + level * 30)) * level * 46 + level * 6}px`, opacity: tuned ? 0.9 : 0.15 }}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={() => (tuned ? stop() : tune("static"))} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c34a]/50 bg-[#d8c34a]/10 transition-colors hover:bg-[#d8c34a]/25" aria-label={tuned ? "Power off" : "Power on"}>
              {tuned ? <Volume2 className="h-5 w-5 text-[#d8c34a]" /> : <VolumeX className="h-5 w-5 text-[#d8c34a]/60" />}
            </button>
            <span className="font-[var(--font-ibm-plex-mono)] text-[9px] uppercase tracking-widest opacity-50">power</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {RADIO_STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => tune(s.id)}
              aria-pressed={tuned === s.id}
              className={`rounded-lg border px-3.5 py-2.5 text-left font-[var(--font-ibm-plex-mono)] transition-all ${
                tuned === s.id ? "border-[#d8c34a] bg-[#d8c34a]/12" : "border-[var(--w-panel-border)] opacity-70 hover:opacity-100"
              }`}
            >
              <span className="block text-[12.5px] font-semibold">{s.name}</span>
              <span className="mt-0.5 block text-[11px] opacity-60">{s.desc}</span>
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3 text-[11.5px] opacity-70">
          Volume
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (gainRef.current) gainRef.current.gain.value = v;
            }}
            className="flex-1 accent-[#d8c34a]"
            aria-label="Radio volume"
          />
        </label>
        <p className="mt-3 border-t border-[var(--w-panel-border)] pt-3 text-[11px] leading-relaxed opacity-55">
          All audio is synthesized locally — static, hums and tones are sound design, not real
          recordings. "Numbers" and "tape loop" are fiction written for this room. Nothing here
          is a transmission, and no message board is monitored.
        </p>
      </div>
    </div>
  );
}

// ————— Found Notes Archive —————
interface NoteDTO {
  id: string; levelRef: string | null; title: string; body: string;
  foundAt: string | null; timestamp: string | null; kind: string;
}
interface LevelDTO {
  id: string; identifier: string; title: string; description: string;
  survival: string; danger: string; tags: string; connections: string;
  imageUrl: string | null; isCanon: boolean;
}

function FoundNotes() {
  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState<NoteDTO | null>(null);
  useEffect(() => {
    fetch("/api/dreamseed?type=notes").then((r) => r.json()).then((d) => setNotes(d.notes || [])).catch(() => {});
  }, []);
  const levels = Array.from(new Set(notes.map((n) => n.levelRef).filter(Boolean))) as string[];
  const list = filter === "all" ? notes : notes.filter((n) => n.levelRef === filter);

  return (
    <div className="w-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--w-panel-border)] px-4 py-2.5">
        <p className="flex items-center gap-2 font-[var(--font-ibm-plex-mono)] text-[12px] uppercase tracking-widest opacity-75">
          <FileText className="h-4 w-4" /> Found Notes Archive
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")} className="w-tag" style={filter === "all" ? { color: "var(--w-fg)", borderColor: "var(--w-accent)" } : undefined}>all</button>
          {levels.map((l) => (
            <button key={l} onClick={() => setFilter(l)} className="w-tag" style={filter === l ? { color: "var(--w-fg)", borderColor: "var(--w-accent)" } : undefined}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {list.map((n) => (
          <button
            key={n.id}
            onClick={() => setSel(n)}
            className="group rounded-lg border border-[var(--w-panel-border)] bg-black/25 p-4 text-left transition-all hover:border-[var(--w-accent)]/60 hover:bg-black/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-[var(--font-ibm-plex-mono)] text-[13px] font-semibold">{n.title}</span>
              <span className="rounded bg-[var(--w-accent)]/15 px-1.5 py-0.5 font-[var(--font-ibm-plex-mono)] text-[9.5px] uppercase tracking-wider" style={{ color: "var(--w-accent)" }}>{n.kind}</span>
            </span>
            <span className="mt-1 block line-clamp-2 text-[12px] leading-relaxed opacity-60">{n.body.split("\n")[0]}</span>
            <span className="mt-2 block font-[var(--font-ibm-plex-mono)] text-[10.5px] opacity-40">
              {n.levelRef || "unassigned"} · found: {n.foundAt || "unknown"}
            </span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setSel(null)} role="dialog" aria-modal="true">
          <div className="paper max-h-[80vh] w-full max-w-lg overflow-y-auto p-7" onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(#f4eeda,#eee6cc)", color: "#3a3420" }}>
            <p className="font-[var(--font-ibm-plex-mono)] text-[10.5px] uppercase tracking-widest text-[#8a7c38]">
              {sel.levelRef || "unassigned space"} · {sel.timestamp || "undated"} · {sel.kind}
            </p>
            <h3 className="mt-1 font-[var(--font-ibm-plex-mono)] text-xl font-semibold">{sel.title}</h3>
            <p className="mt-1 font-[var(--font-ibm-plex-mono)] text-[11px] text-[#6e6230]">found: {sel.foundAt}</p>
            <div className="mt-4 whitespace-pre-line font-[var(--font-ibm-plex-mono)] text-[13.5px] leading-relaxed">{sel.body}</div>
            <p className="mt-5 border-t border-[#3a3420]/15 pt-3 text-[10.5px] leading-relaxed text-[#3a3420]/55">
              Community-created fiction in the Backrooms tradition — creative writing, not documentation.
            </p>
            <button onClick={() => setSel(null)} className="mt-4 rounded-full bg-[#3a3420]/10 px-4 py-1.5 text-[12px] font-semibold hover:bg-[#3a3420]/20">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ————— Level Explorer —————
function LevelExplorer() {
  const [levels, setLevels] = useState<LevelDTO[]>([]);
  const [sel, setSel] = useState<LevelDTO | null>(null);
  useEffect(() => {
    fetch("/api/dreamseed?type=levels").then((r) => r.json()).then((d) => setLevels(d.levels || [])).catch(() => {});
  }, []);

  const jump = (identifier: string) => {
    const target = levels.find((l) => l.identifier === identifier);
    if (target) setSel(target);
  };

  return (
    <div className="w-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--w-panel-border)] px-4 py-2.5">
        <p className="flex items-center gap-2 font-[var(--font-ibm-plex-mono)] text-[12px] uppercase tracking-widest opacity-75">
          <MapIcon className="h-4 w-4" /> Level Explorer
        </p>
        <span className="font-[var(--font-ibm-plex-mono)] text-[10.5px] opacity-40">{levels.length} levels mapped by the community</span>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        {levels.map((l) => (
          <button
            key={l.id}
            onClick={() => setSel(l)}
            className="group overflow-hidden rounded-lg border border-[var(--w-panel-border)] bg-black/25 text-left transition-all hover:border-[var(--w-accent)]/60"
          >
            {l.imageUrl && (
              <div className="h-28 overflow-hidden">
                <img src={l.imageUrl} alt="" className="h-full w-full object-cover opacity-80 transition-all group-hover:scale-105 group-hover:opacity-100" loading="lazy" />
              </div>
            )}
            <div className="p-4">
              <span className="flex items-center justify-between gap-2">
                <span className="font-[var(--font-ibm-plex-mono)] text-[14px] font-semibold">
                  {l.identifier} — {l.title}
                </span>
                <span className={`rounded px-1.5 py-0.5 font-[var(--font-ibm-plex-mono)] text-[9.5px] uppercase tracking-wider ${
                  l.danger.includes("severe") ? "bg-red-500/20 text-red-300" : l.danger.includes("high") ? "bg-orange-500/20 text-orange-300" : "bg-[var(--w-accent)]/15 text-[var(--w-accent)]"
                }`}>
                  {l.danger}
                </span>
              </span>
              <span className="mt-1.5 block line-clamp-2 text-[12.5px] leading-relaxed opacity-65">{l.description}</span>
            </div>
          </button>
        ))}
      </div>
      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSel(null)} role="dialog" aria-modal="true">
          <div className="w-panel max-h-[85vh] w-full max-w-xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-[var(--font-ibm-plex-mono)] text-[10.5px] uppercase tracking-widest text-[var(--w-accent)]">{sel.identifier} · community lore</p>
            <h3 className="mt-1 w-display text-2xl font-bold">{sel.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed opacity-85">{sel.description}</p>
            <div className="mt-4 rounded-lg border border-[var(--w-panel-border)] bg-black/30 p-4">
              <p className="font-[var(--font-ibm-plex-mono)] text-[10.5px] uppercase tracking-widest opacity-60">Survival guidance (in-universe)</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed">{sel.survival}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-[var(--font-ibm-plex-mono)] text-[10.5px] uppercase tracking-widest opacity-60">Connections:</span>
              {sel.connections.split(",").filter(Boolean).map((c) => (
                <button key={c} onClick={() => jump(c.trim())} className="w-tag">{c.trim()}</button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed opacity-50">
              All levels, dangers and survival notes are community-created fiction — part of the
              collaborative Backrooms mythology, not documentation.
            </p>
            <button onClick={() => setSel(null)} className="w-btn mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BackroomsPage() {
  const world = WORLD_MAP.backrooms;
  const env = <BackroomsEnv />;
  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6">
      <BackroomsExplorer />
      <div className="grid gap-5 md:grid-cols-2">
        <RadioRoom />
        <div className="flex flex-col gap-5">
          <FoundNotes />
        </div>
      </div>
      <LevelExplorer />
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
