import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GradientMesh } from '../components/GradientMesh';
import { Button } from '../components/Button';
import { useRoom } from '../hooks/useRoom';

export default function PlayHub() {
  const { createRoom, joinRoom, loading, error } = useRoom();
  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (createName.trim()) {
      createRoom(createName.trim());
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinName.trim() && roomCode.trim()) {
      joinRoom(joinName.trim(), roomCode.trim());
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d22] overflow-x-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-[160px] pb-[100px] px-6 relative flex flex-col items-center justify-center">
        <GradientMesh />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-[1000px] w-full relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h1 className="text-[48px] md:text-[64px] font-black tracking-[-2px] text-[#0d253d] dark:text-[#eef1fb] mb-4">
              Ready to Play?
            </h1>
            <p className="text-[20px] text-[#64748d] dark:text-[#8b95b8] font-medium max-w-[600px] mx-auto">
              Choose your path. Start a new deception or join an existing table.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Room Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#f6f9fc] dark:bg-[#1c1e54] p-10 md:p-12 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] hover:border-[#533afd] dark:hover:border-[#665efd] transition-colors duration-300 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#533afd] flex items-center justify-center text-white mb-8 shadow-lg shadow-[#533afd]/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-[32px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb] mb-4">Create Room</h2>
              <p className="text-[#64748d] dark:text-[#8b95b8] mb-10 font-medium">Be the host. Pick the timer and lead the hunt for the spy.</p>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    maxLength={20}
                    className="w-full px-6 py-4 rounded-full bg-white dark:bg-[#14163a] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] focus:border-[#533afd] focus:outline-none text-[#0d253d] dark:text-[#eef1fb] font-bold placeholder:text-[#64748d]/50 dark:placeholder:text-[#8b95b8]/50 transition-all text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-5 text-xl"
                  disabled={loading || createName.length < 2}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </Button>
              </form>
            </motion.div>

            {/* Join Room Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#f6f9fc] dark:bg-[#1c1e54] p-10 md:p-12 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] hover:border-[#533afd] dark:hover:border-[#665efd] transition-colors duration-300 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#533afd] flex items-center justify-center text-white mb-8 shadow-lg shadow-[#533afd]/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h2 className="text-[32px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb] mb-4">Join Room</h2>
              <p className="text-[#64748d] dark:text-[#8b95b8] mb-10 font-medium">Got a code? Enter it below to join your friends instantly.</p>
              
              <form onSubmit={handleJoin} className="space-y-4">
                <input 
                  type="text"
                  placeholder="Enter your name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  maxLength={20}
                  className="w-full px-6 py-4 rounded-full bg-white dark:bg-[#14163a] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] focus:border-[#533afd] focus:outline-none text-[#0d253d] dark:text-[#eef1fb] font-bold placeholder:text-[#64748d]/50 dark:placeholder:text-[#8b95b8]/50 transition-all text-lg"
                />
                <input 
                  type="text"
                  placeholder="Room Code (e.g. XKQT)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full px-6 py-4 rounded-full bg-white dark:bg-[#14163a] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] focus:border-[#533afd] focus:outline-none text-[#0d253d] dark:text-[#eef1fb] font-bold placeholder:text-[#64748d]/50 dark:placeholder:text-[#8b95b8]/50 transition-all text-lg tracking-[4px] uppercase"
                />
                <Button 
                  type="submit" 
                  variant="secondary" 
                  className="w-full py-5 text-xl"
                  disabled={loading || joinName.length < 2 || roomCode.length !== 4}
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </Button>
              </form>
            </motion.div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
