import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/player';

// Room creation + joining. The inserts happen inside SECURITY DEFINER RPCs
// (create_room / join_room) so unique room codes, the 10-player capacity check,
// and duplicate-name protection are enforced atomically on the server — the
// previous client-side count-then-insert was open to a race at capacity.
export function useRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createRoom = async (username) => {
    setLoading(true);
    setError(null);
    try {
      const name = username.trim();
      if (name.length < 2 || name.length > 20) {
        throw new Error('Name must be 2 to 20 characters');
      }
      const { data, error: rpcError } = await supabase.rpc('create_room', {
        p_player_uuid: getPlayerId(),
        p_username: name,
      });
      if (rpcError) throw rpcError;
      navigate(`/room/${data}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (username, roomCode) => {
    setLoading(true);
    setError(null);
    try {
      const name = username.trim();
      const code = roomCode.toUpperCase().trim();
      if (name.length < 2 || name.length > 20) {
        throw new Error('Name must be 2 to 20 characters');
      }
      if (code.length !== 4) {
        throw new Error('Room code must be 4 characters');
      }
      const { data, error: rpcError } = await supabase.rpc('join_room', {
        p_player_uuid: getPlayerId(),
        p_room_code: code,
        p_username: name,
      });
      if (rpcError) throw rpcError;
      navigate(`/room/${data}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return { createRoom, joinRoom, loading, error };
}
