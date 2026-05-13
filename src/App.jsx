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
