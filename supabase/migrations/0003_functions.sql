-- Placeless — game logic as SECURITY DEFINER functions.
-- Every mutation lives here. Each authorizes on the caller's bearer UUID
-- (p_player_uuid) and bypasses RLS by design. All pin search_path to public.

-- internal: bump a room's activity clock (keeps cleanup cron from reaping it) ---
create or replace function public._touch(p_room_code text)
returns void language sql security definer set search_path = public as $$
  update public.rooms set last_activity_at = now() where room_code = p_room_code;
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
  if char_length(v_name) < 2 or char_length(v_name) > 20 then
    raise exception 'Name must be 2 to 20 characters';
  end if;

  -- lock the room row so concurrent joins can't both pass the capacity check
  select status into v_status from public.rooms where room_code = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;
  if v_status <> 'lobby' then raise exception 'Game already in progress'; end if;

  select count(*) into v_count from public.players where room_code = v_code;
  if v_count >= 10 then raise exception 'This room is full'; end if;

  -- explicit, unambiguous duplicate-name check (room row is locked above, so race-safe)
  if exists (select 1 from public.players
             where room_code = v_code and lower(username) = lower(v_name)
               and player_uuid <> p_player_uuid) then
    raise exception 'That name is taken in this room';
  end if;

  begin
    insert into public.players (player_uuid, room_code, username, is_host)
    values (p_player_uuid, v_code, v_name, false);
    insert into public.events (room_code, type) values (v_code, 'player_join');
  exception when unique_violation then
    -- only reachable now if this UUID is already seated: treat as an idempotent rejoin.
    null;
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

-- host: assign roles + a location and move into the round (role-reveal) --------
create or replace function public.start_game(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code  text := upper(trim(p_room_code));
  v_count int;
  v_spy   uuid;
  v_locs  text[] := array[
    'Space Station','Pirate Ship','Hospital','Casino','Beach','Police Station','School',
    'Supermarket','Movie Studio','Military Base','Passenger Train','Cruise Ship','Restaurant',
    'Bank','Hotel','Airport','Museum','Theater','Circus','Embassy','Submarine','Cathedral','Spa',
    'Polar Station','Ocean Liner','Service Station','University','Corporate Party','Jail',
    'Medieval Tournament','Coal Mine','Vineyard','Sports Stadium'];
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

  update public.players set is_spy = false, is_ready = false where room_code = v_code;

  select id into v_spy from public.players where room_code = v_code order by random() limit 1;
  update public.players set is_spy = true where id = v_spy;

  -- status -> playing, but started_at stays null until everyone has seen their role
  update public.rooms
     set location = v_locs[1 + floor(random() * array_length(v_locs, 1))::int],
         status = 'playing', started_at = null, winner = null, last_activity_at = now()
   where room_code = v_code;

  insert into public.events (room_code, type, payload)
  values (v_code, 'game_start', jsonb_build_object('players', v_count));
end;
$$;

-- a player acknowledges their role; when all are ready the clock starts ---------
create or replace function public.set_ready(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code)); v_total int; v_ready int;
begin
  if not exists (select 1 from public.rooms where room_code = v_code and status = 'playing') then
    raise exception 'You can only ready up once the round has started';
  end if;
  update public.players set is_ready = true
   where room_code = v_code and player_uuid = p_player_uuid;

  select count(*), count(*) filter (where is_ready) into v_total, v_ready
    from public.players where room_code = v_code;

  if v_total > 0 and v_ready = v_total then
    update public.rooms set started_at = now(), last_activity_at = now()
     where room_code = v_code and status = 'playing' and started_at is null;
  end if;
end;
$$;

-- host: skip the wait and start the clock now (the "short countdown" fallback) --
create or replace function public.begin_round(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can begin the round';
  end if;
  update public.rooms set started_at = now(), last_activity_at = now()
   where room_code = v_code and status = 'playing' and started_at is null;
end;
$$;

-- any player triggers the vote ------------------------------------------------
create or replace function public.accuse(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid) then
    raise exception 'You are not in this room';
  end if;
  update public.rooms set status = 'voting', last_activity_at = now()
   where room_code = v_code and status = 'playing';
  insert into public.events (room_code, type) values (v_code, 'accusation');
end;
$$;

-- cast one vote; auto-resolves the round once everyone has voted ---------------
create or replace function public.cast_vote(p_player_uuid uuid, p_room_code text, p_accused_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code      text := upper(trim(p_room_code));
  v_round     int;
  v_voter     uuid;
  v_total     int;
  v_votes     int;
  v_top       uuid;
  v_top_count int;
  v_top_ties  int;
  v_spy       uuid;
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
  if v_votes < v_total then return; end if; -- wait for everyone

  -- tally: who got the most votes, and is that a tie?
  select accused_id, cnt into v_top, v_top_count
    from (select accused_id, count(*) cnt from public.votes
          where room_code = v_code and round = v_round group by accused_id) t
   order by cnt desc limit 1;
  select count(*) into v_top_ties
    from (select accused_id, count(*) cnt from public.votes
          where room_code = v_code and round = v_round group by accused_id) t
   where t.cnt = v_top_count;

  select id into v_spy from public.players where room_code = v_code and is_spy limit 1;

  -- non-spies win only on a clear (untied) plurality landing on the spy
  if v_top_ties = 1 and v_top = v_spy then
    update public.rooms set status = 'ended', winner = 'players', last_activity_at = now()
     where room_code = v_code and status = 'voting';
  else
    update public.rooms set status = 'ended', winner = 'spy', last_activity_at = now()
     where room_code = v_code and status = 'voting';
  end if;
  insert into public.events (room_code, type) values (v_code, 'game_end');
end;
$$;

-- the spy guesses the location; correct => spy wins, wrong => non-spies win -----
create or replace function public.spy_guess(p_player_uuid uuid, p_room_code text, p_location text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code)); v_actual text; v_is_spy boolean; v_correct boolean;
begin
  select r.location, p.is_spy into v_actual, v_is_spy
    from public.players p join public.rooms r on r.room_code = p.room_code
   where p.room_code = v_code and p.player_uuid = p_player_uuid;
  if not coalesce(v_is_spy, false) then raise exception 'Only the spy can guess the location'; end if;
  if not exists (select 1 from public.rooms where room_code = v_code and status in ('playing','voting')) then
    raise exception 'The round is not active';
  end if;

  v_correct := lower(trim(p_location)) = lower(trim(v_actual));
  -- status guard: never overwrite a round that already ended (vote / timer)
  update public.rooms
     set status = 'ended', winner = case when v_correct then 'spy' else 'players' end,
         last_activity_at = now()
   where room_code = v_code and status in ('playing', 'voting');
  insert into public.events (room_code, type, payload)
  values (v_code, 'spy_guess', jsonb_build_object('correct', v_correct));
end;
$$;

-- timer ran out — any client may call this; only fires if truly expired --------
create or replace function public.expire_timer(p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  update public.rooms set status = 'ended', winner = 'spy', last_activity_at = now()
   where room_code = v_code and status = 'playing' and started_at is not null
     and now() >= started_at + make_interval(mins => timer_duration);
  insert into public.events (room_code, type)
  select v_code, 'timer_end'
  where exists (select 1 from public.rooms where room_code = v_code and status = 'ended' and winner = 'spy');
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

-- results for the ended screen (spy + location + winner) -----------------------
create or replace function public.get_results(p_room_code text)
returns table (spy_id uuid, spy_username text, location text, winner text)
language sql security definer set search_path = public as $$
  select p.id, p.username, r.location, r.winner
  from public.rooms r
  left join public.players p on p.room_code = r.room_code and p.is_spy
  where r.room_code = upper(trim(p_room_code)) and r.status = 'ended';
$$;

-- host: reset the room to the lobby for another round (keeps the players) -------
create or replace function public.play_again(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  if not exists (select 1 from public.players
                 where room_code = v_code and player_uuid = p_player_uuid and is_host) then
    raise exception 'Only the host can start another round';
  end if;
  update public.rooms
     set status = 'lobby', location = null, winner = null, started_at = null,
         current_round = current_round + 1, last_activity_at = now()
   where room_code = v_code and status = 'ended';
  update public.players set is_spy = false, is_ready = false where room_code = v_code;
end;
$$;

-- leave the room; deletes the empty room (cascades children) --------------------
create or replace function public.leave_room(p_player_uuid uuid, p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_code text := upper(trim(p_room_code));
begin
  delete from public.players where room_code = v_code and player_uuid = p_player_uuid;
  insert into public.events (room_code, type) values (v_code, 'player_leave');
  if not exists (select 1 from public.players where room_code = v_code) then
    delete from public.rooms where room_code = v_code;
  else
    perform public._touch(v_code);
  end if;
end;
$$;

-- expose the player-facing RPCs to the browser client --------------------------
grant execute on function public.create_room(uuid, text)              to anon, authenticated;
grant execute on function public.join_room(uuid, text, text)          to anon, authenticated;
grant execute on function public.get_my_player(uuid, text)            to anon, authenticated;
grant execute on function public.set_timer(uuid, text, int)           to anon, authenticated;
grant execute on function public.start_game(uuid, text)               to anon, authenticated;
grant execute on function public.set_ready(uuid, text)                to anon, authenticated;
grant execute on function public.begin_round(uuid, text)              to anon, authenticated;
grant execute on function public.accuse(uuid, text)                   to anon, authenticated;
grant execute on function public.cast_vote(uuid, text, uuid)          to anon, authenticated;
grant execute on function public.spy_guess(uuid, text, text)          to anon, authenticated;
grant execute on function public.expire_timer(text)                   to anon, authenticated;
grant execute on function public.promote_host(uuid, text)             to anon, authenticated;
grant execute on function public.get_results(text)                    to anon, authenticated;
grant execute on function public.play_again(uuid, text)               to anon, authenticated;
grant execute on function public.leave_room(uuid, text)               to anon, authenticated;
-- _touch is internal: not granted to clients.
