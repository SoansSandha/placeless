import { motion } from 'framer-motion';
import { Button } from '../Button';

export function Results({ game }) {
  const { results, me, playAgain, leaveRoom } = game;
  const spyWon = results?.winner === 'spy';

  return (
    <div className="w-full max-w-[520px] mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`p-12 rounded-[32px] border-2 shadow-xl mb-8 ${
          spyWon ? 'bg-[#1c1e54] border-[#1c1e54]' : 'bg-white border-[#e3e8ee]'
        }`}
      >
        <p
          className={`uppercase tracking-[3px] text-sm font-bold mb-4 ${
            spyWon ? 'text-[#f96bee]' : 'text-[#533afd]'
          }`}
        >
          {spyWon ? 'The Spy Wins' : 'The Players Win'}
        </p>
        <h2
          className={`text-[32px] font-black tracking-[-1px] mb-6 ${spyWon ? 'text-white' : 'text-[#0d253d]'}`}
        >
          {results?.spy_username || 'The spy'} was the Spy
        </h2>
        <div className={`rounded-2xl py-4 ${spyWon ? 'bg-white/10' : 'bg-[#f6f9fc]'}`}>
          <p
            className={`text-xs font-bold uppercase tracking-[2px] mb-1 ${
              spyWon ? 'text-white/60' : 'text-[#64748d]'
            }`}
          >
            Location
          </p>
          <p className={`text-[24px] font-black ${spyWon ? 'text-white' : 'text-[#0d253d]'}`}>
            {results?.location}
          </p>
        </div>
      </motion.div>

      <div className="space-y-3">
        {me?.is_host && (
          <Button variant="primary" className="w-full py-5 text-xl" onClick={playAgain}>
            Play Again
          </Button>
        )}
        <Button
          variant={me?.is_host ? 'ghost' : 'secondary'}
          className="w-full py-4"
          onClick={leaveRoom}
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
}
