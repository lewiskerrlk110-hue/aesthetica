"use client";

// "Visually similar" strip inside the artwork viewer — fetches a candidate
// pool, ranks it by real pixel-palette similarity (see visual-similarity.ts)
// and shows the closest pieces as the familiar compact cards.
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ArtworkCard, type ArtworkDTO } from "./artwork-card";
import { computeVisuallySimilar, type SimilarCandidate } from "./visual-similarity";

export function VisuallySimilar({ art }: { art: ArtworkDTO }) {
  const [items, setItems] = useState<ArtworkDTO[] | null>(null);

  // Re-rank only when the actual subject changes (not on like/save toggles).
  const subjectKey = `${art.id}|${art.imageUrl}|${art.tags}|${art.aesthetic}|${art.medium}`;
  useEffect(() => {
    let alive = true;
    setItems(null);
    (async () => {
      try {
        const res = await fetch(`/api/artworks/${art.id}/similar`);
        if (!res.ok) throw new Error("no candidates");
        const data = (await res.json()) as { candidates: SimilarCandidate[] };
        const ranked = await computeVisuallySimilar(art, data.candidates || []);
        if (alive) setItems(ranked.map((r) => r.art as unknown as ArtworkDTO));
      } catch {
        if (alive) setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [subjectKey]);

  if (items !== null && items.length === 0) return null;

  return (
    <div className="shrink-0 border-t border-[var(--w-panel-border)] p-4">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-widest opacity-70">
        <Sparkles className="h-3.5 w-3.5 text-[#ffb347]" />
        Visually similar
      </h3>
      {items === null ? (
        <div className="flex items-center gap-3 pb-1">
          <div className="img-skeleton h-[99px] w-44 shrink-0 rounded-xl" />
          <div className="img-skeleton h-[99px] w-44 shrink-0 rounded-xl" />
          <div className="img-skeleton h-[99px] w-44 shrink-0 rounded-xl" />
          <p className="text-[12.5px] italic opacity-50">Comparing palettes…</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 w-scroll">
          {items.map((r) => (
            <div key={r.id} className="w-44 shrink-0">
              <ArtworkCard art={r} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
