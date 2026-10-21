"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DREAM_PROMPTS, DREAM_MOODS } from "@/lib/aesthetics";
import { authHeaders } from "@/lib/identity";
import { useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  BookHeart, Plus, Trash2, Pencil, Share2, Lock, Globe2, Search as SearchIcon,
  Heart, Wind, CloudRain, Sunrise, MapPin, Radio, Send,
} from "lucide-react";

// ═══════════════ THE DREAM JOURNAL ═══════════════
// Private by default. All writes scoped server-side to the
// device identity; publishing is an explicit act.

interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: string | null;
  location: string | null;
  tags: string;
  published: boolean;
  shareId: string;
  createdAt: string;
  updatedAt: string;
  mine: boolean;
}

export function DreamJournal() {
  const { toast } = useToast();
  const navigate = useApp((s) => s.navigate);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [published, setPublished] = useState<JournalEntry[]>([]);
  const [editing, setEditing] = useState<Partial<JournalEntry> | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const prompt = DREAM_PROMPTS[new Date().getDate() % DREAM_PROMPTS.length];

  const load = useCallback(async () => {
    setLoading(true);
    const [mineRes, pubRes] = await Promise.all([
      fetch("/api/journal?scope=mine", { headers: authHeaders() }),
      fetch("/api/journal?scope=published"),
    ]);
    if (mineRes.ok) setEntries((await mineRes.json()).entries || []);
    if (pubRes.ok) setPublished((await pubRes.json()).entries || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const save = async () => {
    if (!editing?.title?.trim() || !editing?.body?.trim()) {
      toast({ title: "The dream needs a title and a few lines", variant: "destructive" });
      return;
    }
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/journal" : `/api/journal/${editing.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: authHeaders(),
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({ title: "Could not save", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: isNew ? "Entry tucked into the journal" : "Entry updated", description: "Saved privately. Only you can read it." });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/journal/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) {
      toast({ title: "Entry released from the journal" });
      load();
    }
  };

  const togglePublish = async (e: JournalEntry) => {
    const res = await fetch(`/api/journal/${e.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ published: !e.published }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.entry.published) {
        const url = `${window.location.origin}${window.location.pathname}#/shared/${data.entry.shareId}`;
        setShareUrl(url);
        try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
        toast({ title: "Shared — link copied", description: "Anyone with the link can read this entry." });
      } else {
        toast({ title: "Entry is private again" });
      }
      load();
    }
  };

  const filtered = entries.filter(
    (e) =>
      !query.trim() ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.body.toLowerCase().includes(query.toLowerCase()) ||
      (e.tags || "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section aria-label="The Dream Journal" className="relative z-10 mx-auto max-w-6xl px-4 py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--w-accent)]">
            <BookHeart className="h-4 w-4" /> Signature feature
          </p>
          <h2 className="w-display mt-2 text-3xl font-bold text-[var(--w-fg)] md:text-4xl">The Dream Journal</h2>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[var(--w-fg-dim)]">
            A physical notebook found inside the dream. Entries are <strong>private by default</strong> —
            publishing is always your explicit choice.
          </p>
        </div>
        <button className="w-btn-primary w-btn" onClick={() => setEditing({ title: "", body: "", mood: DREAM_MOODS[0], location: "", tags: "" })}>
          <Plus className="h-4 w-4" /> New entry
        </button>
      </header>

      {/* Editor */}
      {editing && (
        <div className="paper mb-8 p-6 md:p-8" role="form" aria-label="Journal entry editor">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-[var(--font-caveat)] text-lg text-[#5a7ea8]">Today's prompt: “{prompt}”</p>
            <button onClick={() => setEditing(null)} className="text-[13px] text-[#5a7ea8] hover:underline">close</button>
          </div>
          <input
            className="mb-3 w-full border-b border-[#78c8f5]/40 bg-transparent pb-1.5 font-[var(--font-fraunces)] text-2xl font-semibold text-[#21324a] outline-none placeholder:text-[#21324a]/30"
            placeholder="Title the dream…"
            value={editing.title || ""}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            maxLength={140}
            aria-label="Entry title"
          />
          <textarea
            className="min-h-[220px] w-full resize-y bg-transparent font-[var(--font-caveat)] text-[21px] leading-[36px] text-[#21324a] outline-none placeholder:text-[#21324a]/30"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 35px, rgba(120,200,245,.35) 35px 36px)" }}
            placeholder="What did the sky look like? Was anyone else there? What happened just before you woke up?"
            value={editing.body || ""}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            maxLength={8000}
            aria-label="Entry body"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-[#21324a]/20 bg-white/60 px-2.5 py-1.5 text-[13px] text-[#21324a]"
              value={editing.mood || ""}
              onChange={(e) => setEditing({ ...editing, mood: e.target.value })}
              aria-label="Mood"
            >
              <option value="">mood…</option>
              {DREAM_MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              className="w-44 rounded-lg border border-[#21324a]/20 bg-white/60 px-2.5 py-1.5 text-[13px] text-[#21324a]"
              placeholder="place (e.g. the meadow)"
              value={editing.location || ""}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              aria-label="Dream location"
            />
            <input
              className="w-48 rounded-lg border border-[#21324a]/20 bg-white/60 px-2.5 py-1.5 text-[13px] text-[#21324a]"
              placeholder="tags, comma separated"
              value={editing.tags || ""}
              onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
              aria-label="Tags"
            />
            <button className="ml-auto rounded-full bg-[#e26fa8] px-5 py-2 text-[13.5px] font-semibold text-white shadow-md transition-transform hover:scale-[1.03]" onClick={save}>
              {editing.id ? "Save changes" : "Keep it"}
            </button>
          </div>
        </div>
      )}

      {shareUrl && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#78c8f5]/25 px-4 py-3 text-[13px] text-[#21324a]">
          <Share2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{shareUrl}</span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-[var(--w-fg-dim)]" />
        <input
          className="w-input max-w-sm text-[13.5px]"
          placeholder="Search your entries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search journal entries"
        />
        <span className="text-[12px] text-[var(--w-fg-dim)]">{entries.length} private · {published.length} shared by others</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* my entries */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-[var(--w-fg-dim)]">
            <Lock className="h-3.5 w-3.5" /> Your entries
          </h3>
          {loading && <div className="img-skeleton h-24 rounded-xl" />}
          {!loading && filtered.length === 0 && (
            <div className="paper p-5 text-center">
              <p className="font-[var(--font-caveat)] text-[20px] text-[#21324a]/70">No dreams written yet.</p>
              <p className="mt-1 text-[13px] text-[#21324a]/55">The notebook is patient. What did the sky look like?</p>
            </div>
          )}
          {filtered.map((e) => (
            <article key={e.id} className="paper group relative p-5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-[var(--font-fraunces)] text-lg font-semibold text-[#21324a]">{e.title}</h4>
                <div className="flex shrink-0 gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditing(e)} className="rounded p-1.5 hover:bg-[#21324a]/10" aria-label="Edit entry"><Pencil className="h-3.5 w-3.5 text-[#21324a]" /></button>
                  <button onClick={() => remove(e.id)} className="rounded p-1.5 hover:bg-[#21324a]/10" aria-label="Delete entry"><Trash2 className="h-3.5 w-3.5 text-[#c05a5a]" /></button>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-3 font-[var(--font-caveat)] text-[17px] leading-snug text-[#21324a]/80">{e.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#21324a]/60">
                {e.mood && <span className="rounded-full bg-[#e26fa8]/15 px-2 py-0.5">{e.mood}</span>}
                {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                <span>{new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <button
                onClick={() => togglePublish(e)}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                  e.published ? "bg-[#86d8d2]/40 text-[#1d5c58]" : "bg-[#21324a]/8 text-[#21324a]/70 hover:bg-[#21324a]/15"
                }`}
              >
                {e.published ? <><Globe2 className="h-3 w-3" /> Shared — make private</> : <><Share2 className="h-3 w-3" /> Share via link</>}
              </button>
            </article>
          ))}
        </div>

        {/* published stream */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-[var(--w-fg-dim)]">
            <Globe2 className="h-3.5 w-3.5" /> Published by other dreamers
          </h3>
          {published.length === 0 && (
            <div className="w-panel p-5 text-center text-[13.5px] text-[var(--w-fg-dim)]">
              No published entries yet. Yours could be the first gentle thing a stranger reads today.
            </div>
          )}
          {published.slice(0, 6).map((e) => (
            <article key={e.id} className="w-panel p-5">
              <h4 className="font-[var(--font-fraunces)] text-lg font-semibold">{e.title}</h4>
              <p className="mt-1.5 line-clamp-4 font-[var(--font-caveat)] text-[17px] leading-snug opacity-85">{e.body}</p>
              <div className="mt-2.5 flex items-center gap-2 text-[11px] opacity-55">
                {e.mood && <span className="rounded-full bg-[var(--w-accent)]/15 px-2 py-0.5">{e.mood}</span>}
                <span>a dreamer</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-[12px] text-[var(--w-fg-dim)]">
        Privacy is enforced on the server: private entries are never returned to other devices, and share links stop working the moment you make an entry private again.{" "}
        <button className="underline underline-offset-2 hover:opacity-80" onClick={() => navigate({ view: "profile" })}>Your journal lives on this device's key.</button>
      </p>
    </section>
  );
}

// ═══════════════ POSTCARDS FROM NOWHERE ═══════════════
interface PostcardDTO { id: string; title: string; caption: string; imageUrl: string; tags: string; hearts: number }

export function Postcards() {
  const [cards, setCards] = useState<PostcardDTO[]>([]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  useEffect(() => {
    fetch("/api/dreamseed?type=postcards").then((r) => r.json()).then((d) => setCards(d.postcards || [])).catch(() => {});
  }, []);

  const flip = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }));

  return (
    <section aria-label="Postcards from Nowhere" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--w-accent2)]">Interactive postcards</p>
        <h2 className="w-display mt-2 text-3xl font-bold text-[var(--w-fg)]">Postcards From Nowhere</h2>
        <p className="mt-2 max-w-xl text-[14.5px] text-[var(--w-fg-dim)]">Surreal dream landscapes with captions on the back. Flip one over — someone sent it from a place that does not exist.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => flip(c.id)}
            className="group relative h-72 text-left [perspective:1200px]"
            aria-pressed={flipped[c.id]}
            aria-label={`Postcard: ${c.title}`}
          >
            <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped[c.id] ? "rotateY(180deg)" : undefined }}>
              <div className="absolute inset-0 overflow-hidden rounded-2xl border-8 border-[#fff8ef] bg-white shadow-[0_18px_44px_-16px_rgba(60,90,130,0.5)] [backface-visibility:hidden]">
                <img src={c.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                <p className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 font-[var(--font-caveat)] text-[17px] text-[#21324a]">{c.title}</p>
              </div>
              <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border-8 border-[#fff8ef] bg-[#fff8ef] p-5 text-[#21324a] shadow-[0_18px_44px_-16px_rgba(60,90,130,0.5)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="font-[var(--font-caveat)] text-[22px] leading-snug">{c.caption}</p>
                <div className="flex items-center justify-between text-[12px] text-[#21324a]/60">
                  <span>♥ {c.hearts}</span>
                  <span>click to flip back</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ═══════════════ MEMORY FRAGMENTS ═══════════════
interface FragmentDTO { id: string; text: string; authorName: string; isSample: boolean; hearts: number }

export function MemoryFragments() {
  const { toast } = useToast();
  const [fragments, setFragments] = useState<FragmentDTO[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch("/api/fragments").then((r) => r.json()).then((d) => setFragments(d.fragments || [])).catch(() => {});
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const submit = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/fragments", { method: "POST", headers: authHeaders(), body: JSON.stringify({ text: draft.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDraft("");
      toast({ title: "Fragment released into the sky" });
      load();
    } catch (e) {
      toast({ title: "Could not submit", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-label="Memory Fragments" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--w-accent)]">Floating notes</p>
        <h2 className="w-display mt-2 text-3xl font-bold text-[var(--w-fg)]">Memory Fragments</h2>
        <p className="mt-2 max-w-xl text-[14.5px] text-[var(--w-fg-dim)]">
          Small, evocative pieces of writing that drift across the meadow. Items marked
          <span className="mx-1 rounded bg-[var(--w-accent)]/15 px-1.5 py-0.5 text-[11px]">sample</span>
          are the museum's seed writing — everything else is a real visitor contribution.
        </p>
      </header>

      <div className="mb-8 flex gap-2">
        <input
          className="w-input text-[14px]"
          placeholder="Leave a fragment in the sky… (280 characters)"
          value={draft}
          maxLength={280}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="New memory fragment"
        />
        <button className="w-btn-primary w-btn shrink-0" onClick={submit} disabled={sending}>
          <Send className="h-4 w-4" /> Release
        </button>
      </div>

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {fragments.map((f, i) => (
          <div
            key={f.id}
            className="ambient-soft break-inside-avoid rounded-xl border border-[var(--w-panel-border)] bg-[var(--w-panel)] px-5 py-4 backdrop-blur"
            style={{ animationDelay: `${-(i % 7)}s`, rotate: `${((i * 7) % 5) - 2}deg` }}
          >
            <p className="font-[var(--font-caveat)] text-[19px] leading-snug text-[var(--w-fg)]">“{f.text}”</p>
            <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-[var(--w-fg-dim)]">
              {f.isSample && <span className="rounded bg-[var(--w-accent)]/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">sample</span>}
              <span>— {f.authorName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════ THE CLOUD ATLAS ═══════════════
interface CloudLocDTO { id: string; name: string; description: string; imageUrl: string; tags: string }

export function CloudAtlas() {
  const [locs, setLocs] = useState<CloudLocDTO[]>([]);
  useEffect(() => {
    fetch("/api/dreamseed?type=locations").then((r) => r.json()).then((d) => setLocs(d.locations || [])).catch(() => {});
  }, []);
  return (
    <section aria-label="The Cloud Atlas" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--w-accent2)]">Imaginary cartography</p>
        <h2 className="w-display mt-2 text-3xl font-bold text-[var(--w-fg)]">The Cloud Atlas</h2>
        <p className="mt-2 max-w-xl text-[14.5px] text-[var(--w-fg-dim)]">
          An archive of locations that appear in dreams — documented by the community, illustrated by the museum.
          Every place here is fiction, clearly held as fiction.
        </p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {locs.map((l, i) => (
          <article key={l.id} className={`w-panel group flex flex-col overflow-hidden sm:flex-row ${i % 2 ? "sm:flex-row-reverse" : ""}`}>
            <div className="h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44">
              <img src={l.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="flex-1 p-5">
              <h3 className="w-display text-lg font-bold">{l.name}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed opacity-80">{l.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {l.tags.split(",").filter(Boolean).map((t) => <span key={t} className="w-tag !cursor-default">#{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ═══════════════ THE SLEEPY RADIO ═══════════════
// Fully synthesized ambience (WebAudio) — never autoplays.
const STATIONS = [
  { id: "wind", name: "Meadow Wind", icon: Wind, desc: "Soft gusts through tall grass", build: "wind" },
  { id: "rain", name: "Cloud Rain", icon: CloudRain, desc: "A warm shower on the bus roof", build: "rain" },
  { id: "dawn", name: "First Light", icon: Sunrise, desc: "A gentle synth pad at sunrise", build: "pad" },
] as const;

export function SleepyRadio() {
  const [on, setOn] = useState(false);
  const [station, setStation] = useState<(typeof STATIONS)[number]["id"]>("wind");
  const [volume, setVolume] = useState(0.4);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setOn(false);
  };

  const play = async (id: (typeof STATIONS)[number]["id"]) => {
    stop();
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    ctxRef.current = ac;
    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);
    gainRef.current = master;

    const stops: (() => void)[] = [];

    if (id === "wind" || id === "rain") {
      // filtered noise = wind / rain
      const bufferSize = 2 * ac.sampleRate;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ac.createBiquadFilter();
      filter.type = id === "wind" ? "lowpass" : "highpass";
      filter.frequency.value = id === "wind" ? 420 : 1400;
      const lfo = ac.createOscillator();
      lfo.frequency.value = id === "wind" ? 0.18 : 0.5;
      const lfoGain = ac.createGain();
      lfoGain.gain.value = id === "wind" ? 220 : 380;
      lfo.connect(lfoGain).connect(filter.frequency);
      const ng = ac.createGain();
      ng.gain.value = id === "wind" ? 0.5 : 0.32;
      src.connect(filter).connect(ng).connect(master);
      src.start();
      lfo.start();
      stops.push(() => { src.stop(); lfo.stop(); });
    }

    if (id === "pad") {
      // gentle major-9 pad
      const freqs = [220, 277.18, 329.63, 493.88];
      freqs.forEach((f, i) => {
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = ac.createGain();
        g.gain.value = 0;
        o.connect(g).connect(master);
        o.start();
        g.gain.linearRampToValueAtTime(0.05 / (i + 1), ac.currentTime + 2.5);
        // slow shimmer
        const lfo = ac.createOscillator();
        lfo.frequency.value = 0.1 + i * 0.07;
        const lg = ac.createGain();
        lg.gain.value = 0.018;
        lfo.connect(lg).connect(g.gain);
        lfo.start();
        stops.push(() => { o.stop(); lfo.stop(); });
      });
    }

    stopRef.current = () => stops.forEach((s) => s());
    setOn(true);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  return (
    <section aria-label="The Sleepy Radio" className="relative z-10 mx-auto max-w-3xl px-4 py-14">
      <div className="w-panel p-6">
        <header className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--w-accent)]/15">
            <Radio className="h-5 w-5 text-[var(--w-accent)]" />
          </span>
          <div>
            <h2 className="w-display text-xl font-bold">The Sleepy Radio</h2>
            <p className="text-[12.5px] text-[var(--w-fg-dim)]">A vintage cassette player for resting eyes. Synthesized ambience — never autoplays, always yours to start.</p>
          </div>
        </header>
        <div className="grid gap-2 sm:grid-cols-3">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => (on && station === s.id ? stop() : play(s.id))}
              aria-pressed={on && station === s.id}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all ${
                on && station === s.id ? "border-[var(--w-accent)] bg-[var(--w-accent)]/12" : "border-[var(--w-panel-border)] hover:border-[var(--w-accent)]/50"
              }`}
            >
              <s.icon className="h-4.5 w-4.5 text-[var(--w-accent2)]" />
              <span className="text-[13.5px] font-semibold">{s.name}</span>
              <span className="text-[11.5px] leading-snug text-[var(--w-fg-dim)]">{s.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={() => (on ? stop() : play(station))}
            className="w-btn-primary w-btn"
            aria-label={on ? "Turn the radio off" : "Turn the radio on"}
          >
            {on ? "Stop" : "Play"}
          </button>
          <label className="flex flex-1 items-center gap-2.5 text-[12px] text-[var(--w-fg-dim)]">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[var(--w-accent)]"
              aria-label="Radio volume"
            />
          </label>
          <span className={`h-2.5 w-2.5 rounded-full transition-all ${on ? "bg-[var(--w-accent)] shadow-[0_0_10px_var(--w-accent)]" : "bg-white/20"}`} aria-hidden />
        </div>
        <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--w-fg-dim)]">
          Sound is synthesized in your browser from filtered noise and soft oscillators —
          it is an atmosphere, not a recording. If you publish a journal entry it is text only;
          audio never leaves your device.
        </p>
      </div>
    </section>
  );
}
