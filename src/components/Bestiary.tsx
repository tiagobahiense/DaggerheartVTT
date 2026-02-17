import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { 
  Skull, CaretUp, CaretDown, Plus, Trash, FloppyDisk, 
  BookOpen, CaretRight, Sword, Copy 
} from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';

// --- INTERFACES ---
interface Ability {
  name: string;
  tag: string;
  description: string;
}

interface EnemyStats {
  type: string;
  description: string;
  motivations: string;
  
  difficulty: number;
  thresholdMajor: number;
  thresholdMinor: number;
  
  maxPV: number;
  currentPV: number;
  maxPF: number;
  currentPF: number;
  
  atqBonus: string;
  weaponName: string;
  damageType: string;
  damageFormula: string;
  
  abilities: Ability[];
}

interface Token {
  id: string;
  name: string;
  img: string;
  type: 'player' | 'enemy' | 'companion';
  stats?: EnemyStats;
}

// --- VALORES PADRÃO (Garante que nada fique "undefined") ---
const DEFAULT_STATS: EnemyStats = {
    type: "Comum (1º Patamar)", 
    description: "", 
    motivations: "",
    difficulty: 10, 
    thresholdMajor: 5, 
    thresholdMinor: 10,
    maxPV: 10, 
    currentPV: 10, 
    maxPF: 5, 
    currentPF: 5,
    atqBonus: "+0", 
    weaponName: "Ataque Básico", 
    damageType: "Físico", 
    damageFormula: "1d4",
    abilities: []
};

export default function Bestiary({ sessaoData, onClose }: { sessaoData: any, onClose: () => void }) {
  const [enemies, setEnemies] = useState<Token[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sincroniza com os tokens ativos
  useEffect(() => {
    if (sessaoData?.active_map?.tokens) {
      const activeEnemies = sessaoData.active_map.tokens.filter((t: any) => t.type === 'enemy');
      setEnemies(activeEnemies);
    } else {
      setEnemies([]);
    }
  }, [sessaoData]);

  // --- SINCRONIZAÇÃO COM O BANCO DE MAPAS ---
  // Atualiza também o mapa salvo para persistir os dados ao recarregar
  const syncWithSavedMaps = async (newActiveTokens: Token[]) => {
      if (!sessaoData?.saved_maps || !sessaoData.active_map) return;
      
      const currentMapName = sessaoData.active_map.name;
      const currentMapUrl = sessaoData.active_map.url;

      // Percorre os mapas salvos e atualiza aquele que corresponde ao mapa ativo
      const updatedSavedMaps = sessaoData.saved_maps.map((m: any) => {
          if (m.name === currentMapName && m.url === currentMapUrl) {
              // Filtra apenas inimigos para atualizar seus stats, mantendo outros tokens se houver lógica específica
              // Aqui assumimos que o estado atual dos tokens no mapa ativo é o "mais recente"
              // Porém, para não perder tokens que possam estar ocultos ou em outra lógica, vamos atualizar os tokens correspondentes
              
              // Abordagem Segura: Substitui a lista de tokens do mapa salvo pela lista atual (se forem os mesmos)
              // Ou melhor: Mapeia os tokens do mapa salvo e atualiza os stats se o ID bater? 
              // Como os IDs são gerados no spawn, eles mudam. 
              // A melhor forma de persistir "template" é salvar o estado atual do active_map.tokens dentro do saved_map
              return { ...m, tokens: newActiveTokens.filter(t => t.type === 'enemy') }; 
          }
          return m;
      });

      // Atualiza no banco apenas se houver o mapa salvo correspondente
      if (updatedSavedMaps.length > 0) {
          await updateDoc(doc(db, 'sessoes', sessaoData.id), {
              saved_maps: updatedSavedMaps
          });
      }
  };

  // --- FUNÇÃO DE REPLICAÇÃO INTELIGENTE ---
  const handleReplicateStats = async (sourceToken: Token) => {
      if (!sessaoData?.id || !sessaoData.active_map || !sourceToken.stats) return;
      
      const confirmText = `Deseja copiar a ficha de "${sourceToken.name}" para TODOS os outros tokens com o mesmo nome e imagem?`;
      if (!confirm(confirmText)) return;

      const allTokens = [...sessaoData.active_map.tokens];
      let count = 0;

      const updatedTokens = allTokens.map(t => {
          // Verifica se é inimigo, se tem o mesmo nome/imagem e se não é o próprio token original
          if (t.type === 'enemy' && t.name === sourceToken.name && t.img === sourceToken.img && t.id !== sourceToken.id) {
              count++;
              // Copia os stats completos
              return { ...t, stats: { ...sourceToken.stats } }; 
          }
          return t;
      });

      if (count > 0) {
          // Atualiza Mapa Ativo
          await updateDoc(doc(db, 'sessoes', sessaoData.id), {
              "active_map.tokens": updatedTokens
          });
          // Atualiza Mapa Salvo (Persistência)
          await syncWithSavedMaps(updatedTokens);
          
          alert(`${count} fichas atualizadas com sucesso!`);
      } else {
          alert("Nenhum outro token igual encontrado.");
      }
  };

  // Função Principal de Atualização
  const updateTokenInFirestore = async (tokenId: string, updates: any) => {
    if (!sessaoData?.id || !sessaoData.active_map) return;

    const allTokens = [...sessaoData.active_map.tokens];
    const tokenIndex = allTokens.findIndex((t: any) => t.id === tokenId);
    
    if (tokenIndex === -1) return;

    // Mescla stats existentes com Default para evitar perda de dados
    const currentStats = allTokens[tokenIndex].stats ? { ...DEFAULT_STATS, ...allTokens[tokenIndex].stats } : { ...DEFAULT_STATS };

    let newStats;
    if (updates.stats) {
        newStats = { ...currentStats, ...updates.stats };
    } else {
        newStats = { ...currentStats, ...updates };
    }

    allTokens[tokenIndex] = { ...allTokens[tokenIndex], stats: newStats };

    // 1. Atualiza Mapa Ativo
    await updateDoc(doc(db, 'sessoes', sessaoData.id), {
        "active_map.tokens": allTokens
    });

    // 2. Sincroniza com Mapa Salvo (Auto-Save)
    // Usamos um debounce simples ou chamamos direto (Firestore aguenta chamadas pequenas)
    // Para garantir consistência imediata, chamamos direto.
    await syncWithSavedMaps(allTokens);
  };

  const handleQuickStatChange = (token: Token, stat: 'currentPV' | 'currentPF', delta: number) => {
    const stats = token.stats || DEFAULT_STATS;
    // Usa nullish coalescing (??) para garantir que 0 não seja tratado como falso
    const current = stats[stat] ?? (stat === 'currentPV' ? 10 : 5);
    const max = stat === 'currentPV' ? (stats.maxPV ?? 10) : (stats.maxPF ?? 5);
    
    const newValue = Math.min(max, Math.max(0, current + delta));
    updateTokenInFirestore(token.id, { [stat]: newValue });
  };

  const renderEnemyForm = (token: Token) => {
    const stats = { ...DEFAULT_STATS, ...(token.stats || {}) };

    const handleChange = (field: keyof EnemyStats, value: any) => {
        updateTokenInFirestore(token.id, { [field]: value });
    };

    const handleAbilityChange = (idx: number, field: keyof Ability, value: string) => {
        const newAbilities = [...stats.abilities];
        newAbilities[idx] = { ...newAbilities[idx], [field]: value };
        handleChange('abilities', newAbilities);
    };

    const addAbility = () => {
        const newAbilities = [...stats.abilities, { name: "Nova Habilidade", tag: "Ação", description: "" }];
        handleChange('abilities', newAbilities);
    };

    const removeAbility = (idx: number) => {
        const newAbilities = [...stats.abilities];
        newAbilities.splice(idx, 1);
        handleChange('abilities', newAbilities);
    };

    // Identifica quantos tokens idênticos existem para o botão de replicação
    const identicalCount = enemies.filter(e => e.name === token.name && e.img === token.img && e.id !== token.id).length;

    return (
        <div className="p-4 bg-black/40 border-t border-white/10 space-y-4 animate-fade-in text-sm">
            
            {/* BOTÃO DE REPLICAÇÃO INTELIGENTE */}
            {identicalCount > 0 && (
                <div className="flex justify-end animate-pulse-slow">
                    <button 
                        onClick={() => handleReplicateStats(token)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500 text-white text-xs font-bold px-4 py-2 rounded shadow-lg transition-all transform hover:scale-105"
                        title={`Copia esta ficha para outros ${identicalCount} tokens iguais`}
                    >
                        <Copy size={16} /> REPLICAR PARA {identicalCount} IGUAIS
                    </button>
                </div>
            )}

            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] uppercase text-white/50 block mb-1">Tipo / Patamar</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:border-gold outline-none" 
                        value={stats.type} onChange={e => handleChange('type', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] uppercase text-white/50 block mb-1">Descrição Visual</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:border-gold outline-none" 
                        value={stats.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
            </div>

            {/* Linha 2 */}
            <div>
                <label className="text-[10px] uppercase text-white/50 block mb-1">Motivações e Táticas</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:border-gold outline-none h-16 resize-none custom-scrollbar" 
                    value={stats.motivations} onChange={e => handleChange('motivations', e.target.value)} />
            </div>

            {/* Linha 3: Stats */}
            <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded border border-white/10">
                <div>
                    <label className="text-[10px] uppercase text-gold block text-center">Dificuldade</label>
                    <input type="number" className="w-full bg-black border border-white/20 rounded text-center text-white font-bold" 
                        value={stats.difficulty} onChange={e => handleChange('difficulty', Number(e.target.value))} />
                </div>
                <div>
                    <label className="text-[10px] uppercase text-white/50 block text-center">Limiares</label>
                    <div className="flex gap-1">
                        <input type="number" placeholder="Me" className="w-full bg-black border border-white/20 rounded text-center text-white text-xs" 
                            value={stats.thresholdMajor} onChange={e => handleChange('thresholdMajor', Number(e.target.value))} />
                        <span className="text-white/50">/</span>
                        <input type="number" placeholder="Ma" className="w-full bg-black border border-white/20 rounded text-center text-white text-xs" 
                            value={stats.thresholdMinor} onChange={e => handleChange('thresholdMinor', Number(e.target.value))} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] uppercase text-red-400 block text-center">PV Máx</label>
                    <input type="number" className="w-full bg-black border border-red-900/50 rounded text-center text-red-200 font-bold" 
                        value={stats.maxPV} onChange={e => handleChange('maxPV', Number(e.target.value))} />
                </div>
                <div>
                    <label className="text-[10px] uppercase text-blue-400 block text-center">PF Máx</label>
                    <input type="number" className="w-full bg-black border border-blue-900/50 rounded text-center text-blue-200 font-bold" 
                        value={stats.maxPF} onChange={e => handleChange('maxPF', Number(e.target.value))} />
                </div>
            </div>

            {/* Linha 4: Ataque */}
            <div className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/10">
                <Sword size={20} className="text-white/50" />
                <div className="w-16">
                    <label className="text-[8px] uppercase text-white/50 block">ATQ</label>
                    <input className="w-full bg-black border border-white/20 rounded text-center text-white font-bold" 
                        value={stats.atqBonus} onChange={e => handleChange('atqBonus', e.target.value)} />
                </div>
                <div className="flex-1">
                     <label className="text-[8px] uppercase text-white/50 block">Arma / Fonte</label>
                     <input className="w-full bg-black border border-white/20 rounded px-2 text-white text-sm" 
                        value={stats.weaponName} onChange={e => handleChange('weaponName', e.target.value)} />
                </div>
                <div className="w-24">
                     <label className="text-[8px] uppercase text-white/50 block">Dano</label>
                     <input className="w-full bg-black border border-white/20 rounded px-2 text-white text-sm" 
                        value={stats.damageFormula} onChange={e => handleChange('damageFormula', e.target.value)} />
                </div>
                 <div className="w-24">
                     <label className="text-[8px] uppercase text-white/50 block">Tipo</label>
                     <input className="w-full bg-black border border-white/20 rounded px-2 text-white text-sm" 
                        value={stats.damageType} onChange={e => handleChange('damageType', e.target.value)} />
                </div>
            </div>

            {/* Habilidades */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase text-gold font-bold">Habilidades</label>
                    <button onClick={addAbility} className="text-[10px] bg-white/10 hover:bg-gold hover:text-black px-2 py-0.5 rounded flex items-center gap-1 transition-colors"><Plus /> Adicionar</button>
                </div>
                <div className="space-y-2">
                    {stats.abilities?.map((ab, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/5 rounded p-2 relative group">
                            <div className="flex gap-2 mb-1">
                                <input className="flex-1 bg-transparent border-b border-white/10 focus:border-gold text-white font-bold text-sm outline-none" 
                                    placeholder="Nome da Habilidade" value={ab.name} onChange={e => handleAbilityChange(idx, 'name', e.target.value)} />
                                <input className="w-24 bg-transparent border-b border-white/10 focus:border-gold text-white/60 text-xs text-right outline-none" 
                                    placeholder="(Passiva)" value={ab.tag} onChange={e => handleAbilityChange(idx, 'tag', e.target.value)} />
                            </div>
                            <textarea className="w-full bg-transparent text-white/80 text-xs outline-none resize-none h-auto min-h-[40px]" 
                                placeholder="Descrição..." value={ab.description} onChange={e => handleAbilityChange(idx, 'description', e.target.value)} />
                            
                            <button onClick={() => removeAbility(idx)} className="absolute top-2 right-2 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash size={14} />
                            </button>
                        </div>
                    ))}
                    {(stats.abilities.length === 0) && (
                        <p className="text-xs text-white/20 italic text-center">Nenhuma habilidade registrada.</p>
                    )}
                </div>
            </div>
            
            <div className="flex justify-end pt-2">
                <p className="text-[10px] text-white/30 flex items-center gap-1"><FloppyDisk /> Salvo automaticamente no Mapa e no Banco.</p>
            </div>
        </div>
    );
  };

  return (
    <DraggableWindow 
        title="Bestiário da Cena" 
        headerIcon={<BookOpen size={24} />} 
        onClose={onClose}
        initialWidth="600px" 
        initialHeight="80vh"
        minimizedPosition="bottom-left"
    >
        <div className="flex flex-col h-full bg-[#1a120b] overflow-hidden pointer-events-auto">
            {/* Lista de Inimigos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {enemies.length === 0 && (
                    <div className="text-center text-white/30 mt-10">
                        <Skull size={48} className="mx-auto mb-2 opacity-50"/>
                        <p>Nenhum inimigo no mapa.</p>
                    </div>
                )}

                {enemies.map(enemy => {
                    const isExpanded = expandedId === enemy.id;
                    const stats = { ...DEFAULT_STATS, ...(enemy.stats || {}) };
                    
                    const pvPercent = Math.min(100, Math.max(0, ((stats.currentPV) / (stats.maxPV || 1)) * 100));
                    const pfPercent = Math.min(100, Math.max(0, ((stats.currentPF) / (stats.maxPF || 1)) * 100));

                    return (
                        <div key={enemy.id} className={`bg-[#0a080c] border transition-all duration-300 rounded-lg overflow-hidden shadow-lg ${isExpanded ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}>
                            
                            {/* CABEÇALHO DO CARD (Sempre Visível) */}
                            <div className="p-3 flex gap-3 items-start relative">
                                {/* Imagem */}
                                <div className="w-16 h-16 rounded border border-white/20 overflow-hidden shrink-0 bg-black cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : enemy.id)}>
                                    <img src={enemy.img} className="w-full h-full object-cover" />
                                </div>

                                {/* Info Rápida */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : enemy.id)}>
                                        <h3 className="text-white font-bold font-rpg truncate text-lg leading-none mb-1">{enemy.name}</h3>
                                        <CaretRight size={16} className={`text-white/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>

                                    {/* Barra PV */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                                            <div className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-300" style={{ width: `${pvPercent}%` }}></div>
                                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                                                PV: {stats.currentPV} / {stats.maxPV}
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 shrink-0">
                                            <button onClick={() => handleQuickStatChange(enemy, 'currentPV', -1)} className="w-4 h-4 bg-red-900/50 rounded flex items-center justify-center hover:bg-red-600 text-white"><CaretDown size={10} weight="bold" /></button>
                                            <button onClick={() => handleQuickStatChange(enemy, 'currentPV', 1)} className="w-4 h-4 bg-green-900/50 rounded flex items-center justify-center hover:bg-green-600 text-white"><CaretUp size={10} weight="bold" /></button>
                                        </div>
                                    </div>

                                    {/* Barra PF */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                                            <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300" style={{ width: `${pfPercent}%` }}></div>
                                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                                                PF: {stats.currentPF} / {stats.maxPF}
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 shrink-0">
                                            <button onClick={() => handleQuickStatChange(enemy, 'currentPF', -1)} className="w-4 h-4 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-600 text-white"><CaretDown size={10} weight="bold" /></button>
                                            <button onClick={() => handleQuickStatChange(enemy, 'currentPF', 1)} className="w-4 h-4 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-500 text-white"><CaretUp size={10} weight="bold" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ÁREA EXPANDIDA (Detalhes e Edição) */}
                            {isExpanded && renderEnemyForm(enemy)}
                        </div>
                    );
                })}
            </div>
        </div>
    </DraggableWindow>
  );
}