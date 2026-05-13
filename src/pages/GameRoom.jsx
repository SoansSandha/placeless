import { useParams } from 'react-router-dom';

export default function GameRoom() {
  const { code } = useParams();
  
  return (
    <div className="p-huge flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-display-xxl text-ink mb-md">Room: {code}</h1>
      <p className="text-display-md text-ink-secondary">Game Room Placeholder</p>
    </div>
  );
}
