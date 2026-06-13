import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import logo from "../assets/logo.svg";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-4 left-4 right-4 z-50 px-8 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full bg-white/80 dark:bg-[#14163a]/80 backdrop-blur-[16px] border border-white/40 dark:border-white/10 rounded-[28px] shadow-xl"
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-[24px] font-bold tracking-[-0.5px] text-[#0d253d] dark:text-[#eef1fb]"
      >
        <img src={logo} alt="" className="h-9 w-9 shrink-0" />
        <span>
          Placeless<span className="text-[#533afd]">.</span>
        </span>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/play/how-to-play"
          className="text-sm font-semibold text-[#273951] dark:text-[#c3cbe2] hover:text-[#533afd] dark:hover:text-[#b9b9f9] transition-colors"
        >
          Rules
        </Link>
        <ThemeToggle />
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
