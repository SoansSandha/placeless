// Compact role/location card shown for the whole round (above the player list).
export function RoleCard({ isSpy, location }) {
  if (isSpy) {
    return (
      <div className="rounded-3xl border-2 border-[#1c1e54] bg-[#1c1e54] px-6 py-5 text-center shadow-lg">
        <p className="uppercase tracking-[3px] text-xs font-bold text-[#f96bee] mb-1">Your role</p>
        <p className="text-[24px] font-black tracking-[-0.5px] text-white">You are the Spy</p>
      </div>
    );
  }
  if (!location) {
    return (
      <div className="rounded-3xl border-2 border-[#e3e8ee] dark:border-[#2a2d5c] bg-white dark:bg-[#14163a] px-6 py-5 text-center shadow-lg">
        <p className="text-[#64748d] dark:text-[#8b95b8] font-bold">Revealing the location…</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-[#e3e8ee] dark:border-[#2a2d5c] bg-white dark:bg-[#14163a] px-6 py-5 text-center shadow-lg">
      <p className="uppercase tracking-[3px] text-xs font-bold text-[#533afd] mb-1">The location is</p>
      <p className="text-[24px] font-black tracking-[-0.5px] text-[#0d253d] dark:text-[#eef1fb]">{location}</p>
    </div>
  );
}
