import { useEffect } from 'react';
import { useDiceRollStore, warmUpDiceBox } from '../../stores/diceRollStore';

export function DiceRollOverlay() {
  const isRolling = useDiceRollStore((state) => state.isRolling);

  useEffect(() => {
    warmUpDiceBox();
  }, []);

  if (!isRolling) return null;

  return (
    <div
      className="fixed inset-0 z-[50000] flex flex-col items-center justify-end pb-16 pointer-events-none"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <p className="relative text-gold font-rpg tracking-widest text-lg animate-pulse">
        O DESTINO GIRA...
      </p>
    </div>
  );
}
