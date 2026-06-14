import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import PlayHub from './pages/PlayHub';
import JoinRoom from './pages/JoinRoom';
import HowToPlay from './pages/HowToPlay';
import GameRoom from './pages/GameRoom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<PlayHub />} />
        <Route path="/play/join" element={<JoinRoom />} />
        <Route path="/play/how-to-play" element={<HowToPlay />} />
        <Route path="/room/:code" element={<GameRoom />} />
      </Routes>
      {/* Vercel Web Analytics + Speed Insights — invisible, only report on Vercel */}
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
