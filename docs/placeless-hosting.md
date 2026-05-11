# Placeless — Complete Hosting Breakdown

---

## Philosophy

No backend server. No EC2. No Docker. No monthly bills. The entire stack is free-tier services that talk directly to each other, with GitHub as the source of truth and Vercel auto-deploying every push.

---

## The Full Free Stack

### 1. GitHub — Code Storage

Your source of truth. Everything lives here. Vercel connects directly to your GitHub repo and watches for changes — when you push to `main`, a new deployment triggers automatically.

**What goes in the repo:**
- All React source code
- Supabase schema/migration files (so your DB structure is version controlled)
- A `.env.example` file showing which environment variables are needed (without real values)

**What never goes in the repo:**
- Your actual `.env` file — add it to `.gitignore` immediately
- Your Supabase URL and anon key — these go as environment variables on Vercel instead

**Repo visibility:** Public or private — both work fine with Vercel's free tier. Public is fine since your secrets never touch the repo anyway.

---

### 2. Vercel — Frontend Hosting

Hosts your React app. Connect your GitHub repo once and every push to `main` auto-deploys. You get a free subdomain like `yourapp.vercel.app` out of the box, HTTPS included, zero configuration needed.

**Free tier (Hobby plan) limits:**

| Limit | Amount | Will you hit it? |
|---|---|---|
| Bandwidth | 100GB/month | No |
| Deployments | Unlimited | No |
| Serverless function duration | 10s per request | No (not using functions) |
| Custom domains | Unlimited | No |
| Team members | 1 (solo) | Fine for personal project |

**How to connect:**
1. Push your repo to GitHub
2. Go to vercel.com → "Add New Project"
3. Import your GitHub repo
4. Set your environment variables (Supabase URL + anon key)
5. Deploy — done, it's live

Every subsequent `git push` to `main` redeploys automatically. No manual steps.

**Alternative:** Netlify works almost identically. Either is fine — Vercel is slightly better optimized for React/Vite projects and has a cleaner dashboard.

---

### 3. Supabase — Database + Realtime Engine

Does all the heavy lifting. One free Supabase project gives you everything Placeless needs — no separate backend server required.

**What Supabase provides:**

- **PostgreSQL database** — stores rooms, players, votes, events
- **Realtime** — pushes database row changes to all subscribed clients instantly; this is what keeps every player's screen in sync without polling
- **Row Level Security (RLS)** — database-level access control so players can't read each other's spy status or cheat by querying the DB directly
- **pg_cron** — scheduled jobs for the cleanup system (deleting stale rooms automatically)
- **Edge Functions** — serverless functions that run server-side if you ever need logic that can't safely run in the browser (e.g. role assignment)

**Free tier limits:**

| Limit | Amount | Will you hit it? |
|---|---|---|
| Database storage | 500MB | No (text data only, tiny) |
| Realtime messages | 2M/month | No (small friend group) |
| Concurrent connections | 500 | No |
| Edge Function invocations | 500K/month | No |
| Bandwidth | 5GB/month | No |

**The one catch:** Supabase **pauses free projects after 7 days of inactivity**. The project still exists — you just log into the Supabase dashboard and click "Restore Project." It takes about 30 seconds. If the project sees regular use, this never triggers. If it becomes popular enough to be a concern, their Pro plan is $25/month.

---

## How They All Connect

```
Your Code (GitHub)
       │
       │  you push to main → auto-deploys
       ▼
Vercel (serves your React app to players' browsers)
       │
       │  React app communicates directly with Supabase
       │  using the public anon key + RLS for security
       ▼
Supabase (PostgreSQL + Realtime)
       │
       │  on any DB row change, broadcasts to all
       │  clients subscribed to that room's channel
       ▼
All Players' Browsers (receive updates, re-render instantly)
```

There is no step between Vercel and Supabase — your React app calls Supabase directly from the browser using the `@supabase/supabase-js` client library. RLS policies on the database enforce security so the client can't access data it shouldn't.

---

## Environment Variables

These two values are the only secrets in the entire project. They live as environment variables on Vercel and in a local `.env` file (git-ignored) during development.

| Variable | Where to find it | Example format |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API | `eyJhbGci...` (long JWT) |

The anon key is safe to expose in the browser — it has no special privileges. RLS policies on your tables are what actually control what any client can read or write.

**Setting them on Vercel:**
1. Vercel dashboard → your project → Settings → Environment Variables
2. Add both variables for Production, Preview, and Development environments
3. Redeploy — they take effect immediately

---

## Local Development Setup

When developing locally, your React app still points to your real Supabase project (or you can spin up a local Supabase instance using their CLI if you prefer full isolation).

```
project/
├── .env                  ← local secrets, never committed
├── .env.example          ← committed, shows variable names with blank values
├── .gitignore            ← includes .env
└── src/
```

`.env` contents locally:
```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

`.env.example` (committed to GitHub):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Domain Name

Vercel gives you `yourapp.vercel.app` for free — HTTPS included, works immediately, shareable with friends. This is perfectly fine for a personal project.

If you want a custom domain:

**Free option:** Freenom offers `.tk`, `.ml`, `.cf`, `.ga`, and `.gq` domains for free. Honest caveat — these TLDs have a sketchy reputation (often associated with spam) and Freenom itself has had reliability issues. Usable, but not recommended for anything you want to look professional.

**Best budget option:** Cloudflare Registrar (`cloudflare.com/products/registrar`) sells domains at wholesale cost with zero markup. A `.com` runs approximately $9–10/year, which is the actual registry price. You also get Cloudflare's DNS and DDoS protection for free on top of it. This is the cleanest cheap option.

**Pointing a custom domain to Vercel:**
1. Buy domain → set Cloudflare (or your registrar) nameservers to point to Vercel
2. Vercel dashboard → your project → Settings → Domains → Add Domain
3. Vercel walks you through the DNS records — takes about 5 minutes, propagates within an hour

---

## Deployment Workflow (Day to Day)

```
Write code locally
       │
       ▼
git add . && git commit -m "your message"
       │
       ▼
git push origin main
       │
       ▼  (automatic — you do nothing)
Vercel detects the push
       │
       ▼
Vercel builds your React app (usually 30–60 seconds)
       │
       ▼
New version is live at placeless.vercel.app
```

Vercel also creates **preview deployments** for every branch and pull request automatically — useful if you want to test a feature before merging to main.

---

## Summary Table

| Layer | Service | Plan | Cost | Free Limit You'd Hit |
|---|---|---|---|---|
| Code hosting | GitHub | Free | $0 | Never |
| Frontend hosting | Vercel | Hobby (free) | $0 | 100GB bandwidth/mo — never |
| Database | Supabase | Free | $0 | 500MB storage — never |
| Realtime | Supabase Realtime | Free (included) | $0 | 2M messages/mo — never |
| Scheduled cleanup | Supabase pg_cron | Free (included) | $0 | Never |
| Edge Functions | Supabase | Free | $0 | 500K calls/mo — never |
| Domain | Vercel subdomain | Free forever | $0 | N/A |
| Custom domain (optional) | Cloudflare Registrar | Paid | ~$10/yr | N/A |

**Total monthly cost: $0**
**Total annual cost: $0 (or ~$10 if you want a custom domain)**

---

## If the Game Grows

If you ever outgrow the free tier (unlikely for a friend group game, but worth knowing):

| Bottleneck | Upgrade path | Cost |
|---|---|---|
| Supabase pausing | Supabase Pro | $25/month |
| Vercel team features | Vercel Pro | $20/month |
| More DB storage | Supabase Pro | $25/month |
| High traffic | Both Pro tiers | ~$45/month |

For a personal project like Placeless played with friends, none of these will ever be necessary.
