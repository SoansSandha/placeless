# Tailwind CSS and Typography Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Tailwind CSS v4, load Inter font, and apply global typographic settings according to DESIGN.md and GEMINI.md.

**Architecture:** Use Tailwind CSS v4 with the Vite plugin. Define custom theme tokens in CSS to match DESIGN.md specifications while ensuring all brand colors use their exact hex values.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, Google Fonts (Inter).

---

### Task 1: Configure Vite Plugin

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add Tailwind CSS Vite plugin**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

- [ ] **Step 2: Verify Vite config**
Check that the plugin is correctly imported and added to the plugins array.

---

### Task 2: Load Inter Font

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts link for Inter (300, 400)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap" rel="stylesheet">
    <title>placeless</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### Task 3: Configure Tailwind and Global Styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace index.css content with Tailwind v4 directives and theme tokens**

```css
@import "tailwindcss";

@theme {
  /* Colors from GEMINI.md */
  --color-primary: #533afd;
  --color-primary-deep: #4434d4;
  --color-primary-press: #2e2b8c;
  --color-primary-soft: #665efd;
  --color-primary-bg-subdued-hover: #b9b9f9;
  --color-brand-dark-900: #1c1e54;
  --color-ink: #0d253d;
  --color-ink-secondary: #273951;
  --color-ink-mute: #64748d;
  --color-on-primary: #ffffff;
  --color-canvas: #ffffff;
  --color-canvas-soft: #f6f9fc;
  --color-canvas-cream: #f5e9d4;
  --color-hairline: #e3e8ee;
  --color-hairline-input: #a8c3de;
  --color-ruby: #ea2261;

  /* Border Radius from GEMINI.md */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  /* Spacing from GEMINI.md */
  --spacing-xxs: 2px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-xxl: 32px;
  --spacing-huge: 64px;

  /* Typography Base */
  --font-inter: "Inter", system-ui, sans-serif;
}

@layer base {
  body {
    @apply font-inter text-ink bg-canvas;
    font-feature-settings: "ss01";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Numeric/Timer content fallback */
  .tnum {
    font-feature-settings: "tnum";
  }
}
```

- [ ] **Step 2: Verify index.css**
Ensure all default styles were replaced and new tokens match GEMINI.md exactly.

---

### Task 4: Verification

- [ ] **Step 1: Run development server**
Run: `npm run dev`
Expected: Server starts without errors.

- [ ] **Step 2: Check font loading**
Open the browser and verify (via Inspect Element) that 'Inter' is the computed font for the body and that `font-feature-settings: "ss01"` is applied.

- [ ] **Step 3: Check Tailwind classes**
Temporarily add a class like `text-primary` to a visible element in `App.jsx` and verify it turns `#533afd`.
