import { motion } from 'framer-motion';

export function GradientMesh() {
  const drift = {
    animate: {
      x: [0, 60, -60, 0],
      y: [0, -60, 60, 0],
      scale: [1, 1.2, 0.8, 1],
      rotate: [0, 10, -10, 0],
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white dark:bg-[#0b0d22]">
      {/* Top Left - Cream */}
      <motion.div 
        animate={drift.animate} 
        transition={drift.transition} 
        className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] rounded-full bg-[#f5e9d4] blur-[100px] opacity-70" 
      />
      
      {/* Top Center - Lemon */}
      <motion.div 
        animate={drift.animate} 
        transition={{ ...drift.transition, duration: 18, delay: 2 }} 
        className="absolute -top-[10%] left-[30%] w-[60%] h-[60%] rounded-full bg-[#9b6829] blur-[120px] opacity-40" 
      />
      
      {/* Top Right - Magenta */}
      <motion.div 
        animate={drift.animate} 
        transition={{ ...drift.transition, duration: 16, delay: 5 }} 
        className="absolute -top-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[#f96bee] blur-[100px] opacity-50" 
      />
      
      {/* Mid Left - Primary Soft */}
      <motion.div 
        animate={drift.animate} 
        transition={{ ...drift.transition, duration: 20, delay: 1 }} 
        className="absolute top-[25%] -left-[10%] w-[55%] h-[55%] rounded-full bg-[#665efd] blur-[100px] opacity-40" 
      />
      
      {/* Mid Right - Indigo (Brand Dark) */}
      <motion.div 
        animate={drift.animate} 
        transition={{ ...drift.transition, duration: 22, delay: 4 }} 
        className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#1c1e54] blur-[100px] opacity-30" 
      />
      
      {/* Bottom Right - Ruby */}
      <motion.div 
        animate={drift.animate} 
        transition={{ ...drift.transition, duration: 17, delay: 3 }} 
        className="absolute top-[45%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[#ea2261] blur-[100px] opacity-50" 
      />
    </div>
  );
}
