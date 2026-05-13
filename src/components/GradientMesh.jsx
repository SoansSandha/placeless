import { motion } from 'framer-motion';

export function GradientMesh() {
  const drift = {
    animate: {
      x: [0, 40, -40, 0],
      y: [0, -40, 40, 0],
      scale: [1, 1.15, 0.95, 1],
      rotate: [0, 5, -5, 0],
    },
    transition: {
      duration: 25,
      repeat: Infinity,
      ease: "linear"
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      {/* Top Left - Cream */}
      <motion.div 
        animate={drift.animate}
        transition={drift.transition}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#f5e9d4] blur-[100px] opacity-60" 
      />
      
      {/* Top Center - Lemon */}
      <motion.div 
        animate={drift.animate}
        transition={{ ...drift.transition, duration: 30, delay: 2 }}
        className="absolute -top-[5%] left-[30%] w-[50%] h-[50%] rounded-full bg-[#9b6829] blur-[120px] opacity-30" 
      />
      
      {/* Top Right - Magenta */}
      <motion.div 
        animate={drift.animate}
        transition={{ ...drift.transition, duration: 28, delay: 5 }}
        className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#f96bee] blur-[100px] opacity-40" 
      />
      
      {/* Mid Left - Primary Soft */}
      <motion.div 
        animate={drift.animate}
        transition={{ ...drift.transition, duration: 35, delay: 1 }}
        className="absolute top-[20%] -left-[5%] w-[45%] h-[45%] rounded-full bg-[#665efd] blur-[100px] opacity-30" 
      />
      
      {/* Mid Right - Indigo (Brand Dark) */}
      <motion.div 
        animate={drift.animate}
        transition={{ ...drift.transition, duration: 32, delay: 4 }}
        className="absolute top-[15%] right-[5%] w-[40%] h-[40%] rounded-full bg-[#1c1e54] blur-[100px] opacity-20" 
      />
      
      {/* Bottom Right - Ruby */}
      <motion.div 
        animate={drift.animate}
        transition={{ ...drift.transition, duration: 27, delay: 3 }}
        className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#ea2261] blur-[100px] opacity-40" 
      />
    </div>
  );
}
