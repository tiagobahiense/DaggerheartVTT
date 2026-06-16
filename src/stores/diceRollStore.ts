import { create } from 'zustand';
import type { DieRollResult, RollNotation } from '@3d-dice/dice-box';
import { preloadDiceBox, resetDiceBox, rollWithDiceBox } from '../lib/diceBoxService';

interface DiceRollStore {
  isRolling: boolean;
  isReady: boolean;
  requestRoll: (notation: RollNotation) => Promise<DieRollResult[]>;
  markReady: () => void;
}

const ROLL_TIMEOUT_MS = 15000;

export const useDiceRollStore = create<DiceRollStore>((set, get) => ({
  isRolling: false,
  isReady: false,

  markReady: () => set({ isReady: true }),

  requestRoll: async (notation) => {
    if (get().isRolling) {
      throw new Error('Já existe uma rolagem em andamento.');
    }

    set({ isRolling: true });

    const timeoutId = window.setTimeout(() => {
      if (!get().isRolling) return;
      console.warn('Rolagem excedeu o tempo limite; liberando lock e reiniciando dados 3D.');
      set({ isRolling: false });
      void resetDiceBox();
    }, ROLL_TIMEOUT_MS);

    try {
      const results = await rollWithDiceBox(notation);
      set({ isRolling: false, isReady: true });
      return results;
    } catch (error) {
      set({ isRolling: false });
      await resetDiceBox();
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  },
}));

export function requestDiceRoll(notation: RollNotation): Promise<DieRollResult[]> {
  return useDiceRollStore.getState().requestRoll(notation);
}

export function warmUpDiceBox(): void {
  preloadDiceBox().then((ok) => {
    if (ok) useDiceRollStore.getState().markReady();
  });
}
