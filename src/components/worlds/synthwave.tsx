"use client";

import { useRef, useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { Play, Pause, Palette } from "lucide-react";

const MOODS = [
  { id: "classic", label: "Neon Freeway", top: "#2b0a4d", mid: "#d61c95", sun: "#ff5ad4", grid: "#ff4fd8" },
  { id: "ember", label: "Ember Drive", top: "#2a0715", mid: "#b8204f", sun: "#ff7847", grid: "#ffb347" },
  { id: "ice", label: "Ice Circuit", top: "#041228", mid: "#1450a8", sun: "#9be8ff", grid: "#ff38e4" },
  { id: "toxic", label: "Toxic Bloom", top: "#06140c", mid: "#0d5c38", sun: "#7dff9e", grid: "#e4ff38" },
];

// deterministic scenery tables — same sky every visit, zero layout jitter
const frac = (x: number) => x - Math.floor(x);
const hash = (i: number) => frac(Math.sin(i * 127.1 + 311.7) * 43758.5453);

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: hash(i * 3 + 1),
  y: hash(i * 3 + 2) * 0.52,
  r: 0.7 + hash(i * 3 + 3) * 1.2,
  ph: hash(i + 9) * 6.28,
}));

const CLOUDS = [
  { x: 0.08, y: 0.17, s: 1.25, spd: 0.0000105 },
  { x: 0.55, y: 0.11, s: 0.9, spd: 0.0000075 },
  { x: 0.3, y: 0.28, s: 1.0, spd: 0.000013 },
  { x: 0.78, y: 0.32, s: 1.15, spd: 0.000009 },
  { x: 0.45, y: 0.08, s: 0.7, spd: 0.000016 },
];

const CITY = Array.from({ length: 30 }, (_, i) => {
  const edge = Math.abs(i - 14.5) / 14.5; // 0 = centre, 1 = edge
  const cluster = 0.35 + 0.65 * Math.pow(1 - edge, 1.6); // towers cluster mid-frame
  return {
    x: (i + hash(i + 40) * 0.55) / 30,
    w: 0.022 + hash(i + 80) * 0.03,
    h: (0.16 + hash(i + 120) * 0.2) * cluster,
    ant: hash(i + 160) > 0.55,
    lit: hash(i + 200) > 0.45,
    cyan: hash(i + 240) > 0.5,
  };
});

function SynthEnv({ mood, analyserRef }: { mood: (typeof MOODS)[number]; analyserRef: React.MutableRefObject<AnalyserNode | null> }) {
  const reduced = useApp((s) => s.fxReduced);

  const ref = useCanvasLoop((ctx, w, h, t) => {
    const horizonY = h * 0.58;

    // audio level drives sun size + glow intensity
    let level = 0;
    const analyser = analyserRef.current;
    if (analyser) {
      const arr = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(arr);
      level = arr.slice(0, 24).reduce((s, v) => s + v, 0) / (24 * 255);
    }

    // sky — deep purple falling into hot magenta
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, mood.top);
    sky.addColorStop(0.55, mood.mid);
    sky.addColorStop(1, rgba(mood.sun, 0.85));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizonY + 1);

    // stars
    ctx.fillStyle = "#ffeaff";
    for (const s of STARS) {
      const y = s.y * horizonY;
      ctx.globalAlpha = 0.22 + 0.6 * Math.abs(Math.sin(t * 0.0012 + s.ph));
      ctx.fillRect(s.x * w, y, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    // the sun — white-hot core, widening stripe cuts, breathing halo
    const sunR = Math.min(w, h) * (0.3 + level * 0.05);
    const sx = w / 2;
    const sy = horizonY - sunR * 0.26;
    const halo = ctx.createRadialGradient(sx, sy, sunR * 0.55, sx, sy, sunR * (2.1 + level * 0.35));
    halo.addColorStop(0, rgba(mood.sun, 0.5));
    halo.addColorStop(1, rgba(mood.sun, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, horizonY + 2);

    const sg = ctx.createLinearGradient(0, sy - sunR, 0, sy + sunR);
    sg.addColorStop(0, "#fff6fd");
    sg.addColorStop(0.42, mood.sun);
    sg.addColorStop(1, mood.mid);
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = sg;
    ctx.fillRect(sx - sunR, sy - sunR, sunR * 2, sunR * 2);
    ctx.fillStyle = sky; // stripe cuts sample the exact sky behind
    for (let i = 0; i < 9; i++) {
      const y = sy + sunR * 0.06 + i * sunR * 0.115;
      ctx.fillRect(sx - sunR, y, sunR * 2, 2.5 + i * 2.4);
    }
    ctx.restore();

    // violet clouds with a pink rim, drifting past the sun
    for (const c of CLOUDS) {
      const cx = ((c.x + t * c.spd) % 1.3) * w - w * 0.15;
      const cy = c.y * horizonY;
      const s = c.s * Math.min(w, h) * 0.045;
      ctx.fillStyle = rgba(mood.top, 0.92);
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 2.4, s * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + s * 1.5, cy - s * 0.34, s * 1.5, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - s * 1.7, cy - s * 0.16, s * 1.25, s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(mood.sun, 0.35);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(cx + s * 1.5, cy - s * 0.34, s * 1.5, s * 0.5, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    }

    // skyline silhouettes rising against the sun
    for (const b of CITY) {
      const bx = b.x * w;
      const bw = b.w * w;
      const bh = b.h * horizonY;
      ctx.fillStyle = rgba(mood.top, 0.88);
      ctx.fillRect(bx, horizonY - bh, bw, bh + 1);
      if (b.ant) ctx.fillRect(bx + bw * 0.45, horizonY - bh - 10, 1.5, 10);
      if (b.lit) {
        const fl = 0.5 + 0.5 * Math.sin(t * 0.003 + b.x * 40);
        ctx.fillStyle = rgba(b.cyan ? "#7de8ff" : mood.sun, 0.25 + fl * 0.3);
        for (let wy = 0; wy < 3; wy++) ctx.fillRect(bx + bw * 0.25, horizonY - bh + 6 + wy * 8, 2.5, 3.5);
      }
    }

    // ground — sun-glow at the horizon falling into violet night
    const gg = ctx.createLinearGradient(0, horizonY, 0, h);
    gg.addColorStop(0, rgba(mood.sun, 0.55));
    gg.addColorStop(0.22, rgba(mood.mid, 0.6));
    gg.addColorStop(1, "#08010f");
    ctx.fillStyle = gg;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // perspective grid
    ctx.strokeStyle = rgba(mood.grid, 0.55);
    ctx.lineWidth = 1.2;
    for (let k = -14; k <= 14; k++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + k * (w * 0.02), horizonY);
      ctx.lineTo(w / 2 + k * (w * 0.115), h);
      ctx.stroke();
    }
    const scroll = (t * 0.00028) % 1;
    for (let r = 0; r < 9; r++) {
      const p = ((r / 9 + scroll) % 1) ** 2.4;
      ctx.globalAlpha = 0.1 + p * 0.72;
      ctx.beginPath();
      ctx.moveTo(0, horizonY + p * (h - horizonY));
      ctx.lineTo(w, horizonY + p * (h - horizonY));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // neon layer — road rails + lane dashes streaming toward the viewer
    ctx.globalCompositeOperation = "lighter";
    const roadEdge = (side: 1 | -1) => {
      for (const [lw, al] of [[6, 0.16], [2.6, 0.9]] as const) {
        ctx.strokeStyle = rgba(mood.sun, al);
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(w / 2 + side * w * 0.024, horizonY);
        ctx.lineTo(w / 2 + side * w * 0.33, h);
        ctx.stroke();
      }
    };
    roadEdge(-1);
    roadEdge(1);
    const lane = (f0: number, f1: number) => {
      for (let i = 0; i < 12; i++) {
        const p = (i / 12 + scroll * 1.6) % 1;
        if (p < 0.02) continue;
        const y = horizonY + p * p * (h - horizonY);
        const len = 3 + p * 30;
        const wd = 1.6 + p * 3.4;
        const x = w / 2 + (f0 + p * (f1 - f0)) * w;
        ctx.globalAlpha = 0.22 + p * 0.75;
        ctx.fillStyle = mood.sun;
        ctx.fillRect(x - wd / 2, y, wd, len);
      }
      ctx.globalAlpha = 1;
    };
    lane(0, 0);
    lane(-0.012, -0.085);
    lane(0.012, 0.085);
    ctx.globalCompositeOperation = "source-over";

    // audio waveform ribbon
    if (analyser) {
      const arr = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(arr);
      ctx.strokeStyle = rgba(mood.sun, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < arr.length; i += 2) {
        const x = (i / arr.length) * w;
        const y = horizonY * 0.5 + ((arr[i] - 128) / 128) * h * 0.14;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, { reduced });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />

      {/* roadside blocks with neon window strips */}
      <div className="absolute" style={{ left: "0.5%", bottom: "42%", width: 128, height: 92, background: "linear-gradient(180deg,#22083f,#140327)", boxShadow: "0 0 26px rgba(35,230,255,0.18)" }}>
        <div className="absolute left-[10%] top-[16%] h-[52%] w-[46%]" style={{ background: "repeating-linear-gradient(0deg, rgba(125,232,255,0.65) 0 3px, transparent 3px 11px)" }} />
        <div className="absolute bottom-[14%] right-[8%] h-[12%] w-[62%]" style={{ background: "rgba(255,46,200,0.5)" }} />
      </div>
      <div className="absolute" style={{ left: "12%", bottom: "45%", width: 78, height: 56, background: "linear-gradient(180deg,#1e0638,#120225)" }}>
        <div className="absolute left-[14%] top-[22%] h-[48%] w-[52%]" style={{ background: "repeating-linear-gradient(0deg, rgba(255,119,224,0.55) 0 2.5px, transparent 2.5px 9px)" }} />
      </div>
      <div className="absolute" style={{ right: "0.5%", bottom: "43%", width: 138, height: 98, background: "linear-gradient(180deg,#22083f,#140327)", boxShadow: "0 0 26px rgba(255,46,200,0.18)" }}>
        <div className="absolute right-[10%] top-[15%] h-[54%] w-[48%]" style={{ background: "repeating-linear-gradient(0deg, rgba(255,119,224,0.6) 0 3px, transparent 3px 11px)" }} />
        <div className="absolute bottom-[15%] left-[8%] h-[12%] w-[56%]" style={{ background: "rgba(125,232,255,0.45)" }} />
      </div>

      {/* palms receding down the avenue */}
      {([
        ["-2.5%", "34%", 340], ["7.5%", "37%", 240], ["14.5%", "39.5%", 170],
        ["20.5%", "41.5%", 120], ["25.5%", "43.5%", 82], ["29.5%", "45%", 56],
      ] as const).map(([x, b, hh], i) => (
        <PalmSil key={`pl${i}`} className="palm-sway absolute" style={{ left: x, bottom: b, height: hh, opacity: 0.72 + i * 0.056, animationDelay: `${-i * 1.1}s` }} />
      ))}
      {([
        ["-2.5%", "33%", 320], ["8%", "36.5%", 228], ["15%", "39.5%", 162],
        ["21%", "41.5%", 114], ["26%", "43.5%", 78], ["30%", "45%", 52],
      ] as const).map(([x, b, hh], i) => (
        <PalmSil key={`pr${i}`} className="palm-sway absolute" style={{ right: x, bottom: b, height: hh, transform: "scaleX(-1)", opacity: 0.72 + i * 0.056, animationDelay: `${-0.6 - i * 1.1}s` }} />
      ))}

      {/* two cruisers holding their lanes — placed on the road trapezoid.
          Lane dash at depth t = 50% ± (1.2% + 7.3%·t), t = 1 − bottom/42.
          Near car: bottom 7.5% → t 0.82 → dash 57.2% · Far car: bottom 15% → t 0.64 → dash 44.1%.
          Kept below the ~24% features-panel band so both stay visible on desktop.
          Outer div centres on the lane; inner div carries the bob so transforms don't clash. */}
      <div className="absolute" style={{ left: "57.4%", bottom: "7.5%", width: "min(172px, 25vw)", transform: "translateX(-50%)" }}>
        <div className="car-bob" style={{ animationDelay: "-1s" }}>
          <CarSVG accent="#ff77e0" glow="rgba(255,46,200,0.4)" />
        </div>
      </div>
      <div className="absolute" style={{ left: "44.8%", bottom: "15%", width: "min(148px, 21vw)", transform: "translateX(-50%)" }}>
        <div className="car-bob" style={{ animationDelay: "-2.2s" }}>
          <CarSVG accent="#7de8ff" glow="rgba(35,230,255,0.38)" />
        </div>
      </div>
    </div>
  );
}

function PalmSil({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 170" width={undefined} aria-hidden>
      <path d="M64 170 C62 130 58 96 68 58 L78 60 C70 98 72 134 76 170 Z" fill="#150327" />
      <g fill="#150327">
        <path d="M73 58 Q40 24 6 30 Q42 40 70 66 Z" />
        <path d="M73 56 Q30 44 12 68 Q50 60 72 68 Z" />
        <path d="M73 58 Q50 84 38 108 Q64 84 75 68 Z" />
        <path d="M73 56 Q108 20 118 34 Q84 40 76 66 Z" />
        <path d="M73 56 Q112 44 118 70 Q84 62 72 68 Z" />
        <path d="M73 58 Q100 86 108 110 Q82 84 70 68 Z" />
      </g>
      <circle cx="73" cy="60" r="7" fill="#150327" />
    </svg>
  );
}

function CarSVG({ accent, glow }: { accent: string; glow: string }) {
  return (
    <svg viewBox="0 0 170 76" width="100%" aria-hidden>
      <ellipse cx="84" cy="70" rx="66" ry="4.5" fill={glow} />
      <path d="M10 56 L24 40 Q40 32 62 31 L102 31 Q126 33 144 42 L158 54 Q160 60 152 60 L16 60 Q8 60 10 56 Z" fill="#12031f" stroke={glow} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M44 32 Q52 21 70 20 L96 20 Q110 21 118 32 Z" fill="#1a0530" />
      <path d="M52 30 Q58 23 70 22.5 L94 22.5 Q104 23 110 30 Z" fill={accent} opacity="0.4" />
      <circle cx="42" cy="61" r="10" fill="#0a0118" />
      <circle cx="42" cy="61" r="4.5" fill="#2a0a44" />
      <circle cx="126" cy="61" r="10" fill="#0a0118" />
      <circle cx="126" cy="61" r="4.5" fill="#2a0a44" />
      <rect x="34" y="46" width="102" height="6" rx="3" fill="#ff2ec8" />
      <ellipse cx="30" cy="49" rx="11" ry="3.2" fill="#ff2ec8" opacity="0.55" />
      <ellipse cx="140" cy="49" rx="11" ry="3.2" fill="#ff2ec8" opacity="0.55" />
    </svg>
  );
}

// ————— Interactive visualizer: synthesized synth loop (user-initiated) —————
function Visualizer({ analyserRef }: { analyserRef: React.MutableRefObject<AnalyserNode | null> }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<{
    ctx: AudioContext;
    nodes: { stop: () => void }[];
    master: GainNode;
    interval: ReturnType<typeof setInterval>;
  } | null>(null);

  const toggle = async () => {
    if (playing) {
      const a = audioRef.current;
      if (a) {
        clearInterval(a.interval);
        a.nodes.forEach((n) => n.stop());
        a.master.disconnect();
        a.ctx.close().catch(() => {});
      }
      audioRef.current = null;
      analyserRef.current = null;
      setPlaying(false);
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    const master = ac.createGain();
    master.gain.value = 0.16;
    const analyser = ac.createAnalyser();
    analyser.fftSize = 512;
    master.connect(analyser);
    analyser.connect(ac.destination);
    analyserRef.current = analyser;

    const nodes: { stop: () => void }[] = [];
    const stoppable = (o: OscillatorNode) => {
      o.start();
      nodes.push({ stop: () => o.stop() });
    };

    // simple synthwave loop: bass + arp, LFO filter sweep
    const bass = ac.createOscillator();
    bass.type = "sawtooth";
    bass.frequency.value = 55; // A1
    const bassGain = ac.createGain();
    bassGain.gain.value = 0.5;
    bass.connect(bassGain).connect(master);
    stoppable(bass);

    const arpNotes = [220, 277.18, 329.63, 440, 329.63, 277.18];
    const arp = ac.createOscillator();
    arp.type = "square";
    const arpGain = ac.createGain();
    arpGain.gain.value = 0.12;
    arp.connect(arpGain).connect(master);
    stoppable(arp);
    let step = 0;
    const interval = setInterval(() => {
      arp.frequency.setValueAtTime(arpNotes[step % arpNotes.length], ac.currentTime);
      step++;
    }, 280);

    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.25;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain).connect(bass.frequency);
    stoppable(lfo);

    audioRef.current = { ctx: ac, nodes, master, interval };
    setPlaying(true);
  };

  return (
    <div className="w-panel flex items-center gap-4 px-5 py-4">
      <button
        onClick={toggle}
        className="w-btn-primary w-btn !p-3 !px-3"
        aria-label={playing ? "Stop the visualizer" : "Play the visualizer"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest opacity-70">Interactive visualiser</p>
        <p className="mt-0.5 text-[13px] leading-snug opacity-70">
          {playing ? "The sun, grid and waveform pulse with the synth loop." : "Play a synthesized loop — the sun swells, the road glows brighter, the waveform rides the bass. Audio is generated locally; nothing plays without you."}
        </p>
      </div>
    </div>
  );
}

function MoodSelector({ mood, setMood }: { mood: (typeof MOODS)[number]; setMood: (m: (typeof MOODS)[number]) => void }) {
  return (
    <div className="w-panel px-5 py-4">
      <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest opacity-70">
        <Palette className="h-4 w-4" /> Environment mood
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m)}
            aria-pressed={mood.id === m.id}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[12.5px] transition-all ${
              mood.id === m.id ? "border-white/60 font-semibold" : "border-[var(--w-panel-border)] opacity-70 hover:opacity-100"
            }`}
          >
            <span className="h-6 w-6 rounded-full" style={{ background: `linear-gradient(135deg,${m.sun},${m.grid})` }} />
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SynthwavePage() {
  const world = WORLD_MAP.synthwave;
  const [mood, setMood] = useState(MOODS[0]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const env = <SynthEnv mood={mood} analyserRef={analyserRef} />;

  const features = (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-2">
      <Visualizer analyserRef={analyserRef} />
      <MoodSelector mood={mood} setMood={setMood} />
    </div>
  );

  return <WorldPage world={world} environment={env} features={features} />;
}
