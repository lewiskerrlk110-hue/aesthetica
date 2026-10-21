/**
 * Programmatic batch artwork generation with a small concurrency pool.
 * Usage: bun scripts/gen-images.mjs  (runs remaining files, saves base64 → png)
 */
import ZAI from "z-ai-web-dev-sdk";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "art");

const JOBS = [
  ["retro-2.png", "vintage 1980s sports car silhouette driving on a coastal highway at dusk, neon pink and orange sunset, glowing horizon, retro film photography, cinematic wide shot"],
  ["synth-1.png", "synthwave album cover art: giant striped sun over wireframe mountains, hot pink and cyan neon, geometric grid landscape, 1980s electronic music aesthetic, perfectly symmetric composition"],
  ["synth-2.png", "retro futuristic city skyline at night with glowing grid lines and neon horizons, electric violet and bright cyan, album cover style, dramatic symmetry"],
  ["synth-3.png", "abstract geometric neon shapes floating in dark space, glowing triangles and waveform patterns, hot pink orange and cyan, synthwave visualizer aesthetic"],
  ["vapor-1.png", "vaporwave collage art: classical marble bust on a checkerboard floor, pastel pink and mint green, floating retro computer windows, surreal digital ruins, artificial nostalgia"],
  ["vapor-2.png", "chrome sphere floating above reflective tiles with palm tree shadows, pastel gradient sky in lavender and cyan, surreal artificial paradise, vaporwave"],
  ["vapor-3.png", "old operating system windows floating in a pastel sky, vaporwave glitch art with subtle color separation, washed out cyan and coral, obsolete technology collage"],
  ["y2k-1.png", "Y2K millennium design: glossy inflated chrome shapes, iridescent holographic gradients, translucent plastic panels, bubblegum pink and icy blue, optimistic futuristic product aesthetic"],
  ["y2k-2.png", "early 2000s product photography: translucent turquoise gadgets, compact discs reflecting rainbow light, glossy silver background, chrome details, Y2K futurism"],
  ["y2k-3.png", "liquid metal chrome sphere floating above an iridescent rippled surface, holographic highlights, metallic lavender and turquoise, shiny millennium futurism"],
  ["dream-1.png", "dreamcore landscape: vast blue sky with enormous pink and orange clouds, wildflower meadow below, empty country road stretching to horizon, nostalgic summer dream, soft pastel light"],
  ["dream-2.png", "lonely retro petrol station under a huge sunset sky with pink clouds and butter yellow light, quiet country road, nostalgic surreal summer dream, dreamcore"],
  ["dream-3.png", "vintage bus interior with warm sunlight streaming through windows, empty seats, gentle dust motes in light, dreamlike nostalgic atmosphere, soft focus"],
  ["cyber-1.png", "cinematic futuristic megacity street at night, rain-soaked pavement reflecting neon signage, towering buildings disappearing into fog, holographic advertisements, moody film still, cyan and red neon"],
  ["cyber-2.png", "futuristic city district with elevated highways and dense urban architecture, steam vents, neon signage in distance, atmospheric haze, cinematic cyberpunk photography"],
  ["cyber-3.png", "rain streaks on a window overlooking a futuristic megacity at night, glowing signs and traffic lights blurred in distance, cinematic atmosphere, deep blue and neon red"],
  ["liminal-1.png", "liminal space photography: empty shopping mall corridor with fluorescent lighting, faded beige and cream colors, dated floor tiles, no people, quiet uncanny atmosphere"],
  ["liminal-2.png", "empty hotel corridor with repeating identical doors and warm fluorescent light, liminal space aesthetic, muted faded colors, eerie calm, photorealistic"],
  ["liminal-3.png", "indoor swimming pool with no people, blue tiled walls, still water, afternoon light through small windows, liminal space photography, quiet emptiness"],
  ["back-1.png", "endless yellow office rooms with yellowed wallpaper, buzzing fluorescent ceiling panels, damp worn carpet, empty reception area, unsettling analog VHS look, backrooms"],
  ["back-2.png", "repetitive yellow corridors with random doorways and square pillars, flickering fluorescent lights, analog video grain, eerie empty interior, backrooms"],
  ["back-3.png", "vintage surveillance camera view of empty yellow office space, low resolution CCTV aesthetic, fluorescent green tint, distorted shadows, backrooms horror"],
];

const pending = JOBS.filter(([f]) => !existsSync(join(OUT, f)));
const onlyArg = process.argv[2];
const subset = onlyArg ? pending.filter(([f]) => f.startsWith(onlyArg)) : pending;

console.log(`Pending: ${subset.length} images`);
const zai = await ZAI.create();

let done = 0;
const attempts = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function worker(queue, id) {
  while (queue.length) {
    const [file, prompt] = queue.shift();
    try {
      await sleep(id === 0 ? 0 : 2500);
      const res = await zai.images.generations.create({ prompt, size: "1344x768" });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("no image data in response");
      writeFileSync(join(OUT, file), Buffer.from(b64, "base64"));
      done++;
      console.log(`OK ${file} (${done}/${subset.length})`);
    } catch (e) {
      attempts[file] = (attempts[file] || 0) + 1;
      if (attempts[file] > 2) {
        console.log(`GIVEUP ${file}: ${e.message}`);
        continue;
      }
      console.log(`RETRY ${file} (attempt ${attempts[file]}): ${e.message}`);
      await sleep(6000);
      queue.push([file, prompt]);
    }
  }
}

const queue = [...subset];
await Promise.all([worker(queue, 0), worker(queue, 1)]);
console.log(`Finished. ${done} generated this run.`);
