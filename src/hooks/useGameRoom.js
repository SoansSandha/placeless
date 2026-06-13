import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/player';

/**
 * The live game-room data layer. Subscribes to Supabase Realtime as a *signal*
 * to refetch through the safe views/RPCs (it never trusts realtime payloads for
 * secret data). Handles reconnect-on-mount and automatic host promotion, and
 * exposes every game action as a thin wrapper over a SECURITY DEFINER RPC.
 *
 * Derived `phase`: lobby → reveal (role shown, clock not started) → playing →
 * voting → ended. `started_at` is what flips reveal to the main game.
 */
export function useGameRoom(code) {
  const roomCode = (code || '').toUpperCase();
  const playerUuid = getPlayerId();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null); // { id, username, is_host, is_ready, is_spy, location }
  const [votes, setVotes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState(null);

  // --- fetchers (RLS + column grants keep secrets out of these results) ------
  const fetchRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms_public').select('*').eq('room_code', roomCode).maybeSingle();
    if (error) { console.error('fetchRoom', error); return undefined; }
    setRoom(data);
    return data;
  }, [roomCode]);

  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from('players_public').select('*').eq('room_code', roomCode).order('joined_at', { ascending: true });
    if (error) { console.error('fetchPlayers', error); return; }
    setPlayers(data || []);
  }, [roomCode]);

  const fetchMe = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_my_player', {
      p_player_uuid: playerUuid, p_room_code: roomCode,
    });
    if (error) { console.error('fetchMe', error); return null; }
    const mine = data && data.length ? data[0] : null;
    setMe(mine);
    return mine;
  }, [playerUuid, roomCode]);

  const fetchVotes = useCallback(async () => {
    const { data, error } = await supabase.from('votes').select('*').eq('room_code', roomCode);
    if (error) { console.error('fetchVotes', error); return; }
    setVotes(data || []);
  }, [roomCode]);

  const fetchResults = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_results', { p_room_code: roomCode });
    if (error) { console.error('fetchResults', error); return; }
    if (data && data.length) setResults(data[0]);
  }, [roomCode]);

  // --- initial load / reconnect ----------------------------------------------
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const r = await fetchRoom();
      if (!active) return;
      if (!r) { setNotFound(true); setLoading(false); return; }
      const mine = await fetchMe();
      if (!active) return;
      if (!mine) {
        // Our UUID isn't seated in this room (expired, removed, or wrong device).
        navigate('/play', { replace: true });
        return;
      }
      await fetchPlayers();
      // if we reconnected mid-vote / after the round, load that phase's data too
      if (r.status === 'voting') await fetchVotes();
      if (r.status === 'ended') await fetchResults();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [roomCode, fetchRoom, fetchMe, fetchPlayers, fetchVotes, fetchResults, navigate]);

  // --- realtime: refetch on any change to this room --------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
        () => {
          fetchRoom().then((r) => {
            if (r?.status === 'voting') fetchVotes();
            if (r?.status === 'ended') fetchResults();
          });
          fetchMe();
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${roomCode}` },
        () => { fetchPlayers(); fetchMe(); })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_code=eq.${roomCode}` },
        () => { fetchVotes(); })
      .subscribe();
    // Always clean up the subscription on unmount to avoid leaks / dupes.
    return () => { supabase.removeChannel(channel); };
  }, [roomCode, fetchRoom, fetchMe, fetchPlayers, fetchVotes, fetchResults]);

  // --- host promotion: if the room has no host, the eldest player self-promotes
  useEffect(() => {
    if (!players.length || !me) return;
    if (players.some((p) => p.is_host)) return;
    const eldest = players[0]; // already ordered by joined_at
    if (eldest && eldest.id === me.id) {
      // single guarded RPC (WHERE no host exists) — race-safe across clients
      supabase.rpc('promote_host', { p_player_uuid: playerUuid, p_room_code: roomCode });
    }
  }, [players, me, playerUuid, roomCode]);

  // --- actions ----------------------------------------------------------------
  const call = useCallback(async (fn, extra = {}) => {
    setActionError(null);
    const { error } = await supabase.rpc(fn, { p_player_uuid: playerUuid, p_room_code: roomCode, ...extra });
    if (error) {
      console.error(`${fn} failed`, error);
      setActionError(error.message || 'Something went wrong. Please try again.');
      return false;
    }
    return true;
  }, [playerUuid, roomCode]);

  const setTimer   = useCallback((minutes) => call('set_timer', { p_minutes: minutes }), [call]);
  const startGame  = useCallback(() => call('start_game'), [call]);
  const setReady   = useCallback(() => call('set_ready'), [call]);
  const beginRound = useCallback(() => call('begin_round'), [call]);
  const accuse     = useCallback(() => call('accuse'), [call]);
  const castVote   = useCallback((accusedId) => call('cast_vote', { p_accused_id: accusedId }), [call]);
  const spyGuess   = useCallback((location) => call('spy_guess', { p_location: location }), [call]);
  const playAgain  = useCallback(() => call('play_again'), [call]);

  // expire_timer takes no player param; safe to call from any client (idempotent)
  const expireTimer = useCallback(() => {
    supabase.rpc('expire_timer', { p_room_code: roomCode });
  }, [roomCode]);

  const leaveRoom = useCallback(async () => {
    await supabase.rpc('leave_room', { p_player_uuid: playerUuid, p_room_code: roomCode });
    navigate('/play');
  }, [playerUuid, roomCode, navigate]);

  // derived phase
  let phase = null;
  if (room) {
    if (room.status === 'playing') phase = room.started_at ? 'playing' : 'reveal';
    else phase = room.status; // lobby | voting | ended
  }

  return {
    roomCode, room, players, me, votes, results, phase,
    loading, notFound, actionError,
    setTimer, startGame, setReady, beginRound, accuse, castVote,
    spyGuess, expireTimer, playAgain, leaveRoom,
  };
}
