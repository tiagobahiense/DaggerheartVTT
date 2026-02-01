// --- DEFINIÇÃO DE TIPOS (Para garantir que todas as classes tenham os mesmos campos) ---

export interface ClassDefinition {
    label: string;
    color: string;
    icon: string; // nome do icone
    stats: {
      hp: number;
      stress: number;
      hope: number;
      evasion: number;
      armorSlots: number;
      baseArmorPoints: number; // PA inicial sugerido
    };
    damageThresholds: { // Base para somar com nível
      minor: number;
      major: number;
      severe: number;
    };
    ability: {
      name: string;
      description: string;
    };
    questions: {
      origin: string[];
      bonds: string[];
    };
    startingInventory: string[];
    traits: { // Características visuais (Roupas, Olhos...)
      [category: string]: string[];
    };
    evolution: {
      tier2: { title: string; subtitle: string; items: { count: number; text: string }[] };
      tier3: { title: string; subtitle: string; items: { count: number; text: string }[] };
      tier4: { title: string; subtitle: string; items: { count: number; text: string }[] };
    };
  }
  
  // --- BANCO DE DADOS DAS CLASSES ---
  
  export const CLASS_DATABASE: Record<string, ClassDefinition> = {
    
    // ==================== MAGO ====================
    "mago": {
      label: "Mago",
      color: "#a855f7", // Roxo
      icon: "MagicWand",
      stats: {
        hp: 5,
        stress: 5,
        hope: 5, // Max esperança
        evasion: 8, // Base + Agilidade
        armorSlots: 6, // Padrão, mas pode variar
        baseArmorPoints: 3
      },
      damageThresholds: { minor: 1, major: 5, severe: 10 }, // Mago é mais frágil
      ability: {
        name: "Padrões Estranhos",
        description: "Escolha um número de 1 a 12. Ao rolar esse número no Dado do Destino (d12), você recebe 1 Esperança ou recupera 1 Fadiga. (Mude em descanso longo)."
      },
      questions: {
        origin: [
          "Que favor eu pedi e você não sabe se conseguirá cumprir?",
          "Que passatempo ou fascinação estranha nós compartilhamos?"
        ],
        bonds: [
          "Vínculo 1 (Nome do aliado...)",
          "Vínculo 2 (Nome do aliado...)"
        ]
      },
      startingInventory: [
        "Grimório Arcano",
        "Poção de Vida Menor",
        "Livro Antigo (Traduzindo)",
        "Kit Básico (Mochila, Saco de Dormir, Tocha)"
      ],
      traits: {
        "Roupas": ["Bonitas", "Limpas", "Comuns", "Leves", "Em camadas", "De retalhos", "Apertadas"],
        "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
        "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
        "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
        "Postura": ["Excentricidade", "Bibliotecário"]
      },
      evolution: {
        tier2: {
          title: "2º PATAMAR: NÍVEIS 2 A 4",
          subtitle: "No nível 2, crie uma nova Experiência com +2 e aumente sua Proficiência em +1.",
          items: [
            { count: 3, text: "Escolha dois atributos desmarcados, os marque e receba um bônus de +1 em cada." },
            { count: 2, text: "Aumente seus PV em 1 permanentemente." },
            { count: 2, text: "Aumente seus PF em 1 permanentemente." },
            { count: 1, text: "Receba +1 em duas Experiências permanentemente." },
            { count: 1, text: "Escolha uma nova carta de domínio (nível máx.: 4)." },
            { count: 1, text: "Aumente sua Evasão em +1 permanentemente." }
          ]
        },
        tier3: {
          title: "3º PATAMAR: NÍVEIS 5 A 7",
          subtitle: "No nível 5, crie uma nova Experiência (+2), limpe atributos e aumente Proficiência em +1.",
          items: [
            { count: 3, text: "Escolha dois atributos desmarcados, marque e receba +1 em cada." },
            { count: 2, text: "Aumente seus PV em 1 permanentemente." },
            { count: 2, text: "Aumente seus PF em 1 permanentemente." },
            { count: 1, text: "Receba +1 em duas Experiências permanentemente." },
            { count: 1, text: "Escolha uma nova carta de domínio (nível máx.: 7)." },
            { count: 1, text: "Aumente sua Evasão em +1 permanentemente." },
            { count: 1, text: "Pegue sua carta de subclasse aprimorada (corte a opção de multiclasse)." },
            { count: 2, text: "Aumente sua Proficiência em +1." },
            { count: 2, text: "Multiclasse: escolha uma classe adicional." }
          ]
        },
        tier4: {
          title: "4º PATAMAR: NÍVEIS 8 A 10",
          subtitle: "No nível 8, crie nova Experiência (+2), limpe atributos e aumente Proficiência em +1.",
          items: [
            { count: 3, text: "Escolha dois atributos desmarcados, marque e receba +1 em cada." },
            { count: 2, text: "Aumente seus PV em 1 permanentemente." },
            { count: 2, text: "Aumente seus PF em 1 permanentemente." },
            { count: 1, text: "Receba +1 em duas Experiências permanentemente." },
            { count: 1, text: "Escolha uma nova carta de domínio." },
            { count: 1, text: "Aumente sua Evasão em +1 permanentemente." },
            { count: 1, text: "Pegue sua carta de subclasse aprimorada (ou multiclasse)." },
            { count: 2, text: "Aumente sua Proficiência em +1." },
            { count: 2, text: "Multiclasse: escolha uma classe adicional." }
          ]
        }
      }
    },
  
    // ==================== GUERREIRO (Exemplo de Variação) ====================
    "guerreiro": {
      label: "Guerreiro",
      color: "#ea580c", // Laranja
      icon: "Sword",
      stats: {
        hp: 6, // Guerreiro tem mais vida
        stress: 5,
        hope: 5,
        evasion: 9,
        armorSlots: 6,
        baseArmorPoints: 5 // Começa com armadura melhor
      },
      damageThresholds: { minor: 1, major: 6, severe: 12 }, // Aguenta mais dano
      ability: {
        name: "Veterano de Batalha",
        description: "Quando você entrar em combate, ganhe 1 Esperança. Passivo: Aumente seu limiar de dano Maior em +1."
      },
      questions: {
        origin: ["Quem eu salvei de uma morte certa?", "Qual cicatriz conta minha melhor história?"],
        bonds: ["Vínculo 1", "Vínculo 2"]
      },
      startingInventory: ["Espada Bastarda", "Armadura de Cota de Malha", "Kit de Reparo"],
      traits: {
        "Olhar": ["Feroz", "Cansado", "Determinado"],
        "Músculos": ["Tenso", "Relaxado", "Volumoso"]
      },
      evolution: {
          // ... (Seria a evolução específica do guerreiro, similar ao mago mas com nuances)
          tier2: { title: "2º PATAMAR", subtitle: "Guerreiro...", items: [] },
          tier3: { title: "3º PATAMAR", subtitle: "Guerreiro...", items: [] },
          tier4: { title: "4º PATAMAR", subtitle: "Guerreiro...", items: [] }
      }
    }
  };