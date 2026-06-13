import { motion } from 'framer-motion';

export function FeatureCard({ step, title, description, delay = 0, className = '' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        borderColor: '#533afd'
      }}
      className={`bg-white dark:bg-[#14163a] p-10 rounded-3xl border-2 border-[#e3e8ee] dark:border-[#2a2d5c] shadow-lg transition-colors duration-300 ${className}`}
    >
      {step && (
        <div className="w-10 h-10 rounded-full bg-[#f6f9fc] dark:bg-[#1c1e54] flex items-center justify-center text-[14px] font-bold text-[#533afd] mb-4">
          {step}
        </div>
      )}
      <h3 className="text-[22px] font-bold tracking-[-0.2px] text-[#0d253d] dark:text-[#eef1fb] mb-3">{title}</h3>
      <p className="text-[16px] font-normal text-[#64748d] dark:text-[#8b95b8] leading-relaxed">{description}</p>
    </motion.div>
  );
}
