import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-4 left-4 right-4 z-50 px-8 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full bg-white/80 backdrop-blur-[16px] border border-white/40 rounded-[28px] shadow-xl"
    >
      <Link to="/" className="text-[24px] font-bold tracking-[-0.5px] text-[#0d253d]">
        Placeless<span className="text-[#533afd]">.</span>
      </Link>
      <div className="flex items-center gap-8">
        <Link to="/play/how-to-play" className="text-sm font-semibold text-[#273951] hover:text-[#533afd] transition-colors">
          Rules
        </Link>
        <Link to="/play">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#533afd] text-white rounded-full px-6 py-2.5 text-sm font-bold cursor-pointer shadow-lg shadow-[#533afd]/20"
          >
            Play Now
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}
