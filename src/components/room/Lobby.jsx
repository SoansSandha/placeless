import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { PlayerList } from './PlayerList';

export function Lobby({ game }) {
  const { room, players, me, setTimer, setRounds, startGame, promoteToHost } = game;
  const isHost = me?.is_host;
  const canStart = players.length >= 3;
  const needed = 3 - players.length;

  // Local values track the slider drags smoothly; we only write to the server on
  // release / keyboard change so we don't spam the RPC on every pixel. Only the
  // host edits these, so they never need to chase the server value.
  const [localTimer, setLocalTimer] = useState(room.timer_duration);
  const shownTimer = isHost ? localTimer : room.timer_duration;
  const commitTimer = (value) => { if (value !== room.timer_duration) setTimer(value); };

  const [localRounds, setLocalRounds] = useState(room.round_count);
  const shownRounds = isHost ? localRounds : room.round_count;
  const commitRounds = (value) => { if (value !== room.round_count) setRounds(value); };

  // Copy a full invite link (e.g. http://localhost:5173/room/5JB1) so friends
  // land on Join with the code already filled in. Clipboard needs a secure
  // context — both localhost and the deployed https site qualify.
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/room/${room.room_code}`;

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch (err) {
      // Clipboard can be blocked (denied permission / insecure context) — fall
      // back to a prompt so the player can still grab the link manually.
      console.error('copyInviteLink', err);
      window.prompt('Copy this invite link:', inviteLink);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="text-center mb-8">
        <p className="text-[#64748d] dark:text-[#8b95b8] font-bold uppercase tracking-[2px] text-sm mb-2">Room Code</p>
        <div className="flex items-center justify-center gap-3">
          <div className="text-[56px] leading-none font-black tracking-[8px] text-[#533afd]">{room.room_code}</div>
          <motion.button
            type="button"
            onClick={copyInviteLink}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            aria-label={copied ? 'Invite link copied' : 'Copy invite link'}
            className="shrink-0 w-11 h-11 rounded-full bg-white dark:bg-[#14163a] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] hover:border-[#533afd] dark:hover:border-[#665efd] text-[#533afd] flex items-center justify-center cursor-pointer"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-7.5A2.25 2.25 0 0 1 10.5 8.25h6Z" />
              </svg>
            )}
          </motion.button>
        </div>
        <p className="text-[#64748d] dark:text-[#8b95b8] font-medium mt-3">
          {copied ? 'Invite link copied — share it with friends.' : 'Share the code or copy an invite link for friends.'}
        </p>
      </div>

      <div className="bg-[#f6f9fc] dark:bg-[#1c1e54] p-8 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-black tracking-[-0.5px] text-[#0d253d] dark:text-[#eef1fb]">Players</h2>
          <span className="tnum text-sm font-bold text-[#64748d] dark:text-[#8b95b8]">{players.length} / 10</span>
        </div>

        <PlayerList players={players} meId={me?.id} onPromote={isHost ? promoteToHost : undefined} />

        <div className="mt-8">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[#64748d] dark:text-[#8b95b8] font-bold uppercase tracking-[2px] text-xs">Round length</p>
            <p className="tnum text-[#533afd] font-black text-lg">{shownTimer} min</p>
          </div>
          <input
            type="range"
            aria-label="Round length in minutes"
            min="3"
            max="15"
            step="1"
            value={shownTimer}
            disabled={!isHost}
            onChange={(e) => setLocalTimer(Number(e.target.value))}
            onMouseUp={(e) => commitTimer(Number(e.target.value))}
            onTouchEnd={(e) => commitTimer(Number(e.target.value))}
            onKeyUp={(e) => commitTimer(Number(e.target.value))}
            className="w-full h-2 accent-[#533afd] cursor-pointer disabled:cursor-default disabled:opacity-70"
          />
          <div className="flex justify-between tnum text-[#64748d] dark:text-[#8b95b8] text-xs mt-1">
            <span>3 min</span>
            <span>15 min</span>
          </div>
          {!isHost && <p className="text-[#64748d] dark:text-[#8b95b8] text-xs mt-2">The host sets the round length.</p>}
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[#64748d] dark:text-[#8b95b8] font-bold uppercase tracking-[2px] text-xs">Rounds</p>
            <p className="tnum text-[#533afd] font-black text-lg">{shownRounds}</p>
          </div>
          <input
            type="range"
            aria-label="Number of rounds"
            min="1"
            max="10"
            step="1"
            value={shownRounds}
            disabled={!isHost}
            onChange={(e) => setLocalRounds(Number(e.target.value))}
            onMouseUp={(e) => commitRounds(Number(e.target.value))}
            onTouchEnd={(e) => commitRounds(Number(e.target.value))}
            onKeyUp={(e) => commitRounds(Number(e.target.value))}
            className="w-full h-2 accent-[#533afd] cursor-pointer disabled:cursor-default disabled:opacity-70"
          />
          <div className="flex justify-between tnum text-[#64748d] dark:text-[#8b95b8] text-xs mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="mt-8">
          {isHost ? (
            <Button variant="primary" className="w-full py-5 text-xl" onClick={startGame} disabled={!canStart}>
              {canStart ? 'Start Game' : `Need ${needed} more player${needed === 1 ? '' : 's'}`}
            </Button>
          ) : (
            <p className="text-center text-[#64748d] dark:text-[#8b95b8] font-bold py-4">Waiting for the host to start…</p>
          )}
        </div>
      </div>
    </div>
  );
}
