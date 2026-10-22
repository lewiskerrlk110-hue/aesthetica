// ─────────────────────────────────────────────
// AESTHETICA STUDIO — shared types + merge engine
// Client-safe: no server-only imports here.
// ─────────────────────────────────────────────

/** Visual treatments for a world's hero title (the retrowave-logo vibe). */
export type TitleEffect = "none" | "chrome" | "neon" | "holo" | "vapor" | "outline";

export const TITLE_EFFECTS: { value: TitleEffect; label: string; desc: string }[] = [
  { value: "none", label: "None", desc: "flat colour" },
  { value: "chrome", label: "Chrome", desc: "80s gradient metal" },
  { value: "neon", label: "Neon", desc: "glow-tube halo" },
  { value: "holo", label: "Holographic", desc: "iridescent sheen" },
  { value: "vapor", label: "Vapor", desc: "pastel drift" },
  { value: "outline", label: "Outline", desc: "hollow neon tube" },
];

/** CSS class for a title effect key ("" for none/unknown). */
export function effectClass(effect?: string | null): string {
  if (!effect || effect === "none") return "";
  return `ae-fx-${effect}`;
}

export interface WorldThemePatch {
  bg?: string;
  bg2?: string;
  fg?: string;
  accent?: string;
  accent2?: string;
  panel?: string;
  panelBorder?: string;
  radius?: string;
  // ——— typography & layout (Studio “Type & layout” tab) ———
  /** FONT_LIBRARY key for display/headings. "" = world default. */
  fontDisplay?: string;
  /** FONT_LIBRARY key for body copy. "" = world default. */
  fontBody?: string;
  /** Hero title size multiplier, 0.5–2 (1 = built-in size). */
  titleScale?: number;
  /** Hero text alignment. */
  heroAlign?: "left" | "center" | "right";
  /** Hero min-height in vh (default 62). */
  heroHeight?: number;
  /** Hero vertical offset in vh, negative raises the block. */
  heroOffsetY?: number;
  /** Content column max-width in rem (default 80 = max-w-7xl). */
  contentWidth?: number;
  /** Hero title visual effect: chrome | neon | holo | vapor | outline | none. */
  titleEffect?: string;
  /** FONT_LIBRARY key for the epithet/tagline (e.g. a retro script). "" = world default. */
  epithetFont?: string;
}

// ————— Font library —————
// Every font is loaded once in layout.tsx via next/font and exposed as a
// CSS variable; a Studio pick just re-points --w-font-* / --page-font-*.
export type FontGenre = "retro" | "techno" | "y2k" | "dream" | "eerie" | "fresh" | "script" | "clean";

export const FONT_GENRES: Record<FontGenre, { label: string; color: string }> = {
  retro: { label: "Retro", color: "#ff2e88" },
  techno: { label: "Techno", color: "#9be8ff" },
  y2k: { label: "Y2K", color: "#b8a6ff" },
  dream: { label: "Dream", color: "#cdb4ff" },
  eerie: { label: "Eerie", color: "#ffb347" },
  fresh: { label: "Fresh", color: "#7df2d8" },
  script: { label: "Script", color: "#ff9ecb" },
  clean: { label: "Clean", color: "rgba(255,255,255,0.5)" },
};

export interface FontDef {
  key: string;
  label: string;
  hint: string;
  stack: string;
  genre?: FontGenre;
}

export const FONT_LIBRARY: FontDef[] = [
  // — retro / chrome / neon —
  { key: "michroma", label: "Michroma", hint: "wide chrome caps — 80s logo lettering", stack: "var(--font-michroma), sans-serif", genre: "retro" },
  { key: "monoton", label: "Monoton", hint: "neon tube outlines — boardwalk signs", stack: "var(--font-monoton), cursive", genre: "retro" },
  { key: "audiowide", label: "Audiowide", hint: "retro wide techno", stack: "var(--font-audiowide), sans-serif", genre: "retro" },
  { key: "orbitron", label: "Orbitron", hint: "techno display", stack: "var(--font-orbitron), sans-serif", genre: "retro" },
  // — script accents —
  { key: "mrs-saint-delafield", label: "Mrs Saint Delafield", hint: "flowing signature script — the pink \u201cFace\u201d", stack: "var(--font-mrs-saint-delafield), cursive", genre: "script" },
  { key: "yellowtail", label: "Yellowtail", hint: "brushy retro script", stack: "var(--font-yellowtail), cursive", genre: "script" },
  { key: "caveat", label: "Caveat", hint: "casual handwritten", stack: "var(--font-caveat), cursive", genre: "script" },
  // — y2k —
  { key: "bungee", label: "Bungee", hint: "chunky signage caps", stack: "var(--font-bungee), sans-serif", genre: "y2k" },
  { key: "righteous", label: "Righteous", hint: "rounded bubble display", stack: "var(--font-righteous), sans-serif", genre: "y2k" },
  // — techno / cyberpunk —
  { key: "rajdhani", label: "Rajdhani", hint: "condensed cyber headings", stack: "var(--font-rajdhani), sans-serif", genre: "techno" },
  { key: "share-tech-mono", label: "Share Tech Mono", hint: "hacker terminal mono", stack: "var(--font-share-tech-mono), monospace", genre: "techno" },
  { key: "ibm-plex-mono", label: "IBM Plex Mono", hint: "terminal mono", stack: "var(--font-ibm-plex-mono), monospace", genre: "techno" },
  { key: "vt323", label: "VT323", hint: "phosphor CRT terminal", stack: "var(--font-vt323), monospace", genre: "techno" },
  // — eerie / liminal —
  { key: "special-elite", label: "Special Elite", hint: "worn typewriter — found notes", stack: "var(--font-special-elite), cursive", genre: "eerie" },
  // — fresh / frutiger —
  { key: "quicksand", label: "Quicksand", hint: "glossy rounded — aero bubbles", stack: "var(--font-quicksand), sans-serif", genre: "fresh" },
  { key: "outfit", label: "Outfit", hint: "geometric sans", stack: "var(--font-outfit), sans-serif", genre: "fresh" },
  // — dream —
  { key: "cormorant-garamond", label: "Cormorant Garamond", hint: "soft storybook serif", stack: "var(--font-cormorant-garamond), serif", genre: "dream" },
  { key: "fraunces", label: "Fraunces", hint: "soft editorial serif", stack: "var(--font-fraunces), serif", genre: "dream" },
  // — clean workhorses —
  { key: "space-grotesk", label: "Space Grotesk", hint: "modern grotesk", stack: "var(--font-space-grotesk), sans-serif", genre: "clean" },
  { key: "dm-sans", label: "DM Sans", hint: "clean body text", stack: "var(--font-dm-sans), sans-serif", genre: "clean" },
  { key: "ibm-plex-sans", label: "IBM Plex Sans", hint: "neutral workhorse", stack: "var(--font-ibm-plex-sans), sans-serif", genre: "clean" },
];

/** CSS font-family stack for a FONT_LIBRARY key, or null if unknown/empty. */
export function fontStack(key?: string | null): string | null {
  if (!key) return null;
  return FONT_LIBRARY.find((f) => f.key === key)?.stack ?? null;
}

// ————— Genre packs —————
// One-click typography moods, curated per internet aesthetic. Applying a
// pack sets the display font, body font, epithet font and hero-title
// effect in one stroke — e.g. the retrowave logo pairing: wide chrome
// caps + flowing script.
export interface GenrePack {
  key: string;
  label: string;
  blurb: string;
  fontDisplay: string;
  fontBody: string;
  epithetFont: string; // "" = leave the world's default
  effect: TitleEffect;
  /** Built-in world ids this pack was tuned for (highlighted in Studio). */
  worlds: string[];
  /** Sample words shown on the pack card. */
  sample: string;
}

export const GENRE_PACKS: GenrePack[] = [
  {
    key: "retro-chrome",
    label: "Retro Chrome",
    blurb: "Wide chrome caps + flowing script — the 1987 ski-logo pairing.",
    fontDisplay: "michroma",
    fontBody: "dm-sans",
    epithetFont: "mrs-saint-delafield",
    effect: "chrome",
    worlds: ["retrowave", "synthwave"],
    sample: "NORTH",
  },
  {
    key: "neon-drive",
    label: "Neon Drive",
    blurb: "Retro-wide techno with a hot neon halo and brush-script accents.",
    fontDisplay: "audiowide",
    fontBody: "space-grotesk",
    epithetFont: "yellowtail",
    effect: "neon",
    worlds: ["synthwave", "retrowave"],
    sample: "DRIVE",
  },
  {
    key: "mall-neon",
    label: "Mall Neon",
    blurb: "Boardwalk tube-lettering over a casual hand — pastel and dreamy.",
    fontDisplay: "monoton",
    fontBody: "caveat",
    epithetFont: "caveat",
    effect: "vapor",
    worlds: ["vaporwave"],
    sample: "A E S T H E T I C",
  },
  {
    key: "bubble-pop",
    label: "Bubble Pop",
    blurb: "Chunky signage caps, rounded bubbles, iridescent sheen.",
    fontDisplay: "bungee",
    fontBody: "outfit",
    epithetFont: "righteous",
    effect: "holo",
    worlds: ["y2k"],
    sample: "CYBER",
  },
  {
    key: "lucid-serif",
    label: "Lucid Serif",
    blurb: "Soft storybook serif for half-remembered rooms.",
    fontDisplay: "cormorant-garamond",
    fontBody: "dm-sans",
    epithetFont: "caveat",
    effect: "none",
    worlds: ["dreamcore", "liminal"],
    sample: "Reverie",
  },
  {
    key: "found-tape",
    label: "Found Tape",
    blurb: "Worn typewriter headings — notes left in yellow rooms.",
    fontDisplay: "special-elite",
    fontBody: "ibm-plex-sans",
    epithetFont: "vt323",
    effect: "outline",
    worlds: ["backrooms", "liminal"],
    sample: "LEVEL 0",
  },
  {
    key: "ghost-terminal",
    label: "Ghost Terminal",
    blurb: "Condensed cyber headings + phosphor mono, cold and precise.",
    fontDisplay: "rajdhani",
    fontBody: "share-tech-mono",
    epithetFont: "",
    effect: "neon",
    worlds: ["cyberpunk"],
    sample: "JACK_IN",
  },
  {
    key: "aero-gloss",
    label: "Aero Gloss",
    blurb: "Glossy rounded humanism — bubbles, skies and optimism.",
    fontDisplay: "quicksand",
    fontBody: "dm-sans",
    epithetFont: "",
    effect: "none",
    worlds: ["frutiger"],
    sample: "Breathe",
  },
];

export interface BgSettings {
  opacity: number; // 0–1
  blend: string; // css mix-blend-mode
  fit: "cover" | "contain" | "fill";
  dim: number; // 0–1 darkening wash under media
}

export type SceneLayerType = "media" | "text" | "shape" | "gradient";

export type SceneAnim = "none" | "float" | "drift" | "flicker" | "pulse" | "spin" | "sway";

/** A single editable element of a custom world's scene.
 *  Geometry (x/y/w/h) is % of the stage. Font size is cqh (% of stage height). */
export interface SceneLayer {
  id: string;
  type: SceneLayerType;
  name?: string;
  // media
  url?: string;
  fit?: "cover" | "contain" | "fill";
  // text
  text?: string;
  fontSize?: number; // cqh units
  color?: string;
  weight?: number;
  italic?: boolean;
  letterSpacing?: number; // em
  font?: "display" | "body" | "mono";
  /** Exact FONT_LIBRARY family for this layer (wins over the display/body/mono trio). */
  fontKey?: string;
  align?: "left" | "center" | "right";
  // shape
  variant?: "rect" | "ellipse";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number; // px
  // gradient
  angle?: number;
  from?: string;
  to?: string;
  // geometry
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  // look
  z: number;
  opacity: number; // 0–1
  blend?: string;
  // motion
  anim?: SceneAnim;
  animDur?: number; // seconds
  depth?: number; // parallax 0–1
}

export interface SceneDoc {
  bg?: string; // css background for the stage
  layers: SceneLayer[];
}

/** How the main page presents the world portals. */
export type PortalsLayout = "grid" | "carousel";

export interface SiteSettings {
  heroEyebrow: string;
  heroSub: string;
  portalsTitle: string;
  portalsKicker: string;
  portalsLayout: PortalsLayout;
  /** Hero background media (url). "" keeps the living cosmic canvas. */
  heroMediaUrl: string;
  /** Hero media opacity, stored as a string ("0"–"1") in SiteSetting.value. */
  heroMediaOpacity: string;
  // ——— typography (Studio “Main Page” tab) ———
  /** FONT_LIBRARY key for homepage headings. "" = site default. */
  fontDisplay: string;
  /** FONT_LIBRARY key for homepage body copy. "" = site default. */
  fontBody: string;
  /** Homepage hero title size multiplier, stored as a string ("0.6"–"1.6"). */
  heroTitleScale: string;
  // ——— hero positioning (Studio “Main Page” tab) ———
  /** Hero text alignment: left | center | right. */
  heroAlign: string;
  /** Hero min-height in vh, stored as a string ("60"–"120"). */
  heroHeight: string;
  /** Hero vertical offset in vh, stored as a string ("-25"–"25"). */
  heroOffsetY: string;
  /** Hero copy column max-width in rem, "" = default 56. */
  heroCopyWidth: string;
  /** Homepage wordmark effect: chrome | neon | holo | vapor | outline | "" = none. */
  heroTitleEffect: string;
}

export const DEFAULT_SITE: SiteSettings = {
  heroEyebrow: "A living museum of internet aesthetics",
  heroSub:
    "Nine interconnected worlds of art, nostalgia and digital subculture — each a fully realised visual universe with its own archive, gallery and community. Nostalgia for imagined futures, and futures imagined once more.",
  portalsTitle: "All Worlds",
  portalsKicker: "Choose a door",
  portalsLayout: "grid",
  heroMediaUrl: "",
  heroMediaOpacity: "0.55",
  fontDisplay: "",
  fontBody: "",
  heroTitleScale: "1",
  heroAlign: "center",
  heroHeight: "88",
  heroOffsetY: "0",
  heroCopyWidth: "",
  heroTitleEffect: "",
};

/** The world object the museum UI consumes — built-ins overridden by Studio data,
 *  plus entirely custom worlds. Shaped so it can stand in for WorldDef. */
export interface PortalWorldDef {
  id: string;
  kind: "builtin" | "custom";
  index: number;
  name: string;
  epithet: string;
  short: string;
  portalBlurb: string;
  grad: [string, string, string];
  accent: string;
  accent2: string;
  bg: string;
  fg: string;
  hidden: boolean;
  // built-in passthrough
  archive?: { heading: string; body: string }[];
  // builtin override extras
  bgMediaUrl?: string | null;
  bgSettings?: BgSettings | null;
  theme?: WorldThemePatch | null;
  // custom extras
  scene?: SceneDoc | null;
}

// ————— DB row shapes (pre-parse) —————
export interface OverrideRow {
  slug: string;
  order: number | null;
  hidden: boolean;
  name: string | null;
  epithet: string | null;
  portalBlurb: string | null;
  theme: string | null;
  bgMediaUrl: string | null;
  bgSettings: string | null;
}

export interface CustomRow {
  id: string;
  slug: string;
  name: string;
  epithet: string;
  portalBlurb: string;
  order: number;
  hidden: boolean;
  theme: string;
  scene: string;
}

interface StaticWorldLike {
  id: string;
  index: number;
  name: string;
  epithet: string;
  short: string;
  portalBlurb: string;
  grad: [string, string, string];
  accent: string;
  accent2: string;
  bg: string;
  fg: string;
  archive?: { heading: string; body: string }[];
}

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Merge static registry + studio overrides + custom worlds into one ordered list. */
export function buildMergedWorlds(
  statics: StaticWorldLike[],
  overrides: OverrideRow[],
  customs: CustomRow[],
): PortalWorldDef[] {
  const bySlug = new Map(overrides.map((o) => [o.slug, o]));
  const merged: PortalWorldDef[] = [];

  for (const w of statics) {
    const o = bySlug.get(w.id);
    merged.push({
      id: w.id,
      kind: "builtin",
      index: o?.order ?? w.index,
      name: o?.name ?? w.name,
      epithet: o?.epithet ?? w.epithet,
      short: w.short,
      portalBlurb: o?.portalBlurb ?? w.portalBlurb,
      grad: o
        ? [
            safeParse<WorldThemePatch>(o.theme, {}).bg ?? w.grad[0],
            safeParse<WorldThemePatch>(o.theme, {}).accent ?? w.grad[1],
            safeParse<WorldThemePatch>(o.theme, {}).accent2 ?? w.grad[2],
          ]
        : w.grad,
      accent: safeParse<WorldThemePatch>(o?.theme, {}).accent ?? w.accent,
      accent2: safeParse<WorldThemePatch>(o?.theme, {}).accent2 ?? w.accent2,
      bg: safeParse<WorldThemePatch>(o?.theme, {}).bg ?? w.bg,
      fg: safeParse<WorldThemePatch>(o?.theme, {}).fg ?? w.fg,
      hidden: o?.hidden ?? false,
      archive: w.archive,
      bgMediaUrl: o?.bgMediaUrl ?? null,
      bgSettings: safeParse<BgSettings | null>(o?.bgSettings, null),
      theme: safeParse<WorldThemePatch | null>(o?.theme, null),
    });
  }

  for (const c of customs) {
    const t = safeParse<WorldThemePatch>(c.theme, {});
    const accent = t.accent ?? "#ff2e88";
    const accent2 = t.accent2 ?? "#7df2d8";
    const bg = t.bg ?? "#0d0b14";
    merged.push({
      id: c.slug,
      kind: "custom",
      index: c.order,
      name: c.name,
      epithet: c.epithet || "A Custom World",
      short: c.portalBlurb || "A world built in the Studio.",
      portalBlurb: c.portalBlurb || "A world built in the Studio.",
      grad: [bg, accent, accent2],
      accent,
      accent2,
      bg,
      fg: t.fg ?? "#f4f1fa",
      hidden: c.hidden,
      scene: safeParse<SceneDoc>(c.scene, { layers: [] }),
      theme: t,
    });
  }

  merged.sort((a, b) => a.index - b.index);
  // re-index for display (World 01, World 02, …)
  merged.forEach((w, i) => {
    w.index = i + 1;
  });
  return merged;
}

/** CSS custom properties a custom world needs to look native. */
export function themeVarsFor(def: PortalWorldDef): Record<string, string> {
  const fg = def.fg;
  const vars: Record<string, string> = {
    "--w-bg": def.bg,
    "--w-bg2": def.theme?.bg2 ?? def.bg,
    "--w-fg": fg,
    "--w-fg-dim": `color-mix(in srgb, ${fg} 62%, transparent)`,
    "--w-accent": def.accent,
    "--w-accent2": def.accent2,
    "--w-panel": def.theme?.panel ?? "rgba(255,255,255,0.05)",
    "--w-panel-border": def.theme?.panelBorder ?? `color-mix(in srgb, ${def.accent} 30%, transparent)`,
    "--w-radius": def.theme?.radius ?? "1rem",
    "--w-shadow": "0 18px 50px -12px rgba(0,0,0,0.55)",
  };
  const fd = fontStack(def.theme?.fontDisplay);
  if (fd) vars["--w-font-display"] = fd;
  const fb = fontStack(def.theme?.fontBody);
  if (fb) vars["--w-font-body"] = fb;
  const fe = fontStack(def.theme?.epithetFont);
  if (fe) vars["--w-font-epithet"] = fe;
  if (def.theme?.titleScale) vars["--w-title-scale"] = String(def.theme.titleScale);
  return vars;
}

/** Emit a <style> sheet applying every studio theme override. */
export function themeOverrideCss(worlds: PortalWorldDef[]): string {
  const rules: string[] = [];
  for (const w of worlds) {
    const t = w.theme;
    if (w.kind === "builtin" && (!t || Object.keys(t).length === 0)) continue;
    const vars: string[] = [];
    if (t?.bg) vars.push(`--w-bg:${t.bg}`);
    if (t?.bg2) vars.push(`--w-bg2:${t.bg2}`);
    if (t?.fg) {
      vars.push(`--w-fg:${t.fg}`);
      vars.push(`--w-fg-dim:color-mix(in srgb, ${t.fg} 62%, transparent)`);
    }
    if (t?.accent) vars.push(`--w-accent:${t.accent}`);
    if (t?.accent2) vars.push(`--w-accent2:${t.accent2}`);
    if (t?.panel) vars.push(`--w-panel:${t.panel}`);
    if (t?.panelBorder) vars.push(`--w-panel-border:${t.panelBorder}`);
    if (t?.radius) vars.push(`--w-radius:${t.radius}`);
    const fd = fontStack(t?.fontDisplay);
    if (fd) vars.push(`--w-font-display:${fd}`);
    const fb = fontStack(t?.fontBody);
    if (fb) vars.push(`--w-font-body:${fb}`);
    const fe = fontStack(t?.epithetFont);
    if (fe) vars.push(`--w-font-epithet:${fe}`);
    if (t?.titleScale) vars.push(`--w-title-scale:${t.titleScale}`);
    if (w.kind === "custom") {
      const v = themeVarsFor(w);
      for (const [k, val] of Object.entries(v)) if (k !== "--w-shadow") vars.push(`${k}:${val}`);
    }
    if (vars.length) rules.push(`[data-world="${w.id}"]{${vars.join(";")}}`);
  }
  return rules.join("\n");
}

// ————— helpers —————
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "world"
  );
}

export function newLayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Friendly starter scene for a brand-new custom world. */
export function starterScene(name: string): SceneDoc {
  return {
    bg: "linear-gradient(180deg, #0d0b14 0%, #1a0a2e 60%, #2b1040 100%)",
    layers: [
      {
        id: newLayerId(),
        type: "gradient",
        name: "Accent glow",
        from: "#ff2e88",
        to: "transparent",
        angle: 160,
        x: 0,
        y: 55,
        w: 100,
        h: 45,
        z: 1,
        opacity: 0.35,
        blend: "screen",
        depth: 0.1,
      },
      {
        id: newLayerId(),
        type: "text",
        name: "World title",
        text: name,
        fontSize: 11,
        color: "#ffffff",
        weight: 800,
        font: "display",
        align: "center",
        x: 10,
        y: 40,
        w: 80,
        h: 16,
        z: 2,
        opacity: 1,
        anim: "float",
        animDur: 7,
        depth: 0.25,
      },
    ],
  };
}

export const ANIM_LABELS: Record<SceneAnim, string> = {
  none: "None",
  float: "Float",
  drift: "Drift",
  flicker: "Flicker",
  pulse: "Pulse",
  spin: "Spin",
  sway: "Sway",
};

export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "color-dodge",
  "color-burn",
  "lighten",
  "darken",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];
