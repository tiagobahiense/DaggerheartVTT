// src/components/sheet/SheetWidgets.tsx
import { useState } from 'react';
import { 
    Sword, Shield, Heart, Lightning, Coins, X, 
    Link as LinkIcon, PencilSimple, Check, Target
} from '@phosphor-icons/react';

// --- COMPONENTES VISUAIS GERAIS ---

export const AttributeBox = ({ label, value, icon, color }: any) => (
    <div className="flex items-center justify-between bg-[#1a1520] border border-white/10 p-1.5 rounded w-full">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white/40 text-xs">{icon}</div>
            <div className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</div>
        </div>
        <div className="text-lg font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px] text-center" style={{ borderColor: value > 0 ? color : 'transparent' }}>
            {value >= 0 ? `+${value}` : value}
        </div>
    </div>
);

export const ResourceDisplay = ({ label, current, max, color, icon }: any) => (
    <div className="flex flex-col items-center justify-center bg-[#1a1520] border border-white/10 rounded-lg p-2 min-w-[80px]">
        <span className={`text-xl ${color} mb-1`}>{icon}</span>
        <div className="text-lg font-bold text-white leading-none">
            {current} <span className="text-[10px] text-white/30">/ {max}</span>
        </div>
        <span className="text-[8px] uppercase text-white/40 mt-1">{label}</span>
    </div>
);

export const ThresholdBox = ({ label, range, highlight }: any) => (
    <div className={`rounded border px-2 py-1 flex flex-col items-center justify-center ${highlight ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'}`}>
        <div className="text-[8px] text-white/50 uppercase tracking-tighter">{label}</div>
        <div className="text-sm font-bold text-white">{range}</div>
    </div>
);

export const ArmorWidget = ({ maxPA, currentPA, onUpdatePA, name }: any) => (
    <div className="bg-[#1a1520] border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center h-full">
        <div className="flex items-center gap-1 mb-2">
            <Shield size={12} weight="fill" className="text-blue-400"/> 
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px]">
            {Array.from({ length: Math.max(maxPA, 6) }).map((_, i) => { 
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

// --- COMPONENTES DE COMBATE ---

export const CombatRow = ({ label, placeholderName, isInventory = false }: any) => {
  return (
    <div className={`flex flex-col gap-1.5 p-2 rounded border ${isInventory ? 'bg-black/20 border-white/5 opacity-60' : 'bg-white/5 border-white/10'} hover:border-white/20 transition-colors`}>
      {/* LINHA 1: Nome | Atributo/Alcance | Dano */}
      <div className="flex items-center gap-2">
         {/* Badge Label */}
         <div className="w-20 shrink-0">
             <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gold/60 uppercase font-bold tracking-wider border border-white/5 block text-center">
                {label}
             </span>
         </div>
         
         {/* Nome */}
         <input 
            type="text" 
            placeholder={placeholderName || "Nome da Arma"}
            className="flex-1 bg-transparent border-b border-white/10 text-sm text-white focus:border-gold outline-none placeholder:text-white/10 py-0.5"
         />

         {/* Attr & Range */}
         <div className="w-28 border-l border-white/10 pl-2">
            <input 
                type="text" 
                placeholder="Agil | Perto"
                className="w-full bg-transparent text-xs text-center text-gold focus:text-white outline-none placeholder:text-white/10 border-b border-white/5"
            />
         </div>

         {/* Damage */}
         <div className="w-16 border-l border-white/10 pl-2">
           <input 
            type="text" 
            placeholder="d8+2"
            className="w-full bg-transparent text-sm font-bold text-center text-white focus:text-gold outline-none placeholder:text-white/10 border-b border-white/5"
          />
         </div>
      </div>

      {/* LINHA 2: Habilidades (2 Campos) */}
      <div className="flex gap-2 pl-2">
         <div className="w-4 border-l-2 border-white/5 rounded-bl"></div> {/* Linha guia visual */}
         <input 
            type="text" 
            placeholder="Habilidade / Traço 1"
            className="w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/60 focus:border-gold outline-none focus:text-white"
         />
         <input 
            type="text" 
            placeholder="Habilidade / Traço 2"
            className="w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/60 focus:border-gold outline-none focus:text-white"
         />
      </div>
    </div>
  );
};

export const ArmorRow = () => {
    return (
      <div className="flex flex-col gap-2 p-2 rounded border bg-blue-900/10 border-blue-500/20">
        
        {/* LINHA 1: Label | Nome | Limiares | Armadura Base */}
        <div className="flex items-center gap-3">
             <div className="w-20 shrink-0">
                <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-blue-400 uppercase font-bold tracking-wider border border-blue-500/20 block text-center">
                    Armadura
                </span>
            </div>

            {/* Nome */}
            <input 
                type="text" 
                placeholder="Nome (Ex: Cota de Malha)" 
                className="flex-1 bg-transparent border-b border-white/10 text-sm text-white focus:border-blue-500 outline-none placeholder:text-white/10 py-0.5" 
            />

            {/* Limiares Base */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                <span className="text-[8px] uppercase text-white/30 mr-1 font-bold">Limiares</span>
                <input 
                    type="number" 
                    placeholder="X" 
                    className="w-8 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:border-blue-500 outline-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <span className="text-white/20">/</span>
                <input 
                    type="number" 
                    placeholder="Y" 
                    className="w-8 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:border-blue-500 outline-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
            </div>

            {/* Base Armor */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                <span className="text-[8px] uppercase text-white/30 mr-1 font-bold">Base</span>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-8 bg-black/30 border border-white/10 rounded text-center text-blue-400 font-bold text-lg focus:border-blue-500 outline-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
            </div>
        </div>

        {/* LINHA 2: Habilidades (2 Campos) */}
        <div className="flex gap-2 pl-2">
             <div className="w-4 border-l-2 border-blue-500/10 rounded-bl"></div> {/* Linha guia visual */}
             <input type="text" placeholder="Habilidade da Armadura 1..." className="w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/70 focus:border-blue-500 outline-none focus:text-white" />
             <input type="text" placeholder="Habilidade da Armadura 2..." className="w-1/2 bg-black/20 border border-white/5 rounded px-2 py-1 text-xs text-white/70 focus:border-blue-500 outline-none focus:text-white" />
        </div>
      </div>
    );
};

// --- MODAIS E OUTROS ---

export const ImageUrlModal = ({ isOpen, onClose, onConfirm, currentUrl }: any) => {
    const [url, setUrl] = useState(currentUrl || '');
    if (!isOpen) return null;
    
    // CORREÇÃO: e.stopPropagation no onClick do container principal para não fechar a ficha inteira
    // E no conteúdo interno para não fechar o modal ao clicar no input
    return (
      <div 
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4" 
        onClick={(e) => { 
            e.stopPropagation(); // Impede que o clique no fundo feche a ficha de personagem
            onClose(); // Fecha apenas este modal de imagem
        }}
      >
        <div 
            className="bg-[#1a1520] border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
        >
          <h3 className="text-gold font-serif text-xl mb-4 flex items-center gap-2"><PencilSimple /> Alterar Retrato</h3>
          <div className="mb-6">
            <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide">Link da Imagem (URL)</label>
            <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://..." 
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-gold outline-none" 
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">Cancelar</button>
            <button onClick={() => { onConfirm(url); onClose(); }} className="px-6 py-2 rounded bg-gold/20 border border-gold/50 text-gold hover:bg-gold hover:text-black transition-all font-bold text-sm flex items-center gap-2"><Check weight="bold" /> Confirmar</button>
          </div>
        </div>
      </div>
    );
};

export const ItemRow = ({ name }: any) => (
    <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
        <span className="text-white text-xs">{name}</span>
        <div className="w-2 h-2 rounded-full bg-white/20"></div>
    </div>
);

export const TextAreaQuestion = ({ label, placeholder }: any) => (
    <div className="bg-white/5 rounded p-3 border border-white/10">
        <label className="block text-xs text-gold mb-2 font-bold uppercase">{label}</label>
        <textarea className="w-full bg-black/50 border border-white/10 rounded p-2 text-white/80 text-xs resize-none h-16 focus:border-gold outline-none" placeholder={placeholder} />
    </div>
);

export const EvolutionColumn = ({ data }: any) => {
    if (!data) return null;
    return (
        <div className="bg-black/20 p-3 rounded border border-white/10 h-full">
            <h4 className="text-gold font-bold text-center text-xs mb-1">{data.title}</h4>
            <div className="space-y-2">
                {data.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 border-b border-white/5 pb-1 last:border-0">
                        <div className="flex gap-0.5 mt-1 min-w-fit">{Array.from({ length: item.count }).map((_, idx) => <div key={idx} className="w-2 h-2 border border-white/30 rounded-full bg-black"></div>)}</div>
                        <span className="text-[10px] text-white/70 leading-tight">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};