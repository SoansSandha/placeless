import { motion } from 'framer-motion';

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-[#f6f9fc] dark:bg-[#1c1e54] text-[#64748d] dark:text-[#8b95b8]',
    host: 'bg-[#b9b9f9] text-[#2e2b8c]',
    ready: 'bg-[#533afd] text-white',
    vote: 'bg-[#f5e9d4] dark:bg-[#2e2616] text-[#273951] dark:text-[#f5e9d4]',
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
  showScore = false,
  showVoteCall = false,
  voteCounts = null,
  onSelect = null,
  onPromote = null,
  disabledIds = [],
}) {
  const base =
    'w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 bg-white dark:bg-[#14163a] text-left transition-colors';

  return (
    <ul className="space-y-3">
      {players.map((p) => {
        const isMe = p.id === meId;
        const clickable = Boolean(onSelect) && !disabledIds.includes(p.id);
        const count = voteCounts ? voteCounts[p.id] || 0 : null;

        const content = (
          <>
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full bg-[#f6f9fc] dark:bg-[#1c1e54] flex items-center justify-center text-sm font-black text-[#533afd] shrink-0">
                {p.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-bold text-[#0d253d] dark:text-[#eef1fb] truncate">
                {p.username}
                {isMe && <span className="text-[#64748d] dark:text-[#8b95b8] font-medium"> (you)</span>}
              </span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {showReady && p.is_ready && <Badge tone="ready">Ready</Badge>}
              {showVoteCall && p.wants_vote && <Badge tone="vote">Wants vote</Badge>}
              {p.is_host && <Badge tone="host">Host</Badge>}
              {showScore && (
                <span className="tnum text-sm font-black text-[#0d253d] dark:text-[#eef1fb]">
                  {p.score ?? 0}
                  <span className="text-[#64748d] dark:text-[#8b95b8] font-bold text-xs"> pts</span>
                </span>
              )}
              {count !== null && (
                <span className="tnum text-sm font-black text-[#533afd] w-6 text-right">{count}</span>
              )}
              {onPromote && !onSelect && !isMe && !p.is_host && (
                <motion.button
                  type="button"
                  onClick={() => onPromote(p.id)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="text-[11px] font-bold uppercase tracking-[1px] px-3 py-1 rounded-full border-2 border-[#e3e8ee] dark:border-[#2a2d5c] text-[#533afd] hover:border-[#533afd] dark:hover:border-[#665efd] cursor-pointer"
                >
                  Make host
                </motion.button>
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
                className={`${base} cursor-pointer hover:border-[#533afd] dark:hover:border-[#665efd] ${isMe ? 'border-[#533afd]' : 'border-[#e3e8ee] dark:border-[#2a2d5c]'}`}
              >
                {content}
              </motion.button>
            ) : (
              <div className={`${base} ${isMe ? 'border-[#533afd]' : 'border-[#e3e8ee] dark:border-[#2a2d5c]'}`}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
