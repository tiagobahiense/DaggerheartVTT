import type { DieRollResult, RollNotation, RollObject } from '@3d-dice/dice-box';
import { requestDiceRoll } from '../stores/diceRollStore';

export const HOPE_D12_COLOR = '#D4AF37';
export const FEAR_D12_COLOR = '#7C3AED';
export const ADVANTAGE_D6_COLOR = '#22C55E';
export const DISADVANTAGE_D6_COLOR = '#EF4444';

export function extractDieValues(results: DieRollResult[]): number[] {
  return results.map((die) => resolveDieValue(die.value, die.sides));
}

function resolveDieValue(raw: number | undefined | null, sides?: number): number {
  const max = sides && sides > 0 ? sides : 12;
  if (typeof raw === 'number' && raw >= 1 && raw <= max) return raw;
  return rollFallback(max);
}

export function buildDualityNotation(
  advantage: 'none' | 'advantage' | 'disadvantage' = 'none'
): RollObject[] {
  const notation: RollObject[] = [
    { qty: 1, sides: 12, themeColor: HOPE_D12_COLOR },
    { qty: 1, sides: 12, themeColor: FEAR_D12_COLOR },
  ];

  if (advantage === 'advantage') {
    notation.push({ qty: 1, sides: 6, themeColor: ADVANTAGE_D6_COLOR });
  } else if (advantage === 'disadvantage') {
    notation.push({ qty: 1, sides: 6, themeColor: DISADVANTAGE_D6_COLOR });
  }

  return notation;
}

export function buildStandardNotation(count: number, sides: number): RollNotation {
  return { qty: count, sides };
}

export async function rollDualityPair(
  advantage: 'none' | 'advantage' | 'disadvantage' = 'none'
): Promise<{ hope: number; fear: number; advRoll: number }> {
  try {
    const results = await requestDiceRoll(buildDualityNotation(advantage));
    const hope = resolveDieValue(results[0]?.value, results[0]?.sides ?? 12);
    const fear = resolveDieValue(results[1]?.value, results[1]?.sides ?? 12);
    const advRoll = advantage !== 'none'
      ? resolveDieValue(results[2]?.value, results[2]?.sides ?? 6)
      : 0;
    return { hope, fear, advRoll };
  } catch (error) {
    console.warn('Rolagem 3D indisponível, usando fallback:', error);
    const hope = rollFallback(12);
    const fear = rollFallback(12);
    const advRoll = advantage !== 'none' ? rollFallback(6) : 0;
    return { hope, fear, advRoll };
  }
}

export async function rollStandardDice(count: number, sides: number): Promise<number[]> {
  try {
    const results = await requestDiceRoll(buildStandardNotation(count, sides));
    return results.map((die, index) =>
      resolveDieValue(die.value, die.sides ?? sides)
    );
  } catch (error) {
    console.warn('Rolagem 3D indisponível, usando fallback:', error);
    return Array.from({ length: count }, () => rollFallback(sides));
  }
}

export async function rollDamageDice(
  proficiency: number,
  dieSides: number,
  isCritical: boolean
): Promise<number[]> {
  const count = Math.max(1, proficiency);

  try {
    const results = await requestDiceRoll({ qty: count, sides: dieSides });
    const rolls = results.map((die) => resolveDieValue(die.value, die.sides ?? dieSides));

    if (!isCritical) return rolls;

    const maxRoll = Array.from({ length: count }, () => dieSides);
    return [...maxRoll, ...rolls];
  } catch (error) {
    console.warn('Rolagem 3D indisponível, usando fallback:', error);
    const rolls = Array.from({ length: count }, () => rollFallback(dieSides));
    if (!isCritical) return rolls;
    return [...Array.from({ length: count }, () => dieSides), ...rolls];
  }
}

export function computeDualityOutcome(hope: number, fear: number): 'CRITICAL' | 'HOPE' | 'FEAR' {
  if (hope === fear) return 'CRITICAL';
  if (hope > fear) return 'HOPE';
  return 'FEAR';
}

function rollFallback(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}
