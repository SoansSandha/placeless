import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full bg-white/70 backdrop-blur-[12px] border-b border-white/20 rounded-b-2xl shadow-sm"
    >
      <Link to="/" className="text-[26px] font-light tracking-[-0.26px] text-[#0d253d]">
        Placeless
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/play/how-to-play" className="text-sm font-normal text-[#273951] hover:text-[#533afd] transition-colors">
          How to Play
        </Link>
        <Link to="/play">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-[#533afd] text-white rounded-full px-6 py-2 text-sm font-normal cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          >
            Play Now
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}
