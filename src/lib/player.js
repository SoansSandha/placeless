/**
 * Manages the anonymous player identity using localStorage.
 * This UUID persists across sessions and uniquely identifies a player
 * even if they use the same display name as others.
 */

const PLAYER_ID_KEY = 'placeless_player_id';

export function getPlayerId() {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  
  return playerId;
}
