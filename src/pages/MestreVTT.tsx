import { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, orderBy, 
  addDoc, serverTimestamp, limit, writeBatch, doc, updateDoc, getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, Eye, Skull, Campfire, MoonStars, 
  Dna, X, Cube, Coins, Sparkle, HandPalm, 
  MapTrifold, UserCircle, Stack, Scroll, Image as ImageIcon,
  Fire, UsersThree, CaretDown, Check, Trash, Plus, PawPrint
} from '@phosphor-icons/react';
import { SheetModal } from '../components/SheetModal';

// --- IMPORTAÇÃO DOS SEUS COMPONENTES ---
import SceneryViewer from '../components/NPCViewer'; 
import Tabletop from '../components/Tabletop';

// --- CONFIGURAÇÕES E CORES ---
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

// --- INTERFACES ---
interface Card {
  caminho: string;
  nome: string;
  categoria: string;
  uniqueId?: string;
  isExhausted?: boolean;
  exhaustionType?: 'short' | 'long' | null;
  tokens?: number;
}

interface Character {
  id: string;
  name: string;
  class: string;
  subclass: string;
  ancestry: string;
  heritage: string; 
  community: string;
  level: number;
  imageUrl?: string;
  // Propriedades do Companheiro (Patrulheiro/Treinador)
  companionName?: string;
  companionImageUrl?: string;
  
  isOnline?: boolean;
  unlockedTier?: number; // Propriedade do Druida
  cards?: {
    hand: Card[];
    reserve: Card[];
  };
}

interface RollLog {
  id: string;
  playerName: string;
  result: any;
  timestamp: any;
  type: 'DUALITY' | 'STANDARD';
}

interface PlayerGroup {
    id: string;
    name: string;
    memberIds: string[];
}

// --- FUNÇÃO AUXILIAR: ATUALIZAR PATAMAR DRUIDA ---
const updateDruidTier = async (charId: string, currentTier: number, change: number) => {
    const newTier = Math.max(1, Math.min(4, (currentTier || 1) + change));
    const charRef = doc(db, "characters", charId);
    try {
        await updateDoc(charRef, { unlockedTier: newTier });
    } catch (e) {
        console.error("Erro ao atualizar patamar druida", e);
    }
};

// ============================================================================
// 1. COMPONENTE AUXILIAR: LISTA DE JOGADORES (INDIVIDUAL - ATÉ 6)
// ============================================================================
const PlayerList = ({ players, onSelectPlayer }: { players: Character[], onSelectPlayer: (c: Character) => void }) => {
  return (
    <div className="absolute top-6 left-6 flex flex-col gap-4 z-[900] animate-slide-right w-80 pointer-events-auto">
      {players.map((char) => {
        const color1 = CLASS_COLORS[char.class] || '#4b5563';
        const color2 = ANCESTRY_COLORS[char.ancestry] || '#1f2937';
        const isOnline = char.isOnline !== false; 

        return (
            <div key={char.id} className="flex items-center gap-2 w-full">
                {/* Botão Principal do Jogador */}
                <button 
                    onClick={() => onSelectPlayer(char)}
                    className={`group relative flex-1 flex items-center gap-3 pr-4 pl-2 py-2 rounded-full border shadow-xl transition-all hover:scale-[1.02] text-left min-w-0
                        ${isOnline ? 'border-white/20' : 'border-white/5 bg-gray-900/80 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}
                    `}
                    style={isOnline ? { background: `linear-gradient(135deg, ${color1}AA 0%, ${color2}99 100%)`, backdropFilter: 'blur(12px)' } : {}}
                >
                    <div className="relative w-10 h-10 rounded-full bg-black/40 border border-white/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-rpg text-white font-bold">{char.level}</span>
                        )}
                        <span className="absolute -bottom-1 text-[8px] uppercase tracking-widest text-white/60 bg-black/60 px-1 rounded z-10">{isOnline ? 'LVL' : 'OFF'}</span>
                    </div>
                    
                    <div className="flex flex-col items-start min-w-0 overflow-hidden flex-1 py-1">
                        <h2 className="font-rpg text-sm font-bold leading-none text-white truncate w-full group-hover:text-gold transition-colors">{char.name}</h2>
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-white/90 mt-1 w-full leading-tight">
                            <span className="font-bold uppercase tracking-wide text-gold/80">{char.ancestry}</span>
                            <span className="text-white/30">•</span>
                            <span className="font-bold uppercase tracking-wide">{char.class}</span>
                            <span className="italic opacity-70">({char.subclass})</span>
                        </div>
                        {char.heritage && (
                            <p className="text-[9px] text-white/40 w-full truncate italic mt-0.5 border-t border-white/5 pt-0.5">"{char.heritage}"</p>
                        )}
                    </div>
                </button>

                {/* CONTROLE DE PATAMAR DRUIDA (AO LADO DO BOTÃO) */}
                {char.class === "Druida" && (
                    <div className="flex flex-col items-center justify-center gap-0 bg-black/80 rounded-lg border border-green-500/30 px-1 py-0.5 shadow-lg shrink-0 h-full animate-fade-in">
                        <button 
                            onClick={() => updateDruidTier(char.id, char.unlockedTier || 1, 1)} 
                            className="w-full h-3 flex items-center justify-center text-white/50 hover:text-green-400 hover:bg-white/10 rounded"
                        >
                            <CaretDown size={10} className="rotate-180" weight="bold"/>
                        </button>
                        
                        <div className="flex items-center gap-1 px-1 py-0.5">
                            <PawPrint size={10} className="text-green-400" weight="fill" />
                            <span className="text-[10px] font-bold text-white leading-none">{char.unlockedTier || 1}º</span>
                        </div>

                        <button 
                            onClick={() => updateDruidTier(char.id, char.unlockedTier || 1, -1)} 
                            className="w-full h-3 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-white/10 rounded"
                        >
                            <CaretDown size={10} weight="bold"/>
                        </button>
                    </div>
                )}
            </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 1.1 COMPONENTE AUXILIAR: LISTA DE JOGADORES AGRUPADA (MAIS DE 6)
// ============================================================================
const CollapsedPlayerList = ({ players, onSelectPlayer }: { players: Character[], onSelectPlayer: (c: Character) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-6 left-6 z-[900] animate-slide-right pointer-events-auto">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-900 to-black border border-purple-500/50 rounded-xl shadow-xl hover:scale-105 transition-transform backdrop-blur-md"
            >
                <div className="bg-purple-500/20 p-2 rounded-full text-purple-300">
                    <UsersThree size={24} weight="fill" />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-white text-lg leading-none">Jogadores</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">{players.length} Fichas</span>
                </div>
                <CaretDown size={20} className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a120b]/95 border border-white/10 rounded-xl shadow-2xl p-2 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    {players.map((char) => {
                        const isOnline = char.isOnline !== false;
                        return (
                            <div key={char.id} className="flex items-center gap-2">
                                <button 
                                    onClick={() => { onSelectPlayer(char); setIsOpen(false); }}
                                    className={`group relative flex-1 flex items-center gap-3 p-2 rounded hover:bg-white/10 transition-colors text-left border border-transparent hover:border-white/5
                                        ${!isOnline ? 'opacity-50 grayscale' : ''}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-full bg-black/40 overflow-hidden shrink-0">
                                        {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">{char.level}</div>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-bold text-white truncate">{char.name}</div>
                                        <div className="text-[10px] text-white/50 truncate">{char.class}</div>
                                    </div>
                                </button>

                                {/* Controle Druida Compacto */}
                                {char.class === "Druida" && (
                                    <div 
                                        className="flex flex-col items-center justify-center gap-0 bg-black/40 rounded border border-green-500/30 px-1 py-0.5 shrink-0"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={() => updateDruidTier(char.id, char.unlockedTier || 1, 1)} 
                                            className="w-full h-3 flex items-center justify-center text-white/50 hover:text-green-400 rounded"
                                        >
                                            <CaretDown size={10} className="rotate-180" weight="bold"/>
                                        </button>
                                        <div className="text-[9px] text-green-400 font-bold flex items-center gap-0.5">
                                            <PawPrint size={8} weight="fill" /> {char.unlockedTier || 1}
                                        </div>
                                        <button 
                                            onClick={() => updateDruidTier(char.id, char.unlockedTier || 1, -1)} 
                                            className="w-full h-3 flex items-center justify-center text-white/50 hover:text-red-400 rounded"
                                        >
                                            <CaretDown size={10} weight="bold"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// 1.2 COMPONENTE AUXILIAR: MODAL DE GERENCIAMENTO DE GRUPOS
// ============================================================================
const GroupManagerModal = ({ 
  isOpen, onClose, allCharacters, sessionData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  allCharacters: Character[];
  sessionData: any;
}) => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
      if (sessionData) {
          setGroups(sessionData.player_groups || []);
          setActiveGroupId(sessionData.active_group_id || null);
      }
  }, [sessionData]);

  const handleSaveGroups = async (updatedGroups: PlayerGroup[], newActiveId: string | null) => {
      if (!sessionData?.id) return;
      try {
          await updateDoc(doc(db, 'sessoes', sessionData.id), {
              player_groups: updatedGroups,
              active_group_id: newActiveId
          });
          setGroups(updatedGroups);
          setActiveGroupId(newActiveId);
      } catch (e) {
          console.error("Erro ao salvar grupos:", e);
      }
  };

  const addGroup = () => {
      if (!newGroupName.trim()) return;
      const newGroup: PlayerGroup = {
          id: Date.now().toString(),
          name: newGroupName,
          memberIds: []
      };
      const updated = [...groups, newGroup];
      handleSaveGroups(updated, activeGroupId);
      setNewGroupName('');
      setSelectedGroup(newGroup.id);
  };

  const removeGroup = (groupId: string) => {
      const updated = groups.filter(g => g.id !== groupId);
      const newActive = activeGroupId === groupId ? null : activeGroupId;
      handleSaveGroups(updated, newActive);
      if (selectedGroup === groupId) setSelectedGroup(null);
  };

  const toggleMember = (charId: string) => {
      if (!selectedGroup) return;
      const updated = groups.map(g => {
          if (g.id === selectedGroup) {
              const isMember = g.memberIds.includes(charId);
              return {
                  ...g,
                  memberIds: isMember 
                      ? g.memberIds.filter(id => id !== charId) 
                      : [...g.memberIds, charId]
              };
          }
          return g;
      });
      handleSaveGroups(updated, activeGroupId);
  };

  const toggleActiveGroup = (groupId: string) => {
      const newActive = activeGroupId === groupId ? null : groupId;
      handleSaveGroups(groups, newActive);
  };

  if (!isOpen) return null;

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
          <div className="bg-[#1a120b] border border-gold/30 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div className="bg-black/40 p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-rpg text-gold flex items-center gap-2">
                      <UsersThree size={24} weight="fill"/> Gerenciador de Mesas (Instâncias)
                  </h2>
                  <button onClick={onClose}><X size={24} className="text-white/50 hover:text-red-400"/></button>
              </div>

              {/* Body */}
              <div className="flex flex-1 overflow-hidden">
                  
                  {/* Sidebar: Lista de Grupos */}
                  <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                      <div className="p-3 border-b border-white/10 flex gap-2">
                          <input 
                              type="text" 
                              value={newGroupName} 
                              onChange={e => setNewGroupName(e.target.value)}
                              placeholder="Nome do Grupo..." 
                              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-gold outline-none"
                          />
                          <button onClick={addGroup} className="bg-gold/20 hover:bg-gold/40 text-gold p-1 rounded border border-gold/30">
                              <Plus size={18} />
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2">
                          {groups.map(group => (
                              <div 
                                  key={group.id} 
                                  onClick={() => setSelectedGroup(group.id)}
                                  className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group
                                      ${selectedGroup === group.id ? 'bg-white/10 border-gold/50' : 'bg-transparent border-white/5 hover:bg-white/5'}
                                  `}
                              >
                                  <div className="flex flex-col">
                                      <span className={`font-bold text-sm ${selectedGroup === group.id ? 'text-white' : 'text-white/70'}`}>{group.name}</span>
                                      <span className="text-[10px] text-white/30">{group.memberIds.length} Personagens</span>
                                  </div>
                                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                      {/* Toggle Active */}
                                      <div className="flex items-center gap-1">
                                           <span className={`text-[9px] uppercase font-bold tracking-widest ${activeGroupId === group.id ? 'text-green-400' : 'text-white/20'}`}>
                                               {activeGroupId === group.id ? 'ATIVO' : 'OFF'}
                                           </span>
                                           <button 
                                               onClick={() => toggleActiveGroup(group.id)}
                                               className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${activeGroupId === group.id ? 'bg-green-600 justify-end' : 'bg-white/10 justify-start'}`}
                                           >
                                                <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                                           </button>
                                      </div>
                                      <button onClick={() => removeGroup(group.id)} className="text-white/20 hover:text-red-400 ml-2">
                                          <Trash size={14} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {groups.length === 0 && <p className="text-xs text-white/30 text-center mt-4">Nenhum grupo criado.</p>}
                      </div>
                  </div>

                  {/* Main: Seleção de Personagens */}
                  <div className="flex-1 flex flex-col bg-[#1a120b]">
                      {currentGroup ? (
                          <>
                              <div className="p-4 border-b border-white/10 bg-black/20">
                                  <h3 className="text-gold font-bold text-lg">Editando: {currentGroup.name}</h3>
                                  <p className="text-xs text-white/50">Selecione os personagens que pertencem a esta mesa.</p>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start custom-scrollbar">
                                  {allCharacters.map(char => {
                                      const isMember = currentGroup.memberIds.includes(char.id);
                                      return (
                                          <div 
                                              key={char.id} 
                                              onClick={() => toggleMember(char.id)}
                                              className={`
                                                  flex items-center gap-3 p-2 rounded border cursor-pointer transition-all
                                                  ${isMember ? 'bg-green-900/20 border-green-500/50' : 'bg-white/5 border-white/10 hover:border-white/30'}
                                              `}
                                          >
                                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${isMember ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                                                  {isMember && <Check size={12} weight="bold" className="text-black" />}
                                              </div>
                                              <div className="w-8 h-8 rounded bg-black overflow-hidden shrink-0">
                                                  <img src={char.imageUrl || ''} className="w-full h-full object-cover opacity-80" />
                                              </div>
                                              <div className="min-w-0">
                                                  <p className={`text-sm font-bold truncate ${isMember ? 'text-green-100' : 'text-white/70'}`}>{char.name}</p>
                                                  <p className="text-[10px] text-white/30 truncate">{char.class}</p>
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          </>
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                              <UsersThree size={48} className="mb-2" />
                              <p>Selecione ou crie um grupo ao lado.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );
};


// ============================================================================
// 2. COMPONENTE AUXILIAR: SISTEMA DE DADOS DO MESTRE
// ============================================================================
function MasterDiceSystem({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'DUALITY' | 'STANDARD'>('DUALITY');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Estados Dualidade
  const [modifier, setModifier] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(12);
  const [advantage, setAdvantage] = useState<'none' | 'advantage' | 'disadvantage'>('none');

  // Estados Standard
  const [selectedDie, setSelectedDie] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [standardMod, setStandardMod] = useState(0);

  const pushRollToFirebase = async (rollResult: any, type: 'DUALITY' | 'STANDARD') => {
      try {
        await addDoc(collection(db, 'rolls'), {
            playerName: "Mestre", 
            type,
            result: rollResult,
            timestamp: serverTimestamp()
        });
      } catch (e) {
          console.error("Erro ao enviar rolagem:", e);
      }
  };

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

      const finalResult = {
        type: 'DUALITY',
        hopeDie: hope,
        fearDie: fear,
        modifier: modifier + finalAdvMod,
        total,
        outcome,
        isSuccess: total >= difficulty
      };

      setResult(finalResult);
      pushRollToFirebase(finalResult, 'DUALITY');
      setIsRolling(false);
    }, 1000);
  };

  const rollStandard = () => {
    setIsRolling(true);
    setResult(null);

    setTimeout(() => {
        const rolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * selectedDie) + 1);
        const sum = rolls.reduce((a, b) => a + b, 0);
        
        const finalResult = {
            type: 'STANDARD',
            rolls,
            dieType: selectedDie,
            modifier: standardMod,
            total: sum + standardMod
        };

        setResult(finalResult);
        pushRollToFirebase(finalResult, 'STANDARD');
        setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#1a1520] border border-gold/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4">
                <button onClick={() => { setTab('DUALITY'); setResult(null); }} className={`text-lg font-rpg font-bold px-3 py-1 rounded transition-colors ${tab === 'DUALITY' ? 'text-gold bg-white/10' : 'text-white/30 hover:text-white'}`}>Dualidade</button>
                <button onClick={() => { setTab('STANDARD'); setResult(null); }} className={`text-lg font-rpg font-bold px-3 py-1 rounded transition-colors ${tab === 'STANDARD' ? 'text-gold bg-white/10' : 'text-white/30 hover:text-white'}`}>Dados Padrão</button>
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
            <button onClick={rollDuality} className="w-full py-4 bg-gradient-to-r from-gold/80 to-yellow-600/80 hover:from-gold hover:to-yellow-500 text-black font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"><Dna size={24} weight="fill" /> ROLAR DUALIDADE</button>
          </div>
        )}

        {tab === 'STANDARD' && !isRolling && !result && (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 10, 12, 20, 100].map(d => (
                        <button key={d} onClick={() => setSelectedDie(d)} className={`py-2 rounded border text-sm font-bold ${selectedDie === d ? 'bg-purple-900 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>d{d}</button>
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
                <button onClick={rollStandard} className="w-full py-4 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"><Cube size={24} weight="fill" /> ROLAR DADOS</button>
            </div>
        )}

        {isRolling && (
          <div className="h-64 flex flex-col items-center justify-center gap-8 perspective-1000">
            <div className="flex gap-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-800 rounded-xl border-2 border-white/30 animate-tumble-3d shadow-2xl flex items-center justify-center"><Dna size={40} className="text-black/50 animate-spin-slow" /></div>
                {tab === 'DUALITY' && (<div className="w-20 h-20 bg-gradient-to-br from-purple-900 to-black rounded-xl border-2 border-purple-500 animate-tumble-3d-reverse shadow-2xl flex items-center justify-center"><Skull size={40} className="text-white/30 animate-spin-slow" /></div>)}
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
            </div>
            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white underline text-sm">Rolar Novamente</button>
          </div>
        )}

        {result?.type === 'STANDARD' && !isRolling && (
            <div className="text-center animate-fade-in-up">
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {result.rolls.map((val: any, i: any) => (
                        <div key={i} className="relative w-16 h-16 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">{val}</span>
                            <span className="absolute -bottom-2 text-[8px] bg-black px-1 rounded text-white/50">d{result.dieType}</span>
                        </div>
                    ))}
                </div>
                <div className="mb-6">
                    <div className="text-white/50 text-sm mb-1">[{result.rolls.join(' + ')}] {result.modifier >= 0 ? `+ ${result.modifier}` : result.modifier} (Mod) =</div>
                    <div className="text-6xl font-rpg font-bold text-white drop-shadow-lg">{result.total}</div>
                </div>
                <button onClick={() => setResult(null)} className="text-white/40 hover:text-white underline text-sm">Rolar Novamente</button>
            </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. COMPONENTE AUXILIAR: MONITOR DE CARTAS
// ============================================================================
const CardsMonitorModal = ({ isOpen, onClose, players }: { isOpen: boolean, onClose: () => void, players: Character[] }) => {
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
       {/* Header */}
       <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a120b]">
          <h2 className="text-2xl font-rpg text-gold flex items-center gap-3"><Eye weight="fill"/> Monitoramento de Grimórios</h2>
          <button onClick={onClose}><X size={32} className="text-white/50 hover:text-red-400" /></button>
       </div>

       {/* Conteúdo scrollável */}
       <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 custom-scrollbar">
          {players.map(player => (
             <div key={player.id} className="min-w-[350px] w-[350px] bg-white/5 border border-white/10 rounded-xl flex flex-col h-full overflow-hidden">
                {/* Cabeçalho do Jogador */}
                <div className="p-3 bg-black/40 border-b border-white/5 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden"><img src={player.imageUrl || ''} className="w-full h-full object-cover"/></div>
                   <span className="font-bold text-white truncate">{player.name}</span>
                </div>

                {/* Área de Cartas Scrollável Verticalmente */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    
                    {/* MÃO */}
                    <div>
                        <h4 className="text-[10px] uppercase text-gold/70 tracking-widest mb-2 flex items-center gap-1"><HandPalm /> Mão Ativa</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {player.cards?.hand?.map((card, idx) => (
                                <div key={idx} onClick={() => setZoomedCard(card)} className={`relative aspect-[2/3] rounded border cursor-help hover:scale-105 transition-transform ${card.isExhausted ? 'border-red-500/50 grayscale opacity-70' : 'border-white/20'}`}>
                                    <img src={card.caminho} className="w-full h-full object-cover rounded" />
                                    {card.tokens ? <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">{card.tokens}</div> : null}
                                    {card.isExhausted && <div className="absolute inset-0 flex items-center justify-center"><Skull className="text-white/80" /></div>}
                                </div>
                            ))}
                            {(!player.cards?.hand || player.cards.hand.length === 0) && <p className="text-xs text-white/20 col-span-2 text-center py-4">Mão vazia</p>}
                        </div>
                    </div>

                    {/* RESERVA */}
                    <div className="border-t border-white/5 pt-2">
                        <h4 className="text-[10px] uppercase text-blue-300/70 tracking-widest mb-2 flex items-center gap-1"><Stack /> Reserva</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {player.cards?.reserve?.map((card, idx) => (
                                <div key={idx} onClick={() => setZoomedCard(card)} className="relative aspect-[2/3] rounded border border-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-help">
                                    <img src={card.caminho} className="w-full h-full object-cover rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          ))}
       </div>

       {/* Zoom da Carta */}
       {zoomedCard && (
         <div className="fixed inset-0 z-[3100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setZoomedCard(null)}>
            <div className="relative max-w-md w-full p-4 animate-scale-up">
                <img src={zoomedCard.caminho} className="w-full rounded-xl shadow-2xl border border-gold/30" />
                <div className="mt-4 bg-black/80 p-4 rounded-xl border border-white/20 text-center">
                    <h3 className="text-xl text-gold font-rpg">{zoomedCard.nome}</h3>
                    <p className="text-xs text-white/50 uppercase mt-1">{zoomedCard.categoria}</p>
                    {zoomedCard.isExhausted && <p className="text-red-400 font-bold mt-2 text-sm uppercase border border-red-500/30 p-1 rounded">Exaurida ({zoomedCard.exhaustionType === 'short' ? 'Descanso Curto' : 'Longo'})</p>}
                    {zoomedCard.tokens ? <p className="text-white mt-1 text-sm">Tokens Acumulados: {zoomedCard.tokens}</p> : null}
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

// ============================================================================
// 4. COMPONENTE AUXILIAR: NOTIFICAÇÃO DE DADOS (TOAST)
// ============================================================================
const DiceToast = () => {
    const [lastRoll, setLastRoll] = useState<RollLog | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'rolls'), orderBy('timestamp', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                const rollData = { id: snapshot.docs[0].id, ...data } as RollLog;
                
                const now = new Date().getTime();
                const rollTime = rollData.timestamp?.toMillis ? rollData.timestamp.toMillis() : now;
                
                if (now - rollTime < 10000) { 
                    setLastRoll(rollData);
                    setVisible(true);
                    const timer = setTimeout(() => setVisible(false), 8000); 
                    return () => clearTimeout(timer);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    if (!visible || !lastRoll) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[4000] animate-bounce-in">
            <div className={`px-6 py-4 rounded-xl border-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-4 min-w-[300px] ${lastRoll.type === 'DUALITY' ? 'bg-black/90 border-gold' : 'bg-[#1a0b2e]/90 border-purple-500'}`}>
                <div className="flex flex-col items-center border-r border-white/10 pr-4">
                    <span className="text-[10px] uppercase text-white/50 tracking-widest">Jogador</span>
                    <span className="text-lg font-bold text-white leading-none">{lastRoll.playerName}</span>
                </div>
                
                {lastRoll.type === 'DUALITY' ? (
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-green-400 drop-shadow">{lastRoll.result.total}</span>
                            <span className="text-[9px] text-white/30 uppercase">Total</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                             <span className="text-gold font-bold">{lastRoll.result.hopeDie} (Esp)</span>
                             <span className="text-purple-400 font-bold">{lastRoll.result.fearDie} (Medo)</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${lastRoll.result.outcome === 'CRITICAL' ? 'bg-gold text-black' : lastRoll.result.isSuccess ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                            {lastRoll.result.outcome === 'CRITICAL' ? 'Crítico!' : lastRoll.result.isSuccess ? 'Sucesso' : 'Falha'}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-purple-300 drop-shadow">{lastRoll.result.total}</span>
                            <span className="text-[9px] text-white/30 uppercase">Total</span>
                        </div>
                        <div className="text-xs text-white/50">
                            [{lastRoll.result.rolls.join(' + ')}] + {lastRoll.result.modifier}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// 5. TELA PRINCIPAL: MESTRE VTT
// ============================================================================
export default function MestreVTT() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [showCardsMonitor, setShowCardsMonitor] = useState(false);
  const [showDiceSystem, setShowDiceSystem] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sessaoData, setSessaoData] = useState<any>(null);

  const [showSceneryManager, setShowSceneryManager] = useState(false);
  const [showTabletopManager, setShowTabletopManager] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);

  const [showFearModal, setShowFearModal] = useState(false);
  const [fearTokens, setFearTokens] = useState(0);
  const [fearAlertVisible, setFearAlertVisible] = useState(false);

  // --- NOVO: ESTADO PARA O ALERTA DE DRUIDA ---
  const [transformAlert, setTransformAlert] = useState<any>(null);

  const styles = `
  @keyframes spell-cast { 0% { transform: translateY(40vh) scale(0.5); opacity: 1; } 100% { transform: translateY(-50vh) scale(1.5); opacity: 0; } }
  .animate-cast-spell { animation: spell-cast 1.5s forwards; }
  
  .animate-ds-text { animation: ds-fade-in 5s ease-out forwards; }
  @keyframes ds-fade-in { 0% { opacity: 0; transform: scale(1.2); } 15% { opacity: 1; transform: scale(1); } 85% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.9); } }

  /* ANIMAÇÕES DOS DADOS RECUPERADAS */
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
  .animate-spin-slow { animation: spin 3s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

  // 1. Inicializa Sessão e Listeners Globais
  useEffect(() => {
    const q = query(collection(db, 'sessoes'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            const data = docSnap.data();
            setSessaoData({ id: docSnap.id, ...data });
            
            // Sync Medo
            if (data.fear_data) {
                setFearTokens(data.fear_data.tokens || 0);
                const now = Date.now();
                if (data.fear_data.last_trigger && (now - data.fear_data.last_trigger) < 5000) {
                    setFearAlertVisible(true);
                    setTimeout(() => setFearAlertVisible(false), 5000);
                }
            }

            // --- NOVO: LISTENER DE TRANSFORMAÇÃO NO MESTRE ---
            if (data.latestTransformation) {
                const now = Date.now();
                const timeDiff = now - (data.latestTransformation.id || 0);
                if (timeDiff < 8000) {
                    setTransformAlert(data.latestTransformation);
                    const timer = setTimeout(() => setTransformAlert(null), 6000);
                    return () => clearTimeout(timer);
                }
            }

        } else {
            // Cria sessão se não existir
            addDoc(collection(db, 'sessoes'), {
                createdAt: serverTimestamp(),
                fear_data: { tokens: 0, last_trigger: 0 },
                player_groups: []
            }).catch(console.error);
        }
    });
    return () => unsubscribe();
  }, []);

// 2. Busca Personagens (Listener Fixo - Roda apenas uma vez)
useEffect(() => {
    const q = query(collection(db, 'characters'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Character));
      setCharacters(chars);
    });
    return () => unsubscribe();
  }, []); // Dependência vazia: O listener NÃO é recriado quando o state muda

  // 2.1 Sincroniza Personagem Selecionado (Roda apenas quando necessário)
  useEffect(() => {
      if (selectedChar) {
          const updated = characters.find(c => c.id === selectedChar.id);
          
          // Verifica se realmente houve mudança nos dados antes de atualizar o state
          // Isso previne o loop "update depth exceeded" comparando o conteúdo
          if (updated && JSON.stringify(updated) !== JSON.stringify(selectedChar)) {
              setSelectedChar(updated);
          }
      }
  }, [characters, selectedChar]);

  const handleRestAll = async (type: 'short' | 'long') => {
      if (!window.confirm("Aplicar descanso?")) return;
      const batch = writeBatch(db);
      characters.forEach(char => {
          if (char.cards?.hand) {
              const newHand = char.cards.hand.map(card => {
                  if (!card.isExhausted) return card;
                  if (type === 'long') return { ...card, isExhausted: false, exhaustionType: null };
                  if (type === 'short' && card.exhaustionType === 'short') return { ...card, isExhausted: false, exhaustionType: null };
                  return card;
              });
              batch.update(doc(db, 'characters', char.id), { "cards.hand": newHand });
          }
      });
      await batch.commit();
  };

  const toggleFearToken = async (index: number) => {
      let newCount = index < fearTokens ? index : index + 1;
      if (sessaoData?.id) {
          await updateDoc(doc(db, 'sessoes', sessaoData.id), { "fear_data.tokens": newCount });
      }
  };

  const triggerFearAlert = async () => {
      if (sessaoData?.id) {
          await updateDoc(doc(db, 'sessoes', sessaoData.id), { "fear_data.last_trigger": Date.now() });
          setShowFearModal(false);
      }
  };

  const getVisibleCharacters = () => {
      if (!sessaoData?.active_group_id || !sessaoData.player_groups) return characters;
      const activeGroup = sessaoData.player_groups.find((g: PlayerGroup) => g.id === sessaoData.active_group_id);
      return activeGroup ? characters.filter(c => activeGroup.memberIds.includes(c.id)) : characters;
  };

  const visibleCharacters = getVisibleCharacters();
  const useCollapsedView = visibleCharacters.length > 6;

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden select-none">
       <style>{styles}</style>

       <div className="absolute inset-0 z-0 pointer-events-none">
         <img src="/jogador-vtt-fundo.webp" className="w-full h-full object-cover opacity-60" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
       </div>

       {sessaoData && <SceneryViewer sessaoData={sessaoData} isMaster={true} showManager={showSceneryManager} onCloseManager={() => setShowSceneryManager(false)} />}

       <div className="absolute inset-0 z-[10] pointer-events-none">
           <div className="w-full h-full pointer-events-auto">
             {sessaoData && <Tabletop sessaoData={sessaoData} isMaster={true} charactersData={characters} showManager={showTabletopManager} onCloseManager={() => setShowTabletopManager(false)} />}
           </div>
       </div>

       {/* === ALERTA DE MEDO === */}
       {fearAlertVisible && (
           <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm animate-fade-in">
               <div className="relative w-full flex flex-col items-center animate-ds-text">
                   <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4c1d95] to-transparent shadow-[0_0_20px_#8b5cf6]"></div>
                   <h1 className="font-rpg text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-900 uppercase tracking-[0.2em] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] py-4 text-center">O MESTRE USOU O MEDO</h1>
                   <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4c1d95] to-transparent shadow-[0_0_20px_#8b5cf6]"></div>
               </div>
           </div>
       )}

       {/* === NOVO: ALERTA DE DRUIDA NO MESTRE === */}
       {transformAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4">
            <div className="relative w-full max-w-5xl flex flex-col items-center justify-center text-center animate-fade-in-up">
                <div className={`absolute inset-0 bg-gradient-to-r ${transformAlert.gradientClass || 'from-gray-800 to-black'} opacity-90 blur-xl h-40 top-1/2 -translate-y-1/2 rounded-full transform scale-x-110 -z-10`}></div>
                <h2 className="text-3xl md:text-5xl font-rpg uppercase text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)] relative z-10 animate-slide-in-left">{transformAlert.charName}</h2>
                <p className="text-sm md:text-xl text-white/90 font-light tracking-[0.3em] uppercase my-3 relative z-10 bg-black/60 px-6 py-1 rounded-full border border-white/10 backdrop-blur-md">Se transformou em</p>
                <h1 className="text-5xl md:text-8xl font-black uppercase relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-zoom-in font-rpg leading-none pb-2">{transformAlert.formName}</h1>
                 <span className="relative z-10 text-green-400 text-sm md:text-lg uppercase tracking-widest mt-2 font-bold bg-black/40 px-4 py-1 rounded border border-green-500/30">
                    {transformAlert.baseForm} • {transformAlert.tierLabel || "Forma Selvagem"}
                 </span>
            </div>
        </div>
      )}

       <DiceToast />
       
       {useCollapsedView ? <CollapsedPlayerList players={visibleCharacters} onSelectPlayer={(c) => { setSelectedChar(c); setIsSheetOpen(true); }} /> : <PlayerList players={visibleCharacters} onSelectPlayer={(c) => { setSelectedChar(c); setIsSheetOpen(true); }} />}

       <SheetModal character={selectedChar} isOpen={isSheetOpen} onClose={() => { setIsSheetOpen(false); setSelectedChar(null); }} />
       <CardsMonitorModal isOpen={showCardsMonitor} onClose={() => setShowCardsMonitor(false)} players={characters} />
       <GroupManagerModal isOpen={showGroupManager} onClose={() => setShowGroupManager(false)} allCharacters={characters} sessionData={sessaoData} />
       {showDiceSystem && <MasterDiceSystem onClose={() => setShowDiceSystem(false)} />}

       <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 animate-slide-up pointer-events-auto">
           <div className="flex gap-2 mb-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm border border-white/10">
               <button onClick={() => handleRestAll('short')} className="flex items-center gap-2 px-4 py-2 bg-orange-900/40 border border-orange-500/30 rounded text-orange-200 text-xs hover:bg-orange-800 transition-colors uppercase font-bold tracking-wide"><Campfire size={18} /> Curto</button>
               <button onClick={() => handleRestAll('long')} className="flex items-center gap-2 px-4 py-2 bg-indigo-900/40 border border-indigo-500/30 rounded text-indigo-200 text-xs hover:bg-indigo-800 transition-colors uppercase font-bold tracking-wide"><MoonStars size={18} /> Longo</button>
           </div>

           <div className="flex gap-3 mb-2">
               <button onClick={() => setShowGroupManager(true)} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white hover:border-green-400 hover:text-green-300 flex items-center justify-center transition-colors shadow-lg" title="Gerenciar Grupos"><UsersThree size={24} /></button>
               <button onClick={() => setShowTabletopManager(true)} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white hover:border-gold hover:text-gold flex items-center justify-center transition-colors shadow-lg" title="Gerenciar Mapas"><MapTrifold size={24} /></button>
               <button onClick={() => setShowSceneryManager(true)} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-colors shadow-lg" title="Gerenciar Cenários/NPCs"><ImageIcon size={24} /></button>
           </div>
           
           <button onClick={() => setShowCardsMonitor(true)} className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-900 to-black border border-blue-500/50 rounded-xl shadow-xl hover:scale-105 transition-transform">
              <div className="bg-blue-500/20 p-2 rounded-full text-blue-300"><Eye size={32} /></div>
              <div className="text-left"><span className="block font-bold text-white text-lg">Visão do Mestre</span><span className="text-xs text-white/50 uppercase tracking-widest">Monitorar Cartas</span></div>
           </button>

           <div className="flex items-end gap-4 relative">
               <div className="relative">
                   <button onClick={() => setShowFearModal(!showFearModal)} className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-900 to-black border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center text-white hover:scale-110 transition-transform mb-2 z-10"><Skull size={32} weight="fill" className="animate-pulse" /></button>
                   {showFearModal && (
                       <div className="absolute bottom-20 right-0 bg-[#1a0b2e] border-2 border-purple-500/50 rounded-xl p-4 w-64 shadow-[0_0_30px_rgba(0,0,0,0.9)] animate-scale-up z-50">
                           <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2"><h3 className="text-purple-300 font-rpg text-lg">Caixa do Medo</h3><X className="text-white/50 cursor-pointer hover:text-white" onClick={() => setShowFearModal(false)} /></div>
                           <div className="grid grid-cols-5 gap-3 mb-6 place-items-center">
                               {Array.from({ length: 10 }).map((_, i) => (
                                   <button key={i} onClick={() => toggleFearToken(i)} className={`w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center transition-all duration-300 ${i < fearTokens ? 'bg-purple-600 shadow-[0_0_15px_#a855f7]' : 'bg-black/50'}`}>
                                       {i < fearTokens && <Fire size={20} weight="fill" className="text-white animate-pulse" />}
                                   </button>
                               ))}
                           </div>
                           <button onClick={triggerFearAlert} className="w-full py-2 bg-gradient-to-r from-red-900 to-purple-900 border border-purple-500 text-white font-rpg tracking-widest text-lg rounded hover:brightness-125 transition-all active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)]">USAR MEDO</button>
                       </div>
                   )}
               </div>
               <button onClick={() => setShowDiceSystem(true)} className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-yellow-900 border-2 border-white/30 shadow-xl flex items-center justify-center text-black hover:scale-110 transition-transform"><Dna size={40} weight="bold" /></button>
           </div>
       </div>
    </div>
  );
}