import { useState, useEffect, useRef } from 'react';

// Server-anchored countdown: every client computes the same remaining time from
// the room's `started_at` + duration. `offsetMs` (serverNow - clientNow) corrects
// for a skewed local clock so the timer reaches 0 exactly when the server's expiry
// gate opens — otherwise a client running fast would sit at 00:00 until the server
// caught up. A refresh never desyncs the clock either.
function computeRemaining(startedAt, durationMinutes, offsetMs) {
  if (!startedAt) return null;
  const end = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
  return Math.max(0, Math.round((end - (Date.now() + offsetMs)) / 1000));
}

export function Timer({ startedAt, durationMinutes, onExpire, paused = false, offsetMs = 0 }) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, durationMinutes, offsetMs));
  const lastFiredRef = useRef(0);

  useEffect(() => {
    if (!startedAt || paused) return undefined;
    const update = () => {
      const rem = computeRemaining(startedAt, durationMinutes, offsetMs);
      setRemaining(rem);
      if (rem <= 0) {
        // Fire on reaching zero, then retry every 5s while still mounted at zero.
        // The expiry RPC is server-time-gated, so a client clock running slightly
        // ahead would no-op the first call — retrying avoids a stuck round.
        const now = Date.now();
        if (now - lastFiredRef.current >= 5000) {
          lastFiredRef.current = now;
          onExpire?.();
        }
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationMinutes, paused, onExpire, offsetMs]);

  const safe = remaining == null ? 0 : remaining;
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  const low = safe <= 30;

  return (
    <div
      className={`tnum text-[56px] leading-none font-black tracking-[-2px] ${low ? 'text-[#ea2261]' : 'text-[#0d253d] dark:text-[#eef1fb]'}`}
    >
      {minutes}:{seconds}
    </div>
  );
}
