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
  
  // ... restante do arquivo igual