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
  // Nova propriedade adicionada
  hopeAbility: {
    name: string;
    description: string;
  };
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

export interface AncestryDefinition {
  name: string;
  height: string;
  life: string;
  ability: string;
  abilityDesc: string;
  imgName: string;
}

export interface CommunityDefinition {
  name: string;
  ability: string;
  abilityDesc: string;
  imgName: string;
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
    hopeAbility: {
        name: "Fazer uma Cena",
        description: "Gaste 3 Pontos de Esperança para distrair temporariamente um alvo próximo, aplicando uma penalidade de –2 à Dificuldade dele."
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
    hopeAbility: {
        name: "Evolução",
        description: "Gaste 3 Pontos de Esperança para usar Forma de Fera sem marcar Pontos de Fadiga. Ao fazer isso, aumente um atributo em +1 até sair da Forma de Fera."
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
        "Por que a comunidade na qual você cresceu confiava tanto na natureza e em suas criaturas?",
        "Qual foi o primeiro animal com o qual você teve uma conexão emocional? Por que essa conexão acabou?",
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
    hopeAbility: {
        name: "Magia Volátil",
        description: "Gaste 3 Pontos de Esperança para rolar novamente uma quantidade qualquer de dados de dano em um ataque que causa dano mágico."
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
        "O que você fez que tornou as pessoas de sua comunidade desconfiadas de você?",
        "Quem lhe ensinou a domar sua magia descontrolada e por que essa pessoa não pode mais orientar você?",
        "Você teme algo profundamente e esconde isso de todos. O que é, e por que isso o aterroriza?"
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
    hopeAbility: {
        name: "Linha de Frente",
        description: "Gaste 3 Pontos de Esperança para recuperar 2 Pontos de Armadura."
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
        "Quem da sua comunidade você não conseguiu proteger e por que você ainda pensa nessa pessoa?",
        "Você recebeu a missão de proteger e levar algo importante a um lugar perigoso. O que é e aonde você precisa ir?",
        "Você acredita ter uma fraqueza. O que é, e como isso afeta você?"
      ],
      bonds: [
        "Como salvei sua vida quando nos conhecemos?",
        "Que lembrança você me deu e percebeu que eu sempre carrego comigo?",
        "Que mentira você me contou sobre você na qual eu caí completamente?"
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
    hopeAbility: {
        name: "Sem Piedade",
        description: "Gaste 3 Pontos de Esperança para receber um bônus de +1 em testes de ataque até seu próximo descanso."
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
        "Quem ensinou você a lutar e por que essa pessoa ficou para trás quando você saiu de sua comunidade?",
        "Anos atrás, uma pessoa o derrotou e o deixou à beira da morte. Quem é essa pessoa e como ela o traiu?",
        "Que lugar lendário você sempre quis visitar e por que ele é tão especial?"
      ],
      bonds: [
        "Nos conhecíamos bem antes do surgimento do grupo. Como?",
        "Com qual tarefa mundana você costuma me ajudar, fora dos momentos de batalha?",
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
    hopeAbility: {
        name: "Esquiva de Ladino",
        description: "Gaste 3 Pontos de Esperança para receber um bônus de +2 na Evasão até o próximo ataque que acertar você. Caso contrário, esse bônus dura até seu próximo descanso."
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
        "O que sua comunidade descobriu você fazendo que fez com que fosse expulso?",
        "Você tinha uma vida diferente, mas tentou abandoná-la. Que figura do passado ainda o persegue?",
        "Você ficou mais triste ao se despedir de quem?"
      ],
      bonds: [
        "O que eu convenci você a fazer recentemente que nos deixou em apuros?",
        "O que eu descobri sobre o seu passado e escondo dos outros?",
        "Quem você conhece do meu passado e como essa pessoa influenciou o que você sente sobre mim?"
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
    hopeAbility: {
        name: "Não Dessa Vez",
        description: "Gaste 3 Pontos de Esperança para forçar um adversário distante ou mais próximo a refazer um teste de ataque ou uma rolagem de dano."
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
        "Para quais responsabilidades sua comunidade já contou com você? Como você a decepcionou?",
        "Você passou a vida em busca de um livro ou objeto importante. O que é, e por que é tão importante?",
        "Você tem um rival poderoso. Quem é essa pessoa e por que você quer tanto derrotá-la?"
      ],
      bonds: [
        "Que favor eu pedi e você não sabe se conseguirá cumprir?",
        "Que passatempo ou fascinação estranha nós compartilhamos?",
        "Que segredo a seu respeito você confiou a mim?"
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
    hopeAbility: {
        name: "Segurem Eles",
        description: "Quando acerta um ataque com uma arma, você pode gastar 3 Pontos de Esperança para usar o mesmo teste contra dois adversários adicionais no alcance."
    },
    startingFeatures: [
      {
        title: "Marca da Presa",
        description: "Gaste 1 Esperança e ataque um alvo. Se acertar, cause dano normal e o Marque. Enquanto a marca durar: Você sabe a direção exata do alvo; Ao causar dano, o alvo marca 1 PF; Ao errar um ataque, pode encerrar a marca para rerrolar os Dados de Dualidade."
      }
    ],
    questions: {
      origin: [
        "Uma criatura terrível prejudicou sua comunidade e você jurou abatê-la. Que criatura é essa e qual é a trilha ou sinal que ela deixa para trás?",
        "A primeira presa que você abateu quase o matou. Que criatura foi essa, e, desde então, que parte de você nunca mais foi a mesma?",
        "Você já visitou muitos lugares perigosos, mas qual é o lugar aonde você jamais iria?"
      ],
      bonds: [
        "Qual é a rivalidade amigável que temos?",
        "Por que você age de forma tão diferente quando estamos sozinhos e quando há outras pessoas junto?",
        "Você me pediu para tomar cuidado com qual ameaça, e por que se preocupa com isso?"
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
    hopeAbility: {
        name: "Alicerce da Vida",
        description: "Gaste 3 Pontos de Esperança para recuperar 1 Ponto de Vida de um aliado próximo."
    },
    startingFeatures: [
      {
        title: "Dados de Oração",
        description: "No início da sessão, role d4 em quantidade igual ao atributo de conjuração da subclasse. Esses são seus Dados de Oração. Você pode gastar dados para ajudar a si ou aliados em alcance distante, usando o valor para: Reduzir dano sofrido; Somar a uma rolagem após feita; Ganhar Esperança igual ao resultado. Dados não usados são perdidos ao fim da sessão."
      }
    ],
    questions: {
      origin: [
        "Que deus(a) você segue? Que façanha incrível essa divindade realizou em seu momento de desespero?",
        "O que mudou em sua aparência após seu juramento?",
        "De que forma estranha ou exclusiva você se comunica com a divindade que segue?"
      ],
      bonds: [
        "O que você me fez prometer caso morra em batalha?",
        "Por que pergunta tantas coisas sobre minha divindade?",
        "Você me pediu para proteger um membro do grupo acima de todos, inclusive de você. Quem e por quê?"
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

// --- DADOS DE ANCESTRALIDADE ---
export const ANCESTRIES: AncestryDefinition[] = [
    { name: "Anão", height: "1,2m - 1,65m", life: "250 anos", ability: "Pele Espessa", abilityDesc: "Ao sofrer dano menor, marca 2 Fadiga em vez de perder Vida.", imgName: "Ancestralidades_anao.png" },
    { name: "Clank", height: "Variável", life: "Indefinida", ability: "Projeto Intencional", abilityDesc: "+1 permanente em uma Experiência ligada ao seu propósito.", imgName: "Ancestralidades_clank.png" },
    { name: "Drakona", height: "1,5m - 2,1m", life: "350 anos", ability: "Sopro Elemental", abilityDesc: "Ataque de alcance muito próximo (d8 dano mágico).", imgName: "Ancestralidades_drakona.png" },
    { name: "Elfo", height: "1,8m - 1,95m", life: "350 anos", ability: "Reação Rápida", abilityDesc: "Marque 1 Fadiga para ter vantagem em testes de reação.", imgName: "Ancestralidades_elfo.png" },
    { name: "Fada", height: "60cm - 2,1m", life: "50 anos", ability: "Asas", abilityDesc: "Capacidade de voar inerente.", imgName: "Ancestralidades_fada.png" },
    { name: "Fauno", height: "Médio", life: "Longo", ability: "Salto Caprino", abilityDesc: "Salta para qualquer ponto próximo ignorando obstáculos.", imgName: "Ancestralidades_fauno.png" },
    { name: "Firbolg", height: "1,5m - 2,1m", life: "150 anos", ability: "Investida", abilityDesc: "Ao se mover para combate, cause 1d12 de dano extra.", imgName: "Ancestralidades_firbolg.png" },
    { name: "Fungril", height: "60cm - 2,1m", life: "300+ anos", ability: "Conexão Fungril", abilityDesc: "Comunica-se mentalmente com outros fungris.", imgName: "Ancestralidades_fungril.png" },
    { name: "Galapa", height: "1,2m - 1,8m", life: "150 anos", ability: "Carapaça", abilityDesc: "Bônus nos limiares de dano igual à Proficiência.", imgName: "Ancestralidades_galapa.png" },
    { name: "Gigante", height: "1,8m - 2,55m", life: "75 anos", ability: "Alcance", abilityDesc: "Considera alcance corpo a corpo como muito próximo.", imgName: "Ancestralidades_gigante.png" },
    { name: "Goblin", height: "90cm - 1,2m", life: "100 anos", ability: "Passo Firme", abilityDesc: "Ignora desvantagem em testes de Agilidade.", imgName: "Ancestralidades_goblin.png" },
    { name: "Humano", height: "1,5m - 1,95m", life: "100 anos", ability: "Resiliência", abilityDesc: "Começa com +1 espaço de Ponto de Fadiga.", imgName: "Ancestralidades_humano.png" },
    { name: "Infernis", height: "1,5m - 2,1m", life: "Médio", ability: "Aspecto Apavorante", abilityDesc: "Vantagem em testes para intimidar.", imgName: "Ancestralidades_infernis.png" },
    { name: "Katari", height: "1,5m - 1,95m", life: "150 anos", ability: "Instinto Felino", abilityDesc: "Gaste 2 Esperança para rolar novamente testes de Agilidade.", imgName: "Ancestralidades_katari.png" },
    { name: "Orc", height: "1,5m - 1,95m", life: "125 anos", ability: "Presas", abilityDesc: "Gaste 1 Esperança ao acertar ataque corpo a corpo para causar +1d6 de dano.", imgName: "Ancestralidades_orc.png" },
    { name: "Pequenino", height: "90cm - 1,2m", life: "150 anos", ability: "Talismã da Sorte", abilityDesc: "Todo o grupo recebe 1 Ponto de Esperança no início da sessão.", imgName: "Ancestralidades_pequenino.png" },
    { name: "Quacho", height: "90cm - 1,35m", life: "100 anos", ability: "Linguarudo", abilityDesc: "Usa língua como arma de alcance próximo (d12 dano).", imgName: "Ancestralidades_quacho.png" },
    { name: "Símio", height: "60cm - 1,8m", life: "100 anos", ability: "Escalador Natural", abilityDesc: "Vantagem em Agilidade para escalar e equilibrar.", imgName: "Ancestralidades_simio.png" }
];

// --- DADOS DE COMUNIDADE ---
export const COMMUNITIES: CommunityDefinition[] = [
    { name: "Aristocrática", ability: "Privilégio", abilityDesc: "Vantagem para negociar ou usar reputação.", imgName: "comunidade-aristocrata.png" },
    { name: "Disciplinada", ability: "Princípios", abilityDesc: "Uma vez por descanso, role 1d20 como Esperança ao seguir seus princípios.", imgName: "comunidade-disciplinada.png" },
    { name: "Erudita", ability: "Culto", abilityDesc: "Vantagem em testes de cultura, história ou política.", imgName: "comunidade-erudita.png" },
    { name: "Fora da Lei", ability: "Malandro", abilityDesc: "Vantagem para negociar com criminosos ou perceber mentiras.", imgName: "comunidade-fora-da-lei.png" },
    { name: "Marítima", ability: "Conhecer a Maré", abilityDesc: "Acumule marcadores de Medo para ganhar bônus em testes futuros.", imgName: "comunidade-maritima.png" },
    { name: "Montanhesa", ability: "Firme", abilityDesc: "Vantagem para cruzar abismos e sobrevivência em locais inóspitos.", imgName: "comunidade-montanhesa.png" },
    { name: "Nômade", ability: "Mochila de Nômade", abilityDesc: "Gaste 1 Esperança para tirar um item útil da mochila (1x/sessão).", imgName: "comunidade-nomade.png" },
    { name: "Silvestre", ability: "Pés Leves", abilityDesc: "Vantagem em testes para se mover sem ser ouvido.", imgName: "comunidade-silvestre.png" },
    { name: "Subterrânea", ability: "Engenharia Obscura", abilityDesc: "Vantagem para navegar e sobreviver no escuro.", imgName: "comunidade-subterranea.png" }
];