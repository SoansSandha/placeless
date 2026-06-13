import { useState, useEffect, useRef } from 'react';

// Server-anchored countdown: every client computes the same remaining time from
// the room's `started_at` + duration, so a refresh never desyncs the clock.
function computeRemaining(startedAt, durationMinutes) {
  if (!startedAt) return null;
  const end = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
  return Math.max(0, Math.round((end - Date.now()) / 1000));
}

export function Timer({ startedAt, durationMinutes, onExpire, paused = false }) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, durationMinutes));
  const firedRef = useRef(false);

  useEffect(() => {
    if (!startedAt || paused) return undefined;
    const update = () => {
      const rem = computeRemaining(startedAt, durationMinutes);
      setRemaining(rem);
      if (rem <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationMinutes, paused, onExpire]);

  const safe = remaining == null ? 0 : remaining;
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  const low = safe <= 30;

  return (
    <div
      className={`tnum text-[56px] leading-none font-black tracking-[-2px] ${low ? 'text-[#ea2261]' : 'text-[#0d253d]'}`}
    >
      {minutes}:{seconds}
    </div>
  );
}
