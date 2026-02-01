// src/components/sheet/SheetWidgets.tsx
import { 
    Sword, Shield, Heart, Lightning, Coins, X 
} from '@phosphor-icons/react';

export const AttributeBox = ({ label, value, icon, color }: any) => (
    <div className="flex items-center justify-between bg-[#1a1520] border border-white/10 p-2 rounded">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-white/40">{icon}</div>
            <div className="text-sm font-bold text-white uppercase">{label}</div>
        </div>
        <div className="text-xl font-bold text-white bg-black/40 px-3 py-1 rounded border border-white/5" style={{ borderColor: value > 0 ? color : 'transparent' }}>
            {value >= 0 ? `+${value}` : value}
        </div>
    </div>
);

export const ResourceDisplay = ({ label, current, max, color, icon }: any) => (
    <div className="flex flex-col items-center gap-2 bg-[#1a1520] border border-white/10 rounded-xl p-3">
        <span className={`text-2xl ${color}`}>{icon}</span>
        <div className="text-xl font-bold text-white tracking-wide">
            {current} <span className="text-xs text-white/30">/ {max}</span>
        </div>
        <span className="text-[10px] uppercase text-white/50">{label}</span>
    </div>
);

export const ThresholdBox = ({ label, range, highlight }: any) => (
    <div className={`rounded border p-2 ${highlight ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'}`}>
        <div className="text-[10px] text-white/50 uppercase">{label}</div>
        <div className="text-lg font-bold text-white">{range}</div>
    </div>
);

export const EmptyWeaponSlot = () => (
    <div className="flex gap-3 items-center bg-black/30 p-2 rounded border border-white/10 border-dashed hover:border-white/30 transition-colors group cursor-default">
        <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-white/10 group-hover:text-white/30 transition-colors">
            <Sword size={20} />
        </div>
        <div className="flex-1">
            <div className="text-xs text-white/20 italic group-hover:text-white/50">Slot de Arma (Vazio)</div>
        </div>
        <div className="flex flex-col items-center px-2 border-l border-white/10 opacity-30">
            <div className="w-3 h-3 border border-white/30 rounded"></div>
            <span className="text-[8px] uppercase text-white/40 mt-1">2M</span>
        </div>
    </div>
);

export const ArmorWidget = ({ maxPA, currentPA, onUpdatePA, name }: any) => (
    <div className="bg-[#1a1520] border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
            <div>
                <h3 className="text-xs uppercase text-white/30 tracking-widest flex items-center gap-2"><Shield size={14} weight="fill"/> Armadura (PA)</h3>
                <div className="text-[10px] text-gold mt-0.5">{name}</div>
            </div>
            <span className="text-[10px] text-white/30 font-bold">{maxPA} Max</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center py-3 bg-black/20 rounded-lg border border-white/5">
            {Array.from({ length: 12 }).map((_, i) => {
                const isAvailableSlot = i < maxPA;
                const isSpent = i < currentPA;
                if (!isAvailableSlot) return <div key={i} className="w-4 h-4 rounded-full border border-white/5 bg-transparent"></div>;
                return (
                    <button 
                        key={i} 
                        onClick={() => onUpdatePA(i, isSpent)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSpent ? 'border-white/30 bg-white/10' : 'border-white bg-white shadow-[0_0_5px_white]'}`}
                    >
                        {isSpent && <div className="w-2 h-2 bg-black/50 rounded-full"></div>}
                    </button>
                );
            })}
        </div>
    </div>
);

export const ItemRow = ({ name, slot }: any) => (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
        <span className="text-white text-sm">{name}</span>
        <span className="text-white/30 text-xs">{slot} slot</span>
    </div>
);

export const TextAreaQuestion = ({ label, placeholder }: any) => (
    <div className="bg-white/5 rounded p-3 border border-white/10">
        <label className="block text-sm text-gold mb-2 font-bold">{label}</label>
        <textarea className="w-full bg-black/50 border border-white/10 rounded p-2 text-white/80 text-sm resize-none h-20 focus:border-gold outline-none" placeholder={placeholder || "Escreva..."} />
    </div>
);

export const EvolutionColumn = ({ data }: any) => (
    <div className="bg-black/20 p-4 rounded border border-white/10 h-full">
        <h4 className="text-gold font-bold text-center text-sm mb-1">{data.title}</h4>
        <p className="text-[10px] text-white/50 text-center mb-4 leading-tight">{data.subtitle}</p>
        <div className="space-y-3">
            {data.items.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-2 group hover:bg-white/5 p-1 rounded transition-colors">
                    <div className="flex gap-1 mt-0.5 min-w-fit">
                        {Array.from({ length: item.count }).map((_, idx) => (
                            <div key={idx} className="w-3 h-3 border border-white/30 rounded bg-black"></div>
                        ))}
                    </div>
                    <span className="text-xs text-white/70 leading-tight">{item.text}</span>
                </div>
            ))}
        </div>
    </div>
);