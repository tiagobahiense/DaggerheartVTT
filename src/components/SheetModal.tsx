import { useState } from 'react';
import { 
  X, Shield, Sword, Heart, Skull, 
  Coins, Scroll, Backpack, Lightning, 
  TrendUp, PersonSimpleRun, BookOpen, 
  CaretUp
} from '@phosphor-icons/react';

// Importa os dados e componentes desacoplados
import classTemplates from '../data/classTemplates.json';
import { CLASS_DATABASE } from '../data/classDatabase';
import { 
    AttributeBox, ResourceDisplay, ThresholdBox, 
    EmptyWeaponSlot, ItemRow, TextAreaQuestion, 
    EvolutionColumn, ArmorWidget 
} from './sheet/SheetWidgets';

interface SheetModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SheetModal = ({ character, isOpen, onClose }: SheetModalProps) => {
  // --- 1. TODOS OS HOOKS DEVEM FICAR AQUI NO TOPO ---
  const [activeTab, setActiveTab] = useState('principal');
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  
  // Estado de PA Gasto (0 = Novo, X = Marcado)
  const [paSpent, setPaSpent] = useState(0); 

  // --- 2. VERIFICAÇÃO DE RENDERIZAÇÃO (APÓS OS HOOKS) ---
  if (!isOpen || !character) return null;

  // --- 3. LÓGICA DE DADOS ---
  const classKey = character.class?.toLowerCase() || "mago";
  const classData = CLASS_DATABASE[classKey] || CLASS_DATABASE["mago"];

  // Limiares: Base da Classe + Nível
  const finalMajor = classData.damageThresholds.major + character.level;
  const finalSevere = classData.damageThresholds.severe + character.level;
  const maxPA = classData.stats.baseArmorPoints;

  const handleUpdatePA = (index: number, isSpent: boolean) => {
      if (isSpent) setPaSpent(index); 
      else setPaSpent(index + 1);
  };

  const toggleTrait = (category: string, trait: string) => {
    setSelectedTraits(prev => {
      const current = prev[category] || [];
      if (current.includes(trait)) return { ...prev, [category]: current.filter(t => t !== trait) };
      return { ...prev, [category]: [...current, trait] };
    });
  };

  const tabs = [
    { id: 'principal', label: 'Principal', icon: <Shield /> },
    { id: 'inventario', label: 'Inventário', icon: <Backpack /> },
    { id: 'guia', label: 'Guia', icon: <BookOpen /> }, 
    { id: 'evolucao', label: 'Evolução', icon: <CaretUp /> },
    { id: 'descricao', label: 'Descrição', icon: <Scroll /> } 
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#120f16] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="bg-[#1a1520] border-b border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0" style={{ borderTop: `4px solid ${classData.color}` }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg bg-black" style={{ borderColor: classData.color }}>
               <span className="text-2xl font-rpg font-bold text-white">{character.level}</span>
            </div>
            <div>
              <h2 className="text-3xl font-rpg font-bold text-white leading-none">{character.name}</h2>
              <div className="flex gap-2 text-sm text-white/50 uppercase tracking-widest mt-1">
                <span style={{ color: classData.color }}>{classData.label}</span> • <span>{character.subclass}</span>
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 rounded-full p-1 border border-white/5 overflow-x-auto">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded-full transition-colors group"><X size={24} className="text-white/50 group-hover:text-red-400" /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('/texture-noise.png')] bg-repeat">
          
          {activeTab === 'principal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 flex flex-col gap-3">
                <AttributeBox label="Agilidade" value={character.attributes?.agility?.value} icon={<PersonSimpleRun />} color={classData.color} />
                <AttributeBox label="Força" value={character.attributes?.strength?.value} icon={<Sword />} color={classData.color} />
                <AttributeBox label="Acuidade" value={character.attributes?.finesse?.value} icon={<TrendUp />} color={classData.color} />
                <AttributeBox label="Instinto" value={character.attributes?.instinct?.value} icon={<Lightning />} color={classData.color} />
                <AttributeBox label="Presença" value={character.attributes?.presence?.value} icon={<Shield />} color={classData.color} />
                <AttributeBox label="Conhec." value={character.attributes?.knowledge?.value} icon={<Scroll />} color={classData.color} />
                <div className="mt-4 bg-black/40 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-white/50 text-sm uppercase">Evasão</span>
                    <span className="text-2xl font-bold text-white">{classData.stats.evasion + (character.attributes?.agility?.value || 0)}</span>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <ResourceDisplay label="PV" current={classData.stats.hp} max={classData.stats.hp} color="text-red-500" icon={<Heart weight="fill" />} />
                    <ResourceDisplay label="Estresse" current={0} max={classData.stats.stress} color="text-purple-500" icon={<Lightning weight="fill" />} />
                    <ResourceDisplay label="Esperança" current={2} max={classData.stats.hope} color="text-gold" icon={<Coins weight="fill" />} />
                </div>

                <div className="bg-[#1a1520] border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs uppercase text-white/30 tracking-widest mb-4 flex items-center gap-2"><Skull /> Limiares de Dano</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <ThresholdBox label="Menor (1 PV)" range={`1 - ${finalMajor - 1}`} />
                        <ThresholdBox label="Maior (2 PV)" range={`${finalMajor} - ${finalSevere - 1}`} highlight />
                        <ThresholdBox label="Grave (3 PV)" range={`${finalSevere}+`} />
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-white/10 p-5 bg-gradient-to-br from-black to-[#1a1520]">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: classData.color }}></div>
                    <h3 className="font-rpg font-bold text-lg mb-1" style={{ color: classData.color }}>{classData.ability.name}</h3>
                    <p className="text-white/80 text-sm">{classData.ability.description}</p>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#1a1520] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Proficiência</span>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`w-2.5 h-2.5 rounded-sm border ${i <= 1 ? 'bg-white border-white' : 'border-white/20'}`}></div>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-xs uppercase text-white/30 tracking-widest mb-3 flex items-center gap-2"><Sword /> Armas Ativas</h3>
                    <div className="space-y-2">
                        <EmptyWeaponSlot />
                        <EmptyWeaponSlot />
                    </div>
                </div>

                <ArmorWidget maxPA={maxPA} currentPA={paSpent} name="Armadura Base" onUpdatePA={handleUpdatePA} />
              </div>
            </div>
          )}

          {activeTab === 'inventario' && (
            <div className="bg-[#1a1520] p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-rpg text-gold mb-4 flex items-center gap-2"><Backpack /> Itens Iniciais</h3>
                <div className="space-y-3">
                    {classData.startingInventory.map((item: string, i: number) => <ItemRow key={i} name={item} slot="-" />)}
                </div>
            </div>
          )}

          {activeTab === 'guia' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1520] p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-rpg text-gold mb-4">Origem</h3>
                    <div className="space-y-4">
                        {classData.questions.origin.map((q: string, i: number) => <TextAreaQuestion key={i} label={q} />)}
                    </div>
                </div>
                <div className="bg-[#1a1520] p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-rpg text-gold mb-4">Vínculos</h3>
                    <div className="space-y-4">
                        {classData.questions.bonds.map((q: string, i: number) => <TextAreaQuestion key={i} label={q} />)}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'evolucao' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EvolutionColumn data={classData.evolution.tier2} />
                <EvolutionColumn data={classData.evolution.tier3} />
                <EvolutionColumn data={classData.evolution.tier4} />
            </div>
          )}

          {activeTab === 'descricao' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(classData.traits).map(([category, options]: [string, any]) => (
                    <div key={category} className="bg-black/20 p-4 rounded border border-white/5">
                        <h4 className="text-white/60 text-xs uppercase tracking-widest mb-3 border-b border-white/10 pb-1">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {options.map((opt: string) => (
                                <button 
                                    key={opt}
                                    onClick={() => toggleTrait(category, opt)}
                                    className={`px-3 py-1 rounded text-xs border transition-all ${selectedTraits[category]?.includes(opt) ? 'bg-gold/20 border-gold text-gold' : 'bg-black/40 border-white/10 text-white/60 hover:text-white'}`}
                                >
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