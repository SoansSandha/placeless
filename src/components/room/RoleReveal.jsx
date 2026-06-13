import { motion } from 'framer-motion';
import { Button } from '../Button';

export function RoleReveal({ game }) {
  const { me, players, setReady, beginRound } = game;
  const readyCount = players.filter((p) => p.is_ready).length;
  const total = players.length;
  const iAmReady = me?.is_ready;
  const isSpy = me?.is_spy;

  return (
    <div className="w-full max-w-[520px] mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`p-12 rounded-[32px] border-2 shadow-xl mb-8 ${
          isSpy ? 'bg-[#1c1e54] border-[#1c1e54]' : 'bg-white border-[#e3e8ee]'
        }`}
      >
        {isSpy ? (
          <>
            <p className="uppercase tracking-[3px] text-sm font-bold text-[#f96bee] mb-4">Your role</p>
            <h2 className="text-[40px] font-black tracking-[-1px] text-white mb-3">You are the Spy</h2>
            <p className="text-white/70 font-medium">
              Blend in. Work out the location before the others expose you.
            </p>
          </>
        ) : (
          <>
            <p className="uppercase tracking-[3px] text-sm font-bold text-[#533afd] mb-4">The location is</p>
            <h2 className="text-[40px] font-black tracking-[-1px] text-[#0d253d] mb-3">{me?.location}</h2>
            <p className="text-[#64748d] font-medium">
              Don&apos;t say it out loud. Find the spy who doesn&apos;t know it.
            </p>
          </>
        )}
      </motion.div>

      {iAmReady ? (
        <p className="text-[#64748d] font-bold">
          Waiting for others… <span className="tnum text-[#533afd]">{readyCount}/{total} ready</span>
        </p>
      ) : (
        <Button variant="primary" className="w-full py-5 text-xl" onClick={setReady}>
          I&apos;m Ready
        </Button>
      )}

      {me?.is_host && iAmReady && readyCount < total && (
        <button
          type="button"
          onClick={beginRound}
          className="mt-4 block mx-auto text-[#533afd] font-bold hover:underline cursor-pointer"
        >
          Begin the round now →
        </button>
      )}
    </div>
  );
}
