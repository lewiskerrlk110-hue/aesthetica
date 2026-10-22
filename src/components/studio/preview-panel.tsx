"use client";

// STUDIO — Live preview panel: a real iframe of the museum that mirrors
// every unsaved edit as you type (via the studio draft bridge in
// lib/worlds-config.ts). Desktop / tablet / phone crops, reload, and an
// "unsaved" pill while drafts are on the wire.
import { useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Radio } from "lucide-react";
import { useStudioConfig } from "@/lib/worlds-config";

type Device = "desktop" | "tablet" | "phone";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  phone: "390px",
};

export function LivePreview({
  path,
  heightClass = "h-[520px] md:h-[660px]",
}: {
  path: string;
  heightClass?: string;
}) {
  const draft = useStudioConfig((s) => s.draft);
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  // iframe pointer-events guard while resizing etc. is unnecessary — but a
  // click on the stage shouldn't navigate the editor away, so we don't block.
  const draftCount = Object.keys(draft?.worlds || {}).length + (draft?.site ? 1 : 0);
  const external = path.startsWith("/#") ? path : `/#${path}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#131020] shadow-2xl">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#7df2d8]" />
          Live preview
        </span>
        {draftCount > 0 && (
          <span className="rounded-full bg-[#ffb347]/15 px-2 py-0.5 text-[10.5px] font-medium text-[#ffb347]">
            {draftCount} unsaved edit{draftCount > 1 ? "s" : ""} showing
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(
            [
              { d: "desktop" as Device, icon: Monitor, label: "Desktop" },
              { d: "tablet" as Device, icon: Tablet, label: "Tablet" },
              { d: "phone" as Device, icon: Smartphone, label: "Phone" },
            ]
          ).map(({ d, icon: Icon, label }) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              aria-label={`${label} preview`}
              className={`rounded-md p-1.5 transition-colors ${
                device === d ? "bg-[#ff2e88]/20 text-[#ff2e88]" : "text-white/45 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label="Reload preview"
            className="rounded-md p-1.5 text-white/45 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={external}
            target="_blank"
            rel="noreferrer"
            aria-label="Open in a new tab"
            className="rounded-md p-1.5 text-white/45 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* stage */}
      <div className={`relative w-full overflow-hidden bg-[#0b0a10] ${heightClass}`}>
        <div className="mx-auto h-full" style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}>
          <iframe
            key={`${path}-${reloadKey}`}
            src={external}
            title="Live preview of your changes"
            className="h-full w-full border-0 bg-black"
          />
        </div>
      </div>

      <p className="border-t border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10.5px] text-white/40">
        Edits appear here the moment you make them — saving makes them permanent.
      </p>
    </div>
  );
}
