"use client";

import { useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { Sparkles, Disc3, MousePointerClick } from "lucide-react";

// ————— Environment: pearlescent desk still-life — translucent mouse, iridescent CDs, —————
// ————— silver MD player, glitter crystal ball, braided cables, glossy pink light —————

function Sparkle({ x, y, s, d, o = 0.9 }: { x: string; y: string; s: number; d: number; o?: number }) {
  return (
    <svg
      className="y2k-sparkle absolute"
      style={{ left: x, top: y, width: s, height: s, animationDelay: `${d}s` }}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#ffffff" opacity={o} />
    </svg>
  );
}

function CdPlayer() {
  return (
    <svg viewBox="0 0 360 210" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="y2k-pl-body" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fdf9ff" />
          <stop offset="0.4" stopColor="#eee3f6" />
          <stop offset="0.68" stopColor="#d8c9ea" />
          <stop offset="0.88" stopColor="#f4ecf8" />
          <stop offset="1" stopColor="#e6d8f0" />
        </linearGradient>
        <linearGradient id="y2k-pl-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd0ec" stopOpacity="0.55" />
          <stop offset="0.3" stopColor="#fff2c8" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#cdf2de" stopOpacity="0.3" />
          <stop offset="0.78" stopColor="#cfe4ff" stopOpacity="0.34" />
          <stop offset="1" stopColor="#e6d4ff" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* side depth */}
      <rect x="12" y="38" width="330" height="152" rx="26" fill="#c3b0da" opacity="0.85" />
      {/* top face */}
      <rect x="12" y="20" width="330" height="152" rx="26" fill="url(#y2k-pl-body)" stroke="#c2aed8" strokeWidth="1.5" />
      <rect x="12" y="20" width="330" height="152" rx="26" fill="url(#y2k-pl-sheen)" />
      {/* inset top edge highlight */}
      <rect x="20" y="26" width="314" height="8" rx="4" fill="#ffffff" opacity="0.75" />
      {/* key rows (MD remote-style) */}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={`k1-${i}`}>
          <rect x={34 + i * 42} y={46} width={32} height={23} rx={5} fill="#f5eef9" stroke="#c6b4d8" strokeWidth="1.2" />
          <line x1={40 + i * 42} y1={57.5} x2={52 + i * 42} y2={57.5} stroke="#a98fc4" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={`k2-${i}`}>
          <rect x={34 + i * 42} y={76} width={32} height={23} rx={5} fill="#efe4f6" stroke="#c6b4d8" strokeWidth="1.2" />
          <circle cx={50 + i * 42} cy={87.5} r={2.6} fill="#b096cc" />
        </g>
      ))}
      {/* round transport buttons */}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={`r-${i}`} cx={44 + i * 44} cy={118} r={4.6} fill="#e6d8f0" stroke="#b7a0cc" strokeWidth="1.2" />
      ))}
      {/* label */}
      <text x="34" y="146" fontSize="11" letterSpacing="2" fill="#8d76a8" opacity="0.8" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
        MD·WALKMAN MZ-E70
      </text>
      {/* headphone jack + port slots */}
      <circle cx="308" cy="122" r="11" fill="#f2eaf8" stroke="#ab93c4" strokeWidth="1.5" />
      <circle cx="308" cy="122" r="5" fill="#463656" />
      <rect x="236" y="150" width="58" height="11" rx="5" fill="#463656" opacity="0.85" />
      <rect x="300" y="150" width="26" height="11" rx="5" fill="#463656" opacity="0.85" />
      {/* chrome bead */}
      <circle cx="326" cy="34" r="4" fill="#ffffff" stroke="#c0abd8" strokeWidth="1.5" />
    </svg>
  );
}

function HoloMouse() {
  return (
    <svg viewBox="0 0 280 210" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="y2k-m-body" x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#fffdfd" />
          <stop offset="0.3" stopColor="#fbeef8" />
          <stop offset="0.55" stopColor="#eedff6" />
          <stop offset="0.76" stopColor="#dcc9f0" />
          <stop offset="1" stopColor="#f4e6f6" />
        </linearGradient>
        <radialGradient id="y2k-mpink">
          <stop offset="0" stopColor="#ffc2e8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffc2e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="y2k-mblue">
          <stop offset="0" stopColor="#c2dcff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#c2dcff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="y2k-mlav">
          <stop offset="0" stopColor="#b498d8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b498d8" stopOpacity="0" />
        </radialGradient>
        <pattern id="y2k-glitter" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#b9a2d8" />
          <circle cx="1.6" cy="2" r="0.95" fill="#ffffff" opacity="0.95" />
          <circle cx="5" cy="5.2" r="0.85" fill="#f2e6ff" opacity="0.9" />
          <circle cx="3.6" cy="0.9" r="0.6" fill="#ffe4f6" opacity="0.9" />
          <circle cx="6.2" cy="1.8" r="0.5" fill="#ffffff" opacity="0.8" />
        </pattern>
      </defs>
      {/* ground shadow */}
      <ellipse cx="140" cy="192" rx="112" ry="14" fill="#a678b8" opacity="0.3" />
      {/* body */}
      <path
        d="M140 22 C214 22 252 74 252 124 C252 168 204 188 140 188 C76 188 28 168 28 124 C28 74 66 22 140 22 Z"
        fill="url(#y2k-m-body)"
        stroke="#e0c2de"
        strokeWidth="2"
      />
      {/* iridescent bands */}
      <ellipse cx="185" cy="140" rx="85" ry="45" fill="url(#y2k-mpink)" />
      <ellipse cx="72" cy="128" rx="55" ry="38" fill="url(#y2k-mblue)" />
      <ellipse cx="208" cy="152" rx="62" ry="38" fill="url(#y2k-mlav)" />
      {/* button seams */}
      <path d="M140 24 C139 50 139 74 140 94" fill="none" stroke="#d8b8dc" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 100 C104 90 176 90 218 100" fill="none" stroke="#d8b8dc" strokeWidth="2" strokeLinecap="round" />
      {/* scroll wheel: recess + glitter */}
      <rect x="126" y="50" width="28" height="44" rx="14" fill="#c8b0e0" />
      <rect x="130" y="55" width="20" height="32" rx="9.5" fill="url(#y2k-glitter)" stroke="#a488c8" strokeWidth="1.2" />
      {/* speculars */}
      <ellipse cx="92" cy="58" rx="44" ry="24" fill="#ffffff" opacity="0.8" transform="rotate(-16 92 58)" />
      <ellipse cx="196" cy="66" rx="26" ry="12" fill="#ffffff" opacity="0.55" transform="rotate(14 196 66)" />
      <ellipse cx="140" cy="172" rx="78" ry="12" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

function CD({ size, angle, from }: { size: string; angle: number; from: number }) {
  return (
    <div className="relative aspect-square" style={{ width: size, transform: `rotate(${angle}deg)`, filter: "drop-shadow(0 18px 30px rgba(150,80,150,0.35))" }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from ${from}deg, #ffd2ec, #fff2c8 12%, #cdf2de 27%, #cfe6ff 44%, #e6d4ff 60%, #ffcdea 76%, #fff2c8 90%, #ffd2ec)`,
          WebkitMaskImage: "radial-gradient(circle, transparent 0 14%, black 15%)",
          maskImage: "radial-gradient(circle, transparent 0 14%, black 15%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "linear-gradient(#f4eaf8,#cdb8e2)", border: "1.5px solid #b39cc9", boxShadow: "inset 0 1px 2px #ffffff" }}
      >
        <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75" />
      </div>
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(42% 34% at 30% 24%, rgba(255,255,255,0.85), transparent 70%)" }} />
    </div>
  );
}

function GlitterBall() {
  return (
    <div className="ambient-float" style={{ animationDelay: "-2.5s" }}>
      <div className="relative aspect-square" style={{ filter: "drop-shadow(0 16px 22px rgba(140,80,150,0.35))" }}>
        {/* sphere */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 34% 28%, #ffffff 0%, #f4eafc 26%, #dcc8f2 55%, #c2aae0 80%, #e8daf4 100%)" }}
        />
        {/* glitter field */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.95) 0.8px, transparent 1.3px), radial-gradient(rgba(198,168,236,0.9) 0.8px, transparent 1.2px), radial-gradient(rgba(255,255,255,0.85) 0.7px, transparent 1.1px)",
            backgroundSize: "7px 7px, 11px 11px, 17px 17px",
            backgroundPosition: "0 0, 3px 5px, 8px 2px",
            opacity: 0.55,
          }}
        />
        {/* pink bounce light + speculars */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(70% 42% at 50% 102%, rgba(244,168,222,0.55), transparent 72%)" }} />
        <div className="absolute left-[16%] top-[12%] h-[26%] w-[34%] rounded-[50%] bg-white/90 blur-[3px]" />
        <div className="absolute left-[52%] top-[8%] h-[9%] w-[13%] rounded-full bg-white/80 blur-[1px]" />
        {/* glint star */}
        <svg className="y2k-sparkle absolute right-[12%] top-[20%] h-[26%] w-[26%]" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#ffffff" />
        </svg>
      </div>
      {/* clear base disc + shadow */}
      <div
        className="relative -mt-[10%] -ml-[12%] h-[16%] w-[124%] rounded-[50%]"
        style={{ background: "linear-gradient(#f6eefc,#c9b4e0)", border: "1px solid #b39ad2", opacity: 0.94 }}
      />
      <div className="relative -ml-[28%] mt-[3%] h-3 w-[156%] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(140,85,150,0.38), transparent)" }} />
    </div>
  );
}

function Y2KEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* pearl backdrop */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(155deg,#f8ddee 0%,#ecd6f4 36%,#e0c6f0 62%,#f6c6e2 100%)" }} />
      {/* soft white glow behind hero copy */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(58% 46% at 50% 36%, rgba(255,255,255,0.85), rgba(255,255,255,0) 72%)" }} />
      {/* bokeh */}
      <div className="ambient-soft absolute -left-10 top-[30%] h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#fcd8ee,transparent 70%)", animationDelay: "-2s" }} />
      <div className="ambient-float absolute right-[6%] top-[48%] h-80 w-80 rounded-full opacity-45 blur-3xl" style={{ background: "radial-gradient(circle,#dcc4f4,transparent 70%)" }} />
      <div className="ambient-soft absolute left-[38%] top-[4%] h-56 w-56 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle,#fff0fa,transparent 70%)", animationDelay: "-5s" }} />
      {/* holo light streaks */}
      <div
        className="absolute left-[-12%] top-[36%] h-20 w-[75%] opacity-55 blur-md"
        style={{
          background: "linear-gradient(100deg, transparent 5%, #ffd1ec55 28%, #d5c8ff66 52%, #c8ecff55 74%, transparent 95%)",
          backgroundSize: "220% 100%",
          animation: "holo-slide 11s linear infinite",
          transform: "rotate(-14deg)",
        }}
      />
      <div
        className="absolute right-[-10%] top-[12%] h-14 w-[55%] opacity-45 blur-md"
        style={{
          background: "linear-gradient(100deg, transparent, #ffe0f466 35%, #d0e8ff66 65%, transparent)",
          backgroundSize: "220% 100%",
          animation: "holo-slide 9s linear infinite reverse",
          transform: "rotate(12deg)",
        }}
      />
      {/* desk gloss */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background: "linear-gradient(to top, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 55%, transparent)",
          maskImage: "radial-gradient(130% 100% at 50% 100%, black 55%, transparent)",
          WebkitMaskImage: "radial-gradient(130% 100% at 50% 100%, black 55%, transparent)",
        }}
      />
      <div className="absolute bottom-[17%] left-[32%] h-1.5 w-[34%] rounded-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)" }} />
      <div className="absolute bottom-[11%] right-[24%] h-1 w-[22%] rounded-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)" }} />

      {/* silver MD player — top left */}
      <div className="absolute left-[2%] top-[5%] hidden w-[clamp(200px,23vw,330px)] -rotate-6 md:block" style={{ filter: "drop-shadow(0 20px 28px rgba(150,90,160,0.3))" }}>
        <CdPlayer />
      </div>

      {/* iridescent CDs — top right */}
      <div className="absolute right-[3%] top-[6%]">
        <CD size="clamp(110px,13.5vw,190px)" angle={16} from={220} />
      </div>
      <div className="absolute right-[17%] top-[24%] hidden sm:block">
        <CD size="clamp(78px,9vw,130px)" angle={-28} from={80} />
      </div>

      {/* braided cables trailing across the desk */}
      <svg className="absolute bottom-[2%] left-0 h-[26%] w-full" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
        <path d="M-20 128 C140 66 260 70 330 116" fill="none" stroke="#cfc0dc" strokeWidth="9" opacity="0.9" />
        <path d="M-20 128 C140 66 260 70 330 116" fill="none" stroke="#ffffff" strokeWidth="9" strokeDasharray="2.5 4.5" opacity="0.95" />
        <path d="M1000 150 C1140 182 1300 180 1460 126" fill="none" stroke="#cfc0dc" strokeWidth="9" opacity="0.9" />
        <path d="M1000 150 C1140 182 1300 180 1460 126" fill="none" stroke="#ffffff" strokeWidth="9" strokeDasharray="2.5 4.5" opacity="0.95" />
      </svg>

      {/* glitter crystal ball — bottom right */}
      <div className="absolute bottom-[7%] right-[5%] w-[clamp(110px,12vw,170px)]">
        <GlitterBall />
      </div>

      {/* translucent holo mouse — bottom left */}
      <div className="absolute bottom-[8%] left-[9%] w-[clamp(150px,19vw,270px)] -rotate-3">
        <HoloMouse />
      </div>

      {/* sparkles */}
      <Sparkle x="28%" y="18%" s={20} d={0} />
      <Sparkle x="58%" y="12%" s={14} d={-1.2} />
      <Sparkle x="70%" y="40%" s={16} d={-2.1} />
      <Sparkle x="18%" y="46%" s={13} d={-0.6} />
      <Sparkle x="85%" y="28%" s={18} d={-1.7} />
      <Sparkle x="40%" y="64%" s={15} d={-2.6} />
      <Sparkle x="12%" y="70%" s={12} d={-1} />
      <Sparkle x="62%" y="70%" s={17} d={-2.9} />
      <Sparkle x="80%" y="60%" s={13} d={-0.3} />
      <Sparkle x="45%" y="24%" s={11} d={-1.5} o={0.7} />

      {/* pink vignette edges */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 100% at 50% 40%, transparent 60%, rgba(212,146,188,0.24) 100%)" }} />
    </div>
  );
}

// ————— Rotating artifact gallery —————
const ARTIFACTS = [
  { name: "Compact Disc", era: "1982 →", note: "Rainbow diffraction is not paint — it is physics doing product design. The CD's shimmer became the decade's favourite gradient.", grad: "conic-gradient(from 220deg,#ffd2ec,#fff2c8,#cdf2de,#cfe6ff,#e6d4ff,#ffd2ec)" },
  { name: "Translucent Plastic", era: "1998", note: "The iMac G3 made honesty a fashion: you could see the machine's insides, and it seemed proud of them.", grad: "linear-gradient(135deg,#fff6fc66,#f2d2ec66,#dcc8f488)" },
  { name: "Bubble Typography", era: "1997", note: "Inflated letterforms with chrome fills promised a soft landing in the digital future.", grad: "linear-gradient(180deg,#f8fbff,#cfe6f5 30%,#6d8aa8 50%,#f0f6ff 62%,#5a748c 85%,#e8f2fa)" },
  { name: "Aqua Button", era: "2001", note: "Mac OS X's gloss made every clickable thing look like a piece of hard candy.", grad: "radial-gradient(circle at 50% 18%,#fff,#ffb8e2 45%,#a85fb8)" },
  { name: "Braided Cable", era: "2000", note: "Silver weave over copper: even the wires were asked to be jewellery. The braid became the era's signature texture.", grad: "repeating-linear-gradient(45deg,#e8e0f4 0 4px,#b9a8d0 4px 8px)" },
  { name: "Flip Phone", era: "1996+", note: "Communication as origami: the snap of a hinge was the era's most satisfying interface.", grad: "linear-gradient(160deg,#f4ecfa,#c2a8dc 50%,#8a76b8)" },
];

function ArtifactGallery() {
  const [i, setI] = useState(0);
  const a = ARTIFACTS[i];
  return (
    <div className="w-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--w-panel-border)] px-5 py-3">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest opacity-70">
          <Disc3 className="h-4 w-4" /> Collectible artefacts
        </p>
        <span className="text-[11px] opacity-50">{i + 1} / {ARTIFACTS.length}</span>
      </div>
      <div className="p-5">
        <div
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500"
          style={{ background: a.grad, boxShadow: "0 16px 44px -10px #d884c488" }}
          aria-hidden
        />
        <h3 className="mt-4 text-center text-lg font-bold">{a.name} <span className="ml-1 text-[12px] font-normal opacity-50">{a.era}</span></h3>
        <p className="mx-auto mt-2 max-w-md text-center text-[13.5px] leading-relaxed opacity-75">{a.note}</p>
        <div className="mt-4 flex justify-center gap-1.5">
          {ARTIFACTS.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Show artefact ${k + 1}`}
              className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-[var(--w-accent)]" : "w-2 bg-[#3f2856]/25 hover:bg-[#3f2856]/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MaterialExplorer() {
  const materials = [
    { id: "chrome", label: "Chrome", swatch: "linear-gradient(180deg,#f8fbff,#cfe6f5 25%,#6d8aa8 45%,#f0f6ff 55%,#5a748c 78%,#e8f2fa)" },
    { id: "holo", label: "Holographic", swatch: "linear-gradient(100deg,#ffd2ec,#fff2c8,#cdf2de,#cfe6ff,#e6d4ff,#ffd2ec)" },
    { id: "frost", label: "Translucent", swatch: "linear-gradient(135deg,#ffffffaa,#f6dff066,#dcc8f455)" },
    { id: "bubble", label: "Bubblegum", swatch: "radial-gradient(circle at 35% 30%,#fff,#ffb8e2 45%,#d86ab0)" },
    { id: "pearl", label: "Pearl", swatch: "linear-gradient(135deg,#ffffff,#fbeef8 40%,#dcc8f0 75%,#f4e6f6)" },
    { id: "lav", label: "Metallic Lav", swatch: "linear-gradient(135deg,#f0e4fc,#c2a8e2 50%,#8a72c2)" },
  ];
  const [sel, setSel] = useState(materials[0]);
  return (
    <div className="w-panel px-5 py-4">
      <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest opacity-70">
        <MousePointerClick className="h-4 w-4" /> Colour & material explorer
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {materials.map((m) => (
          <button
            key={m.id}
            onClick={() => setSel(m)}
            aria-pressed={sel.id === m.id}
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${sel.id === m.id ? "border-[#8a5fd0]" : "border-transparent"}`}
            style={{ background: m.swatch }}
            aria-label={m.label}
            title={m.label}
          />
        ))}
      </div>
      <div className="mt-4 flex h-16 items-center justify-center rounded-xl border border-[var(--w-panel-border)]" style={{ backgroundImage: sel.swatch, backgroundSize: "200% 100%", animation: "holo-slide 6s linear infinite" }}>
        <span className="text-[13px] font-bold text-[#3f2856]/70 mix-blend-luminosity">{sel.label}</span>
      </div>
    </div>
  );
}

export function Y2KPage() {
  const world = WORLD_MAP.y2k;
  const env = <Y2KEnv />;
  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-2">
      <ArtifactGallery />
      <div className="flex flex-col gap-5">
        <MaterialExplorer />
        <div className="w-panel flex items-start gap-3 px-5 py-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 w-accent" />
          <p className="text-[13.5px] leading-relaxed opacity-80">
            Everything here is tactile and optimistic — chrome you can almost pinch,
            plastic you can almost hear. Y2K futurism differs from its neighbours: where
            Cyberpunk warns and Synthwave mourns, the millennium interface simply
            <em> smiles</em>.
          </p>
        </div>
      </div>
    </div>
  );
  return <WorldPage world={world} environment={env} features={features} />;
}
