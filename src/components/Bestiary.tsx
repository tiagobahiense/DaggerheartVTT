import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { 
  Skull, CaretUp, CaretDown, BookOpen, Sword, 
  Eye, EyeSlash, XCircle 
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

const DEFAULT_STATS: EnemyStats = {
    type: "Comum", description: "", motivations: "",
    difficulty: 10, thresholdMajor: 5, thresholdMinor: 10,
    maxPV: 10, currentPV: 10, maxPF: 5, currentPF: 5,
    atqBonus: "+0", weaponName: "Ataque", damageType: "Físico", damageFormula: "1d4",
    abilities: []
};

export default function Bestiary({ sessaoData, onClose }: { sessaoData: any, onClose: () => void }) {
  const [enemies, setEnemies] = useState<Token[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (sessaoData?.active_map?.tokens) {
      const activeEnemies = sessaoData.active_map.tokens.filter((t: any) => t.type === 'enemy');
      setEnemies(activeEnemies);
    } else {
      setEnemies([]);
    }
  }, [sessaoData]);

  const updateTokenStats = async (tokenId: string, updates: Partial<EnemyStats>) => {
    if (!sessaoData?.id || !sessaoData.active_map) return;

    const allTokens = [...sessaoData.active_map.tokens];
    const tokenIndex = allTokens.findIndex((t: any) => t.id === tokenId);
    
    if (tokenIndex === -1) return;

    const currentStats = allTokens[tokenIndex].stats || DEFAULT_STATS;
    const newStats = { ...currentStats, ...updates };
    
    allTokens[tokenIndex] = { ...allTokens[tokenIndex], stats: newStats };

    await updateDoc(doc(db, 'sessoes', sessaoData.id), {
        "active_map.tokens": allTokens
    });
  };

  const handleQuickStatChange = (token: Token, stat: 'currentPV' | 'currentPF', delta: number) => {
    const stats = token.stats || DEFAULT_STATS;
    const current = stats[stat] ?? 0;
    const max = stat === 'currentPV' ? (stats.maxPV ?? 10) : (stats.maxPF ?? 5);
    // Permite chegar a 0, mas não negativo via botões (embora logicamente 0 seja derrotado)
    const newValue = Math.min(max, Math.max(0, current + delta));
    updateTokenStats(token.id, { [stat]: newValue });
  };

  return (
    <DraggableWindow 
        title="Bestiário (Combate)" 
        headerIcon={<Skull size={24} />} 
        onClose={onClose}
        initialWidth="500px" 
        initialHeight="70vh"
        minimizedPosition="bottom-left"
    >
        <div className="flex flex-col h-full bg-[#1a120b] overflow-hidden pointer-events-auto">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {enemies.length === 0 && (
                    <div className="text-center text-white/30 mt-10 flex flex-col items-center">
                        <BookOpen size={48} className="mb-2 opacity-50"/>
                        <p>Nenhum inimigo no mapa.</p>
                        <p className="text-xs">Spawne inimigos pelo Gerenciador de Mesa.</p>
                    </div>
                )}

                {enemies.map(enemy => {
                    const isExpanded = expandedId === enemy.id;
                    const stats = { ...DEFAULT_STATS, ...(enemy.stats || {}) };
                    
                    const pvPercent = Math.min(100, Math.max(0, ((stats.currentPV) / (stats.maxPV || 1)) * 100));
                    const pfPercent = Math.min(100, Math.max(0, ((stats.currentPF) / (stats.maxPF || 1)) * 100));

                    // --- LÓGICA MATEMÁTICA DE ESTADO ---
                    const maxHP = stats.maxPV || 1;
                    const currentHP = stats.currentPV;

                    // 1. Derrotado: 0 ou menos
                    const isDefeated = currentHP <= 0;

                    // 2. Crítico: 20% da vida máxima (arredondado para baixo)
                    // Math.max(1, ...) garante que monstros com pouca vida (ex: 4 PV) tenham ao menos 1 PV como crítico
                    const valCritical = Math.max(1, Math.floor(maxHP * 0.2)); 
                    const isCritical = !isDefeated && currentHP <= valCritical;

                    // 3. Ferido: 50% da vida máxima
                    const valInjured = Math.floor(maxHP * 0.5);
                    const isInjured = !isDefeated && !isCritical && currentHP <= valInjured;

                    return (
                        <div key={enemy.id} className={`bg-[#0a080c] border transition-all duration-300 rounded-lg overflow-hidden shadow-lg ${isDefeated ? 'border-gray-800 opacity-80' : isExpanded ? 'border-gold ring-1 ring-gold/20' : 'border-white/20 hover:border-white/50'}`}>
                            
                            {/* --- COMBAT CARD --- */}
                            <div className="p-3">
                                <div className="flex gap-3 items-start mb-3">
                                    {/* Imagem + Efeitos Visuais de Status */}
                                    <div className="relative w-16 h-16 rounded border border-white/20 overflow-hidden shrink-0 bg-black cursor-pointer group" onClick={() => setExpandedId(isExpanded ? null : enemy.id)}>
                                        <img 
                                            src={enemy.img} 
                                            className={`w-full h-full object-cover transition-all ${isDefeated ? 'grayscale brightness-50' : ''}`} 
                                        />
                                        
                                        {/* Overlay de Derrotado (Caveira Fixa) */}
                                        {isDefeated && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <Skull size={32} className="text-white/50" weight="fill"/>
                                            </div>
                                        )}

                                        {/* Hover de Expandir */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            {isExpanded ? <EyeSlash size={24} className="text-white"/> : <Eye size={24} className="text-white"/>}
                                        </div>
                                    </div>

                                    {/* Info Principal + Barras */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className={isDefeated ? "opacity-50" : ""}>
                                                <h3 className={`font-bold font-rpg truncate text-lg leading-none ${isDefeated ? "text-white/50 line-through" : "text-white"}`}>{enemy.name}</h3>
                                                <span className="text-[10px] text-white/50 uppercase tracking-wider">{stats.type} • Dif. {stats.difficulty}</span>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className="flex gap-1">
                                                {isDefeated ? (
                                                     <span className="text-[9px] font-bold text-gray-400 border border-gray-600 px-1.5 py-0.5 rounded bg-gray-900 flex items-center gap-1">
                                                         <XCircle weight="fill"/> DERROTADO
                                                     </span>
                                                ) : isCritical ? (
                                                     <span className="text-[9px] font-bold text-red-500 border border-red-500 px-1 rounded bg-red-900/20 animate-pulse" title={`<= 20% (${valCritical} PV)`}>
                                                         CRÍTICO
                                                     </span>
                                                ) : isInjured ? (
                                                     <span className="text-[9px] font-bold text-orange-400 border border-orange-400 px-1 rounded bg-orange-900/20" title={`<= 50% (${valInjured} PV)`}>
                                                         FERIDO
                                                     </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Barra PV */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 h-5 bg-gray-900 rounded overflow-hidden border border-white/10 relative">
                                                {/* Cor da barra muda conforme status */}
                                                <div 
                                                    className={`absolute inset-y-0 left-0 transition-all duration-300 
                                                        ${isDefeated ? 'bg-gray-700' : isCritical ? 'bg-red-800' : isInjured ? 'bg-orange-600' : 'bg-green-700'}
                                                    `} 
                                                    style={{ width: `${pvPercent}%` }}
                                                ></div>
                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md z-10">
                                                    {stats.currentPV} / {stats.maxPV} PV
                                                </span>
                                            </div>
                                            <div className="flex gap-0.5 shrink-0">
                                                <button onClick={() => handleQuickStatChange(enemy, 'currentPV', -1)} className="w-5 h-5 bg-red-900/50 rounded flex items-center justify-center hover:bg-red-600 text-white"><CaretDown weight="bold" /></button>
                                                <button onClick={() => handleQuickStatChange(enemy, 'currentPV', 1)} className="w-5 h-5 bg-green-900/50 rounded flex items-center justify-center hover:bg-green-600 text-white"><CaretUp weight="bold" /></button>
                                            </div>
                                        </div>

                                        {/* Barra PF */}
                                        {!isDefeated && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-3 bg-gray-900 rounded overflow-hidden border border-white/10 relative">
                                                    <div className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300" style={{ width: `${pfPercent}%` }}></div>
                                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md z-10">
                                                        {stats.currentPF} / {stats.maxPF} PF
                                                    </span>
                                                </div>
                                                <div className="flex gap-0.5 shrink-0">
                                                    <button onClick={() => handleQuickStatChange(enemy, 'currentPF', -1)} className="w-5 h-5 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-600 text-white text-[10px]"><CaretDown weight="bold"/></button>
                                                    <button onClick={() => handleQuickStatChange(enemy, 'currentPF', 1)} className="w-5 h-5 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-500 text-white text-[10px]"><CaretUp weight="bold"/></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* --- FICHA EXPANDIDA (Oculta se derrotado para limpar visual, ou mantém se quiser conferir loot/xp) --- */}
                            {isExpanded && (
                                <div className="bg-black/40 border-t border-white/10 p-3 space-y-3 animate-fade-in text-sm">
                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                                        <div className="bg-white/10 p-2 rounded-full"><Sword size={20} className="text-white"/></div>
                                        <div>
                                            <div className="text-gold font-bold uppercase text-xs">Ataque Padrão</div>
                                            <div className="text-white font-bold">{stats.atqBonus} <span className="text-white/50 mx-1">|</span> {stats.weaponName}</div>
                                            <div className="text-xs text-white/70">{stats.damageFormula} ({stats.damageType})</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase text-gold/50 font-bold mb-1">Habilidades & Táticas</div>
                                        <div className="space-y-2">
                                            {stats.abilities?.map((ab, idx) => (
                                                <div key={idx} className="bg-black/60 p-2 rounded border border-white/5">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-white font-bold text-xs">{ab.name}</span>
                                                        <span className="text-[9px] bg-white/10 px-1 rounded text-white/60">{ab.tag}</span>
                                                    </div>
                                                    <p className="text-[11px] text-white/70 leading-relaxed italic">"{ab.description}"</p>
                                                </div>
                                            ))}
                                            {(!stats.abilities || stats.abilities.length === 0) && <p className="text-white/20 text-xs italic">Sem habilidades especiais.</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-white/50 border-t border-white/5 pt-2">
                                        <div><strong className="block text-white/30 mb-0.5">Descrição:</strong>{stats.description || "-"}</div>
                                        <div><strong className="block text-white/30 mb-0.5">Motivação:</strong>{stats.motivations || "-"}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </DraggableWindow>
  );
}