import { CONDITION_MAP } from '../data/conditions';
import { ConditionId } from '../types/sheetExtras';

interface MapTokenLike {
  id: string;
  charId?: string;
  type?: string;
  conditions?: { active?: ConditionId[] };
}

export function findCharacterToken(
  tokens: MapTokenLike[] | undefined,
  charId: string
): MapTokenLike | undefined {
  if (!tokens?.length || !charId) return undefined;
  return tokens.find(
    (t) =>
      t.charId === charId &&
      (t.type === 'player' || t.type === 'companion')
  );
}

export function getConditionsForCharacter(
  tokens: MapTokenLike[] | undefined,
  charId: string
): ConditionId[] {
  return findCharacterToken(tokens, charId)?.conditions?.active || [];
}

export function getPrimaryConditionId(conditions: ConditionId[]): ConditionId | null {
  const priority: ConditionId[] = [
    'oculto', 'hidden', 'invisible', 'incorporeal',
    'vulnerable', 'protected', 'stunned', 'unconscious', 'asleep',
    'immobilized', 'charmed', 'dissociated', 'restrained', 'shaken',
  ];
  for (const id of priority) {
    if (conditions.includes(id)) return id;
  }
  return conditions[0] ?? null;
}

export function getPrimaryAuraClass(conditions: ConditionId[]): string {
  const id = getPrimaryConditionId(conditions);
  if (!id) return '';
  return CONDITION_MAP[id]?.auraClass || 'condition-aura-generic';
}
