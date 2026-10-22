"use client";

// Visually similar — real image similarity, computed client-side.
// Each artwork is downscaled to 16x16 and summarised as a normalized
// 27-bin RGB colour histogram (3 levels per channel); similarity is the
// histogram intersection, boosted by shared tags and matching
// aesthetic/medium. No embeddings, no server work — just canvas maths.

export interface SimilarCandidate {
  id: string;
  title: string;
  imageUrl: string;
  aesthetic: string;
  medium: string;
  year: number | null;
  authorName: string;
  likeCount: number;
  tags: string;
}

const SIZE = 16; // sample grid — 256 pixels is plenty for a mood match
const CHANNEL_BINS = 3; // per R/G/B → 27 combined bins

function histogramFrom(data: Uint8ClampedArray): Float64Array {
  const h = new Float64Array(CHANNEL_BINS ** 3);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue; // skip transparent pixels
    const r = Math.min(CHANNEL_BINS - 1, (data[i] * CHANNEL_BINS) >> 8);
    const g = Math.min(CHANNEL_BINS - 1, (data[i + 1] * CHANNEL_BINS) >> 8);
    const b = Math.min(CHANNEL_BINS - 1, (data[i + 2] * CHANNEL_BINS) >> 8);
    h[r * CHANNEL_BINS * CHANNEL_BINS + g * CHANNEL_BINS + b]++;
  }
  let sum = 0;
  for (let i = 0; i < h.length; i++) sum += h[i];
  if (sum > 0) for (let i = 0; i < h.length; i++) h[i] /= sum;
  return h;
}

async function histogramFor(url: string): Promise<Float64Array | null> {
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    return histogramFrom(ctx.getImageData(0, 0, SIZE, SIZE).data);
  } catch {
    return null;
  }
}

/** Histogram intersection — 0..1, higher means closer palettes. */
function histogramSimilarity(a: Float64Array, b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.min(a[i], b[i]);
  return s;
}

function tagOverlap(a: string, b: string): number {
  const A = new Set(a.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
  const B = new Set(b.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  A.forEach((t) => {
    if (B.has(t)) shared++;
  });
  return shared / Math.max(A.size, B.size);
}

export interface ScoredCandidate {
  art: SimilarCandidate;
  score: number;
}

/** Rank candidates against the current artwork. Best first, top `limit`. */
export async function computeVisuallySimilar(
  current: { imageUrl: string; tags: string; aesthetic: string; medium: string },
  candidates: SimilarCandidate[],
  limit = 8,
): Promise<ScoredCandidate[]> {
  const base = await histogramFor(current.imageUrl);
  if (!base) return [];
  const scored = await Promise.all(
    candidates.map(async (art): Promise<ScoredCandidate | null> => {
      const hist = await histogramFor(art.imageUrl);
      if (!hist) return null;
      let score = histogramSimilarity(base, hist);
      score += tagOverlap(current.tags || "", art.tags || "") * 0.35;
      if (art.aesthetic === current.aesthetic) score += 0.08;
      if (art.medium === current.medium) score += 0.05;
      return { art, score };
    }),
  );
  return (scored.filter(Boolean) as ScoredCandidate[])
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
