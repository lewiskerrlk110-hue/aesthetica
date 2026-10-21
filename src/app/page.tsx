"use client";

import { useEffect, useState } from "react";
import { useApp, initRouter } from "@/lib/store";
import { WORLD_MAP, type WorldId } from "@/lib/aesthetics";
import { Nav } from "@/components/shared/nav";
import { Homepage } from "@/components/homepage/homepage";
import { SearchOverlay, SearchResults } from "@/components/gallery/search";
import { ArtworkViewer } from "@/components/gallery/artwork-viewer";
import { UploadDialog } from "@/components/gallery/upload-dialog";
import { Profile } from "@/components/shared/profile";
import { RetrowavePage } from "@/components/worlds/retrowave";
import { SynthwavePage } from "@/components/worlds/synthwave";
import { VaporwavePage } from "@/components/worlds/vaporwave";
import { Y2KPage } from "@/components/worlds/y2k";
import { DreamcorePage } from "@/components/worlds/dreamcore";
import { CyberpunkPage } from "@/components/worlds/cyberpunk";
import { LiminalPage } from "@/components/worlds/liminal";
import { BackroomsPage } from "@/components/worlds/backrooms";

// Shared-entry artwork viewer: any route can open an artwork modal.
function GlobalViewer() {
  const route = useApp((s) => s.route);
  const navigate = useApp((s) => s.navigate);
  if (route.view !== "artwork") return null;
  return (
    <ArtworkViewer
      artId={route.id}
      open
      onClose={() => {
        const back = (route as { back?: string }).back;
        if (back) window.history.back();
        else navigate({ view: "home" });
      }}
    />
  );
}

function WorldRouter() {
  const route = useApp((s) => s.route);
  if (route.view !== "world") return null;
  const world = route.world as WorldId;
  switch (world) {
    case "retrowave":
      return <RetrowavePage />;
    case "synthwave":
      return <SynthwavePage />;
    case "vaporwave":
      return <VaporwavePage />;
    case "y2k":
      return <Y2KPage />;
    case "dreamcore":
      return <DreamcorePage />;
    case "cyberpunk":
      return <CyberpunkPage />;
    case "liminal":
      return <LiminalPage />;
    case "backrooms":
      return <BackroomsPage />;
    default:
      return <Homepage />;
  }
}

// Shared dream journal links: read-only published entry
function SharedEntry() {
  const route = useApp((s) => s.route);
  const [entry, setEntry] = useState<{ title: string; body: string; mood: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shareId = route.view === "shared" ? route.shareId : "";

  useEffect(() => {
    if (!shareId) return;
    fetch(`/api/journal/x?shareId=${shareId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Unavailable");
        setEntry(d.entry);
      })
      .catch((e) => setError(e.message));
  }, [shareId]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "linear-gradient(#78c8f5,#c9e8fb 60%,#fff8ef)" }}>
      <div className="paper w-full max-w-lg p-8">
        {error && <p className="text-[15px] text-[#c05a5a]">{error}</p>}
        {!error && !entry && <p className="text-[15px] text-[#21324a]/60">Opening the journal…</p>}
        {entry && (
          <>
            <p className="font-[var(--font-caveat)] text-[17px] text-[#5a7ea8]">a dream, shared with you</p>
            <h1 className="mt-1 font-[var(--font-fraunces)] text-2xl font-semibold text-[#21324a]">{entry.title}</h1>
            <p className="mt-4 whitespace-pre-line font-[var(--font-caveat)] text-[21px] leading-[34px] text-[#21324a]">{entry.body}</p>
            {entry.mood && <p className="mt-4 inline-block rounded-full bg-[#e26fa8]/15 px-3 py-1 text-[12.5px] text-[#21324a]">{entry.mood}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const route = useApp((s) => s.route);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cleanup = initRouter();
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(id);
      cleanup();
    };
  }, []);

  // keep document title in sync with the world you're in
  useEffect(() => {
    if (route.view === "world" && WORLD_MAP[route.world as WorldId]) {
      const w = WORLD_MAP[route.world as WorldId];
      document.title = `${w.name} — ${w.epithet} · AESTHETICA`;
    } else if (route.view === "profile") {
      document.title = "Your Profile · AESTHETICA";
    } else {
      document.title = "AESTHETICA — A Living Museum of Internet Aesthetics";
    }
  }, [route]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0b14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff2e88] border-t-transparent" />
      </div>
    );
  }

  // Shared entries and upload render standalone (no nav chrome clash)
  if (route.view === "shared") {
    return <SharedEntry />;
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {route.view === "home" && <Homepage />}
        <WorldRouter />
        {route.view === "search" && <SearchResults />}
        {route.view === "profile" && <Profile />}
        {route.view === "upload" && <UploadDialog />}
      </main>
      <GlobalViewer />
      <SearchOverlay />
    </div>
  );
}
