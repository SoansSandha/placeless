import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'rounded-full px-6 py-2 text-base font-normal transition-colors duration-200 cursor-pointer inline-flex items-center justify-center';
  const variants = {
    // primary: #533afd, hover: #4434d4
    primary: 'bg-[#533afd] text-white hover:bg-[#4434d4]',
    // secondary: canvas #ffffff, text: #533afd, border: #e3e8ee
    secondary: 'bg-white text-[#533afd] border border-[#e3e8ee] hover:bg-[#f6f9fc]',
    ghost: 'text-[#533afd] hover:bg-[#f6f9fc]'
  };
  
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
}
