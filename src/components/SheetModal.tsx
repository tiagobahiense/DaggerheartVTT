import { useState, useEffect } from 'react';
import { 
  X, Shield, Sword, Heart, Skull, 
  Coins, Scroll, Backpack, Lightning, 
  TrendUp, PersonSimpleRun, BookOpen, 
  CaretUp, User, PencilSimple, Target,
  Plus, Trash
} from '@phosphor-icons/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { CLASS_DATABASE } from '../data/classDatabase';
import { 
    AttributeBox, ResourceDisplay, ThresholdBox, 
    TextAreaQuestion, EvolutionColumn, ArmorWidget,
    CombatRow, ArmorRow, ImageUrlModal, InventoryRow,
    ProficiencyWidget
} from './sheet/SheetWidgets';

// --- COMPONENTE LOCAL PARA ITEM DE EXPERIÊNCIA ---
const ExperienceItem = ({ item, onChange, onDelete }: any) => {
    const [localValue, setLocalValue] = useState(item.value?.toString() || "0");

    useEffect(() => {
        if (item.value > 0) setLocalValue(`+${item.value}`);
        else setLocalValue(item.value?.toString() || "0");
    }, [item.value]);

    const handleChange = (e: any) => {
        const val = e.target.value;
        setLocalValue(val);
        const parsed = parseInt(val);
        if (!isNaN(parsed)) {
            let final = parsed;
            if (final > 99) final = 99;
            if (final < -99) final = -99;
            onChange({ ...item, value: final });
        } else if (val === '') {
            onChange({ ...item, value: 0 });
        }
    };

    const handleBlur = () => {
         if (item.value > 0) setLocalValue(`+${item.value}`);
         else setLocalValue(item.value?.toString() || "0");
    };

    return (
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white/20 text-xs shrink-0"><Scroll /></div>
            <input 
                type="text" 
                value={item.name} 
                onChange={(e) => onChange({...item, name: e.target.value})}
                placeholder="Experiência..." 
                className="flex-1 bg-transparent text-xs font-bold text-white placeholder-white/20 outline-none w-full border-b border-transparent focus:border-white/20 pb-0.5" 
            />
            <input 
                type="text" 
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-10 bg-black/40 px-1 py-0.5 rounded border border-white/5 text-center text-xs font-bold text-white outline-none focus:border-gold"
                style={{ borderColor: item.value !== 0 ? (item.value > 0 ? '#fbbf24' : '#ef4444') : 'transparent' }}
            />
            <button onClick={onDelete} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash size={14} /></button>
        </div>
    );
};

interface SheetModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SheetModal = ({ character, isOpen, onClose }: SheetModalProps) => {
  const [activeTab, setActiveTab] = useState('principal');
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  const [paSpent, setPaSpent] = useState(0);
  const [characterImage, setCharacterImage] = useState(''); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Estado local para edição
  const [sheetData, setSheetData] = useState({
    weapons: { main: {}, sec: {}, inv1: {}, inv2: {}, inv3: {} },
    armor: { baseMajor: 0, baseSevere: 0, baseSlots: 0, name: '', trait1: '', trait2: '' }, 
    attributes: {},
    stats: { 
        hp: { current: 0, max: 0 }, 
        stress: { current: 0, max: 0 }, 
        hope: { current: 0, max: 0 },
        evasion: 0 
    },
    experiences: [] as { name: string, value: number }[], // ADICIONADO: Lista de experiências
    inventory: [] as { name: string, quantity: number }[],
    evolution: {} as Record<string, number>,
    proficiency: 0,
    guide: { origin: [] as string[], bonds: [] as string[] }
  });

  const classKey = character?.class?.toLowerCase().replace(' ', '') || "mago";
  const classData = CLASS_DATABASE[classKey] || CLASS_DATABASE["mago"];

  // --- PERSISTÊNCIA E INICIALIZAÇÃO ---
  useEffect(() => {
    if (character) {
        const defaultHP = classData.stats.hp;
        const defaultStress = classData.stats.stress;
        const defaultHope = classData.stats.hope;

        setSheetData({
            weapons: character.weapons || { main: {}, sec: {}, inv1: {}, inv2: {}, inv3: {} },
            armor: character.armor || { baseMajor: 0, baseSevere: 0, baseSlots: 0, name: '', trait1: '', trait2: '' },
            attributes: character.attributes || {},
            stats: {
                hp: { 
                    current: character.stats?.hp?.current ?? defaultHP, 
                    max: character.stats?.hp?.max ?? defaultHP 
                },
                stress: { 
                    current: character.stats?.stress?.current ?? 0, 
                    max: character.stats?.stress?.max ?? defaultStress 
                },
                hope: { 
                    current: character.stats?.hope?.current ?? defaultHope, 
                    max: character.stats?.hope?.max ?? 10 
                },
                evasion: character.stats?.evasion ?? classData.stats.evasion ?? 10
            },
            experiences: character.experiences || [], // Carrega experiências
            inventory: character.inventory || [],
            evolution: character.evolution || {},
            proficiency: character.proficiency || 0,
            guide: character.guide || { origin: [], bonds: [] }
        });
        setCharacterImage(character.imageUrl || '');
        setPaSpent(character.paSpent || 0);
        setSelectedTraits(character.selectedTraits || {});
    }
  }, [character]);

  if (!isOpen || !character) return null;
  
  // --- LÓGICA DE CÁLCULO DOS LIMIARES ---
  const userBaseMajor = sheetData.armor?.baseMajor || 0;
  const userBaseSevere = sheetData.armor?.baseSevere || 0;
  
  let thresholdRangeText = { minor: "-", major: "-", severe: "-" };

  if (userBaseMajor > 0 && userBaseSevere > 0) {
      const finalMajor = userBaseMajor + character.level;
      const finalSevere = userBaseSevere + character.level;

      thresholdRangeText = {
          minor: `1 - ${finalMajor - 1}`,
          major: `${finalMajor} - ${finalSevere - 1}`,
          severe: `${finalSevere}+`
      };
  }
  
  const maxPA = sheetData.armor?.baseSlots > 0 ? sheetData.armor.baseSlots : classData.stats.baseArmorPoints;
  
  const getAttr = (key: string) => (sheetData.attributes as any)?.[key]?.value ?? (character.attributes as any)?.[key]?.value ?? 0;
  
  // --- SALVAR NO FIREBASE ---
  const saveCharacterData = async (newData: any) => {
      if (!character.id) return;
      try {
          const charRef = doc(db, 'characters', character.id);
          await updateDoc(charRef, newData);
      } catch (error) {
          console.error("Erro ao salvar:", error);
      }
  };

  const updateSheet = (key: string, data: any) => {
      const newSheetData = { ...sheetData, [key]: data };
      setSheetData(newSheetData);
      saveCharacterData({ [key]: data });
  };

  const updateStat = (statName: 'hp' | 'stress' | 'hope', field: 'current' | 'max', value: number) => {
      const currentStats = sheetData.stats;
      const newStats = {
          ...currentStats,
          [statName]: {
              ...currentStats[statName],
              [field]: value
          }
      };
      updateSheet('stats', newStats);
  };

  const updateAttribute = (attrName: string, val: number) => {
    const currentAttrs = (sheetData.attributes || {}) as any;
    const newAttrs = { 
        ...currentAttrs, 
        [attrName]: { ...currentAttrs[attrName], value: val } 
    };
    updateSheet('attributes', newAttrs);
};

  // --- FUNÇÕES DE EXPERIÊNCIA ---
  const addExperience = () => {
    const newExp = [...(sheetData.experiences || []), { name: '', value: 0 }];
    updateSheet('experiences', newExp);
  };

  const updateExperience = (index: number, val: any) => {
    const newExp = [...(sheetData.experiences || [])];
    newExp[index] = val;
    updateSheet('experiences', newExp);
  };

  const deleteExperience = (index: number) => {
    const newExp = (sheetData.experiences || []).filter((_, i) => i !== index);
    updateSheet('experiences', newExp);
  };

  const addInventoryItem = () => {
      const newItem = { name: '', quantity: 1 };
      const newInventory = [...sheetData.inventory, newItem];
      updateSheet('inventory', newInventory);
  };

  const updateInventoryItem = (index: number, updatedItem: { name: string, quantity: number }) => {
      const newInventory = [...sheetData.inventory];
      newInventory[index] = updatedItem;
      updateSheet('inventory', newInventory);
  };

  const deleteInventoryItem = (index: number) => {
      const newInventory = sheetData.inventory.filter((_, i) => i !== index);
      updateSheet('inventory', newInventory);
  };

  const updateEvolution = (key: string, value: number) => {
      const newEvolution = { ...sheetData.evolution, [key]: value };
      updateSheet('evolution', newEvolution);
  };

  const handleUpdatePA = (index: number, isSpent: boolean) => {
      const newVal = isSpent ? index : index + 1;
      setPaSpent(newVal);
      saveCharacterData({ paSpent: newVal });
  };

  const handleImageUpdate = (newUrl: string) => {
    setCharacterImage(newUrl);
    saveCharacterData({ imageUrl: newUrl });
  };

  const toggleTrait = (category: string, trait: string) => {
    setSelectedTraits(prev => {
      const current = prev[category] || [];
      const updated = current.includes(trait) ? current.filter(t => t !== trait) : [...current, trait];
      const newState = { ...prev, [category]: updated };
      
      saveCharacterData({ selectedTraits: newState });
      
      return newState;
    });
  };

  const handleGuideChange = (section: 'origin' | 'bonds', index: number, value: string) => {
      const currentGuide = sheetData.guide || { origin: [], bonds: [] };
      const currentSection = currentGuide[section] ? [...currentGuide[section]] : [];
      currentSection[index] = value;
      
      const newGuide = { ...currentGuide, [section]: currentSection };
      updateSheet('guide', newGuide);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 animate-fade-in p-4" onClick={onClose}>
      <ImageUrlModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        onConfirm={handleImageUpdate} 
        currentUrl={characterImage} 
      />

      <div className="relative w-full max-w-6xl h-[90vh] bg-[#120f16] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="bg-[#1a1520] border-b border-white/10 px-6 py-3 flex justify-between items-center shrink-0" style={{ borderTop: `4px solid ${classData.color}` }}>
          <div className="flex items-center gap-3">
          <input 
    type="number"
    min="1"
    max="10"
    value={character.level}
    onChange={(e) => {
        let val = parseInt(e.target.value);
        // Trava entre 1 e 10
        if (isNaN(val)) val = 1;
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        
        // Salva direto no Firebase (atualiza a ficha toda)
        saveCharacterData({ level: val });
    }}
    className="w-8 h-8 rounded bg-black border border-white/20 font-bold text-white text-sm text-center outline-none focus:border-gold p-0"
/>
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

        {/* BODY */}
        <div className="flex-1 overflow-hidden p-6 bg-[url('/texture-noise.png')] bg-repeat relative">
          
          {/* === ABA GERAL === */}
          {activeTab === 'principal' && (
            <div className="h-full flex flex-col gap-6">
              <div className="flex flex-1 gap-6 min-h-0">
                  {/* ATRIBUTOS & EXPERIÊNCIAS (COLUNA ESQUERDA ALTERADA) */}
                  <div className="w-1/4 flex flex-col h-full bg-[#1a1520]/50 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                    {/* Header Atributos */}
                    <div className="bg-[#1a1520] p-3 border-b border-white/10 flex items-center gap-2 shrink-0">
                        <PersonSimpleRun className="text-white/50" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Atributos</h3>
                    </div>
                    
                    {/* Lista de Atributos (Todos Juntos) - Sem Scroll Próprio */}
                    <div className="p-4 space-y-2 shrink-0 border-b border-white/5 pb-4">
                         <AttributeBox label="Agilidade" value={getAttr('agility')} onChange={(v: number) => updateAttribute('agility', v)} icon={<PersonSimpleRun />} color={classData.color} />
                         <AttributeBox label="Força" value={getAttr('strength')} onChange={(v: number) => updateAttribute('strength', v)} icon={<Sword />} color={classData.color} />
                         <AttributeBox label="Acuidade" value={getAttr('finesse')} onChange={(v: number) => updateAttribute('finesse', v)} icon={<TrendUp />} color={classData.color} />
                         <AttributeBox label="Instinto" value={getAttr('instinct')} onChange={(v: number) => updateAttribute('instinct', v)} icon={<Lightning />} color={classData.color} />
                         <AttributeBox label="Presença" value={getAttr('presence')} onChange={(v: number) => updateAttribute('presence', v)} icon={<Shield />} color={classData.color} />
                         <AttributeBox label="Conhec." value={getAttr('knowledge')} onChange={(v: number) => updateAttribute('knowledge', v)} icon={<Scroll />} color={classData.color} />
                    </div>

                    {/* Header Experiências */}
                    <div className="bg-[#1a1520]/50 p-3 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Scroll className="text-white/50" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Experiências</h3>
                        </div>
                        <button onClick={addExperience} className="text-gold hover:text-white transition-colors"><Plus /></button>
                    </div>

                    {/* Lista de Experiências (Com Scroll) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-0 bg-black/10">
                        {sheetData.experiences?.map((exp, i) => (
                            <ExperienceItem 
                                key={i} 
                                item={exp} 
                                onChange={(val: any) => updateExperience(i, val)} 
                                onDelete={() => deleteExperience(i)} 
                            />
                        ))}
                        {(!sheetData.experiences || sheetData.experiences.length === 0) && (
                            <p className="text-[10px] text-white/20 text-center italic mt-2">Nenhuma experiência.</p>
                        )}
                    </div>
                  </div>

                  {/* CENTRO */}
                  <div className="flex-1 flex flex-col items-center">
                      <div className="flex gap-4 mb-6 w-full justify-center shrink-0">
                         <div className="flex-1 max-w-[100px]">
                             <ResourceDisplay 
                                label="Vida (PV)" 
                                current={sheetData.stats.hp.current} 
                                max={sheetData.stats.hp.max} 
                                onChangeCurrent={(v: number) => updateStat('hp', 'current', v)}
                                onChangeMax={(v: number) => updateStat('hp', 'max', v)}
                                color="text-red-500" 
                                icon={<Heart weight="fill" />} 
                             />
                         </div>
                         <div className="flex-1 max-w-[100px]">
                             <ResourceDisplay 
                                label="Estresse (PF)" 
                                current={sheetData.stats.stress.current} 
                                max={sheetData.stats.stress.max} 
                                onChangeCurrent={(v: number) => updateStat('stress', 'current', v)}
                                onChangeMax={(v: number) => updateStat('stress', 'max', v)}
                                color="text-purple-500" 
                                icon={<Lightning weight="fill" />} 
                             />
                         </div>
                         <div className="flex-1 max-w-[100px]">
                             <ResourceDisplay 
                                label="Esperança" 
                                current={sheetData.stats.hope.current} 
                                max={sheetData.stats.hope.max} 
                                onChangeCurrent={(v: number) => updateStat('hope', 'current', v)}
                                onChangeMax={(v: number) => updateStat('hope', 'max', v)}
                                color="text-gold" 
                                icon={<Coins weight="fill" />} 
                             />
                         </div>
                      </div>

                      <div className="group relative cursor-pointer w-full max-w-[260px] aspect-[3/4] rounded-[50%] border-[6px] border-[#1a1520] ring-1 ring-white/10 bg-black overflow-hidden shadow-2xl shrink-0 transition-transform hover:scale-[1.02]" onClick={() => setIsImageModalOpen(true)}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
                            {characterImage ? <img src={characterImage} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-[#0f0c13]"><User size={64} weight="thin" /><span className="text-xs uppercase mt-3 tracking-widest">Sem Imagem</span></div>}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20"><span className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest"><PencilSimple /> Alterar</span></div>
                      </div>
                  </div>

                  {/* HABILIDADES (LISTA COMPLETA) */}
                  <div className="w-1/4 flex flex-col h-full bg-[#1a1520]/50 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-[#1a1520] p-3 border-b border-white/10 flex items-center gap-2 shrink-0"><Scroll className="text-gold" /><h3 className="text-xs font-bold text-white uppercase tracking-widest">Habilidades</h3></div>
                      <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                          {/* Renderiza todas as habilidades iniciais da classe */}
                          {classData.startingFeatures && classData.startingFeatures.map((feature: any, i: number) => (
                              <div key={i} className="bg-black/20 p-3 rounded border border-white/5">
                                  <h4 className="text-sm font-bold text-gold mb-2 border-b border-white/5 pb-1">{feature.title}</h4>
                                  <p className="text-xs text-white/80 leading-relaxed text-justify">{feature.description}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* FOOTER */}
              <div className="h-24 shrink-0 flex gap-6">
                 <div className="w-1/4 bg-[#1a1520] border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Shield size={48} /></div>
                    
                    {/* INPUT DE EVASÃO EDITÁVEL */}
                    <input 
                        type="number"
                        value={sheetData.stats.evasion}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newStats = { ...sheetData.stats, evasion: val };
                            updateSheet('stats', newStats);
                        }}
                        className="text-4xl font-bold text-cyan-400 bg-transparent text-center w-full outline-none p-0 leading-none drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] z-10"
                    />

                    <span className="text-[10px] uppercase text-white/40 tracking-[0.2em] mt-1 font-bold">Evasão</span>
                 </div>
                 <div className="flex-1 bg-[#1a1520] border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 shadow-lg">
                    <div className="flex items-center gap-2 mb-2 opacity-50"><Skull size={14} /><span className="text-[10px] uppercase tracking-widest font-bold">Limiares de Dano</span></div>
                    <div className="flex justify-center gap-6 w-full px-4">
                        <ThresholdBox label="Menor" range={thresholdRangeText.minor} />
                        <ThresholdBox label="Maior" range={thresholdRangeText.major} highlight />
                        <ThresholdBox label="Grave" range={thresholdRangeText.severe} />
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
                <ProficiencyWidget 
                    value={sheetData.proficiency} 
                    onChange={(v: number) => updateSheet('proficiency', v)} 
                />
                <div className="bg-[#1a1520]/50 p-3 rounded-xl border border-white/5">
                    <h3 className="text-gold font-rpg text-sm mb-2 flex items-center gap-2 uppercase tracking-widest opacity-80"><Sword size={16} /> Armas Equipadas</h3>
                    <div className="flex flex-col gap-2">
                        <CombatRow label="Principal" weapon={sheetData.weapons?.main} onChange={(w: any) => updateSheet('weapons', {...sheetData.weapons, main: w})} placeholderName={classData.startingInventory[0]} />
                        <CombatRow label="Secundária" weapon={sheetData.weapons?.sec} onChange={(w: any) => updateSheet('weapons', {...sheetData.weapons, sec: w})} placeholderName={classData.startingInventory[1]} />
                    </div>
                </div>
                <div className="bg-[#1a1520]/50 p-3 rounded-xl border border-white/5">
                     <h3 className="text-blue-400 font-rpg text-sm mb-2 flex items-center gap-2 uppercase tracking-widest opacity-80"><Shield size={16} /> Defesa Ativa</h3>
                     <ArmorRow armor={sheetData.armor} onChange={(a: any) => updateSheet('armor', a)} />
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <h4 className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2"><Backpack size={14}/> Armas na Mochila</h4>
                    <div className="flex flex-col gap-2">
                        <CombatRow label="Mochila" weapon={sheetData.weapons?.inv1} onChange={(w: any) => updateSheet('weapons', {...sheetData.weapons, inv1: w})} placeholderName="Reserva 1" isInventory={true} />
                        <CombatRow label="Mochila" weapon={sheetData.weapons?.inv2} onChange={(w: any) => updateSheet('weapons', {...sheetData.weapons, inv2: w})} placeholderName="Reserva 2" isInventory={true} />
                        <CombatRow label="Mochila" weapon={sheetData.weapons?.inv3} onChange={(w: any) => updateSheet('weapons', {...sheetData.weapons, inv3: w})} placeholderName="Reserva 3" isInventory={true} />
                    </div>
                </div>
            </div>
          )}

          {/* === ABA INVENTÁRIO === */}
          {activeTab === 'inventario' && (
            <div className="bg-[#1a1520] p-4 rounded-xl border border-white/10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest">Mochila</h3>
                    <button 
                        onClick={addInventoryItem}
                        className="flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50 rounded px-3 py-1 text-xs font-bold transition-colors"
                    >
                        <Plus weight="bold" /> Novo Item
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {sheetData.inventory.length === 0 && (
                        <p className="text-center text-white/20 text-xs py-10">Sua mochila está vazia.</p>
                    )}
                    {sheetData.inventory.map((item, i) => (
                        <InventoryRow 
                            key={i} 
                            item={item} 
                            onChange={(updatedItem: any) => updateInventoryItem(i, updatedItem)}
                            onDelete={() => deleteInventoryItem(i)}
                        />
                    ))}
                </div>
            </div>
          )}

          {/* === ABA GUIA === */}
          {activeTab === 'guia' && (
            <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gold uppercase">Origem</h3>
                    {classData.questions.origin.map((q: string, i: number) => (
                        <TextAreaQuestion 
                            key={`origin-${i}`} 
                            label={`Pergunta ${i+1}`} 
                            placeholder={q}
                            value={sheetData.guide?.origin?.[i] || ''}
                            onChange={(val: string) => handleGuideChange('origin', i, val)}
                        />
                    ))}
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gold uppercase">Vínculos</h3>
                    {classData.questions.bonds.map((q: string, i: number) => (
                        <TextAreaQuestion 
                            key={`bonds-${i}`} 
                            label={`Vínculo ${i+1}`} 
                            placeholder={q}
                            value={sheetData.guide?.bonds?.[i] || ''}
                            onChange={(val: string) => handleGuideChange('bonds', i, val)}
                        />
                    ))}
                </div>
            </div>
          )}

          {/* === ABA EVOLUÇÃO === */}
          {activeTab === 'evolucao' && (
            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto custom-scrollbar">
                <EvolutionColumn data={classData.evolution.tier2} tierId="tier2" savedValues={sheetData.evolution} onToggle={updateEvolution} />
                <EvolutionColumn data={classData.evolution.tier3} tierId="tier3" savedValues={sheetData.evolution} onToggle={updateEvolution} />
                <EvolutionColumn data={classData.evolution.tier4} tierId="tier4" savedValues={sheetData.evolution} onToggle={updateEvolution} />
            </div>
          )}

          {/* === ABA DESCRIÇÃO === */}
          {activeTab === 'descricao' && (
            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto custom-scrollbar">
                {Object.entries(classData.traits).map(([category, options]: [string, any]) => (
                    <div key={category} className="bg-black/20 p-3 rounded border border-white/5">
                        <h4 className="text-white/60 text-[10px] uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{category}</h4>
                        <div className="flex flex-wrap gap-1.5">{options.map((opt: string) => (<button key={opt} onClick={() => toggleTrait(category, opt)} className={`px-2 py-1 rounded text-[10px] border transition-all ${selectedTraits[category]?.includes(opt) ? 'bg-gold/20 border-gold text-gold' : 'bg-black/40 border-white/10 text-white/50 hover:text-white'}`}>{opt}</button>))}</div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};