import { useState } from 'react';
import { X, LockKey, PawPrint, CheckCircle, Warning, PaperPlaneRight } from '@phosphor-icons/react';
import { DRUID_FORMS, DruidFormOption } from '../data/druidForms'; 
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DruidMorphModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null; // Novo: Precisa do ID da sessão para o alerta funcionar
}

export function DruidMorphModal({ character, isOpen, onClose, sessionId }: DruidMorphModalProps) {
  const unlockedTier = character.unlockedTier || 1;
  const [activeTier, setActiveTier] = useState(1);
  const [selectedForm, setSelectedForm] = useState<DruidFormOption | null>(null);
  const [animalName, setAnimalName] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);

  if (!isOpen) return null;

  const handleTransform = async () => {
    if (!selectedForm || !animalName) return;
    setIsTransforming(true);

    try {
      // 1. Atualiza a ficha do personagem
      const charRef = doc(db, "characters", character.id);
      await updateDoc(charRef, {
        currentForm: {
          base: selectedForm.name,
          customName: animalName,
          stats: selectedForm.stats,
          damage: selectedForm.damage,
          tierLabel: DRUID_FORMS.find(t => t.id === activeTier)?.label, // Salva o nome do patamar
          active: true
        }
      });

      // 2. Dispara o Alerta Global na Sessão Correta
      if (sessionId) {
        const sessionRef = doc(db, "sessoes", sessionId); 
        await updateDoc(sessionRef, {
          latestTransformation: {
            id: Date.now(),
            charName: character.name,
            formName: animalName, // Nome do animal
            baseForm: selectedForm.name, // Nome da ficha (ex: Predador)
            tierLabel: DRUID_FORMS.find(t => t.id === activeTier)?.label || "Forma Selvagem", // "1º Patamar"
            gradientClass: "from-green-600 to-green-950"
          }
        });
      } else {
        console.error("ID da sessão não encontrado. O alerta não aparecerá para os outros.");
      }

      onClose();
      setAnimalName("");
      setSelectedForm(null);

    } catch (error) {
      console.error("Erro ao transformar:", error);
      alert("Erro ao salvar transformação. Verifique se você está conectado a uma sessão.");
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-7xl bg-[#121212] border border-green-800/60 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col h-[85vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 border-b border-green-900/30 flex justify-between items-center bg-gradient-to-r from-green-950/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg border border-green-500/20">
                <PawPrint size={24} className="text-green-400" weight="fill" />
            </div>
            <div>
                <h2 className="text-xl font-rpg text-green-100 uppercase tracking-wider leading-none">Círculo Druídico</h2>
                <span className="text-[10px] text-green-500/60 uppercase tracking-[0.2em]">Metamorfose</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        {/* NAVEGAÇÃO DE PATAMARES (TABS) */}
        <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto">
          {DRUID_FORMS.map((tier) => {
            const isLocked = tier.id > unlockedTier;
            const isActive = activeTier === tier.id;
            
            return (
              <button
                key={tier.id}
                onClick={() => !isLocked && setActiveTier(tier.id)}
                className={`
                  px-8 py-3 flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all relative whitespace-nowrap
                  ${isActive ? 'text-green-400 bg-green-900/10' : 'text-white/30 hover:bg-white/5'}
                  ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                `}
              >
                {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_#22c55e]" />}
                {isLocked && <LockKey size={14} />}
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* LAYOUT DE 3 COLUNAS */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* COLUNA 1: LISTA DE ANIMAIS (25%) */}
          <div className="w-1/4 min-w-[250px] overflow-y-auto border-r border-white/5 bg-black/20 custom-scrollbar">
            <div className="p-2 space-y-1">
                {DRUID_FORMS.find(t => t.id === activeTier)?.forms.map((form) => (
                <button
                    key={form.name}
                    onClick={() => setSelectedForm(form)}
                    className={`w-full text-left p-3 rounded border transition-all group relative overflow-hidden ${
                    selectedForm?.name === form.name 
                    ? 'bg-green-900/20 border-green-500 text-white' 
                    : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                >
                    <div className="font-rpg text-sm tracking-wide uppercase">{form.name}</div>
                    <div className="text-[10px] font-sans italic opacity-60 mt-0.5 truncate">{form.examples}</div>
                </button>
                ))}
            </div>
          </div>

          {/* COLUNA 2: DETALHES (50%) - Texto descritivo */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#161616]">
            {selectedForm ? (
              <div className="animate-fade-in space-y-6">
                <div>
                    <h3 className="text-3xl font-rpg text-green-400">{selectedForm.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-green-900/30 text-green-200 text-xs px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                            <CheckCircle weight="fill" /> {selectedForm.stats}
                        </span>
                        <span className="bg-red-900/20 text-red-200 text-xs px-2 py-1 rounded border border-red-500/20 flex items-center gap-1">
                            <Warning weight="fill" /> {selectedForm.damage}
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-900/10 to-transparent p-3 rounded-l border-l-2 border-green-500">
                    <p className="text-green-300 font-bold text-xs uppercase mb-1">Passiva</p>
                    <p className="text-white/80 text-sm italic">"{selectedForm.passive}"</p>
                </div>
                
                <div className="space-y-4">
                    <h4 className="text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">Habilidades</h4>
                    {selectedForm.abilities.map(ab => (
                        <div key={ab.name} className="bg-white/5 p-3 rounded border border-white/5">
                            <h4 className="font-bold text-green-300 text-xs uppercase mb-1 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                {ab.name}
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{ab.description}</p>
                        </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                <PawPrint size={48} weight="thin" className="mb-2 opacity-20" />
                <p className="italic text-sm">Selecione uma forma da lista...</p>
              </div>
            )}
          </div>

          {/* COLUNA 3: PAINEL DE AÇÃO (25%) - Input e Botão "ao lado" */}
          <div className="w-1/4 min-w-[280px] bg-[#0a0a0a] border-l border-white/10 p-6 flex flex-col justify-center shadow-xl z-10">
                {selectedForm ? (
                    <div className="animate-slide-left flex flex-col gap-6 h-full justify-center">
                        <div className="text-center">
                            <h4 className="text-white font-rpg text-xl mb-1">Confirmar Forma</h4>
                            <p className="text-white/40 text-xs">Defina a aparência da sua transformação.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest text-green-500/70 font-bold">Nome da Fera</label>
                            <input 
                                type="text"
                                value={animalName}
                                onChange={(e) => setAnimalName(e.target.value)}
                                placeholder="Ex: Urso, Lobo, Sherek..."
                                className="w-full bg-white/5 border border-green-800 p-3 rounded text-white text-sm focus:border-green-400 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                                autoFocus
                            />
                        </div>

                        <div className="bg-green-900/10 border border-green-500/20 p-3 rounded text-[10px] text-green-200/60 text-center italic">
                            Ao confirmar, um alerta será enviado para todos os jogadores e mestre.
                        </div>
                        
                        <button
                            onClick={handleTransform}
                            disabled={!animalName || isTransforming}
                            className="w-full py-3 bg-gradient-to-r from-green-700 to-green-900 border border-green-500 text-green-100 font-bold text-sm tracking-widest rounded shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 mt-auto"
                        >
                            {isTransforming ? "..." : (
                                <>
                                    TRANSFORMAR <PaperPlaneRight weight="fill" />
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center opacity-10">
                        <PawPrint size={100} />
                    </div>
                )}
          </div>

        </div>
      </div>
    </div>
  );
}