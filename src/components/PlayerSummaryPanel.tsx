import { useState } from 'react';
import { CaretDown, CaretUp, Heart, Lightning, Coins, Users, X } from '@phosphor-icons/react';
import { CONDITION_MAP } from '../data/conditions';
import { ConditionId, ISheetMarker } from '../types/sheetExtras';

interface SummaryCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  imageUrl?: string;
  stats?: {
    hp?: { current: number; max: number };
    stress?: { current: number; max: number };
    hope?: { current: number; max: number };
  };
  sheetMarkers?: ISheetMarker[];
  conditions?: { active?: ConditionId[] };
}

interface PlayerSummaryPanelProps {
  characters: SummaryCharacter[];
  onSelectCharacter: (char: SummaryCharacter) => void;
}

function MarkerBadge({ marker }: { marker: ISheetMarker }) {
  const display =
    marker.type === 'dice' && marker.dieSides
      ? `${marker.label}: ${marker.value}/${marker.max ?? marker.dieSides}`
      : marker.type === 'text'
        ? `${marker.label}: ${marker.note || '—'}`
        : `${marker.label}: ${marker.value}`;

  return (
    <span
      className="px-1.5 py-0.5 rounded bg-purple-900/30 border border-purple-500/20 text-[9px] text-purple-200 truncate max-w-full"
      title={marker.description || display}
    >
      {display}
    </span>
  );
}

export function PlayerSummaryPanel({ characters, onSelectCharacter }: PlayerSummaryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!characters.length) return null;

  return (
    <div className="absolute top-6 right-6 z-[850] w-72 pointer-events-auto animate-slide-left">
      <div className="bg-[#120f16]/95 border border-white/15 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#1a1520] border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gold" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Resumo PCs</span>
            <span className="text-[10px] text-white/40">({characters.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              {isMinimized ? <CaretDown size={14} /> : <CaretUp size={14} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {isOpen && !isMinimized && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-2">
            {characters.map((char) => {
              const hp = char.stats?.hp;
              const stress = char.stats?.stress;
              const hope = char.stats?.hope;
              const activeConditions = char.conditions?.active || [];
              const markers = char.sheetMarkers || [];

              return (
                <button
                  key={char.id}
                  onClick={() => onSelectCharacter(char)}
                  className="w-full text-left p-2 rounded-lg bg-black/30 border border-white/10 hover:border-gold/40 hover:bg-black/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-black/50 border border-white/20 overflow-hidden shrink-0">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30">
                          {char.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-gold transition-colors">
                        {char.name}
                      </span>
                      <span className="text-[9px] text-white/40 uppercase">
                        {char.class} • Nv.{char.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-[10px] mb-1.5">
                    <span className="flex items-center gap-0.5 text-red-400" title="PV">
                      <Heart size={10} weight="fill" />
                      {hp?.current ?? 0}/{hp?.max ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5 text-purple-400" title="PF">
                      <Lightning size={10} weight="fill" />
                      {stress?.current ?? 0}/{stress?.max ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5 text-gold" title="Esperança">
                      <Coins size={10} weight="fill" />
                      {hope?.current ?? 0}/{hope?.max ?? 0}
                    </span>
                  </div>

                  {activeConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {activeConditions.map((id) => {
                        const cond = CONDITION_MAP[id];
                        return cond ? (
                          <span
                            key={id}
                            className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase border ${cond.borderColor} ${cond.color}`}
                          >
                            {cond.shortLabel}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {markers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {markers
                        .filter((m) => m.value > 0 || m.type === 'number' || m.type === 'text')
                        .slice(0, 4)
                        .map((m) => (
                          <MarkerBadge key={m.key} marker={m} />
                        ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
