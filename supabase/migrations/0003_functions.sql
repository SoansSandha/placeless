-- Placeless — game logic as SECURITY DEFINER functions.
-- Every mutation lives here. Each authorizes on the caller's bearer UUID
-- (p_player_uuid) and bypasses RLS by design. All pin search_path to public.

-- internal: bump a room's activity clock (keeps cleanup cron from reaping it) ---
create or replace function public._touch(p_room_code text)
returns void language sql security definer set search_path = public as $$
  update public.rooms set last_activity_at = now() where room_code = p_room_code;
$$;

-- internal: pick a random location for a round ---------------------------------
create or replace function public._random_location()
returns text language sql security definer set search_path = public as $$
  select arr[1 + floor(random() * array_length(arr, 1))::int]
  from (select array[
    'Space Station','Pirate Ship','Hospital','Casino','Beach','Police Station','School',
    'Supermarket','Movie Studio','Military Base','Passenger Train','Cruise Ship','Restaurant',
    'Bank','Hotel','Airport','Museum','Theater','Circus','Embassy','Submarine','Cathedral','Spa',
    'Polar Station','Ocean Liner','Service Station','University','Corporate Party','Jail',
    'Medieval Tournament','Coal Mine','Vineyard','Sports Stadium'] as arr) s;
$$;

-- create a room and seat the caller as host; returns the new room code ----------
create or replace function public.create_room(p_player_uuid uuid, p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code  text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_name  text := trim(p_username);
  v_try   int  := 0;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 20 then
    raise exception 'Name must be 2 to 20 characters';
  end if;

  loop
    v_try := v_try + 1;
    v_code := '';
    for i in 1..4 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * char_length(v_chars))::int, 1);
    end loop;
    begin
      insert into public.rooms (room_code, status) values (v_code, 'lobby');
      exit; -- inserted successfully
    exception when unique_violation then
      if v_try >= 25 then raise exception 'Could not generate a unique room code'; end if;
      -- otherwise loop and try another code
    end;
  end loop;

  insert into public.players (player_uuid, room_code, username, is_host)
  values (p_player_uuid, v_code, v_name, true);

  insert into public.events (room_code, type) values (v_code, 'player_join');
  return v_code;
end;
$$;

-- join an existing lobby; returns the room code --------------------------------
create or replace function public.join_room(p_player_uuid uuid, p_room_code text, p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code   text := upper(trim(p_room_code));
  v_name   text := trim(p_username);
  v_status text;
  v_count  int;
begin
  -- lock the room row so concurrent joins can't both pass the capacity check
  select status into v_status from public.rooms where room_code = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;

  -- Already seated with this UUID (a second tab, a refresh, re-opening the link)?
  -- Never create a second identity and never block them: load them back as-is.
  if exists (select 1 from public.players
             where room_code = v_code and player_uuid = p_player_uuid) then
    return v_code;
  end if;

  -- From here on this is a genuinely new player joining a lobby.
  if char_length(v_name) < 2 or char_length(v_name) > 20 then
    raise exception 'Name must be 2 to 20 characters';
  end if;
  if v_status <> 'lobby' then raise exception 'Game already in progress'; end if;

  select count(*) into v_count from public.players where room_code = v_code;
  if v_count >= 10 then raise exception 'This room is full'; end if;

  begin
    insert into public.players (player_uuid, room_code, username, is_host)
    values (p_player_uuid, v_code, v_name, false);
    insert into public.events (room_code, type) values (v_code, 'player_join');
  exception when unique_violation then
    -- the only unique constraint reachable now is (room_code, lower(username))
    raise exception 'That name is taken in this room';
  end;

  perform public._touch(v_code);
  return v_code;
end;
$$;

-- the caller's OWN row, including their private role + the location if eligible -
create or replace function public.get_my_player(p_player_uuid uuid, p_room_code text)
returns table (id uuid, username text, is_host boolean, is_ready boolean,
               is_spy boolean, location text)
language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  return query
    select p.id, p.username, p.is_host, p.is_ready, p.is_spy,
           case
             when p.is_spy then null                                   -- the spy never learns it
             when r.status in ('playing', 'voting', 'ended') then r.location
             else null
           end as location
    from public.players p
    join public.rooms r on r.room_code = p.room_code
    where p.room_code = v_code and p.player_uuid = p_player_uuid;
end;
$$;

-- current database time, so the client can correct for any local clock skew and
-- count down in sync with the server (whose expiry gates use the same now()) ----
create or replace function public.server_time()
returns timestamptz language sql stable set search_path = public as $$
  select now();
$$;

-- host: set the round length (lobby only) --------------------------------------
create or replace function public.set_timer(p_player_uuid uuid, p_room_code text, p_minutes int)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if p_minutes < 3 or p_minutes > 15 then raise exception 'Timer must be 3 to 15 minutes'; end if;
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can change the timer';
  end if;
  update public.rooms
     set timer_duration = p_minutes, last_activity_at = now()
   where room_code = v_code and status = 'lobby';
end;
$$;

-- host: set how many rounds the game lasts (lobby only) ------------------------
create or replace function public.set_rounds(p_player_uuid uuid, p_room_code text, p_count int)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if p_count < 1 or p_count > 10 then raise exception 'A game must be 1 to 10 rounds'; end if;
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can change the round count';
  end if;
  update public.rooms
     set round_count = p_count, last_activity_at = now()
   where room_code = v_code and status = 'lobby';
end;
$$;

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

  -- the round begins immediately (no ready-up step): the clock runs from now
  update public.rooms
     set location = public._random_location(), status = 'playing', current_round = 1,
         started_at = now(), voting_started_at = null, winner = null, last_activity_at = now()
   where room_code = v_code;

  insert into public.events (room_code, type, payload)
  values (v_code, 'game_start', jsonb_build_object('players', v_count, 'round', 1));
end;
$$;

-- host: advance to the next round (keeps scores). Valid only between rounds. ----
create or replace function public.next_round(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code)); v_spy uuid;
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can start the next round';
  end if;
  if not exists (select 1 from public.rooms
                 where room_code = v_code and status = 'ended' and current_round < round_count) then
    raise exception 'There is no next round to start';
  end if;

  update public.players set is_spy = false, is_ready = false, wants_vote = false where room_code = v_code;
  select id into v_spy from public.players where room_code = v_code order by random() limit 1;
  update public.players set is_spy = true where id = v_spy;

  update public.rooms
     set location = public._random_location(), status = 'playing',
         current_round = current_round + 1, started_at = now(),
         voting_started_at = null, winner = null, last_activity_at = now()
   where room_code = v_code;

  insert into public.events (room_code, type) values (v_code, 'game_start');
end;
$$;

-- any player can toggle their vote request on/off; the vote starts once at least
-- HALF the room has it on. (Replaces the old host-only `accuse`.)
drop function if exists public.accuse(uuid, text);

create or replace function public.call_vote(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code   text := upper(trim(p_room_code));
  v_status text;
  v_voter  uuid;
  v_now    boolean;
  v_total  int;
  v_called int;
begin
  -- lock the room so two concurrent calls can't both flip to voting on a stale count
  select status into v_status from public.rooms where room_code = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;
  if v_status <> 'playing' then return; end if; -- only meaningful mid-round

  select id into v_voter from public.players
   where room_code = v_code and player_uuid = p_player_uuid;
  if v_voter is null then raise exception 'You are not in this room'; end if;

  -- toggle this player's vote request on or off
  update public.players set wants_vote = not wants_vote where id = v_voter
   returning wants_vote into v_now;
  insert into public.events (room_code, type)
  values (v_code, case when v_now then 'vote_called' else 'vote_uncalled' end);
  perform public._touch(v_code);

  -- only a freshly-ON request can cross the threshold; turning OFF never triggers
  if v_now then
    select count(*) into v_total  from public.players where room_code = v_code;
    select count(*) into v_called from public.players where room_code = v_code and wants_vote;
    -- at least half the room wants a vote -> start it (integer-safe: called*2 >= total)
    if v_called * 2 >= v_total then
      update public.rooms set status = 'voting', voting_started_at = now(), last_activity_at = now()
       where room_code = v_code and status = 'playing';
      insert into public.events (room_code, type) values (v_code, 'accusation');
    end if;
  end if;
end;
$$;

-- resolve the current voting round + award points. Called when everyone has
-- voted (cast_vote), when the vote timer expires, or when the host skips an AFK
-- player. Idempotent: it locks the room row and only acts while status='voting'.
create or replace function public.resolve_votes(p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code        text := upper(trim(p_room_code));
  v_round       int;
  v_top         uuid;
  v_top_count   int;
  v_top_ties    int := 0;
  v_spy         uuid;
  v_players_win boolean;
begin
  select current_round into v_round from public.rooms
   where room_code = v_code and status = 'voting' for update;
  if v_round is null then return; end if; -- not in a vote / already resolved

  select id into v_spy from public.players where room_code = v_code and is_spy limit 1;

  select accused_id, cnt into v_top, v_top_count
    from (select accused_id, count(*) cnt from public.votes
          where room_code = v_code and round = v_round group by accused_id) t
   order by cnt desc limit 1;

  if v_top is not null then
    select count(*) into v_top_ties
      from (select accused_id, count(*) cnt from public.votes
            where room_code = v_code and round = v_round group by accused_id) t
     where t.cnt = v_top_count; -- how many accused share the top count (>1 => tie)
  end if;

  -- non-spies win only on a clear (untied) plurality landing on the spy
  v_players_win := (v_top is not null and v_top_ties = 1 and v_top = v_spy);

  if v_players_win then
    -- each non-spy who voted for the spy scores a point
    update public.players set score = score + 1
     where room_code = v_code and id in (
       select voter_id from public.votes
        where room_code = v_code and round = v_round and accused_id = v_spy);
    update public.rooms set status = 'ended', winner = 'players', last_activity_at = now()
     where room_code = v_code and status = 'voting';
  else
    -- the spy evaded (no votes, a tie, or the wrong target) — the spy scores
    update public.players set score = score + 1 where id = v_spy;
    update public.rooms set status = 'ended', winner = 'spy', last_activity_at = now()
     where room_code = v_code and status = 'voting';
  end if;

  insert into public.events (room_code, type) values (v_code, 'game_end');
end;
$$;

-- vote timer ran out — any client may call this on its local 5-minute countdown,
-- but it only resolves once the window has genuinely elapsed (server clock), so it
-- can't be abused to end a vote early.
create or replace function public.expire_vote(p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if exists (select 1 from public.rooms
             where room_code = v_code and status = 'voting'
               and voting_started_at is not null
               and now() >= voting_started_at + interval '5 minutes' - interval '2 seconds') then
    perform public.resolve_votes(v_code);
  end if;
end;
$$;

-- host force-resolves the vote with whatever is in (e.g. a player is AFK)
create or replace function public.skip_vote(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can skip the vote';
  end if;
  perform public.resolve_votes(v_code);
end;
$$;

-- cast one vote; auto-resolves the round once everyone has voted ---------------
create or replace function public.cast_vote(p_player_uuid uuid, p_room_code text, p_accused_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code  text := upper(trim(p_room_code));
  v_round int;
  v_voter uuid;
  v_total int;
  v_votes int;
begin
  -- lock the room row so concurrent final votes can't both resolve the round
  select current_round into v_round from public.rooms
   where room_code = v_code and status = 'voting' for update;
  if v_round is null then raise exception 'Voting is not active'; end if;

  select id into v_voter from public.players
   where room_code = v_code and player_uuid = p_player_uuid;
  if v_voter is null then raise exception 'You are not in this room'; end if;
  if v_voter = p_accused_id then raise exception 'You cannot vote for yourself'; end if;
  if not exists (select 1 from public.players where id = p_accused_id and room_code = v_code) then
    raise exception 'That player is not in this room';
  end if;

  insert into public.votes (room_code, round, voter_id, accused_id)
  values (v_code, v_round, v_voter, p_accused_id)
  on conflict (room_code, round, voter_id) do nothing; -- one vote per round

  insert into public.events (room_code, type) values (v_code, 'vote_cast');
  perform public._touch(v_code);

  select count(*) into v_total from public.players where room_code = v_code;
  select count(*) into v_votes from public.votes  where room_code = v_code and round = v_round;
  if v_votes >= v_total then
    perform public.resolve_votes(v_code); -- everyone has voted: tally and end the round
  end if;
end;
$$;

-- the spy guesses the location; correct => spy scores + wins, wrong => no points -
create or replace function public.spy_guess(p_player_uuid uuid, p_room_code text, p_location text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code)); v_actual text; v_is_spy boolean; v_correct boolean;
begin
  select r.location, p.is_spy into v_actual, v_is_spy
    from public.players p join public.rooms r on r.room_code = p.room_code
   where p.room_code = v_code and p.player_uuid = p_player_uuid;
  if not coalesce(v_is_spy, false) then raise exception 'Only the spy can guess the location'; end if;

  v_correct := lower(trim(p_location)) = lower(trim(v_actual));
  -- status guard: never overwrite a round that already ended (vote / timer)
  update public.rooms
     set status = 'ended', winner = case when v_correct then 'spy' else 'players' end,
         last_activity_at = now()
   where room_code = v_code and status in ('playing', 'voting');
  if found then -- only score / log if this call actually ended the round
    if v_correct then
      update public.players set score = score + 1 where room_code = v_code and is_spy;
    end if;
    insert into public.events (room_code, type, payload)
    values (v_code, 'spy_guess', jsonb_build_object('correct', v_correct));
  end if;
end;
$$;

-- the round clock ran out — any client may call this; only fires if truly
-- expired (server-time-gated). Instead of auto-ending, it kicks off the vote so
-- players still get their chance to catch the spy. If they then fail to (no/tie
-- votes), resolve_votes awards the spy the round, as before.
create or replace function public.expire_timer(p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  -- 2s grace absorbs client/server clock jitter so a client that hits 00:00 a
  -- hair early still triggers the transition on its first call (not after a retry)
  update public.rooms
     set status = 'voting', voting_started_at = now(), last_activity_at = now()
   where room_code = v_code and status = 'playing' and started_at is not null
     and now() >= started_at + make_interval(mins => timer_duration) - interval '2 seconds';
  if found then
    insert into public.events (room_code, type) values (v_code, 'timer_end');
  end if;
end;
$$;

-- promote the eldest remaining player to host, only if the room has no host -----
create or replace function public.promote_host(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players where room_code = v_code and player_uuid = p_player_uuid) then
    raise exception 'You are not in this room';
  end if;
  update public.players set is_host = true
   where id = (select id from public.players where room_code = v_code order by joined_at asc limit 1)
     and not exists (select 1 from public.players where room_code = v_code and is_host = true);
end;
$$;

-- host hands the crown to another player, at any phase of the game. The whole
-- function is one transaction: if the target is invalid we RAISE, which rolls
-- back the demote too, so the room never ends up with no host.
create or replace function public.transfer_host(p_player_uuid uuid, p_room_code text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code    text := upper(trim(p_room_code));
  v_demoted int;
begin
  -- demote the caller ONLY if they really are the current host (single-statement
  -- guard — no read-then-write race)
  update public.players set is_host = false
   where room_code = v_code and player_uuid = p_player_uuid and is_host = true;
  get diagnostics v_demoted = row_count;
  if v_demoted = 0 then raise exception 'Only the host can pass host to someone else'; end if;

  -- the target must be a real member of this room. Raising here rolls back the
  -- demote above (single transaction), so the room is never left hostless.
  if not exists (select 1 from public.players where room_code = v_code and id = p_target_id) then
    raise exception 'That player is not in this room';
  end if;

  -- promote with the documented WHERE is_host = false host-promotion guard
  update public.players set is_host = true
   where room_code = v_code and id = p_target_id and is_host = false;

  perform public._touch(v_code);
  insert into public.events (room_code, type) values (v_code, 'host_transfer');
end;
$$;

-- results for the round-end / game-over screen (spy + location + winner) -------
create or replace function public.get_results(p_room_code text)
returns table (spy_id uuid, spy_username text, location text, winner text)
language sql security definer set search_path = public as $$
  select p.id, p.username, r.location, r.winner
  from public.rooms r
  left join public.players p on p.room_code = r.room_code and p.is_spy
  where r.room_code = upper(trim(p_room_code)) and r.status = 'ended';
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
  update public.players set is_spy = false, is_ready = false, score = 0, wants_vote = false where room_code = v_code;
end;
$$;

-- leave the room; deletes the empty room (cascades children). If the player who
-- left was the host and others remain, hand host to the eldest of them so the
-- game can keep going (start / next-round / skip all need a host).
create or replace function public.leave_room(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code     text := upper(trim(p_room_code));
  v_was_host boolean;
begin
  select is_host into v_was_host from public.players
   where room_code = v_code and player_uuid = p_player_uuid;

  delete from public.players where room_code = v_code and player_uuid = p_player_uuid;
  insert into public.events (room_code, type) values (v_code, 'player_leave');

  if not exists (select 1 from public.players where room_code = v_code) then
    delete from public.rooms where room_code = v_code;
  else
    if coalesce(v_was_host, false)
       and not exists (select 1 from public.players where room_code = v_code and is_host) then
      update public.players set is_host = true
       where id = (select id from public.players
                   where room_code = v_code order by joined_at asc limit 1);
    end if;
    perform public._touch(v_code);
  end if;
end;
$$;

-- expose the player-facing RPCs to the browser client --------------------------
grant execute on function public.create_room(uuid, text)              to anon, authenticated;
grant execute on function public.join_room(uuid, text, text)          to anon, authenticated;
grant execute on function public.get_my_player(uuid, text)            to anon, authenticated;
grant execute on function public.server_time()                        to anon, authenticated;
grant execute on function public.set_timer(uuid, text, int)           to anon, authenticated;
grant execute on function public.set_rounds(uuid, text, int)          to anon, authenticated;
grant execute on function public.start_game(uuid, text)               to anon, authenticated;
grant execute on function public.next_round(uuid, text)               to anon, authenticated;
grant execute on function public.call_vote(uuid, text)                to anon, authenticated;
grant execute on function public.expire_vote(text)                    to anon, authenticated;
grant execute on function public.skip_vote(uuid, text)                to anon, authenticated;
grant execute on function public.cast_vote(uuid, text, uuid)          to anon, authenticated;
grant execute on function public.spy_guess(uuid, text, text)          to anon, authenticated;
grant execute on function public.expire_timer(text)                   to anon, authenticated;
grant execute on function public.promote_host(uuid, text)             to anon, authenticated;
grant execute on function public.transfer_host(uuid, text, uuid)      to anon, authenticated;
grant execute on function public.get_results(text)                    to anon, authenticated;
grant execute on function public.play_again(uuid, text)               to anon, authenticated;
grant execute on function public.leave_room(uuid, text)               to anon, authenticated;

-- Internal-only helpers. PostgreSQL grants EXECUTE to PUBLIC by default when a
-- function is created, which PostgREST would expose to anon — so simply not
-- listing them above is NOT enough. Revoke that default grant; they remain
-- callable from inside the SECURITY DEFINER functions (which run as the owner).
revoke all on function public._touch(text)          from public, anon, authenticated;
revoke all on function public._random_location()    from public, anon, authenticated;
revoke all on function public.resolve_votes(text)   from public, anon, authenticated;
