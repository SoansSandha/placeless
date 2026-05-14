import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/player';

export function useRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper to generate a unique 4-character room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async (username) => {
    setLoading(true);
    setError(null);
    
    try {
      const playerUuid = getPlayerId();
      let roomCode = generateRoomCode();
      
      // 1. Create the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert([{ 
          room_code: roomCode, 
          status: 'lobby',
          last_activity_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (roomError) {
        // Handle collision (rare for 4 chars but possible)
        if (roomError.code === '23505') {
          return createRoom(username); // Retry once
        }
        throw roomError;
      }

      // 2. Add the host player
      const { error: playerError } = await supabase
        .from('players')
        .insert([{
          player_uuid: playerUuid,
          room_code: roomCode,
          username,
          is_host: true
        }]);

      if (playerError) throw playerError;

      navigate(`/room/${roomCode}`);
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
    const formattedCode = roomCode.toUpperCase().trim();

    try {
      const playerUuid = getPlayerId();

      // 1. Validate room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('status')
        .eq('room_code', formattedCode)
        .single();

      if (roomError || !room) {
        throw new Error('Room not found');
      }

      if (room.status !== 'lobby') {
        throw new Error('Game already in progress');
      }

      // 2. Check player count
      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_code', formattedCode);

      if (countError) throw countError;
      if (count >= 10) throw new Error('Room is full');

      // 3. Add player
      const { error: playerError } = await supabase
        .from('players')
        .insert([{
          player_uuid: playerUuid,
          room_code: formattedCode,
          username,
          is_host: false
        }]);

      if (playerError) {
        if (playerError.code === '23505') {
          throw new Error('You are already in this room');
        }
        throw playerError;
      }

      // 4. Update room activity
      await supabase
        .from('rooms')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('room_code', formattedCode);

      navigate(`/room/${formattedCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return { createRoom, joinRoom, loading, error };
}
