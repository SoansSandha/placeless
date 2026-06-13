import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GradientMesh } from '../components/GradientMesh';
import { Button } from '../components/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const STEPS = [
  {
    step: '1',
    title: 'Everyone gets a secret',
    body: 'When the host starts the round, one player is secretly made the Spy. Everyone else is shown the same secret location — the Spy is not.',
  },
  {
    step: '2',
    title: 'Ask questions, give answers',
    body: 'Over voice or video, take turns asking each other questions about the location. Be specific enough to prove you belong — but not so specific that you hand the Spy the answer.',
  },
  {
    step: '3',
    title: 'The Spy blends in',
    body: 'The Spy does not know the location and is trying to figure it out from the conversation. If the Spy thinks they know it, they can guess at any time.',
  },
  {
    step: '4',
    title: 'Accuse and vote',
    body: 'Any player can call a vote at any time. Everyone votes for who they think the Spy is. The round ends as soon as the votes are in — or when the timer runs out.',
  },
];

const WIN_CONDITIONS = [
  ['The group votes out the Spy', 'Players win'],
  ['The group votes out the wrong person', 'Spy wins'],
  ['The Spy correctly guesses the location', 'Spy wins'],
  ['The timer runs out with no result', 'Spy wins'],
];

export default function HowToPlay() {
  useDocumentTitle('How to Play · Placeless');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d22] overflow-x-hidden flex flex-col">
      <Navbar />

      <main className="flex-grow pt-[160px] pb-[100px] px-6 relative">
        <GradientMesh />

        <div className="max-w-[760px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="text-center mb-16"
          >
            <h1 className="text-[48px] md:text-[56px] font-black tracking-[-2px] text-[#0d253d] dark:text-[#eef1fb] mb-4">
              How to Play
            </h1>
            <p className="text-[20px] text-[#64748d] dark:text-[#8b95b8] font-medium max-w-[560px] mx-auto">
              Placeless is a social bluffing game for 3–10 players. One spy, one
              location, and a lot of careful questions. You&apos;ll need a voice or video call
              going alongside the app.
            </p>
          </motion.div>

          <div className="space-y-5 mb-16">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.05 }}
                className="flex gap-5 bg-[#f6f9fc] dark:bg-[#1c1e54] p-8 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c]"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#533afd] text-white flex items-center justify-center text-lg font-black">
                  {s.step}
                </div>
                <div>
                  <h2 className="text-[22px] font-black tracking-[-0.5px] text-[#0d253d] dark:text-[#eef1fb] mb-2">{s.title}</h2>
                  <p className="text-[#64748d] dark:text-[#8b95b8] font-medium leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-white dark:bg-[#14163a] p-8 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] shadow-lg mb-16"
          >
            <h2 className="text-[28px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb] mb-6">Who wins?</h2>
            <ul className="space-y-3">
              {WIN_CONDITIONS.map(([condition, winner]) => (
                <li
                  key={condition}
                  className="flex items-center justify-between gap-4 py-3 border-b border-[#e3e8ee] dark:border-[#2a2d5c] last:border-0"
                >
                  <span className="text-[#273951] dark:text-[#c3cbe2] font-medium">{condition}</span>
                  <span
                    className={`shrink-0 text-xs font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-full ${
                      winner === 'Spy wins' ? 'bg-[#1c1e54] text-white' : 'bg-[#b9b9f9] text-[#2e2b8c]'
                    }`}
                  >
                    {winner}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="text-center">
            <Link to="/play">
              <Button variant="primary" className="px-10 py-5 text-xl">Start a Game</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
