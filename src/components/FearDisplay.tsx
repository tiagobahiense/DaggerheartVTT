import { useEffect, useRef, useState } from 'react';
import { Fire, Skull, Minus, ArrowsOutSimple } from '@phosphor-icons/react';
import { playFearAlertSound, playFearTokenSound } from '../lib/fearAudio';
import { markFearEventSeen, parseFearEvent, shouldShowFearAlert } from '../lib/fearEvents';

const MAX_FEAR_TOKENS = 10;
const FEAR_MINIMIZED_KEY = 'fear-stash-minimized';

interface FearTokenGridProps {
  count: number;
  readOnly?: boolean;
  onToggle?: (index: number) => void;
  highlightIndex?: number | null;
  compact?: boolean;
}

export function FearTokenGrid({ count, readOnly = false, onToggle, highlightIndex = null, compact = false }: FearTokenGridProps) {
  const slotSize = compact ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = compact ? 14 : 20;

  return (
    <div className={`grid grid-cols-5 ${compact ? 'gap-2' : 'gap-3'} place-items-center`}>
      {Array.from({ length: MAX_FEAR_TOKENS }).map((_, i) => {
        const filled = i < count;
        const isHighlighted = highlightIndex === i;
        const baseClass = `${slotSize} rounded-full border border-purple-500/30 flex items-center justify-center transition-all duration-300`;
        const filledClass = filled ? 'bg-purple-600 shadow-[0_0_15px_#a855f7]' : 'bg-black/50';
        const pulseClass = isHighlighted ? 'animate-pulse scale-125 ring-2 ring-purple-300' : '';

        if (readOnly) {
          return (
            <div key={i} className={`${baseClass} ${filledClass} ${pulseClass}`}>
              {filled && <Fire size={iconSize} weight="fill" className="text-white animate-pulse" />}
            </div>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle?.(i)}
            className={`${baseClass} ${filledClass} ${pulseClass} hover:border-purple-400`}
          >
            {filled && <Fire size={iconSize} weight="fill" className="text-white animate-pulse" />}
          </button>
        );
      })}
    </div>
  );
}

export function FearUseOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full flex flex-col items-center animate-ds-text">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4c1d95] to-transparent shadow-[0_0_20px_#8b5cf6]" />
        <h1 className="font-rpg text-5xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-900 uppercase tracking-[0.2em] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] py-4 text-center">
          O MESTRE USOU O MEDO
        </h1>
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4c1d95] to-transparent shadow-[0_0_20px_#8b5cf6]" />
      </div>
    </div>
  );
}

function FearTokenBar({
  count,
  highlightIndex = null,
}: {
  count: number;
  highlightIndex?: number | null;
}) {
  return (
    <div className="flex gap-0.5 w-full min-w-[72px] sm:min-w-[96px]">
      {Array.from({ length: MAX_FEAR_TOKENS }).map((_, i) => {
        const filled = i < count;
        const isHighlighted = highlightIndex === i;
        return (
          <div
            key={i}
            className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              filled ? 'bg-purple-500 shadow-[0_0_6px_#a855f7]' : 'bg-white/10'
            } ${isHighlighted ? 'ring-1 ring-purple-300 scale-y-150' : ''}`}
          />
        );
      })}
    </div>
  );
}

interface PlayerFearStashProps {
  tokens: number;
}

export function PlayerFearStash({ tokens }: PlayerFearStashProps) {
  const prevTokens = useRef(tokens);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(
    () => localStorage.getItem(FEAR_MINIMIZED_KEY) === 'true'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem(FEAR_MINIMIZED_KEY, String(isMinimized));
  }, [isMinimized]);

  useEffect(() => {
    if (tokens > prevTokens.current) {
      setHighlightIndex(tokens - 1);
      playFearTokenSound();
      setIsMinimized(false);
      const timer = setTimeout(() => setHighlightIndex(null), 900);
      prevTokens.current = tokens;
      return () => clearTimeout(timer);
    }
    prevTokens.current = tokens;
  }, [tokens]);

  const positionClass =
    'fixed top-[4.75rem] right-3 sm:top-24 sm:right-6 z-[45] pointer-events-auto animate-fade-in';

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className={`${positionClass} group flex items-center gap-1.5 bg-[#1a0b2e]/90 border border-purple-500/40 rounded-full pl-1.5 pr-2.5 py-1 shadow-[0_0_12px_rgba(168,85,247,0.2)] backdrop-blur-md hover:border-purple-400/60 transition-colors`}
        title="Medo do Mestre — expandir"
      >
        <div className="relative w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center">
          <Skull size={14} weight="fill" className="text-purple-400" />
          {tokens > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center border border-purple-300/50">
              {tokens}
            </span>
          )}
        </div>
        <ArrowsOutSimple size={12} className="text-purple-300/50 group-hover:text-purple-200" />
      </button>
    );
  }

  return (
    <div className={positionClass}>
      <div className="bg-[#1a0b2e]/90 border border-purple-500/40 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md max-w-[calc(100vw-1.5rem)]">
        <div className="flex items-center gap-2">
          <Skull size={14} weight="fill" className="text-purple-400 shrink-0" />
          <span className="text-purple-300 font-rpg text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">
            Medo
          </span>
          <span className="text-purple-200/90 text-[10px] sm:text-xs font-bold tabular-nums">
            {tokens}/{MAX_FEAR_TOKENS}
          </span>
          <div className="flex-1 min-w-0 hidden sm:block">
            {!isExpanded && <FearTokenBar count={tokens} highlightIndex={highlightIndex} />}
          </div>
          <div className="flex items-center gap-0.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="p-1 text-purple-300/40 hover:text-purple-200 rounded hover:bg-white/5 transition-colors"
              title={isExpanded ? 'Recolher' : 'Ver fichas'}
            >
              <ArrowsOutSimple
                size={12}
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setIsMinimized(true);
              }}
              className="p-1 text-purple-300/40 hover:text-purple-200 rounded hover:bg-white/5 transition-colors"
              title="Minimizar"
            >
              <Minus size={12} weight="bold" />
            </button>
          </div>
        </div>

        <div className="mt-1.5 sm:hidden">
          {!isExpanded && <FearTokenBar count={tokens} highlightIndex={highlightIndex} />}
        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-purple-500/20">
            <FearTokenGrid count={tokens} readOnly compact highlightIndex={highlightIndex} />
          </div>
        )}
      </div>
    </div>
  );
}

export function useFearAlertListener(
  fearData: unknown,
  setVisible: (visible: boolean) => void
) {
  const lastHandledId = useRef<string | null>(null);

  const eventId =
    fearData && typeof fearData === 'object' && 'last_event_id' in fearData
      ? (fearData as { last_event_id?: string }).last_event_id
      : null;
  const legacyTrigger =
    fearData && typeof fearData === 'object' && 'last_trigger' in fearData
      ? (fearData as { last_trigger?: number }).last_trigger
      : null;

  useEffect(() => {
    const event = parseFearEvent(fearData);
    if (!event?.id || !shouldShowFearAlert(event, false)) return;
    if (lastHandledId.current === event.id) return;

    lastHandledId.current = event.id;
    markFearEventSeen(event.id);
    playFearAlertSound();
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [eventId, legacyTrigger, fearData, setVisible]);
}

export function triggerFearAlertLocally(setVisible: (visible: boolean) => void) {
  playFearAlertSound();
  setVisible(true);
  setTimeout(() => setVisible(false), 5000);
}
