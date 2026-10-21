"use client";

import { useRef, useState } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { useCanvasLoop, rgba } from "@/lib/canvas";
import { useApp } from "@/lib/store";
import { Play, Pause, Palette } from "lucide-react";

const MOODS = [
  { id: "classic", label: "Classic Dusk", top: "#0d0221", mid: "#31065c", sun: "#ff38e4", grid: "#23e6ff" },
  { id: "ember", label: "Ember Drive", top: "#1a0510", mid: "#5c1040", sun: "#ff7847", grid: "#ffb347" },
  { id: "ice", label: "Ice Circuit", top: "#02101f", mid: "#0a2f5c", sun: "#9be8ff", grid: "#ff38e4" },
  { id: "toxic", label: "Toxic Bloom", top: "#071a0a", mid: "#0d3a2f", sun: "#7dff9e", grid: "#e4ff38" },
];

function SynthEnv({ mood, analyserRef }: { mood: (typeof MOODS)[number]; analyserRef: React.MutableRefObject<AnalyserNode | null> }) {
  const reduced = useApp((s) => s.fxReduced);
  const phaseRef = useRef(0);

  const ref = useCanvasLoop((ctx, w, h, t, dt) => {
    const horizonY = h * 0.58;
    phaseRef.current += dt * 0.0004;

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
    sky.addColorStop(0, mood.top);
    sky.addColorStop(1, mood.mid);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizonY);

    // striped sun — pulses with audio
    let level = 0;
    const analyser = analyserRef.current;
    if (analyser) {
      const arr = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(arr);
      level = arr.slice(0, 24).reduce((s, v) => s + v, 0) / (24 * 255);
    }
    const sunR = Math.min(w, h) * (0.14 + level * 0.05);
    const sy = horizonY - sunR * 0.3;
    const sg = ctx.createLinearGradient(0, sy - sunR, 0, sy + sunR);
    sg.addColorStop(0, mood.grid);
    sg.addColorStop(1, mood.sun);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(w / 2, sy, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mood.top;
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.88;
      ctx.fillRect(w / 2 - sunR, sy - sunR * 0.2 + i * sunR * 0.3, sunR * 2, 3 + i * 2.6);
    }
    ctx.globalAlpha = 1;

    // ground
    ctx.fillStyle = mood.top;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // wireframe terrain (two sine ridges)
    const drawRidge = (baseY: number, amp: number, color: string, phase: number, alpha: number) => {
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = baseY - Math.sin(x * 0.012 + phase) * amp - Math.sin(x * 0.031 + phase * 1.7) * amp * 0.4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = rgba(mood.top, alpha * 0.55);
      ctx.fill();
    };
    drawRidge(horizonY + 8, h * 0.1, mood.sun, phaseRef.current * 2, 0.85);
    drawRidge(horizonY + 30, h * 0.13, mood.grid, phaseRef.current * 2 + 2.2, 0.65);

    // scrolling floor grid
    const scroll = (t * 0.00025) % 1;
    ctx.strokeStyle = rgba(mood.grid, 0.7);
    ctx.lineWidth = 1;
    for (let k = -10; k <= 10; k++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + k * (w / 24), horizonY);
      ctx.lineTo(w / 2 + k * (w / 2.4), h);
      ctx.stroke();
    }
    for (let r = 0; r < 8; r++) {
      const p = ((r / 8 + scroll) % 1) ** 2.3;
      ctx.globalAlpha = 0.12 + p * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, horizonY + p * (h - horizonY));
      ctx.lineTo(w, horizonY + p * (h - horizonY));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // audio waveform overlay
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

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
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
          {playing ? "The terrain, sun and waveform react to the synth loop." : "Play a synthesized loop — everything on screen begins to move with it. Audio is generated locally; nothing plays without you."}
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
