import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GradientMesh } from '../components/GradientMesh';
import { Button } from '../components/Button';
import { useRoom } from '../hooks/useRoom';

export default function JoinRoom() {
  const { joinRoom, loading, error } = useRoom();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  // Prefilled from a shared invite link (?code=XKQT); uppercase it so a
  // lowercased URL still shows the canonical code.
  const [roomCode, setRoomCode] = useState((searchParams.get('code') || '').toUpperCase());

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim()) {
      joinRoom(username.trim(), roomCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d22] overflow-x-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-[160px] pb-[100px] px-6 relative flex flex-col items-center justify-center">
        <GradientMesh />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[500px] w-full relative z-10"
        >
          <div className="bg-[#f6f9fc] dark:bg-[#1c1e54] p-10 md:p-12 rounded-[32px] border-2 border-[#e3e8ee] dark:border-[#2a2d5c] shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#533afd] flex items-center justify-center text-white mb-8 shadow-lg shadow-[#533afd]/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            
            <h1 className="text-[32px] font-black tracking-[-1px] text-[#0d253d] dark:text-[#eef1fb] mb-4">Join Room</h1>
            <p className="text-[#64748d] dark:text-[#8b95b8] mb-10 font-medium">Enter your details to jump into the action.</p>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <input 
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                variant="primary" 
                className="w-full py-5 text-xl"
                disabled={loading || username.length < 2 || roomCode.length !== 4}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center font-bold text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
