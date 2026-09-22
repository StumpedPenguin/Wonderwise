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
| Kid dashboard | `/play/[childId]` | Token wallet + a colorful game picker. |
| Game | `/play/[childId]/game/[gameId]` | Any game; the server generates and grades it and awards tokens. |
| Prize shop | `/play/[childId]/prizes` | Kid requests a prize; a grown-up must approve. |

### Games

All procedural (free, infinite, safe) and audio-first:

| Game | Skill | How it plays |
| --- | --- | --- |
| **Add & Subtract** | Numbers | Multiple-choice add/subtract within the child's level. |
| **Count & Tap** | Numbers | Count the emojis, tap the number. |
| **Letter Sounds** | Reading | Hear a letter's sound, tap the letter. |
| **Build a Word** | Writing | Tap letters to spell a word from its picture. |
| **Tracing** | Writing | Trace a letter or number on a canvas with your finger. |

Games plug into one registry (`src/lib/games.ts`) — each defines how it
generates a round, what its answers are worth, and how difficulty adapts.
Adding a game is one entry there plus (only if it needs a new interaction) a
branch in `PlayGame`.
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

## How data is stored

There are two interchangeable backends behind one small interface
(`src/lib/store/`). Screens and server actions don't know or care which is
running:

- **File store** (default) — a JSON document under `.data/` locally (or `/tmp`
  on serverless). Zero setup; great for local dev and demos. Not durable on
  serverless, since each instance has its own `/tmp`.
- **Postgres / Drizzle** — activates automatically when `DATABASE_URL` is set.
  Durable and safe on serverless. This is what a deployed app should use.

### Make it durable (Supabase → Vercel)

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy the **pooled** ("Transaction") Postgres connection string and set it as
   `DATABASE_URL` (locally in `.env`, and in your Vercel project settings).
3. Apply the schema: `npm run db:migrate` (or paste
   `drizzle/0000_*.sql` into the Supabase SQL editor).
4. Seed the two kids and prize catalog: run `drizzle/seed.sql` (SQL editor, or
   `psql "$DATABASE_URL" -f drizzle/seed.sql`).

That's it — redeploy and data is durable. The Drizzle schema
(`src/lib/schema.ts`) mirrors `src/lib/types.ts`.

> The Postgres backend is code-complete and type-checked but hasn't yet been
> run against a live database — the first Supabase connection is the moment to
> verify it end to end.

## Lock the grown-up zone

The `/parent` area is **open by default** (handy for local dev). Set a
`PARENT_PASSCODE` env var (locally or in Vercel) to require a family passcode;
the app stores an HMAC-signed, httpOnly cookie — the passcode itself never
rides in the cookie. Multi-parent login (Supabase Auth / magic links) is a
later upgrade.

## Roadmap

- **Stage 0 — Foundations:** ✅ Postgres/Drizzle backend (activate with
  `DATABASE_URL`), schema + migration, and a passcode-locked grown-up zone.
- **Parent admin:** ✅ editable kids (name/avatar/color, add/remove) and an
  editable prize catalog (name/emoji/cost/active) — all auth-gated on the
  server. _Still to come:_ multi-parent login, image storage.
- **Stage 1 — Vertical slice:** ✅ the full learn → earn → redeem → approve loop.
- **Stage 2 — Breadth:** ✅ games behind one engine, a game picker, audio
  everywhere, per-game token weighting and adaptive math difficulty.
- **Parent progress dashboard:** ✅ per-kid balance, earned/spent, games played,
  a 7-day earning chart, per-game breakdown, and a recent-activity feed
  (`/parent/progress`).
- **Stage 4 — Polish:** ✅ Tracing game (canvas), friendlier voice selection,
  and confetti reward moments.
- **Stage 3 — AI content:** **owner-only** generation of reading passages and
  writing prompts, with a review queue. The Anthropic API key stays server-side
  and the generator is gated to `OWNER_EMAIL` — enforced on the server, so no
  one else can generate content (see `.env.example`).
- **Stage 4 — Polish:** dashboards, tracing/writing games, nicer voices,
  animations.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · deploys on Vercel.
