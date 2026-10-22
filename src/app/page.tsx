"use client";

import { useEffect, useState } from "react";
import { useApp, initRouter } from "@/lib/store";
import type { WorldId } from "@/lib/aesthetics";
import { useStudioConfig, initStudioConfig } from "@/lib/worlds-config";
import { themeOverrideCss, type PortalWorldDef } from "@/lib/studio";
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
import { FrutigerPage } from "@/components/worlds/frutiger";
import { CustomWorldPage } from "@/components/worlds/custom-world";
import { Studio } from "@/components/studio/studio";

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

// Studio theme overrides — injected as CSS so color edits apply live.
function ThemeOverrides() {
  const worlds = useStudioConfig((s) => s.worlds);
  const css = themeOverrideCss(worlds);
  return <style>{css}</style>;
}

// Studio-assigned background media for built-in worlds: a media wash
// layered between the world's living environment and its content.
function BgOverlay({ def }: { def: PortalWorldDef }) {
  if (!def.bgMediaUrl) return null;
  const s = def.bgSettings || { opacity: 0.5, blend: "normal", fit: "cover", dim: 0.25 };
  const isVideo = /\.(mp4|webm|mov|ogv)(\?|$)/i.test(def.bgMediaUrl);
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      <div className="absolute inset-0" style={{ background: "#000", opacity: s.dim }} />
      {isVideo ? (
        <video
          src={def.bgMediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: s.fit, opacity: s.opacity, mixBlendMode: s.blend !== "normal" ? (s.blend as React.CSSProperties["mixBlendMode"]) : undefined }}
        />
      ) : (
         
        <img
          src={def.bgMediaUrl}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: s.fit, opacity: s.opacity, mixBlendMode: s.blend !== "normal" ? (s.blend as React.CSSProperties["mixBlendMode"]) : undefined }}
        />
      )}
    </div>
  );
}

function BuiltinWorld({ slug, def }: { slug: string; def?: PortalWorldDef }) {
  let page: React.ReactNode;
  switch (slug as WorldId) {
    case "retrowave":
      page = <RetrowavePage />;
      break;
    case "synthwave":
      page = <SynthwavePage />;
      break;
    case "vaporwave":
      page = <VaporwavePage />;
      break;
    case "y2k":
      page = <Y2KPage />;
      break;
    case "dreamcore":
      page = <DreamcorePage />;
      break;
    case "cyberpunk":
      page = <CyberpunkPage />;
      break;
    case "liminal":
      page = <LiminalPage />;
      break;
    case "backrooms":
      page = <BackroomsPage />;
      break;
    case "frutiger":
      page = <FrutigerPage />;
      break;
    default:
      return <Homepage />;
  }
  if (def?.bgMediaUrl) {
    return (
      <div className="relative">
        <BgOverlay def={def} />
        {page}
      </div>
    );
  }
  return page;
}

function WorldRouter() {
  const route = useApp((s) => s.route);
  const worlds = useStudioConfig((s) => s.worlds);
  if (route.view !== "world") return null;
  const slug = route.world;
  const def = worlds.find((w) => w.id === slug);
  if (def?.kind === "custom") return <CustomWorldPage def={def} />;
  return <BuiltinWorld slug={slug} def={def} />;
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
  const worlds = useStudioConfig((s) => s.worlds);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cleanup = initRouter();
    initStudioConfig();
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(id);
      cleanup();
    };
  }, []);

  // keep document title in sync with the world you're in
  useEffect(() => {
    if (route.view === "world") {
      const w = worlds.find((x) => x.id === route.world);
      if (w) document.title = `${w.name} — ${w.epithet} · AESTHETICA`;
      else document.title = "AESTHETICA — A Living Museum of Internet Aesthetics";
    } else if (route.view === "studio") {
      document.title = "Studio · AESTHETICA";
    } else if (route.view === "profile") {
      document.title = "Your Profile · AESTHETICA";
    } else {
      document.title = "AESTHETICA — A Living Museum of Internet Aesthetics";
    }
  }, [route, worlds]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0b14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff2e88] border-t-transparent" />
      </div>
    );
  }

  // Shared entries, uploads and the Studio render standalone (no nav chrome clash)
  if (route.view === "shared") {
    return <SharedEntry />;
  }
  if (route.view === "studio") {
    return <Studio />;
  }

  return (
    <div className="min-h-screen">
      <ThemeOverrides />
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
