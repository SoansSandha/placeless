-- Placeless — Row Level Security + column-level secrecy.
--
-- There is no Supabase auth: a player's identity is the unguessable UUID stored in
-- their browser (a bearer secret). So we cannot use auth.uid() in policies. Instead:
--   * Reads are row-permissive, but the SECRET columns (is_spy, player_uuid, location)
--     are withheld via column GRANTs so they never reach the anon client or realtime.
--   * All writes go through SECURITY DEFINER functions (0003) that authorize on the
--     caller's bearer UUID. Anon has NO direct insert/update/delete.

alter table public.rooms   enable row level security;
alter table public.players enable row level security;
alter table public.votes   enable row level security;
alter table public.events  enable row level security;

-- Row-level read policies (column secrecy handled by GRANTs below) -------------
drop policy if exists rooms_select   on public.rooms;
drop policy if exists players_select on public.players;
drop policy if exists votes_select   on public.votes;
drop policy if exists events_select  on public.events;

create policy rooms_select   on public.rooms   for select using (true);
create policy players_select on public.players for select using (true);
create policy votes_select   on public.votes   for select using (true);
create policy events_select  on public.events  for select using (true);
-- (intentionally no insert/update/delete policies — writes only via RPCs)

-- Column-level secrecy --------------------------------------------------------
-- players: hide is_spy and player_uuid from the client and from realtime payloads.
revoke select on public.players from anon, authenticated;
grant  select (id, room_code, username, is_host, is_ready, joined_at)
       on public.players to anon, authenticated;

-- rooms: hide the secret location. Everything else is safe to read.
revoke select on public.rooms from anon, authenticated;
grant  select (id, room_code, status, timer_duration, current_round, winner,
               started_at, created_at, last_activity_at)
       on public.rooms to anon, authenticated;

-- votes & events carry no secrets
grant select on public.votes  to anon, authenticated;
grant select on public.events to anon, authenticated;

-- Convenience views for the client roster (no secret columns) -----------------
create or replace view public.players_public as
  select id, room_code, username, is_host, is_ready, joined_at
  from public.players;

create or replace view public.rooms_public as
  select id, room_code, status, timer_duration, current_round, winner,
         started_at, created_at, last_activity_at
  from public.rooms;

-- run the views with the caller's privileges so RLS + column grants apply
alter view public.players_public set (security_invoker = true);
alter view public.rooms_public   set (security_invoker = true);

grant select on public.players_public to anon, authenticated;
grant select on public.rooms_public   to anon, authenticated;
