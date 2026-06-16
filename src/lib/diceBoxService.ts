import type DiceBox from '@3d-dice/dice-box';
import type { DieRollResult, RollNotation, RollObject } from '@3d-dice/dice-box';

export const DICE_CONTAINER_ID = 'daggerheart-dice-canvas';

let diceBox: DiceBox | null = null;
let initPromise: Promise<DiceBox> | null = null;

export async function resetDiceBox(): Promise<void> {
  if (diceBox) {
    try {
      await diceBox.clear();
    } catch {
      /* ignore */
    }
    diceBox = null;
  }
  initPromise = null;
}

function ensureContainer(): HTMLElement {
  let container = document.getElementById(DICE_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = DICE_CONTAINER_ID;
    container.className = 'dice-roll-canvas-host';
    document.body.appendChild(container);
  }
  return container;
}

function setContainerVisible(visible: boolean) {
  const container = ensureContainer();
  container.classList.toggle('dice-roll-canvas-host--visible', visible);
}

async function createDiceBox(): Promise<DiceBox> {
  ensureContainer();

  const [{ default: DiceBoxConstructor }] = await Promise.all([
    import('@3d-dice/dice-box'),
    import('@3d-dice/dice-box/dist/style.css'),
  ]);

  const box = new DiceBoxConstructor({
    container: `#${DICE_CONTAINER_ID}`,
    assetPath: '/assets/',
    theme: 'default',
    scale: 9,
    throwForce: 9,
    spinForce: 6,
    startingHeight: 12,
    settleTimeout: 3500,
    enableShadows: true,
    offscreen: true,
  });

  await box.init();
  box.hide();
  return box;
}

export async function preloadDiceBox(): Promise<boolean> {
  try {
    await getDiceBox();
    return true;
  } catch (error) {
    console.warn('Pré-carga dos dados 3D falhou:', error);
    return false;
  }
}

export async function getDiceBox(): Promise<DiceBox> {
  if (diceBox) return diceBox;
  if (!initPromise) {
    initPromise = createDiceBox()
      .then((box) => {
        diceBox = box;
        return box;
      })
      .catch((error) => {
        initPromise = null;
        throw error;
      });
  }
  return initPromise;
}

export function isDiceBoxReady(): boolean {
  return diceBox !== null;
}

function expandNotationSides(notation: RollNotation): number[] {
  if (typeof notation === 'string') return [];

  const items = Array.isArray(notation) ? notation : [notation];
  const sides: number[] = [];

  for (const item of items) {
    if (typeof item === 'string') continue;
    const roll = item as RollObject;
    for (let i = 0; i < roll.qty; i++) sides.push(roll.sides);
  }

  return sides;
}

export function areDiceResultsValid(
  results: DieRollResult[],
  expectedSides: number[]
): boolean {
  if (expectedSides.length === 0) {
    return results.every(
      (die) =>
        typeof die.value === 'number' &&
        die.value >= 1 &&
        (die.sides == null || die.value <= die.sides)
    );
  }

  if (results.length < expectedSides.length) return false;

  return expectedSides.every((sides, index) => {
    const value = results[index]?.value;
    return typeof value === 'number' && value >= 1 && value <= sides;
  });
}

async function executeRoll(notation: RollNotation): Promise<DieRollResult[]> {
  const box = await getDiceBox();

  setContainerVisible(true);
  await box.clear();
  box.show();

  try {
    return await box.roll(notation);
  } finally {
    box.hide();
    setContainerVisible(false);
  }
}

export async function rollWithDiceBox(notation: RollNotation): Promise<DieRollResult[]> {
  const expectedSides = expandNotationSides(notation);

  let results = await executeRoll(notation);

  if (!areDiceResultsValid(results, expectedSides)) {
    console.warn('Rolagem 3D retornou valores inválidos, reiniciando motor de dados.');
    await resetDiceBox();
    results = await executeRoll(notation);

    if (!areDiceResultsValid(results, expectedSides)) {
      throw new Error('Rolagem 3D retornou valores inválidos após reinício.');
    }
  }

  return results;
}
