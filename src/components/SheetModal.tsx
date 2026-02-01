// src/components/SheetModal.tsx
import { useState } from 'react';
import { 
  X, Shield, Sword, Heart, Skull, 
  Coins, Scroll, Backpack, Lightning, 
  TrendUp, PersonSimpleRun, BookOpen, 
  CaretUp, User, PencilSimple, Target
} from '@phosphor-icons/react';

import { CLASS_DATABASE } from '../data/classDatabase';
import { 
    AttributeBox, ResourceDisplay, ThresholdBox, 
    TextAreaQuestion, EvolutionColumn, ArmorWidget,
    CombatRow, ArmorRow, ImageUrlModal, ItemRow 
} from './sheet/SheetWidgets';

interface SheetModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SheetModal = ({ character, isOpen, onClose }: SheetModalProps) => {
  const [activeTab, setActiveTab] = useState('principal');
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  const [paSpent, setPaSpent] = useState(0);
  const [characterImage, setCharacterImage] = useState(character?.imageUrl || ''); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!isOpen || !character) return null;

  const classKey = character.class?.toLowerCase().replace(' ', '') || "mago";
  const classData = CLASS_DATABASE[classKey] || CLASS_DATABASE["mago"];
  
  // Limiares e PA
  const finalMajor = classData.damageThresholds.major + character.level;
  const finalSevere = classData.damageThresholds.severe + character.level;
  const maxPA = classData.stats.baseArmorPoints;
  const totalEvasion = classData.stats.evasion + (character.attributes?.agility?.value || 0);

  const handleUpdatePA = (index: number, isSpent: boolean) => {
      if (isSpent) setPaSpent(index); else setPaSpent(index + 1);
  };

  const handleImageUpdate = (newUrl: string) => {
    setCharacterImage(newUrl);
  };

  const toggleTrait = (category: string, trait: string) => {
    setSelectedTraits(prev => {
      const current = prev[category] || [];
      if (current.includes(trait)) return { ...prev, [category]: current.filter(t => t !== trait) };
      return { ...prev, [category]: [...current, trait] };
    });
  };

  const tabs = [
    { id: 'principal', label: 'Geral', icon: <User /> },
    { id: 'combate', label: 'Combate', icon: <Target /> },
    { id: 'inventario', label: 'Mochila', icon: <Backpack /> },
    { id: 'guia', label: 'Guia', icon: <BookOpen /> }, 
    { id: 'evolucao', label: 'Evolução', icon: <CaretUp /> },
    { id: 'descricao', label: 'Descrição', icon: <Scroll /> } 
  ];

  return (
    // CORREÇÃO AQUI: removido backdrop-blur-md, agora usa apenas cor sólida com opacidade
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 animate-fade-in p-4" onClick={onClose}>
      <ImageUrlModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onConfirm={handleImageUpdate} currentUrl={characterImage} />

      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#120f16] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="bg-[#1a1520] border-b border-white/10 px-6 py-3 flex justify-between items-center shrink-0" style={{ borderTop: `4px solid ${classData.color}` }}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-black border border-white/20 flex items-center justify-center font-bold text-white text-sm">{character.level}</div>
             <div>
                <h2 className="text-lg font-rpg font-bold text-white leading-none">{character.name}</h2>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">{classData.label} • {character.subclass}</span>
             </div>
          </div>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/5 overflow-x-auto gap-1">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-900/20 rounded-full transition-colors group"><X size={18} className="text-white/50 group-hover:text-red-400" /></button>
        </div>

        {/* BODY (CONTEÚDO) */}
        <div className="flex-1 overflow-hidden p-6 bg-[url('/texture-noise.png')] bg-repeat relative">
          
          {/* === ABA GERAL === */}
          {activeTab === 'principal' && (
            <div className="h-full flex flex-col gap-6">
              
              {/* ÁREA PRINCIPAL: 3 COLUNAS */}
              <div className="flex flex-1 gap-6 min-h-0">
                  
                  {/* COLUNA 1: ATRIBUTOS */}
                  <div className="w-1/4 flex flex-col h-full bg-[#1a1520]/50 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-[#1a1520] p-3 border-b border-white/10 flex items-center gap-2 shrink-0">
                        <PersonSimpleRun className="text-white/50" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Atributos</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full justify-between">
                        <div className="space-y-2">
                            <AttributeBox label="Agilidade" value={character.attributes?.agility?.value} icon={<PersonSimpleRun />} color={classData.color} />
                            <AttributeBox label="Força" value={character.attributes?.strength?.value} icon={<Sword />} color={classData.color} />
                            <AttributeBox label="Acuidade" value={character.attributes?.finesse?.value} icon={<TrendUp />} color={classData.color} />
                        </div>
                        <div className="border-t border-white/5 my-1"></div>
                        <div className="space-y-2">
                            <AttributeBox label="Instinto" value={character.attributes?.instinct?.value} icon={<Lightning />} color={classData.color} />
                            <AttributeBox label="Presença" value={character.attributes?.presence?.value} icon={<Shield />} color={classData.color} />
                            <AttributeBox label="Conhec." value={character.attributes?.knowledge?.value} icon={<Scroll />} color={classData.color} />
                        </div>
                    </div>
                  </div>

                  {/* COLUNA 2: AVATAR + RECURSOS */}
                  <div className="flex-1 flex flex-col items-center">
                      <div className="flex gap-4 mb-6 w-full justify-center shrink-0">
                         <div className="flex-1 max-w-[100px]">
                            <ResourceDisplay label="Vida (PV)" current={classData.stats.hp} max={classData.stats.hp} color="text-red-500" icon={<Heart weight="fill" />} />
                         </div>
                         <div className="flex-1 max-w-[100px]">
                            <ResourceDisplay label="Estresse (PF)" current={0} max={classData.stats.stress} color="text-purple-500" icon={<Lightning weight="fill" />} />
                         </div>
                         <div className="flex-1 max-w-[100px]">
                            <ResourceDisplay label="Esperança" current={classData.stats.hope} max={10} color="text-gold" icon={<Coins weight="fill" />} />
                         </div>
                      </div>

                      <div 
                        className="group relative cursor-pointer w-full max-w-[260px] aspect-[3/4] rounded-[50%] border-[6px] border-[#1a1520] ring-1 ring-white/10 bg-black overflow-hidden shadow-2xl shrink-0 transition-transform hover:scale-[1.02]"
                        onClick={() => setIsImageModalOpen(true)}
                      >
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                            {characterImage ? (
                                <img src={characterImage} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-[#0f0c13]">
                                    <User size={64} weight="thin" />
                                    <span className="text-xs uppercase mt-3 tracking-widest">Sem Imagem</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                <span className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                                    <PencilSimple /> Alterar
                                </span>
                            </div>
                      </div>
                  </div>

                  {/* COLUNA 3: HABILIDADES */}
                  <div className="w-1/4 flex flex-col h-full bg-[#1a1520]/50 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-[#1a1520] p-3 border-b border-white/10 flex items-center gap-2 shrink-0">
                          <Scroll className="text-gold" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Habilidades</h3>
                      </div>
                      
                      <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                          <div className="bg-black/20 p-3 rounded border border-white/5">
                              <h4 className="text-sm font-bold text-gold mb-2 border-b border-white/5 pb-1">{classData.ability.name}</h4>
                              <p className="text-xs text-white/80 leading-relaxed text-justify">{classData.ability.description}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* RODAPÉ: DEFESAS */}
              <div className="h-24 shrink-0 flex gap-6">
                 <div className="w-1/4 bg-[#1a1520] border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Shield size={48} /></div>
                    <span className="text-4xl font-bold text-cyan-400 leading-none drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{totalEvasion}</span>
                    <span className="text-[10px] uppercase text-white/40 tracking-[0.2em] mt-1 font-bold">Evasão</span>
                 </div>
                 
                 <div className="flex-1 bg-[#1a1520] border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 shadow-lg">
                    <div className="flex items-center gap-2 mb-2 opacity-50">
                        <Skull size={14} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Limiares de Dano</span>
                    </div>
                    <div className="flex justify-center gap-6 w-full px-4">
                        <ThresholdBox label="Menor" range={`1 - ${finalMajor - 1}`} />
                        <ThresholdBox label="Maior" range={`${finalMajor} - ${finalSevere - 1}`} highlight />
                        <ThresholdBox label="Grave" range={`${finalSevere}+`} />
                    </div>
                 </div>

                 <div className="w-1/4 bg-[#1a1520] border border-white/10 rounded-xl p-2 shadow-lg flex items-center justify-center">
                    <ArmorWidget maxPA={maxPA} currentPA={paSpent} name="Armadura" onUpdatePA={handleUpdatePA} />
                 </div>
              </div>
            </div>
          )}

          {/* === ABA COMBATE === */}
          {activeTab === 'combate' && (
            <div className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-1">
                {/* Armas Ativas */}
                <div className="bg-[#1a1520]/50 p-3 rounded-xl border border-white/5">
                    <h3 className="text-gold font-rpg text-sm mb-2 flex items-center gap-2 uppercase tracking-widest opacity-80">
                        <Sword size={16} /> Armas Equipadas
                    </h3>
                    <div className="flex flex-col gap-2">
                        <CombatRow label="Principal" placeholderName={classData.startingInventory[0] || "Arma..."} />
                        <CombatRow label="Secundária" placeholderName={classData.startingInventory[1] || "Arma..."} />
                    </div>
                </div>

                {/* Armadura Detalhada */}
                <div className="bg-[#1a1520]/50 p-3 rounded-xl border border-white/5">
                     <h3 className="text-blue-400 font-rpg text-sm mb-2 flex items-center gap-2 uppercase tracking-widest opacity-80">
                        <Shield size={16} /> Defesa Ativa
                    </h3>
                     <ArmorRow />
                </div>

                {/* Inventário de Armas */}
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <h4 className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Backpack size={14}/> Armas na Mochila
                    </h4>
                    <div className="flex flex-col gap-2">
                        <CombatRow label="Mochila" placeholderName="Reserva 1" isInventory={true} />
                        <CombatRow label="Mochila" placeholderName="Reserva 2" isInventory={true} />
                        <CombatRow label="Mochila" placeholderName="Reserva 3" isInventory={true} />
                    </div>
                </div>
            </div>
          )}

          {/* --- OUTRAS ABAS --- */}
          {activeTab === 'inventario' && (
            <div className="bg-[#1a1520] p-4 rounded-xl border border-white/10 h-full overflow-y-auto">
                <h3 className="text-sm font-bold text-gold mb-4 uppercase tracking-widest">Itens Iniciais</h3>
                <div className="space-y-2">
                    {classData.startingInventory.map((item: string, i: number) => <ItemRow key={i} name={item} />)}
                </div>
            </div>
          )}

          {activeTab === 'guia' && (
            <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gold uppercase">Origem</h3>
                    {classData.questions.origin.map((q: string, i: number) => <TextAreaQuestion key={i} label={`Pergunta ${i+1}`} placeholder={q} />)}
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gold uppercase">Vínculos</h3>
                    {classData.questions.bonds.map((q: string, i: number) => <TextAreaQuestion key={i} label={`Vínculo ${i+1}`} placeholder={q} />)}
                </div>
            </div>
          )}

          {activeTab === 'evolucao' && (
            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto">
                <EvolutionColumn data={classData.evolution.tier2} />
                <EvolutionColumn data={classData.evolution.tier3} />
                <EvolutionColumn data={classData.evolution.tier4} />
            </div>
          )}

          {activeTab === 'descricao' && (
            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto">
                {Object.entries(classData.traits).map(([category, options]: [string, any]) => (
                    <div key={category} className="bg-black/20 p-3 rounded border border-white/5">
                        <h4 className="text-white/60 text-[10px] uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{category}</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {options.map((opt: string) => (
                                <button key={opt} onClick={() => toggleTrait(category, opt)} className={`px-2 py-1 rounded text-[10px] border transition-all ${selectedTraits[category]?.includes(opt) ? 'bg-gold/20 border-gold text-gold' : 'bg-black/40 border-white/10 text-white/50 hover:text-white'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};