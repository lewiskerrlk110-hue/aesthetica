"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { WORLD_MAP, WORLD_IDS, type WorldDef, type WorldId, GALLERY_FILTERS, MEDIUM_LABELS } from "@/lib/aesthetics";
import { ArtworkCard, useLikeHandler, type ArtworkDTO } from "@/components/gallery/artwork-card";
import { ArrowRight, LayoutGrid, Library, Sparkles } from "lucide-react";

export function WorldGallery({ world }: { world: WorldDef }) {
  const [arts, setArts] = useState<ArtworkDTO[]>([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [loading, setLoading] = useState(true);
  const like = useLikeHandler();
  const navigate = useApp((s) => s.navigate);
  const identRef = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("aesthetica_uid") || "" : ""), []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const url = `/api/artworks?aesthetic=${world.id}&sort=${sort}&limit=100&userId=${identRef}`;
      fetch(url)
        .then((r) => r.json())
        .then((d) => setArts(d.artworks || []))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, [world.id, sort, identRef]);

  const filtered = filter === "all" ? arts : arts.filter((a) => a.medium === filter);
  const filters = GALLERY_FILTERS[world.id as WorldId] ?? ["all", "photograph", "render", "poster"];

  const handleLike = async (a: ArtworkDTO) => {
    const updated = await like(a);
    if (updated) setArts((list) => list.map((x) => (x.id === updated.id ? updated : x)));
  };

  // Layout persona per world
  const gridClass: Record<WorldDef["galleryStyle"], string> = {
    cinematic: "grid grid-cols-1 sm:grid-cols-2 gap-5 [&>*:nth-child(3n+1)]:sm:col-span-2 [&>*:nth-child(3n+1)]:sm:aspect-[2/1] [&>*:nth-child(3n+1)]:sm:row-span-1",
    album: "grid grid-cols-2 md:grid-cols-3 gap-4 [&_img]:aspect-square [&_img]:object-cover",
    collage: "grid grid-cols-2 md:grid-cols-4 gap-4 [&>*:nth-child(4n+1)]:rotate-[0.8deg] [&>*:nth-child(4n+2)]:-rotate-[1deg] [&>*:nth-child(4n+3)]:translate-y-2 [&>*:nth-child(4n+2)]:md:translate-y-4 [&>*:nth-child(5n+1)]:md:col-span-2",
    glossy: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    spacious: "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:gap-14 [&>*:nth-child(4n+2)]:lg:translate-y-8 [&>*:nth-child(4n+3)]:lg:translate-y-4",
    editorial: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 [&>*:first-child]:md:col-span-2 [&>*:first-child]:md:aspect-[21/9]",
    photographic: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
    location: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
  };

  return (
    <section aria-label={`${world.name} gallery`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by medium">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className="w-tag"
              style={filter === f ? { color: "var(--w-fg)", borderColor: "var(--w-accent)", background: "color-mix(in srgb, var(--w-accent) 16%, transparent)" } : undefined}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "all works" : MEDIUM_LABELS[f] || f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="opacity-50">Sort</span>
          <button className={`rounded-full px-3 py-1 transition-colors ${sort === "recent" ? "bg-[var(--w-accent)] text-black" : "border border-[var(--w-panel-border)]"}`} onClick={() => setSort("recent")}>
            Newest
          </button>
          <button className={`rounded-full px-3 py-1 transition-colors ${sort === "popular" ? "bg-[var(--w-accent)] text-black" : "border border-[var(--w-panel-border)]"}`} onClick={() => setSort("popular")}>
            Most loved
          </button>
        </div>
      </div>

      {loading ? (
        <div className={gridClass[world.galleryStyle]}>
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="img-skeleton aspect-[4/3] rounded-[var(--w-radius)]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="w-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
          <LayoutGrid className="h-7 w-7 opacity-40" />
          <p className="text-[15px]">No works match this filter yet.</p>
          <button className="w-btn" onClick={() => navigate({ view: "upload" })}>
            Add the first one
          </button>
        </div>
      ) : (
        <div className={gridClass[world.galleryStyle]}>
          {filtered.map((a) => (
            <ArtworkCard key={a.id} art={a} onLike={handleLike} />
          ))}
        </div>
      )}
    </section>
  );
}

export function WorldArchive({ world }: { world: WorldDef }) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-center gap-3">
        <Library className="h-5 w-5" style={{ color: world.accent }} />
        <h2 className="w-display text-2xl font-bold">The Archive of {world.name}</h2>
      </header>
      <div className="relative space-y-0 border-l pl-6" style={{ borderColor: "var(--w-panel-border)" }}>
        {world.archive.map((s, i) => (
          <article key={i} className="relative pb-9 last:pb-0">
            <span
              className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2"
              style={{
                borderColor: s.kind === "documented" ? world.accent : world.accent2,
                background: "var(--w-bg)",
                boxShadow: `0 0 10px -1px ${s.kind === "documented" ? world.accent : world.accent2}`,
              }}
              aria-hidden
            />
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="w-display text-lg font-semibold">{s.heading}</h3>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: s.kind === "documented" ? `${world.accent}22` : `${world.accent2}22`,
                  color: s.kind === "documented" ? world.accent : world.accent2,
                }}
                title={s.kind === "documented" ? "Documented historical record" : "Cultural interpretation"}
              >
                {s.kind === "documented" ? "documented" : "interpretation"}
              </span>
            </div>
            <p className="text-[14.5px] leading-[1.75] opacity-85">{s.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 border-t pt-4 text-[12px] leading-relaxed opacity-50" style={{ borderColor: "var(--w-panel-border)" }}>
        This archive separates documented history from cultural interpretation. Where community
        fiction or creative writing appears elsewhere in this world, it is labelled as such.
      </p>
    </div>
  );
}

export function RelatedWorlds({ world }: { world: WorldDef }) {
  const navigate = useApp((s) => s.navigate);
  return (
    <section className="relative z-10 border-t border-[var(--w-panel-border)]" style={{ background: "color-mix(in srgb, var(--w-bg) 82%, black)" }}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-center text-[13px] font-semibold uppercase tracking-[0.35em] opacity-60">
          Step through a neighbouring world
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {world.related.map((rid) => {
            const w = WORLD_MAP[rid as WorldId];
            return (
              <button
                key={rid}
                onClick={() => navigate({ view: "world", world: rid })}
                className="group flex items-center gap-3 rounded-xl border border-[var(--w-panel-border)] px-4 py-3 transition-all hover:-translate-y-0.5"
                style={{ background: `linear-gradient(120deg, ${w.grad[0]}, ${w.grad[1]}22)` }}
              >
                <span className="h-6 w-6 rounded-full" style={{ background: `linear-gradient(135deg, ${w.grad[1]}, ${w.grad[2]})`, boxShadow: `0 0 12px -2px ${w.grad[1]}` }} />
                <span className="text-left">
                  <span className="block text-[14px] font-semibold">{w.name}</span>
                  <span className="block text-[11.5px] opacity-55">{w.epithet}</span>
                </span>
                <ArrowRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-1 group-hover:opacity-90" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorldTabs({
  world,
  tab,
  children,
}: {
  world: WorldDef;
  tab?: string;
  children: React.ReactNode;
}) {
  const navigate = useApp((s) => s.navigate);
  const route = useApp((s) => s.route);
  const current = route.view === "world" ? route.tab : undefined;
  void tab;
  const tabs = [
    { id: undefined, label: "World", icon: Sparkles },
    { id: "gallery", label: "Gallery", icon: LayoutGrid },
    { id: "archive", label: "Archive", icon: Library },
  ];
  return (
    <div>
      <nav className="relative z-20 flex justify-center gap-1.5" aria-label="World sections">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => navigate({ view: "world", world: world.id, tab: t.id })}
            aria-current={current === t.id}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] transition-all ${
              current === t.id ? "font-semibold" : "opacity-60 hover:opacity-100"
            }`}
            style={
              current === t.id
                ? { background: world.accent, color: "#0b0518" }
                : { border: "1px solid var(--w-panel-border)" }
            }
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}

export { WORLD_IDS };
