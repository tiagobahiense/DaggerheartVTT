// src/types/index.ts

// --- TIPOS DE CARTAS ---
export interface ICard {
  id: string;
  name: string;
  description: string;
  imageUrl: string; 
  cost?: number;
  type: 'magia' | 'item' | 'equipamento'; 
  // Solução para o payload: Usar unknown ou definir tipos primitivos permitidos
  effectPayload?: Record<string, string | number | boolean>; 
}

// --- TIPOS DE ITENS E HABILIDADES ---
export interface IWeapon {
  id: string;
  name: string;
  damage: string; // Ex: "1d8+2"
  range: string;  // Ex: "Melee"
  type: string;   // Ex: "Físico"
}

export interface IFeature {
  title: string;
  description: string;
  active?: boolean;
}

// --- TIPOS DE FICHA ---

export interface IAttribute {
  value: number;
  modifier: number;
}

export interface IDamageThresholds {
  minor: number;
  major: number;
  severe: number;
}

export interface IBeastShape {
  name: string;
  ferocity: number;
  traits: string[];
}

export interface ICompanion {
  name: string;
  species: string;
  hp: number;
  attackDice: string;
}

// A FICHA COMPLETA (Sem any!)
export interface ICharacterSheet {
  id: string;
  playerId: string;
  name: string;
  pronouns?: string;
  class: string;
  subclass?: string;
  level: number;

  attributes: {
    agility: IAttribute;
    strength: IAttribute;
    finesse: IAttribute;
    instinct: IAttribute;
    presence: IAttribute;
    knowledge: IAttribute;
  };

  evasion: number;
  armor: number;
  armorSlots: number;
  currentArmor: number;
  
  damageThresholds: IDamageThresholds;
  currentHp: number;
  markedDamage: number;
  
  hope: number;
  fear: number;
  gold: number;

  // CORREÇÃO: Tipagem estrita aqui
  weapons: IWeapon[]; 
  inventory: string[];
  classFeatures: IFeature[];

  specialTabs?: string[];
  
  beastShape?: IBeastShape;
  companion?: ICompanion;
  
  notes?: string;
}

// --- TIPOS DE TOKEN ---
export interface IToken {
  id: string;
  characterName: string;
  x: number;
  y: number;
  imageUrl: string;
  hp: number;
  maxHp: number;
}