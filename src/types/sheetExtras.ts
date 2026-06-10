// Tipos para marcadores de ficha e condições de combate

export type SheetMarkerType = 'number' | 'dice' | 'counter' | 'text';

export type SheetMarkerSource = 'class' | 'community' | 'custom';

export interface ISheetMarker {
  id: string;
  key: string;
  label: string;
  type: SheetMarkerType;
  value: number;
  min?: number;
  max?: number;
  dieSides?: number;
  note?: string;
  source: SheetMarkerSource;
  isClassSpecific?: boolean;
  description?: string;
}

export type ConditionId =
  | 'vulnerable'
  | 'immobilized'
  | 'hidden'
  | 'direct_damage'
  | 'oculto';

export interface ICharacterConditions {
  active: ConditionId[];
}

export interface ISheetExtras {
  sheetMarkers?: ISheetMarker[];
  conditions?: ICharacterConditions;
}
