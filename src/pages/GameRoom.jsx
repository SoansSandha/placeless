import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientMesh } from '../components/GradientMesh';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useGameRoom } from '../hooks/useGameRoom';
import { Lobby } from '../components/room/Lobby';
import { Playing } from '../components/room/Playing';
import { Voting } from '../components/room/Voting';
import { Results } from '../components/room/Results';

export default function GameRoom() {
  const { code } = useParams();
  const game = useGameRoom(code);
  const { room, me, phase, loading, actionError, leaveRoom } = game;

  const closed = !loading && !room; // not found, expired, or every player left

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d22] overflow-x-hidden flex flex-col">
      {/* Same floating-pill chrome as the marketing Navbar, but with room actions. */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-4 left-4 right-4 z-50 px-8 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full bg-white/80 dark:bg-[#14163a]/80 backdrop-blur-[16px] border border-white/40 dark:border-white/10 rounded-[28px] shadow-xl"
      >
        <Link to="/" className="text-[24px] font-bold tracking-[-0.5px] text-[#0d253d] dark:text-[#eef1fb]">
          Placeless<span className="text-[#533afd]">.</span>
        </Link>
        <div className="flex items-center gap-4">
          {room && me && (
            <>
              <span className="tnum text-sm font-bold tracking-[2px] text-[#64748d] dark:text-[#8b95b8] hidden sm:inline">
                {room.room_code}
              </span>
              <Button variant="ghost" className="px-5 py-2 text-sm" onClick={leaveRoom}>
                Leave
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </motion.nav>

      <main className="flex-grow relative flex items-center justify-center px-6 pt-[120px] pb-[80px]">
        <GradientMesh />

        <div className="relative z-10 w-full">
          {loading && (
            <p className="text-center text-[#64748d] dark:text-[#8b95b8] font-bold">Loading room…</p>
          )}

          {closed && (
            <div className="text-center max-w-[420px] mx-auto">
              <h1 className="text-[32px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb] mb-3">
                This room has closed
              </h1>
              <p className="text-[#64748d] dark:text-[#8b95b8] font-medium mb-8">
                It may have ended or expired. Start a fresh one.
              </p>
              <Link to="/play">
                <Button variant="primary" className="px-8 py-4 text-lg">Back to Play</Button>
              </Link>
            </div>
          )}

          {!loading && !closed && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: 'circOut' }}
                >
                  {phase === 'lobby' && <Lobby game={game} />}
                  {phase === 'playing' && <Playing game={game} />}
                  {phase === 'voting' && <Voting game={game} />}
                  {phase === 'ended' && <Results game={game} />}
                </motion.div>
              </AnimatePresence>

              {actionError && (
                <p className="mt-6 text-center text-[#ea2261] font-bold">{actionError}</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
