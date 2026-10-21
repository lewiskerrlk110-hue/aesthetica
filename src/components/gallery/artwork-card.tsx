"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { authHeaders } from "@/lib/identity";
import { useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export interface ArtworkDTO {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  aesthetic: string;
  medium: string;
  year: number | null;
  authorName: string;
  authorId: string;
  tags: string;
  featured: boolean;
  likeCount: number;
  viewCount: number;
  liked: boolean;
  bookmarked: boolean;
  _count?: { comments: number; likes: number; bookmarks: number };
  createdAt: string;
}

export function ArtworkCard({
  art,
  onLike,
  compact,
}: {
  art: ArtworkDTO;
  onLike?: (a: ArtworkDTO) => void;
  compact?: boolean;
}) {
  const navigate = useApp((s) => s.navigate);
  return (
    <article
      className="art-card group flex flex-col"
      onClick={() => navigate({ view: "artwork", id: art.id })}
      onKeyDown={(e) => e.key === "Enter" && navigate({ view: "artwork", id: art.id })}
      tabIndex={0}
      role="button"
      aria-label={`${art.title} by ${art.authorName}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={art.imageUrl}
          alt={art.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 right-2 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-white backdrop-blur transition-colors hover:bg-black/75"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(art);
            }}
            aria-label={art.liked ? "Unlike" : "Like"}
          >
            <Heart className={`h-3.5 w-3.5 ${art.liked ? "fill-[var(--w-accent)] text-[var(--w-accent)]" : ""}`} />
            {art.likeCount}
          </button>
          <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-white backdrop-blur">
            <MessageCircle className="h-3.5 w-3.5" />
            {art._count?.comments ?? 0}
          </span>
          <span className="ml-auto rounded-full bg-black/55 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white/80 backdrop-blur">
            {art.medium}
          </span>
        </div>
        {art.bookmarked && (
          <Bookmark className="absolute right-2 top-2 h-4 w-4 fill-[var(--w-accent2)] text-[var(--w-accent2)]" />
        )}
      </div>
      {!compact && (
        <div className="flex items-start justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-medium leading-snug">{art.title}</h3>
            <p className="mt-0.5 truncate text-[12px] opacity-60">{art.authorName}</p>
          </div>
          {art.year && <span className="shrink-0 text-[12px] opacity-50">{art.year}</span>}
        </div>
      )}
    </article>
  );
}

export async function toggleLike(art: ArtworkDTO): Promise<ArtworkDTO> {
  const res = await fetch(`/api/artworks/${art.id}/like`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not save your like");
  }
  const data = await res.json();
  return { ...art, liked: data.liked, likeCount: data.likeCount };
}

export async function toggleBookmark(art: ArtworkDTO): Promise<ArtworkDTO> {
  const res = await fetch(`/api/artworks/${art.id}/bookmark`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not save your bookmark");
  }
  const data = await res.json();
  return { ...art, bookmarked: data.bookmarked };
}

export function useLikeHandler() {
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const handleLike = async (art: ArtworkDTO): Promise<ArtworkDTO | null> => {
    if (busy[art.id]) return null;
    setBusy((b) => ({ ...b, [art.id]: true }));
    try {
      return await toggleLike(art);
    } catch (e) {
      toast({ title: "Sign of life required", description: e instanceof Error ? e.message : "Try refreshing", variant: "destructive" });
      return null;
    } finally {
      setBusy((b) => ({ ...b, [art.id]: false }));
    }
  };
  return handleLike;
}
