import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ArrowRight, CaretLeft, MagicWand, Users, Crown, Compass } from '@phosphor-icons/react';
import { CLASS_DATABASE } from '../data/classDatabase'; 

// --- BANCO DE DADOS DO SISTEMA ---
const RPG_DATA: any = {
  classes: {
    bardo: {
      label: "Bardo",
      desc: "Artistas carismáticos e performáticos.",
      longDesc: "Especialistas em interações sociais e apoio ao grupo. Tecem magia através de palavras e música.",
      domains: ["Códice", "Graça"],
      ability: { name: "Inspiração", text: "Fornece dados de inspiração para aliados usarem em testes ou para recuperar Fadiga." },
      color: "#f43f5e",
      img: "/classes/bardoperfil.png",
      position: "center 20%",
      subclasses: [
        { name: "Beletrista", desc: "Usa o poder das palavras para motivar aliados e influenciar multidões." },
        { name: "Trovador", desc: "Tece canções que fortalecem seus aliados e contam histórias de glória." }
      ]
    },
    druida: {
      label: "Druida",
      desc: "Guardiões da natureza que mudam de forma.",
      longDesc: "Canalizam magia primal e protegem o equilíbrio natural do mundo.",
      domains: ["Arcano", "Sabedoria"],
      ability: { name: "Forma de Fera", text: "Transforma-se magicamente em animais, ganhando novos atributos e habilidades." },
      color: "#22c55e",
      img: "/classes/druidaperfil.png",
      position: "center 15%",
      subclasses: [
        { name: "Protetor dos Elementos", desc: "Incorpora elementos como fogo ou gelo para causar dano ou efeitos em área." },
        { name: "Protetor da Renovação", desc: "Focado em curar o grupo com efeitos mágicos poderosos e regeneração." }
      ]
    },
    feiticeiro: {
      label: "Feiticeiro",
      desc: "Conjuradores de magia inata e caótica.",
      longDesc: "Seu poder vem do instinto e da linhagem, frequentemente imprevisível e devastador.",
      domains: ["Arcano", "Meia-noite"],
      ability: { name: "Canalizar Poder Bruto", text: "Pode converter cartas da mão em Pontos de Esperança ou bônus de dano." },
      color: "#a855f7",
      img: "/classes/feiticeiroperfil.png",
      position: "center 20%",
      subclasses: [
        { name: "Elementalista", desc: "Molda elementos específicos como fogo, gelo ou relâmpago com maestria." },
        { name: "Primordialista", desc: "Manipula a essência pura da magia para ampliar a versatilidade dos feitiços." }
      ]
    },
    guardiao: {
      label: "Guardião",
      desc: "Defensores blindados e imparáveis.",
      longDesc: "O escudo do grupo, focado em resistência, proteção e controle do campo de batalha.",
      domains: ["Valor", "Lâmina"],
      ability: { name: "Determinação", text: "Recebe um Dado de Determinação que cresce conforme causa dano." },
      color: "#64748b",
      img: "/classes/guardiaoperfil.png",
      position: "center 20%",
      subclasses: [
        { name: "Baluarte", desc: "Especialista em absorver dano massivo e permanecer de pé onde outros cairiam." },
        { name: "Vingador", desc: "Pune severamente os inimigos que ousam ameaçar seus aliados." }
      ]
    },
    guerreiro: {
      label: "Guerreiro",
      desc: "Mestres do combate tático.",
      longDesc: "Combatentes versáteis que dominam o uso de todas as armas e armaduras.",
      domains: ["Falange", "Lâmina"],
      ability: { name: "Ataque de Oportunidade", text: "Pode reagir e punir inimigos que tentam sair do seu alcance." },
      color: "#ea580c",
      img: "/classes/guerreiroperfil.png",
      position: "center 25%",
      subclasses: [
        { name: "Escolhido da Bravura", desc: "Ganha bônus significativos ao enfrentar oponentes mais fortes que você." },
        { name: "Escolhido da Matança", desc: "Focado em golpes brutais, selvageria e dano elevado." }
      ]
    },
    ladino: {
      label: "Ladino",
      desc: "Especialistas em furtividade e sombras.",
      longDesc: "Mestres do subterfúgio, ataques surpresa e táticas desleais.",
      domains: ["Graça", "Meia-noite"],
      ability: { name: "Oculto", text: "Mecânica avançada de furtividade para evitar detecção e ganhar vantagens." },
      color: "#171717",
      img: "/classes/ladinoperfil.png",
      position: "center 10%",
      subclasses: [
        { name: "Gatuno", desc: "Manipula sombras e pode se teleportar entre elas (Passo Sombrio)." },
        { name: "Mafioso", desc: "Possui uma vasta rede de contatos, influência social e recursos do submundo." }
      ]
    },
    mago: {
      label: "Mago",
      desc: "Estudiosos que moldam a realidade.",
      longDesc: "Usam conhecimento, fórmulas e grimórios para conjurar efeitos complexos.",
      domains: ["Códice", "Esplendor"],
      ability: { name: "Padrões Estranhos", text: "Escolhe um número da sorte para obter Esperança ou recuperar Fadiga." },
      color: "#3b82f6",
      img: "/classes/magoperfil.png",
      position: "center 20%",
      subclasses: [
        { name: "Discípulo do Conhecimento", desc: "Focado em versatilidade, utilidade e acesso a um vasto leque de magias." },
        { name: "Discípulo da Guerra", desc: "Aplica a magia de forma agressiva e destrutiva no calor do combate." }
      ]
    },
    patrulheiro: {
      label: "Patrulheiro",
      desc: "Caçadores que dominam os ermos.",
      longDesc: "Exploradores sobrevivencialistas que conhecem o terreno melhor que ninguém.",
      domains: ["Sabedoria", "Lâmina"], 
      ability: { name: "Marca da Presa", text: "Marca um inimigo para rastreamento, causando dano extra ou Fadiga." },
      color: "#15803d",
      img: "/classes/patrulheiroperfil.png",
      position: "center 15%",
      subclasses: [
        { name: "Rastreador", desc: "Especialista em caçar e eliminar alvos específicos isolados." },
        { name: "Treinador", desc: "Forma um vínculo com um Companheiro Animal leal que luta ao seu lado." }
      ]
    },
    serafim: {
      label: "Serafim",
      desc: "Guerreiros celestiais divinos.",
      longDesc: "Ligados a ideais superiores, voam pelo campo de batalha trazendo justiça.",
      domains: ["Valor", "Esplendor"],
      ability: { name: "Dados de Oração", text: "Recebe dados extras no início da sessão para auxiliar aliados." },
      color: "#fbbf24",
      img: "/classes/serafimperfil.png",
      position: "center 10%",
      subclasses: [
        { name: "Portador Divino", desc: "Empunha uma arma lendária sagrada que voa e retorna à sua mão." },
        { name: "Sentinela Alada", desc: "Especialista em voo, manobras aéreas e combate vindo dos céus." }
      ]
    }
  },

  // DADOS DE ANCESTRALIDADE
  ancestries: [
    { name: "Anão", height: "1,2m - 1,65m", life: "250 anos", ability: "Pele Espessa", abilityDesc: "Ao sofrer dano menor, marca 2 Fadiga em vez de perder Vida.", imgName: "Ancestralidades_anao.png", position: "center 25%" },
    { name: "Clank", height: "Variável", life: "Indefinida", ability: "Projeto Intencional", abilityDesc: "+1 permanente em uma Experiência ligada ao seu propósito.", imgName: "Ancestralidades_clank.png", position: "center 15%" },
    { name: "Drakona", height: "1,5m - 2,1m", life: "350 anos", ability: "Sopro Elemental", abilityDesc: "Ataque de alcance muito próximo (d8 dano mágico).", imgName: "Ancestralidades_drakona.png", position: "center 30%" },
    { name: "Elfo", height: "1,8m - 1,95m", life: "350 anos", ability: "Reação Rápida", abilityDesc: "Marque 1 Fadiga para ter vantagem em testes de reação.", imgName: "Ancestralidades_elfo.png", position: "center 10%" },
    { name: "Fada", height: "60cm - 2,1m", life: "50 anos", ability: "Asas", abilityDesc: "Capacidade de voar inerente.", imgName: "Ancestralidades_fada.png", position: "center 40%" },
    { name: "Fauno", height: "Médio", life: "Longo", ability: "Salto Caprino", abilityDesc: "Salta para qualquer ponto próximo ignorando obstáculos.", imgName: "Ancestralidades_fauno.png", position: "center 15%" },
    { name: "Firbolg", height: "1,5m - 2,1m", life: "150 anos", ability: "Investida", abilityDesc: "Ao se mover para combate, cause 1d12 de dano extra.", imgName: "Ancestralidades_firbolg.png", position: "center 15%" },
    { name: "Fungril", height: "60cm - 2,1m", life: "300+ anos", ability: "Conexão Fungril", abilityDesc: "Comunica-se mentalmente com outros fungris.", imgName: "Ancestralidades_fungril.png", position: "center 20%" },
    { name: "Galapa", height: "1,2m - 1,8m", life: "150 anos", ability: "Carapaça", abilityDesc: "Bônus nos limiares de dano igual à Proficiência.", imgName: "Ancestralidades_galapa.png", position: "center 25%" },
    { name: "Gigante", height: "1,8m - 2,55m", life: "75 anos", ability: "Alcance", abilityDesc: "Considera alcance corpo a corpo como muito próximo.", imgName: "Ancestralidades_gigante.png", position: "center 10%" },
    { name: "Goblin", height: "90cm - 1,2m", life: "100 anos", ability: "Passo Firme", abilityDesc: "Ignora desvantagem em testes de Agilidade.", imgName: "Ancestralidades_goblin.png", position: "center 25%" },
    { name: "Humano", height: "1,5m - 1,95m", life: "100 anos", ability: "Resiliência", abilityDesc: "Começa com +1 espaço de Ponto de Fadiga.", imgName: "Ancestralidades_humano.png", position: "center 15%" },
    { name: "Infernis", height: "1,5m - 2,1m", life: "Médio", ability: "Aspecto Apavorante", abilityDesc: "Vantagem em testes para intimidar.", imgName: "Ancestralidades_infernis.png", position: "center 15%" },
    { name: "Katari", height: "1,5m - 1,95m", life: "150 anos", ability: "Instinto Felino", abilityDesc: "Gaste 2 Esperança para rolar novamente testes de Agilidade.", imgName: "Ancestralidades_katari.png", position: "center 15%" },
    { name: "Orc", height: "1,5m - 1,95m", life: "125 anos", ability: "Presas", abilityDesc: "Gaste 1 Esperança ao acertar ataque corpo a corpo para causar +1d6 de dano.", imgName: "Ancestralidades_orc.png", position: "center 15%" },
    { name: "Pequenino", height: "90cm - 1,2m", life: "150 anos", ability: "Talismã da Sorte", abilityDesc: "Todo o grupo recebe 1 Ponto de Esperança no início da sessão.", imgName: "Ancestralidades_pequenino.png", position: "center 30%" },
    { name: "Quacho", height: "90cm - 1,35m", life: "100 anos", ability: "Linguarudo", abilityDesc: "Usa língua como arma de alcance próximo (d12 dano).", imgName: "Ancestralidades_quacho.png", position: "center 25%" },
    { name: "Símio", height: "60cm - 1,8m", life: "100 anos", ability: "Escalador Natural", abilityDesc: "Vantagem em Agilidade para escalar e equilibrar.", imgName: "Ancestralidades_simio.png", position: "center 20%" }
  ],

  communities: [
    { name: "Aristocrática", ability: "Privilégio", abilityDesc: "Vantagem para negociar ou usar reputação.", imgName: "comunidade-aristocrata.png" },
    { name: "Disciplinada", ability: "Princípios", abilityDesc: "Uma vez por descanso, role 1d20 como Esperança ao seguir seus princípios.", imgName: "comunidade-disciplinada.png" },
    { name: "Erudita", ability: "Culto", abilityDesc: "Vantagem em testes de cultura, história ou política.", imgName: "comunidade-erudita.png" },
    { name: "Fora da Lei", ability: "Malandro", abilityDesc: "Vantagem para negociar com criminosos ou perceber mentiras.", imgName: "comunidade-fora-da-lei.png" },
    { name: "Marítima", ability: "Conhecer a Maré", abilityDesc: "Acumule marcadores de Medo para ganhar bônus em testes futuros.", imgName: "comunidade-maritima.png" },
    { name: "Montanhesa", ability: "Firme", abilityDesc: "Vantagem para cruzar abismos e sobrevivência em locais inóspitos.", imgName: "comunidade-montanhesa.png" },
    { name: "Nômade", ability: "Mochila de Nômade", abilityDesc: "Gaste 1 Esperança para tirar um item útil da mochila (1x/sessão).", imgName: "comunidade-nomade.png" },
    { name: "Silvestre", ability: "Pés Leves", abilityDesc: "Vantagem em testes para se mover sem ser ouvido.", imgName: "comunidade-silvestre.png" },
    { name: "Subterrânea", ability: "Engenharia Obscura", abilityDesc: "Vantagem para navegar e sobreviver no escuro.", imgName: "comunidade-subterranea.png" }
  ]
};

export default function CharacterCreation() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0); 
  const [rotation, setRotation] = useState(0);
  const [hoverClass, setHoverClass] = useState<string | null>(null);
  
  const [charData, setCharData] = useState({
    name: '',
    classId: '',
    subclass: '',
    ancestry: '',
    community: '',
    heritage: '',
  });

  const [loading, setLoading] = useState(false);

  const classKeys = Object.keys(RPG_DATA.classes);
  const angleStep = 360 / classKeys.length;

  useEffect(() => {
    if (step === 0 && !hoverClass) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.05);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, hoverClass]);

  // --- HANDLERS ---
  const selectClass = (key: string) => {
    setCharData({ ...charData, classId: key, subclass: '' });
    setStep(1);
  };

  const selectSubclass = (subName: string) => {
    setCharData({ ...charData, subclass: subName });
    setStep(2);
  };

  const selectAncestry = (ancName: string) => {
    setCharData({ ...charData, ancestry: ancName });
    setStep(3);
  };

  const selectCommunity = (comName: string) => {
    setCharData({ ...charData, community: comName });
    setStep(4);
  };

  const finishCreation = async () => {
    if (!charData.name || !charData.heritage) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      const classInfo = RPG_DATA.classes[charData.classId];

      await addDoc(collection(db, 'characters'), {
        playerId: user.uid,
        name: charData.name,
        class: classInfo.label,
        subclass: charData.subclass,
        ancestry: charData.ancestry,
        community: charData.community,
        heritage: charData.heritage,
        level: 1,
        stats: {}, 
        inventory: [],
        gold: 0,
        createdAt: new Date().toISOString()
      });

      navigate('/vtt-jogador');
    } catch (error) {
      console.error("Erro ao criar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-sans select-none">
      
      {/* Fundo */}
      <div className="absolute inset-0 z-0">
        <img src="/wallpaper.jpg" className="w-full h-full object-cover opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0f0518]/90 to-black" />
      </div>

      {/* Topo: Breadcrumbs */}
      <div className="relative z-20 pt-6 px-8 flex items-center justify-between shrink-0 h-[80px]">
        <div>
          <h1 className="text-3xl text-gold font-rpg tracking-widest">Criação de Lenda</h1>
          <div className="flex items-center gap-2 text-xs text-purple-300/50 mt-1 uppercase tracking-wider font-bold">
            <span className={step >= 0 ? "text-gold" : ""}>Classe</span> <ArrowRight size={10} />
            <span className={step >= 1 ? "text-gold" : ""}>Especialização</span> <ArrowRight size={10} />
            <span className={step >= 2 ? "text-gold" : ""}>Ancestralidade</span> <ArrowRight size={10} />
            <span className={step >= 3 ? "text-gold" : ""}>Comunidade</span> <ArrowRight size={10} />
            <span className={step >= 4 ? "text-gold" : ""}>Identidade</span>
          </div>
        </div>
        
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-purple-400 hover:text-white transition-colors text-sm">
            <CaretLeft /> Voltar
          </button>
        )}
      </div>

      <div className="relative z-10 w-full h-[calc(100%-80px)] flex items-center justify-center overflow-hidden">

        {/* --- ESTÁGIO 0: CÍRCULO DE CLASSES --- */}
        {step === 0 && (
          // Adicionada escala responsiva (scale-75 md:scale-90) para não cortar em notebooks/tablets
          <div className="relative w-[650px] h-[650px] flex items-center justify-center animate-fade-in scale-[0.70] md:scale-[0.85] lg:scale-100 origin-center transition-transform duration-500">
            <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full animate-pulse"></div>
            <div className="absolute w-[250px] h-[250px] border border-gold/10 rounded-full"></div>

            <div className="absolute z-0 text-center pointer-events-none transition-opacity duration-300 w-96">
               <h2 className="text-6xl font-rpg text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                 {hoverClass ? RPG_DATA.classes[hoverClass].label : "Destino"}
               </h2>
               <p className="text-purple-300/80 text-sm tracking-widest mt-4 uppercase border-t border-purple-500/30 pt-4">
                 {hoverClass ? RPG_DATA.classes[hoverClass].desc : "Gire a roda para escolher seu caminho"}
               </p>
               {hoverClass && (
                 <div className="flex justify-center gap-2 mt-2">
                    {RPG_DATA.classes[hoverClass].domains.map((d: string) => (
                      <span key={d} className="text-[10px] bg-purple-900/40 border border-purple-500/30 px-2 py-1 rounded text-purple-200">{d}</span>
                    ))}
                 </div>
               )}
            </div>

            {classKeys.map((key, index) => {
              const angle = (angleStep * index) + rotation;
              const radius = 240; 
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;
              const isHovered = hoverClass === key;
              const classData = RPG_DATA.classes[key];

              return (
                <div
                  key={key}
                  className="absolute cursor-pointer transition-all duration-300 group"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onMouseEnter={() => setHoverClass(key)}
                  onMouseLeave={() => setHoverClass(null)}
                  onClick={() => selectClass(key)}
                >
                  <div 
                    className={`absolute left-1/2 top-1/2 w-[240px] h-[1px] origin-left -z-10 transition-all duration-300 ${isHovered ? 'bg-gold/50' : 'bg-white/5'}`}
                    style={{ transform: `rotate(${angle + 180}deg)` }}
                  />

                  <div 
                    className={`
                      relative w-24 h-24 rounded-full border-2 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]
                      transition-all duration-300 transform bg-black
                      ${isHovered ? 'scale-125 border-gold z-50 brightness-110 shadow-gold/30' : 'scale-100 border-white/20 grayscale hover:grayscale-0'}
                    `}
                    style={{ borderColor: isHovered ? classData.color : '' }}
                  >
                    <img 
                      src={classData.img} 
                      alt={classData.label}
                      className="w-full h-full object-cover transition-transform duration-500"
                      style={{ 
                        objectPosition: classData.position,
                        transform: isHovered ? 'scale(1.1)' : 'scale(1.0)' 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- ESTÁGIOS 1, 2, 3, 4 --- */}
        {step > 0 && (
          <div className="flex w-full h-full px-4 md:px-10 items-start animate-fade-in gap-4 md:gap-12 pb-4 pt-4">
            
            {/* PAINEL ESQUERDO */}
            <div className="hidden md:flex flex-col gap-6 items-center w-[320px] max-w-[320px] shrink-0 border-r border-white/10 pr-8 h-full min-h-0 justify-start pt-2 overflow-y-auto custom-scrollbar pb-20">
              <div className="text-center group w-full">
                <div className="w-32 h-32 rounded-full border-2 border-gold overflow-hidden mx-auto shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-black mb-4">
                  <img 
                    src={RPG_DATA.classes[charData.classId].img} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: RPG_DATA.classes[charData.classId].position }}
                  />
                </div>
                <h2 className="text-gold font-rpg text-3xl">{RPG_DATA.classes[charData.classId].label}</h2>
                <div className="flex flex-col gap-1 mt-2">
                   <span className="text-xs text-purple-300/80">{RPG_DATA.classes[charData.classId].longDesc}</span>
                   <div className="flex justify-center gap-2 mt-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/50 border border-white/10 px-2 rounded">
                         Domínios: {RPG_DATA.classes[charData.classId].domains.join(' & ')}
                      </span>
                   </div>
                </div>
              </div>
              
              <div className={`w-[2px] h-12 bg-gradient-to-b from-gold to-white/10 shrink-0`}></div>

              {/* LISTA DE HABILIDADES DE CLASSE */}
              <div className="w-full flex flex-col gap-2 shrink-0">
                 {CLASS_DATABASE[charData.classId] && CLASS_DATABASE[charData.classId].startingFeatures ? (
                    CLASS_DATABASE[charData.classId].startingFeatures.map((feat: any, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded border border-white/10 text-center shrink-0">
                         <p className="text-[10px] text-gold uppercase tracking-widest mb-1">{feat.title}</p>
                         <p className="text-xs text-white/70 italic leading-relaxed whitespace-pre-line">
                           "{feat.description}"
                         </p>
                      </div>
                    ))
                 ) : (
                    // Fallback
                    <div className="bg-white/5 p-3 rounded border border-white/10 text-center shrink-0">
                       <p className="text-[10px] text-gold uppercase tracking-widest mb-1">Habilidade de Classe</p>
                       <p className="text-purple-200 font-bold text-sm">{RPG_DATA.classes[charData.classId].ability.name}</p>
                       <p className="text-xs text-white/50 mt-1 italic">"{RPG_DATA.classes[charData.classId].ability.text}"</p>
                    </div>
                 )}
              </div>

              {step > 1 && (
                <div className="text-center animate-fade-in w-full pt-4 border-t border-white/5 shrink-0">
                   <div className="w-12 h-12 rounded-full border border-purple-400/50 bg-purple-900/20 flex items-center justify-center mx-auto text-purple-300 mb-2">
                     <MagicWand size={20} />
                   </div>
                   <p className="text-purple-200 font-bold text-lg">{charData.subclass}</p>
                   <p className="text-[10px] text-white/30 uppercase">Especialização</p>
                </div>
              )}

               {step > 2 && (
                <div className="text-center animate-fade-in w-full pt-4 border-t border-white/5 shrink-0">
                    <div className="w-12 h-12 rounded-full border border-green-400/50 bg-green-900/20 flex items-center justify-center mx-auto text-green-300 mb-2">
                      <Users size={20} />
                    </div>
                    <p className="text-green-200 font-bold text-lg">{charData.ancestry}</p>
                    <p className="text-[10px] text-white/30 uppercase">Ancestralidade</p>
                </div>
              )}

              {step > 3 && (
                <div className="text-center animate-fade-in w-full pt-4 border-t border-white/5 shrink-0">
                    <div className="w-12 h-12 rounded-full border border-blue-400/50 bg-blue-900/20 flex items-center justify-center mx-auto text-blue-300 mb-2">
                      <Compass size={20} />
                    </div>
                    <p className="text-blue-200 font-bold text-lg">{charData.community}</p>
                    <p className="text-[10px] text-white/30 uppercase">Comunidade</p>
                </div>
              )}
            </div>

            {/* PAINEL DIREITO */}
            <div className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar p-2">
              
              {/* SELEÇÃO DE SUBCLASSE */}
              {step === 1 && (
                <div className="flex flex-col justify-center max-w-4xl mx-auto min-h-full py-10">
                  <h2 className="text-4xl text-white font-rpg mb-4 text-center drop-shadow-lg">Escolha sua Especialização</h2>
                  <p className="text-center text-white/50 mb-10 max-w-lg mx-auto">
                    Como você aplica os talentos de {RPG_DATA.classes[charData.classId].label}? Escolha o caminho que definirá seu estilo de jogo.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {RPG_DATA.classes[charData.classId].subclasses.map((sub: any) => (
                      <div 
                        key={sub.name}
                        onClick={() => selectSubclass(sub.name)}
                        className="
                          relative overflow-hidden bg-[#0f0518]/60 border border-white/10 rounded-xl p-8
                          hover:border-gold hover:bg-[#0f0518] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] 
                          cursor-pointer transition-all duration-300 group
                        "
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-gold">
                            <Crown size={100} weight="duotone" />
                         </div>
                         <h3 className="text-3xl text-purple-100 font-bold font-rpg group-hover:text-gold mb-4 relative z-10">
                            {sub.name}
                         </h3>
                         <div className="h-[1px] w-20 bg-gradient-to-r from-gold to-transparent mb-4"></div>
                         <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                            {sub.desc}
                         </p>
                         <div className="mt-8 flex justify-end">
                            <span className="text-xs uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                               Selecionar Caminho <ArrowRight />
                            </span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SELEÇÃO DE ANCESTRALIDADE */}
              {step === 2 && (
                <div className="py-4">
                   <h2 className="text-4xl text-white font-rpg mb-8 text-center sticky top-0 bg-black/90 py-4 z-20 backdrop-blur border-b border-white/10">Sua Origem Ancestral</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                      {RPG_DATA.ancestries.map((anc: any) => (
                        <div 
                          key={anc.name} 
                          onClick={() => selectAncestry(anc.name)}
                          className="
                            group cursor-pointer bg-dungeon-stone/30 border border-white/10 rounded-lg overflow-hidden 
                            hover:border-green-400 hover:shadow-lg transition-all flex flex-row h-36
                          "
                        >
                          <div className="w-1/3 relative overflow-hidden bg-gray-900/50">
                             <img 
                                src={`/ancestralidade/${anc.imgName}`} 
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ 
                                  objectPosition: anc.position,
                                  transformOrigin: anc.position
                                }}
                             />
                             <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                          </div>
                          
                          <div className="w-2/3 p-4 flex flex-col justify-center">
                             <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xl font-rpg text-white group-hover:text-green-300">{anc.name}</h3>
                                <span className="text-[10px] text-white/30 border border-white/10 px-1 rounded">{anc.life}</span>
                             </div>
                             
                             <div className="text-xs text-gray-400 mb-2">
                                <span className="text-green-500/80 font-bold">{anc.ability}:</span> {anc.abilityDesc}
                             </div>
                             <p className="text-[10px] text-white/20">Altura média: {anc.height}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* SELEÇÃO DE COMUNIDADE */}
              {step === 3 && (
                <div className="py-4">
                  <h2 className="text-4xl text-white font-rpg mb-8 text-center sticky top-0 bg-black/90 py-4 z-20 backdrop-blur border-b border-white/10">Sua Comunidade</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {RPG_DATA.communities.map((com: any) => (
                      <div 
                        key={com.name} 
                        onClick={() => selectCommunity(com.name)}
                        className="
                          relative h-40 bg-black border border-white/10 rounded-lg overflow-hidden cursor-pointer
                          hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all group flex
                        "
                      >
                         <div className="absolute inset-0 z-0">
                            <img 
                                src={`/comunidade/${com.imgName}`}
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                         </div>

                         <div className="relative z-10 p-6 flex flex-col justify-center w-full">
                           <h3 className="text-2xl font-rpg text-white group-hover:text-blue-300 mb-2">{com.name}</h3>
                           <p className="text-sm text-gray-300">
                              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block mb-1">Habilidade: {com.ability}</span>
                              {com.abilityDesc}
                           </p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FINALIZAÇÃO */}
              {step === 4 && (
                <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto animate-fade-in py-10">
                  <h2 className="text-5xl text-gold font-rpg mb-2 drop-shadow-lg">Quem é você?</h2>
                  <p className="text-white/50 mb-8 text-center">Os últimos detalhes da sua lenda.</p>
                  
                  <div className="w-full space-y-6 bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl">
                    <div>
                      <label className="block text-purple-300 text-xs uppercase tracking-widest mb-2 font-bold">Nome do Personagem</label>
                      <input 
                        type="text" 
                        value={charData.name}
                        onChange={e => setCharData({...charData, name: e.target.value})}
                        className="w-full bg-black/50 border border-purple-500/30 p-4 text-white text-lg rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder="Ex: Vorag, o Implacável"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-300 text-xs uppercase tracking-widest mb-2 font-bold">Herança (Identidade)</label>
                      <input 
                        type="text"
                        value={charData.heritage}
                        onChange={e => setCharData({...charData, heritage: e.target.value})}
                        className="w-full bg-black/50 border border-purple-500/30 p-4 text-white text-lg rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder="Ex: Nobre Anão Exilado das Montanhas"
                      />
                      <p className="text-xs text-white/30 mt-2">Um título curto que resume quem você é, unindo sua Ancestralidade e Comunidade.</p>
                    </div>

                    <button 
                      onClick={finishCreation}
                      disabled={!charData.name || !charData.heritage || loading}
                      className="
                        w-full py-4 mt-4
                        bg-gradient-to-r from-yellow-700 to-yellow-600 
                        border border-yellow-500
                        text-yellow-100 font-bold uppercase tracking-widest text-xl rounded shadow-[0_0_15px_rgba(234,179,8,0.3)]
                        hover:scale-[1.02] hover:brightness-110 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
                      "
                    >
                      {loading ? "Escrevendo Destino..." : "Concluir Criação"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}