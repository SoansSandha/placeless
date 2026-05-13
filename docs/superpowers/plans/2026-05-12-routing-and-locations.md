# React Router and Locations Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure React Router v6 with the routes defined in the requirements and populate the game locations data.

**Architecture:** 
- Use `BrowserRouter`, `Routes`, and `Route` in `App.jsx`.
- Create placeholder page components for each route to verify routing.
- Export a constant array of location objects from `src/data/locations.js`.

**Tech Stack:** React 18, React Router v6.

---

### Task 1: Create Placeholder Pages

**Files:**
- Create: `src/pages/Home.jsx`
- Create: `src/pages/PlayHub.jsx`
- Create: `src/pages/JoinRoom.jsx`
- Create: `src/pages/HowToPlay.jsx`
- Create: `src/pages/GameRoom.jsx`

- [ ] **Step 1: Create Home placeholder**
```javascript
export default function Home() {
  return <div className="p-8 text-display-lg">Home Page</div>;
}
```

- [ ] **Step 2: Create PlayHub placeholder**
```javascript
export default function PlayHub() {
  return <div className="p-8 text-display-lg">Play Hub</div>;
}
```

- [ ] **Step 3: Create JoinRoom placeholder**
```javascript
export default function JoinRoom() {
  return <div className="p-8 text-display-lg">Join Room</div>;
}
```

- [ ] **Step 4: Create HowToPlay placeholder**
```javascript
export default function HowToPlay() {
  return <div className="p-8 text-display-lg">How to Play</div>;
}
```

- [ ] **Step 5: Create GameRoom placeholder**
```javascript
import { useParams } from 'react-router-dom';
export default function GameRoom() {
  const { code } = useParams();
  return <div className="p-8 text-display-lg">Game Room: {code}</div>;
}
```

---

### Task 2: Configure React Router in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace App.jsx content with Router configuration**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlayHub from './pages/PlayHub';
import JoinRoom from './pages/JoinRoom';
import HowToPlay from './pages/HowToPlay';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<PlayHub />} />
        <Route path="/play/join" element={<JoinRoom />} />
        <Route path="/play/how-to-play" element={<HowToPlay />} />
        <Route path="/room/:code" element={<GameRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### Task 3: Populate Locations Data

**Files:**
- Create: `src/data/locations.js`

- [ ] **Step 1: Write the locations array**
```javascript
export const LOCATIONS = [
  "Space Station", "Pirate Ship", "Hospital", "Casino", "Beach", 
  "Police Station", "School", "Supermarket", "Movie Studio", "Military Base", 
  "Passenger Train", "Cruise Ship", "Restaurant", "Bank", "Hotel", 
  "Airport", "Museum", "Theater", "Circus", "Embassy", 
  "Submarine", "Cathedral", "Spa", "Polar Station", "Ocean Liner", 
  "Service Station", "University", "Corporate Party", "Jail", "Medieval Tournament", 
  "Coal Mine", "Vineyard", "Sports Stadium"
];
```

---

### Task 4: Verification

- [ ] **Step 1: Run development server**
Run: `npm run dev`

- [ ] **Step 2: Manually verify routes**
Navigate to `/`, `/play`, `/play/join`, `/play/how-to-play`, and `/room/TEST` to confirm correct placeholder rendering.

- [ ] **Step 3: Update status in GEMINI.md**
- [x] React Router configured in `App.jsx`
- [x] `src/data/locations.js` populated
