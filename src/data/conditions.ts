import { ConditionCategory, ConditionId } from '../types/sheetExtras';

export interface ConditionDefinition {
  id: ConditionId;
  label: string;
  shortLabel: string;
  category: ConditionCategory;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
  rollHint?: 'advantage' | 'disadvantage';
  /** Classe CSS de aura no token */
  auraClass?: string;
}

export const CONDITIONS: ConditionDefinition[] = [
  // --- Principais ---
  {
    id: 'hidden',
    label: 'Escondido',
    shortLabel: 'ESC',
    category: 'principal',
    color: 'text-slate-300',
    borderColor: 'border-slate-400/50 bg-slate-900/40',
    glowColor: 'shadow-[0_0_12px_rgba(148,163,184,0.5)]',
    auraClass: 'condition-aura-hidden',
    description: 'Fora do campo de visão dos adversários. Testes contra o alvo têm Desvantagem.',
    rollHint: 'disadvantage',
  },
  {
    id: 'immobilized',
    label: 'Imobilizado',
    shortLabel: 'IMO',
    category: 'principal',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500/50 bg-cyan-900/30',
    glowColor: 'shadow-[0_0_12px_rgba(34,211,238,0.45)]',
    auraClass: 'condition-aura-immobilized',
    description: 'Não pode se mover até a condição ser removida. Pode agir no lugar.',
  },
  {
    id: 'vulnerable',
    label: 'Vulnerável',
    shortLabel: 'VUL',
    category: 'principal',
    color: 'text-red-300',
    borderColor: 'border-red-500/50 bg-red-900/35',
    glowColor: 'shadow-[0_0_14px_rgba(239,68,68,0.55)]',
    auraClass: 'condition-aura-vulnerable',
    description: 'Alvo em situação difícil (caído, desequilibrado). Testes contra ele têm Vantagem.',
    rollHint: 'advantage',
  },
  // --- Únicas e especiais ---
  {
    id: 'shaken',
    label: 'Abalado',
    shortLabel: 'ABA',
    category: 'special',
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40 bg-amber-900/25',
    glowColor: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    auraClass: 'condition-aura-shaken',
    description: 'Não ganha Esperança em sucesso com Esperança; o sucesso remove Abalado.',
  },
  {
    id: 'asleep',
    label: 'Adormecido',
    shortLabel: 'ADR',
    category: 'special',
    color: 'text-indigo-300',
    borderColor: 'border-indigo-500/40 bg-indigo-900/30',
    glowColor: 'shadow-[0_0_14px_rgba(129,140,248,0.5)]',
    auraClass: 'condition-aura-asleep',
    description: 'Dorme até sofrer dano ou o Mestre gastar 1 Medo para encerrar.',
  },
  {
    id: 'restrained',
    label: 'Arrefecido',
    shortLabel: 'ARR',
    category: 'special',
    color: 'text-sky-300',
    borderColor: 'border-sky-500/40 bg-sky-900/25',
    glowColor: 'shadow-[0_0_10px_rgba(56,189,248,0.4)]',
    auraClass: 'condition-aura-restrained',
    description: 'Desvantagem em testes de ataque.',
    rollHint: 'disadvantage',
  },
  {
    id: 'stunned',
    label: 'Atordoado',
    shortLabel: 'ATO',
    category: 'special',
    color: 'text-yellow-300',
    borderColor: 'border-yellow-500/40 bg-yellow-900/25',
    glowColor: 'shadow-[0_0_12px_rgba(234,179,8,0.45)]',
    auraClass: 'condition-aura-stunned',
    description: 'Incapaz de reações e outras ações até se recuperar.',
  },
  {
    id: 'dissociated',
    label: 'Dissociado',
    shortLabel: 'DIS',
    category: 'special',
    color: 'text-fuchsia-300',
    borderColor: 'border-fuchsia-500/40 bg-fuchsia-900/25',
    glowColor: 'shadow-[0_0_12px_rgba(217,70,239,0.45)]',
    auraClass: 'condition-aura-dissociated',
    description: 'Gasta ou marca o dobro de Esperança, PA, PV ou PF.',
  },
  {
    id: 'charmed',
    label: 'Enfeitiçado',
    shortLabel: 'ENF',
    category: 'special',
    color: 'text-pink-300',
    borderColor: 'border-pink-500/40 bg-pink-900/25',
    glowColor: 'shadow-[0_0_12px_rgba(236,72,153,0.45)]',
    auraClass: 'condition-aura-charmed',
    description: 'Atenção fixa no conjurador; visão estreita e sons abafados.',
  },
  {
    id: 'unconscious',
    label: 'Inconsciente',
    shortLabel: 'INC',
    category: 'special',
    color: 'text-stone-400',
    borderColor: 'border-stone-500/40 bg-stone-900/40',
    glowColor: 'shadow-[0_0_10px_rgba(120,113,108,0.5)]',
    auraClass: 'condition-aura-unconscious',
    description: 'Não fala, não ataca e falha automaticamente em reações.',
  },
  {
    id: 'incorporeal',
    label: 'Incorpóreo',
    shortLabel: 'INP',
    category: 'special',
    color: 'text-violet-300',
    borderColor: 'border-violet-500/40 bg-violet-900/30',
    glowColor: 'shadow-[0_0_16px_rgba(167,139,250,0.55)]',
    auraClass: 'condition-aura-incorporeal',
    description: 'Imune a dano físico; flutua e atravessa objetos. Ainda visível.',
  },
  {
    id: 'invisible',
    label: 'Invisível',
    shortLabel: 'INV',
    category: 'special',
    color: 'text-teal-300',
    borderColor: 'border-teal-500/40 bg-teal-900/30',
    glowColor: 'shadow-[0_0_14px_rgba(45,212,191,0.5)]',
    auraClass: 'condition-aura-invisible',
    description: 'Visível só por meios mágicos. Ataques contra têm Desvantagem.',
    rollHint: 'disadvantage',
  },
  {
    id: 'oculto',
    label: 'Oculto',
    shortLabel: 'OCL',
    category: 'special',
    color: 'text-purple-300',
    borderColor: 'border-purple-500/50 bg-purple-900/35',
    glowColor: 'shadow-[0_0_16px_rgba(168,85,247,0.55)]',
    auraClass: 'condition-aura-oculto',
    description: 'Escondido aprimorado: permanece sem ser visto se não se mover.',
    rollHint: 'disadvantage',
  },
  {
    id: 'protected',
    label: 'Protegido',
    shortLabel: 'PRO',
    category: 'special',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500/50 bg-emerald-900/30',
    glowColor: 'shadow-[0_0_14px_rgba(52,211,153,0.5)]',
    auraClass: 'condition-aura-protected',
    description: 'Resistência contra todos os tipos de dano.',
  },
  // --- Colosso ---
  {
    id: 'broken',
    label: 'Quebrado',
    shortLabel: 'QBR',
    category: 'colossus',
    color: 'text-orange-300',
    borderColor: 'border-orange-500/40 bg-orange-900/25',
    glowColor: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]',
    description: 'Segmento de colosso: não pode agir nem reagir.',
  },
  {
    id: 'collapsed',
    label: 'Colapsado',
    shortLabel: 'COL',
    category: 'colossus',
    color: 'text-lime-300',
    borderColor: 'border-lime-500/40 bg-lime-900/20',
    glowColor: 'shadow-[0_0_10px_rgba(132,204,22,0.35)]',
    description: 'Parte colapsada — pode abrir caminho para escalar o colosso.',
  },
  {
    id: 'destroyed',
    label: 'Destruído',
    shortLabel: 'DES',
    category: 'colossus',
    color: 'text-rose-400',
    borderColor: 'border-rose-600/50 bg-rose-950/40',
    glowColor: 'shadow-[0_0_10px_rgba(244,63,94,0.45)]',
    description: 'Segmento destruído permanentemente — habilidades inativas.',
  },
];

export const CONDITION_MAP = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c])
) as Record<ConditionId, ConditionDefinition>;

export const CONDITION_CATEGORIES: { id: ConditionCategory; label: string }[] = [
  { id: 'principal', label: 'Principais' },
  { id: 'special', label: 'Únicas & Especiais' },
  { id: 'colossus', label: 'Colosso' },
];
