# Wonderwise

A kid-friendly web app where children play learning games, earn tokens for real
effort, and redeem them for real-life prizes you approve (a trip to the
trampoline park!). Built for ages 4–7 — audio-first, tap-first, and playful.

This repository currently contains **Stage 1: the vertical slice** — the full
loop proven end to end:

> **Play a math game → earn tokens (decided by the server) → ask for a prize →
> a grown-up approves → tokens are spent.**

## What's here

| Screen | Path | What it does |
| --- | --- | --- |
| Profile picker | `/` | Tap your avatar to start (no passwords for kids). |
| Kid dashboard | `/play/[childId]` | Token wallet + big buttons to play or shop. |
| Math game | `/play/[childId]/math` | Audio-first add/subtract game; the server grades answers and awards tokens. |
| Prize shop | `/play/[childId]/prizes` | Kid requests a prize; a grown-up must approve. |
| Grown-up zone | `/parent` | Approve/deny requests, see each kid's wallet and the catalog. |

### Design choices that matter

- **The server is the referee.** Questions are generated and graded on the
  server; token awards are computed server-side. The browser can _ask_ for
  things but never decides how many tokens it gets.
- **An un-farmable token economy** (`src/lib/economy.ts`): tokens scale with
  difficulty, a completion bonus rewards accuracy, and a **daily cap** stops
  grinding. Difficulty **adapts** to each child's accuracy.
- **Separate wallets and difficulty per child**, so an older kid can't
  out-earn a younger one.
- **Kid-friendly UI**: cool-toned palette, rounded chunky buttons, spoken
  prompts (Web Speech API), and a coin-burst reward moment.

## Run it locally

No accounts, no database setup, no API keys required for this slice.

```bash
npm install
npm run dev
# open http://localhost:3000
```

Two demo kids (**Fox** 🦊 and **Penguin** 🐧) and a starter prize catalog are
seeded automatically on first run.

## How data is stored (and what's next)

This slice uses a small **file-backed JSON store** (`src/lib/db.ts`) so the
whole loop persists across requests with zero setup — locally under `.data/`
(git-ignored), and under `/tmp` on a serverless host.

> **Note on deploying to Vercel:** serverless instances are stateless and
> `/tmp` is ephemeral, so the file store is for local play and demos. Durable,
> shared persistence comes with the Supabase migration below.

Everything goes through the small set of functions in `src/lib/db.ts`, so
swapping in **Supabase + Drizzle** later is a contained change — the screens
and game logic don't move. The data shapes in `src/lib/types.ts` are the
source of truth for that schema.

## Roadmap

- **Stage 0 — Foundations:** Supabase (Postgres + parent auth + image storage),
  Drizzle schema from `types.ts`, real parent login, editable prize catalog.
- **Stage 1 — Vertical slice:** ✅ _this commit_.
- **Stage 2 — Breadth:** more games, audio everywhere, richer progress.
- **Stage 3 — AI content:** **owner-only** generation of reading passages and
  writing prompts, with a review queue. The Anthropic API key stays server-side
  and the generator is gated to `OWNER_EMAIL` — enforced on the server, so no
  one else can generate content (see `.env.example`).
- **Stage 4 — Polish:** dashboards, tracing/writing games, nicer voices,
  animations.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · deploys on Vercel.
