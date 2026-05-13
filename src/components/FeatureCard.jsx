import { motion } from 'framer-motion';

export function FeatureCard({ step, title, description, delay = 0, className = '' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8, 
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        borderColor: '#b9b9f9'
      }}
      className={`bg-white p-8 rounded-xl border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.08)] transition-colors duration-300 ${className}`}
    >
      {step && (
        <span className="text-[13px] font-normal tracking-[-0.39px] text-[#533afd] mb-2 block uppercase">
          Step {step}
        </span>
      )}
      <h3 className="text-[20px] font-light tracking-[-0.2px] text-[#0d253d] mb-2">{title}</h3>
      <p className="text-[15px] font-light text-[#64748d] leading-relaxed">{description}</p>
    </motion.div>
  );
}
