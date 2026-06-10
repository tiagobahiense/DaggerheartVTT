import { ConditionId } from '../types/sheetExtras';

export interface ConditionDefinition {
  id: ConditionId;
  label: string;
  shortLabel: string;
  color: string;
  borderColor: string;
  description: string;
  rollHint?: 'advantage' | 'disadvantage';
}

export const CONDITIONS: ConditionDefinition[] = [
  {
    id: 'vulnerable',
    label: 'Vulnerável',
    shortLabel: 'VUL',
    color: 'text-red-300',
    borderColor: 'border-red-500/40 bg-red-900/20',
    description: 'Testes contra o alvo têm Vantagem.',
    rollHint: 'advantage',
  },
  {
    id: 'immobilized',
    label: 'Imobilizado',
    shortLabel: 'IMO',
    color: 'text-blue-300',
    borderColor: 'border-blue-500/40 bg-blue-900/20',
    description: 'Não pode sair do lugar.',
  },
  {
    id: 'hidden',
    label: 'Escondido',
    shortLabel: 'ESC',
    color: 'text-gray-300',
    borderColor: 'border-gray-500/40 bg-gray-900/20',
    description: 'Testes contra o alvo têm Desvantagem.',
    rollHint: 'disadvantage',
  },
  {
    id: 'oculto',
    label: 'Oculto',
    shortLabel: 'OCL',
    color: 'text-indigo-300',
    borderColor: 'border-indigo-500/40 bg-indigo-900/20',
    description: 'Invisível até se mover ou atacar.',
    rollHint: 'disadvantage',
  },
  {
    id: 'direct_damage',
    label: 'Dano Direto',
    shortLabel: 'DD',
    color: 'text-yellow-300',
    borderColor: 'border-yellow-500/40 bg-yellow-900/20',
    description: 'Ignora armadura.',
  },
];

export const CONDITION_MAP = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c])
) as Record<ConditionId, ConditionDefinition>;
