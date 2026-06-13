import { useState } from 'react';
import { Button } from '../Button';
import { PlayerList } from './PlayerList';
import { Timer } from './Timer';

export function Voting({ game }) {
  const { players, me, votes, room, castVote, expireVote, skipVote, clockOffset } = game;
  // optimistic lock: stop a fast double-tap from looking like a changed vote
  // while the first vote round-trips (the server only honours the first anyway)
  const [picked, setPicked] = useState(false);

  // only count votes from the current round (supports "Play Again")
  const roundVotes = votes.filter((v) => v.round === room.current_round);
  const locked = picked || roundVotes.some((v) => v.voter_id === me?.id);

  const counts = {};
  roundVotes.forEach((v) => {
    counts[v.accused_id] = (counts[v.accused_id] || 0) + 1;
  });

  const handleVote = async (accusedId) => {
    setPicked(true); // optimistic lock
    const ok = await castVote(accusedId);
    if (!ok) setPicked(false); // vote didn't go through — let them retry
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-[32px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb]">Who&apos;s the Spy?</h2>
        {room.voting_started_at && (
          <div className="mt-3">
            <Timer startedAt={room.voting_started_at} durationMinutes={5} onExpire={expireVote} offsetMs={clockOffset} />
          </div>
        )}
        <p className="text-[#64748d] dark:text-[#8b95b8] font-medium mt-2">
          {locked ? 'Vote locked in. Waiting for everyone… ' : 'Tap the player you suspect. '}
          <span className="tnum font-bold text-[#533afd]">
            {roundVotes.length}/{players.length}
          </span>
        </p>
      </div>

      <PlayerList
        players={players}
        meId={me?.id}
        voteCounts={counts}
        onSelect={locked ? null : handleVote}
        disabledIds={locked ? players.map((p) => p.id) : [me?.id]}
      />

      {me?.is_host && (
        <div className="mt-6 text-center">
          <Button variant="ghost" className="px-6 py-3 text-sm" onClick={skipVote}>
            Skip &amp; reveal now
          </Button>
          <p className="text-[#64748d] dark:text-[#8b95b8] text-xs mt-1">Host only — for when someone&apos;s away.</p>
        </div>
      )}
    </div>
  );
}
