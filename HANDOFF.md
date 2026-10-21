# AESTHETICA — Project Handoff (read this first in any new chat)

A living museum of eight internet aesthetics, built as a single-page immersive site. If you are a new chat session reading this: the full project already exists and works. Do NOT rebuild it — read, then edit incrementally.

## What this is
- **AESTHETICA — A Living Museum of Internet Aesthetics.** Eight worlds: Retrowave, Synthwave, Vaporwave, Y2K, Dreamcore, Cyberpunk, Liminal Spaces, The Backrooms.
- Each world has: a living canvas/CSS environment, a unique interactive experience, a real gallery (browse/like/bookmark/comment/upload/search), and a historical archive with **documented facts vs. interpretation** clearly labelled.
- Real backend: Next.js 16 App Router + Prisma/SQLite. Community data (likes, comments, uploads, journal) persists in the DB.

## Architecture (one visible route)
- **Single visible route `/`** — the whole site is a client-side SPA with **hash routing** (`#/world/vaporwave`, `#/artwork/12`, `#/search?q=…`, `#/profile`, `#/shared/<shareId>`). Router: `src/lib/store.ts` (`initRouter()`, `useApp`). Theme switching via `data-world` attribute on a wrapper.
- Anonymous device identity: localStorage UUID + display name, sent via `x-user-id` / `x-user-name` headers (`src/lib/identity.ts`).
- All artworks/features registered centrally in `src/lib/aesthetics.ts` (the `WORLDS` array) — this is the single source of truth for names, colors, blurbs, archive text.

## Where everything lives
| Change… | Edit |
|---|---|
| World names/colors/blurbs/archive text | `src/lib/aesthetics.ts` |
| Per-world themes, animations, overlays | `src/app/globals.css` (`[data-world="…"]` blocks) |
| World interactions (retrowave sunset slider, synthwave audio visualizer, vaporwave draggable windows, y2k chrome, dreamcore journal/radio, cyberpunk rain canvas + timeline, liminal directory, backrooms raycaster + radio room) | `src/components/worlds/<name>.tsx` (shared shell: `world-shell.tsx`, `world-page.tsx`) |
| Backrooms raycaster + dreamcore extras | `src/components/features/backrooms-explorer.tsx`, `dreamcore-features.tsx` |
| Homepage (hero canvas, portal cards, stats strips) | `src/components/homepage/homepage.tsx`, `hero-canvas.tsx` |
| Gallery (card, viewer, upload, search) | `src/components/gallery/` |
| Nav / profile | `src/components/shared/nav.tsx`, `profile.tsx` |
| API | `src/app/api/…` (artworks CRUD, like/bookmark/comment, journal CRUD, fragments, dreamseed, stats) |
| Seed data | `scripts/seed.ts` (idempotent) |
| AI artwork generation | `scripts/gen-images.mjs` → writes to `public/art/` |

## Run / verify
```bash
cd /home/z/my-project
bun run db:push        # schema already pushed
bun scripts/seed.ts    # idempotent; DB already seeded (41 artworks etc.)
bun run dev            # dev server
bun run lint           # currently clean
```
DB file lives under `db/`. Uploaded images are stored as data URLs in SQLite.

## State
- Fully built and QA'd end-to-end (upload, like, comment, bookmark, search, journal CRUD + privacy/share links, mobile, reduced-motion). 24 AI-generated images in `public/art/` + SVG fallbacks.
- Full build history: `worklog.md` (read it for decisions & fixes).
