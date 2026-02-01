// classDatabase.ts

// --- DEFINIÇÃO DE TIPOS ---
export interface ClassDefinition {
  label: string;
  color: string;
  icon: string;
  stats: {
    hp: number;
    stress: number;
    hope: number;
    evasion: number;
    armorSlots: number;
    baseArmorPoints: number;
  };
  damageThresholds: {
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
  traits: {
    [category: string]: string[];
  };
  evolution: {
    tier2: { title: string; subtitle: string; items: { count: number; text: string }[] };
    tier3: { title: string; subtitle: string; items: { count: number; text: string }[] };
    tier4: { title: string; subtitle: string; items: { count: number; text: string }[] };
  };
}

// --- TEMPLATE DE EVOLUÇÃO (PADRÃO PARA TODAS AS CLASSES) ---
const STANDARD_EVOLUTION = {
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
};

// --- BANCO DE DADOS DAS CLASSES ---

export const CLASS_DATABASE: Record<string, ClassDefinition> = {

  // ==================== BARDO ====================
  "bardo": {
    label: "Bardo",
    color: "#db2777", // Pink
    icon: "MusicNote",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 3 },
    damageThresholds: { minor: 5, major: 11, severe: 15 },
    ability: {
      name: "Inspiração",
      description: "Uma vez por sessão, forneça a você e seus aliados um Dado de Inspiração (d6 no nv 1, d8 no nv 5). Use para somar a um teste, reação, dano ou recuperar PF. Extra: 'Fazer uma Cena' (Gaste 3 Esperança para distrair inimigo, -2 Dificuldade)."
    },
    questions: {
      origin: [
        "Quem em sua comunidade lhe ensinou a ter tanta confiança em si mesmo?",
        "Você já se apaixonou. Quem você amava e como essa pessoa partiu seu coração?",
        "Você sempre teve admiração por outro bardo. Quem é essa pessoa e por que você a idolatra?"
      ],
      bonds: [
        "Como percebeu que seríamos grandes amigos?",
        "O que eu faço que irrita você?",
        "Por que você segura minha mão à noite?"
      ]
    },
    startingInventory: ["Rapieira", "Adaga pequena", "Gibão", "Instrumento musical"],
    traits: {
      "Roupas": ["Extravagantes", "Chiques", "Barulhentas", "Grandes", "Irregulares", "Elegantes", "Selvagens"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Barista", "Mágico", "Mestre de Cerimônias", "Estrela do Rock", "Espadachim"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== DRUIDA ====================
  "druida": {
    label: "Druida",
    color: "#16a34a", // Green
    icon: "Leaf",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 2 },
    damageThresholds: { minor: 6, major: 13, severe: 17 }, // Baseado na Armadura de Couro
    ability: {
      name: "Forma de Fera",
      description: "Marque 1 PF para se transformar em uma criatura. Receba as habilidades da fera, some a Evasão dela à sua e use o atributo dela para atacar. Extra: 'Dádiva da Natureza' (efeitos sutis da natureza à vontade)."
    },
    questions: {
      origin: [
        "Por que a comunidade na qual você cresceu confiava tanto na natureza?",
        "Qual foi o primeiro animal com o qual você teve uma conexão emocional? Por que acabou?",
        "Quem está caçando você? O que essa pessoa quer de você?"
      ],
      bonds: [
        "O que você confiou a mim que sempre faz com que eu me arrisque por você?",
        "De que animal você me faz lembrar?",
        "Qual o apelido carinhoso que você me deu?"
      ]
    },
    startingInventory: ["Cajado curto", "Escudo redondo", "Armadura de Couro", "Token Druídico"],
    traits: {
      "Roupas": ["Camufladas", "Longas", "Soltas", "Costuradas a esmo", "Majestosas", "De retalhos"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Insegura", "Severa", "Distante", "Sábia", "Animalesca"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== FEITICEIRO (SORCERER) ====================
  "feiticeiro": {
    label: "Feiticeiro",
    color: "#9333ea", // Purple
    icon: "Sparkle",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 3 },
    damageThresholds: { minor: 5, major: 11, severe: 15 },
    ability: {
      name: "Magia Inata",
      description: "Sentido Arcano: Sente magia próxima. Ilusão Menor: Teste de conjuração (10) para criar ilusão visual. Canalizar Poder Bruto: 1x/descanso, coloque carta de domínio na reserva para ganhar Esperança ou Dobrar Dano de feitiço."
    },
    questions: {
      origin: [
        "Quem lhe ensinou a domar sua magia descontrolada?",
        "O que fez com que as pessoas da sua comunidade desconfiassem de você?",
        "Você teme algo profundamente e esconde isso de todos. O que é?"
      ],
      bonds: [
        "Por que você confia tanto em mim?",
        "O que eu fiz para você suspeitar tanto de mim?",
        "Por que mantemos em segredo o passado que compartilhamos?"
      ]
    },
    startingInventory: ["Cajado duplo", "Gibão", "Orbe sussurrante ou Herança"],
    traits: {
      "Roupas": ["Leves", "Extravagantes", "Discretas", "Em camadas", "Ornamentadas", "Apertadas"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Celebridade", "Comandante", "Político", "Brincalhão", "Lobo em pele de cordeiro"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== GUARDIÃO ====================
  "guardiao": {
    label: "Guardião",
    color: "#0ea5e9", // Blue/Cyan
    icon: "Shield",
    stats: { hp: 6, stress: 5, hope: 2, evasion: 9, armorSlots: 6, baseArmorPoints: 4 }, // Mais HP, menos Evasão
    damageThresholds: { minor: 7, major: 15, severe: 19 }, // Cota de malha
    ability: {
      name: "Inabalável",
      description: "Barreira Implacável: Gaste 2 Esperança para reduzir dano recebido em 1d6 (antes da armadura). Se o dano for zerado, ganhe 1 Esperança. Passiva: Você tem Vantagem em testes para proteger aliados."
    },
    questions: {
      origin: [
        "Qual foi a primeira pessoa que você falhou em proteger?",
        "Quem lhe deu sua armadura e o que ela significa para você?",
        "De qual terrível ameaça você salvou sua comunidade?"
      ],
      bonds: [
        "Quantas vezes eu já tive que remendar seus ferimentos?",
        "Qual promessa fizemos um ao outro?",
        "Por que você se sente mais seguro quando estou por perto?"
      ]
    },
    startingInventory: ["Martelo de guerra", "Escudo Torre", "Cota de malha", "Insígnia"],
    traits: {
      "Roupas": ["Gastas", "Pesadas", "Metálicas", "Protetoras", "Uniforme", "Sagradas"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Sentinela", "Muro", "Pai/Mãe urso", "Escudeiro", "Veterano"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== GUERREIRO ====================
  "guerreiro": {
    label: "Guerreiro",
    color: "#ea580c", // Orange
    icon: "Sword",
    stats: { hp: 6, stress: 5, hope: 2, evasion: 9, armorSlots: 6, baseArmorPoints: 4 }, // Mais HP
    damageThresholds: { minor: 7, major: 15, severe: 19 },
    ability: {
      name: "Mestre de Batalha",
      description: "Ataque de Oportunidade: Se inimigo tentar sair do alcance corpo a corpo, faça reação. Sucesso: Impeça movimento ou cause dano. Treinamento de Combate: Receba bônus de dano igual ao seu nível em dano físico."
    },
    questions: {
      origin: [
        "Anos atrás, você perdeu uma batalha que o deixou à beira da morte. Quem o derrotou?",
        "Quem ensinou você a lutar e por que essa pessoa ficou para trás?",
        "Qual cicatriz conta sua melhor história?"
      ],
      bonds: [
        "Nos conhecíamos bem antes do grupo. Como?",
        "Com qual tarefa mundana você costuma me ajudar?",
        "Que medos estou ajudando você a superar?"
      ]
    },
    startingInventory: ["Espada longa", "Cota de malha", "Pedra de amolar ou Desenho"],
    traits: {
      "Roupas": ["Ousadas", "Remendadas", "Reforçadas", "Reais", "Elegantes", "Econômicas", "Desgastadas"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Touro", "Soldado dedicado", "Gladiador", "Herói", "Mercenário"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== LADINO ====================
  "ladino": {
    label: "Ladino",
    color: "#1f2937", // Dark Grey / Black
    icon: "MaskHappy",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 11, armorSlots: 6, baseArmorPoints: 2 }, // Evasão alta
    damageThresholds: { minor: 6, major: 13, severe: 17 }, // Couro
    ability: {
      name: "Especialista Furtivo",
      description: "Ataque Furtivo: Se tiver Vantagem no ataque, cause +1d6 de dano (aumenta com nível). Esconder-se: Pode se esconder como Ação Bônus gastando 1 Esperança."
    },
    questions: {
      origin: [
        "Qual foi a coisa mais valiosa que você roubou?",
        "Você já foi pego? Quem te pegou e o que aconteceu?",
        "Quem é o único membro da sua antiga gangue em quem você confia?"
      ],
      bonds: [
        "Qual é o segredo que eu sei sobre você?",
        "Por que você sempre me vigia quando estamos na cidade?",
        "O que fizemos juntos que nos colocou em apuros?"
      ]
    },
    startingInventory: ["Adagas duplas", "Armadura de couro", "Ferramentas de ladrão", "Baralho viciado"],
    traits: {
      "Roupas": ["Escuras", "Capuz", "Ajustadas", "Cheias de bolsos", "Comuns", "Elegantes"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Sombra", "Desconfiado", "Relaxado", "Perigoso", "Invisível"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== MAGO (WIZARD) ====================
  "mago": {
    label: "Mago",
    color: "#2563eb", // Blue
    icon: "BookOpen",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 1 }, // Pouca armadura
    damageThresholds: { minor: 4, major: 8, severe: 12 }, // Roupas/Manto
    ability: {
      name: "Escola de Magia",
      description: "Padrões Estranhos: Escolha nº 1-12. Ao rolar esse nº no D12, ganhe 1 Esperança ou recupere 1 PF. Prestidigitação: Efeitos mágicos menores à vontade. Extra: 'Não Dessa Vez' (Gaste 3 Esperança para forçar inimigo a refazer teste)."
    },
    questions: {
      origin: [
        "Qual grande mistério mágico você está tentando resolver?",
        "Quem foi seu mestre e por que você o deixou?",
        "O que aconteceu quando você lançou seu primeiro feitiço?"
      ],
      bonds: [
        "Qual experimento mágico meu deu errado e atingiu você?",
        "Por que você acha que eu sou perigoso?",
        "O que eu sei sobre o seu futuro que você não sabe?"
      ]
    },
    startingInventory: ["Grimório", "Cajado", "Manto simples", "Bolsa de componentes"],
    traits: {
      "Roupas": ["Manto", "Túnica", "Chapéu", "Simples", "Bordadas", "Misteriosas", "Acadêmicas"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Distraído", "Focado", "Arrogante", "Curioso", "Místico"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== PATRULHEIRO (RANGER) ====================
  "patrulheiro": {
    label: "Patrulheiro",
    color: "#65a30d", // Dark Green / Lime
    icon: "Crosshair", // Ou PawPrint se preferir focar no pet
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 2 },
    damageThresholds: { minor: 6, major: 13, severe: 17 },
    ability: {
      name: "Companheiro",
      description: "Vínculo Selvagem: Você tem um companheiro animal. Ele age junto com você. Se ele sofrer dano, você pode marcar Stress para negar. Extra: 'Na Mosca' (Gaste 1 Esperança para adicionar +1d6 de dano em ataque à distância)."
    },
    questions: {
      origin: [
        "Por que você prefere a companhia de animais à de pessoas?",
        "Qual foi a criatura mais perigosa que você já caçou?",
        "Quem você deixou para trás quando escolheu viver nos ermos?"
      ],
      bonds: [
        "Como eu salvei sua vida na floresta?",
        "Por que você não confia no meu animal?",
        "Qual lugar selvagem eu prometi te mostrar?"
      ]
    },
    startingInventory: ["Arco longo", "Aljava", "Armadura de couro", "Kit de sobrevivência"],
    traits: {
      "Roupas": ["Couro", "Peles", "Camufladas", "Práticas", "Gastas", "Encapuzadas"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Alerta", "Relaxado", "Selvagem", "Silencioso", "Caçador"]
    },
    evolution: STANDARD_EVOLUTION
  },

  // ==================== SERAFIM ====================
  "serafim": {
    label: "Serafim",
    color: "#eab308", // Yellow / Gold
    icon: "Sun",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 3 },
    damageThresholds: { minor: 5, major: 11, severe: 15 },
    ability: {
      name: "Divindade",
      description: "Prece: Role 'Oração'. Em sucesso, cure PF ou PV. Asas: Você pode voar por curtos períodos gastando Esperança. Extra: 'Intervenção' (Gaste 3 Esperança para rolar novamente qualquer dado)."
    },
    questions: {
      origin: [
        "Qual divindade você serve e por quê?",
        "Qual milagre você presenciou que mudou sua vida?",
        "Quem você falhou em salvar e isso assombra você?"
      ],
      bonds: [
        "Por que você acha que eu fui enviado pelos deuses?",
        "Qual pecado meu você está tentando perdoar?",
        "O que eu faço que testa sua fé?"
      ]
    },
    startingInventory: ["Maça", "Escudo", "Símbolo sagrado", "Vestes litúrgicas"],
    traits: {
      "Roupas": ["Brancas", "Douradas", "Simples", "Cerimoniais", "Armadura leve", "Tecidos finos"],
      "Olhos": ["Cravos", "Terra", "Oceano sem fim", "Fogo", "Hera", "Lilás", "Noite", "Espuma do mar", "Inverno"],
      "Corpo": ["Largo", "Esculpido", "Curvilíneo", "Esguio", "Rotundo", "Baixo", "Atarracado", "Alto", "Magro", "Pequeno", "Definido"],
      "Pele": ["Cinzas", "Trevo", "Neve", "Areia fina", "Obsidiana", "Rosas", "Safira", "Glicínia"],
      "Postura": ["Sereno", "Imponente", "Humilde", "Julgador", "Radiante"]
    },
    evolution: STANDARD_EVOLUTION
  }
};