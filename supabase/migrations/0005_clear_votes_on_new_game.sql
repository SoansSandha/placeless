-- Placeless — fix: a previous game's votes collided with the new game's rounds.
--
-- The bug
-- -------
-- Nothing ever deleted rows from public.votes, while BOTH start_game and
-- play_again reset rooms.current_round back to 1. So once a host started a
-- second game in the same room, the first game's vote rows were still there and
-- still tagged round = 1 — exactly the round the new game was on:
--
--   * The client filters votes by `round = current_round`, so it found an
--     existing vote for every player, locked the whole roster, and nobody could
--     pick anyone. The host had to "Skip & reveal now" to move the game on.
--   * resolve_votes then tallied the OLD game's votes against the NEW game's
--     spy — the round went to the wrong side, and the freshly-zeroed scores got
--     seeded with points nobody earned in this game.
--   * cast_vote's "has everyone voted?" check (v_votes >= v_total) was already
--     satisfied before a single vote was cast, so the first click from a player
--     who had no stale row resolved the round instantly.
--
-- It was never only round 1, either: game 2's rounds 1..N each collided with
-- game 1's, so voting stayed broken for the rest of that room's life.
--
-- The fix
-- -------
-- Votes are only ever read for the round being resolved right now, so the
-- invariant is simply: when a game resets to round 1, its votes go with it.
-- Applied below in both places that reset current_round.

-- One-time cleanup of rooms that are already carrying stale rows. Keeps only the
-- votes of a room that is mid-vote *this* round (cast since voting_started_at);
-- everything else is history no code path reads. This also unblocks any room
-- that is stuck on the voting screen at this moment.
delete from public.votes v
using public.rooms r
where r.room_code = v.room_code
  and (
       r.status <> 'voting'                    -- not voting: no live round to protect
    or v.round  <> r.current_round             -- a different round entirely
    or v.created_at < r.voting_started_at      -- left over from a previous game
  );

-- host: start a NEW game — assign roles + location and begin round 1 right away -
create or replace function public.start_game(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code  text := upper(trim(p_room_code));
  v_count int;
  v_spy   uuid;
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can start the game';
  end if;
  if not exists (select 1 from public.rooms where room_code = v_code and status = 'lobby') then
    raise exception 'The game has already started';
  end if;
  select count(*) into v_count from public.players where room_code = v_code;
  if v_count < 3 then raise exception 'You need at least 3 players to start'; end if;

  -- new game: clear roles + scores, back to round 1
  update public.players set is_spy = false, is_ready = false, score = 0, wants_vote = false where room_code = v_code;
  select id into v_spy from public.players where room_code = v_code order by random() limit 1;
  update public.players set is_spy = true where id = v_spy;

  -- A new game restarts at round 1, so any votes still on file would be read as
  -- votes already cast in the coming round — clear them with the rest of the reset.
  delete from public.votes where room_code = v_code;

  -- the round begins immediately (no ready-up step): the clock runs from now
  update public.rooms
     set location = public._random_location(), status = 'playing', current_round = 1,
         started_at = now(), voting_started_at = null, winner = null, last_activity_at = now()
   where room_code = v_code;

  insert into public.events (room_code, type, payload)
  values (v_code, 'game_start', jsonb_build_object('players', v_count, 'round', 1));
end;
$$;

-- host: reset the whole game back to the lobby (new game, scores cleared) -------
create or replace function public.play_again(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can start another game';
  end if;
  update public.rooms
     set status = 'lobby', location = null, winner = null, started_at = null,
         voting_started_at = null, current_round = 1, last_activity_at = now()
   where room_code = v_code and status = 'ended';

  -- Only clear votes if the reset above actually happened. play_again is a no-op
  -- on a room that isn't 'ended' (a double-tap, a stale button), and an
  -- unguarded delete there would wipe a live round's votes.
  if found then
    delete from public.votes where room_code = v_code;
  end if;

  update public.players set is_spy = false, is_ready = false, score = 0, wants_vote = false where room_code = v_code;
end;
$$;

-- create or replace preserves existing grants; re-stated so this file is also
-- correct when the migrations are run in order against a fresh project.
grant execute on function public.start_game(uuid, text) to anon, authenticated;
grant execute on function public.play_again(uuid, text) to anon, authenticated;
