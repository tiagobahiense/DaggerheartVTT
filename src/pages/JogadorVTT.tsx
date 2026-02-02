import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  X, Shield, HandGrabbing, Stack, ArrowsOutSimple, 
  MagnifyingGlass, LockKey, Scroll, Plus, 
  ArrowsLeftRight, Coin, Skull, Sparkle, Campfire, MoonStars,
  Dna, Coins, Cube, ArrowUUpLeft
} from '@phosphor-icons/react';

// --- IMPORTAÇÕES DE DADOS E COMPONENTES ---
import CARTAS_JSON from '../data/cartas.json'; 
import { SheetModal } from '../components/SheetModal';

// ==================================================================================
// 1. TIPOS GERAIS
// ==================================================================================

interface Card {
  caminho: string;
  nome: string;
  categoria: string;
}

interface ActiveCard extends Card {
  uniqueId: string;
  isExhausted: boolean;
  exhaustionType: 'short' | 'long' | null;
  tokens: number;
}

interface Character {
  id: string;
  name: string;
  class: string;
  subclass: string;
  ancestry: string;
  community: string;
  heritage: string;
  level: number;
  attributes?: any;
  weapons?: any;
  armor?: any;
  imageUrl?: string;
  paSpent?: number;
  // Persistência das cartas
  cards?: {
    hand: ActiveCard[];
    reserve: Card[];
  };
}

// Resultado da Dualidade
interface DualityResult {
  type: 'DUALITY';
  hopeDie: number;
  fearDie: number;
  modifier: number;
  total: number;
  outcome: 'CRITICAL' | 'HOPE' | 'FEAR';
  isSuccess: boolean;
}

// Resultado Padrão (d20, dano, etc)
interface StandardResult {
  type: 'STANDARD';
  rolls: number[];
  dieType: number;
  modifier: number;
  total: number;
}

type RollResult = DualityResult | StandardResult;

// --- CORES DE FUNDO/HUD ---
const CLASS_COLORS: Record<string, string> = {
  "Bardo": "#f43f5e", "Druida": "#22c55e", "Feiticeiro": "#a855f7", "Guardião": "#64748b",
  "Guerreiro": "#ea580c", "Ladino": "#171717", "Mago": "#3b82f6", "Patrulheiro": "#15803d", "Serafim": "#fbbf24",
};
const ANCESTRY_COLORS: Record<string, string> = {
  "Anão": "#78350f", "Clank": "#94a3b8", "Drakona": "#b91c1c", "Elfo": "#fcd34d", "Fada": "#f472b6",
  "Fauno": "#84cc16", "Firbolg": "#065f46", "Fungril": "#a3e635", "Galapa": "#0d9488", "Gigante": "#475569",
  "Goblin": "#4ade80", "Humano": "#38bdf8", "Infernis": "#dc2626", "Katari": "#f59e0b", "Orc": "#3f6212",
  "Pequenino": "#fb923c", "Quacho": "#0ea5e9", "Símio": "#a16207",
};

// ==================================================================================
// 2. COMPONENTE: SISTEMA DE DADOS (DiceSystem)
// ==================================================================================
function InternalDiceSystem({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'DUALITY' | 'STANDARD'>('DUALITY');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  // Estados Dualidade
  const [modifier, setModifier] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(12);
  const [advantage, setAdvantage] = useState<'none' | 'advantage' | 'disadvantage'>('none');

  // Estados Standard
  const [selectedDie, setSelectedDie] = useState(20); // d20 padrão
  const [diceCount, setDiceCount] = useState(1);
  const [standardMod, setStandardMod] = useState(0);

  // --- ROLAGEM DUALIDADE ---
  const rollDuality = () => {
    setIsRolling(true);
    setResult(null);

    setTimeout(() => {
      const hope = Math.floor(Math.random() * 12) + 1;
      const fear = Math.floor(Math.random() * 12) + 1;
      
      let advRoll = 0;
      if (advantage !== 'none') advRoll = Math.floor(Math.random() * 6) + 1;
      const finalAdvMod = advantage === 'advantage' ? advRoll : advantage === 'disadvantage' ? -advRoll : 0;

      const total = hope + fear + modifier + finalAdvMod;

      let outcome: 'CRITICAL' | 'HOPE' | 'FEAR' = 'FEAR';
      if (hope === fear) outcome = 'CRITICAL';
      else if (hope > fear) outcome = 'HOPE';
      else outcome = 'FEAR';

      setResult({
        type: 'DUALITY',
        hopeDie: hope,
        fearDie: fear,
        modifier: modifier + finalAdvMod,
        total,
        outcome,
        isSuccess: total >= difficulty
      });
      setIsRolling(false);
    }, 1000);
  };

  // --- ROLAGEM PADRÃO ---
  const rollStandard = () => {
    setIsRolling(true);
    setResult(null);

    setTimeout(() => {
        const rolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * selectedDie) + 1);
        const sum = rolls.reduce((a, b) => a + b, 0);
        
        setResult({
            type: 'STANDARD',
            rolls,
            dieType: selectedDie,
            modifier: standardMod,
            total: sum + standardMod
        });
        setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#1a1520] border border-gold/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4">
                <button 
                    onClick={() => { setTab('DUALITY'); setResult(null); }}
                    className={`text-lg font-rpg font-bold px-3 py-1 rounded transition-colors ${tab === 'DUALITY' ? 'text-gold bg-white/10' : 'text-white/30 hover:text-white'}`}
                >
                    Dualidade
                </button>
                <button 
                    onClick={() => { setTab('STANDARD'); setResult(null); }}
                    className={`text-lg font-rpg font-bold px-3 py-1 rounded transition-colors ${tab === 'STANDARD' ? 'text-gold bg-white/10' : 'text-white/30 hover:text-white'}`}
                >
                    Dados Padrão
                </button>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-red-400"><X size={24} /></button>
        </div>

        {tab === 'DUALITY' && !isRolling && !result && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between gap-4">
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
                <div className="flex items-center gap-3 justify-center">
                  <button onClick={() => setModifier(m => m - 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                  <button onClick={() => setModifier(m => m + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
                </div>
              </div>
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Dificuldade</label>
                <input type="number" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="w-full bg-transparent text-xl font-bold text-white text-center outline-none border-b border-white/20 focus:border-gold" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setAdvantage(v => v === 'advantage' ? 'none' : 'advantage')} className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${advantage === 'advantage' ? 'bg-green-900/50 border-green-500 text-green-100' : 'bg-black/40 border-white/10 text-white/40'}`}>Vantagem (+d6)</button>
              <button onClick={() => setAdvantage(v => v === 'disadvantage' ? 'none' : 'disadvantage')} className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${advantage === 'disadvantage' ? 'bg-red-900/50 border-red-500 text-red-100' : 'bg-black/40 border-white/10 text-white/40'}`}>Desvantagem (-d6)</button>
            </div>

            <button onClick={rollDuality} className="w-full py-4 bg-gradient-to-r from-gold/80 to-yellow-600/80 hover:from-gold hover:to-yellow-500 text-black font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
              <Dna size={24} weight="fill" /> ROLAR DUALIDADE
            </button>
          </div>
        )}

        {tab === 'STANDARD' && !isRolling && !result && (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 10, 12, 20, 100].map(d => (
                        <button 
                            key={d} 
                            onClick={() => setSelectedDie(d)}
                            className={`py-2 rounded border text-sm font-bold ${selectedDie === d ? 'bg-purple-900 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                            d{d}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                     <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                        <label className="text-xs uppercase text-white/50 mb-1 block">Quantidade</label>
                        <div className="flex items-center gap-3 justify-center">
                            <button onClick={() => setDiceCount(c => Math.max(1, c - 1))} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
                            <span className="text-xl font-bold text-white w-8 text-center">{diceCount}</span>
                            <button onClick={() => setDiceCount(c => c + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
                        </div>
                     </div>
                     <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                        <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
                        <div className="flex items-center gap-3 justify-center">
                            <button onClick={() => setStandardMod(m => m - 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
                            <span className="text-xl font-bold text-white w-8 text-center">{standardMod >= 0 ? `+${standardMod}` : standardMod}</span>
                            <button onClick={() => setStandardMod(m => m + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
                        </div>
                     </div>
                </div>

                <button onClick={rollStandard} className="w-full py-4 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                  <Cube size={24} weight="fill" /> ROLAR DADOS
                </button>
            </div>
        )}

        {isRolling && (
          <div className="h-64 flex flex-col items-center justify-center gap-8 perspective-1000">
            <div className="flex gap-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-800 rounded-xl border-2 border-white/30 animate-tumble-3d shadow-2xl flex items-center justify-center">
                    <Dna size={40} className="text-black/50 animate-spin-slow" />
                </div>
                {tab === 'DUALITY' && (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-900 to-black rounded-xl border-2 border-purple-500 animate-tumble-3d-reverse shadow-2xl flex items-center justify-center">
                        <Skull size={40} className="text-white/30 animate-spin-slow" />
                    </div>
                )}
            </div>
            <p className="text-gold font-rpg tracking-widest text-lg animate-pulse">O DESTINO GIRA...</p>
          </div>
        )}

        {result?.type === 'DUALITY' && !isRolling && (
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-gold to-yellow-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/20 transform hover:scale-110 transition-transform">
                   <span className="text-5xl font-bold text-white drop-shadow-md">{result.hopeDie}</span>
                   <span className="absolute -top-3 bg-black/80 text-[10px] text-gold px-2 py-0.5 rounded border border-gold/30 uppercase tracking-widest">Esperança</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white/20">+</div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] border border-white/20 transform hover:scale-110 transition-transform">
                   <span className="text-5xl font-bold text-purple-100 drop-shadow-md">{result.fearDie}</span>
                   <span className="absolute -top-3 bg-black/80 text-[10px] text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest">Medo</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
                <div className="text-white/50 text-sm mb-1">{result.hopeDie} (Esp) + {result.fearDie} (Medo) + {result.modifier} (Mod) = </div>
                <div className={`text-6xl font-rpg font-bold drop-shadow-lg ${result.isSuccess ? 'text-green-400' : 'text-red-400'}`}>{result.total}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">vs Dificuldade {difficulty}</div>
            </div>

            <div className={`p-4 rounded-lg border-2 mb-6 ${result.outcome === 'CRITICAL' ? 'bg-gold/10 border-gold text-gold' : result.outcome === 'HOPE' ? 'bg-blue-900/20 border-blue-400 text-blue-200' : 'bg-purple-900/20 border-purple-500 text-purple-200'}`}>
                <h3 className="text-xl font-bold uppercase flex items-center justify-center gap-2">
                    {result.outcome === 'CRITICAL' && <Sparkle size={24} weight="fill" />}
                    {result.outcome === 'HOPE' && <Coins size={24} weight="fill" />}
                    {result.outcome === 'FEAR' && <Skull size={24} weight="fill" />}
                    {result.isSuccess ? "Sucesso" : "Falha"} com {result.outcome === 'CRITICAL' ? " CRÍTICO!" : result.outcome === 'HOPE' ? " ESPERANÇA" : " MEDO"}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                    {result.outcome === 'CRITICAL' && "Ganhe 1 Esperança E Limpe 1 Estresse."}
                    {result.outcome === 'HOPE' && "Ganhe 1 Esperança. Você consegue."}
                    {result.outcome === 'FEAR' && "O Mestre ganha 1 Medo. Prepare-se."}
                </p>
            </div>
            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white underline text-sm">Rolar Novamente</button>
          </div>
        )}

        {result?.type === 'STANDARD' && !isRolling && (
            <div className="text-center animate-fade-in-up">
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {result.rolls.map((val, i) => (
                        <div key={i} className="relative w-16 h-16 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">{val}</span>
                            <span className="absolute -bottom-2 text-[8px] bg-black px-1 rounded text-white/50">d{result.dieType}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mb-6">
                    <div className="text-white/50 text-sm mb-1">
                        [{result.rolls.join(' + ')}] {result.modifier >= 0 ? `+ ${result.modifier}` : result.modifier} (Mod) =
                    </div>
                    <div className="text-6xl font-rpg font-bold text-white drop-shadow-lg">{result.total}</div>
                </div>

                <button onClick={() => setResult(null)} className="text-white/40 hover:text-white underline text-sm">Rolar Novamente</button>
            </div>
        )}

      </div>
    </div>
  );
}

// ==================================================================================
// 3. COMPONENTE INTERNO: SISTEMA DE CARTAS (InternalCardSystem)
// ==================================================================================
function InternalCardSystem({ character, allCards }: { character: Character, allCards: any[] }) {
  const safeCards: Card[] = Array.isArray(allCards) ? allCards : [];

  // --- PERSISTÊNCIA: Carregamento Inicial ---
  const [hand, setHand] = useState<ActiveCard[]>([]);
  const [reserve, setReserve] = useState<Card[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Ref para evitar loops infinitos no useEffect de salvamento
  const handRef = useRef(hand);
  const reserveRef = useRef(reserve);

  // Inicializa com dados do banco se existirem
  useEffect(() => {
    if (character && !isDataLoaded) {
      if (character.cards) {
        setHand(character.cards.hand || []);
        setReserve(character.cards.reserve || []);
      }
      setIsDataLoaded(true);
    }
  }, [character, isDataLoaded]);

  // Atualiza refs para o salvamento
  useEffect(() => {
    handRef.current = hand;
    reserveRef.current = reserve;
  }, [hand, reserve]);

  // --- PERSISTÊNCIA: Salvamento Automático OTIMIZADO ---
  useEffect(() => {
    // Só salva se já carregou os dados iniciais para não sobrescrever com vazio
    if (!isDataLoaded || !character.id) return;

    const saveData = async () => {
      try {
        const charRef = doc(db, 'characters', character.id);
        
        // CORREÇÃO: Usando notação de ponto para atualizar APENAS hand e reserve
        // sem destruir o resto do objeto 'cards' (caso exista) e sem substituir tudo.
        await updateDoc(charRef, {
          "cards.hand": handRef.current,
          "cards.reserve": reserveRef.current
        });
        
        // console.log("Cartas salvas com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar cartas:", error);
      }
    };

    // Reduzi o tempo para 800ms para garantir que salve antes de um F5 rápido
    const debounce = setTimeout(saveData, 800); 
    return () => clearTimeout(debounce);
  }, [hand, reserve, character.id, isDataLoaded]);

  
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSource, setSwapSource] = useState<'grimoire' | 'reserve' | null>(null);
  const [reserveIndexToSwap, setReserveIndexToSwap] = useState<number>(-1);

  const [castingCard, setCastingCard] = useState<ActiveCard | null>(null);
  const [ancestryCard, setAncestryCard] = useState<Card | null>(null);
  const [communityCard, setCommunityCard] = useState<Card | null>(null);
  const [subclassCards, setSubclassCards] = useState<(Card | null)[]>([null, null, null]);

  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCardState, setSelectedCardState] = useState<{ id: string | null, staticCard: Card | null, source: 'hand' | 'grimoire' | 'reserve' | 'table' } | null>(null);

  const currentSelectedCard = useMemo(() => {
    if (!selectedCardState) return null;
    if (selectedCardState.source === 'hand' && selectedCardState.id) {
        return hand.find(c => c.uniqueId === selectedCardState.id) || null;
    }
    return selectedCardState.staticCard;
  }, [selectedCardState, hand]);

  // Carrega cartas fixas da mesa (Ancestralidade, Classe)
  useEffect(() => {
    if (!character || safeCards.length === 0) return;
    const safeStr = (str?: string) => (str || "").toLowerCase();

    const anc = safeCards.find(c => c.categoria === "Ancestralidade" && c.nome.toLowerCase().includes(safeStr(character.ancestry)));
    const com = safeCards.find(c => c.categoria === "Comunidade" && c.nome.toLowerCase().includes(safeStr(character.community)));
    setAncestryCard(anc || null);
    setCommunityCard(com || null);

    const fundamental = safeCards.find(c => c.categoria === "Classes" && c.nome.toLowerCase().includes(safeStr(character.subclass)) && c.nome.toLowerCase().includes("fundamental"));
    const fallbackSub = safeCards.find(c => c.categoria === "Classes" && c.nome.toLowerCase().includes(safeStr(character.subclass)));
    setSubclassCards([fundamental || fallbackSub || null, null, null]);
    
  }, [character, safeCards]);

  const createActiveCard = (card: Card): ActiveCard => ({
    ...card, uniqueId: crypto.randomUUID(), isExhausted: false, exhaustionType: null, tokens: 0
  });

  const triggerRest = (type: 'short' | 'long') => {
    setHand(prevHand => prevHand.map(card => {
        if (!card.isExhausted) return card;
        if (type === 'long') return { ...card, isExhausted: false, exhaustionType: null };
        if (type === 'short' && card.exhaustionType === 'short') return { ...card, isExhausted: false, exhaustionType: null };
        return card;
    }));
    // alert removido para não interferir, função mantida para lógica futura se necessário
  };

  const handleCastCard = (card: ActiveCard) => {
    if (card.isExhausted) return alert("Esta carta está exaurida.");
    setSelectedCardState(null);
    setCastingCard(card);
    setTimeout(() => setCastingCard(null), 1500);
  };

  const initiateDraw = (card: Card, source: 'grimoire' | 'reserve', reserveIndex: number = -1) => {
    if (hand.some(c => c.nome === card.nome)) return alert("Você já tem essa carta.");
    if (hand.length < 5) {
      // Adiciona na mão
      setHand(prev => [...prev, createActiveCard(card)]);
      
      // Remove da reserva se veio de lá
      if (source === 'reserve') { 
          setReserve(prev => prev.filter((_, i) => i !== reserveIndex)); 
          setShowReserve(false); 
      } else if (source === 'grimoire') {
          setShowGrimoire(false); 
          setSearchTerm(''); 
      }
      return;
    }
    // Mão cheia
    setPendingCard(card); setSwapSource(source); setReserveIndexToSwap(reserveIndex); setIsSwapping(true); setShowGrimoire(false); setShowReserve(false); setSearchTerm('');
  };

  const executeSwap = (indexToRemove: number) => {
    if (!pendingCard) return;
    const cardToRemove = hand[indexToRemove];
    
    // Adiciona carta removida à reserva
    const cardToReserve = { nome: cardToRemove.nome, caminho: cardToRemove.caminho, categoria: cardToRemove.categoria };
    let newReserve = [...reserve, cardToReserve];
    
    // Se veio da reserva, remove a carta que entrou na mão da lista de reserva
    if (swapSource === 'reserve' && reserveIndexToSwap > -1) {
        // Correção lógica: Se tirou da reserva, ela não deve ser duplicada.
        // O array newReserve já tem a carta que saiu da mão.
        // Agora removemos a carta que foi para a mão (que estava na reserva).
        const filtered = reserve.filter((_, i) => i !== reserveIndexToSwap);
        newReserve = [...filtered, cardToReserve];
    }

    setReserve(newReserve);
    
    const newHand = [...hand];
    newHand[indexToRemove] = createActiveCard(pendingCard);
    setHand(newHand);
    
    setIsSwapping(false); setPendingCard(null); setSwapSource(null); setReserveIndexToSwap(-1);
  };

  const manualMoveToReserve = (index: number) => {
    const card = hand[index];
    setHand(prev => prev.filter((_, i) => i !== index));
    setReserve(prev => [...prev, { nome: card.nome, caminho: card.caminho, categoria: card.categoria }]);
    setSelectedCardState(null);
  };

  const returnToGrimoire = (uniqueId: string) => {
      setHand(prev => prev.filter(c => c.uniqueId !== uniqueId));
      setSelectedCardState(null);
  };

  const applyExhaustion = (uniqueId: string, type: 'short' | 'long') => {
    setHand(hand.map(c => c.uniqueId === uniqueId ? { ...c, isExhausted: true, exhaustionType: type } : c));
  };

  const updateTokens = (uniqueId: string, delta: number) => {
    setHand(hand.map(c => c.uniqueId === uniqueId ? { ...c, tokens: Math.max(0, c.tokens + delta) } : c));
  };

  const TableCard = ({ card, label, locked = true }: { card: Card | null, label: string, locked?: boolean }) => {
    if (!card) return (<div className="w-20 h-28 border border-white/10 rounded bg-white/5 flex flex-col items-center justify-center text-[8px] text-white/30 uppercase tracking-widest text-center px-1 gap-2 border-dashed">{locked ? <LockKey size={16} /> : <Plus size={16} />}<span>{label}</span></div>);
    return (
      <div onClick={() => setSelectedCardState({ id: null, staticCard: card, source: 'table' })} className="group relative w-20 h-28 md:w-24 md:h-36 rounded border border-white/20 bg-black/50 transition-all duration-300 hover:scale-[2.5] hover:z-50 hover:translate-y-20 cursor-help shadow-lg origin-top">
        <img src={card.caminho} className="w-full h-full object-cover rounded opacity-90 group-hover:opacity-100" />
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-gold/30 z-50">{label}</span>
        {locked && <div className="absolute bottom-1 right-1 text-white/20 group-hover:hidden"><LockKey size={12} weight="fill" /></div>}
      </div>
    );
  };

  const filteredGrimoire = safeCards.filter(c => {
    if (!c) return false;
    if (!["Feitiço", "Grimório", "Talento"].includes(c.categoria)) return false;
    return c.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <style>{`
        @keyframes spell-cast {
          0% { transform: translateY(40vh) scale(0.5) rotate(0deg); opacity: 1; box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
          40% { transform: translateY(0) scale(1.2) rotate(2deg); opacity: 1; box-shadow: 0 0 50px 20px rgba(212, 175, 55, 0.6); filter: brightness(1.5) contrast(1.2); }
          100% { transform: translateY(-50vh) scale(1.5) rotate(-5deg); opacity: 0; filter: brightness(2); }
        }
        .animate-cast-spell { animation: spell-cast 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes tumble-3d {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            25% { transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg); }
            50% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
            75% { transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg); }
            100% { transform: rotateX(720deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes tumble-3d-reverse {
            0% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
            100% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
        }
        .animate-tumble-3d { animation: tumble-3d 1s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .animate-tumble-3d-reverse { animation: tumble-3d-reverse 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>

      {/* --- NOTA: Mestre (Simulação) foi removido daqui conforme solicitado --- */}

      {castingCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="animate-cast-spell relative w-64 h-96 rounded-xl overflow-hidden border-2 border-gold/50 bg-black">
                <img src={castingCard.caminho} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gold/30 via-transparent to-white/20 mix-blend-overlay"></div>
            </div>
        </div>
      )}

      {/* MESA (Cartas Fixas) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-start gap-4 z-40 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
          <TableCard card={ancestryCard} label="Ancestralidade" />
          <TableCard card={communityCard} label="Comunidade" />
        </div>
        <div className="w-[1px] h-20 bg-white/10"></div>
        <div className="flex gap-1 pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
          <TableCard card={subclassCards[0]} label="Fundamental" />
          <TableCard card={subclassCards[1]} label="Especialização" locked={false} />
          <TableCard card={subclassCards[2]} label="Maestria" locked={false} />
        </div>
      </div>

      {/* Notificação Mão Cheia */}
      {isSwapping && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[60] bg-black/80 border border-gold text-gold px-6 py-4 rounded-xl shadow-2xl animate-bounce text-center backdrop-blur-md">
            <div className="flex flex-col items-center gap-2">
                <ArrowsLeftRight size={32} />
                <p className="font-bold text-lg">MÃO CHEIA!</p>
                <p className="text-sm text-white/80">Selecione uma carta da sua mão para enviar à Reserva<br/>e abrir espaço para a nova carta.</p>
                <button onClick={() => { setIsSwapping(false); setPendingCard(null); }} className="mt-2 text-xs uppercase underline text-red-400 hover:text-red-300">Cancelar</button>
            </div>
        </div>
      )}

      {/* BOTÕES LATERAIS (Grimório e Reserva) */}
      <div className="absolute bottom-8 right-8 z-40">
        <button onClick={() => !isSwapping && setShowGrimoire(true)} className={`group relative w-28 h-28 transition-transform active:scale-95 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] ${isSwapping ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}>
          <img src="/pote_deck.png" className="w-full h-full object-contain" />
          <div className="absolute inset-0 flex items-center justify-center pt-4"><span className="font-rpg text-gold font-bold text-shadow text-lg group-hover:text-white transition-colors">Grimório</span></div>
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-40">
        <button onClick={() => !isSwapping && setShowReserve(true)} className={`relative w-24 h-32 bg-dungeon-stone border border-white/20 rounded-lg shadow-2xl transition-all group flex items-center justify-center ${isSwapping ? 'opacity-30 cursor-not-allowed' : 'hover:border-gold'}`}>
          {reserve.length > 0 ? (
             <div className="w-full h-full rounded-lg overflow-hidden relative"><img src={reserve[reserve.length-1].caminho} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" /><div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-2xl font-bold text-white">{reserve.length}</span></div></div>
          ) : (
            <div className="text-center p-2"><Stack size={24} className="mx-auto text-white/20 mb-1" /><span className="text-[8px] text-white/30 uppercase tracking-widest block">Reserva</span></div>
          )}
        </button>
      </div>

      {/* MÃO DO JOGADOR */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-48 flex items-end justify-center z-30 pointer-events-none">
        <div className="flex items-end justify-center -space-x-12 pb-6 pointer-events-auto perspective-500">
          {hand.map((card, idx) => (
            <div 
                key={card.uniqueId} 
                onClick={() => isSwapping ? executeSwap(idx) : setSelectedCardState({ id: card.uniqueId, staticCard: null, source: 'hand' })} 
                className={`relative w-40 h-60 rounded-xl shadow-xl border transition-all duration-300 cursor-pointer origin-bottom bg-cover bg-center bg-[#1a120b] ${isSwapping ? 'animate-pulse border-red-500 z-50 hover:scale-105' : 'border-white/20 hover:z-50 hover:scale-110 hover:-translate-y-24 hover:rotate-0 hover:border-gold'}`}
                style={{ backgroundImage: `url('${card.caminho}')`, transform: `rotate(${(idx - (hand.length - 1) / 2) * 6}deg) translateY(${Math.abs(idx - (hand.length - 1) / 2) * 15}px)`, zIndex: idx, filter: card.isExhausted ? 'grayscale(100%) brightness(60%)' : 'none' }}
            >
                {/* TOKEN CENTRALIZADO */}
                {card.tokens > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-bold w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,0,0,0.5)] z-[60] text-xl animate-bounce">
                        {card.tokens}
                    </div>
                )}
                {card.isExhausted && (<div className="absolute inset-0 flex items-center justify-center bg-black/40"><Skull size={48} className="text-white/50" /></div>)}
            </div>
          ))}
        </div>
      </div>

      {/* MODALS DE LISTAS (GRIMÓRIO/RESERVA) */}
      {(showGrimoire || showReserve) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[85%] h-[85%] bg-[#0f0b15]/90 border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-4">
              <h2 className="text-3xl text-gold font-rpg">{showGrimoire ? "Seu Grimório" : "Pilha de Reserva"}</h2>
              {showGrimoire && (<div className="relative w-full md:w-96"><MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white focus:border-gold outline-none" autoFocus /></div>)}
              <button onClick={() => { setShowGrimoire(false); setShowReserve(false); setSearchTerm(''); }}><X size={28} className="text-white/50 hover:text-red-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 custom-scrollbar">
              {showGrimoire && filteredGrimoire.map((card, idx) => (
                <div key={idx} onClick={() => initiateDraw(card, 'grimoire')} className="cursor-pointer group flex flex-col items-center hover:z-50 hover:scale-110 transition-transform duration-200">
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-gold shadow-lg group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"><img src={card.caminho} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /></div>
                  <p className="text-center text-xs text-white/40 mt-3 truncate w-full group-hover:text-white">{card.nome}</p>
                </div>
              ))}
              {showReserve && reserve.map((card, idx) => (
                <div key={idx} onClick={() => initiateDraw(card, 'reserve', idx)} className="cursor-pointer hover:-translate-y-2 transition-transform"><img src={card.caminho} className="w-full rounded-lg shadow-lg" /><p className="text-center text-xs text-white/30 mt-2">Recuperar</p></div>
              ))}
              {(showGrimoire && filteredGrimoire.length === 0) && <div className="col-span-full text-center text-white/30">Nenhuma carta encontrada.</div>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM (DETALHES DA CARTA) CORRIGIDO */}
      {currentSelectedCard && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 animate-fade-in" onClick={() => setSelectedCardState(null)}>
          {/* Overlay com Blur apenas no fundo */}
          <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full p-4 z-10" onClick={e => e.stopPropagation()}>
            
            {/* Container da Imagem Ajustado (Shrink-0 para não espremer, object-contain para não cortar) */}
            <div className="relative h-[65vh] aspect-[2/3] rounded-xl shadow-2xl border border-white/20 overflow-hidden shrink-0 bg-[#0a080c]">
                <img src={currentSelectedCard.caminho} className={`w-full h-full object-contain ${(currentSelectedCard as ActiveCard).isExhausted ? 'grayscale' : ''}`} />
                {(currentSelectedCard as ActiveCard).isExhausted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <Skull size={64} className="text-white/80 mb-4" />
                        <p className="text-white font-rpg text-xl uppercase tracking-widest border border-white/50 px-4 py-1 rounded">Exaurida</p>
                        <p className="text-white/50 text-xs mt-2 uppercase">Recupera em descanso: {(currentSelectedCard as ActiveCard).exhaustionType === 'short' ? 'Curto' : 'Longo'}</p>
                    </div>
                )}
            </div>
            
            {/* Container de Texto (subpixel-antialiased para nitidez) */}
            <div className="flex flex-col gap-4 min-w-[300px] subpixel-antialiased pl-4">
              <h3 className="text-3xl font-rpg text-white">{currentSelectedCard.nome}</h3>
              <span className="text-xs uppercase text-gold border border-gold/30 px-2 py-1 rounded w-fit">{currentSelectedCard.categoria}</span>
              
              {selectedCardState?.source === 'hand' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10">
                    <span className="text-sm text-gray-400 flex items-center gap-2"><Coin /> Tokens</span>
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateTokens((currentSelectedCard as ActiveCard).uniqueId, -1)} className="w-8 h-8 bg-black hover:bg-red-900 border border-white/20 rounded flex items-center justify-center active:scale-90">-</button>
                        <span className="font-bold text-xl text-white">{(currentSelectedCard as ActiveCard).tokens}</span>
                        <button onClick={() => updateTokens((currentSelectedCard as ActiveCard).uniqueId, 1)} className="w-8 h-8 bg-black hover:bg-green-900 border border-white/20 rounded flex items-center justify-center active:scale-90">+</button>
                    </div>
                  </div>

                  {!(currentSelectedCard as ActiveCard).isExhausted ? (
                      <>
                        <button onClick={() => handleCastCard(currentSelectedCard as ActiveCard)} className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/50 text-blue-100 rounded hover:from-blue-800 hover:to-blue-700 hover:border-blue-400 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <HandGrabbing size={32} className="text-blue-400 group-hover:text-white" /><div className="text-left"><span className="block font-bold text-lg">Usar Carta</span><span className="text-xs opacity-60">Ativar e Visualizar</span></div>
                            <Sparkle className="absolute right-4 text-white/0 group-hover:text-gold group-hover:scale-125 transition-all" size={24} weight="fill" />
                        </button>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button onClick={() => applyExhaustion((currentSelectedCard as ActiveCard).uniqueId, 'short')} className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-orange-900/20 border border-orange-500/30 text-orange-200 rounded hover:bg-orange-900/50 transition-all"><span className="font-bold text-sm">Exaurir (Curto)</span><span className="text-[9px] opacity-60">Recupera: Descanso Curto</span></button>
                            <button onClick={() => applyExhaustion((currentSelectedCard as ActiveCard).uniqueId, 'long')} className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-red-900/20 border border-red-500/30 text-red-200 rounded hover:bg-red-900/50 transition-all"><span className="font-bold text-sm">Exaurir (Longo)</span><span className="text-[9px] opacity-60">Recupera: Descanso Longo</span></button>
                        </div>
                      </>
                  ) : (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-center"><p className="text-red-300 font-bold mb-1">Carta Exaurida</p><p className="text-xs text-red-400/70">Aguarde o Mestre realizar um descanso {(currentSelectedCard as ActiveCard).exhaustionType === 'short' ? 'Curto ou Longo' : 'Longo'} para recuperar.</p></div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <button onClick={() => { const idx = hand.findIndex(c => (c as ActiveCard).uniqueId === (currentSelectedCard as ActiveCard).uniqueId); if (idx > -1) manualMoveToReserve(idx); }} className="flex items-center justify-center gap-2 px-2 py-3 bg-white/5 border border-white/10 text-gray-300 rounded hover:bg-white/10 hover:border-white/30 transition-all text-sm font-bold"><Stack size={20} /> Mover para Reserva</button>
                      <button onClick={() => returnToGrimoire((currentSelectedCard as ActiveCard).uniqueId)} className="flex items-center justify-center gap-2 px-2 py-3 bg-red-900/10 border border-red-500/20 text-red-300 rounded hover:bg-red-900/30 hover:border-red-500/40 transition-all text-sm font-bold"><ArrowUUpLeft size={20} /> Devolver ao Grimório</button>
                  </div>
                </div>
              )}

              {selectedCardState?.source === 'table' && <div className="p-6 bg-white/5 rounded border border-white/10 text-sm text-gray-300"><p className="flex items-center gap-2 mb-2 text-gold"><LockKey /> <strong>Carta Permanente</strong></p><p>Esta carta define seu personagem e só pode ser alterada pelo Mestre.</p></div>}
              
              <button onClick={() => setSelectedCardState(null)} className="mt-4 flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors"><ArrowsOutSimple size={20} /> Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==================================================================================
// 4. COMPONENTE PRINCIPAL: JOGADOR VTT
// ==================================================================================
export default function JogadorVTT() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/login'); return; }
      try {
        const q = query(collection(db, 'characters'), where('playerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Garante que atributos existam com valores padrão para não quebrar a ficha
          const data = querySnapshot.docs[0].data();
          const defaultAttrs = { agility: {value:0}, strength: {value:0}, finesse: {value:0}, instinct: {value:0}, presence: {value:0}, knowledge: {value:0} };
          
          // Combina dados do banco com defaults
          setCharacter({ 
            id: querySnapshot.docs[0].id, 
            ...data,
            attributes: data.attributes || defaultAttrs,
            cards: data.cards || { hand: [], reserve: [] } // Inicializa cartas vazias se não existirem
          } as Character);
        } else {
          navigate('/criar-personagem');
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchCharacter();
  }, [navigate]);

  if (loading) return <div className="h-screen bg-black text-gold flex items-center justify-center font-rpg animate-pulse">Carregando Grimório...</div>;
  if (!character) return null;

  const color1 = CLASS_COLORS[character.class] || '#4b5563';
  const color2 = ANCESTRY_COLORS[character.ancestry] || '#1f2937';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0">
        <img src="/jogador-vtt-fundo.webp" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
      </div>

      {/* --- HUD: PERFIL --- */}
      <div className="absolute top-6 left-6 z-50 animate-fade-in">
        <button onClick={() => setSheetOpen(true)} className="group relative flex items-center gap-4 pr-8 pl-2 py-2 rounded-full border border-white/20 shadow-xl transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${color1}AA 0%, ${color2}99 100%)`, backdropFilter: 'blur(12px)' }}>
          <div className="relative w-14 h-14 rounded-full bg-black/40 border border-white/30 flex items-center justify-center shrink-0">
            <span className="text-xl font-rpg text-white font-bold">{character.level}</span>
            <span className="absolute -bottom-1 text-[8px] uppercase tracking-widest text-white/60 bg-black/60 px-1 rounded">Nível</span>
          </div>
          <div className="flex flex-col items-start text-left text-white">
            <h2 className="font-rpg text-xl font-bold leading-none drop-shadow-md group-hover:text-gold transition-colors">{character.name}</h2>
            <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
              <span className="font-bold uppercase tracking-wide">{character.class}</span><span className="w-1 h-1 rounded-full bg-white/50"></span><span className="italic">{character.subclass}</span>
            </div>
            <p className="text-[10px] opacity-70 uppercase tracking-widest mt-0.5 max-w-[200px] truncate">{character.heritage}</p>
          </div>
          <div className="absolute right-3 opacity-0 group-hover:opacity-50 transition-opacity"><Scroll size={20} className="text-white" /></div>
        </button>
      </div>

      {/* BOTÃO FLUTUANTE DE DADOS */}
      <div className="absolute bottom-36 right-8 z-40">
        <button onClick={() => setShowDiceRoller(true)} className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-yellow-800 border-2 border-white/30 shadow-[0_0_20px_rgba(212,175,55,0.5)] flex items-center justify-center text-black hover:scale-110 transition-transform hover:text-white group">
            <div className="group-hover:animate-spin"><Dna size={32} weight="bold" /></div>
        </button>
      </div>

      {/* SISTEMA DE CARTAS INTEGRADO */}
      <InternalCardSystem character={character} allCards={CARTAS_JSON as any} />

      {/* MODAL DE DADOS */}
      {showDiceRoller && <InternalDiceSystem onClose={() => setShowDiceRoller(false)} />}

      {/* MODAL DE FICHA */}
      <SheetModal 
        character={character} 
        isOpen={sheetOpen} 
        onClose={() => setSheetOpen(false)} 
      />
    </div>
  );
}