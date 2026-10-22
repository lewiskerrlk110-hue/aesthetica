"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Bookmark, Share2, Trash2, Eye } from "lucide-react";
import { ArtworkCard, toggleLike, toggleBookmark, type ArtworkDTO } from "./artwork-card";
import { authHeaders } from "@/lib/identity";
import { useApp } from "@/lib/store";
import { MEDIUM_LABELS, WORLD_MAP, type WorldId } from "@/lib/aesthetics";
import { useToast } from "@/hooks/use-toast";

interface CommentDTO {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  authorId: string;
}

export function ArtworkViewer({
  artId,
  open,
  onClose,
}: {
  artId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const navigate = useApp((s) => s.navigate);
  const [art, setArt] = useState<ArtworkDTO | null>(null);
  const [related, setRelated] = useState<ArtworkDTO[]>([]);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/artworks/${artId}?userId=${authHeaders()["x-user-id"]}`);
    if (!res.ok) return;
    const data = await res.json();
    setArt(data.artwork);
    setRelated(data.related);
    const cres = await fetch(`/api/artworks/${artId}/comments`);
    if (cres.ok) {
      const cdata = await cres.json();
      setComments(cdata.comments);
    }
  }, [artId]);

  useEffect(() => {
    if (!open || !artId) return;
    setArt(null);
    load();
    fetch(`/api/artworks/${artId}`, { method: "PATCH" }).catch(() => {});
  }, [open, artId, load]);

  const like = async () => {
    if (!art) return;
    try {
      setArt(await toggleLike(art));
    } catch (e) {
      toast({ title: "Could not save like", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const bookmark = async () => {
    if (!art) return;
    try {
      setArt(await toggleBookmark(art));
      toast({ title: art.bookmarked ? "Removed from your collection" : "Saved to your collection" });
    } catch (e) {
      toast({ title: "Could not bookmark", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/artwork/${artId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Share this artwork with anyone" });
    } catch {
      toast({ title: "Copy this link", description: url });
    }
  };

  const remove = async () => {
    if (!art) return;
    const res = await fetch(`/api/artworks/${art.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      toast({ title: "Upload removed" });
      onClose();
      navigate({ view: "profile" });
    } else {
      const d = await res.json().catch(() => ({}));
      toast({ title: "Could not remove", description: d.error, variant: "destructive" });
    }
  };

  const comment = async () => {
    if (!commentText.trim() || !art) return;
    setSending(true);
    try {
      const res = await fetch(`/api/artworks/${art.id}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ body: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments((c) => [data.comment, ...c]);
      setCommentText("");
    } catch (e) {
      toast({ title: "Could not comment", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const world = art ? WORLD_MAP[art.aesthetic as WorldId] : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[92vh] w-[min(1100px,94vw)] max-w-[1100px] overflow-hidden border-[var(--w-panel-border)] bg-[var(--w-bg2)] p-0 text-[var(--w-fg)]"
        style={{ fontFamily: "var(--w-font-body)" }}
      >
        <DialogTitle className="sr-only">{art?.title || "Artwork"}</DialogTitle>
        {!art ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="img-skeleton h-40 w-40 rounded-xl" />
          </div>
        ) : (
          <div className="grid max-h-[92vh] overflow-y-auto w-scroll md:grid-cols-[1.5fr_1fr]">
            <div className="relative bg-black/30 p-3 md:p-4">
              <img
                src={art.imageUrl}
                alt={art.title}
                className="max-h-[62vh] w-full rounded-lg object-contain"
              />
              {art.description && (
                <p className="mt-3 px-1 text-[13.5px] leading-relaxed opacity-80">{art.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-[var(--w-panel-border)] p-4 md:border-l md:border-t-0">
              <div>
                <div className="flex items-center gap-2">
                  {world && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate({ view: "world", world: world.id });
                      }}
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest"
                      style={{ background: `${world.accent}22`, color: world.accent }}
                    >
                      {world.name}
                    </button>
                  )}
                  {art.year && <span className="text-[12px] opacity-50">{art.year}</span>}
                </div>
                <h2 className="w-display mt-2 text-2xl font-bold leading-tight">{art.title}</h2>
                <p className="mt-1 text-[13px] opacity-60">
                  {art.authorName} · {MEDIUM_LABELS[art.medium] || art.medium} ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <Eye className="inline h-3 w-3" />
                    {art.viewCount}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={like} className="w-btn" aria-pressed={art.liked}>
                  <Heart className={`h-4 w-4 ${art.liked ? "fill-[var(--w-accent)] text-[var(--w-accent)]" : ""}`} />
                  {art.likeCount}
                </button>
                <button onClick={bookmark} className="w-btn" aria-pressed={art.bookmarked}>
                  <Bookmark className={`h-4 w-4 ${art.bookmarked ? "fill-[var(--w-accent2)] text-[var(--w-accent2)]" : ""}`} />
                  Save
                </button>
                <button onClick={share} className="w-btn">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                {art.authorId === authHeaders()["x-user-id"] && art.authorId !== "curator" && (
                  <button onClick={remove} className="w-btn hover:!border-red-400" aria-label="Delete upload">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {art.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {art.tags.split(",").filter(Boolean).map((t) => (
                    <button
                      key={t}
                      className="w-tag"
                      onClick={() => {
                        onClose();
                        navigate({ view: "search", q: t });
                      }}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              <div className="min-h-0">
                <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-widest opacity-70">
                  <MessageCircle className="h-3.5 w-3.5" /> Notes ({comments.length})
                </h3>
                <div className="mb-3 flex gap-2">
                  <input
                    className="w-input text-[13px]"
                    placeholder="Leave a note on this piece…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && comment()}
                    maxLength={600}
                    aria-label="Write a comment"
                  />
                  <button
                    className="inline-flex shrink-0 items-center rounded-[var(--w-radius,0.75rem)] bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-2 text-[13px] font-semibold text-black shadow-[0_4px_18px_-6px_rgba(255,46,136,0.6)] transition-[filter,transform] hover:scale-[1.03] hover:brightness-110 disabled:opacity-50"
                    onClick={comment}
                    disabled={sending}
                  >
                    {sending ? "…" : "Post"}
                  </button>
                </div>
                <div className="flex max-h-52 flex-col gap-2.5 overflow-y-auto pr-1 w-scroll">
                  {comments.length === 0 && (
                    <p className="text-[13px] italic opacity-50">No notes yet. Be the first to write on the wall.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="w-panel px-3 py-2">
                      <p className="text-[13px] leading-snug">{c.body}</p>
                      <p className="mt-1 text-[11px] opacity-50">{c.authorName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="border-t border-[var(--w-panel-border)] p-4">
            <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-widest opacity-70">
              More from {world?.name}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-1 w-scroll">
              {related.map((r) => (
                <div key={r.id} className="w-44 shrink-0">
                  <ArtworkCard art={r as unknown as ArtworkDTO} compact />
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
