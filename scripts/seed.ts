/**
 * AESTHETICA database seeder.
 * - Registers AI-generated gallery pieces from /public/art (if present)
 * - Generates crafted SVG art for additional pieces
 * - Seeds Dreamcore postcards / cloud atlas / memory fragments
 * - Seeds Backrooms levels & found notes (community lore, labelled)
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const db = new PrismaClient();
const ART_DIR = join(process.cwd(), "public", "art");

// ---------- SVG fallback art generators ----------
function svgUrl(inner: string, w = 640, h = 400) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function retroSvg(seed: number) {
  const sunY = 190 + (seed % 3) * 18;
  return svgUrl(`
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a0a2e"/><stop offset="0.55" stop-color="#54123f"/>
        <stop offset="0.8" stop-color="#c22e6a"/><stop offset="1" stop-color="#ff8a5c"/>
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe6a0"/><stop offset="0.5" stop-color="#ff8a5c"/><stop offset="1" stop-color="#ff2e88"/>
      </linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#sky)"/>
    <circle cx="320" cy="${sunY}" r="86" fill="url(#sun)"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="230" y="${sunY - 40 + i * 22}" width="180" height="${4 + i * 2}" fill="#1a0a2e" opacity="0.85"/>`).join("")}
    <rect y="268" width="640" height="132" fill="#0b0518"/>
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 46 - 20}" y1="268" x2="${320 + (i - 8) * 148}" y2="400" stroke="#ff2e88" stroke-width="1.4" opacity="0.8"/>`).join("")}
    ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${278 + i * i * 6 + i * 8}" x2="640" y2="${278 + i * i * 6 + i * 8}" stroke="#23e6ff" stroke-width="1.1" opacity="0.75"/>`).join("")}
    <line x1="320" y1="268" x2="320" y2="400" stroke="#ffe9f7" stroke-width="3" opacity="0.9"/>
  `);
}

function synthSvg(seed: number) {
  return svgUrl(`
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0221"/><stop offset="1" stop-color="#31065c"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#s)"/>
    <circle cx="320" cy="170" r="100" fill="#ff38e4" opacity="0.9"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="216" y="${130 + i * 22}" width="208" height="${5 + i * 3}" fill="#0d0221"/>`).join("")}
    <polyline points="0,330 90,240 180,330 270,225 360,330 450,235 540,330 640,250 640,400 0,400" fill="none" stroke="#23e6ff" stroke-width="2" opacity="0.9"/>
    <polyline points="0,355 80,300 200,355 300,290 420,355 520,295 640,350" fill="none" stroke="#ff38e4" stroke-width="1.6" opacity="0.7"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 80}" y="368" width="60" height="4" fill="${i % 2 ? "#23e6ff" : "#ff38e4"}" opacity="0.8"/>`).join("")}
  `);
}

function vaporSvg(seed: number) {
  return svgUrl(`
    <rect width="640" height="400" fill="#2a1e3f"/>
    <rect width="640" height="200" fill="none"/>
    <rect y="200" width="640" height="200" fill="#1c1430"/>
    ${Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) =>
      (r + c) % 2 === 0 ? `<rect x="${c * 80}" y="${200 + r * 25}" width="80" height="25" fill="#3d2b5c" opacity="0.7"/>` : ""
    ).join("")).join("")}
    <ellipse cx="320" cy="150" rx="62" ry="86" fill="#f5ede0"/>
    <rect x="286" y="215" width="68" height="60" fill="#f5ede0"/>
    <circle cx="298" cy="130" r="20" fill="#f5ede0"/>
    <rect x="120" y="60" width="180" height="130" rx="4" fill="#13101f" stroke="#7df2d8" stroke-width="2"/>
    <rect x="120" y="60" width="180" height="22" fill="#7df2d8" opacity="0.35"/>
    <text x="132" y="76" font-family="monospace" font-size="12" fill="#7df2d8">system.exe</text>
    <rect x="400" y="110" width="150" height="100" rx="4" fill="#13101f" stroke="#ff9ecb" stroke-width="2"/>
    <rect x="400" y="110" width="150" height="20" fill="#ff9ecb" opacity="0.35"/>
    <text x="412" y="125" font-family="monospace" font-size="11" fill="#ff9ecb">あの日光 A N O S H I</text>
  `);
}

function y2kSvg(seed: number) {
  return svgUrl(`
    <defs>
      <radialGradient id="ch" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#bfe3fb"/>
        <stop offset="0.6" stop-color="#7f9fc4"/><stop offset="0.8" stop-color="#e8f4ff"/>
        <stop offset="1" stop-color="#9be8ff"/>
      </radialGradient>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#16213a"/><stop offset="1" stop-color="#2c3a68"/>
      </linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#bg)"/>
    <circle cx="320" cy="210" r="110" fill="url(#ch)"/>
    <ellipse cx="284" cy="164" rx="42" ry="26" fill="#ffffff" opacity="0.9"/>
    ${[[120, 90, 34], [520, 100, 26], [100, 300, 22], [540, 290, 38], [430, 60, 16]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb3e6" opacity="0.55"/>`).join("")}
    <rect x="60" y="330" width="520" height="34" rx="17" fill="#9be8ff" opacity="0.28"/>
    <text x="150" y="353" font-family="Verdana" font-size="15" fill="#f2f7ff" letter-spacing="6">Y E A R 2 0 0 0</text>
  `);
}

function dreamSvg(seed: number) {
  const hue = seed % 2 === 0 ? "#f7b4d0" : "#ffa77d";
  return svgUrl(`
    <defs><linearGradient id="dk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#78c8f5"/><stop offset="0.7" stop-color="#c9e8fb"/><stop offset="1" stop-color="#fff8ef"/>
    </linearGradient></defs>
    <rect width="640" height="400" fill="url(#dk)"/>
    <ellipse cx="140" cy="110" rx="90" ry="34" fill="${hue}"/>
    <ellipse cx="205" cy="125" rx="70" ry="28" fill="${hue}" opacity="0.85"/>
    <ellipse cx="480" cy="150" rx="110" ry="38" fill="#f7b4d0" opacity="0.9"/>
    <ellipse cx="540" cy="135" rx="70" ry="26" fill="#ffe6a0" opacity="0.9"/>
    <rect y="290" width="640" height="110" fill="#a9d5a1"/>
    <polygon points="240,400 280,290 360,290 400,400" fill="#c9b7f2" opacity="0.9"/>
    <rect x="290" y="230" width="60" height="110" fill="#fff8ef" opacity="0.75"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${30 + i * 52}" cy="${318 + (i % 3) * 14}" r="4" fill="${i % 3 === 0 ? "#e26fa8" : "#fff8ef"}"/>`).join("")}
  `);
}

function cyberSvg(seed: number) {
  return svgUrl(`
    <rect width="640" height="400" fill="#050810"/>
    ${Array.from({ length: 14 }, (_, i) => {
      const bw = 46 + ((i * 29) % 50);
      const bh = 130 + ((i * 67) % 210);
      return `<rect x="${i * 46 - 10}" y="${400 - bh}" width="${bw}" height="${bh}" fill="#0a1220" stroke="#0f1c30" stroke-width="1"/>` +
        Array.from({ length: Math.floor(bh / 30) }, (_, r) => ((r + i) % 3 === 0 ? `<rect x="${i * 46}" y="${400 - bh + 10 + r * 28}" width="10" height="7" fill="#00e5ff" opacity="0.7"/>` : "") +
          ((r + i) % 4 === 1 ? `<rect x="${i * 46 + 22}" y="${400 - bh + 12 + r * 28}" width="10" height="7" fill="#ff2a3c" opacity="0.6"/>` : "")).join("");
    }).join("")}
    ${Array.from({ length: 40 }, (_, i) => `<line x1="${(i * 97) % 640}" y1="${(i * 53) % 400}" x2="${((i * 97) % 640) - 4}" y2="${((i * 53) % 400) + 14}" stroke="#5a7ea0" stroke-width="1" opacity="0.5"/>`).join("")}
    <rect y="360" width="640" height="40" fill="#04060c"/>
    <rect x="60" y="330" width="120" height="26" fill="#ff2a3c" opacity="0.14"/>
    <text x="66" y="349" font-family="monospace" font-size="16" fill="#ff2a3c" opacity="0.85" letter-spacing="4">未来市 FUTURE CITY</text>
    <rect x="420" y="300" width="140" height="22" fill="#00e5ff" opacity="0.12"/>
    <text x="428" y="316" font-family="monospace" font-size="13" fill="#00e5ff" opacity="0.8" letter-spacing="3">SECTOR 7 GATE</text>
  `);
}

function liminalSvg(seed: number) {
  return svgUrl(`
    <rect width="640" height="400" fill="#d8d2c4"/>
    <polygon points="0,400 200,220 440,220 640,400" fill="#c4beae"/>
    <polygon points="240,220 400,220 380,400 260,400" fill="#efe9da"/>
    <rect x="296" y="240" width="48" height="130" fill="#a89f88"/>
    <rect x="120" y="150" width="60" height="46" fill="#f5efdf"/>
    <rect x="460" y="150" width="60" height="46" fill="#f5efdf"/>
    <rect x="0" y="0" width="640" height="90" fill="#e7e1d1"/>
    <rect x="90" y="20" width="90" height="30" fill="#fdf8e8" opacity="0.9"/>
    <rect x="460" y="20" width="90" height="30" fill="#fdf8e8" opacity="0.9"/>
    <text x="270" y="190" font-family="Arial" font-size="13" fill="#7a7466" letter-spacing="3">CORRIDOR B</text>
  `);
}

function backSvg(seed: number) {
  return svgUrl(`
    <rect width="640" height="400" fill="#b5a24a"/>
    <polygon points="0,400 190,180 450,180 640,400" fill="#9c8c3e"/>
    <polygon points="220,180 420,180 400,400 240,400" fill="#cbb95c"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${40 + i * 100}" y="0" width="52" height="14" fill="#fdf3c0" opacity="${i % 2 ? 0.95 : 0.6}"/>`).join("")}
    <rect x="150" y="230" width="46" height="90" fill="#7a6c30"/>
    <rect x="444" y="230" width="46" height="90" fill="#7a6c30"/>
    <rect y="380" width="640" height="20" fill="#6e6230"/>
    <rect x="292" y="200" width="56" height="20" fill="#8a7c38"/>
    <text x="250" y="214" font-family="monospace" font-size="12" fill="#5d5222">ROOM 0</text>
  `);
}

const FALLBACK: Record<string, (seed: number) => string> = {
  retrowave: retroSvg,
  synthwave: synthSvg,
  vaporwave: vaporSvg,
  y2k: y2kSvg,
  dreamcore: dreamSvg,
  cyberpunk: cyberSvg,
  liminal: liminalSvg,
  backrooms: backSvg,
};

function art(aesthetic: string, file: string | null, seed: number) {
  if (file && existsSync(join(ART_DIR, file))) {
    // reference the static file (copied into build output) rather than inlining a huge data URL
    return `/art/${file}`;
  }
  return FALLBACK[aesthetic]?.(seed) ?? retroSvg(seed);
}

// ---------- seed data ----------
interface SeedArt {
  aesthetic: string;
  title: string;
  description: string;
  file: string | null;
  medium: string;
  year: number | null;
  tags: string;
  featured?: boolean;
}

const ARTWORKS: SeedArt[] = [
  // RETROWAVE
  { aesthetic: "retrowave", title: "Horizon Perpetual", description: "The road that never ends and never begins. Digital vector composition in the classic grid-and-sunset vocabulary.", file: "retro-1.png", medium: "poster", year: 2024, tags: "sunset,grid,highway,neon", featured: true },
  { aesthetic: "retrowave", title: "Coastal Run, 1987", description: "A vintage silhouette against a burning sky. The drive as cinema.", file: "retro-2.png", medium: "photograph", year: 2023, tags: "car,coast,sunset,chrome", featured: true },
  { aesthetic: "retrowave", title: "Motel Aurora — Vacancy", description: "Neon signage rendered in eternal dusk. VHS-era night photography.", file: "retro-3.png", medium: "photograph", year: 2023, tags: "neon,sign,motel,night" },
  { aesthetic: "retrowave", title: "Grid Study No. 4", description: "Perspective lines converging on a striped sun — the grammar of the highway reduced to geometry.", file: null, medium: "render", year: 2024, tags: "grid,sunset,vector" },
  { aesthetic: "retrowave", title: "Chrome Sunset Cassette", description: "A chromium title treatment in memory of the tape deck era.", file: null, medium: "poster", year: 2024, tags: "chrome,cassette,typography" },
  // SYNTHWAVE
  { aesthetic: "synthwave", title: "Electric Dawn", description: "Album art brought to life: striped sun over wireframe ranges. Symmetry as rhythm.", file: "synth-1.png", medium: "poster", year: 2024, tags: "sun,mountains,album,neon", featured: true },
  { aesthetic: "synthwave", title: "Violet Circuit City", description: "A skyline drawn in oscillating light — the arcade's dream of architecture.", file: "synth-2.png", medium: "render", year: 2023, tags: "city,grid,cyan,album" },
  { aesthetic: "synthwave", title: "Waveform Analysis", description: "Geometry that behaves like sound: bars, triangles and signal pulses.", file: "synth-3.png", medium: "render", year: 2024, tags: "waveform,abstract,geometry" },
  { aesthetic: "synthwave", title: "Oscillator Bloom", description: "A synth pad rendered as landscape. Every peak is a chord held too long.", file: null, medium: "render", year: 2024, tags: "synth,abstract,wireframe" },
  { aesthetic: "synthwave", title: "Night Drive FM", description: "Radio signage for a station that broadcasts only after midnight.", file: null, medium: "poster", year: 2023, tags: "radio,neon,night" },
  // VAPORWAVE
  { aesthetic: "vaporwave", title: "Marble // Ruin", description: "Classical sculpture on checkerboard floors — antiquity recommercialised.", file: "vapor-1.png", medium: "collage", year: 2024, tags: "bust,checkerboard,collage", featured: true },
  { aesthetic: "vaporwave", title: "Chrome Paradise", description: "A chrome sphere at artificial golden hour. The mall fountain ascended.", file: "vapor-2.png", medium: "render", year: 2023, tags: "chrome,sphere,paradise" },
  { aesthetic: "vaporwave", title: "system.exe (corrupted)", description: "Operating system windows drifting in pastel sky — software after its shutdown date.", file: "vapor-3.png", medium: "interface", year: 2024, tags: "windows,os,glitch,pastel" },
  { aesthetic: "vaporwave", title: "広告 / Advertisement", description: "Collage of obsolete consumer imagery with untranslated typography.", file: null, medium: "collage", year: 2023, tags: "collage,typography,consumer" },
  { aesthetic: "vaporwave", title: "Mallsoft Corridor", description: "A shopping centre fountain rendered as memory: washed out and gently looping.", file: null, medium: "render", year: 2024, tags: "mall,mallsoft,fountain" },
  // Y2K
  { aesthetic: "y2k", title: "Inflated Future", description: "Chrome typeforms and holographic gradients — optimism at 1000 DPI.", file: "y2k-1.png", medium: "render", year: 2024, tags: "chrome,holographic,bubble", featured: true },
  { aesthetic: "y2k", title: "Rainbow Storage", description: "Compact discs and translucent gadgets catching light on a silver field.", file: "y2k-2.png", medium: "photograph", year: 2023, tags: "cd,gadgets,translucent" },
  { aesthetic: "y2k", title: "Liquid Metal Study", description: "A chrome bead resting on iridescent ripples. Touch it and it ripples back.", file: "y2k-3.png", medium: "render", year: 2024, tags: "chrome,liquid,iridescent" },
  { aesthetic: "y2k", title: "Aqua Button Reunion", description: "The glossy interface era's favourite widget, cast in jewellery-grade gloss.", file: null, medium: "interface", year: 2023, tags: "aqua,interface,glossy" },
  { aesthetic: "y2k", title: "Millennium Kit", description: "Flip phone, earbuds, mini disc — the future as a carry-case of treasures.", file: null, medium: "poster", year: 2024, tags: "gadgets,millennium,kit" },
  // DREAMCORE
  { aesthetic: "dreamcore", title: "The Endless Meadow", description: "Wildflowers under enormous pink clouds. You have been here — probably in July.", file: "dream-1.png", medium: "photograph", year: 2024, tags: "meadow,clouds,summer,sky", featured: true },
  { aesthetic: "dreamcore", title: "The Last Petrol Station", description: "A lonely forecourt under a peach sky, somewhere before the horizon bends.", file: "dream-2.png", medium: "photograph", year: 2023, tags: "petrol,road,sunset,lonely" },
  { aesthetic: "dreamcore", title: "Bus Seat, Late Light", description: "Sunlight across empty seats. The ride home that lasted a whole summer.", file: "dream-3.png", medium: "photograph", year: 2023, tags: "bus,interior,sunlight" },
  { aesthetic: "dreamcore", title: "Door in the Grass", description: "An open door standing in a meadow with no wall around it.", file: null, medium: "render", year: 2024, tags: "door,meadow,surreal" },
  { aesthetic: "dreamcore", title: "Staircase to the Left Sky", description: "Impossible architecture ascending into weather.", file: null, medium: "render", year: 2024, tags: "stairs,sky,impossible" },
  { aesthetic: "dreamcore", title: "Field Beneath a Vast Sunset", description: "The sky becomes a cinema screen and the meadow holds its breath.", file: null, medium: "photograph", year: 2023, tags: "sunset,field,clouds" },
  // CYBERPUNK
  { aesthetic: "cyberpunk", title: "Sector 7, Rainfall Study", description: "Neon signage reflected on wet asphalt. Cinematic still in the tradition of the movement.", file: "cyber-1.png", medium: "film-still", year: 2024, tags: "rain,neon,city,night", featured: true },
  { aesthetic: "cyberpunk", title: "Elevated Roads, North District", description: "Layered infrastructure disappearing into atmospheric haze.", file: "cyber-2.png", medium: "film-still", year: 2023, tags: "highway,district,fog" },
  { aesthetic: "cyberpunk", title: "Window, 41st Floor", description: "Rain on glass; the megacity glows beyond, legible only as advertising.", file: "cyber-3.png", medium: "film-still", year: 2023, tags: "rain,window,lights" },
  { aesthetic: "cyberpunk", title: "未来市 Signage Field", description: "A wall of fictional shopfronts and holographic offers.", file: null, medium: "poster", year: 2024, tags: "signage,hologram,japanese" },
  { aesthetic: "cyberpunk", title: "Steam and Steel", description: "Vents exhaling above an alley the masterplan forgot.", file: null, medium: "photograph", year: 2023, tags: "steam,alley,industrial" },
  // LIMINAL
  { aesthetic: "liminal", title: "Corridor B, After Hours", description: "An empty mall passage in fluorescent cream. The shops have stopped agreeing to be open.", file: "liminal-1.png", medium: "photograph", year: 2024, tags: "mall,corridor,fluorescent", featured: true },
  { aesthetic: "liminal", title: "Hotel Doors, Identical", description: "Repetition as architecture: the corridor that repeats past the horizon of attention.", file: "liminal-2.png", medium: "photograph", year: 2023, tags: "hotel,doors,corridor" },
  { aesthetic: "liminal", title: "Pool, No Swimmers", description: "Blue tiles and still water in afternoon light. The lifeguard chair is permanently vacant.", file: "liminal-3.png", medium: "photograph", year: 2023, tags: "pool,tiles,quiet" },
  { aesthetic: "liminal", title: "Waiting Area 3", description: "Chairs for a departure that was cancelled years ago.", file: null, medium: "photograph", year: 2022, tags: "airport,waiting,chairs" },
  { aesthetic: "liminal", title: "Stairwell, Summer Term", description: "A school stairwell in August, holding the shape of four hundred footsteps.", file: null, medium: "photograph", year: 2023, tags: "school,stairwell,empty" },
  // BACKROOMS
  { aesthetic: "backrooms", title: "Level 0 — The Lobby (Scan 001)", description: "Mono-yellow rooms, damp carpet, buzzing fluorescents. The founding image of the mythology.", file: "back-1.png", medium: "photograph", year: 2024, tags: "level0,yellow,rooms", featured: true },
  { aesthetic: "backrooms", title: "Level 0 — Pillar Corridor", description: "Square pillars, random doorways, lights that flicker on a schedule of their own.", file: "back-2.png", medium: "photograph", year: 2024, tags: "level0,corridor,pillars" },
  { aesthetic: "backrooms", title: "CCTV — Unassigned Room", description: "Surveillance texture: low resolution, green tint, distorted shadows.", file: "back-3.png", medium: "film-still", year: 2023, tags: "cctv,surveillance,horror" },
  { aesthetic: "backrooms", title: "Reception, Unmanned", description: "A front desk with no one behind it and no door marked private.", file: null, medium: "render", year: 2023, tags: "reception,office,empty" },
  { aesthetic: "backrooms", title: "The Long Hall (Analog)", description: "Analog video grain over an infinite hall.", file: null, medium: "film-still", year: 2022, tags: "analog,hall,vhs" },
];

const POSTCARDS = [
  { title: "From the Cloud Station", caption: "The train came at 4pm and again never. The platform smelled of warm rain.", file: "dream-2.png", tags: "cloudstation,train,rain" },
  { title: "From the Endless Meadow", caption: "Someone mowed a path to the horizon and then forgot why.", file: "dream-1.png", tags: "meadow,path" },
  { title: "From the Last Summer Bus", caption: "The driver knew my stop without being told. I never learned theirs.", file: "dream-3.png", tags: "bus,summer" },
  { title: "From the Road Beneath the Pink Sky", caption: "Forty minutes of driving, the same two clouds. I did not mind.", file: null, tags: "road,clouds,pinksky" },
  { title: "From the Empty Flower Shop", caption: "Bouquets arranged by no one, watered by weather.", file: null, tags: "flowers,shop,empty" },
  { title: "From the Field of Floating Doors", caption: "Each one opens onto the same noon. You may pick any.", file: null, tags: "doors,field,noon" },
];

const CLOUD_LOCATIONS = [
  { name: "The Endless Meadow", description: "A wildflower field that meets the sky without a horizon line. The grass remembers every picnic and tells no one. Best visited in the long afternoon of an unnamed July.", file: "dream-1.png", tags: "meadow,flowers" },
  { name: "The Cloud Station", description: "A rural halt between two pink skies. Departures board shows only the word 'later'. The benches are always warm.", file: "dream-2.png", tags: "station,train,rain" },
  { name: "The Last Summer Bus", description: "A vintage bus that travels a loop through empty suburbs. Windows down, seat vinyl warm, radio two counties out of range.", file: "dream-3.png", tags: "bus,summer,road" },
  { name: "The Road Beneath the Pink Sky", description: "A country road where the sunset holds for hours. Distance markers count down from ∞.", file: null, tags: "road,sunset" },
  { name: "The Empty Flower Shop", description: "A florist's with no proprietor. The door chime rings itself when you think about leaving.", file: null, tags: "flowers,shop" },
];

const FRAGMENTS = [
  { text: "the light came through the window the way it does at the house we never lived in", isSample: true, authorName: "The Archivist" },
  { text: "somewhere it is always the ten minutes before dinner in late August", isSample: true, authorName: "The Archivist" },
  { text: "i dreamt of a swimming pool shaped like a cloud and woke up tasting chlorine", isSample: true, authorName: "A Stranger" },
  { text: "the bus route passed the same red kite four times. the kite noticed on the fourth pass.", isSample: true, authorName: "The Archivist" },
  { text: "in the dream the petrol station sold postcards of the exact place it stood in", isSample: true, authorName: "A Stranger" },
  { text: "everyone I have ever missed was in the next field over, laughing at nothing", isSample: true, authorName: "The Archivist" },
];

const LEVELS = [
  { identifier: "Level 0", title: "The Lobby", isCanon: false, danger: "low (class 1)", tags: "yellow,fluorescent,starting", connections: "Level 1,Level 0.1", file: "back-1.png", description: "Mono-yellow wallpaper over six hundred million square miles of randomly segmented rooms. Damp carpet. Fluorescent hum at a frequency you will stop noticing and then never stop noticing. No entities confirmed — the silence does the work.", survival: "Do not follow humming that changes pitch. Walls that feel warm lead somewhere else." },
  { identifier: "Level 0.1", title: "The Red Corridors", isCanon: false, danger: "medium", tags: "corridors,red,variation", connections: "Level 0", file: null, description: "A community variation: the same floorplan, lit in a deep red. Travelers report the carpet sounds different here, like the building is chewing.", survival: "Keep to the left wall. Red rooms marked with chalk left by earlier wanderers are safe to sleep in." },
  { identifier: "Level 1", title: "Habitable Zone", isCanon: false, danger: "variable", tags: "warehouse,supplies,community", connections: "Level 0,Level 2", file: null, description: "A grey warehouse district with fog and functioning machinery. Supply crates appear where no one has left them. Small outposts of wanderers trade tinned food and directions that may be lies.", survival: "The lights fail in cycles. When they fail, stand still." },
  { identifier: "Level 2", title: "Pipe Dreams", isCanon: false, danger: "high", tags: "pipes,heat,maintenance", connections: "Level 1,Level 3", file: null, description: "Long maintenance corridors lined with hot pipework. The temperature rises the further you walk from Level 1, and the air develops a static charge that makes your hair float.", survival: "Turn back if the pipes begin to tick. The ticking is not thermal." },
  { identifier: "Level 37", title: "Sublimity", isCanon: false, danger: "low", tags: "water,pools,calm", connections: "Level 1", file: null, description: "An endless pool complex of warm water and tiled arches, claimed by the community as the gentlest level — sound behaves softly here, echoing a half-beat late.", survival: "Safe. Sleep here. Follow the trickle of water toward exits marked with white tile." },
  { identifier: "Level Fun", title: "=)", isCanon: false, danger: "severe", tags: "party,hostile,do-not-enter", connections: "Level 0", file: null, description: "Community lore describes a level of party rooms hosted by something that writes '=)' on the walls. Every account agrees on one point: the party does not end, and guests do not leave.", survival: "Do not attend. If you hear balloons, walk in the other direction." },
];

const NOTES = [
  { levelRef: "Level 0", title: "Orientation note, unsigned", kind: "note", timestamp: "day 1", foundAt: "taped under a table in a corner room", body: "If you are reading this you noclipped too. Rules we have so far:\n1. The carpet is always damp. Do not drink from it.\n2. Count your turns. Numbers help.\n3. The hum is not a machine. Do not look for the machine." },
  { levelRef: "Level 0", title: "Carpet sample log", kind: "document", timestamp: "day 12", foundAt: "pinned to a pillar", body: "Fibres are nylon, commercially common, but the dye never matches any manufacturer we know. Sample 7 is missing again. Whoever keeps borrowing the samples: stop. We need them." },
  { levelRef: "Level 0", title: "Sketch: room with two doors", kind: "sketch", timestamp: "unknown", foundAt: "drawn in wallpaper dust", body: "A pencil rubbing of a room layout with two doors marked 'back' and 'further'. Underneath, in different handwriting: 'they are both further'." },
  { levelRef: "Level 1", title: "Supply manifest (copy)", kind: "document", timestamp: "day 44", foundAt: "clipped to an empty crate", body: "WATER (x6) — taken\nTUNA (x4) — taken\nBATTERIES (x9) — taken\nMAPS OF LEVEL 2 (x0) — we do not make maps anymore" },
  { levelRef: "Level 1", title: "Light cycle warning", kind: "note", timestamp: "day 52", foundAt: "mailed between crates", body: "The blackout happens every ~6 hours. It is not an attack. The warehouse is just a warehouse. Standing still works. Running works badly. — T." },
  { levelRef: "Level 2", title: "Pipe temperature readings", kind: "document", timestamp: "day 3 (hot)", foundAt: "welded to a pipe flange", body: "Hour 1: warm. Hour 4: hot. Hour 9: the numbers stop making sense and the gauge reads a colour. We are leaving before the gauge reads a sound." },
  { levelRef: "Level 37", title: "A good place, for once", kind: "note", timestamp: "day ??", foundAt: "rolled inside a white tile", body: "Found this level by falling into warm water. The echo is polite. The light comes from everywhere and blames no one. If you make it here: rest. You have done enough walking." },
  { levelRef: null, title: "Page from someone's calendar", kind: "note", timestamp: "the 9th", foundAt: "Level 0, room 4012", body: "9th: walk north.\n10th: walk north.\n11th: walk north.\n12th: walk north.\n13th: (circled twice) THE HUM KNOWS I COUNT." },
];

async function main() {
  const existing = await db.artwork.count();
  if (existing > 0) {
    console.log(`Database already seeded (${existing} artworks). Skipping.`);
    return;
  }

  console.log("Seeding artworks...");
  for (let i = 0; i < ARTWORKS.length; i++) {
    const a = ARTWORKS[i];
    const url = art(a.aesthetic, a.file, i);
    await db.artwork.create({
      data: {
        title: a.title,
        description: a.description,
        imageUrl: url,
        aesthetic: a.aesthetic,
        medium: a.medium,
        year: a.year,
        authorName: a.medium === "photograph" || a.medium === "film-still" ? "The Curators" : "Original Artist",
        authorId: "curator",
        tags: a.tags,
        featured: a.featured ?? false,
        likeCount: Math.floor(Math.random() * 42) + 3,
        viewCount: Math.floor(Math.random() * 220) + 12,
      },
    });
  }

  console.log("Seeding postcards...");
  for (let i = 0; i < POSTCARDS.length; i++) {
    const p = POSTCARDS[i];
    await db.postcard.create({
      data: {
        title: p.title,
        caption: p.caption,
        imageUrl: art("dreamcore", p.file, 10 + i),
        tags: p.tags,
        hearts: Math.floor(Math.random() * 30) + 2,
        isSample: true,
      },
    });
  }

  console.log("Seeding cloud atlas...");
  for (let i = 0; i < CLOUD_LOCATIONS.length; i++) {
    const c = CLOUD_LOCATIONS[i];
    await db.cloudLocation.create({
      data: {
        name: c.name,
        description: c.description,
        imageUrl: art("dreamcore", c.file, 20 + i),
        tags: c.tags,
        isSample: true,
      },
    });
  }

  console.log("Seeding memory fragments...");
  for (const f of FRAGMENTS) {
    await db.memoryFragment.create({ data: f });
  }

  console.log("Seeding backrooms levels...");
  for (let i = 0; i < LEVELS.length; i++) {
    const l = LEVELS[i];
    await db.backroomsLevel.create({
      data: {
        identifier: l.identifier,
        title: l.title,
        description: l.description,
        survival: l.survival,
        danger: l.danger,
        tags: l.tags,
        connections: l.connections,
        imageUrl: l.file ? art("backrooms", l.file, 30 + i) : null,
        isCanon: l.isCanon,
      },
    });
  }

  console.log("Seeding found notes...");
  for (const n of NOTES) {
    await db.backroomsNote.create({
      data: {
        levelRef: n.levelRef,
        title: n.title,
        body: n.body,
        foundAt: n.foundAt,
        timestamp: n.timestamp,
        kind: n.kind,
        isCanon: false,
      },
    });
  }

  const count = await db.artwork.count();
  console.log(`Done. ${count} artworks seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
