-- Placeless — realtime publication + cleanup cron.

-- Realtime: the client subscribes to row changes on these tables as a *signal* to
-- refetch through the safe views/RPCs. Adding a table twice errors, so guard it.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then alter publication supabase_realtime add table public.rooms; end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'players'
  ) then alter publication supabase_realtime add table public.players; end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
  ) then alter publication supabase_realtime add table public.votes; end if;
end $$;

-- Cleanup: delete stale rooms hourly. Child rows cascade via the FKs.
-- Requires pg_cron (Database > Extensions). Re-running updates the schedule.
select cron.schedule(
  'cleanup-stale-rooms',
  '0 * * * *',
  $$
    delete from public.rooms where
        (status = 'ended'                  and last_activity_at < now() - interval '2 hours')
     or (status = 'lobby'                  and last_activity_at < now() - interval '1 hour')
     or (status in ('playing', 'voting')   and last_activity_at < now() - interval '4 hours');
  $$
);
