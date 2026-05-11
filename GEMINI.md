# Placeless — Agent Briefing

Placeless is a free browser-based multiplayer social deduction game inspired by the card game Spyfall (designed by Alexandr Ushan, published by Hobby World). One player is secretly the Spy; everyone else knows the shared secret location. The Spy tries to deduce the location from conversation; everyone else tries to expose the Spy.

---

## Read These First

Before doing any work, read all three documents in full:

- **Requirements:** `docs/placeless-requirements.md` — game rules, user flows, database schema, RLS, cleanup system, all page and component specs
- **Design system:** `DESIGN.md` — colors, typography, spacing, components, responsive rules
- **Hosting:** `docs/placeless-hosting.md` — stack overview, environment variables, deployment workflow

---

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS (Vite plugin)
- Supabase (`@supabase/supabase-js` v2) — database, realtime, RLS
- Vercel — hosting (deploy from GitHub)

---

## Hard Rules

These apply at all times. Do not violate them for any reason.

- **Never commit `.env`** — it is git-ignored, never touch it
- **Never use the Supabase `service_role` key** — the client uses the anon/Publishable key only
- **Never query `is_spy` for other players** — always use the `players_public` view when listing players; only query `players` directly for the current user's own row
- **Never call `supabase` directly from a component** — all Supabase calls live in custom hooks inside `src/hooks/`
- **Never create new top-level folders** without being explicitly asked
- **Never refactor working code** unless explicitly instructed
- **Never use inline styles** — Tailwind utility classes only
- **Never use rounded-rectangle buttons** — always pill shape (`border-radius: 9999px`)
- **Never bump display font weight above 300** — it breaks the brand
- **Never remove the gradient mesh from the homepage hero** — a bare canvas hero breaks the brand

---

## Coding Practices

Write clean, production-quality code at all times. These apply to every file you touch.

### General
- Write code that is readable first, clever second — prefer clarity over brevity
- Keep components small and focused — one responsibility per component
- Functional components only, no class components
- Named exports for components, default exports for pages
- Always handle loading and error states — never assume a Supabase call succeeds
- Clean up Supabase Realtime subscriptions on component unmount to prevent memory leaks

### Naming
- Components: `PascalCase` (e.g. `PlayerCard`, `TimerDisplay`)
- Hooks: `camelCase` prefixed with `use` (e.g. `useRoom`, `usePlayers`)
- Files: match the component or hook name exactly
- Variables and functions: `camelCase`, descriptive — no single-letter variables outside of loop counters

### React
- Use `const` for all component and function declarations
- Derive values from state where possible — avoid storing derived data in separate state variables
- Keep `useEffect` dependencies accurate and complete — no suppressed lint warnings
- Extract repeated JSX patterns into their own components rather than duplicating

### Error Handling
- Every Supabase call must have error handling — log the error and surface a user-friendly message where appropriate
- Never let the UI silently fail — the player should always know if something went wrong
- Validate all user inputs client-side before sending to Supabase

### Comments
- Comment the *why*, not the *what* — the code itself should explain what it does
- Add a short comment above any Supabase query that has non-obvious logic (e.g. RLS-related decisions)
- No commented-out dead code — delete it

---

## Current Status

Update this section at the end of every session. This is currently not a compete list of what needs to be/what is done, you and i will continue updating this based on what we have compleated and what is pending after each session.

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
- [ ] Tailwind CSS configured in `vite.config.js` and `index.css`
- [ ] Inter font loaded in `index.html`
- [ ] React Router configured in `App.jsx`
- [ ] `src/data/locations.js` populated
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
