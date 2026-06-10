import { useState } from 'react';
import { X, Campfire, MoonStars } from '@phosphor-icons/react';

interface RestOptionsModalProps {
  isOpen: boolean;
  type: 'short' | 'long';
  onClose: () => void;
  onConfirm: (options: {
    recoverCards: boolean;
    recoverPF: number | 'all' | 'none';
    recoverPV: number;
    resetStrangePatterns: boolean;
  }) => void;
}

export function RestOptionsModal({ isOpen, type, onClose, onConfirm }: RestOptionsModalProps) {
  const [recoverCards, setRecoverCards] = useState(true);
  const [recoverPF, setRecoverPF] = useState<'none' | 'all' | number>(type === 'long' ? 'all' : 'none');
  const [recoverPV, setRecoverPV] = useState(0);
  const [resetStrangePatterns, setResetStrangePatterns] = useState(type === 'long');

  if (!isOpen) return null;

  const isLong = type === 'long';

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="bg-[#1a1520] border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-rpg text-lg flex items-center gap-2">
            {isLong ? <MoonStars className="text-indigo-300" /> : <Campfire className="text-orange-300" />}
            Descanso {isLong ? 'Longo' : 'Curto'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={recoverCards} onChange={(e) => setRecoverCards(e.target.checked)} className="accent-gold" />
            <span className="text-white/80">Recuperar cartas exauridas</span>
          </label>

          <div className="bg-black/30 rounded p-3 space-y-2">
            <span className="text-xs uppercase text-white/50 block">Recuperar PF (fadiga)</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setRecoverPF('none')}
                className={`px-2 py-1 rounded text-xs border ${recoverPF === 'none' ? 'border-gold text-gold' : 'border-white/10 text-white/50'}`}
              >
                Nenhum
              </button>
              <button
                onClick={() => setRecoverPF(1)}
                className={`px-2 py-1 rounded text-xs border ${recoverPF === 1 ? 'border-gold text-gold' : 'border-white/10 text-white/50'}`}
              >
                +1 PF
              </button>
              {isLong && (
                <button
                  onClick={() => setRecoverPF('all')}
                  className={`px-2 py-1 rounded text-xs border ${recoverPF === 'all' ? 'border-gold text-gold' : 'border-white/10 text-white/50'}`}
                >
                  Limpar todos
                </button>
              )}
            </div>
          </div>

          <div className="bg-black/30 rounded p-3">
            <label className="text-xs uppercase text-white/50 mb-1 block">Recuperar PV</label>
            <input
              type="number"
              min={0}
              value={recoverPV || ''}
              onChange={(e) => setRecoverPV(parseInt(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-center outline-none focus:border-gold"
              placeholder="0"
            />
          </div>

          {isLong && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={resetStrangePatterns}
                onChange={(e) => setResetStrangePatterns(e.target.checked)}
                className="accent-gold"
              />
              <span className="text-white/80 text-xs">Permitir troca de Padrões Estranhos (Mago)</span>
            </label>
          )}
        </div>

        <button
          onClick={() =>
            onConfirm({
              recoverCards,
              recoverPF,
              recoverPV,
              resetStrangePatterns,
            })
          }
          className="w-full mt-4 py-3 bg-gradient-to-r from-gold/80 to-yellow-700 text-black font-bold rounded hover:brightness-110 transition-all"
        >
          Aplicar descanso
        </button>
      </div>
    </div>
  );
}
