import { create } from 'zustand';
import type { DieRollResult, RollNotation } from '@3d-dice/dice-box';
import { preloadDiceBox, rollWithDiceBox } from '../lib/diceBoxService';

interface DiceRollStore {
  isRolling: boolean;
  isReady: boolean;
  requestRoll: (notation: RollNotation) => Promise<DieRollResult[]>;
  markReady: () => void;
}

export const useDiceRollStore = create<DiceRollStore>((set, get) => ({
  isRolling: false,
  isReady: false,

  markReady: () => set({ isReady: true }),

  requestRoll: async (notation) => {
    if (get().isRolling) {
      throw new Error('Já existe uma rolagem em andamento.');
    }

    set({ isRolling: true });

    try {
      const results = await rollWithDiceBox(notation);
      set({ isRolling: false, isReady: true });
      return results;
    } catch (error) {
      set({ isRolling: false });
      throw error;
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
