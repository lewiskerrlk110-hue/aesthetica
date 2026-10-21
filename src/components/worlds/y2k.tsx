"use client";

import { useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { Sparkles, Disc3, MousePointerClick } from "lucide-react";

// ————— Environment: holo gradients, floating chrome, translucent panels —————
function Y2KEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#0f1420 0%,#16213a 40%,#2c3a68 75%,#9be8ff44 100%)" }} />
      {/* holo bands */}
      <div className="absolute inset-x-0 top-[8%] h-40 opacity-30" style={{ background: "linear-gradient(100deg,#9be8ff22,#ffb3e655,#d9b8ff44,#9be8ff22)", animation: "holo-slide 8s linear infinite", backgroundSize: "220% 100%" }} />
      {/* chrome orbs */}
      <div className="ambient-float absolute left-[10%] top-[20%] h-16 w-16 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%,#fff,#bfe3fb 34%,#7f9fc4 64%,#e8f4ff 84%,#9be8ff)", boxShadow: "0 14px 44px -8px #9be8ff88" }} />
      <div className="ambient-soft absolute right-[14%] top-[30%] h-10 w-10 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%,#fff,#ffd9f0 34%,#c77fb8 70%,#ffe8f6)", animationDelay: "-3s" }} />
      <div className="ambient-float absolute bottom-[26%] left-[22%] h-8 w-8 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%,#fff,#b8f4ff 30%,#5aa8c8 68%,#e0f8ff)", animationDelay: "-5s" }} />
      {/* big translucent panels */}
      <div className="absolute right-[6%] top-[16%] hidden w-56 rounded-2xl border border-white/25 bg-white/8 p-4 backdrop-blur-md lg:block" style={{ boxShadow: "0 20px 50px -18px #9be8ff55" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">System</p>
        <p className="mt-1 font-[var(--font-outfit)] text-[13px] text-white/85">All systems optimistic</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#9be8ff] to-[#ffb3e6]" />
        </div>
        <p className="mt-1.5 text-[10px] text-white/50">millennium readiness 80%</p>
      </div>
      {/* liquid ripple base */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] opacity-60" style={{ background: "linear-gradient(to top,#9be8ff33,transparent)", maskImage: "radial-gradient(120% 100% at 50% 100%, black 40%, transparent)", WebkitMaskImage: "radial-gradient(120% 100% at 50% 100%, black 40%, transparent)" }} />
      {/* floating CD */}
      <div className="ambient-spin absolute bottom-[30%] right-[24%] h-14 w-14 rounded-full" style={{ background: "conic-gradient(#ff9ecb,#9be8ff,#d9b8ff,#a8f0d8,#ff9ecb)", maskImage: "radial-gradient(circle, transparent 28%, black 30%)", WebkitMaskImage: "radial-gradient(circle, transparent 28%, black 30%)", boxShadow: "0 0 30px -6px #ffb3e688" }} />
    </div>
  );
}

// ————— Rotating artifact gallery —————
const ARTIFACTS = [
  { name: "Compact Disc", era: "1982 →", note: "Rainbow diffraction is not paint — it is physics doing product design. The CD's shimmer became the decade's favourite gradient.", grad: "conic-gradient(#ff9ecb,#9be8ff,#d9b8ff,#a8f0d8,#ff9ecb)" },
  { name: "Translucent Plastic", era: "1998", note: "The iMac G3 made honesty a fashion: you could see the machine's insides, and it seemed proud of them.", grad: "linear-gradient(135deg,#bfe3fb66,#ffb3e666,#9be8ff88)" },
  { name: "Bubble Typography", era: "1997", note: "Inflated letterforms with chrome fills promised a soft landing in the digital future.", grad: "linear-gradient(180deg,#f8fbff,#cfe6f5 30%,#6d8aa8 50%,#f0f6ff 62%,#5a748c 85%,#e8f2fa)" },
  { name: "Aqua Button", era: "2001", note: "Mac OS X's gloss made every clickable thing look like a piece of hard candy.", grad: "radial-gradient(circle at 50% 18%,#fff,#9be8ff 45%,#2a6a9a)" },
  { name: "Flip Phone", era: "1996+", note: "Communication as origami: the snap of a hinge was the era's most satisfying interface.", grad: "linear-gradient(160deg,#e8f4ff,#9bb8d8 50%,#5a7ea8)" },
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
          style={{ background: a.grad, boxShadow: "0 16px 44px -10px #9be8ff88" }}
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
              className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-[var(--w-accent)]" : "w-2 bg-white/25 hover:bg-white/50"}`}
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
    { id: "holo", label: "Holographic", swatch: "linear-gradient(100deg,#9be8ff,#ffb3e6,#d9b8ff,#a8f0d8,#9be8ff)" },
    { id: "frost", label: "Translucent", swatch: "linear-gradient(135deg,#ffffff88,#bfe3fb66,#9be8ff55)" },
    { id: "bubble", label: "Bubblegum", swatch: "radial-gradient(circle at 35% 30%,#fff,#ffb3e6 45%,#e26fa8)" },
    { id: "turq", label: "Turquoise", swatch: "linear-gradient(135deg,#d8fbff88,#9be8ff99,#5ac8d8cc)" },
    { id: "lav", label: "Metallic Lav", swatch: "linear-gradient(135deg,#e8d8ff,#b8a0e8 50%,#8878c8)" },
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
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${sel.id === m.id ? "border-white" : "border-transparent"}`}
            style={{ background: m.swatch }}
            aria-label={m.label}
            title={m.label}
          />
        ))}
      </div>
      <div className="mt-4 flex h-16 items-center justify-center rounded-xl border border-[var(--w-panel-border)]" style={{ background: sel.swatch, backgroundSize: "200% 100%", animation: "holo-slide 6s linear infinite" }}>
        <span className="text-[13px] font-bold text-black/70 mix-blend-luminosity">{sel.label}</span>
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
