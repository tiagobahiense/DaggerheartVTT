import { create } from 'zustand';
import type { DieRollResult, RollNotation } from '@3d-dice/dice-box';

interface RollHandlers {
  resolve: (results: DieRollResult[]) => void;
  reject: (error: Error) => void;
}

interface DiceRollStore {
  isRolling: boolean;
  isReady: boolean;
  rollRequestId: number;
  rollNotation: RollNotation | null;
  rollHandlers: RollHandlers | null;
  setReady: (ready: boolean) => void;
  requestRoll: (notation: RollNotation) => Promise<DieRollResult[]>;
  settleRoll: (results: DieRollResult[]) => void;
  failRoll: (error: Error) => void;
}

export const useDiceRollStore = create<DiceRollStore>((set, get) => ({
  isRolling: false,
  isReady: false,
  rollRequestId: 0,
  rollNotation: null,
  rollHandlers: null,

  setReady: (ready) => set({ isReady: ready }),

  requestRoll: (notation) =>
    new Promise((resolve, reject) => {
      if (get().rollHandlers) {
        reject(new Error('Já existe uma rolagem em andamento.'));
        return;
      }

      set((state) => ({
        isRolling: true,
        rollRequestId: state.rollRequestId + 1,
        rollNotation: notation,
        rollHandlers: { resolve, reject },
      }));
    }),

  settleRoll: (results) => {
    const handlers = get().rollHandlers;
    handlers?.resolve(results);
    set({
      isRolling: false,
      rollNotation: null,
      rollHandlers: null,
    });
  },

  failRoll: (error) => {
    const handlers = get().rollHandlers;
    handlers?.reject(error);
    set({
      isRolling: false,
      rollNotation: null,
      rollHandlers: null,
    });
  },
}));

export function requestDiceRoll(notation: RollNotation): Promise<DieRollResult[]> {
  return useDiceRollStore.getState().requestRoll(notation);
}
