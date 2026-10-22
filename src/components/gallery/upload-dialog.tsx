"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2, Lock } from "lucide-react";
import { useApp } from "@/lib/store";
import { handleOf, useSession } from "@/lib/session";
import { MEDIUM_LABELS } from "@/lib/aesthetics";
import { useStudioWorlds } from "@/lib/worlds-config";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

// Upload flow: choose image → downscaled via canvas to ≤1400px JPEG/PNG
// → stored as data URL in SQLite (persistent, no external storage needed).
export function UploadDialog({ defaultWorld }: { defaultWorld?: string }) {
  const navigate = useApp((s) => s.navigate);
  const worlds = useStudioWorlds();
  const { toast } = useToast();
  const { user, loading } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [aesthetic, setAesthetic] = useState(defaultWorld || "retrowave");
  const [medium, setMedium] = useState("digital");
  const [year, setYear] = useState(2024);
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Images only", variant: "destructive" });
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const isPng = file.type === "image/png";
        setPreview(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? undefined : 0.88));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!preview) {
      toast({ title: "Choose an image first", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Give it a title", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, tags, imageUrl: preview, aesthetic, medium, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast({
        title: "Added to the archive",
        description: `"${title}" is now part of the ${worlds.find((w) => w.id === aesthetic)?.name ?? aesthetic} gallery.`,
      });
      navigate({ view: "world", world: aesthetic as never });
    } catch (e) {
      toast({
        title: "Could not upload",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const world = worlds.find((w) => w.id === aesthetic);

  // Posting is for account holders — guests get a friendly gate.
  if (!user) {
    if (loading) {
      return (
        <div className="w-page">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#ff2e88] border-t-transparent" />
          </div>
        </div>
      );
    }
    return (
      <div className="w-page">
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[17px] font-black text-black">Æ</span>
          <h1 className="w-display text-2xl font-bold md:text-3xl">Posting is for members</h1>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed opacity-70">
            Create a free account to add your work to the archive — or sign in if you already have
            one. Staff accounts also unlock the studio.
          </p>
          <button
            onClick={() => navigate({ view: "studio" })}
            className="cta-hero mt-6 !px-8 !py-3"
          >
            <Lock className="h-4 w-4" />
            Sign in or create an account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-page">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="w-display text-3xl font-bold md:text-4xl">Add to the archive</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed opacity-70">
          Your piece enters the chosen world's gallery immediately — tagged, searchable, and
          open to likes, saves and notes from other visitors.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[12px] opacity-90">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7df2d8]" />
          Posting as <span className="font-semibold">{handleOf(user)}</span>
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-[var(--w-panel-border)]">
                <img src={preview} alt="Upload preview" className="w-full object-cover" />
                <button
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-[12px] text-white backdrop-blur hover:bg-black/80"
                  onClick={() => setPreview(null)}
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--w-panel-border)] text-[var(--w-fg-dim)] transition-colors hover:border-[var(--w-accent)] hover:text-[var(--w-fg)]"
              >
                <ImageIcon className="h-10 w-10" />
                <span className="text-[14px]">Choose an image…</span>
                <span className="text-[12px] opacity-60">PNG or JPG, resized automatically</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            <label className="block text-[13px]">
              <span className="mb-1.5 block font-medium opacity-80">Title *</span>
              <input
                className="w-input !border-white/25 !bg-white/[0.08] text-[14.5px]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="What do you call it?"
              />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1.5 block font-medium opacity-80">Description</span>
              <textarea
                className="w-input min-h-[88px] resize-y !border-white/25 !bg-white/[0.08]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={600}
                placeholder="Materials, story, intent…"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[13px]">
                <span className="mb-1.5 block font-medium opacity-80">World</span>
                <select
                  className="w-input !border-white/25 !bg-white/[0.08]"
                  value={aesthetic}
                  onChange={(e) => setAesthetic(e.target.value)}
                >
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id} className="bg-neutral-900">
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px]">
                <span className="mb-1.5 block font-medium opacity-80">Medium</span>
                <select className="w-input !border-white/25 !bg-white/[0.08]" value={medium} onChange={(e) => setMedium(e.target.value)}>
                  {Object.entries(MEDIUM_LABELS).map(([k, v]) => (
                    <option key={k} value={k} className="bg-neutral-900">
                      {v}
                    </option>
                  ))}
                  <option value="digital" className="bg-neutral-900">Digital</option>
                </select>
              </label>
            </div>
            <label className="block text-[13px]">
              <span className="mb-1.5 block font-medium opacity-80">Tags (comma separated)</span>
              <input
                className="w-input !border-white/25 !bg-white/[0.08]"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={`e.g. ${world?.name.toLowerCase() ?? "aesthetic"}, neon, dream`}
              />
            </label>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="font-medium opacity-80">Year</span>
                <span className="opacity-60">{year}</span>
              </div>
              <Slider
                min={1960}
                max={2026}
                value={[year]}
                onValueChange={(v) => setYear(v[0])}
                aria-label="Year"
              />
            </div>
            <button
              onClick={submit}
              disabled={busy}
              className="cta-hero mt-1 w-full !py-3.5 sm:w-auto sm:!px-12"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {busy ? "Adding…" : "Add to the archive"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
