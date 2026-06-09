import { useEffect, useRef, useState } from 'react';
import { Fire, Skull } from '@phosphor-icons/react';
import { playFearAlertSound, playFearTokenSound } from '../lib/fearAudio';
import { markFearEventSeen, parseFearEvent, shouldShowFearAlert } from '../lib/fearEvents';

const MAX_FEAR_TOKENS = 10;

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

interface PlayerFearStashProps {
  tokens: number;
}

export function PlayerFearStash({ tokens }: PlayerFearStashProps) {
  const prevTokens = useRef(tokens);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tokens > prevTokens.current) {
      setHighlightIndex(tokens - 1);
      playFearTokenSound();
      const timer = setTimeout(() => setHighlightIndex(null), 900);
      prevTokens.current = tokens;
      return () => clearTimeout(timer);
    }
    prevTokens.current = tokens;
  }, [tokens]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[45] pointer-events-none animate-fade-in">
      <div className="bg-[#1a0b2e]/90 border-2 border-purple-500/40 rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(168,85,247,0.25)] backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Skull size={18} weight="fill" className="text-purple-400" />
          <h3 className="text-purple-300 font-rpg text-sm uppercase tracking-widest">Medo do Mestre</h3>
          <span className="text-purple-200/80 text-xs font-bold bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30">
            {tokens}/{MAX_FEAR_TOKENS}
          </span>
        </div>
        <FearTokenGrid count={tokens} readOnly compact highlightIndex={highlightIndex} />
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
