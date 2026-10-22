"use client";

import { useEffect, useState, useRef } from "react";
import { HeroCanvas } from "./hero-canvas";
import { useApp } from "@/lib/store";
import { WORLD_MAP, type WorldId } from "@/lib/aesthetics";
import { useStudioWorlds, useStudioConfig } from "@/lib/worlds-config";
import type { PortalWorldDef } from "@/lib/studio";
import { SceneStage } from "@/components/worlds/custom-world";
import { ArtworkCard, type ArtworkDTO } from "@/components/gallery/artwork-card";
import { ArrowRight, Search, Upload, Compass, ChevronDown } from "lucide-react";

// ————— Portal mini-scenes (pure CSS/SVG, one per world) —————
// NOTE: each case mirrors its world page's living environment. Whenever a
// world is restyled (new reference look), update its case here too so the
// homepage portal card stays in sync with the world page.
function PortalScene({ w }: { w: PortalWorldDef }) {
  const common = "absolute inset-0";
  switch (w.id) {
    case "retrowave":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(#1a0a2e 0%, #54123f 55%, ${w.accent} 100%)` }} />
          <div className="absolute left-1/2 top-[30%] h-14 w-14 -translate-x-1/2 rounded-full" style={{ background: `linear-gradient(#ffe6a0,${w.accent})`, boxShadow: `0 0 34px 6px ${w.accent}` }} />
          {/* distant city silhouette with amber lights (matches page canvas) */}
          {[4, 12, 21, 33, 58, 69, 79, 90].map((l, i) => (
            <div key={i} className="absolute" style={{ left: `${l}%`, bottom: "45%", width: "8%", height: `${8 + ((i * 29) % 18)}%`, background: "rgba(12,4,26,0.9)" }} />
          ))}
          {[9, 20, 37, 62, 74, 86, 95].map((l, i) => (
            <div key={`l${i}`} className="absolute h-[2px] w-[2px] bg-[#ffb347]" style={{ left: `${l}%`, bottom: `${47 + ((i * 17) % 15)}%`, opacity: 0.75 }} />
          ))}
          <svg className="absolute bottom-0 h-[45%] w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={50 + (i - 4) * 22} y1="0" x2={50 + (i - 4) * 110} y2="40" stroke={w.accent} strokeWidth="0.5" opacity="0.8" />)}
            {[2, 6, 12, 22, 40].map((y, i) => <line key={i} x1="0" y1={y} x2="100" y2={y} stroke={w.accent2} strokeWidth="0.4" opacity="0.8" />)}
            <rect x="0" y="0" width="100" height="7" fill="#ff2e88" opacity="0.22" />
          </svg>
        </div>
      );
    case "synthwave":
      return (
        <div className={common}>
          {/* sky — deep purple falling into hot magenta (page SynthEnv, classic mood) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(#2b0a4d 0%, #d61c95 58%, #ff5ad4 100%)" }} />
          {[8, 20, 33, 47, 62, 78, 90].map((l, i) => (
            <div key={`s${i}`} className="absolute h-[2px] w-[2px] bg-[#ffeaff]" style={{ left: `${l}%`, top: `${4 + ((i * 23) % 20)}%`, opacity: 0.5 + ((i * 13) % 4) * 0.12 }} />
          ))}
          {/* the sun — white-hot core, widening stripe cuts */}
          <svg className="absolute left-1/2 top-[5%] h-[56%] w-auto -translate-x-1/2" viewBox="0 0 200 200" aria-hidden>
            <defs>
              <radialGradient id="pv-sw-sun" cx="0.5" cy="0.3" r="0.85">
                <stop offset="0" stopColor="#fff6fd" />
                <stop offset="0.45" stopColor="#ff5ad4" />
                <stop offset="1" stopColor="#d61c95" />
              </radialGradient>
              <mask id="pv-sw-mask">
                <rect width="200" height="200" fill="#fff" />
                <rect x="0" y="116" width="200" height="6" fill="#000" />
                <rect x="0" y="134" width="200" height="8" fill="#000" />
                <rect x="0" y="154" width="200" height="11" fill="#000" />
                <rect x="0" y="177" width="200" height="14" fill="#000" />
              </mask>
            </defs>
            <circle cx="100" cy="100" r="96" fill="url(#pv-sw-sun)" mask="url(#pv-sw-mask)" />
          </svg>
          {/* skyline silhouettes with lit windows */}
          {[[5, 8, 12], [14, 6, 9], [22, 9, 16], [58, 7, 13], [67, 9, 17], [79, 6, 10], [88, 8, 14]].map(([l, wp, hp], i) => (
            <div key={`b${i}`} className="absolute" style={{ left: `${l}%`, bottom: "38%", width: `${wp}%`, height: `${hp}%`, background: "rgba(34,8,63,0.92)" }}>
              <div className="absolute left-[28%] top-[30%] h-[3px] w-[3px]" style={{ background: i % 2 ? "#7de8ff" : "#ff5ad4", boxShadow: `0 0 4px ${i % 2 ? "#7de8ff" : "#ff5ad4"}` }} />
              {i % 3 === 0 && <div className="absolute left-[62%] top-[58%] h-[3px] w-[3px] bg-[#ff5ad4]" style={{ boxShadow: "0 0 4px #ff5ad4" }} />}
            </div>
          ))}
          {/* ground, perspective grid + neon road with streaming dashes */}
          <svg className="absolute bottom-0 h-[38%] w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <rect width="100" height="40" fill="#08010f" />
            <rect width="100" height="8" fill="#ff5ad4" opacity="0.35" />
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`v${i}`} x1={50 + (i - 6) * 1.8} y1="0" x2={50 + (i - 6) * 9.5} y2="40" stroke="#ff4fd8" strokeWidth="0.35" opacity="0.55" />
            ))}
            {[1, 3, 7, 14, 26].map((y, i) => (
              <line key={`h${i}`} x1="0" y1={y} x2="100" y2={y} stroke="#ff4fd8" strokeWidth="0.3" opacity="0.45" />
            ))}
            <line x1="47.6" y1="0" x2="17" y2="40" stroke="#ff5ad4" strokeWidth="0.9" opacity="0.95" />
            <line x1="52.4" y1="0" x2="83" y2="40" stroke="#ff5ad4" strokeWidth="0.9" opacity="0.95" />
            {[[50, 2, 1.6], [50, 5.5, 2.4], [50, 11, 3.6], [50, 19, 5], [50, 30, 6.5]].map(([x, y, hh], i) => (
              <rect key={`d${i}`} x={x - 0.5} y={y} width="1" height={hh} fill="#ff5ad4" opacity="0.9" />
            ))}
          </svg>
          {/* two cruisers holding their lanes (page positions 57.4% / 44.8%) */}
          <div className="absolute" style={{ left: "57.4%", bottom: "9%", width: 30, transform: "translateX(-50%)" }}>
            <div className="h-[7px] rounded-t-[3px] bg-[#12031f]" style={{ boxShadow: "0 2px 6px rgba(255,46,200,0.85)", borderBottom: "1.5px solid #ff2ec8" }}>
              <div className="mx-auto mt-[1px] h-[2.5px] w-3/5 rounded-t-sm bg-[#ff77e0]/50" />
            </div>
          </div>
          <div className="absolute" style={{ left: "44.8%", bottom: "21%", width: 24, transform: "translateX(-50%)" }}>
            <div className="h-[6px] rounded-t-[3px] bg-[#12031f]" style={{ boxShadow: "0 2px 5px rgba(35,230,255,0.8)", borderBottom: "1.5px solid #23e6ff" }}>
              <div className="mx-auto mt-[1px] h-[2px] w-3/5 rounded-t-sm bg-[#7de8ff]/50" />
            </div>
          </div>
        </div>
      );
    case "vaporwave":
      return (
        <div className={common}>
          {/* sunset sky + banded sun (page VaporEnv) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#7b4fb0 0%,#a86fd0 34%,#dfa0da 58%,#f6c1dd 82%)" }} />
          <svg className="absolute left-1/2 top-[7%] h-[40%] w-auto -translate-x-1/2" viewBox="0 0 200 200" aria-hidden style={{ filter: "drop-shadow(0 0 14px #ff9ed288)" }}>
            <defs>
              <radialGradient id="pv-vp-sun" cx="0.42" cy="0.36" r="0.75">
                <stop offset="0" stopColor="#ffe0f0" />
                <stop offset="0.55" stopColor="#ffa8d8" />
                <stop offset="1" stopColor="#ef74be" />
              </radialGradient>
              <mask id="pv-vp-mask">
                <rect width="200" height="200" fill="#fff" />
                <rect x="0" y="118" width="200" height="9" fill="#000" />
                <rect x="0" y="139" width="200" height="11" fill="#000" />
                <rect x="0" y="162" width="200" height="13" fill="#000" />
                <rect x="0" y="187" width="200" height="13" fill="#000" />
              </mask>
            </defs>
            <circle cx="100" cy="100" r="88" fill="url(#pv-vp-sun)" mask="url(#pv-vp-mask)" />
          </svg>
          {/* wireframe mountains */}
          <svg className="absolute inset-x-0 bottom-[30%] h-[24%] w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M0 20 L12 8 L24 17 L38 5 L52 16 L64 9 L78 18 L90 10 L100 17" fill="#4a2f86" fillOpacity="0.5" stroke="#5d3f9e" strokeWidth="0.6" />
            <path d="M0 26 L15 18 L30 25 L48 15 L64 24 L80 17 L100 23 L100 30 L0 30 Z" fill="#3a2470" fillOpacity="0.65" stroke="#5d3f9e" strokeWidth="0.5" />
          </svg>
          {/* marble columns */}
          {[[74, 22, 26], [84, 18, 20], [91, 14, 15]].map(([l, hh, wp], i) => (
            <div key={`c${i}`} className="absolute" style={{ left: `${l}%`, bottom: "26%", height: `${hh}%`, width: `${wp / 3}%`, background: "linear-gradient(90deg,#f6c8e6,#d898cc 55%,#a464aa)", opacity: 1 - i * 0.14, boxShadow: "inset 0 3px 0 #f6d4ec" }} />
          ))}
          {/* checkerboard floor */}
          <div className="absolute inset-x-[-20%] bottom-[-14%] h-[42%]" style={{ background: "repeating-conic-gradient(#8a5fb8 0% 25%, #bd8ed4 0% 50%) 50% / 34px 34px", transform: "perspective(150px) rotateX(52deg)", transformOrigin: "top", maskImage: "linear-gradient(to bottom, black 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)" }} />
          {/* floating solids */}
          <div className="ambient-float absolute left-[12%] top-[24%] h-6 w-6 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #eafcf8, #7de8d8 45%, #3aa898 85%)", animationDelay: "-3s" }} />
          <svg className="ambient-float absolute left-[24%] top-[14%] h-6 w-6" viewBox="0 0 100 100" style={{ animationDelay: "-5s" }} aria-hidden>
            <polygon points="50 4 96 50 50 96 4 50" fill="#ef74be" stroke="#ffd7ee" strokeWidth="4" />
            <polygon points="50 22 78 50 50 78 22 50" fill="#d860ac" />
          </svg>
          <svg className="ambient-float absolute right-[22%] top-[16%] h-5 w-5" viewBox="0 0 100 100" style={{ animationDelay: "-6s" }} aria-hidden>
            <path d="M50 6 L95 84 L5 84 Z" fill="#f07ac0" stroke="#ffe0f0" strokeWidth="4" />
            <path d="M50 38 L68 70 L32 70 Z" fill="#c488d4" />
          </svg>
          {/* marble bust on plinth */}
          <svg className="absolute bottom-[22%] left-1/2 h-[34%] w-auto -translate-x-1/2" viewBox="0 0 170 240" aria-hidden>
            <defs>
              <linearGradient id="pv-vp-marble" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fbeef8" />
                <stop offset="0.55" stopColor="#ddc9de" />
                <stop offset="1" stopColor="#b394bc" />
              </linearGradient>
            </defs>
            <ellipse cx="85" cy="233" rx="62" ry="6" fill="#1a0e30" opacity="0.4" />
            <path d="M38 138 L45 96 Q49 86 55 84 L55 76 Q46 68 46 52 Q46 30 63 30 Q80 30 80 52 Q80 68 71 76 L71 84 Q77 86 81 96 L88 138 Z" fill="url(#pv-vp-marble)" />
            <ellipse cx="63" cy="52" rx="17" ry="20" fill="#fbeef8" />
            <polygon points="45,192 125,192 118,185 52,185" fill="#efe0ee" />
            <rect x="45" y="192" width="80" height="34" fill="#c4a0c8" />
            <rect x="63" y="199" width="44" height="15" fill="#140b22" />
            <text x="85" y="210" textAnchor="middle" fontSize="10" fill="#f5ecff" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>未来はここにある</text>
          </svg>
          {/* vertical neon */}
          <span className="absolute right-[3%] top-[22%] font-mono text-[9px] tracking-[0.3em] text-[#ffd7ee]" style={{ writingMode: "vertical-rl", textShadow: "0 0 8px #ff9ed2, 0 0 16px #e070b8" }}>過去未来</span>
        </div>
      );
    case "y2k":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#f8ddee 0%,#e6d0f4 55%,#f6c2e0 100%)" }} />
          {/* desk gloss */}
          <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: "linear-gradient(to top,#ffffff99,transparent)" }} />
          {/* CD */}
          <div className="absolute right-[10%] top-[14%] h-14 w-14 rounded-full" style={{ background: "conic-gradient(#ffd2ec,#fff2c8,#cdf2de,#cfe6ff,#e6d4ff,#ffd2ec)", WebkitMaskImage: "radial-gradient(circle,transparent 15%,black 16%)", maskImage: "radial-gradient(circle,transparent 15%,black 16%)", boxShadow: "0 8px 18px -8px #b06ab8" }} />
          <div className="absolute right-[16.5%] top-[21%] h-3.5 w-3.5 rounded-full" style={{ background: "linear-gradient(#f4eaf8,#cdb8e2)", border: "1px solid #b39cc9" }} />
          {/* mini MD player */}
          <div className="absolute left-[8%] top-[20%] h-11 w-24 -rotate-6 rounded-lg" style={{ background: "linear-gradient(160deg,#fdf9ff,#e2d4f0 70%,#f2e8f6)", border: "1px solid #c2aed8", boxShadow: "0 8px 16px -8px #b07ab8" }}>
            <div className="absolute left-1.5 top-1.5 flex gap-1">
              {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-2 w-2.5 rounded-[2px] bg-[#f0e6f6] ring-1 ring-[#c6b4d8]" />)}
            </div>
            <div className="absolute bottom-1.5 left-1.5 h-1.5 w-6 rounded-full bg-[#463656]/80" />
            <div className="absolute bottom-1.5 right-2 h-2 w-2 rounded-full ring-1 ring-[#b7a0cc]">
              <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#463656]" />
            </div>
          </div>
          {/* mini holo mouse */}
          <div className="absolute bottom-[13%] left-[24%] h-11 w-[68px] -rotate-3 rounded-[50%]" style={{ background: "radial-gradient(circle at 35% 28%,#fff,#fbeef8 42%,#dcc9f0 82%,#f4e6f6)", boxShadow: "0 8px 14px -6px #b078b899" }}>
            <div className="absolute left-1/2 top-[18%] h-3.5 w-2.5 -translate-x-1/2 rounded-full" style={{ background: "repeating-linear-gradient(90deg,#b9a2d8 0 1px,#e8dcf6 1px 2px)" }} />
          </div>
          {/* mini glitter ball */}
          <div className="absolute bottom-[11%] right-[16%] h-10 w-10 rounded-full" style={{ background: "radial-gradient(circle at 34% 28%,#fff,#f4eafc 30%,#c2aae0 85%)", boxShadow: "0 6px 12px -5px #b078b8" }}>
            <div className="absolute inset-0 rounded-full" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.95) 0.8px,transparent 1.2px),radial-gradient(rgba(198,168,236,0.9) 0.8px,transparent 1.3px)", backgroundSize: "6px 6px,9px 9px", backgroundPosition: "0 0,3px 4px", opacity: 0.65 }} />
            <div className="absolute left-[18%] top-[12%] h-2.5 w-3.5 rounded-[50%] bg-white/90 blur-[1px]" />
          </div>
          {/* sparkles */}
          <div className="y2k-sparkle absolute left-[16%] top-[16%] h-2 w-2 rotate-45 bg-white" />
          <div className="y2k-sparkle absolute right-[28%] top-[38%] h-1.5 w-1.5 rotate-45 bg-white" style={{ animationDelay: "-1.4s" }} />
          <div className="y2k-sparkle absolute bottom-[28%] left-[48%] h-1.5 w-1.5 rotate-45 bg-white" style={{ animationDelay: "-2.2s" }} />
        </div>
      );
    case "dreamcore":
      return (
        <div className={common}>
          {/* twilight sky + evening star (page DreamEnv) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(#0d1233 0%, #26306b 45%, #55508f 75%, #b878b8 100%)" }} />
          <div className="absolute right-[30%] top-[12%] h-1 w-1 rounded-full bg-[#f4f6ff]" style={{ boxShadow: "0 0 8px 2px rgba(220,230,255,0.75)" }} />
          <div className="absolute left-[24%] top-[7%] h-px w-px bg-white/80" />
          <div className="absolute left-[58%] top-[5%] h-px w-px bg-white/70" />
          <div className="absolute right-[10%] top-[20%] h-px w-px bg-[#c8e0ff]/80" />
          {/* the great pink-gold cumulus */}
          <div className="cloud-blob absolute left-[12%] top-[32%] h-9 w-28" style={{ background: "radial-gradient(circle at 50% 88%, #ffd8a8 0%, #f0a8c8 48%, #6b5492 100%)", opacity: 0.95 }} />
          <div className="cloud-blob absolute right-[16%] top-[26%] h-5 w-14 bg-[#6a5590]/80" />
          {/* meadow */}
          <div className="absolute bottom-0 h-[30%] w-full" style={{ background: "linear-gradient(#2c5244, #152e28)" }} />
          {/* tethered island with pink-roofed house */}
          <div className="ambient-float absolute left-[11%] top-[14%] w-[18%]">
            <div className="absolute bottom-full left-1/2 h-5 w-px -translate-x-1/2 bg-white/35" />
            <svg viewBox="0 0 60 46" className="h-auto w-full" aria-hidden>
              <polygon points="6,18 54,18 47,32 38,40 30,34 22,42 14,30" fill="#3a2f52" />
              <path d="M3 17 Q17 12 30 14 Q45 16 57 18 Q43 23 30 23 Q15 23 3 17 Z" fill="#3f7a52" />
              <rect x="22" y="6" width="14" height="9" fill="#f6ecf4" />
              <polygon points="20,6 29,1 38,6" fill="#ff9ed2" />
              <rect x="25" y="8" width="3.5" height="3.5" fill="#ffd898" />
            </svg>
          </div>
          {/* Bar of Dreams kiosk */}
          <div className="absolute bottom-[12%] right-[12%] w-[24%]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-[var(--font-caveat)] text-[8px] text-[#ffd8f0]" style={{ textShadow: "0 0 6px #ff9ed2, 0 0 12px rgba(255,158,210,0.5)" }}>Bar of Dreams</div>
            <div className="h-2.5 w-full rounded-t-sm" style={{ background: "repeating-linear-gradient(90deg,#ff9ed2 0 4px,#fff2fa 4px 8px,#9ee8e0 8px 12px,#fff2fa 12px 16px)" }} />
            <div className="mx-auto h-5 w-[88%] rounded-b-sm bg-[#241f42] p-0.5">
              <div className="h-3 w-full rounded-[2px]" style={{ background: "linear-gradient(#ffd898,#ffb090)", boxShadow: "0 0 8px rgba(255,190,120,0.55)" }} />
            </div>
          </div>
          {/* pond + flowers */}
          <div className="absolute bottom-[7%] left-[36%] h-2.5 w-8 rounded-[50%]" style={{ background: "linear-gradient(rgba(255,158,210,0.5), rgba(16,23,54,0.9))" }} />
          <div className="absolute bottom-[5%] left-[12%] h-1 w-1 rounded-full bg-[#ff9ed2]" />
          <div className="absolute bottom-[9%] left-[22%] h-1 w-1 rounded-full bg-[#c8a8ee]" />
          <div className="absolute bottom-[4%] left-[46%] h-1 w-1 rounded-full bg-[#fff2fa]/90" />
          <div className="absolute bottom-[6%] right-[40%] h-1 w-1 rounded-full bg-[#ff9ed2]/80" />
        </div>
      );
    case "cyberpunk":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(${w.bg}, #241448 70%, #4a1f66)` }} />
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="absolute bottom-0" style={{ left: `${i * 15 - 4}%`, width: "13%", height: `${34 + ((i * 37) % 42)}%`, background: "#171034", border: "1px solid #2a1a52" }}>
              <div className="absolute left-[25%] top-[22%] h-1.5 w-1.5" style={{ background: i % 2 ? w.accent : w.accent2, boxShadow: `0 0 8px ${i % 2 ? w.accent : w.accent2}` }} />
              <div className="absolute left-[60%] top-[48%] h-1.5 w-1.5" style={{ background: i % 3 ? w.accent2 : w.accent, boxShadow: `0 0 8px ${i % 3 ? w.accent2 : w.accent}` }} />
            </div>
          ))}
          <div className="absolute left-[18%] top-[14%] font-mono text-[8px] tracking-[0.3em] text-[#ff3b52] sign-glow">未来市</div>
          <div className="absolute right-[14%] top-[24%] font-mono text-[8px] tracking-[0.25em] text-[#4de8ff] sign-glow">SECTOR 7</div>
          {/* rooftop edge, lone figure, railing discs */}
          <div className="absolute bottom-0 left-0 h-[13%] w-[32%] bg-[#070512]" style={{ clipPath: "polygon(0 0, 100% 45%, 100% 100%, 0 100%)" }} />
          <div className="absolute bottom-[11%] left-[10%] h-[6%] w-[2%] rounded-t-full bg-[#08061a]" />
          <div className="absolute bottom-[15.6%] left-[10.4%] h-[1.8%] w-[1.2%] rounded-full bg-[#08061a]" />
          <div className="absolute bottom-[9%] left-[32%] right-0 h-px bg-[#0a0718]" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`d${i}`} className="absolute h-[2.2%] w-[2.2%] rounded-full border border-[#4de8ff66] bg-[#0d0a1e]" style={{ left: `${36 + i * 13}%`, bottom: "8.4%" }} />
          ))}
        </div>
      );
    case "liminal":
      return (
        <div className={common}>
          <div className="absolute inset-0 bg-[#d8d2c4]" />
          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[#c4beae]" style={{ clipPath: "polygon(0 0, 34% 40%, 66% 40%, 100% 0, 100% 100%, 0 100%)" }} />
          <div className="absolute left-1/2 top-[34%] h-8 w-1 -translate-x-1/2 bg-[#a89f88]" />
          <div className="absolute inset-x-[34%] top-[36%] h-[34%] bg-[#efe9da]" style={{ clipPath: "polygon(18% 0, 82% 0, 92% 100%, 8% 100%)" }} />
          <div className="ambient-flicker absolute inset-x-[30%] top-0 h-[10%] bg-[#fdf8e8]/90" />
        </div>
      );
    case "backrooms":
      return (
        <div className={common}>
          {/* Level 0 corridor (page BackroomsEnv): striped yellow walls with
              chair rail + baseboard, drop ceiling with flush fluorescents,
              wall openings into further rooms, damp carpet, hazmat explorer */}
          <svg className="h-full w-full" viewBox="0 0 300 224" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <defs>
              <linearGradient id="pv-br-ceil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d5c795" />
                <stop offset="1" stopColor="#a2934f" />
              </linearGradient>
              <linearGradient id="pv-br-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a2208" />
                <stop offset="1" stopColor="#6b5b24" />
              </linearGradient>
            </defs>
            <rect width="300" height="224" fill="#8a7a3a" />
            {/* ceiling + joists */}
            <polygon points="0,0 300,0 236,60 64,60" fill="url(#pv-br-ceil)" />
            {[-60, 30, 110, 190, 268, 350].map((x, i) => (
              <line key={`j${i}`} x1={x} y1="0" x2={150 + (x - 150) * 0.19} y2="60" stroke="#584c22" strokeWidth="1" opacity="0.7" />
            ))}
            {/* flush fluorescents, nearest flickers */}
            <g className="ambient-flicker" style={{ animationDuration: "7s" }}>
              <ellipse cx="150" cy="10" rx="52" ry="7" fill="rgba(253,248,214,0.3)" />
              <rect x="112" y="3" width="76" height="9" rx="1" fill="#6e6128" />
              <rect x="115" y="4.5" width="70" height="6" rx="0.8" fill="#fdf8d6" />
            </g>
            <rect x="133" y="20" width="34" height="5" rx="0.8" fill="#6e6128" />
            <rect x="134.5" y="21.2" width="31" height="2.8" fill="#fdf8d6" opacity="0.95" />
            <rect x="142" y="34" width="16" height="3" rx="0.5" fill="#6e6128" />
            <rect x="143" y="34.8" width="14" height="1.6" fill="#fdf8d6" opacity="0.8" />
            {/* wallpaper stripes converging with depth */}
            {[[12.8, 12, 12.8, 191.2], [28.8, 27, 28.8, 150.2], [48, 36, 48, 126], [287.2, 12, 287.2, 191.2], [271.2, 27, 271.2, 150.2], [252, 36, 252, 126]].map(([x1, y1, x2, y2], i) => (
              <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,243,190,0.14)" strokeWidth="1" />
            ))}
            {/* chair rail + baseboard */}
            <line x1="64" y1="60" x2="0" y2="130" stroke="rgba(58,48,16,0.45)" strokeWidth="1.5" />
            <line x1="236" y1="60" x2="300" y2="130" stroke="rgba(58,48,16,0.45)" strokeWidth="1.5" />
            <polygon points="64,60 0,210.6 0,224 64,60" fill="#4c4019" opacity="0.9" />
            <polygon points="236,60 300,210.6 300,224 236,60" fill="#4c4019" opacity="0.9" />
            {/* opening into a lit room, left wall */}
            <polygon points="35.2,33 22.4,21 22.4,166.6 35.2,133.8" fill="#6b5d2b" />
            <polygon points="35.2,72 22.4,78 22.4,166.6 35.2,133.8" fill="#3d3312" opacity="0.85" />
            <ellipse cx="29" cy="48" rx="7" ry="9" fill="rgba(253,246,205,0.45)" />
            {/* opening into the dark, right wall */}
            <polygon points="264.8,39 277.6,27 277.6,172.6 264.8,139.8" fill="#0b0802" />
            {/* far end of the hall — someone is standing there */}
            <rect x="136" y="86" width="28" height="42" fill="#0f0c04" />
            <rect x="143" y="98" width="14" height="30" fill="#060502" />
            <circle cx="149.5" cy="104" r="1.6" fill="#040302" />
            <rect x="148" y="105.5" width="3" height="8" rx="1.2" fill="#040302" />
            {/* damp carpet + pooled light */}
            <polygon points="64,60 236,60 300,224 0,224" fill="url(#pv-br-floor)" />
            <ellipse cx="150" cy="152" rx="55" ry="14" fill="rgba(253,246,200,0.12)" />
            {/* hazmat explorer reading a note pinned to the right wall */}
            <g className="bl-bob" style={{ animationDuration: "5s" }}>
              <ellipse cx="238" cy="164" rx="12" ry="2.6" fill="rgba(8,6,2,0.4)" />
              <rect x="233" y="128" width="13" height="26" rx="4" fill="#8f8838" />
              <rect x="236" y="131" width="7" height="17" rx="2.5" fill="#6e6730" />
              <circle cx="239.5" cy="122" r="5" fill="#8f8838" />
              <circle cx="238" cy="124" r="2" fill="#8f8736" />
              <rect x="248" y="126" width="7" height="9" fill="#efe8d0" transform="rotate(-6 251 130)" />
            </g>
          </svg>
        </div>
      );
    default:
      // Studio-built custom worlds: render their live scene graph, scaled to the card
      return (
        <div className={common}>
          <SceneStage doc={w.scene} className="absolute inset-0" />
        </div>
      );
  }
}

function PortalCard({ w }: { w: PortalWorldDef }) {
  const navigate = useApp((s) => s.navigate);
  const [blurb, setBlurb] = useState(false);
  return (
    <button
      className="portal-card group block h-56 text-left md:h-64"
      style={{ "--p-accent": w.accent, "--p-accent2": w.accent2 } as React.CSSProperties}
      onMouseEnter={() => setBlurb(true)}
      onMouseLeave={() => setBlurb(false)}
      onFocus={() => setBlurb(true)}
      onBlur={() => setBlurb(false)}
      onClick={() => navigate({ view: "world", world: w.id })}
      aria-label={`Enter ${w.name} — ${w.epithet}`}
    >
      <PortalScene w={w} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: w.accent }}>
          World {String(w.index).padStart(2, "0")}
        </p>
        <h3 className="w-display mt-0.5 text-xl font-bold text-white">{w.name}</h3>
        <p className="text-[12px] italic text-white/60">{w.epithet}</p>
        <div className={`mt-2 overflow-hidden transition-all duration-300 ${blurb ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
          <p className="text-[12.5px] leading-snug text-white/80">{w.portalBlurb}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold" style={{ color: w.accent }}>
            Enter the world <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>
      </div>
    </button>
  );
}

// ————— Homepage —————
interface Stats {
  total: number;
  trending: { tag: string; count: number }[];
  featuredCreators: { name: string; id: string; works: number; likes: number }[];
}

const COLLECTIONS: { title: string; desc: string; query: string; world: WorldId }[] = [
  { title: "Neon After Dark", desc: "Signs, skylines and electric rain", query: "neon", world: "retrowave" },
  { title: "Empty Rooms", desc: "Silence, rendered in fluorescent light", query: "corridor", world: "liminal" },
  { title: "Summers That Never Ended", desc: "Meadows, buses and petrol stations", query: "summer", world: "dreamcore" },
  { title: "Chrome & Gloss", desc: "The optimistic interface era", query: "chrome", world: "y2k" },
];

export function Homepage() {
  const navigate = useApp((s) => s.navigate);
  const setSearchOpen = useApp((s) => s.setSearchOpen);
  const worlds = useStudioWorlds();
  const site = useStudioConfig((s) => s.site);
  const [featured, setFeatured] = useState<ArtworkDTO[]>([]);
  const [recent, setRecent] = useState<ArtworkDTO[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/artworks?featured=1&limit=10")
      .then((r) => r.json())
      .then((d) => setFeatured(d.artworks || []))
      .catch(() => {});
    fetch("/api/artworks?limit=12")
      .then((r) => r.json())
      .then((d) => setRecent(d.artworks || []))
      .catch(() => {});
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const scrollFeatured = (dir: number) => {
    featuredRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="bg-[#0d0b14] text-white">
      {/* ——— HERO ——— */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        <HeroCanvas />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 62% 52% at 50% 54%, rgba(5,3,10,0.52), rgba(5,3,10,0.18) 60%, transparent 78%)" }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.5em] text-white/70">
            {site.heroEyebrow}
          </p>
          <h1 className="mt-5 text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
            <span className="bg-gradient-to-r from-[#ff2e88] via-[#f7b4d0] via-50% to-[#9be8ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,46,136,0.35)]">
              AESTHETICA
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-[16px] leading-relaxed text-white/80 md:text-lg">
            {site.heroSub}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => document.getElementById("portals")?.scrollIntoView({ behavior: "smooth" })} className="w-btn-primary w-btn !rounded-full !px-6 !py-3 !text-[15px] !text-white">
              <Compass className="h-4.5 w-4.5" />
              Begin the tour
            </button>
            <button onClick={() => setSearchOpen(true)} className="w-btn !rounded-full !px-6 !py-3 !text-[15px] !border-white/25 !bg-white/10 !text-white hover:!border-white/60">
              <Search className="h-4.5 w-4.5" />
              Search the archive
            </button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-[12px] text-white/50">
            <span>{stats ? `${stats.total}+ artworks` : "—"}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{worlds.length} worlds</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>1 archive</span>
          </div>
        </div>
        <ChevronDown className="absolute bottom-5 left-1/2 h-5 w-5 -translate-x-1/2 animate-bounce text-white/40" aria-hidden />
      </section>

      {/* ——— PORTALS ——— */}
      <section id="portals" className="relative mx-auto max-w-7xl px-4 py-20">
        <header className="mb-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#7df2d8]">{site.portalsKicker}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{site.portalsTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/60">
            Each portal opens a different reality: its own light, typography, motion and archive.
            Hover to preview. Enter to stay a while.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {worlds.map((w) => (
            <PortalCard key={w.id} w={w} />
          ))}
        </div>
      </section>

      {/* ——— FEATURED ——— */}
      {featured.length > 0 && (
        <section className="border-y border-white/8 bg-white/[0.02] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#ff2e88]">Curated</p>
                <h2 className="mt-2 text-3xl font-bold">Featured Works</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollFeatured(-1)} className="w-btn !px-3" aria-label="Scroll left">←</button>
                <button onClick={() => scrollFeatured(1)} className="w-btn !px-3" aria-label="Scroll right">→</button>
              </div>
            </div>
            <div ref={featuredRef} className="flex gap-5 overflow-x-auto pb-3 w-scroll [scrollbar-width:thin]">
              {featured.map((a) => (
                <div key={a.id} className="w-[300px] shrink-0">
                  <ArtworkCard art={a} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— COLLECTIONS + TRENDING ——— */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#9be8ff]">Curated paths</p>
            <h2 className="mt-2 text-3xl font-bold">Collections</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {COLLECTIONS.map((c) => {
                const w = WORLD_MAP[c.world];
                return (
                  <button
                    key={c.title}
                    onClick={() => navigate({ view: "search", q: c.query })}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 p-5 text-left transition-all hover:-translate-y-1 hover:border-white/30"
                    style={{ background: `linear-gradient(135deg, ${w.grad[0]}, ${w.grad[1]}33 60%, ${w.grad[2]}22)` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: w.accent }}>{w.name}</p>
                    <h3 className="mt-1.5 text-xl font-bold">{c.title}</h3>
                    <p className="mt-1 text-[13px] text-white/60">{c.desc}</p>
                    <p className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80 transition-colors group-hover:text-white">
                      Browse collection <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#ffb347]">Signals</p>
            <h2 className="mt-2 text-3xl font-bold">Trending Tags</h2>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {(stats?.trending || []).map((t, i) => (
                <button
                  key={t.tag}
                  onClick={() => navigate({ view: "search", q: t.tag })}
                  className="rounded-full border border-white/12 px-4 py-2 text-[13.5px] text-white/75 transition-all hover:border-[#ff2e88] hover:text-white hover:shadow-[0_0_20px_-6px_#ff2e88]"
                  style={{ fontSize: `${Math.max(13, 16 - i * 0.35)}px` }}
                >
                  #{t.tag}
                  <span className="ml-1.5 text-[11px] text-white/35">{t.count}</span>
                </button>
              ))}
              {!stats && <p className="text-[13px] text-white/40">Reading the archive…</p>}
            </div>

            <h2 className="mt-12 text-xl font-bold">Featured Creators</h2>
            <div className="mt-4 space-y-2.5">
              {(stats?.featuredCreators || []).slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ view: "search", q: c.name })}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.07]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] to-[#9be8ff] text-[13px] font-bold text-black">
                    {c.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{c.name}</span>
                    <span className="block text-[12px] text-white/45">{c.works} works in the archive</span>
                  </span>
                  <span className="text-[12px] text-white/50">♥ {c.likes}</span>
                </button>
              ))}
              {stats && stats.featuredCreators.length === 0 && (
                <p className="text-[13px] text-white/40">No community uploads yet — yours could be first.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— RECENT ——— */}
      {recent.length > 0 && (
        <section className="border-y border-white/8 bg-white/[0.02] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#7df2d8]">Fresh from the worlds</p>
              <h2 className="mt-2 text-3xl font-bold">Recently Added</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {recent.slice(0, 6).map((a) => (
                <ArtworkCard key={a.id} art={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— ARCHIVE HIGHLIGHTS ——— */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-9 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#ffb3e6]">Learn the lore</p>
          <h2 className="mt-2 text-3xl font-bold">Historical Archive Highlights</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/60">
            Documented history and cultural interpretation for every world — carefully separated,
            credibly sourced, openly labelled.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {worlds.filter((w) => w.kind === "builtin").map((w) => (
            <button
              key={w.id}
              onClick={() => navigate({ view: "world", world: w.id, tab: "archive" })}
              className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-white/25"
            >
              <span className="mt-1 h-10 w-10 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${w.grad[1]}, ${w.grad[2]})`, boxShadow: `0 6px 20px -6px ${w.grad[1]}` }} />
              <span>
                <span className="flex items-center gap-2 text-[16px] font-bold">
                  {w.name} <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span className="mt-1 line-clamp-2 block text-[13.5px] leading-relaxed text-white/55">
                  {w.archive?.[0] ? `${w.archive[0].heading} — ${w.archive[0].body.slice(0, 130)}…` : w.short}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ——— UPLOAD CTA ——— */}
      <section className="relative overflow-hidden border-t border-white/8 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff2e88]/12 via-transparent to-[#9be8ff]/12" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Upload className="mx-auto h-8 w-8 text-white/70" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Add your vision to the museum</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
            Upload artwork into any of the {worlds.length} worlds. Your pieces join the gallery with full
            tagging, likes, comments and collections — no account needed, this device is your key.
          </p>
          <button onClick={() => navigate({ view: "upload" })} className="w-btn-primary w-btn mt-8 !rounded-full !px-8 !py-3.5 !text-[15px] !text-white">
            <Upload className="h-4.5 w-4.5" />
            Add artwork
          </button>
        </div>
      </section>

      {/* ——— FOOTER ——— */}
      <footer className="mt-auto border-t border-white/8 bg-black/40 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[11px] font-black text-black">Æ</span>
              <span className="text-[13px] tracking-[0.25em] text-white/70">AESTHETICA</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] text-white/50" aria-label="Footer">
              {worlds.map((w) => (
                <button key={w.id} onClick={() => navigate({ view: "world", world: w.id })} className="transition-colors hover:text-white">
                  {w.name}
                </button>
              ))}
              <button onClick={() => navigate({ view: "profile" })} className="transition-colors hover:text-white">Profile</button>
              <button onClick={() => navigate({ view: "studio" })} className="transition-colors hover:text-white">Studio</button>
            </nav>
            <p className="text-[11.5px] text-white/35">A living museum · art, history & community · MMXXVI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
