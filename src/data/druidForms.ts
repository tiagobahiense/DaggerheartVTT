// src/data/druidForms.ts

export interface DruidAbility {
    name: string;
    description: string;
  }
  
  export interface DruidFormOption {
    name: string;
    examples: string;
    stats: string;
    damage: string;
    passive: string;
    abilities: DruidAbility[];
  }
  
  export interface DruidTier {
    id: number;
    label: string;
    forms: DruidFormOption[];
  }
  
  export const DRUID_FORMS: DruidTier[] = [
    {
      id: 1,
      label: "1º Patamar",
      forms: [
        {
          name: "Animal Doméstico",
          examples: "(Cão, coelho, gato etc.)",
          stats: "Instinto +1 | Evasão +2",
          damage: "d6 de dano fís. (Instinto)",
          passive: "Vantagem ao escalar, localizar, proteger",
          abilities: [
            { 
              name: "Companhia", 
              description: "Ao ajudar um aliado, você pode rolar 1d8 como seu dado de vantagem." 
            },
            { 
              name: "Frágil", 
              description: "Ao sofrer dano maior ou superior, você sai da Forma de Fera." 
            }
          ]
        },
        {
          name: "Aracnídeo Espreitador",
          examples: "(Aranha-lobo, tarântula etc.)",
          stats: "Acuidade +1 | Evasão +2",
          damage: "d6+1 de dano fís. (Acuidade)",
          passive: "Vantagem ao atacar, escalar, mover-se furtivamente",
          abilities: [
            { 
              name: "Lança-teia", 
              description: "Pode Imobilizar temporariamente um alvo próximo se passar em teste de Acuidade. Útil em explorações (suporta uma criatura)." 
            },
            { 
              name: "Picada Peçonhenta", 
              description: "Ataque deixa alvo Envenenado (sofre 1d10 de dano físico direto cada vez que age)." 
            }
          ]
        },
        {
          name: "Explorador Ágil",
          examples: "(Camundongo, doninha, raposa etc.)",
          stats: "Agilidade +1 | Evasão +2",
          damage: "d4 de dano fís. (Agilidade)",
          passive: "Vantagem em enganar, localizar, mover-se furtivamente",
          abilities: [
            { 
              name: "Ágil", 
              description: "Movimento silencioso. Gaste 1 Ponto de Esperança para mover-se até um ponto distante sem teste." 
            },
            { 
              name: "Frágil", 
              description: "Ao sofrer dano maior ou superior, você sai da Forma de Fera." 
            }
          ]
        },
        {
          name: "Explorador Aquático",
          examples: "(Enguia, peixe, polvo etc.)",
          stats: "Agilidade +1 | Evasão +2",
          damage: "d4 de dano fís. (Agilidade)",
          passive: "Vantagem ao mover-se furtivamente, nadar, orientar-se",
          abilities: [
            { 
              name: "Aquático", 
              description: "Você pode respirar e se movimentar naturalmente embaixo d’água." 
            },
            { 
              name: "Frágil", 
              description: "Ao sofrer dano maior ou superior, você sai da Forma de Fera." 
            }
          ]
        },
        {
          name: "Predador de Bando",
          examples: "(Coiote, hiena, lobo etc.)",
          stats: "Força +2 | Evasão +1",
          damage: "d8+2 de dano fís. (Força)",
          passive: "Vantagem ao atacar, correr, rastrear",
          abilities: [
            { 
              name: "Caça em Bando", 
              description: "Dano aumenta em +1d8 se atacar um alvo atingido por um aliado imediatamente antes de você." 
            },
            { 
              name: "Golpe Debilitante", 
              description: "Ao acertar ataque corpo a corpo, marque 1 Fadiga para tornar o alvo temporariamente Vulnerável." 
            }
          ]
        },
        {
          name: "Ruminante Arisco",
          examples: "(Cabra, cervo, gazela etc.)",
          stats: "Agilidade +1 | Evasão +3",
          damage: "d6 de dano fís. (Agilidade)",
          passive: "Vantagem ao correr, mover-se furtivamente, saltar",
          abilities: [
            { 
              name: "Presa Arisca", 
              description: "Quando sofre ataque, marque 1 Fadiga para rolar 1d4 e somar à sua Evasão." 
            },
            { 
              name: "Frágil", 
              description: "Ao sofrer dano maior ou superior, você sai da Forma de Fera." 
            }
          ]
        }
      ]
    },
    {
      id: 2,
      label: "2º Patamar",
      forms: [
        {
          name: "Carapaça Vigilante",
          examples: "(Pangolim, tartaruga, tatu etc.)",
          stats: "Força +1 | Evasão +1",
          damage: "d8+2 de dano fís. (Força)",
          passive: "Vantagem ao cavar, localizar, proteger",
          abilities: [
            { 
              name: "Canhão Ricochete", 
              description: "Marque 1 Fadiga para ser arremessado por um aliado (Teste Agi/For). Sucesso causa d12+2 dano (Prof. do aliado). Gaste 1 Esperança para ricochetear em outro alvo (metade do dano)." 
            },
            { 
              name: "Carapaça Reforçada", 
              description: "Resistência a dano físico. Marque 1 PA para se recolher: reduz dano físico igual sua Armadura, mas não age." 
            }
          ]
        },
        {
          name: "Fera Alada",
          examples: "(Coruja, corvo, gavião etc.)",
          stats: "Acuidade +1 | Evasão +3",
          damage: "d4+2 de dano fís. (Acuidade)",
          passive: "Vantagem ao enganar, intimidar, localizar",
          abilities: [
            { 
              name: "Visão Aérea", 
              description: "Voa à vontade. 1x/descanso pergunta ao mestre sobre paisagem sem teste; primeira ação relacionada tem vantagem." 
            },
            { 
              name: "Ossos Ocos", 
              description: "Penalidade de –2 nos seus limiares de dano." 
            }
          ]
        },
        {
          name: "Fera Poderosa",
          examples: "(Alce, touro, urso etc.)",
          stats: "Força +3 | Evasão +1",
          damage: "d10+4 de dano fís. (Força)",
          passive: "Vantagem ao intimidar, orientar-se, proteger",
          abilities: [
            { 
              name: "Ataque Violento", 
              description: "Se tirar 1 no dado de dano, soma +1d10. Pode marcar 1 Fadiga antes do ataque para +1 Proficiência." 
            },
            { 
              name: "Couro Espesso", 
              description: "Recebe +2 de bônus nos seus limiares de dano." 
            }
          ]
        },
        {
          name: "Predador Furtivo",
          examples: "(Guepardo, leão, onça etc.)",
          stats: "Instinto +1 | Evasão +3",
          damage: "d8+6 de dano fís. (Instinto)",
          passive: "Vantagem ao atacar, escalar, mover-se furtivamente",
          abilities: [
            { 
              name: "Abate", 
              description: "Marque 1 Fadiga para mover até corpo a corpo e atacar. Sucesso dá +2 Proficiência e alvo marca 1 Fadiga." 
            },
            { 
              name: "Disparada", 
              description: "Gaste 1 Esperança para mover-se até alcance distante sem teste." 
            }
          ]
        },
        {
          name: "Serpente Traiçoeira",
          examples: "(Cascavel, naja, víbora etc.)",
          stats: "Acuidade +1 | Evasão +2",
          damage: "d8+4 de dano fís. (Acuidade)",
          passive: "Vantagem ao deslizar, enganar, escalar",
          abilities: [
            { 
              name: "Bote Peçonhento", 
              description: "Ataque contra todos alvos muito próximos. Sucesso deixa Envenenado (1d10 dano físico ao agir)." 
            },
            { 
              name: "Silvo de Alerta", 
              description: "Marque 1 Fadiga para afastar todos alvos corpo a corpo até ficarem muito próximos." 
            }
          ]
        },
        {
          name: "Trotador Robusto",
          examples: "(Camelo, cavalo, zebra etc.)",
          stats: "Agilidade +1 | Evasão +2",
          damage: "d8+1 de dano fís. (Agilidade)",
          passive: "Vantagem ao correr, orientar-se, saltar",
          abilities: [
            { 
              name: "Atropelar", 
              description: "Marque 1 Fadiga para mover próximo em linha reta e atacar todos na linha. Dano d8+1 e Vulnerável." 
            },
            { 
              name: "Besta de Carga", 
              description: "Pode carregar até dois aliados voluntários enquanto se movimenta." 
            }
          ]
        }
      ]
    },
    {
      id: 3,
      label: "3º Patamar",
      forms: [
        {
          name: "Fera Lendária",
          examples: "(Aprimoramento de 1º patamar)",
          stats: "+1 Atributo | +2 Evasão",
          damage: "+6 Dano Físico",
          passive: "Mantém atributos e habilidades da forma original.",
          abilities: [
            { 
              name: "Evoluído", 
              description: "Escolha uma forma de 1º patamar. Torna-se maior e mais poderosa. Ganha +6 dano, +1 atributo da forma, +2 Evasão." 
            }
          ]
        },
        {
          name: "Grande Fera Alada",
          examples: "(Águia-gigante, falcão etc.)",
          stats: "Acuidade +2 | Evasão +3",
          damage: "d8+6 de dano fís. (Acuidade)",
          passive: "Vantagem ao distrair, enganar, localizar",
          abilities: [
            { 
              name: "Visão Aérea", 
              description: "Voa à vontade. 1x/descanso pergunta sobre paisagem; primeira ação relacionada tem vantagem." 
            },
            { 
              name: "Besta de Carga", 
              description: "Pode carregar até dois aliados voluntários enquanto se movimenta." 
            }
          ]
        },
        {
          name: "Grande Predador",
          examples: "(Lobo-atroz, tigre-dentes-de-sabre etc.)",
          stats: "Força +2 | Evasão +2",
          damage: "d12+8 de dano fís. (Força)",
          passive: "Vantagem ao atacar, correr, mover-se furtivamente",
          abilities: [
            { 
              name: "Ataque Voraz", 
              description: "Ao acertar, gaste 1 Esperança para deixar alvo Vulnerável e receber +1 Proficiência no ataque." 
            },
            { 
              name: "Besta de Carga", 
              description: "Pode carregar até dois aliados voluntários enquanto se movimenta." 
            }
          ]
        },
        {
          name: "Híbrido Lendário",
          examples: "(Esfinge, grifo etc.)",
          stats: "Força +2 | Evasão +3",
          damage: "d10+8 de dano fís. (Força)",
          passive: "Forma Customizável (Requer +1 Fadiga)",
          abilities: [
            { 
              name: "Habilidades Híbridas", 
              description: "Marque 1 Fadiga extra para transformar. Escolha 2 formas (1º ou 2º patamar). Escolha total de 4 vantagens e 2 habilidades delas." 
            }
          ]
        },
        {
          name: "Lagarto Poderoso",
          examples: "(Crocodilo, jacaré, monstro-de-gila etc.)",
          stats: "Instinto +2 | Evasão +1",
          damage: "d10+7 de dano fís. (Instinto)",
          passive: "Vantagem ao atacar, mover-se furtivamente, rastrear",
          abilities: [
            { 
              name: "Armadura Física", 
              description: "Recebe bônus de +3 em seus limiares de dano." 
            },
            { 
              name: "Golpe Súbito", 
              description: "Ao acertar corpo a corpo, gaste 1 Esperança para segurar o alvo com mandíbula: Imobilizado e Vulnerável." 
            }
          ]
        },
        {
          name: "Predador Aquático",
          examples: "(Golfinho, orca, tubarão etc.)",
          stats: "Agilidade +2 | Evasão +4",
          damage: "d10+6 de dano fís. (Agilidade)",
          passive: "Vantagem ao atacar, nadar, rastrear",
          abilities: [
            { 
              name: "Aquático", 
              description: "Respira e movimenta-se naturalmente embaixo d’água." 
            },
            { 
              name: "Ataque Voraz", 
              description: "Ao acertar, gaste 1 Esperança para deixar alvo Vulnerável e receber +1 Proficiência no ataque." 
            }
          ]
        }
      ]
    },
    {
      id: 4,
      label: "4º Patamar",
      forms: [
        {
          name: "Caçador Aéreo Mítico",
          examples: "(Dragão, pterodáctilo, roca, serpe etc.)",
          stats: "Acuidade +3 | Evasão +4",
          damage: "d10+11 de dano fís. (Acuidade)",
          passive: "Vantagem ao atacar, enganar, localizar, orientar-se",
          abilities: [
            { 
              name: "Ave de Rapina Mortal", 
              description: "Voa à vontade. Move distante como parte da ação. Se atacar após mover linha reta, rerrola danos menores que Proficiência." 
            },
            { 
              name: "Besta de Carga", 
              description: "Pode carregar até três aliados voluntários enquanto se movimenta." 
            }
          ]
        },
        {
          name: "Fera Aquática Épica",
          examples: "(Baleia, lula-gigante etc.)",
          stats: "Agilidade +3 | Evasão +3",
          damage: "d10+10 de dano fís. (Agilidade)",
          passive: "Vantagem ao intimidar, localizar, proteger, rastrear",
          abilities: [
            { 
              name: "Mestre do Oceano", 
              description: "Aquático. Ao acertar ataque corpo a corpo, pode deixar o alvo Imobilizado." 
            },
            { 
              name: "Robusto", 
              description: "Ao marcar PA, role 1d6. Se 5+, reduz gravidade sem gastar o PA." 
            }
          ]
        },
        {
          name: "Fera Massiva",
          examples: "(Elefante, mamute, rinoceronte etc.)",
          stats: "Força +3 | Evasão +1",
          damage: "d12+12 de dano fís. (Força)",
          passive: "Vantagem ao correr, intimidar, localizar, proteger",
          abilities: [
            { 
              name: "Demolir", 
              description: "Gaste 1 Esperança: move distante em linha reta atacando todos na linha (d8+10 dano + Vulnerável)." 
            },
            { 
              name: "Impávido", 
              description: "Recebe bônus de +2 em seus limiares de dano. Pode carregar até 4 aliados." 
            }
          ]
        },
        {
          name: "Fera Mítica",
          examples: "(Aprimoramento de 1º ou 2º patamar)",
          stats: "+2 Atributo | +3 Evasão",
          damage: "+9 Dano | +1 Passo de Dado",
          passive: "Mantém atributos e habilidades da forma original.",
          abilities: [
            { 
              name: "Evoluído", 
              description: "Escolha forma de 1º ou 2º patamar. Ganha +9 dano, +2 atributo, +3 Evasão. Dado de dano aumenta um passo (ex: d8 vira d10)." 
            }
          ]
        },
        {
          name: "Híbrido Mítico",
          examples: "(Cocatriz, mantícora, quimera etc.)",
          stats: "Força +3 | Evasão +2",
          damage: "d12+10 de dano fís. (Força)",
          passive: "Forma Customizável (Requer +2 Fadiga)",
          abilities: [
            { 
              name: "Habilidades Híbridas", 
              description: "Marque 2 Fadiga extra para transformar. Escolha 2 formas (1º a 3º patamar). Escolha total de 5 vantagens e 3 habilidades delas." 
            }
          ]
        },
        {
          name: "Lagarto Terrível",
          examples: "(Braquiossauro, tiranossauro etc.)",
          stats: "Força +3 | Evasão +2",
          damage: "d12+10 de dano fís. (Força)",
          passive: "Vantagem ao atacar, enganar, intimidar, rastrear",
          abilities: [
            { 
              name: "Disparada Massiva", 
              description: "Move até distante sem teste. Ignora terreno difícil por tamanho." 
            },
            { 
              name: "Golpes Devastadores", 
              description: "Quando causa dano grave corpo a corpo, marque 1 Fadiga para forçar alvo a marcar 1 PV adicional." 
            }
          ]
        }
      ]
    }
  ];