// src/types/index.ts

export interface ICard {
    id: string;
    name: string;
    description: string;
    imageUrl: string; 
    cost?: number;
    type: 'magia' | 'item' | 'equipamento'; 
    
    // Adicione esta linha logo acima do erro para o linter parar de reclamar:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    effectPayload?: Record<string, any>; 
  }
  
// Adicione/Atualize no src/types/index.ts

export interface IBeastShape {
  name: string;
  ferocity: number;
  traits: string[]; // Ex: ["Voo", "Anfíbio"]
}

export interface ICompanion {
  name: string;
  species: string;
  hp: number;
  attackDice: string; // Ex: "1d6"
}

export interface ICharacterSheet {
  // ... campos básicos (id, name, attributes)...
  
  class: 'druida' | 'patrulheiro' | 'guardiao' | 'bardo'; // etc
  
  // Campos Opcionais (Só preenchidos se a classe exigir)
  beastShape?: IBeastShape;
  companion?: ICompanion;
}