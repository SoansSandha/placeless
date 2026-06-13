-- Placeless — canonical schema (idempotent).
-- The live Supabase project already has the four base tables; this file documents
-- them and adds the columns the game logic needs. Safe to re-run.

create extension if not exists pgcrypto; -- gen_random_uuid()

-- rooms -----------------------------------------------------------------------
create table if not exists public.rooms (
  id               uuid primary key default gen_random_uuid(),
  room_code        text not null unique,
  status           text not null default 'lobby'
                     check (status in ('lobby', 'playing', 'voting', 'ended')),
  location         text,                       -- null until a round starts; never exposed to anon
  timer_duration   int  not null default 8 check (timer_duration between 3 and 15),
  current_round    int  not null default 1,    -- supports "Play Again" rounds
  winner           text check (winner in ('spy', 'players')),
  started_at       timestamptz,                -- set when the main game clock starts
  created_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

-- columns added for game logic (no-ops if they already exist)
alter table public.rooms add column if not exists current_round int not null default 1;
alter table public.rooms add column if not exists winner text;

-- players ---------------------------------------------------------------------
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  player_uuid uuid not null,                   -- anonymous identity (bearer secret); never exposed
  room_code   text not null references public.rooms(room_code) on delete cascade,
  username    text not null,
  is_host     boolean not null default false,
  is_spy      boolean not null default false,  -- never exposed to anon (column grant below)
  is_ready    boolean not null default false,
  joined_at   timestamptz not null default now(),
  unique (player_uuid, room_code)              -- one row per human per room
);

-- no two players share a display name within the same room (case-insensitive)
create unique index if not exists players_room_username_uidx
  on public.players (room_code, lower(username));

create index if not exists players_room_idx on public.players (room_code);

-- votes -----------------------------------------------------------------------
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  room_code  text not null references public.rooms(room_code) on delete cascade,
  round      int  not null,
  voter_id   uuid not null references public.players(id) on delete cascade,
  accused_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (room_code, round, voter_id)          -- one vote per player per round
);

create index if not exists votes_room_round_idx on public.votes (room_code, round);

-- events (debug / replay) -----------------------------------------------------
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  room_code  text not null references public.rooms(room_code) on delete cascade,
  type       text not null,
  payload    jsonb,
  created_at timestamptz not null default now()
);
