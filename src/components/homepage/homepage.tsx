"use client";

import { useEffect, useState, useRef } from "react";
import { HeroCanvas } from "./hero-canvas";
import { useApp } from "@/lib/store";
import { WORLDS, WORLD_MAP, type WorldId } from "@/lib/aesthetics";
import { ArtworkCard, type ArtworkDTO } from "@/components/gallery/artwork-card";
import { ArrowRight, Search, Upload, Compass, ChevronDown } from "lucide-react";

// ————— Portal mini-scenes (pure CSS/SVG, one per world) —————
function PortalScene({ world }: { world: WorldId }) {
  const w = WORLD_MAP[world];
  const common = "absolute inset-0";
  switch (world) {
    case "retrowave":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(#1a0a2e 0%, #54123f 55%, ${w.accent} 100%)` }} />
          <div className="absolute left-1/2 top-[30%] h-14 w-14 -translate-x-1/2 rounded-full" style={{ background: `linear-gradient(#ffe6a0,${w.accent})`, boxShadow: `0 0 34px 6px ${w.accent}` }} />
          <svg className="absolute bottom-0 h-[45%] w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={50 + (i - 4) * 22} y1="0" x2={50 + (i - 4) * 110} y2="40" stroke={w.accent} strokeWidth="0.5" opacity="0.8" />)}
            {[2, 6, 12, 22, 40].map((y, i) => <line key={i} x1="0" y1={y} x2="100" y2={y} stroke={w.accent2} strokeWidth="0.4" opacity="0.8" />)}
          </svg>
        </div>
      );
    case "synthwave":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(${w.bg} 0%, #31065c 70%, ${w.accent} 130%)` }} />
          <div className="absolute left-1/2 top-[26%] h-12 w-12 -translate-x-1/2 rounded-full ambient-spin" style={{ background: w.accent, boxShadow: `0 0 28px 4px ${w.accent}` }} />
          <svg className="absolute bottom-0 h-[42%] w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <polyline points="0,38 18,20 34,38 52,16 70,38 86,22 100,34 100,40 0,40" fill="none" stroke={w.accent2} strokeWidth="0.7" />
            <polyline points="0,30 20,16 40,30 60,14 80,30 100,18" fill="none" stroke={w.accent} strokeWidth="0.5" opacity="0.7" />
          </svg>
        </div>
      );
    case "vaporwave":
      return (
        <div className={common}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #3d2266, #6d4a8f 60%, ${w.accent2})` }} />
          <div className="absolute bottom-0 left-0 right-0 h-[38%]" style={{ background: "repeating-conic-gradient(#3d2b5c 0% 25%, #57407e 0% 50%) 50%/22px 22px", transform: "perspective(120px) rotateX(38deg)", transformOrigin: "top" }} />
          <div className="ambient-soft absolute left-[24%] top-[18%] h-16 w-12 rounded-[50%] bg-[#f5ede0] shadow-lg" />
          <div className="absolute right-[16%] top-[30%] rounded border border-[#7df2d8] bg-black/40 px-2 py-1 font-mono text-[8px] text-[#7df2d8]">system.exe</div>
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(#78c8f5 0%, #c9e8fb 60%, #fff8ef 100%)" }} />
          <div className="cloud-blob ambient-float absolute left-[16%] top-[20%] h-9 w-20 bg-[#f7b4d0]" />
          <div className="cloud-blob absolute right-[14%] top-[32%] h-11 w-24 bg-[#ffa77d]/90" style={{ animationDelay: "-3s" }} />
          <div className="absolute bottom-0 h-[30%] w-full bg-[#a9d5a1]" />
          <div className="absolute bottom-[26%] left-[44%] h-10 w-[3px] rounded bg-[#fff8ef]/80" />
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
          <div className="absolute inset-0 bg-[#b5a24a]" />
          <div className="absolute inset-x-[24%] top-[30%] bottom-0 bg-[#cbb95c]" style={{ clipPath: "polygon(22% 0, 78% 0, 100% 100%, 0 100%)" }} />
          <div className="ambient-flicker absolute inset-x-0 top-0 flex justify-around">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-2.5 w-10 bg-[#fdf3c0]" style={{ opacity: 0.55 + (i % 3) * 0.18 }} />)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[16%] bg-[#6e6230]" />
        </div>
      );
  }
}

function PortalCard({ world }: { world: WorldId }) {
  const w = WORLD_MAP[world];
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
      onClick={() => navigate({ view: "world", world })}
      aria-label={`Enter ${w.name} — ${w.epithet}`}
    >
      <PortalScene world={world} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: w.accent }}>
          World 0{w.index}
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
            A living museum of internet aesthetics
          </p>
          <h1 className="mt-5 text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
            <span className="bg-gradient-to-r from-[#ff2e88] via-[#f7b4d0] via-50% to-[#9be8ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,46,136,0.35)]">
              AESTHETICA
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-[16px] leading-relaxed text-white/80 md:text-lg">
            Eight interconnected worlds of art, nostalgia and digital subculture —
            each a fully realised visual universe with its own archive, gallery and community.
            Nostalgia for imagined futures, and futures imagined once more.
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
            <span>8 worlds</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>1 archive</span>
          </div>
        </div>
        <ChevronDown className="absolute bottom-5 left-1/2 h-5 w-5 -translate-x-1/2 animate-bounce text-white/40" aria-hidden />
      </section>

      {/* ——— PORTALS ——— */}
      <section id="portals" className="relative mx-auto max-w-7xl px-4 py-20">
        <header className="mb-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-[#7df2d8]">Choose a door</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">The Eight Worlds</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/60">
            Each portal opens a different reality: its own light, typography, motion and archive.
            Hover to preview. Enter to stay a while.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WORLDS.map((w) => (
            <PortalCard key={w.id} world={w.id} />
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
          {WORLDS.map((w) => (
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
                  {w.archive[0].heading} — {w.archive[0].body.slice(0, 130)}…
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
            Upload artwork into any of the eight worlds. Your pieces join the gallery with full
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
              {WORLDS.map((w) => (
                <button key={w.id} onClick={() => navigate({ view: "world", world: w.id })} className="transition-colors hover:text-white">
                  {w.name}
                </button>
              ))}
              <button onClick={() => navigate({ view: "profile" })} className="transition-colors hover:text-white">Profile</button>
            </nav>
            <p className="text-[11.5px] text-white/35">A living museum · art, history & community · MMXXVI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
