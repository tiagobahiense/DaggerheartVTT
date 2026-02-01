// src/types/index.ts

// Define o formato da sua carta (baseado no seu JSON antigo)
export interface ICard {
    id: string;
    name: string;
    description: string;
    imageUrl: string; // Caminho para /public/cards/...
    cost?: number;
    type: 'magia' | 'item' | 'equipamento'; // Exemplo de union type
    effectPayload?: Record<string, any>; // Para efeitos flexíveis
  }
  
  // Define o formato de um Token no mapa
  export interface IToken {
    id: string;
    characterName: string;
    x: number;
    y: number;
    imageUrl: string;
    hp: number;
    maxHp: number;
  }
  
  // Define o estado do Jogador
  export interface IPlayer {
    uid: string;
    displayName: string;
    hand: ICard[]; // O jogador tem um array de cartas na mão
    tokensControlled: string[]; // IDs dos tokens que ele pode mover
  }