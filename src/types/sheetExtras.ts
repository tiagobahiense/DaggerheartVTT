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

/** Condições oficiais Daggerheart — aplicadas pelo Mestre nos tokens */
export type ConditionId =
  // Principais
  | 'hidden'
  | 'immobilized'
  | 'vulnerable'
  // Únicas e especiais
  | 'shaken'
  | 'asleep'
  | 'restrained'
  | 'stunned'
  | 'dissociated'
  | 'charmed'
  | 'unconscious'
  | 'incorporeal'
  | 'invisible'
  | 'oculto'
  | 'protected'
  // Colosso (segmentos)
  | 'broken'
  | 'collapsed'
  | 'destroyed';

export type ConditionCategory = 'principal' | 'special' | 'colossus';

export interface ICharacterConditions {
  active: ConditionId[];
}

export interface ISheetExtras {
  sheetMarkers?: ISheetMarker[];
}
