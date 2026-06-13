import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import { PlayerList } from './PlayerList';
import { Timer } from './Timer';
import { LOCATIONS } from '../../data/locations';

export function Playing({ game }) {
  const { room, players, me, accuse, spyGuess, expireTimer } = game;
  const [guessing, setGuessing] = useState(false);

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="text-center mb-8">
        <Timer startedAt={room.started_at} durationMinutes={room.timer_duration} onExpire={expireTimer} />
        <p className="text-[#64748d] font-medium mt-2">Talk it out. Ask questions. Find the spy.</p>
      </div>

      <div className="bg-[#f6f9fc] p-8 rounded-[32px] border-2 border-[#e3e8ee] shadow-xl">
        <h2 className="text-[24px] font-black tracking-[-0.5px] text-[#0d253d] mb-4">Players</h2>
        <PlayerList players={players} meId={me?.id} />

        <div className="mt-8 space-y-3">
          <Button variant="primary" className="w-full py-5 text-xl" onClick={accuse}>
            Accuse — Call a Vote
          </Button>
          {me?.is_spy && (
            <Button variant="secondary" className="w-full py-4" onClick={() => setGuessing(true)}>
              Guess the Location
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {guessing && (
          <GuessModal
            onClose={() => setGuessing(false)}
            onGuess={(location) => {
              setGuessing(false);
              spyGuess(location);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GuessModal({ onClose, onGuess }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#1c1e54]/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-[640px] max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[24px] font-black tracking-[-0.5px] text-[#0d253d]">Guess the location</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748d] font-bold hover:text-[#0d253d] cursor-pointer"
          >
            Cancel
          </button>
        </div>
        <p className="text-[#64748d] font-medium mb-6">
          Pick the location you think the others share. Get it right and you win.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LOCATIONS.map((location) => (
            <motion.button
              key={location}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              onClick={() => onGuess(location)}
              className="px-3 py-3 rounded-full border-2 border-[#e3e8ee] bg-white text-[#0d253d] text-sm font-bold hover:border-[#533afd] hover:bg-[#f6f9fc] transition-colors cursor-pointer"
            >
              {location}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
