# Premium Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Premium" version of the Homepage using `framer-motion` for flow and Glassmorphism for depth.

**Architecture:** 
- Modular components using `motion` from `framer-motion`.
- Staggered children animations for hero content.
- Intersection Observer (via `framer-motion`'s `whileInView`) for scroll-triggered reveals.

**Tech Stack:** React 18, Tailwind CSS v4, Framer Motion.

---

### Task 1: Update Button and FeatureCard with Motion

**Files:**
- Modify: `src/components/Button.jsx`
- Modify: `src/components/FeatureCard.jsx`

- [ ] **Step 1: Wrap Button with motion**
```javascript
import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'rounded-full px-6 py-2 text-base font-normal transition-colors duration-200 cursor-pointer inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-[#533afd] text-white hover:bg-[#4434d4]',
    secondary: 'bg-white text-[#533afd] border border-[#e3e8ee] hover:bg-[#f6f9fc]',
    ghost: 'text-[#533afd] hover:bg-[#f6f9fc]'
  };
  
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 2: Update FeatureCard for scroll reveal**
```javascript
import { motion } from 'framer-motion';

export function FeatureCard({ step, title, description, delay = 0, className = '' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className={`bg-white p-8 rounded-xl border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.08)] transition-all duration-300 ${className}`}
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
```

---

### Task 2: Implement GlassNavbar and Animated GradientMesh

**Files:**
- Modify: `src/components/Navbar.jsx` (rename or update to GlassNavbar logic)
- Modify: `src/components/GradientMesh.jsx`

- [ ] **Step 1: Update Navbar with Glassmorphism and entrance motion**
```javascript
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full bg-white/70 backdrop-blur-[12px] border-b border-white/20 rounded-b-2xl"
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
            className="bg-[#533afd] text-white rounded-full px-6 py-2 text-sm font-normal cursor-pointer"
          >
            Play Now
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}
```

- [ ] **Step 2: Update GradientMesh with drifting motion**
```javascript
import { motion } from 'framer-motion';

export function GradientMesh() {
  const drift = {
    animate: {
      x: [0, 40, -40, 0],
      y: [0, -40, 40, 0],
      scale: [1, 1.1, 0.9, 1],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      <motion.div {...drift} className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#f5e9d4] blur-[100px] opacity-60" />
      <motion.div {...drift} transition={{ ...drift.transition, duration: 25, delay: 2 }} className="absolute -top-[5%] left-[30%] w-[50%] h-[50%] rounded-full bg-[#9b6829] blur-[120px] opacity-30" />
      <motion.div {...drift} transition={{ ...drift.transition, duration: 22, delay: 5 }} className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#f96bee] blur-[100px] opacity-40" />
      <motion.div {...drift} transition={{ ...drift.transition, duration: 28, delay: 1 }} className="absolute top-[20%] -left-[5%] w-[45%] h-[45%] rounded-full bg-[#665efd] blur-[100px] opacity-30" />
      <motion.div {...drift} transition={{ ...drift.transition, duration: 30, delay: 4 }} className="absolute top-[15%] right-[5%] w-[40%] h-[40%] rounded-full bg-[#1c1e54] blur-[100px] opacity-20" />
      <motion.div {...drift} transition={{ ...drift.transition, duration: 24, delay: 3 }} className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#ea2261] blur-[100px] opacity-40" />
    </div>
  );
}
```

---

### Task 3: Premium Home Page Assembly

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Implement staggered entrance for Hero content**
```javascript
import { motion } from 'framer-motion';
// ... other imports

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Inside Home component Hero:
<motion.div 
  variants={containerVariants}
  initial="hidden"
  animate="show"
  className="max-w-[800px]"
>
  <motion.h1 variants={itemVariants} className="...">Play Spyfall, anywhere.</motion.h1>
  <motion.p variants={itemVariants} className="...">...</motion.p>
  <motion.div variants={itemVariants} className="...">Buttons...</motion.div>
</motion.div>
```

---

### Task 4: Verification

- [ ] **Step 1: Verify animation flow**
Expected: 
- Page loads with staggered text entrance.
- Navbar has frosted glass effect.
- Background blobs drift slowly.
- Cards reveal smoothly on scroll.

- [ ] **Step 2: Check responsiveness and performance**
Ensure no stuttering during animations.
