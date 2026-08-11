<div align="center">

# Placeless

**A free, browser-based multiplayer social deduction game — Spyfall, reimagined for the modern web.**

No accounts. No installs. Share a 4-letter code and play.

[Live demo](https://placeless.vercel.app) · [Report an issue](https://github.com/SoansSandha/placeless/issues)

</div>

---

## What is it?

One player is secretly the **Spy**. Everyone else shares a secret **location**. Through
rounds of pointed questions, the group tries to expose the Spy — while the Spy tries to
blend in and deduce the location. It's a party game of bluffing and deduction, playable
over any voice or video call, straight from the browser.

- **3–10 players** per room
- **1–10 rounds** per game, with per-player **scoring** and final standings
- **~33 locations**, one secret role per round
- **Round timer** (3–15 min) that rolls straight into a vote when it expires
- **Anyone can call a vote** — it triggers once at least half the room agrees
- The **Spy can guess the location** at any time to steal the win
- **Light & dark mode**, fully responsive, playful spring-based motion

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router 7 (declarative) |
| Styling | Tailwind CSS v4 (`@theme`, class-based dark mode) |
| Animation | Framer Motion |
| Backend | Supabase — Postgres, Realtime, Row Level Security |
| Hosting | Vercel (auto-deploy from `main`) |
| Analytics | Vercel Web Analytics + Speed Insights |
| Auth | None — anonymous UUID in `localStorage` |

## How it works

The game is a state machine on `rooms.status`: **`lobby → playing → voting → ended`**,
looping across rounds. Clients subscribe to Supabase Realtime purely as a *signal to
refetch* — they never trust realtime payloads for anything secret.

### Security & anti-cheat model

There is no auth server; a player's identity is an unguessable UUID kept in their browser
(a bearer secret). Everything about keeping the game fair is enforced in the database:

- **Row Level Security + column-level GRANTs** hide the secret columns — `is_spy`,
  `location`, and `player_uuid` — so they never reach the client *or* a realtime payload.
  Rosters are read through `players_public` / `rooms_public` views that omit them.
- **Every mutation is a `SECURITY DEFINER` Postgres function (RPC)** authorized on the
  caller's bearer UUID. The anonymous client has no direct `INSERT`/`UPDATE`/`DELETE`.
- **Roles are assigned server-side only** — the client can never write `is_spy`.
- **Race conditions are handled in SQL** — room joins, host promotion, and vote resolution
  use row locks / single-statement guards so concurrent clients can't corrupt state.
- **Timers are server-time-gated** — the countdown is anchored to the server clock, and
  expiry RPCs only fire once the server agrees the time has truly elapsed, so a fast local
  clock can't end a round early.

## Getting started

**Prerequisites:** Node 22, npm, and a free [Supabase](https://supabase.com) project.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see .env.example)
cp .env.example .env
#   VITE_SUPABASE_URL=...          your project URL
#   VITE_SUPABASE_ANON_KEY=...     the anon / publishable key (never the service_role key)

# 3. Apply the database migrations
#    In the Supabase SQL Editor, run in order:
#    supabase/migrations/0001 → 0002 → 0003 → 0004

# 4. Run it
npm run dev
```

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with ESLint |

## Project structure

```
src/
  components/   Shared UI (Button, Navbar, ThemeToggle, room/*)
  hooks/        All Supabase access + app hooks (useGameRoom, useRoom, useTheme, ...)
  pages/        One file per route
  data/         Static data (locations)
  lib/          Supabase client init
supabase/
  migrations/   Schema, RLS + column grants, SECURITY DEFINER RPCs, realtime + cleanup cron
```

Routes: `/` · `/play` · `/play/join` · `/play/how-to-play` · `/room/:code`

## Deployment

Deployed on **Vercel** from the `main` branch. A `vercel.json` rewrites all paths to
`index.html` so client-side routes (like shared `/room/:code` invite links) resolve on a
hard refresh. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project,
and apply the Supabase migrations to the same project the deployment points at.

## License

Open source. Inspired by Spyfall.
