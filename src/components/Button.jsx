import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'rounded-full px-8 py-3 text-base font-medium transition-colors duration-200 cursor-pointer inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-[#533afd] text-white hover:bg-[#4434d4]',
    secondary: 'bg-white dark:bg-[#14163a] text-[#533afd] dark:text-[#b9b9f9] border-2 border-[#533afd] dark:border-[#665efd] hover:bg-[#f6f9fc] dark:hover:bg-[#1c1e54]',
    ghost: 'text-[#533afd] dark:text-[#b9b9f9] hover:bg-[#f6f9fc] dark:hover:bg-[#1c1e54]'
  };
  
  return (
    <motion.button 
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
}
