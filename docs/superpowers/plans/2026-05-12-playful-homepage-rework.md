# Playful Homepage Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-apply the "Sophisticated Playful" design principles to the Homepage and its components.

**Architecture:** 
- Update spring physics for higher bounce.
- Increase border radii for "game-card" feel.
- Bump font weights for better readability and energy.

**Tech Stack:** React 18, Tailwind CSS v4, Framer Motion.

---

### Task 1: Playful UI Components

**Files:**
- Modify: `src/components/Button.jsx`
- Modify: `src/components/FeatureCard.jsx`

- [ ] **Step 1: Add more bounce and ensure pill shape for Button**
```javascript
import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'rounded-full px-8 py-3 text-base font-medium transition-colors duration-200 cursor-pointer inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-[#533afd] text-white hover:bg-[#4434d4]',
    secondary: 'bg-white text-[#533afd] border-2 border-[#533afd] hover:bg-[#f6f9fc]',
    ghost: 'text-[#533afd] hover:bg-[#f6f9fc]'
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
```

- [ ] **Step 2: Increase radius and bounce for FeatureCard**
```javascript
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
      className={`bg-white p-10 rounded-3xl border-2 border-[#e3e8ee] shadow-lg transition-colors duration-300 ${className}`}
    >
      {step && (
        <div className="w-10 h-10 rounded-full bg-[#f6f9fc] flex items-center justify-center text-[14px] font-bold text-[#533afd] mb-4">
          {step}
        </div>
      )}
      <h3 className="text-[22px] font-bold tracking-[-0.2px] text-[#0d253d] mb-3">{title}</h3>
      <p className="text-[16px] font-normal text-[#64748d] leading-relaxed">{description}</p>
    </motion.div>
  );
}
```

---

### Task 2: Playful Layout Components

**Files:**
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/GradientMesh.jsx`

- [ ] **Step 1: Softer Navbar edges and medium weights**
```javascript
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
```

- [ ] **Step 2: Increase blob sizes for GradientMesh**
```javascript
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
      duration: 15, // Faster drift
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      <motion.div animate={drift.animate} transition={drift.transition} className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] rounded-full bg-[#f5e9d4] blur-[100px] opacity-70" />
      <motion.div animate={drift.animate} transition={{ ...drift.transition, duration: 18, delay: 2 }} className="absolute -top-[10%] left-[30%] w-[60%] h-[60%] rounded-full bg-[#9b6829] blur-[120px] opacity-40" />
      <motion.div animate={drift.animate} transition={{ ...drift.transition, duration: 16, delay: 5 }} className="absolute -top-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[#f96bee] blur-[100px] opacity-50" />
      <motion.div animate={drift.animate} transition={{ ...drift.transition, duration: 20, delay: 1 }} className="absolute top-[25%] -left-[10%] w-[55%] h-[55%] rounded-full bg-[#665efd] blur-[100px] opacity-40" />
      <motion.div animate={drift.animate} transition={{ ...drift.transition, duration: 22, delay: 4 }} className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#1c1e54] blur-[100px] opacity-30" />
      <motion.div animate={drift.animate} transition={{ ...drift.transition, duration: 17, delay: 3 }} className="absolute top-[45%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[#ea2261] blur-[100px] opacity-50" />
    </div>
  );
}
```

---

### Task 3: Energetic Home Page Styling

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Bump font weights and increase section spacing**
```javascript
// Change h1 to font-bold or font-extrabold
<motion.h1 
  variants={itemVariants}
  className="text-[52px] md:text-[80px] font-bold tracking-[-3px] text-[#0d253d] leading-[1] mb-8"
>
  Play Spyfall, <span className="text-[#533afd]">anywhere.</span>
</motion.h1>

// Change p to font-normal
<motion.p 
  variants={itemVariants}
  className="text-[22px] md:text-[32px] font-normal tracking-[-0.5px] text-[#273951] mb-16 max-w-[700px] mx-auto leading-tight"
>
  A free browser-based social deduction game. No accounts, no installs, just pure deception.
</motion.p>
```

---

### Task 4: Verification

- [ ] **Step 1: Check bounce feel**
Interact with buttons and hover cards to ensure the spring feel is snappy and playful.

- [ ] **Step 2: Check typography energy**
Verify that the bolder headlines make the page feel more like a game destination.
