import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Skull, CaretUp, CaretDown, BookOpen, Sword,
  Eye, EyeSlash, XCircle, Users, Shield,
} from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';
import { ConditionsPicker, ConditionsDisplay } from './conditions/ConditionsPicker';
import { findCharacterToken, getPrimaryAuraClass } from '../lib/tokenConditions';
import { ConditionGlobalStyles } from './conditions/ConditionStyles';
import { ConditionId } from '../types/sheetExtras';

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

interface MapToken {
  id: string;
  name: string;
  img: string;
  type: 'player' | 'enemy' | 'companion';
  stats?: EnemyStats;
  conditions?: { active?: ConditionId[] };
  charId?: string;
}

export interface CombatCharacter {
  id: string;
  name: string;
  class?: string;
  level?: number;
  imageUrl?: string;
  stats?: {
    hp?: { current: number; max: number };
    stress?: { current: number; max: number };
    hope?: { current: number; max: number };
  };
  conditions?: { active?: ConditionId[] };
}

interface CombatTrackerProps {
  sessaoData: any;
  isMaster: boolean;
  characters: CombatCharacter[];
  onClose: () => void;
  onSelectCharacter?: (char: CombatCharacter) => void;
}

const DEFAULT_STATS: EnemyStats = {
  type: 'Comum', description: '', motivations: '',
  difficulty: 10, thresholdMajor: 5, thresholdMinor: 10,
  maxPV: 10, currentPV: 10, maxPF: 5, currentPF: 5,
  atqBonus: '+0', weaponName: 'Ataque', damageType: 'Físico', damageFormula: '1d4',
  abilities: [],
};

function ResourceBar({
  label,
  current,
  max,
  colorClass,
  onDelta,
  readOnly,
}: {
  label: string;
  current: number;
  max: number;
  colorClass: string;
  onDelta?: (delta: number) => void;
  readOnly?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-4 bg-gray-900 rounded overflow-hidden border border-white/10 relative">
        <div className={`absolute inset-y-0 left-0 transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md z-10">
          {current} / {max} {label}
        </span>
      </div>
      {!readOnly && onDelta && (
        <div className="flex gap-0.5 shrink-0">
          <button onClick={() => onDelta(-1)} className="w-5 h-5 bg-red-900/50 rounded flex items-center justify-center hover:bg-red-600 text-white text-[10px]"><CaretDown weight="bold" /></button>
          <button onClick={() => onDelta(1)} className="w-5 h-5 bg-green-900/50 rounded flex items-center justify-center hover:bg-green-600 text-white text-[10px]"><CaretUp weight="bold" /></button>
        </div>
      )}
    </div>
  );
}

export default function CombatTracker({
  sessaoData,
  isMaster,
  characters,
  onClose,
  onSelectCharacter,
}: CombatTrackerProps) {
  const [enemies, setEnemies] = useState<MapToken[]>([]);
  const [expandedEnemyId, setExpandedEnemyId] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (sessaoData?.active_map?.tokens) {
      setEnemies(sessaoData.active_map.tokens.filter((t: MapToken) => t.type === 'enemy'));
    } else {
      setEnemies([]);
    }
  }, [sessaoData]);

  const updateTokenStats = async (tokenId: string, updates: Partial<EnemyStats>) => {
    if (!sessaoData?.id || !sessaoData.active_map) return;
    const allTokens = [...sessaoData.active_map.tokens];
    const idx = allTokens.findIndex((t: MapToken) => t.id === tokenId);
    if (idx === -1) return;
    allTokens[idx] = { ...allTokens[idx], stats: { ...DEFAULT_STATS, ...allTokens[idx].stats, ...updates } };
    await updateDoc(doc(db, 'sessoes', sessaoData.id), { 'active_map.tokens': allTokens });
  };

  const updateTokenConditions = async (tokenId: string, active: ConditionId[]) => {
    if (!sessaoData?.id || !sessaoData.active_map) return;
    const allTokens = [...sessaoData.active_map.tokens];
    const idx = allTokens.findIndex((t: MapToken) => t.id === tokenId);
    if (idx === -1) return;
    allTokens[idx] = { ...allTokens[idx], conditions: { active } };
    await updateDoc(doc(db, 'sessoes', sessaoData.id), { 'active_map.tokens': allTokens });
  };

  const updateCharacterStat = async (charId: string, stat: 'hp' | 'stress', delta: number) => {
    const char = characters.find((c) => c.id === charId);
    if (!char?.stats) return;
    const key = stat === 'hp' ? 'hp' : 'stress';
    const current = char.stats[key];
    if (!current) return;
    const newCurrent = Math.min(current.max, Math.max(0, current.current + delta));
    await updateDoc(doc(db, 'characters', charId), {
      stats: { ...char.stats, [key]: { ...current, current: newCurrent } },
    });
  };

  const handleEnemyStatChange = (enemy: MapToken, stat: 'currentPV' | 'currentPF', delta: number) => {
    const stats = { ...DEFAULT_STATS, ...enemy.stats };
    const max = stat === 'currentPV' ? stats.maxPV : stats.maxPF;
    const newValue = Math.min(max, Math.max(0, (stats[stat] ?? 0) + delta));
    updateTokenStats(enemy.id, { [stat]: newValue });
  };

  const title = isMaster ? 'Rastreador de Combate' : 'Aliados em Combate';
  const icon = isMaster ? <Sword size={24} /> : <Users size={24} />;

  return (
    <DraggableWindow
      title={title}
      headerIcon={icon}
      onClose={onClose}
      initialWidth="500px"
      initialHeight="70vh"
      minimizedPosition="bottom-left"
    >
      <div className="flex flex-col h-full bg-[#1a120b] overflow-hidden pointer-events-auto">
        <ConditionGlobalStyles />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

          {/* JOGADORES */}
          <section>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Users size={14} className="text-green-400" />
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                {isMaster ? 'Jogadores' : 'Aliados'}
              </span>
              <span className="text-[9px] text-white/30">({characters.length})</span>
            </div>

            {characters.length === 0 ? (
              <p className="text-xs text-white/30 italic px-1">Nenhum personagem no grupo ativo.</p>
            ) : (
              <div className="space-y-2">
                {characters.map((char) => {
                  const hp = char.stats?.hp || { current: 0, max: 0 };
                  const stress = char.stats?.stress || { current: 0, max: 0 };
                  const hope = char.stats?.hope || { current: 0, max: 0 };
                  const isExpanded = expandedPlayerId === char.id;
                  const playerToken = findCharacterToken(sessaoData?.active_map?.tokens, char.id);
                  const conditions = playerToken?.conditions?.active || [];

                  return (
                    <div
                      key={char.id}
                      className={`bg-[#0a080c] border border-green-500/20 rounded-lg overflow-hidden hover:border-green-500/40 transition-colors relative ${getPrimaryAuraClass(conditions)}`}
                    >
                      <div className="p-3">
                        <div className="flex gap-3 items-start">
                          <button
                            type="button"
                            onClick={() => isMaster && onSelectCharacter?.(char)}
                            className="w-12 h-12 rounded-full border-2 border-green-500/40 overflow-hidden shrink-0 bg-black hover:border-green-400 transition-colors"
                          >
                            {char.imageUrl ? (
                              <img src={char.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30 text-sm font-bold">{char.name?.[0]}</div>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1 mb-1">
                              <div>
                                <h3 className="font-bold text-white text-sm truncate">{char.name}</h3>
                                <span className="text-[9px] text-white/40 uppercase">{char.class} • Nv.{char.level}</span>
                              </div>
                              <button
                                onClick={() => setExpandedPlayerId(isExpanded ? null : char.id)}
                                className="text-white/30 hover:text-white p-0.5"
                              >
                                {isExpanded ? <EyeSlash size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <div className="mb-1.5"><ConditionsDisplay active={conditions} /></div>
                            <div className="space-y-1">
                              <ResourceBar
                                label="PV"
                                current={hp.current}
                                max={hp.max}
                                colorClass="bg-red-700"
                                readOnly={!isMaster}
                                onDelta={isMaster ? (d) => updateCharacterStat(char.id, 'hp', d) : undefined}
                              />
                              <ResourceBar
                                label="PF"
                                current={stress.current}
                                max={stress.max}
                                colorClass="bg-purple-700"
                                readOnly={!isMaster}
                                onDelta={isMaster ? (d) => updateCharacterStat(char.id, 'stress', d) : undefined}
                              />
                              {!isMaster && (
                                <div className="text-[9px] text-gold/70 text-right">
                                  Esperança: {hope.current}/{hope.max}
                                </div>
                              )}
                              {isMaster && (
                                <div className="text-[9px] text-gold/70 text-right">
                                  Esperança: {hope.current}/{hope.max}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {isExpanded && isMaster && (
                        <div className="border-t border-white/10 p-3 bg-black/30">
                          <div className="text-[10px] uppercase text-gold/50 font-bold mb-2">Condições no token</div>
                          {playerToken ? (
                            <ConditionsPicker
                              active={conditions}
                              onChange={(active) => updateTokenConditions(playerToken.id, active)}
                              compact
                            />
                          ) : (
                            <p className="text-[10px] text-white/40 italic">
                              Coloque o token deste personagem no mapa para aplicar condições.
                            </p>
                          )}
                        </div>
                      )}
                      {isExpanded && !isMaster && conditions.length > 0 && (
                        <div className="border-t border-white/10 p-3 bg-black/30">
                          <div className="text-[10px] uppercase text-white/40 font-bold mb-1">Condições ativas</div>
                          <ConditionsDisplay active={conditions} compact={false} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* INIMIGOS — só mestre */}
          {isMaster && (
            <section>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Skull size={14} className="text-red-400" />
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Inimigos</span>
                <span className="text-[9px] text-white/30">({enemies.length})</span>
              </div>

              {enemies.length === 0 ? (
                <div className="text-center text-white/30 py-6 flex flex-col items-center">
                  <BookOpen size={32} className="mb-2 opacity-50" />
                  <p className="text-xs">Nenhum inimigo no mapa.</p>
                  <p className="text-[10px]">Spawne pelo Gerenciador de Mesa.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {enemies.map((enemy) => {
                    const isExpanded = expandedEnemyId === enemy.id;
                    const stats = { ...DEFAULT_STATS, ...enemy.stats };
                    const conditions = enemy.conditions?.active || [];
                    const maxHP = stats.maxPV || 1;
                    const currentHP = stats.currentPV;
                    const isDefeated = currentHP <= 0;
                    const valCritical = Math.max(1, Math.floor(maxHP * 0.2));
                    const isCritical = !isDefeated && currentHP <= valCritical;
                    const valInjured = Math.floor(maxHP * 0.5);
                    const isInjured = !isDefeated && !isCritical && currentHP <= valInjured;
                    const pvPercent = Math.min(100, Math.max(0, (currentHP / maxHP) * 100));
                    const pfPercent = Math.min(100, Math.max(0, (stats.currentPF / (stats.maxPF || 1)) * 100));

                    return (
                      <div
                        key={enemy.id}
                        className={`bg-[#0a080c] border rounded-lg overflow-hidden shadow-lg relative ${getPrimaryAuraClass(conditions)} ${isDefeated ? 'border-gray-800 opacity-80' : isExpanded ? 'border-gold ring-1 ring-gold/20' : 'border-red-500/20 hover:border-red-500/40'}`}
                      >
                        <div className="p-3">
                          <div className="flex gap-3 items-start">
                            <div
                              className="relative w-14 h-14 rounded border border-white/20 overflow-hidden shrink-0 bg-black cursor-pointer"
                              onClick={() => setExpandedEnemyId(isExpanded ? null : enemy.id)}
                            >
                              <img src={enemy.img} className={`w-full h-full object-cover ${isDefeated ? 'grayscale brightness-50' : ''}`} alt="" />
                              {isDefeated && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Skull size={24} className="text-white/50" weight="fill" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div className={isDefeated ? 'opacity-50' : ''}>
                                  <h3 className={`font-bold truncate text-sm ${isDefeated ? 'text-white/50 line-through' : 'text-white'}`}>{enemy.name}</h3>
                                  <span className="text-[9px] text-white/50 uppercase">{stats.type} • Dif. {stats.difficulty}</span>
                                </div>
                                {isDefeated ? (
                                  <span className="text-[8px] font-bold text-gray-400 border border-gray-600 px-1 rounded bg-gray-900 flex items-center gap-0.5">
                                    <XCircle weight="fill" size={10} /> DERROTADO
                                  </span>
                                ) : isCritical ? (
                                  <span className="text-[8px] font-bold text-red-500 border border-red-500 px-1 rounded bg-red-900/20 animate-pulse">CRÍTICO</span>
                                ) : isInjured ? (
                                  <span className="text-[8px] font-bold text-orange-400 border border-orange-400 px-1 rounded bg-orange-900/20">FERIDO</span>
                                ) : null}
                              </div>
                              <div className="mb-1.5"><ConditionsDisplay active={conditions} /></div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-4 bg-gray-900 rounded overflow-hidden border border-white/10 relative">
                                  <div
                                    className={`absolute inset-y-0 left-0 transition-all ${isDefeated ? 'bg-gray-700' : isCritical ? 'bg-red-800' : isInjured ? 'bg-orange-600' : 'bg-green-700'}`}
                                    style={{ width: `${pvPercent}%` }}
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white z-10">
                                    {stats.currentPV} / {stats.maxPV} PV
                                  </span>
                                </div>
                                {!isDefeated && (
                                  <div className="flex gap-0.5 shrink-0">
                                    <button onClick={() => handleEnemyStatChange(enemy, 'currentPV', -1)} className="w-5 h-5 bg-red-900/50 rounded flex items-center justify-center hover:bg-red-600 text-white"><CaretDown weight="bold" /></button>
                                    <button onClick={() => handleEnemyStatChange(enemy, 'currentPV', 1)} className="w-5 h-5 bg-green-900/50 rounded flex items-center justify-center hover:bg-green-600 text-white"><CaretUp weight="bold" /></button>
                                  </div>
                                )}
                              </div>
                              {!isDefeated && (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-3 bg-gray-900 rounded overflow-hidden border border-white/10 relative">
                                    <div className="absolute inset-y-0 left-0 bg-blue-600 transition-all" style={{ width: `${pfPercent}%` }} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white z-10">
                                      {stats.currentPF} / {stats.maxPF} PF
                                    </span>
                                  </div>
                                  <div className="flex gap-0.5 shrink-0">
                                    <button onClick={() => handleEnemyStatChange(enemy, 'currentPF', -1)} className="w-5 h-5 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-600 text-white text-[10px]"><CaretDown weight="bold" /></button>
                                    <button onClick={() => handleEnemyStatChange(enemy, 'currentPF', 1)} className="w-5 h-5 bg-blue-900/50 rounded flex items-center justify-center hover:bg-blue-500 text-white text-[10px]"><CaretUp weight="bold" /></button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-black/40 border-t border-white/10 p-3 space-y-3 text-sm">
                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                              <Sword size={18} className="text-white" />
                              <div>
                                <div className="text-gold font-bold uppercase text-[10px]">Ataque</div>
                                <div className="text-white text-xs font-bold">{stats.atqBonus} | {stats.weaponName}</div>
                                <div className="text-[10px] text-white/70">{stats.damageFormula} ({stats.damageType})</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-gold/50 font-bold mb-1">Condições</div>
                              <ConditionsPicker
                                active={conditions}
                                onChange={(active) => updateTokenConditions(enemy.id, active)}
                                compact
                              />
                            </div>
                            {stats.abilities?.length > 0 && (
                              <div>
                                <div className="text-[10px] uppercase text-gold/50 font-bold mb-1">Habilidades</div>
                                {stats.abilities.map((ab, idx) => (
                                  <div key={idx} className="bg-black/60 p-2 rounded border border-white/5 mb-1">
                                    <span className="text-white font-bold text-xs">{ab.name}</span>
                                    <p className="text-[10px] text-white/60 italic mt-0.5">"{ab.description}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {!isMaster && (
            <p className="text-[10px] text-white/25 text-center px-2 flex items-center justify-center gap-1">
              <Shield size={10} /> Inimigos e detalhes ocultos — visível apenas ao Mestre.
            </p>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
