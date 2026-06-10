import { useState } from 'react';
import { X, Shield, Heart } from '@phosphor-icons/react';
import {
  getDamageSeverity,
  getHpMarkFromSeverity,
  getSeverityLabel,
  reduceSeverity,
  DamageSeverity,
} from '../../lib/damageHelpers';

interface DamageAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: { major: number; severe: number };
  currentPA: number;
  maxPA: number;
  onApply: (hpToMark: number, paToSpend: number) => void;
}

export function DamageAssistantModal({
  isOpen,
  onClose,
  thresholds,
  currentPA,
  maxPA,
  onApply,
}: DamageAssistantModalProps) {
  const [damageInput, setDamageInput] = useState(0);
  const [useArmor, setUseArmor] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const rawSeverity = getDamageSeverity(damageInput, thresholds);
  const finalSeverity: DamageSeverity =
    useArmor && currentPA < maxPA ? reduceSeverity(rawSeverity) : rawSeverity;
  const hpToMark = getHpMarkFromSeverity(finalSeverity);
  const paToSpend = useArmor && currentPA < maxPA && rawSeverity !== finalSeverity ? 1 : 0;

  const handleApply = () => {
    onApply(hpToMark, paToSpend);
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setDamageInput(0);
      setUseArmor(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1520] border border-gold/30 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gold font-rpg text-lg flex items-center gap-2">
            <Shield size={20} /> Assistente de Dano
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase text-white/50 mb-1 block">Dano recebido</label>
            <input
              type="number"
              min={0}
              value={damageInput || ''}
              onChange={(e) => setDamageInput(parseInt(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xl font-bold text-center outline-none focus:border-gold"
              placeholder="0"
            />
          </div>

          {damageInput > 0 && (
            <div className="bg-black/30 rounded-lg p-3 space-y-2 text-sm">
              <p className="text-white/60">
                Limiares: Menor 1–{thresholds.major - 1} | Maior {thresholds.major}–{thresholds.severe} | Grave {thresholds.severe + 1}+
              </p>
              <p className="text-white">
                Gravidade: <strong className="text-gold">{getSeverityLabel(rawSeverity)}</strong>
              </p>

              {currentPA < maxPA && rawSeverity !== 'minor' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useArmor}
                    onChange={(e) => setUseArmor(e.target.checked)}
                    className="accent-gold"
                  />
                  <span className="text-white/80">
                    Gastar 1 PA ({currentPA}/{maxPA}) — reduz gravidade em 1 nível
                  </span>
                </label>
              )}

              {useArmor && paToSpend > 0 && (
                <p className="text-cyan-300 text-xs">
                  Com armadura: {getSeverityLabel(finalSeverity)}
                </p>
              )}

              <p className="text-red-300 font-bold flex items-center gap-2">
                <Heart size={14} weight="fill" />
                Marcar {hpToMark} PV
                {paToSpend > 0 && ` + ${paToSpend} PA`}
              </p>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={damageInput <= 0 || confirmed}
            className="w-full py-3 bg-gradient-to-r from-red-900/80 to-red-800 border border-red-500/50 text-white font-bold rounded hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmed ? 'Aplicado!' : 'Confirmar e aplicar'}
          </button>
          <p className="text-[10px] text-white/30 text-center">
            Modo assistivo — confirme para marcar PV/PA na ficha
          </p>
        </div>
      </div>
    </div>
  );
}
