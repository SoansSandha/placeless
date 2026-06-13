# CLAUDE.md — Placeless

Placeless is a free, browser-based multiplayer social deduction game inspired by Spyfall.
One player is secretly the **Spy**; everyone else shares a secret **location**. The Spy
tries to deduce the location from conversation; everyone else tries to expose the Spy.

This file is my operating contract for the repo. It mirrors the **Hard Rules**, **Tech
Stack**, and **Coding Practices** from `GEMINI.md` (the agent briefing originally written
for Gemini CLI) and adds a **Build & Test Commands** section for myself.

---

## Canonical Docs & Precedence

Read these in full before doing any work. **Do not write feature code until the next task
is discussed and agreed.**

- `docs/placeless-requirements.md` — game rules, user flows, DB schema, RLS, cleanup, page/component specs
- `DESIGN.md` — colors, typography, spacing, components, responsive rules
- `docs/placeless-hosting.md` — stack overview, env vars, deployment workflow
- `GEMINI.md` — agent briefing (source of the rules mirrored here)

**Precedence when docs conflict:**
1. `docs/placeless-requirements.md` wins over `GEMINI.md` / this file for **game logic & scope**.
2. `DESIGN.md` wins for **all visual decisions**.
3. `DESIGN.md` has a `version: alpha-playful` frontmatter ("Playful" interpretation) on top
   of older prose that still references "Sohne"/"Stripi" (weight 300, tight radii). The
   **frontmatter + the `GEMINI.md` token-translation table below are the operative truth**:
   use **Inter** (not Sohne), weight **400** for display, and the **larger "playful" radii**.

---

## Tech Stack

Mirrored from `GEMINI.md`, annotated with the versions actually installed (`package.json`).

| Layer | Per `GEMINI.md` | Actually installed | Notes |
|---|---|---|---|
| Framework | React 18 + Vite | **React 19.2.5**, Vite 8 | Repo is on React 19, not 18 — flagged, not yet reconciled in `GEMINI.md`. |
| Routing | React Router v6 (`<Routes>`/`<Route>`, **no loaders/actions**) | **react-router-dom 7.15.0** | Keep the behavioral rule: declarative `<Routes>`/`<Route>` only, no data-router loaders/actions. |
| Styling | Tailwind CSS (Vite plugin) | `@tailwindcss/vite` + `tailwindcss` 4.x | Tailwind **v4** — config lives in `vite.config.js` / `index.css`, no `tailwind.config.js`. |
| Animation | (motion tokens in `DESIGN.md`) | **framer-motion 12.38.0** | Use `motion.bounce` (spring) for buttons/transitions. |
| Backend | Supabase (`@supabase/supabase-js` v2) | 2.105.4 | Database, Realtime, RLS. Anon/publishable key only. |
| Hosting | Vercel (deploy from GitHub `main`) | — | Auto-deploys on push to `main`. |
| Auth | None — anonymous UUID via `localStorage` (`placeless_player_id`) | — | UUID is internal, never shown to the user. |

> `uipro-cli` is also a dependency but is tooling, not part of the runtime stack.

---

## File Structure

Do not create folders outside this structure without being explicitly asked.

```
src/
  components/     # Shared UI components (named exports, PascalCase)
  hooks/          # All Supabase calls live here (camelCase, use- prefix)
  pages/          # One file per route (default exports, PascalCase)
  data/           # Static data only (e.g. locations.js)
  lib/            # supabase.js client init only
```

Routes (per requirements §4): `/` (Home) · `/play` (Play Hub) · `/play/join` (Join) ·
`/play/how-to-play` (Rules) · `/room/:code` (Game Room — lobby → playing → voting → ended).

---

## Build & Test Commands

Run from the repo root. Package manager: npm. Node: v22.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies. |
| `npm run dev` | Start the Vite dev server (local development). |
| `npm run build` | Production build via `vite build`. |
| `npm run preview` | Serve the production build locally to smoke-test it. |
| `npm run lint` | ESLint over the project (`eslint .`). Must be clean — no suppressed warnings. |

There is **no automated test runner configured** (no `npm test`, no Vitest/Jest). Verify
changes via `npm run dev` + manual checks and `npm run build` for type/build errors. If a
test setup is wanted, ask before adding one (it would be a new dependency).

Env vars (local `.env`, git-ignored; also set on Vercel): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`. Commit a `.env.example` with blank values only.

---

## Hard Rules

These apply at all times. Do not violate them for any reason.

- **Never commit `.env`** — it is git-ignored, never touch it.
- **Never use the Supabase `service_role` key** — the client uses the anon/publishable key only.
- **Never query `is_spy` for other players** — always use the `players_public` view when listing players; only query `players` directly for the current user's own row.
- **Never call `supabase` directly from a component** — all Supabase calls live in custom hooks inside `src/hooks/`.
- **Never assign roles client-side** — role assignment must use a Supabase Edge Function or database RPC function; never write `is_spy` from React code.
- **Never do a read-then-write for host promotion** — host promotion must use a single RPC call with a `WHERE is_host = false` guard to prevent race conditions.
- **Never create new top-level folders** without being explicitly asked.
- **Never refactor working code** unless explicitly instructed.
- **Never use inline styles** — Tailwind utility classes only.
- **Never use rounded-rectangle buttons** — always pill shape (`rounded-full` / `border-radius: 9999px`).
- **Never use sharp corners** — always use the rounded tokens (min `rounded-2xl` for cards).
- **Never use linear animations for UI triggers** — always use `motion.bounce` (spring) for buttons and transitions.
- **Never remove the gradient mesh from the homepage hero** — a bare canvas hero breaks the brand.
- **Never use default Tailwind color names for brand colors** — use hex arbitrary values as defined in the token translation table below.
- **Never load Sohne** — use Inter from Google Fonts.
- **Never install a new dependency** without being explicitly asked.

---

## Coding Practices

Write clean, production-quality code at all times. These apply to every file I touch.

### General
- Write code that is readable first, clever second — prefer clarity over brevity.
- Keep components small and focused — one responsibility per component.
- Functional components only, no class components.
- Named exports for components, default exports for pages.
- Always handle loading and error states — never assume a Supabase call succeeds.
- Clean up Supabase Realtime subscriptions on component unmount to prevent memory leaks — always return the unsubscribe function from `useEffect`.
- Keep `useEffect` dependencies accurate and complete — no suppressed lint warnings.
- Derive values from state where possible — avoid storing derived data in separate state variables.

### Naming
- Components: `PascalCase` (e.g. `PlayerCard`, `TimerDisplay`).
- Hooks: `camelCase` prefixed with `use` (e.g. `useRoom`, `usePlayers`).
- Files: match the component or hook name exactly.
- Variables and functions: `camelCase`, descriptive — no single-letter variables outside of loop counters.

### Error Handling
- Every Supabase call must have error handling — log the error and surface a user-friendly message where appropriate.
- Never let the UI silently fail — the player should always know if something went wrong.
- Never expose raw Supabase error details to the UI — log to console, show a generic message to the player.
- Validate all user inputs client-side before sending to Supabase.

### Comments
- Comment the *why*, not the *what* — the code itself should explain what it does.
- Add a short comment above any Supabase query that has non-obvious logic (e.g. RLS-related decisions).
- No commented-out dead code — delete it.

---

## Design Token → Tailwind Translation

`DESIGN.md` uses token syntax like `{colors.primary}` and `{rounded.pill}`. These are not
code — translate them to Tailwind utilities / arbitrary values as below.

### Colors
| Token | Hex | Tailwind |
|---|---|---|
| `{colors.primary}` | `#533afd` | `bg-[#533afd]` / `text-[#533afd]` |
| `{colors.primary-deep}` | `#4434d4` | `bg-[#4434d4]` |
| `{colors.primary-press}` | `#2e2b8c` | `bg-[#2e2b8c]` |
| `{colors.primary-soft}` | `#665efd` | `bg-[#665efd]` |
| `{colors.primary-bg-subdued-hover}` | `#b9b9f9` | `bg-[#b9b9f9]` |
| `{colors.brand-dark-900}` | `#1c1e54` | `bg-[#1c1e54]` |
| `{colors.ink}` | `#0d253d` | `text-[#0d253d]` |
| `{colors.ink-secondary}` | `#273951` | `text-[#273951]` |
| `{colors.ink-mute}` | `#64748d` | `text-[#64748d]` |
| `{colors.on-primary}` | `#ffffff` | `text-white` |
| `{colors.canvas}` | `#ffffff` | `bg-white` |
| `{colors.canvas-soft}` | `#f6f9fc` | `bg-[#f6f9fc]` |
| `{colors.canvas-cream}` | `#f5e9d4` | `bg-[#f5e9d4]` |
| `{colors.hairline}` | `#e3e8ee` | `border-[#e3e8ee]` |
| `{colors.hairline-input}` | `#a8c3de` | `border-[#a8c3de]` |
| `{colors.ruby}` | `#ea2261` | `text-[#ea2261]` |

### Border Radius (increased for playfulness)
| Token | Value | Tailwind |
|---|---|---|
| `{rounded.xs}` | 6px | `rounded-[6px]` |
| `{rounded.sm}` | 10px | `rounded-[10px]` |
| `{rounded.md}` | 14px | `rounded-2xl` |
| `{rounded.lg}` | 20px | `rounded-3xl` |
| `{rounded.xl}` | 28px | `rounded-[28px]` |
| `{rounded.pill}` | 9999px | `rounded-full` |

### Motion (Framer Motion)
| Token | Logic | Usage |
|---|---|---|
| `{motion.bounce}` | `type: "spring", stiffness: 300, damping: 15` | Buttons, hover states |
| `{motion.smooth}` | `type: "tween", duration: 0.4, ease: "circOut"` | Page transitions, reveals |

### Typography (Inter)
| Token | Size | Weight | Tailwind |
|---|---|---|---|
| `{typography.display-xxl}` | 56px | 400 | `text-[56px] font-normal tracking-[-1.4px]` |
| `{typography.display-xl}` | 48px | 400 | `text-[48px] font-normal tracking-[-0.96px]` |
| `{typography.display-lg}` | 32px | 400 | `text-[32px] font-normal tracking-[-0.64px]` |
| `{typography.heading-md}` | 20px | 500 | `text-[20px] font-medium tracking-[-0.2px]` |
| `{typography.body-lg}` | 16px | 400 | `text-base font-normal` |

`ss01` is applied globally on `body` in `index.css`. Inter is loaded in `index.html`.

---

## When in Doubt

- Ask before installing any new dependency.
- Ask before creating any file outside the defined structure.
- Ask before writing any Supabase database function or RPC.
- Ask before making any decision that affects the database schema or RLS policies.
- Never assume a feature is out of scope — check `docs/placeless-requirements.md` first.

---

## Status & Tasks

`GEMINI.md` → **Current Status** is the canonical, session-updated checklist; keep the two
in sync. Snapshot as of 2026-06-13:

**Done & code-complete (lint + build green):** marketing site (`/`), entry flow (`/play`,
`/play/join`), `How to Play`, the full game room (`/room/:code`) across all five phases,
the `useGameRoom` realtime hook, RPC-backed `useRoom`, and the `supabase/migrations/` SQL
(schema, RLS + column-grant secrecy, `SECURITY DEFINER` RPCs, realtime + cleanup cron).

> ⚠️ **Built ≠ shipped.** The game does **not** run until the SQL migrations are applied to
> Supabase. I can't apply them (no Supabase access; `service_role` is forbidden) — that's a
> manual step for a maintainer.

**Remaining tasks (in order):**

1. **Apply SQL migrations** `0001 → 0002 → 0003 → 0004` in the Supabase SQL editor. `0002`
   replaces RLS + re-grants column privileges — review against existing dashboard config first.
2. **Verify realtime column secrecy** — confirm a `players` subscription does not deliver
   `is_spy` (per `supabase/README.md`). This is the anti-cheat linchpin.
3. **End-to-end playtest** — create → join → start → reveal → accuse → vote → results →
   play again; plus host-leaves promotion and mid-game refresh reconnect.
4. **Commit + push** `feat/play-and-join-pages` and open a PR (only when asked).
5. **Deploy** — connect Vercel to GitHub; set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

**Backlog (optional):** code-split the ~594 kB bundle (framer-motion + supabase) toward the
< 2s-to-interactive goal; reconcile the React 18 / RR v6 wording with the installed
React 19 / RR 7.
