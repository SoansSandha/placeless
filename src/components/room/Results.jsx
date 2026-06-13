import { motion } from 'framer-motion';
import { Button } from '../Button';

export function Results({ game }) {
  const { results, players, me, room, nextRound, playAgain, leaveRoom } = game;

  // results arrive a beat after the room flips to 'ended' over realtime
  if (!results) {
    return <p className="text-center text-[#64748d] dark:text-[#8b95b8] font-bold">Tallying the round…</p>;
  }

  const spyWon = results.winner === 'spy';
  const isGameOver = room.current_round >= room.round_count;

  const standings = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topScore = standings.length ? (standings[0].score ?? 0) : 0;
  const winnerIds = new Set(standings.filter((p) => (p.score ?? 0) === topScore && topScore > 0).map((p) => p.id));

  return (
    <div className="w-full max-w-[520px] mx-auto text-center">
      {/* round outcome */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`p-10 rounded-[32px] border-2 shadow-xl mb-6 ${
          spyWon ? 'bg-[#1c1e54] border-[#1c1e54]' : 'bg-white dark:bg-[#14163a] border-[#e3e8ee] dark:border-[#2a2d5c]'
        }`}
      >
        <p
          className={`uppercase tracking-[3px] text-xs font-bold mb-3 ${
            spyWon ? 'text-[#f96bee]' : 'text-[#533afd]'
          }`}
        >
          Round {room.current_round} of {room.round_count} · {spyWon ? 'Spy wins' : 'Players win'}
        </p>
        <h2
          className={`text-[26px] font-black tracking-[-0.5px] mb-4 ${spyWon ? 'text-white' : 'text-[#0d253d] dark:text-[#eef1fb]'}`}
        >
          {results?.spy_username || 'The spy'} was the Spy
        </h2>
        <div className={`rounded-2xl py-3 ${spyWon ? 'bg-white/10' : 'bg-[#f6f9fc] dark:bg-[#1c1e54]'}`}>
          <p
            className={`text-xs font-bold uppercase tracking-[2px] ${
              spyWon ? 'text-white/60' : 'text-[#64748d] dark:text-[#8b95b8]'
            }`}
          >
            Location
          </p>
          <p className={`text-[20px] font-black ${spyWon ? 'text-white' : 'text-[#0d253d] dark:text-[#eef1fb]'}`}>
            {results?.location}
          </p>
        </div>
      </motion.div>

      {/* standings */}
      <div className="bg-[#f6f9fc] dark:bg-[#1c1e54] p-6 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] mb-6 text-left">
        <h3 className="text-[18px] font-black tracking-[-0.3px] text-[#0d253d] dark:text-[#eef1fb] mb-4 text-center">
          {isGameOver ? 'Final Standings' : 'Standings'}
        </h3>
        <ul className="space-y-2">
          {standings.map((p, i) => {
            const isWinner = isGameOver && winnerIds.has(p.id);
            return (
              <li
                key={p.id}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 bg-white dark:bg-[#14163a] ${
                  isWinner ? 'border-[#533afd]' : 'border-transparent'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="tnum w-6 text-[#64748d] dark:text-[#8b95b8] font-bold">{i + 1}</span>
                  <span className="font-bold text-[#0d253d] dark:text-[#eef1fb] truncate">
                    {p.username}
                    {p.id === me?.id && <span className="text-[#64748d] dark:text-[#8b95b8] font-medium"> (you)</span>}
                    {isWinner && ' 🏆'}
                  </span>
                </span>
                <span className="tnum font-black text-[#533afd]">
                  {p.score ?? 0}
                  <span className="text-[#64748d] dark:text-[#8b95b8] text-xs font-bold"> pts</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        {me?.is_host ? (
          isGameOver ? (
            <Button variant="primary" className="w-full py-5 text-xl" onClick={playAgain}>
              New Game
            </Button>
          ) : (
            <Button variant="primary" className="w-full py-5 text-xl" onClick={nextRound}>
              Next Round
            </Button>
          )
        ) : (
          <p className="text-center text-[#64748d] dark:text-[#8b95b8] font-bold py-2">
            {isGameOver
              ? 'Waiting for the host to start a new game…'
              : 'Waiting for the host to start the next round…'}
          </p>
        )}
        <Button variant={me?.is_host ? 'ghost' : 'secondary'} className="w-full py-4" onClick={leaveRoom}>
          Leave Room
        </Button>
      </div>
    </div>
  );
}
