"use client";

// STUDIO — Media library: upload images / GIFs / videos / audio, browse, delete.
// Also exports <MediaPicker>, the chooser used by the world editor and scene layers.
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, X, Film, ImageIcon, Music, Check } from "lucide-react";

export interface StudioAssetDTO {
  id: string;
  url: string;
  filename: string;
  kind: string; // image | video | audio
  mime: string;
  size: number;
  createdAt: string;
}

export async function fetchAssets(): Promise<StudioAssetDTO[]> {
  const r = await fetch("/api/studio/assets", { cache: "no-store" });
  if (!r.ok) return [];
  const d = await r.json();
  return d.assets || [];
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetThumb({ a, className }: { a: StudioAssetDTO; className?: string }) {
  if (a.kind === "video") {
    return (
      <video src={a.url} muted loop playsInline autoPlay className={className || "h-full w-full object-cover"} />
    );
  }
  if (a.kind === "audio") {
    return (
      <div className={`flex items-center justify-center bg-white/5 ${className || "h-full w-full"}`}>
        <Music className="h-6 w-6 text-white/40" />
      </div>
    );
  }
   
  return <img src={a.url} alt={a.filename} className={className || "h-full w-full object-cover"} draggable={false} />;
}

function kindIcon(kind: string) {
  if (kind === "video") return <Film className="h-3 w-3" />;
  if (kind === "audio") return <Music className="h-3 w-3" />;
  return <ImageIcon className="h-3 w-3" />;
}

export function MediaLibrary({ refreshKey }: { refreshKey?: number }) {
  const [assets, setAssets] = useState<StudioAssetDTO[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    void fetchAssets().then(setAssets);
  }, []);

  useEffect(load, [load, refreshKey]);

  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
       
      const r = await fetch("/api/studio/upload", { method: "POST", body: fd });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        alert(d.error || `Could not upload ${f.name}`);
      }
    }
    setBusy(false);
    load();
  };

  const remove = async (a: StudioAssetDTO) => {
    if (!confirm(`Delete ${a.filename} from the library? Layers using it will lose their source.`)) return;
    await fetch(`/api/studio/assets/${a.id}`, { method: "DELETE" });
    load();
  };

  const shown = assets.filter((a) => filter === "all" || a.kind === filter);

  return (
    <div>
      {/* dropzone + toolbar */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4 transition-colors ${dragOver ? "border-[#ff2e88] bg-[#ff2e88]/10" : "border-white/15 bg-white/[0.03]"}`}
      >
        <div className="text-[13px] text-white/60">
          <span className="font-semibold text-white/85">Drop files here</span> — images, GIFs, videos
          (mp4/webm), audio. Max 60&nbsp;MB each.
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-3.5 py-2 text-[13px] font-semibold text-black disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Uploading…" : "Upload files"}
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 flex gap-1.5">
        {(["all", "image", "video", "audio"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[12px] capitalize transition-colors ${
              filter === f ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {f === "all" ? "All files" : `${f}s`}
          </button>
        ))}
        <span className="ml-auto self-center text-[11.5px] text-white/35">{assets.length} assets</span>
      </div>

      {/* grid */}
      {shown.length === 0 ? (
        <p className="mt-8 text-center text-[13.5px] text-white/40">
          The library is empty — upload your first image, GIF or video above.
        </p>
      ) : (
        <div className="mt-4 grid max-h-[62vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 studio-scroll">
          {shown.map((a) => (
            <figure key={a.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <div className="aspect-video w-full overflow-hidden">
                <AssetThumb a={a} />
              </div>
              <figcaption className="flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] text-white/70">
                {kindIcon(a.kind)}
                <span className="truncate" title={a.filename}>{a.filename}</span>
                <span className="ml-auto shrink-0 text-white/35">{formatBytes(a.size)}</span>
              </figcaption>
              <button
                onClick={() => remove(a)}
                aria-label={`Delete ${a.filename}`}
                className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white/80 opacity-0 transition-opacity hover:text-[#ff5c7a] group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

/** Modal chooser used wherever a layer/background needs media. */
export function MediaPicker({
  open,
  onClose,
  onPick,
  acceptKinds = ["image", "video"],
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string, asset: StudioAssetDTO) => void;
  acceptKinds?: string[];
}) {
  const [assets, setAssets] = useState<StudioAssetDTO[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) void fetchAssets().then(setAssets);
  }, [open]);

  if (!open) return null;

  const upload = async (files: FileList) => {
    setBusy(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
       
      const r = await fetch("/api/studio/upload", { method: "POST", body: fd });
      if (r.ok) {
        const d = await r.json();
        setBusy(false);
        onPick(d.asset.url as string, d.asset as StudioAssetDTO);
        return;
      }
    }
    setBusy(false);
  };

  const shown = assets.filter((a) => acceptKinds.includes(a.kind));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[82vh] w-full max-w-3xl flex-col rounded-2xl border border-white/12 bg-[#121016] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-white">Choose media</h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files && upload(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12.5px] text-white hover:bg-white/20"
            >
              <Upload className="h-3.5 w-3.5" />
              {busy ? "Uploading…" : "Upload new"}
            </button>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 studio-scroll">
          {shown.length === 0 && (
            <p className="col-span-full py-10 text-center text-[13px] text-white/40">
              Nothing here yet — upload an image, GIF or video.
            </p>
          )}
          {shown.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                onPick(a.url, a);
                onClose();
              }}
              className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 transition-colors hover:border-[#ff2e88]"
              title={a.filename}
            >
              <AssetThumb a={a} />
              <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/70 px-2 py-1 text-left text-[10.5px] text-white/80">
                {kindIcon(a.kind)}
                <span className="truncate">{a.filename}</span>
                <Check className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
