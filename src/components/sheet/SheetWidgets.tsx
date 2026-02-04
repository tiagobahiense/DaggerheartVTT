import { 
    Sword, Shield, Heart, Lightning, Coins, X, 
    Link as LinkIcon, PencilSimple, Check, Target,
    WarningCircle, Trash
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

// --- ESTILOS GLOBAIS PARA REMOVER SETAS DE INPUT NUMBER ---
const GlobalStyles = () => (
    <style>{`
        /* Remove setas no Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        /* Remove setas no Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }
    `}</style>
);

// --- COMPONENTES VISUAIS GERAIS ---

export const ProficiencyWidget = ({ value, onChange }: any) => (
    <div className="bg-[#1a1520]/50 p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between mb-2 gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center text-gold border border-gold/30">
                <Target size={18} weight="fill"/>
            </div>
            <div>
                <h3 className="text-gold font-rpg text-sm uppercase tracking-widest leading-none">Proficiência</h3>
                <span className="text-[10px] text-white/30 uppercase">Nível de Habilidade</span>
            </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-center">
            {Array.from({ length: 6 }).map((_, i) => {
                const isActive = i < value;
                return (
                    <button
                        key={i}
                        onClick={() => onChange(isActive && i === value - 1 ? i : i + 1)} 
                        className={`w-8 h-8 rounded border transition-all flex items-center justify-center font-bold text-xs ${
                            isActive
                                ? 'bg-gold border-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)] transform scale-105'
                                : 'bg-black/40 border-white/10 text-white/20 hover:border-gold/50 hover:text-gold'
                        }`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
    </div>
);

export const AttributeBox = ({ label, value, icon, color, onChange }: any) => {
    const [localValue, setLocalValue] = useState(value?.toString() || "0");

    useEffect(() => {
        if (value > 0) {
            setLocalValue(`+${value}`);
        } else {
            setLocalValue(value?.toString() || "0");
        }
    }, [value]);

    const handleChange = (e: any) => {
        const inputVal = e.target.value;
        setLocalValue(inputVal); 
        const parsedVal = parseInt(inputVal);

        if (!isNaN(parsedVal)) {
            let finalVal = parsedVal;
            if (finalVal > 99) finalVal = 99;
            if (finalVal < -99) finalVal = -99;
            onChange && onChange(finalVal);
        } else if (inputVal === "") {
            onChange && onChange(0);
        }
    };

    const handleBlur = () => {
        if (value > 0) {
            setLocalValue(`+${value}`);
        } else {
            setLocalValue(value?.toString() || "0");
        }
    };

    return (
        <div className="flex items-center justify-between bg-[#1a1520] border border-white/10 p-1.5 rounded w-full">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white/40 text-xs shrink-0">{icon}</div>
                <div className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{label}</div>
            </div>
            <div className="relative">
                <input 
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-12 bg-black/40 px-1 py-0.5 rounded border border-white/5 text-center text-lg font-bold text-white outline-none focus:border-gold"
                    style={{ borderColor: value > 0 ? color : 'transparent' }}
                />
            </div>
        </div>
    );
};

export const ResourceDisplay = ({ label, current, max, color, icon, onChangeCurrent, onChangeMax }: any) => (
    <div className="flex flex-col items-center gap-1 w-full">
        <GlobalStyles />
        <div className={`text-xs font-bold uppercase tracking-widest ${color} flex items-center gap-1`}>{icon} {label}</div>
        
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#1a1520] bg-black shadow-lg flex flex-col items-center overflow-hidden group relative">
             <div className="flex-1 w-full flex items-end justify-center pb-0.5">
                <input 
                    type="number" 
                    value={current} 
                    onChange={(e) => onChangeCurrent && onChangeCurrent(parseInt(e.target.value) || 0)}
                    className={`w-full bg-transparent text-2xl md:text-3xl font-bold ${color} text-center outline-none p-0 leading-none`}
                />
             </div>
             <div className="w-10 h-[1px] bg-white/20"></div>
             <div className="h-[35%] w-full bg-white/5 flex items-start justify-center pt-0.5">
                <input 
                    type="number" 
                    value={max} 
                    onChange={(e) => onChangeMax && onChangeMax(parseInt(e.target.value) || 0)}
                    className="bg-transparent text-[10px] md:text-xs font-bold text-white/50 text-center outline-none w-full hover:text-white transition-colors"
                />
             </div>
        </div>
    </div>
);

export const ThresholdBox = ({ label, range, highlight }: any) => (
    <div className={`flex flex-col items-center p-2 rounded w-full md:w-24 border ${highlight ? 'bg-red-900/20 border-red-500/50' : 'bg-black/40 border-white/10'}`}>
        <span className="text-[8px] uppercase text-white/40 mb-1 tracking-widest">{label}</span>
        <span className={`text-lg font-bold ${!range || range === '-' ? 'text-white/10' : 'text-white'}`}>
            {range || "-"}
        </span>
    </div>
);

export const ArmorWidget = ({ maxPA, currentPA, onUpdatePA, name }: any) => (
    <div className="bg-[#1a1520] border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center h-full w-full">
        <div className="flex items-center gap-1 mb-2">
            <Shield size={12} weight="fill" className="text-blue-400"/> 
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px]">
            {Array.from({ length: 12 }).map((_, i) => { 
                const isAvailableSlot = i < maxPA;
                const isSpent = i < currentPA;
                if (!isAvailableSlot) return <div key={i} className="w-3 h-3 rounded-full border border-white/5 bg-transparent opacity-20"></div>;
                return (
                    <button 
                        key={i} 
                        onClick={() => onUpdatePA(i, isSpent)}
                        className={`w-3 h-3 rounded-full border transition-all ${isSpent ? 'border-white/30 bg-white/10' : 'border-blue-400 bg-blue-500 shadow-[0_0_4px_#3b82f6]'}`}
                    />
                );
            })}
        </div>
        <span className="text-[8px] text-white/20 mt-1">{currentPA} gastos / {maxPA} total</span>
    </div>
);

export const ImageUrlModal = ({ isOpen, onClose, onConfirm, currentUrl }: any) => {
    const [url, setUrl] = useState(currentUrl);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#1a1520] border border-white/20 p-6 rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-bold mb-4">Alterar Imagem do Personagem</h3>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded p-2 text-white mb-4 focus:border-gold outline-none" autoFocus />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-white/50 hover:text-white">Cancelar</button>
                    <button onClick={() => { onConfirm(url); onClose(); }} className="px-4 py-2 bg-gold/20 text-gold border border-gold/50 rounded hover:bg-gold/30">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export const CombatRow = ({ weapon, onChange, placeholderName, isInventory }: any) => (
    <div className="flex flex-col sm:flex-row items-start gap-2 bg-black/20 p-2 rounded border border-white/5 hover:border-white/10 transition-colors">
        <div className="hidden sm:flex w-8 h-8 rounded bg-[#1a1520] items-center justify-center border border-white/10 shrink-0 mt-1">
            {isInventory ? <WarningCircle className="text-white/20" /> : <Sword className="text-gold" />}
        </div>
        
        <div className="flex-1 flex flex-col gap-1 w-full">
             <div className="flex items-center gap-2 w-full">
                <div className="sm:hidden flex w-6 h-6 rounded bg-[#1a1520] items-center justify-center border border-white/10 shrink-0">
                    {isInventory ? <WarningCircle className="text-white/20" size={12}/> : <Sword className="text-gold" size={12}/>}
                </div>
                <input 
                    type="text" 
                    value={weapon?.name || ''} 
                    onChange={e => onChange({...weapon, name: e.target.value})} 
                    placeholder={placeholderName || "Nome da Arma"} 
                    className="bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none w-full border-b border-transparent focus:border-white/20 min-w-0" 
                />
             </div>
             
             <div className="flex gap-2 items-center w-full">
                <input 
                    type="text" 
                    value={weapon?.attrRange || ''} 
                    onChange={e => onChange({...weapon, attrRange: e.target.value})} 
                    placeholder="Atributo & Alcance" 
                    className="bg-transparent text-[10px] text-white/60 flex-1 outline-none hover:text-white placeholder-white/10 min-w-0" 
                />
                <span className="text-white/20 text-[10px]">|</span>
                <input 
                    type="text" 
                    value={weapon?.damageType || ''} 
                    onChange={e => onChange({...weapon, damageType: e.target.value})} 
                    placeholder="Dados & Tipo" 
                    className="bg-transparent text-[10px] text-white/60 flex-1 outline-none hover:text-white placeholder-white/10 text-right min-w-0" 
                />
             </div>

             <input 
                type="text" 
                value={weapon?.ability || ''} 
                onChange={e => onChange({...weapon, ability: e.target.value})} 
                placeholder="Habilidade..." 
                className="bg-transparent text-[10px] text-gold/70 w-full outline-none hover:text-gold placeholder-white/10 italic min-w-0" 
             />
        </div>
    </div>
);

export const ArmorRow = ({ armor, onChange }: any) => (
    <div className="flex flex-col gap-2 p-2 rounded border bg-blue-900/10 border-blue-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
             <div className="w-full md:w-20 shrink-0">
                <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-blue-400 uppercase font-bold tracking-wider border border-blue-500/20 block text-center md:text-left md:inline-block w-full">Armadura</span>
            </div>
            <input 
                type="text" value={armor?.name || ''} onChange={e => onChange({...armor, name: e.target.value})}
                placeholder="Nome da Armadura" className="flex-1 w-full bg-transparent border-b border-white/10 text-sm text-white focus:border-blue-500 outline-none placeholder:text-white/10 py-0.5" 
            />
            
            <div className="flex w-full md:w-auto gap-3 mt-2 md:mt-0">
                <div className="flex items-center gap-1 border-l border-white/10 pl-3 flex-1 md:flex-none justify-center md:justify-start">
                    <span className="text-[8px] uppercase text-white/30 mr-1 font-bold">Limiares</span>
                    <input 
                        type="number" value={armor?.baseMajor || ''} onChange={e => onChange({...armor, baseMajor: parseInt(e.target.value) || 0})}
                        placeholder="-" className="w-8 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:border-blue-500 outline-none" 
                    />
                    <span className="text-white/20">/</span>
                    <input 
                        type="number" value={armor?.baseSevere || ''} onChange={e => onChange({...armor, baseSevere: parseInt(e.target.value) || 0})}
                        placeholder="-" className="w-8 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:border-blue-500 outline-none" 
                    />
                </div>
                <div className="flex items-center gap-1 border-l border-white/10 pl-3 flex-1 md:flex-none justify-center md:justify-start">
                    <span className="text-[8px] uppercase text-white/30 mr-1 font-bold">Base</span>
                    <input 
                        type="number" value={armor?.baseSlots || ''} onChange={e => onChange({...armor, baseSlots: parseInt(e.target.value) || 0})}
                        placeholder="0" className="w-8 bg-black/30 border border-white/10 rounded text-center text-blue-400 font-bold text-lg focus:border-blue-500 outline-none" 
                    />
                </div>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pl-0 md:pl-2">
             <div className="hidden sm:block w-4 border-l-2 border-blue-500/10 rounded-bl"></div> 
             <input type="text" value={armor?.trait1 || ''} onChange={e => onChange({...armor, trait1: e.target.value})} placeholder="Habilidade 1..." className="w-full sm:w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/70 focus:border-blue-500 outline-none focus:text-white" />
             <input type="text" value={armor?.trait2 || ''} onChange={e => onChange({...armor, trait2: e.target.value})} placeholder="Habilidade 2..." className="w-full sm:w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/70 focus:border-blue-500 outline-none focus:text-white" />
        </div>
    </div>
);

export const InventoryRow = ({ item, onChange, onDelete }: any) => (
    <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-white/10 hover:border-gold/30 transition-colors group">
        <div className="w-8 h-8 rounded bg-[#1a1520] flex items-center justify-center border border-white/10 text-white/20 shrink-0">
            <Check size={14} />
        </div>
        <input 
            type="text" 
            value={item.name} 
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            placeholder="Nome do item..." 
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none border-b border-transparent focus:border-white/20 pb-0.5 min-w-0" 
        />
        <div className="flex items-center bg-black/40 rounded border border-white/10 px-2 h-8 shrink-0">
            <span className="text-[10px] text-white/40 mr-1 uppercase">Qtd</span>
            <input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => onChange({ ...item, quantity: parseInt(e.target.value) || 1 })}
                className="w-8 bg-transparent text-center text-gold font-bold text-sm outline-none" 
            />
        </div>
        <button onClick={onDelete} className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors shrink-0"><Trash size={16} /></button>
    </div>
);

export const ItemRow = ({ name }: any) => (
    <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 text-xs text-white/70">
        <span>{name}</span>
        <Check size={12} className="text-green-500" />
    </div>
);

export const TextAreaQuestion = ({ label, placeholder, value, onChange }: any) => (
    <div className="bg-white/5 rounded p-3 border border-white/10 w-full">
        <label className="block text-xs text-gold mb-2 font-bold uppercase">{label}</label>
        <textarea 
            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white/80 text-xs resize-none min-h-[80px] focus:border-gold outline-none" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    </div>
);

export const EvolutionColumn = ({ data, tierId, savedValues, onToggle }: any) => {
    if (!data) return null;
    return (
        <div className="bg-black/20 p-3 rounded border border-white/10 h-full">
            <h4 className="text-gold font-bold text-center text-xs mb-1">{data.title}</h4>
            <div className="space-y-2">
                {data.items.map((item: any, i: number) => {
                    const uniqueKey = `${tierId}-${i}`;
                    const currentVal = savedValues?.[uniqueKey] || 0;

                    return (
                        <div key={i} className="flex items-start gap-2 border-b border-white/5 pb-1 last:border-0">
                            <div className="flex gap-0.5 mt-1 min-w-fit">
                                {Array.from({ length: item.count }).map((_, idx) => {
                                    const isActive = idx < currentVal;
                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => onToggle(uniqueKey, isActive ? idx : idx + 1)} 
                                            className={`w-3 h-3 rounded-full border transition-all ${isActive ? 'bg-gold border-gold shadow-[0_0_5px_#fbbf24]' : 'bg-transparent border-white/30 hover:border-gold/50'}`}
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-[10px] text-white/60 leading-tight cursor-default">{item.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};