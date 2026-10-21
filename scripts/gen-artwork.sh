#!/bin/bash
# Batch artwork generation for all eight aesthetics — run with concurrency 3
cd /home/z/my-project
OUT=./public/art
mkdir -p $OUT

gen() {
  local prompt="$1"; local file="$2"; local size="${3:-1344x768}"
  if [ -f "$OUT/$file" ]; then echo "SKIP $file"; return; fi
  bunx z-ai image -p "$prompt" -o "$OUT/$file" -s "$size" >/dev/null 2>&1 \
    && echo "OK $file" || { echo "RETRY $file"; bunx z-ai image -p "$prompt" -o "$OUT/$file" -s "$size" >/dev/null 2>&1 && echo "OK2 $file" || echo "FAIL $file"; }
}

# ---- RETROWAVE
gen "1980s retrofuturistic poster art: wireframe perspective grid highway stretching toward a giant gradient sunset sun, palm tree silhouettes, distant neon city skyline, purple and pink sky, cinematic, subtle film grain" "retro-1.png" &
gen "vintage 1980s sports car silhouette driving on a coastal highway at dusk, neon pink and orange sunset, glowing horizon, retro film photography, cinematic wide shot" "retro-2.png" &
gen "glowing neon motel sign at night in 1980s style, deep purple sky, retro arcade storefront lights, VHS era aesthetic, cinematic night photography" "retro-3.png" &
wait
# ---- SYNTHWAVE
gen "synthwave album cover art: giant striped sun over wireframe mountains, hot pink and cyan neon, geometric grid landscape, 1980s electronic music aesthetic, perfectly symmetric composition" "synth-1.png" &
gen "retro futuristic city skyline at night with glowing grid lines and neon horizons, electric violet and bright cyan, album cover style, dramatic symmetry" "synth-2.png" &
gen "abstract geometric neon shapes floating in dark space, glowing triangles and waveform patterns, hot pink orange and cyan, synthwave visualizer aesthetic" "synth-3.png" &
wait
# ---- VAPORWAVE
gen "vaporwave collage art: classical marble bust on a checkerboard floor, pastel pink and mint green, floating retro computer windows, surreal digital ruins, artificial nostalgia" "vapor-1.png" &
gen "chrome sphere floating above reflective tiles with palm tree shadows, pastel gradient sky in lavender and cyan, surreal artificial paradise, vaporwave" "vapor-2.png" &
gen "old operating system windows floating in a pastel sky, vaporwave glitch art with subtle color separation, washed out cyan and coral, obsolete technology collage" "vapor-3.png" &
wait
# ---- Y2K
gen "Y2K millennium design: glossy inflated chrome shapes, iridescent holographic gradients, translucent plastic panels, bubblegum pink and icy blue, optimistic futuristic product aesthetic" "y2k-1.png" &
gen "early 2000s product photography: translucent turquoise gadgets, compact discs reflecting rainbow light, glossy silver background, chrome details, Y2K futurism" "y2k-2.png" &
gen "liquid metal chrome sphere floating above an iridescent rippled surface, holographic highlights, metallic lavender and turquoise, shiny millennium futurism" "y2k-3.png" &
wait
# ---- DREAMCORE
gen "dreamcore landscape: vast blue sky with enormous pink and orange clouds, wildflower meadow below, empty country road stretching to horizon, nostalgic summer dream, soft pastel light" "dream-1.png" &
gen "lonely retro petrol station under a huge sunset sky with pink clouds and butter yellow light, quiet country road, nostalgic surreal summer dream, dreamcore" "dream-2.png" &
gen "vintage bus interior with warm sunlight streaming through windows, empty seats, gentle dust motes in light, dreamlike nostalgic atmosphere, soft focus" "dream-3.png" &
wait
# ---- CYBERPUNK
gen "cinematic futuristic megacity street at night, rain-soaked pavement reflecting neon signage, towering buildings disappearing into fog, holographic advertisements, moody film still, cyan and red neon" "cyber-1.png" &
gen "futuristic city district with elevated highways and dense urban architecture, steam vents, neon signage in distance, atmospheric haze, cinematic cyberpunk photography" "cyber-2.png" &
gen "rain streaks on a window overlooking a futuristic megacity at night, glowing signs and traffic lights blurred in distance, cinematic atmosphere, deep blue and neon red" "cyber-3.png" &
wait
# ---- LIMINAL
gen "liminal space photography: empty shopping mall corridor with fluorescent lighting, faded beige and cream colors, dated floor tiles, no people, quiet uncanny atmosphere" "liminal-1.png" &
gen "empty hotel corridor with repeating identical doors and warm fluorescent light, liminal space aesthetic, muted faded colors, eerie calm, photorealistic" "liminal-2.png" &
gen "indoor swimming pool with no people, blue tiled walls, still water, afternoon light through small windows, liminal space photography, quiet emptiness" "liminal-3.png" &
wait
# ---- BACKROOMS
gen "endless yellow office rooms with yellowed wallpaper, buzzing fluorescent ceiling panels, damp worn carpet, empty reception area, unsettling analog VHS look, backrooms" "back-1.png" &
gen "repetitive yellow corridors with random doorways and square pillars, flickering fluorescent lights, analog video grain, eerie empty interior, backrooms" "back-2.png" &
gen "vintage surveillance camera view of empty yellow office space, low resolution CCTV aesthetic, fluorescent green tint, distorted shadows, backrooms horror" "back-3.png" &
wait
echo "ALL DONE"
