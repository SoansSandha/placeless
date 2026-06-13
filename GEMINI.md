# Placeless — Agent Briefing

Placeless is a free browser-based multiplayer social deduction game inspired by the card game Spyfall (designed by Alexandr Ushan, published by Hobby World). One player is secretly the Spy; everyone else knows the shared secret location. The Spy tries to deduce the location from conversation; everyone else tries to expose the Spy.

---

## Read These First

Before doing any work, read all three documents in full. **Do not write any code until you confirm you have read all three.**

- **Requirements:** `docs/placeless-requirements.md` — game rules, user flows, database schema, RLS, cleanup system, all page and component specs
- **Design system:** `DESIGN.md` — colors, typography, spacing, components, responsive rules
- **Hosting:** `docs/placeless-hosting.md` — stack overview, environment variables, deployment workflow

If anything in this file conflicts with `docs/placeless-requirements.md`, the requirements doc wins. If anything conflicts with `DESIGN.md`, DESIGN.md wins for all visual decisions.

---

## Tech Stack

- React 18 + Vite
- React Router v6 (use `<Routes>` / `<Route>` — no loaders/actions)
- Tailwind CSS (Vite plugin)
- Supabase (`@supabase/supabase-js` v2) — database, realtime, RLS
- Vercel — hosting (deploy from GitHub)

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

---

## Design Token → Tailwind Translation

`DESIGN.md` uses a token syntax like `{colors.primary}` and `{rounded.pill}`. These are not code — translate them to Tailwind utility classes or arbitrary values as follows.

### Colors

| Token | Hex | Tailwind usage |
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

### Border Radius (Increased for Playfulness)

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
| `{motion.bounce}` | `type: "spring", stiffness: 300, damping: 15` | Buttons, Hover states |
| `{motion.smooth}` | `type: "tween", duration: 0.4, ease: "circOut"` | Page transitions, Reveals |

### Typography (Inter)

| Token | Size | Weight | Tailwind |
|---|---|---|---|
| `{typography.display-xxl}` | 56px | 400 | `text-[56px] font-normal tracking-[-1.4px]` |
| `{typography.display-xl}` | 48px | 400 | `text-[48px] font-normal tracking-[-0.96px]` |
| `{typography.display-lg}` | 32px | 400 | `text-[32px] font-normal tracking-[-0.64px]` |
| `{typography.heading-md}` | 20px | 500 | `text-[20px] font-medium tracking-[-0.2px]` |
| `{typography.body-lg}` | 16px | 400 | `text-base font-normal` |

---

## Hard Rules

These apply at all times. Do not violate them for any reason.

- **Never commit `.env`** — it is git-ignored, never touch it
- **Never use the Supabase `service_role` key** — the client uses the anon/publishable key only
- **Never query `is_spy` for other players** — always use the `players_public` view when listing players; only query `players` directly for the current user's own row
- **Never call `supabase` directly from a component** — all Supabase calls live in custom hooks inside `src/hooks/`
- **Never assign roles client-side** — role assignment must use a Supabase Edge Function or database RPC function; never write `is_spy` from React code
- **Never do a read-then-write for host promotion** — host promotion must use a single RPC call with a `WHERE is_host = false` guard to prevent race conditions
- **Never create new top-level folders** without being explicitly asked
- **Never refactor working code** unless explicitly instructed
- **Never use inline styles** — Tailwind utility classes only
- **Never use rounded-rectangle buttons** — always pill shape (`rounded-full` / `border-radius: 9999px`)
- **Never use sharp corners** — always use the rounded tokens (min `rounded-2xl` for cards)
- **Never use linear animations for UI triggers** — always use `motion.bounce` (spring) for buttons and transitions
- **Never remove the gradient mesh from the homepage hero** — a bare canvas hero breaks the brand
- **Never use default Tailwind color names for brand colors** — use hex arbitrary values as defined in the token translation table above
- **Never load Sohne** — use Inter from Google Fonts
- **Never install a new dependency** without being explicitly asked

---

## Coding Practices

Write clean, production-quality code at all times. These apply to every file you touch.

### General
- Write code that is readable first, clever second — prefer clarity over brevity
- Keep components small and focused — one responsibility per component
- Functional components only, no class components
- Named exports for components, default exports for pages
- Always handle loading and error states — never assume a Supabase call succeeds
- Clean up Supabase Realtime subscriptions on component unmount to prevent memory leaks — always return the unsubscribe function from `useEffect`
- Keep `useEffect` dependencies accurate and complete — no suppressed lint warnings
- Derive values from state where possible — avoid storing derived data in separate state variables

### Naming
- Components: `PascalCase` (e.g. `PlayerCard`, `TimerDisplay`)
- Hooks: `camelCase` prefixed with `use` (e.g. `useRoom`, `usePlayers`)
- Files: match the component or hook name exactly
- Variables and functions: `camelCase`, descriptive — no single-letter variables outside of loop counters

### Error Handling
- Every Supabase call must have error handling — log the error and surface a user-friendly message where appropriate
- Never let the UI silently fail — the player should always know if something went wrong
- Never expose raw Supabase error details to the UI — log to console, show a generic message to the player
- Validate all user inputs client-side before sending to Supabase

### Comments
- Comment the *why*, not the *what* — the code itself should explain what it does
- Add a short comment above any Supabase query that has non-obvious logic (e.g. RLS-related decisions)
- No commented-out dead code — delete it

---

## When in Doubt

- Ask before installing any new dependency
- Ask before creating any file outside the defined structure
- Ask before writing any Supabase database function or RPC
- Ask before making any decision that affects the database schema or RLS policies
- Never assume a feature is out of scope — check `docs/placeless-requirements.md` first

---

## Current Status

Update this section at the end of every session. Treat this as the source of truth for what is and isn't done. _Last updated: 2026-06-13._

> **Built ≠ shipped.** Everything under "Built this session" is code-complete with lint + build green, but the game does **not** run until the SQL migrations are applied to Supabase (see "To ship / verify").

### ✅ Done — scaffold, design, marketing + entry flow
- [x] Vite + React project initialized
- [x] `docs/` folder with requirements and hosting docs
- [x] `DESIGN.md` design system in place
- [x] Dependencies installed: `react-router-dom`, `@supabase/supabase-js`, `tailwindcss`, `framer-motion`
- [x] Supabase project created and healthy
- [x] 4 tables created (`rooms`, `players`, `votes`, `events`), initial RLS, realtime, and hourly cleanup cron configured via the dashboard _(now superseded/extended by the committed migrations — see below)_
- [x] `.env` populated with Supabase URL + anon key
- [x] `src/lib/supabase.js` initialized (anon key only)
- [x] Tailwind v4 configured in `vite.config.js` + `index.css`; Inter loaded (300/400); `ss01` global; `--text-display-*` / `--text-heading-md` type tokens added
- [x] React Router configured in `App.jsx` (all 5 routes)
- [x] `src/data/locations.js` populated (33 locations)
- [x] Homepage (`/`) built
- [x] Play Hub (`/play`) built
- [x] Join page (`/play/join`) built
- [x] How to Play (`/play/how-to-play`) built

### 🔨 Built this session — code complete, pending DB apply + playtest
- [x] Anonymous identity (`src/lib/player.js`) + room create/join moved to server RPCs in `useRoom` (fixes the capacity race + duplicate-name gaps)
- [x] `useGameRoom` hook — realtime subscribe→refetch, reconnect-on-mount, host auto-promotion, all game actions, subscription cleanup on unmount
- [x] Room page (`/room/:code`) — Lobby state (roster, code share, host timer selector, start gate)
- [x] Room page — Role Reveal state (private card, ready-up, host "begin now")
- [x] Room page — Playing state (server-anchored timer, Accuse, spy "Guess Location")
- [x] Room page — Voting state (live tally, one vote/round, can't-vote-self)
- [x] Room page — Results state (spy + location reveal, winner, Play Again / Leave)
- [x] SQL migrations committed to `supabase/migrations/` — canonical schema, RLS + column-grant secrecy (`is_spy`/`player_uuid`/`location` hidden), all `SECURITY DEFINER` RPCs, realtime publication + cleanup cron
- [x] Adversarial review pass (SQL/RLS, hard rules, React/spec); real findings fixed
- [x] Lint clean + production build green

### ⏳ To ship / verify (the remaining work)
- [ ] **Apply SQL migrations to Supabase** in order: `0001 → 0002 → 0003 → 0004`. `0002` rewrites RLS + column grants — review against the existing dashboard config first
- [ ] **Verify realtime column secrecy** — a `players` subscription must NOT deliver `is_spy` (see `supabase/README.md`); this is the linchpin of the anti-cheat model
- [ ] End-to-end multiplayer playtest: create → join → start → reveal → accuse → vote → results → play again (plus host-leaves promotion + refresh reconnect)
- [ ] Commit + push `feat/play-and-join-pages`; open PR
- [ ] Vercel connected to GitHub and deployed (set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)

### 🧊 Backlog / optional
- [ ] Code-split the bundle (~594 kB; framer-motion + supabase) toward the < 2s-to-interactive goal
- [ ] Reconcile this file's Tech Stack (React 18 / RR v6) with what's installed (React 19 / RR 7)
