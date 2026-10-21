"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { getIdentity, setName as saveName } from "@/lib/identity";
import { ArtworkCard, type ArtworkDTO } from "@/components/gallery/artwork-card";
import { BookHeart, Image as ImageIcon, Bookmark, User } from "lucide-react";

// Personal space: your uploads, saved works, journal stats.
// Identity = this device. No accounts, no servers of personal data.
export function Profile() {
  const navigate = useApp((s) => s.navigate);
  const [ident, setIdent] = useState({ id: "", name: "" });
  const [nameDraft, setNameDraft] = useState("");
  const [uploads, setUploads] = useState<ArtworkDTO[]>([]);
  const [saved, setSaved] = useState<ArtworkDTO[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [tab, setTab] = useState<"uploads" | "saved">("uploads");

  useEffect(() => {
    const t = setTimeout(() => {
      const i = getIdentity();
      setIdent(i);
      setNameDraft(i.name);
      if (!i.id) return;
      fetch(`/api/artworks?authorId=${i.id}&limit=60`).then((r) => r.json()).then((d) => setUploads(d.artworks || [])).catch(() => {});
      fetch(`/api/artworks?bookmarkedBy=${i.id}&limit=60`).then((r) => r.json()).then((d) => setSaved(d.artworks || [])).catch(() => {});
      fetch("/api/journal?scope=mine", { headers: { "x-user-id": i.id } }).then((r) => r.json()).then((d) => setJournalCount((d.entries || []).length)).catch(() => {});
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const cards = tab === "uploads" ? uploads : saved;

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <header className="flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-2xl font-black text-black">
            {ident.name.slice(0, 1).toUpperCase() || <User className="h-7 w-7" />}
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/40">Your corner of the museum</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => { saveName(nameDraft.trim() || ident.name); setIdent({ ...ident, name: nameDraft.trim() || ident.name }); }}
                className="w-56 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xl font-bold outline-none focus:border-[#ff2e88]"
                aria-label="Display name"
                maxLength={48}
              />
              <span className="text-[12px] text-white/40">press elsewhere to save</span>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{uploads.length}</p>
              <p className="text-[11.5px] text-white/45">uploads</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{saved.length}</p>
              <p className="text-[11.5px] text-white/45">saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{journalCount}</p>
              <p className="text-[11.5px] text-white/45">dreams</p>
            </div>
          </div>
        </header>

        <div className="mt-10 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("uploads")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] transition-colors ${tab === "uploads" ? "bg-white text-black font-semibold" : "border border-white/15 text-white/70 hover:text-white"}`}
          >
            <ImageIcon className="h-4 w-4" /> Your uploads
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] transition-colors ${tab === "saved" ? "bg-white text-black font-semibold" : "border border-white/15 text-white/70 hover:text-white"}`}
          >
            <Bookmark className="h-4 w-4" /> Saved collection
          </button>
          <button
            onClick={() => navigate({ view: "world", world: "dreamcore" })}
            className={`flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[13.5px] text-white/70 transition-colors hover:text-white`}
          >
            <BookHeart className="h-4 w-4" /> Open dream journal
          </button>
          <button
            onClick={() => navigate({ view: "upload" })}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-4 py-2 text-[13.5px] font-semibold text-black"
          >
            Add artwork
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((a) => (
            <ArtworkCard key={a.id} art={a} />
          ))}
        </div>
        {cards.length === 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-[15px] text-white/60">
              {tab === "uploads" ? "Nothing uploaded from this device yet." : "No saved works yet — tap the bookmark on any piece you love."}
            </p>
            <p className="mt-2 text-[13px] text-white/40">The eight worlds are waiting. Pick a door.</p>
          </div>
        )}
      </div>
    </div>
  );
}
