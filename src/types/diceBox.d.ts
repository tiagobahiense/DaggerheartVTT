declare module '@3d-dice/dice-box' {
  export interface RollObject {
    qty: number;
    sides: number;
    theme?: string;
    themeColor?: string;
    modifier?: number;
  }

  export type RollNotation = string | RollObject | Array<string | RollObject>;

  export interface DieRollResult {
    value: number;
    sides?: number;
    qty?: number;
    groupId?: number;
    rollId?: number;
    theme?: string;
    themeColor?: string;
  }

  export interface DiceBoxConfig {
    id?: string;
    assetPath: string;
    container?: string | HTMLElement | null;
    theme?: string;
    themeColor?: string;
    scale?: number;
    gravity?: number;
    throwForce?: number;
    spinForce?: number;
    enableShadows?: boolean;
    offscreen?: boolean;
  }

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: RollNotation, options?: { theme?: string; themeColor?: string; newStartPoint?: boolean }): Promise<DieRollResult[]>;
    add(notation: RollNotation, options?: { theme?: string; themeColor?: string; newStartPoint?: boolean }): Promise<DieRollResult[]>;
    clear(): Promise<void>;
    show(): void;
    hide(className?: string): void;
    onRollComplete?: (results: DieRollResult[]) => void;
  }
}
