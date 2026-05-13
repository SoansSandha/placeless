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

### Border Radius

| Token | Value | Tailwind |
|---|---|---|
| `{rounded.xs}` | 4px | `rounded` |
| `{rounded.sm}` | 6px | `rounded-[6px]` |
| `{rounded.md}` | 8px | `rounded-lg` |
| `{rounded.lg}` | 12px | `rounded-xl` |
| `{rounded.xl}` | 16px | `rounded-2xl` |
| `{rounded.pill}` | 9999px | `rounded-full` |

### Spacing

| Token | Value | Tailwind |
|---|---|---|
| `{spacing.xxs}` | 2px | `p-0.5` |
| `{spacing.xs}` | 4px | `p-1` |
| `{spacing.sm}` | 8px | `p-2` |
| `{spacing.md}` | 12px | `p-3` |
| `{spacing.lg}` | 16px | `p-4` |
| `{spacing.xl}` | 24px | `p-6` |
| `{spacing.xxl}` | 32px | `p-8` |
| `{spacing.huge}` | 64px | `p-16` |

### Typography

All display and heading text uses **Inter** (loaded from Google Fonts at weights 300 and 400). Do not attempt to load Sohne — it is proprietary. Inter at weight 300 with negative letter-spacing is the correct substitute.

Apply `font-feature-settings: "ss01"` globally on the `body` element in `index.css`.
Apply `font-feature-settings: "tnum"` per-element on any numeric or timer content.

| Token | Size | Weight | Letter Spacing | Tailwind |
|---|---|---|---|---|
| `{typography.display-xxl}` | 56px | 300 | -1.4px | `text-[56px] font-light tracking-[-1.4px]` |
| `{typography.display-xl}` | 48px | 300 | -0.96px | `text-[48px] font-light tracking-[-0.96px]` |
| `{typography.display-lg}` | 32px | 300 | -0.64px | `text-[32px] font-light tracking-[-0.64px]` |
| `{typography.display-md}` | 26px | 300 | -0.26px | `text-[26px] font-light tracking-[-0.26px]` |
| `{typography.heading-lg}` | 22px | 300 | -0.22px | `text-[22px] font-light tracking-[-0.22px]` |
| `{typography.heading-md}` | 20px | 300 | -0.2px | `text-[20px] font-light tracking-[-0.2px]` |
| `{typography.heading-sm}` | 18px | 300 | 0 | `text-[18px] font-light` |
| `{typography.body-lg}` | 16px | 300 | 0 | `text-base font-light` |
| `{typography.body-md}` | 15px | 300 | 0 | `text-[15px] font-light` |
| `{typography.button-md}` | 16px | 400 | 0 | `text-base font-normal` |
| `{typography.button-sm}` | 14px | 400 | 0 | `text-sm font-normal` |
| `{typography.caption}` | 13px | 400 | -0.39px | `text-[13px] font-normal tracking-[-0.39px]` |

Never use default Tailwind color names (`indigo-500`, `blue-600`, etc.) for brand colors — always use the hex arbitrary values above.

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
- **Never bump display font weight above 300** — it breaks the brand
- **Never remove the gradient mesh from the homepage hero** — a bare canvas hero breaks the brand
- **Never use default Tailwind color names for brand colors** — use hex arbitrary values as defined in the token translation table above
- **Never load Sohne** — use Inter from Google Fonts at weights 300 and 400 only
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

Update this section at the end of every session. Treat this as the source of truth for what is and isn't done.

- [x] Vite + React project initialized
- [x] `docs/` folder with requirements and hosting docs
- [x] `DESIGN.md` design system in place
- [x] Dependencies installed: `react-router-dom`, `@supabase/supabase-js`, `tailwindcss`
- [x] Supabase project created and healthy
- [x] All 4 tables created: `rooms`, `players`, `votes`, `events`
- [x] RLS policies configured and Security Advisor clean
- [x] Realtime enabled on all 4 tables
- [x] Cleanup cron job scheduled (hourly via pg_cron)
- [x] `.env` file populated with Supabase URL and anon key
- [x] `src/lib/supabase.js` initialized
- [x] `src/components/` and `src/pages/` folders created
- [x] `GEMINI.md` written
- [x] Tailwind CSS configured in `vite.config.js` and `index.css`
- [x] Inter font loaded in `index.html` (weights 300 and 400)
- [x] `font-feature-settings: "ss01"` applied globally on `body` in `index.css`
- [x] React Router configured in `App.jsx`
- [x] `src/data/locations.js` populated
- [ ] Homepage (`/`) built
- [ ] Play Hub (`/play`) built
- [ ] How to Play (`/play/how-to-play`) built
- [ ] Room page (`/room/:code`) — Lobby state
- [ ] Room page — Role Reveal state
- [ ] Room page — Playing state
- [ ] Room page — Voting state
- [ ] Room page — Results state
- [ ] GitHub repo created and code pushed
- [ ] Vercel connected to GitHub and deployed
