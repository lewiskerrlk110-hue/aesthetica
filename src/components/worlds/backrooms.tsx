"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WORLD_MAP } from "@/lib/aesthetics";
import { WorldPage } from "./world-page";
import { BackroomsExplorer } from "@/components/features/backrooms-explorer";
import { authHeaders } from "@/lib/identity";
import { useToast } from "@/hooks/use-toast";
import { Radio, FileText, Volume2, VolumeX, Signal, Map as MapIcon } from "lucide-react";

// ————— Environment: yellow rooms, flicker, analog noise —————
function BackroomsEnv() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* wall */}
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg,#b5a24a 0 26px,#ab9a44 26px 52px)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 10%, transparent 30%, rgba(15,13,6,0.75) 90%)" }} />
      {/* ceiling strip with light panels */}
      <div className="absolute inset-x-0 top-0 h-[16%] bg-[#8a7c38]">
        <div className="absolute inset-x-0 top-[30%] flex justify-around">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="ambient-flicker h-3 w-16 bg-[#fdf3c0]" style={{ animationDelay: `${-i * 1.7}s`, opacity: 0.5 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </div>
      {/* corridor opening */}
      <div className="absolute bottom-[30%] left-1/2 h-[38%] w-[36%] -translate-x-1/2" style={{ background: "linear-gradient(#cbb95c,#9c8c3e)", clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 40px rgba(60,50,10,0.6)" }} />
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: "repeating-linear-gradient(0deg,#6e6230 0 14px,#665a2b 14px 28px)" }} />
      {/* analog noise */}
      <div className="film-grain absolute inset-0 opacity-70" />
      <div className="scanlines absolute inset-0 opacity-40" />
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
