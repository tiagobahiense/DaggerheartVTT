import { useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import '@3d-dice/dice-box/dist/style.css';
import { useDiceRollStore } from '../../stores/diceRollStore';

export function DiceRollOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceBoxRef = useRef<DiceBox | null>(null);
  const initStartedRef = useRef(false);

  const {
    isRolling,
    isReady,
    rollRequestId,
    rollNotation,
    setReady,
    settleRoll,
    failRoll,
  } = useDiceRollStore();

  useEffect(() => {
    if (!containerRef.current || initStartedRef.current) return;
    initStartedRef.current = true;

    const box = new DiceBox({
      container: containerRef.current,
      assetPath: '/assets/',
      theme: 'default',
      scale: 5,
      throwForce: 8,
      spinForce: 5,
      enableShadows: true,
      offscreen: true,
    });

    diceBoxRef.current = box;

    box
      .init()
      .then(() => {
        box.hide();
        setReady(true);
      })
      .catch((error: unknown) => {
        console.error('Falha ao inicializar dados 3D:', error);
        setReady(false);
      });
  }, [setReady]);

  useEffect(() => {
    if (!rollNotation) return;

    const timeout = window.setTimeout(() => {
      if (!useDiceRollStore.getState().isReady) {
        failRoll(new Error('Dados 3D indisponíveis'));
      }
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [rollRequestId, rollNotation, failRoll]);

  useEffect(() => {
    if (!rollNotation || !isReady || !diceBoxRef.current) return;

    let cancelled = false;

    const runRoll = async () => {
      const box = diceBoxRef.current;
      if (!box) return;

      try {
        await box.clear();
        box.show();
        const results = await box.roll(rollNotation);
        if (!cancelled) settleRoll(results);
      } catch (error) {
        if (!cancelled) {
          failRoll(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    runRoll();

    return () => {
      cancelled = true;
    };
  }, [rollRequestId, rollNotation, isReady, settleRoll, failRoll]);

  return (
    <div
      className={`fixed inset-0 z-[50000] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isRolling ? 'opacity-100' : 'opacity-0 invisible'
      }`}
      aria-hidden={!isRolling}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        ref={containerRef}
        className="relative w-full max-w-3xl h-72 md:h-96 mx-4"
      />
      {isRolling && (
        <p className="relative mt-2 text-gold font-rpg tracking-widest text-lg animate-pulse">
          O DESTINO GIRA...
        </p>
      )}
    </div>
  );
}
