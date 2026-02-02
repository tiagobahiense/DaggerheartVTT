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
  // Adicionado para suportar a exibição na ficha (SheetModal)
  startingFeatures: {
    title: string;
    description: string;
  }[];
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
      description: "Uma vez por sessão, conceda a você e aliados um Dado de Inspiração (d6 no 1º nível, d8 no 5º) para somar a testes, dano ou recuperar PF."
    },
    startingFeatures: [
      {
        title: "Inspiração",
        description: "Uma vez por sessão, descreva como inspira o grupo e conceda a você e aliados 1 Dado de Inspiração. No 1º nível é um d6 (no 5º nível torna-se d8). Pode ser rolado para: Somar a um teste, reação ou dano; ou Recuperar PF igual ao resultado. Dados não usados são perdidos ao fim da sessão."
      }
    ],
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
    damageThresholds: { minor: 6, major: 13, severe: 17 },
    ability: {
      name: "Forma de Fera",
      description: "Marque 1 PF para se transformar em uma criatura de patamar igual ou menor ao seu. Use as habilidades, Evasão e ataque da forma."
    },
    startingFeatures: [
      {
        title: "Forma de Fera",
        description: "Marque 1 PF para se transformar em uma criatura de patamar igual ou menor ao seu. Pode encerrar a forma a qualquer momento. Não usa armas nem feitiços de domínio (efeitos ativos permanecem). Usa as habilidades, Evasão e atributo de ataque da forma. Armadura se integra ao corpo e PA permanecem ao sair. Ao marcar o último PV, você retorna à forma normal."
      },
      {
        title: "Dádiva da Natureza",
        description: "Crie livremente efeitos naturais sutis e inofensivos (flores, brisas, fogo pequeno etc.)."
      }
    ],
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

  // ==================== FEITICEIRO ====================
  "feiticeiro": {
    label: "Feiticeiro",
    color: "#9333ea", // Purple
    icon: "Sparkle",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 3 },
    damageThresholds: { minor: 5, major: 11, severe: 15 },
    ability: {
      name: "Poder Arcano",
      description: "Possui Sentido Arcano, Ilusão Menor e Canalizar Poder Bruto (use cartas de domínio para ganhar Esperança ou dobrar dano de feitiços)."
    },
    startingFeatures: [
      {
        title: "Sentido Arcano",
        description: "Você percebe a presença de pessoas ou objetos mágicos próximos."
      },
      {
        title: "Ilusão Menor",
        description: "Teste de conjuração (10). Em sucesso, cria uma ilusão visual convincente em alcance próximo, até o seu tamanho."
      },
      {
        title: "Canalizar Poder Bruto",
        description: "1 vez por descanso longo, coloque uma carta de domínio na reserva e escolha: Ganhar Esperança igual ao nível da carta; ou Aumentar o dano de um feitiço em 2× o nível da carta."
      }
    ],
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
    stats: { hp: 6, stress: 5, hope: 2, evasion: 9, armorSlots: 6, baseArmorPoints: 4 },
    damageThresholds: { minor: 7, major: 15, severe: 19 },
    ability: {
      name: "Determinação",
      description: "1 vez por descanso longo, receba um Dado de Determinação (d4, sobe no nível 5). Enquanto Determinado, reduz dano físico e soma o dado ao dano causado."
    },
    startingFeatures: [
      {
        title: "Determinação",
        description: "1 vez por descanso longo, entre em Determinação e receba um Dado de Determinação. 1º nível: d4 (5º nível: d6). Começa com valor 1 e aumenta +1 ao causar dano que retire PV. Termina ao exceder o valor máximo ou ao fim da cena."
      },
      {
        title: "Enquanto Determinado",
        description: "Reduz dano físico em 1 categoria; Soma o valor do dado às rolagens de dano; Não pode ser Imobilizado nem ficar Vulnerável."
      }
    ],
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
    stats: { hp: 6, stress: 5, hope: 2, evasion: 9, armorSlots: 6, baseArmorPoints: 4 },
    damageThresholds: { minor: 7, major: 15, severe: 19 },
    ability: {
      name: "Combate Tático",
      description: "Realize Ataques de Oportunidade contra inimigos que fogem. Receba bônus de dano físico igual ao seu nível e ignore tipos de empunhadura."
    },
    startingFeatures: [
      {
        title: "Ataque de Oportunidade",
        description: "Se um inimigo corpo a corpo tentar sair do alcance, faça um teste de reação contra a Dificuldade dele. Sucesso: escolha 1 efeito. Sucesso crítico: escolha 2 efeitos. (Impede o movimento, Causa dano da arma principal, ou Move-se junto com o alvo)."
      },
      {
        title: "Treinamento de Combate",
        description: "Ignora tipos de empunhadura. Ao causar dano físico, recebe bônus igual ao seu nível no dano."
      }
    ],
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
    stats: { hp: 5, stress: 5, hope: 2, evasion: 11, armorSlots: 6, baseArmorPoints: 2 },
    damageThresholds: { minor: 6, major: 13, severe: 17 },
    ability: {
      name: "Furtividade",
      description: "Permanece Oculto ao se esconder. Causa Ataque Furtivo (dano extra de +d6 por patamar) ao atacar Oculto ou com aliado próximo ao alvo."
    },
    startingFeatures: [
      {
        title: "Oculto",
        description: "Quando estaria Escondido, você fica Oculto. Permanece invisível mesmo se alguém se mover para vê-lo, desde que não se mova. Perde a condição ao se mover à vista ou atacar."
      },
      {
        title: "Ataque Furtivo",
        description: "Ao acertar um ataque enquanto Oculto ou com um aliado corpo a corpo do alvo, adicione d6 por patamar ao dano (Nível 1: 1º patamar; Níveis 2–4: 2º patamar...)."
      }
    ],
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

  // ==================== MAGO ====================
  "mago": {
    label: "Mago",
    color: "#2563eb", // Blue
    icon: "BookOpen",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 1 },
    damageThresholds: { minor: 4, major: 8, severe: 12 },
    ability: {
      name: "Alta Magia",
      description: "Padrões Estranhos: Escolha um nº da sorte para ganhar Esperança/PF. Prestidigitação: Efeitos mágicos menores à vontade."
    },
    startingFeatures: [
      {
        title: "Padrões Estranhos",
        description: "Escolha um número de 1 a 12. Ao rolar esse número em um Dado do Destino, ganhe 1 Esperança ou recupere 1 Fadiga. Pode trocar o número em um descanso longo."
      },
      {
        title: "Prestidigitação",
        description: "Execute livremente pequenos efeitos mágicos inofensivos (luz, cheiro, flutuar objetos, reparar itens pequenos etc.)."
      }
    ],
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

  // ==================== PATRULHEIRO ====================
  "patrulheiro": {
    label: "Patrulheiro",
    color: "#65a30d", // Dark Green / Lime
    icon: "Crosshair",
    stats: { hp: 5, stress: 5, hope: 2, evasion: 10, armorSlots: 6, baseArmorPoints: 2 },
    damageThresholds: { minor: 6, major: 13, severe: 17 },
    ability: {
      name: "Marca da Presa",
      description: "Gaste 1 Esperança para marcar um alvo. Você sabe a direção dele e causa 1 PF ao causar dano."
    },
    startingFeatures: [
      {
        title: "Marca da Presa",
        description: "Gaste 1 Esperança e ataque um alvo. Se acertar, cause dano normal e o Marque. Enquanto a marca durar: Você sabe a direção exata do alvo; Ao causar dano, o alvo marca 1 PF; Ao errar um ataque, pode encerrar a marca para rerrolar os Dados de Dualidade."
      }
    ],
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
      name: "Dados de Oração",
      description: "No início da sessão, role d4s baseados em conjuração. Gaste esses dados para reduzir dano, somar a rolagens ou ganhar Esperança."
    },
    startingFeatures: [
      {
        title: "Dados de Oração",
        description: "No início da sessão, role d4 em quantidade igual ao atributo de conjuração da subclasse. Esses são seus Dados de Oração. Você pode gastar dados para ajudar a si ou aliados em alcance distante, usando o valor para: Reduzir dano sofrido; Somar a uma rolagem após feita; Ganhar Esperança igual ao resultado. Dados não usados são perdidos ao fim da sessão."
      }
    ],
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