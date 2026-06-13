# Homepage Design Spec (Premium Rework)

**Goal:** Transform the Placeless Homepage into a high-end, interactive "premium" experience using `framer-motion` and Glassmorphism, while maintaining the "Stripi" inspired core identity.

**Architecture:** 
- `Home.jsx`: Orchestrates the page layout and scroll-triggered animations.
- `GradientMesh.jsx`: Uses `framer-motion` for slow, organic drifting blobs.
- `GlassNavbar.jsx`: Implements a fixed frosted-glass navigation bar.
- `MotionCard.jsx`: Reusable card component with hover-lift and scroll-reveal effects.

## 1. Components & Layout

### GlassNavbar
- **Style:** `bg-white/70 backdrop-blur-[12px] border-b border-white/20 sticky top-0 z-50`.
- **Motion:** Fades in from top on page load.

### Hero Section (`GradientMesh.jsx`)
- **Drift Animation:** Blobs use `animate={{ x: [...], y: [...] }}` with `duration: 20-30s` and `repeat: Infinity` to create a living background.
- **Hero Content:** 
  - Headline uses "Split-Text" or staggered word reveal.
  - Subheadline and CTAs follow with a `0.2s` delay stagger.

### Features Strip
- **Motion:** Subtle fade-in as the user reaches the hero bottom.

### How to Play (Motion Grid)
- **Scroll Reveal:** Cards slide up and fade in one-by-one as they enter the viewport using `viewport={{ once: true }}`.
- **Card Style:** Enhanced `card-feature-light` with `hover:scale-[1.02] hover:shadow-xl transition-all duration-300`.

### Premium Testimonials
- **Carousel/Slider:** A smooth horizontal auto-sliding testimonial section using `framer-motion`'s `AnimatePresence`.

## 2. Updated Design Tokens (Tailwind)
- **Glass:** `bg-white/70 backdrop-blur-md border border-white/20`.
- **Motion Durations:**
  - Micro-interactions: `0.2s` (150-300ms range).
  - Entrance animations: `0.6s` to `0.8s` for smoothness.
  - Background drifts: `20s+`.

---
**Spec Review:**
- Implements `framer-motion` for "flow".
- Replaces static sections with scroll-triggered reveals.
- Uses Glassmorphism for depth.
- Adheres to `ui-ux-pro-max` severity rules (avoiding distracting continuous motion, sticking to 150-300ms for UI triggers).
