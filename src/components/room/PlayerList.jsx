import { motion } from 'framer-motion';

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-[#f6f9fc] text-[#64748d]',
    host: 'bg-[#b9b9f9] text-[#2e2b8c]',
    ready: 'bg-[#533afd] text-white',
  };
  return (
    <span className={`text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
}

/**
 * Shared roster. When `onSelect` is provided, rows become pill buttons (used for
 * voting); `disabledIds` keeps the current player from voting for themselves.
 */
export function PlayerList({
  players,
  meId,
  showReady = false,
  voteCounts = null,
  onSelect = null,
  disabledIds = [],
}) {
  const base =
    'w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 bg-white text-left transition-colors';

  return (
    <ul className="space-y-3">
      {players.map((p) => {
        const isMe = p.id === meId;
        const clickable = Boolean(onSelect) && !disabledIds.includes(p.id);
        const count = voteCounts ? voteCounts[p.id] || 0 : null;

        const content = (
          <>
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full bg-[#f6f9fc] flex items-center justify-center text-sm font-black text-[#533afd] shrink-0">
                {p.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-bold text-[#0d253d] truncate">
                {p.username}
                {isMe && <span className="text-[#64748d] font-medium"> (you)</span>}
              </span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {showReady && p.is_ready && <Badge tone="ready">Ready</Badge>}
              {p.is_host && <Badge tone="host">Host</Badge>}
              {count !== null && (
                <span className="tnum text-sm font-black text-[#533afd] w-6 text-right">{count}</span>
              )}
            </span>
          </>
        );

        return (
          <li key={p.id}>
            {clickable ? (
              <motion.button
                type="button"
                onClick={() => onSelect(p.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={`${base} cursor-pointer hover:border-[#533afd] ${isMe ? 'border-[#533afd]' : 'border-[#e3e8ee]'}`}
              >
                {content}
              </motion.button>
            ) : (
              <div className={`${base} ${isMe ? 'border-[#533afd]' : 'border-[#e3e8ee]'}`}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
