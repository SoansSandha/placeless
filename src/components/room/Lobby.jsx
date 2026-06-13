import { Button } from '../Button';
import { PlayerList } from './PlayerList';

const TIMER_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 3); // 3–15 minutes

export function Lobby({ game }) {
  const { room, players, me, setTimer, startGame } = game;
  const isHost = me?.is_host;
  const canStart = players.length >= 3;
  const needed = 3 - players.length;

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="text-center mb-8">
        <p className="text-[#64748d] font-bold uppercase tracking-[2px] text-sm mb-2">Room Code</p>
        <div className="text-[56px] leading-none font-black tracking-[8px] text-[#533afd]">{room.room_code}</div>
        <p className="text-[#64748d] font-medium mt-3">Share this code so friends can join.</p>
      </div>

      <div className="bg-[#f6f9fc] p-8 rounded-[32px] border-2 border-[#e3e8ee] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-black tracking-[-0.5px] text-[#0d253d]">Players</h2>
          <span className="tnum text-sm font-bold text-[#64748d]">{players.length} / 10</span>
        </div>

        <PlayerList players={players} meId={me?.id} />

        <div className="mt-8">
          <p className="text-[#64748d] font-bold uppercase tracking-[2px] text-xs mb-3">Round length</p>
          {isHost ? (
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setTimer(min)}
                  className={`tnum w-12 h-12 rounded-full font-bold border-2 transition-colors cursor-pointer ${
                    room.timer_duration === min
                      ? 'bg-[#533afd] text-white border-[#533afd]'
                      : 'bg-white text-[#0d253d] border-[#e3e8ee] hover:border-[#533afd]'
                  }`}
                >
                  {min}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[#0d253d] font-bold">{room.timer_duration} minutes</p>
          )}
        </div>

        <div className="mt-8">
          {isHost ? (
            <Button variant="primary" className="w-full py-5 text-xl" onClick={startGame} disabled={!canStart}>
              {canStart ? 'Start Game' : `Need ${needed} more player${needed === 1 ? '' : 's'}`}
            </Button>
          ) : (
            <p className="text-center text-[#64748d] font-bold py-4">Waiting for the host to start…</p>
          )}
        </div>
      </div>
    </div>
  );
}
