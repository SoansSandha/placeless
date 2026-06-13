import { useState } from 'react';
import { PlayerList } from './PlayerList';

export function Voting({ game }) {
  const { players, me, votes, room, castVote } = game;
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

  const handleVote = (accusedId) => {
    setPicked(true);
    castVote(accusedId);
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[32px] font-black tracking-[-1px] text-[#0d253d]">Who&apos;s the Spy?</h2>
        <p className="text-[#64748d] font-medium mt-2">
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
    </div>
  );
}
