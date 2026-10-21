"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Globe, Hash, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/lib/store";
import { WORLDS, type WorldId } from "@/lib/aesthetics";
import type { ArtworkDTO } from "./artwork-card";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, navigate, route } = useApp();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ArtworkDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 40);
  }, [searchOpen]);

  useEffect(() => {
    if (route.view === "search") {
      setQ((route as { q?: string }).q || "");
    }
  }, [route]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/artworks?q=${encodeURIComponent(q.trim())}&limit=24`);
        const data = await res.json();
        setResults(data.artworks || []);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const worlds = useMemo(() => {
    if (!q.trim()) return WORLDS;
    const s = q.toLowerCase();
    return WORLDS.filter(
      (w) => w.name.toLowerCase().includes(s) || w.epithet.toLowerCase().includes(s) || w.short.toLowerCase().includes(s),
    );
  }, [q]);

  const go = (fn: () => void) => {
    setSearchOpen(false);
    fn();
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[10vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)} role="dialog" aria-modal="true" aria-label="Search">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#12101a]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-4.5 w-4.5 text-white/50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artworks, tags, worlds…"
            className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
            aria-label="Search query"
          />
          <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40">ESC</kbd>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-3 w-scroll">
          {!q.trim() && (
            <>
              <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-white/35">Jump to a world</p>
              <div className="grid grid-cols-2 gap-1.5">
                {worlds.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => go(() => navigate({ view: "world", world: w.id as WorldId }))}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/8"
                  >
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{ background: `linear-gradient(135deg,${w.grad[1]},${w.grad[2]})` }}
                    />
                    <span>
                      <span className="block text-[13px] text-white">{w.name}</span>
                      <span className="block text-[11px] text-white/40">{w.epithet}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {q.trim() && worlds.length > 0 && (
            <>
              <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-widest text-white/35">Worlds</p>
              {worlds.map((w) => (
                <button
                  key={w.id}
                  onClick={() => go(() => navigate({ view: "world", world: w.id as WorldId }))}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-white/8"
                >
                  <Globe className="h-4 w-4 text-white/40" />
                  <span className="text-[13.5px] text-white">{w.name} — <span className="text-white/50">{w.epithet}</span></span>
                </button>
              ))}
            </>
          )}

          {q.trim() && (
            <>
              <p className="px-2 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                Artworks {searching ? "…" : `(${results.length})`}
              </p>
              {!searching && results.length === 0 && (
                <p className="px-2 py-3 text-[13px] text-white/40">Nothing in the archive matches “{q}”. Try a tag like “neon”, “rain” or “meadow”.</p>
              )}
              {results.map((a) => (
                <button
                  key={a.id}
                  onClick={() => go(() => navigate({ view: "artwork", id: a.id }))}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-white/8"
                >
                  <img src={a.imageUrl} alt="" className="h-10 w-14 rounded object-cover" loading="lazy" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] text-white">{a.title}</span>
                    <span className="block truncate text-[11.5px] text-white/40">
                      {WORLDS.find((w) => w.id === a.aesthetic)?.name} · {a.authorName}
                    </span>
                  </span>
                </button>
              ))}
              <button
                onClick={() => go(() => navigate({ view: "search", q }))}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-[12.5px] text-white/60 hover:bg-white/8 hover:text-white"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                View full results page for “{q}”
              </button>
            </>
          )}

          {q.trim() && results.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-2.5">
              <p className="px-2 text-[11px] text-white/35">Tip: clicking a piece opens it in the archive viewer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Full search results view (rendered as a route)
export function SearchResults() {
  const route = useApp((s) => s.route);
  const navigate = useApp((s) => s.navigate);
  const q = route.view === "search" ? route.q || "" : "";
  const [results, setResults] = useState<ArtworkDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      fetch(`/api/artworks?q=${encodeURIComponent(q.trim())}&limit=100`)
        .then((r) => r.json())
        .then((d) => setResults(d.artworks || []))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold md:text-3xl">
          {loading ? "Searching…" : results.length ? `${results.length} results for “${q}”` : `Nothing found for “${q}”`}
        </h1>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate({ view: "artwork", id: a.id })}
              className="art-card text-left"
            >
              <img src={a.imageUrl} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-2.5">
                <p className="truncate text-[13.5px] font-medium">{a.title}</p>
                <p className="truncate text-[12px] text-white/50">
                  {WORLDS.find((w) => w.id === a.aesthetic)?.name} · {a.authorName}
                </p>
              </div>
            </button>
          ))}
        </div>
        {!loading && results.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <Hash className="mt-1 h-4 w-4 text-white/40" />
            {Array.from(new Set(results.flatMap((a) => a.tags.split(",").filter(Boolean)))).slice(0, 18).map((t) => (
              <button key={t} onClick={() => navigate({ view: "search", q: t })} className="rounded-full border border-white/15 px-3 py-1 text-[12.5px] text-white/70 hover:border-white/40 hover:text-white">
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
