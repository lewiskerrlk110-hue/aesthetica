// ─────────────────────────────────────────────────────────────
// AESTHETICA — World Registry
// Single source of truth for the eight aesthetics: identity,
// palette (shared with canvas renderers), typography and the
// historical archive. Historical claims are documented; where
// content is interpretive it is explicitly labelled.
// ─────────────────────────────────────────────────────────────

export type WorldId =
  | "retrowave"
  | "synthwave"
  | "vaporwave"
  | "y2k"
  | "dreamcore"
  | "cyberpunk"
  | "liminal"
  | "backrooms";

export interface ArchiveSection {
  heading: string;
  body: string;
  kind: "documented" | "interpretation";
}

export interface WorldDef {
  id: WorldId;
  index: number;
  name: string;
  epithet: string;
  short: string;
  portalBlurb: string;
  /** 3-4 stops for portal preview gradients */
  grad: [string, string, string];
  accent: string;
  accent2: string;
  bg: string;
  fg: string;
  /** gallery layout persona */
  galleryStyle:
    | "cinematic"
    | "album"
    | "collage"
    | "glossy"
    | "spacious"
    | "editorial"
    | "photographic"
    | "location";
  archive: ArchiveSection[];
  related: WorldId[];
}

export const WORLDS: WorldDef[] = [
  {
    id: "retrowave",
    index: 1,
    name: "Retrowave",
    epithet: "The Neon Highway",
    short:
      "An endless drive toward a sunset that never quite arrives. Chrome, palms and vector horizons.",
    portalBlurb:
      "Drive an endless neon landscape — vector grids, chrome sunsets, analog film.",
    grad: ["#1a0a2e", "#ff2e88", "#ffb347"],
    accent: "#ff2e88",
    accent2: "#ffb347",
    bg: "#0b0518",
    fg: "#ffe9f7",
    galleryStyle: "cinematic",
    related: ["synthwave", "vaporwave", "y2k"],
    archive: [
      {
        heading: "Retrofuturism and its sources",
        kind: "documented",
        body: "Retrowave's visual language is assembled almost entirely from commercial art of the 1980s: airbrushed movie posters, chrome vehicle emblems, vector graphics of early computer graphics labs, and the pastel-neon look of television idents such as Miami Vice (1984). The wireframe grid descends from vector-display imagery popularised by films like Tron (1982) and early flight-simulation graphics, while the giant striped sunset echoes airbrushed van art and beach-poster culture of the same decade.",
      },
      {
        heading: "The music that carried it",
        kind: "documented",
        body: "The modern genre crystallised alongside an electronic music revival. Kavinsky's 'Nightcall' (2010) and the Drive (2011) soundtrack introduced a mainstream audience to 1980s-flavoured synth music, and artists such as College, Perturbator and The Midnight paired that sound with the chrome-and-palm imagery on album covers distributed through Bandcamp and YouTube from roughly 2010 to 2016.",
      },
      {
        heading: "From Tumblr to the mainstream",
        kind: "documented",
        body: "The aesthetic spread through Tumblr and image boards in the early 2010s, aided by spaced-out 'A E S T H E T I C' typography memes. Its palette of midnight purple, electric pink and sunset orange became a fixed vocabulary that now appears in advertising, music videos and game design as a ready-made signal of nostalgic futurism.",
      },
      {
        heading: "Nostalgia for an imagined future",
        kind: "interpretation",
        body: "Retrowave is best understood as nostalgia for a future that was imagined but never built: the solar-highway optimism of 1980s popular science, filtered through the knowledge of how those dreams actually turned out. Its endless road suggests that the destination matters less than the driving — an elegy for possibility, painted in the colours of a sunset forever a few miles ahead.",
      },
    ],
  },
  {
    id: "synthwave",
    index: 2,
    name: "Synthwave",
    epithet: "The Electric Dream",
    short:
      "An album cover that learned to move. Wireframe mountains, striped suns and pure rhythmic energy.",
    portalBlurb:
      "An animated electronic album cover — wireframe terrain, striped suns, pulsing rhythm.",
    grad: ["#1b0538", "#ff38e4", "#23e6ff"],
    accent: "#ff38e4",
    accent2: "#23e6ff",
    bg: "#0d0221",
    fg: "#f6ecff",
    galleryStyle: "album",
    related: ["retrowave", "cyberpunk", "y2k"],
    archive: [
      {
        heading: "A genre named after a sound",
        kind: "documented",
        body: "Synthwave names an electronic music movement that emerged in the late 2000s and early 2010s, built on the synthesiser palettes of 1980s film scores: John Carpenter's self-composed soundtracks, Vangelis's Blade Runner score (1982), Tangerine Dream and Giorgio Moroder's productions. Producers such as Com Truise, Mitch Murder, FM-84 and Timecop1983 built a scene around that sound.",
      },
      {
        heading: "Album art as a visual engine",
        kind: "documented",
        body: "The genre's look was largely defined by its cover art, distributed on Bandcamp and YouTube channels like NewRetroWave (founded 2011). Wireframe mountains, striped suns and neon geometry drew on video-game packaging and computer-graphics demos of the 1980s. The Netflix series Stranger Things (2016), with its soundtrack by Survive, pushed both the music and the imagery into the mainstream.",
      },
      {
        heading: "How it differs from its neighbours",
        kind: "documented",
        body: "Retrowave and Synthwave overlap heavily, and some writers treat them as one umbrella. Where a distinction is drawn, Synthwave is the more music-driven, geometric and energetic variant — closer to arcade cabinets and computer graphics — while Retrowave leans on cinematic landscape and automobile imagery.",
      },
      {
        heading: "The rhythm of remembered machines",
        kind: "interpretation",
        body: "Synthwave's grids and pulsing suns compress the experience of 1980s arcade play into a single moving image: the sense that technology was once a dance floor. Its energy comes from repetition — basslines, scanlines, horizons — a reminder that for one generation, the future sounded like an oscillator.",
      },
    ],
  },
  {
    id: "vaporwave",
    index: 3,
    name: "Vaporwave",
    epithet: "The Digital Ruins",
    short:
      "Marble busts, dead malls and decommissioned software — consumer memory rearranged into collage.",
    portalBlurb:
      "Surreal digital ruins — marble statues, retro OS windows, artificial nostalgia.",
    grad: ["#a86fd0", "#ff9ed2", "#7df2d8"],
    accent: "#7df2d8",
    accent2: "#ff9ecb",
    bg: "#13101f",
    fg: "#fdf3ff",
    galleryStyle: "collage",
    related: ["retrowave", "y2k", "liminal"],
    archive: [
      {
        heading: "Origins in experimental music",
        kind: "documented",
        body: "Vaporwave began as a music movement between 2010 and 2013. Chuck Person's Eccojam Vol. 1 (2010, a Oneohtrix Point Never alias) slowed and looped pop fragments, and Vektroid's Floral Shoppe (2011, released as Macintosh Plus) became its defining record. The name — a pun on 'vaporware', software announced but never shipped — spread through Last.fm and music blogs around 2011–2012.",
      },
      {
        heading: "A collage of dead technologies",
        kind: "documented",
        body: "The visuals recycle the interfaces and leisure spaces of the 1980s and 1990s: Windows 95/98 dialogs, early Macintosh typography, Classical marble sculpture, checkerboard floors, pastel gradients, and Japanese text, which is frequently decorative and untranslated — a point of ongoing criticism within the community. Offshoot microgenres such as Mallsoft and Future Funk extended the palette into shopping-mall ambience and city-pop sampling.",
      },
      {
        heading: "Irony, sincerity and critique",
        kind: "documented",
        body: "Writers have read vaporwave through Mark Fisher's concept of hauntology — a culture haunted by lost futures — and as satire of consumer capitalism. Participants themselves split between ironic detachment and genuine affection for the era's objects, and the community now actively debates where sampling ends and cultural appropriation begins.",
      },
      {
        heading: "The ruins of the very recent past",
        kind: "interpretation",
        body: "Vaporwave treats fifteen-year-old software the way archaeology treats empires: as something that promised permanence and became picturesque. The marble bust beside a defunct operating system suggests that corporate taste aspires to classical timelessness — and fails in a way that is far more beautiful than success would have been.",
      },
    ],
  },
  {
    id: "y2k",
    index: 4,
    name: "Y2K",
    epithet: "The Millennium Interface",
    short:
      "Chrome, translucent plastic and unshakeable optimism — the future as a friendly consumer product.",
    portalBlurb:
      "A glossy millennium interface — chrome, holographic gradients, translucent tech.",
    grad: ["#16213a", "#9be8ff", "#ffb3e6"],
    accent: "#9be8ff",
    accent2: "#ffb3e6",
    bg: "#0f1420",
    fg: "#f2f7ff",
    galleryStyle: "glossy",
    related: ["vaporwave", "synthwave", "dreamcore"],
    archive: [
      {
        heading: "Design in the millennium bubble",
        kind: "documented",
        body: "The Y2K aesthetic spans roughly 1997 to 2004. Its hardware icons include Apple's iMac G3 (1998) and iBook with translucent coloured plastic, Nokia's 3310 (2000), and the early-flip phones of the era. Interfaces turned glossy and rounded — Mac OS X's Aqua skin (2001) is the canonical example — while corporate logos inflated into chrome and bubble letterforms. Consumer films and music television wrapped the same optimism in metallic, iridescent styling.",
      },
      {
        heading: "Optimism as a design brief",
        kind: "documented",
        body: "The style coincided with the dot-com boom and the millennium's technological promise, then persisting through the anxieties around the Y2K bug itself. It is distinct from Frutiger Aero (c. 2004–2013), its successor style, which added skeuomorphic nature imagery and water droplets; and it is far more playful and product-driven than the dark corporate dystopias of cyberpunk fiction popular at the same time.",
      },
      {
        heading: "The revival years",
        kind: "documented",
        body: "From around 2018 the style returned through fashion and pop music — low-rise metallics, butterfly clips and chrome accessories — and through design communities cataloguing early-2000s interfaces. Archives of the period now treat MP3 players and candy-coloured desktops with the same attention once given to mid-century furniture.",
      },
      {
        heading: "The interface smiled first",
        kind: "interpretation",
        body: "Y2K design is remembered for its confidence: the belief that the digital future would arrive as a friendly appliance. Reading it today, the gloss reads differently — an optimism preserved at the exact moment before the bubble burst, sealed in translucent turquoise plastic like a fly in amber.",
      },
    ],
  },
  {
    id: "dreamcore",
    index: 5,
    name: "Dreamcore",
    epithet: "The World Between Memories",
    short:
      "Bright skies, enormous clouds and places that feel remembered but never visited.",
    portalBlurb:
      "A bright nostalgic dream — pink clouds, meadows, lonely petrol stations, floating doors.",
    grad: ["#78c8f5", "#f7b4d0", "#ffe6a0"],
    accent: "#e26fa8",
    accent2: "#78c8f5",
    bg: "#bfe3fb",
    fg: "#21324a",
    galleryStyle: "spacious",
    related: ["liminal", "y2k", "vaporwave"],
    archive: [
      {
        heading: "An internet-born dream diary",
        kind: "documented",
        body: "Dreamcore emerged as a named internet aesthetic around 2019–2021, spreading through Tumblr, Twitter and later TikTok. Its imagery — vivid skies, oversized clouds, empty playgrounds, petrol stations and photographs washed in nostalgic light — is shared with neighbouring tags like Nostalgiacore and, in its more distorted variants, Weirdcore. Unlike horror-leaning Weirdcore, Dreamcore keeps its brightness and warmth.",
      },
      {
        heading: "Older roots",
        kind: "documented",
        body: "The feeling it cultivates has long precedents: surrealist painting's impossible landscapes, the soft-focus nostalgia of family photography, and the sky-and-suburb imagery of children's television. The community also borrowed psychological vocabulary — writing dream journals, collecting 'places that feel like memories'.",
      },
      {
        heading: "Documented history versus community fiction",
        kind: "documented",
        body: "Almost all Dreamcore 'lore' — the Cloud Atlas locations, memory fragments and dream narratives — is creative writing rather than documented history. This museum keeps the two clearly separated: factual claims appear in this archive, while community contributions are labelled as creative work wherever they appear.",
      },
      {
        heading: "Nostalgia for somewhere else",
        kind: "interpretation",
        body: "Dreamcore may be the gentlest of internet aesthetics: it aims for the specific joy-sadness of half-remembered summers. The word 'anemoia' — coined by The Dictionary of Obscure Sorrows for nostalgia for a time you have never known — describes it well. These are pictures of nowhere, which is precisely why everyone recognises them.",
      },
    ],
  },
  {
    id: "cyberpunk",
    index: 6,
    name: "Cyberpunk",
    epithet: "The Rain-Soaked Megacity",
    short:
      "High tech, low life. Neon in the rain, corporate towers, and identities for sale.",
    portalBlurb:
      "A cinematic megacity — rain, neon signage, elevated roads and atmospheric depth.",
    grad: ["#0a1220", "#00e5ff", "#ff2a3c"],
    accent: "#00e5ff",
    accent2: "#ff2a3c",
    bg: "#050810",
    fg: "#e8f0f8",
    galleryStyle: "editorial",
    related: ["synthwave", "liminal", "backrooms"],
    archive: [
      {
        heading: "Literature: the movement begins",
        kind: "documented",
        body: "The term comes from Bruce Bethke's 1983 short story 'Cyberpunk'. William Gibson's Neuromancer (1984) defined the genre's grammar — corporate power, console cowboys, artificial minds — alongside writers such as Pat Cadigan and the Mirrorshades anthology (1986) edited by Bruce Sterling. Philip K. Dick's Do Androids Dream of Electric Sheep? (1968) supplied key prehistory.",
      },
      {
        heading: "Cinema and anime",
        kind: "documented",
        body: "Blade Runner (1982, dir. Ridley Scott, visual futurism by Syd Mead) gave the movement its most imitated imagery: rain, neon, aerial traffic and monumental towers. Akira (1988) and Ghost in the Shell (1995, dir. Mamoru Oshii) carried it into animation, and The Matrix (1999) closed the century's cycle. Kowloon Walled City — a self-built Hong Kong enclave demolished in 1994 — remains the movement's most cited architectural precedent.",
      },
      {
        heading: "Themes, not gadgets",
        kind: "documented",
        body: "Critics define cyberpunk by its themes rather than its props: identity in a networked world, surveillance, corporate sovereignty, body modification and technological alienation — summarised in the phrase 'high tech, low life'. The 2020 video game Cyberpunk 2077 popularised the label for new audiences, but the movement predates it by four decades.",
      },
      {
        heading: "The city as protagonist",
        kind: "interpretation",
        body: "In cyberpunk's best imagery the city itself is the main character: layered, indifferent, endlessly legible in signage and illegible in ownership. The rain is not weather but a mirror — everything the city advertises of itself reflects in the street, and the street keeps the copy but loses the fine print.",
      },
    ],
  },
  {
    id: "liminal",
    index: 7,
    name: "Liminal Spaces",
    epithet: "The Place Between Places",
    short:
      "Familiar places with the people removed — corridors, pools and platforms waiting for no one.",
    portalBlurb:
      "Familiar places without people — empty malls, hotel corridors, quiet pools.",
    grad: ["#cfc9bb", "#8f9b7a", "#b3a98c"],
    accent: "#8f9b7a",
    accent2: "#b3a98c",
    bg: "#d8d2c4",
    fg: "#3c3a34",
    galleryStyle: "photographic",
    related: ["dreamcore", "backrooms", "vaporwave"],
    archive: [
      {
        heading: "From anthropology to architecture",
        kind: "documented",
        body: "'Liminality' comes from anthropology: Arnold van Gennep's The Rites of Passage (1909) and Victor Turner's later work describe the in-between phase of rituals, when a person belongs to neither the before nor the after. The internet aesthetic borrows the term for transitional architecture — corridors, lobbies, waiting rooms — photographed empty.",
      },
      {
        heading: "A photographic tradition",
        kind: "documented",
        body: "The look has precedents in documentary photography: the New Topographics exhibition (1975) framed man-altered landscapes without drama, and urban explorers have documented dead malls since at least the mid-2000s on sites like DeadMalls.com. The aesthetic consolidated online around 2018–2019 in image-board threads and the r/LiminalSpace community (founded 2019).",
      },
      {
        heading: "Why emptiness unsettles",
        kind: "documented",
        body: "Writers often connect the feeling to Freud's concept of the unheimlich — the uncanny — where the familiar becomes strange. The pandemic years of 2020–2021, with genuinely emptied public spaces, gave the imagery unexpected documentary weight.",
      },
      {
        heading: "Rooms that forget their purpose",
        kind: "interpretation",
        body: "A swimming pool is a machine for play; a corridor is a machine for arrival. Remove the people and each machine idles, humming. Liminal photography suggests that places are not backdrops but agreements between space and crowd — and that the agreement can be photographed in the act of dissolving.",
      },
    ],
  },
  {
    id: "backrooms",
    index: 8,
    name: "The Backrooms",
    epithet: "The Infinite Interior",
    short:
      "Noclip out of reality into six hundred million square miles of yellow rooms.",
    portalBlurb:
      "An impossible interior — yellow rooms, buzzing lights, an endless maze of levels.",
    grad: ["#1c1808", "#d8c34a", "#9fae5a"],
    accent: "#d8c34a",
    accent2: "#9fae5a",
    bg: "#0f0d06",
    fg: "#efe9d0",
    galleryStyle: "location",
    related: ["liminal", "cyberpunk", "dreamcore"],
    archive: [
      {
        heading: "One thread, one photograph",
        kind: "documented",
        body: "The Backrooms began on 12 May 2019 in an anonymous 4chan thread asking for 'unsettling images'. A reply described a world reached by 'noclipping out of reality' — endless empty office rooms in mono-yellow wallpaper, damp carpet and buzzing fluorescents — beneath a photograph of exactly such a room, whose original provenance is debated. The post's text became the founding document of an entire mythology.",
      },
      {
        heading: "Community canon",
        kind: "documented",
        body: "Fan communities — most extensively the Backrooms wiki ecosystems — expanded the premise into numbered 'levels' with survival guides, fictional organisations such as the M.E.G. (Major Explorer Group), and bestiaries of entities. From January 2022, teenager Kane Parsons (Kane Pixels) released a found-footage YouTube series that renewed mainstream interest; an A24 film adaptation was announced in 2023.",
      },
      {
        heading: "Lore is lore",
        kind: "documented",
        body: "Everything on this site's Level Explorer and Found Notes Archive is community-created fiction in that tradition — creative writing, not documentation. This museum labels it as such wherever it appears. The only documented facts are the thread, the photograph, the wiki cultures that grew from them, and the films.",
      },
      {
        heading: "The horror of monotony",
        kind: "interpretation",
        body: "The Backrooms inverts haunted-house logic: nothing chases you (or not at first) — the horror is that the architecture does not end. It is the infinite office, bureaucracy without the paperwork, a building that has forgotten there was ever an outside. Its hum is the sound of a place waiting to be assigned a purpose.",
      },
    ],
  },
];

export const WORLD_MAP: Record<WorldId, WorldDef> = Object.fromEntries(
  WORLDS.map((w) => [w.id, w]),
) as Record<WorldId, WorldDef>;

export const WORLD_IDS = WORLDS.map((w) => w.id);

export const GALLERY_FILTERS: Record<WorldId, string[]> = {
  retrowave: ["all", "poster", "photograph", "render"],
  synthwave: ["all", "render", "poster"],
  vaporwave: ["all", "collage", "render", "interface"],
  y2k: ["all", "interface", "render", "poster"],
  dreamcore: ["all", "photograph", "render", "collage"],
  cyberpunk: ["all", "film-still", "poster", "photograph"],
  liminal: ["all", "photograph", "film-still"],
  backrooms: ["all", "photograph", "render", "film-still"],
};

export const MEDIUM_LABELS: Record<string, string> = {
  poster: "Poster",
  collage: "Collage",
  photograph: "Photograph",
  render: "3D Render",
  interface: "Interface",
  "film-still": "Film Still",
};

// ————— Dream Journal prompts —————
export const DREAM_PROMPTS = [
  "What did the sky look like?",
  "What felt familiar?",
  "Was anyone else there?",
  "Describe a place you cannot quite remember.",
  "What happened just before you woke up?",
  "What sound do you still hear?",
];

export const DREAM_MOODS = [
  "weightless",
  "sunlit",
  "bittersweet",
  "foggy",
  "electric",
  "lucid",
  "fading",
];
