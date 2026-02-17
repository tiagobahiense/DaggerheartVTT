import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import { SHIELD_RULES, ShieldRule } from '../data/shieldData';
import { CaretLeft, ShieldCheck, MagnifyingGlass } from '@phosphor-icons/react';

export default function MasterShield({ onClose }: { onClose: () => void }) {
  const [selectedRule, setSelectedRule] = useState<ShieldRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtragem simples
  const filteredRules = SHIELD_RULES.filter(rule => 
    rule.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DraggableWindow
        title="Escudo do Mestre"
        headerIcon={<ShieldCheck size={24} weight="fill" />}
        onClose={onClose}
        initialWidth="900px"
        initialHeight="650px"
        minimizedPosition="bottom-right" // Fica perto dos dados
    >
        <div className="flex flex-col h-full bg-[#151019] text-white">
            
            {/* Navegação ou Busca */}
            {!selectedRule && (
                <div className="p-4 pb-2">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar regra..." 
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-gold outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                
                {/* VISTA DETALHADA (Quando um card é clicado) */}
                {selectedRule ? (
                    <div className="animate-fade-in-right h-full flex flex-col">
                        <button 
                            onClick={() => setSelectedRule(null)} 
                            className="flex items-center gap-2 text-white/50 hover:text-gold mb-4 transition-colors w-fit group"
                        >
                            <div className="p-1 rounded-full bg-white/5 group-hover:bg-gold group-hover:text-black transition-colors">
                                <CaretLeft size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Voltar para Regras</span>
                        </button>

                        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold/20 to-transparent border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                                {selectedRule.icon}
                            </div>
                            <h2 className="text-3xl font-rpg text-gold">{selectedRule.title}</h2>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            {selectedRule.content}
                        </div>
                    </div>
                ) : (
                    /* VISTA EM GRID (Lista de Cards) */
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up">
                        {filteredRules.map((rule) => (
                            <div 
                                key={rule.id}
                                onClick={() => setSelectedRule(rule)}
                                className="group bg-[#1e1724] border border-white/10 hover:border-gold/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:-translate-y-1 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-white">
                                    {rule.icon} {/* Ícone grande de fundo */}
                                </div>
                                
                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 group-hover:border-gold group-hover:text-gold flex items-center justify-center transition-colors shadow-lg">
                                        {React.cloneElement(rule.icon as React.ReactElement, { size: 24 })}
                                    </div>
                                    <h3 className="font-bold text-white group-hover:text-gold transition-colors">{rule.title}</h3>
                                </div>
                            </div>
                        ))}
                        
                        {filteredRules.length === 0 && (
                            <div className="col-span-full text-center text-white/30 py-10 italic">
                                Nenhuma regra encontrada.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </DraggableWindow>
  );
}