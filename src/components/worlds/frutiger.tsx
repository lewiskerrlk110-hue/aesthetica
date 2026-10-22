"use client";

import { useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { Droplets, GlassWater, MousePointerClick } from "lucide-react";

// ————— Environment: glossy aqua utopia — glass towers over a lagoon, —————
// ————— looping water-slide tube, waterfall, drifting rainbow, rising —————
// ————— bubbles, half-submerged CRT, floating CDs, globe, white flowers —————

function Cloud({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <g className="fa-drift" style={{ animationDuration: `${d}s` }} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="86" ry="26" fill="#ffffff" opacity="0.94" />
      <ellipse cx="-38" cy="10" rx="52" ry="20" fill="#ffffff" opacity="0.9" />
      <ellipse cx="42" cy="8" rx="60" ry="22" fill="#ffffff" opacity="0.92" />
      <ellipse cx="8" cy="-16" rx="44" ry="20" fill="#ffffff" opacity="0.95" />
    </g>
  );
}

function Tower({
  x,
  y,
  w,
  h,
  fill,
  mullions = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  mullions?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" />
      {/* left glaze highlight */}
      <rect x={x + 6} y={y + 8} width={w * 0.22} height={h - 20} rx="5" fill="#ffffff" opacity="0.38" />
      {mullions &&
        Array.from({ length: Math.floor(h / 34) }, (_, i) => (
          <line key={i} x1={x + 5} y1={y + 22 + i * 34} x2={x + w - 5} y2={y + 22 + i * 34} stroke="#ffffff" strokeOpacity="0.42" strokeWidth="1.4" />
        ))}
      {/* roof cap */}
      <rect x={x - 5} y={y - 10} width={w + 10} height="14" rx="7" fill="#f4fcff" stroke="#bfe4f4" strokeWidth="1.4" />
    </g>
  );
}

function FrutigerEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ——— SVG water city ——— */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="fa-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3fb2ef" />
            <stop offset="0.45" stopColor="#8ed9f8" />
            <stop offset="1" stopColor="#d9f5fe" />
          </linearGradient>
          <radialGradient id="fa-sun">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#fdfee8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fdfee8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fa-rain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffd9ec" />
            <stop offset="0.3" stopColor="#fff4c9" />
            <stop offset="0.55" stopColor="#d6ffe4" />
            <stop offset="0.8" stopColor="#c9ecff" />
            <stop offset="1" stopColor="#e2d8ff" />
          </linearGradient>
          <linearGradient id="fa-glassA" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#eafaff" />
            <stop offset="0.45" stopColor="#9fdcf6" />
            <stop offset="0.8" stopColor="#57b4e4" />
            <stop offset="1" stopColor="#d2f2fc" />
          </linearGradient>
          <linearGradient id="fa-glassB" x1="0" y1="0" x2="0.75" y2="1">
            <stop offset="0" stopColor="#f6feff" />
            <stop offset="0.5" stopColor="#c2ecfa" />
            <stop offset="1" stopColor="#7cc8ec" />
          </linearGradient>
          <radialGradient id="fa-dome" cx="0.35" cy="0.28" r="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#bdeafc" />
            <stop offset="1" stopColor="#6fc0e8" />
          </radialGradient>
          <linearGradient id="fa-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fe8f6" />
            <stop offset="0.35" stopColor="#4cc0e6" />
            <stop offset="1" stopColor="#1286c2" />
          </linearGradient>
          <linearGradient id="fa-fall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.8" stopColor="#d8f6ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fa-crt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dff6ff" />
            <stop offset="0.5" stopColor="#8ed4f2" />
            <stop offset="1" stopColor="#3f9cd4" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect width="1440" height="900" fill="url(#fa-sky)" />
        {/* sun with lens flare */}
        <circle cx="336" cy="128" r="150" fill="url(#fa-sun)" />
        <circle cx="336" cy="128" r="42" fill="#ffffff" opacity="0.96" />
        <ellipse cx="620" cy="200" rx="150" ry="10" fill="#ffffff" opacity="0.2" transform="rotate(-14 620 200)" />
        <ellipse cx="240" cy="330" rx="110" ry="7" fill="#ffffff" opacity="0.16" transform="rotate(-14 240 330)" />

        {/* drifting clouds */}
        <Cloud x={200} y={130} s={1.15} d={26} />
        <Cloud x={940} y={92} s={0.9} d={32} />
        <Cloud x={1240} y={218} s={1.05} d={22} />
        <Cloud x={660} y={228} s={0.62} d={38} />

        {/* drifting rainbow */}
        <g className="fa-arc">
          <path d="M 130 470 A 600 600 0 0 1 1330 430" fill="none" stroke="url(#fa-rain)" strokeWidth="26" strokeLinecap="round" opacity="0.6" />
          <path d="M 130 470 A 600 600 0 0 1 1330 430" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* distant skyline haze */}
        <g opacity="0.42">
          {[
            [30, 430, 70, 180],
            [120, 400, 54, 220],
            [430, 420, 66, 190],
            [560, 396, 46, 220],
            [880, 410, 60, 200],
            [1000, 388, 48, 226],
            [1390, 430, 56, 180],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#bfe6f8" />
          ))}
        </g>

        {/* ——— main city ——— */}
        {/* left cluster */}
        <Tower x={64} y={330} w={92} h={330} fill="url(#fa-glassB)" />
        <Tower x={182} y={252} w={124} h={408} fill="url(#fa-glassA)" />
        <Tower x={332} y={368} w={84} h={292} fill="url(#fa-glassB)" />
        {/* palm between towers */}
        <g transform="translate(300 640)">
          <path d="M0 0 C -4 -30 -2 -58 4 -78" fill="none" stroke="#2f8a68" strokeWidth="7" strokeLinecap="round" />
          {[-52, -24, 8, 36, 58].map((a, i) => (
            <path key={i} d="M4 -78 q 26 -18 52 -4 q -26 -6 -50 10" fill="#3fa476" transform={`rotate(${a} 4 -78)`} />
          ))}
        </g>
        {/* mid tower with waterfall ledge */}
        <Tower x={700} y={318} w={116} h={342} fill="url(#fa-glassA)" />
        <rect x={686} y={548} width={144} height="16" rx="8" fill="#eefaff" stroke="#a8d8ee" strokeWidth="1.5" />
        {/* dome building */}
        <g>
          <rect x={492} y={476} width={150} height={184} rx="8" fill="url(#fa-glassB)" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
          <ellipse cx="567" cy="478" rx="88" ry="66" fill="url(#fa-dome)" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" />
          <path d="M 500 460 A 88 66 0 0 1 634 460" fill="none" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" />
          <ellipse cx="567" cy="478" rx="88" ry="22" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.6" />
          <line x1="567" y1="412" x2="567" y2="544" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.6" />
        </g>
        {/* tall 'future' tower, right */}
        <Tower x={1120} y={128} w={132} h={544} fill="url(#fa-glassA)" />
        <g>
          <rect x={1152} y={158} width={70} height={26} rx="6" fill="#ffffff" opacity="0.92" />
          <text x="1187" y="176" textAnchor="middle" fontSize="14" fill="#1fa7e8" style={{ fontWeight: 700, letterSpacing: 1 }}>
            future
          </text>
        </g>
        <Tower x={1282} y={330} w={96} h={342} fill="url(#fa-glassB)" />
        <Tower x={988} y={382} w={86} h={290} fill="url(#fa-glassB)" />
        {/* palms right */}
        <g transform="translate(1088 652)">
          <path d="M0 0 C 3 -26 2 -50 -3 -70" fill="none" stroke="#2f8a68" strokeWidth="6" strokeLinecap="round" />
          {[-48, -20, 10, 40, 62].map((a, i) => (
            <path key={i} d="M-3 -70 q 24 -16 48 -3 q -24 -5 -46 9" fill="#3fa476" transform={`rotate(${a} -3 -70)`} />
          ))}
        </g>

        {/* ——— water-slide tube: from mid-tower ledge looping over the right towers ——— */}
        <g fill="none" strokeLinecap="round">
          <path d="M 806 552 C 900 430 1010 400 1105 452 C 1196 502 1188 592 1096 610 C 1022 624 972 578 994 520 C 1014 468 1092 470 1112 520" stroke="#7cc8e8" strokeOpacity="0.35" strokeWidth="36" />
          <path d="M 806 552 C 900 430 1010 400 1105 452 C 1196 502 1188 592 1096 610 C 1022 624 972 578 994 520 C 1014 468 1092 470 1112 520" stroke="#eafcff" strokeOpacity="0.6" strokeWidth="28" />
          <path d="M 806 552 C 900 430 1010 400 1105 452 C 1196 502 1188 592 1096 610 C 1022 624 972 578 994 520 C 1014 468 1092 470 1112 520" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="7" strokeDasharray="16 40" className="fa-flow" />
        </g>
        {/* short slide off the left tower */}
        <g fill="none" strokeLinecap="round">
          <path d="M 238 262 C 320 208 380 214 402 280 C 416 322 386 352 350 340" stroke="#7cc8e8" strokeOpacity="0.32" strokeWidth="26" />
          <path d="M 238 262 C 320 208 380 214 402 280 C 416 322 386 352 350 340" stroke="#eafcff" strokeOpacity="0.55" strokeWidth="19" />
          <path d="M 238 262 C 320 208 380 214 402 280 C 416 322 386 352 350 340" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="5.5" strokeDasharray="12 32" className="fa-flow" style={{ animationDuration: "2.4s" }} />
        </g>

        {/* waterfall off the mid-tower ledge */}
        <rect x={742} y={564} width="34" height="150" fill="url(#fa-fall)" />
        {[-9, 2, 11].map((dx, i) => (
          <line key={i} x1={758 + dx} y1="566" x2={758 + dx} y2="708" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="18 22" className="fa-flow" opacity="0.85" style={{ animationDuration: `${1.6 + i * 0.35}s` }} />
        ))}

        {/* ——— lagoon ——— */}
        <rect x="0" y="560" width="1440" height="340" fill="url(#fa-water)" />
        <rect x="0" y="558" width="1440" height="6" fill="#ffffff" opacity="0.55" />
        {/* tower reflections */}
        {[
          [150, 110],
          [640, 90],
          [1180, 130],
        ].map(([x, w], i) => (
          <rect key={i} x={x} y={566} width={w} height={210} fill="#ffffff" opacity="0.13" rx="10" />
        ))}
        {/* shimmer bars */}
        {[
          [90, 620, 130],
          [300, 668, 90],
          [520, 640, 150],
          [760, 692, 100],
          [940, 622, 130],
          [1160, 668, 110],
          [1320, 712, 90],
          [420, 760, 120],
          [880, 782, 140],
        ].map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height="7" rx="3.5" fill="#ffffff" className="fa-shimmer" opacity="0.4" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
        {/* pooled splash at waterfall base */}
        <ellipse cx="759" cy="716" rx="52" ry="12" fill="#ffffff" opacity="0.55" />
        <ellipse cx="759" cy="716" rx="86" ry="18" fill="#ffffff" opacity="0.2" />

        {/* signs: dream + water slide poles, welcome board */}
        <g className="fa-bob">
          <line x1="212" y1="598" x2="212" y2="668" stroke="#e8f6fc" strokeWidth="7" />
          <rect x="164" y="560" width="96" height="44" rx="8" fill="#ffffff" stroke="#bfe4f4" strokeWidth="2" />
          <text x="212" y="588" textAnchor="middle" fontSize="19" fill="#38a8dc" style={{ fontStyle: "italic", fontWeight: 600 }}>
            dream
          </text>
        </g>
        <g className="fa-bob" style={{ animationDelay: "-2.2s" }}>
          <line x1="1052" y1="592" x2="1052" y2="664" stroke="#e8f6fc" strokeWidth="7" />
          <rect x="986" y="552" width="132" height="42" rx="8" fill="#2fa6de" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2" />
          <text x="1052" y="579" textAnchor="middle" fontSize="15" fill="#ffffff" style={{ fontWeight: 700, letterSpacing: 0.5 }}>
            water slide →
          </text>
        </g>
        <g className="fa-bob" style={{ animationDelay: "-4s" }}>
          <rect x="1096" y="682" width="168" height="52" rx="10" fill="#ffffff" stroke="#cfeaf6" strokeWidth="2.5" />
          <text x="1180" y="704" textAnchor="middle" fontSize="13" fill="#2f98cc" style={{ fontWeight: 700 }}>
            Welcome to
          </text>
          <text x="1180" y="723" textAnchor="middle" fontSize="15" fill="#1f88be" style={{ fontWeight: 800 }}>
            Paradise
          </text>
        </g>

        {/* ——— half-submerged CRT monitor, bottom left ——— */}
        <g transform="translate(96 616) rotate(-4)">
          <rect x="0" y="0" width="300" height="240" rx="26" fill="#f2f7fa" stroke="#c2d2dc" strokeWidth="3" />
          <rect x="24" y="22" width="252" height="168" rx="12" fill="#1f6f9e" />
          <rect x="30" y="28" width="240" height="156" rx="9" fill="url(#fa-crt)" />
          {/* screen content: glossy taskbar + window */}
          <rect x="30" y="28" width="240" height="24" rx="9" fill="#1fa7e8" opacity="0.85" />
          <circle cx="44" cy="40" r="5" fill="#7fe0c0" />
          <rect x="58" y="36" width="70" height="8" rx="4" fill="#ffffff" opacity="0.85" />
          <rect x="52" y="70" width="150" height="74" rx="8" fill="#ffffff" opacity="0.88" />
          <rect x="62" y="82" width="90" height="9" rx="4" fill="#9fd8f0" />
          <rect x="62" y="98" width="120" height="6" rx="3" fill="#c2e8f6" />
          <rect x="62" y="110" width="104" height="6" rx="3" fill="#c2e8f6" />
          <rect x="62" y="122" width="112" height="6" rx="3" fill="#c2e8f6" />
          {/* screen glass glare */}
          <path d="M30 184 L120 28 L190 28 L78 184 Z" fill="#ffffff" opacity="0.22" />
          <rect x="24" y="22" width="252" height="168" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
          {/* stand */}
          <rect x="120" y="240" width="60" height="26" rx="8" fill="#dce8ee" />
          <rect x="92" y="264" width="116" height="14" rx="7" fill="#c8d8e0" />
          {/* gloss on case */}
          <rect x="10" y="10" width="120" height="12" rx="6" fill="#ffffff" opacity="0.75" />
        </g>
      </svg>

      {/* ——— semi-transparent foreground water band (submersion) ——— */}
      <div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ background: "linear-gradient(to top, rgba(18,134,194,0.5), rgba(76,192,230,0.22) 55%, transparent)" }} />

      {/* ——— DOM foreground: bubbles, CDs, globe, flowers ——— */}
      <FaBubbles />
      <div className="absolute right-[4%] top-[8%]">
        <FaCD size="clamp(90px,11vw,170px)" angle={18} from={200} />
      </div>
      <div className="absolute right-[16%] top-[30%] hidden sm:block">
        <FaCD size="clamp(64px,7.5vw,120px)" angle={-24} from={40} />
      </div>
      <div className="absolute bottom-[9%] right-[7%] w-[clamp(110px,12vw,180px)]">
        <FaGlobe />
      </div>
      <FaFlower className="bottom-[4%] left-[30%] w-[clamp(46px,5vw,84px)]" delay={0} />
      <FaFlower className="bottom-[16%] right-[24%] w-[clamp(38px,4vw,64px)]" delay={-3} />
      <FaFlower className="top-[6%] left-[38%] w-[clamp(34px,3.4vw,56px)]" delay={-1.6} />

      {/* soft light sweeps */}
      <div
        className="absolute left-[-10%] top-[30%] h-24 w-[70%] opacity-35 blur-md"
        style={{ background: "linear-gradient(100deg, transparent, #ffffff77 40%, #d8f6ff88 60%, transparent)", backgroundSize: "220% 100%", animation: "holo-slide 12s linear infinite", transform: "rotate(-10deg)" }}
      />
      {/* bright white vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(125% 105% at 50% 38%, transparent 58%, rgba(255,255,255,0.4) 100%)" }} />
    </div>
  );
}

// ————— DOM bubbles —————
const BUBBLES = [
  { l: 6, s: 26, d: 11, delay: -2, sway: 22 },
  { l: 12, s: 14, d: 8, delay: -6, sway: -14 },
  { l: 22, s: 40, d: 14, delay: -4, sway: 18 },
  { l: 31, s: 12, d: 7.5, delay: -1, sway: -20 },
  { l: 38, s: 30, d: 12, delay: -8, sway: 16 },
  { l: 46, s: 18, d: 9, delay: -3.4, sway: -12 },
  { l: 55, s: 46, d: 16, delay: -10, sway: 26 },
  { l: 63, s: 15, d: 8.4, delay: -5.2, sway: -18 },
  { l: 70, s: 28, d: 11.4, delay: -7, sway: 14 },
  { l: 77, s: 12, d: 7, delay: -0.8, sway: -22 },
  { l: 84, s: 34, d: 13, delay: -9, sway: 20 },
  { l: 91, s: 20, d: 9.6, delay: -2.6, sway: -16 },
  { l: 96, s: 15, d: 8.8, delay: -6.6, sway: 12 },
  { l: 17, s: 10, d: 6.4, delay: -4.8, sway: -10 },
  { l: 59, s: 10, d: 6.8, delay: -8.8, sway: 10 },
  { l: 43, s: 9, d: 6.2, delay: -1.6, sway: -8 },
];

function FaBubbles() {
  return (
    <div className="absolute inset-0" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="fa-bubble absolute rounded-full"
          style={{
            left: `${b.l}%`,
            bottom: "-8%",
            width: b.s,
            height: b.s,
            animationDuration: `${b.d}s`,
            animationDelay: `${b.delay}s`,
            ["--sway" as string]: `${b.sway}px`,
          }}
        />
      ))}
    </div>
  );
}

// ————— Iridescent CD —————
function FaCD({ size, angle, from }: { size: string; angle: number; from: number }) {
  return (
    <div className="ambient-float relative aspect-square" style={{ width: size, transform: `rotate(${angle}deg)`, filter: "drop-shadow(0 16px 26px rgba(20,110,160,0.4))", animationDelay: "-3s" }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from ${from}deg, #ffd2ec, #fff2c8 12%, #cdf2de 27%, #cfe6ff 44%, #e6d4ff 60%, #ffcdea 76%, #fff2c8 90%, #ffd2ec)`,
          WebkitMaskImage: "radial-gradient(circle, transparent 0 15%, black 16%)",
          maskImage: "radial-gradient(circle, transparent 0 15%, black 16%)",
          opacity: 0.94,
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(#ffffff,#bfe4f4)", border: "1.5px solid #8cc8e4" }} />
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(40% 32% at 30% 24%, rgba(255,255,255,0.9), transparent 70%)" }} />
    </div>
  );
}

// ————— Floating globe —————
function FaGlobe() {
  return (
    <div className="ambient-float" style={{ animationDelay: "-6s" }}>
      <div className="relative aspect-square" style={{ filter: "drop-shadow(0 14px 22px rgba(16,100,150,0.45))" }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 26%, #ffffff 0%, #d8f4fe 18%, #7fd4f2 42%, #2f9fd8 72%, #6fc4e8 100%), radial-gradient(circle at 62% 42%, #7fd068 0 12%, transparent 13%), radial-gradient(circle at 40% 62%, #66c858 0 9%, transparent 10%), radial-gradient(circle at 74% 68%, #8ad878 0 7%, transparent 8%)",
          }}
        />
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 68% 74%, rgba(6,60,96,0.4), transparent 52%)" }} />
        <div className="absolute left-[14%] top-[10%] h-[24%] w-[32%] rounded-[50%] bg-white/90 blur-[3px]" />
        <div className="absolute left-[52%] top-[16%] h-[8%] w-[12%] rounded-full bg-white/85 blur-[1px]" />
      </div>
      <div className="relative -ml-[30%] mt-[2%] h-2.5 w-[160%] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(10,80,130,0.35), transparent)" }} />
    </div>
  );
}

// ————— White flower —————
function FaFlower({ className, delay }: { className: string; delay: number }) {
  return (
    <svg viewBox="0 0 100 100" className={`ambient-float absolute ${className}`} style={{ animationDelay: `${delay}s` }} aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx="50" cy="26" rx="13" ry="24" fill="#ffffff" opacity="0.95" transform={`rotate(${i * 60} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="12" fill="#ffe8a8" />
      <circle cx="50" cy="50" r="7" fill="#ffd068" />
    </svg>
  );
}

// ————— Interactive: Bubble Bay — pop the utopia before it evaporates —————
interface TankBubble {
  id: number;
  x: number;
  s: number;
  dur: number;
  delay: number;
}

let bubbleSeq = 0;
function spawnBubble(prevX?: number): TankBubble {
  let x = Math.random() * 84 + 4;
  if (prevX !== undefined && Math.abs(x - prevX) < 12) x = (x + 40) % 88 + 4;
  return {
    id: ++bubbleSeq,
    x,
    s: 18 + Math.random() * 40,
    dur: 5.5 + Math.random() * 5,
    delay: 0,
  };
}

function BubbleBay() {
  const [popped, setPopped] = useState(0);
  const [bubbles, setBubbles] = useState<TankBubble[]>(() => Array.from({ length: 9 }, () => spawnBubble()));

  const pop = (b: TankBubble) => {
    setPopped((p) => p + 1);
    setBubbles((list) => list.map((x) => (x.id === b.id ? spawnBubble(b.x) : x)));
  };

  return (
    <div className="w-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--w-panel-border)] px-5 py-3">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest opacity-70">
          <Droplets className="h-4 w-4" /> Bubble Bay
        </p>
        <span className="rounded-full px-3 py-0.5 text-[12px] font-bold" style={{ background: "var(--w-accent)", color: "#ffffff" }}>
          {popped} popped
        </span>
      </div>
      <div className="relative h-64 overflow-hidden" style={{ background: "linear-gradient(#c9f0fc, #7fd4f0 55%, #2f9fd8)" }}>
        {/* tank shimmer */}
        <div className="absolute left-[8%] top-[12%] h-16 w-24 rotate-6 rounded-full bg-white/30 blur-md" />
        <div className="absolute right-[12%] top-[40%] h-12 w-20 -rotate-6 rounded-full bg-white/20 blur-md" />
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b)}
            aria-label="Pop the bubble"
            className="fa-tank-bubble absolute bottom-[-24%] rounded-full transition-transform hover:scale-110"
            style={{
              left: `${b.x}%`,
              width: b.s,
              height: b.s,
              animationDuration: `${b.dur}s`,
              background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.98), rgba(230,248,255,0.5) 42%, rgba(160,220,248,0.22) 72%)",
              boxShadow: "inset 0 -3px 8px rgba(255,255,255,0.7), 0 2px 8px rgba(20,110,160,0.25)",
              border: "1px solid rgba(255,255,255,0.75)",
            }}
            onAnimationEnd={() => setBubbles((list) => list.map((x) => (x.id === b.id ? spawnBubble(b.x) : x)))}
          />
        ))}
        <p className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11.5px] font-medium text-white/85">
          click a bubble — the utopia regenerates them forever
        </p>
      </div>
    </div>
  );
}

// ————— Interactive: Aqua surface lab —————
function GlossLab() {
  const materials = [
    { id: "glass", label: "Aqua Glass", swatch: "linear-gradient(160deg,#eafaff,#9fdcf6 45%,#3fa8dc)" },
    { id: "drop", label: "Water Droplet", swatch: "radial-gradient(circle at 32% 30%, #ffffff, #bfe8fa 40%, #2f9fd8)" },
    { id: "btn", label: "Gloss Button", swatch: "linear-gradient(#ffffff, #cfeeff 46%, #58b8e8 54%, #d8f2fc)" },
    { id: "flare", label: "Lens Flare", swatch: "radial-gradient(circle, #ffffff, #cfeeff66 45%, transparent 72%)" },
    { id: "grass", label: "Fresh Grass", swatch: "linear-gradient(160deg,#e0f8c8,#7fd068 55%,#3f9a48)" },
    { id: "aurora", label: "Aurora Sheen", swatch: "linear-gradient(100deg,#c8f0ff,#e8d8ff,#d8ffe8,#c8f0ff)" },
  ];
  const [sel, setSel] = useState(materials[0]);
  return (
    <div className="w-panel px-5 py-4">
      <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest opacity-70">
        <MousePointerClick className="h-4 w-4" /> Aqua surface lab
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {materials.map((m) => (
          <button
            key={m.id}
            onClick={() => setSel(m)}
            aria-pressed={sel.id === m.id}
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${sel.id === m.id ? "border-[var(--w-accent)]" : "border-transparent"}`}
            style={{ background: m.swatch }}
            aria-label={m.label}
            title={m.label}
          />
        ))}
      </div>
      <div className="mt-4 flex h-16 items-center justify-center rounded-xl border border-[var(--w-panel-border)]" style={{ backgroundImage: sel.swatch, backgroundSize: "200% 100%", animation: "holo-slide 6s linear infinite" }}>
        <span className="text-[13px] font-bold text-[#0d4a70]/70 mix-blend-luminosity">{sel.label}</span>
      </div>
    </div>
  );
}

export function FrutigerPage() {
  const world = WORLD_MAP.frutiger;
  const env = <FrutigerEnv />;
  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-2">
      <BubbleBay />
      <div className="flex flex-col gap-5">
        <GlossLab />
        <div className="w-panel flex items-start gap-3 px-5 py-4">
          <GlassWater className="mt-0.5 h-4 w-4 shrink-0 w-accent" />
          <p className="text-[13.5px] leading-relaxed opacity-80">
            Frutiger Aero is the successor to Y2K optimism: where the millennium interface
            smiled in translucent plastic, the aero era wrapped the machine in rainforests,
            lagoons and glass. Technology was no longer a toy — it was a spa, and every
            desktop wallpaper promised the future would be <em>clean</em>.
          </p>
        </div>
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
