import { useState } from 'react';
import { Sword } from '@phosphor-icons/react';
import { parseDieSides, parseWeaponModifier } from '../../lib/damageHelpers';
import { rollDamageDice } from '../../lib/diceRollHelpers';

interface DamageRollPanelProps {
  defaultProficiency?: number;
  defaultDamageStr?: string;
  onRoll: (result: {
    type: 'DAMAGE';
    rolls: number[];
    dieSides: number;
    proficiency: number;
    weaponMod: number;
    isCritical: boolean;
    total: number;
  }) => void;
}

export function DamageRollPanel({
  defaultProficiency = 1,
  defaultDamageStr = 'd6',
  onRoll,
}: DamageRollPanelProps) {
  const [proficiency, setProficiency] = useState(defaultProficiency);
  const [dieSides, setDieSides] = useState(parseDieSides(defaultDamageStr));
  const [weaponMod, setWeaponMod] = useState(parseWeaponModifier(defaultDamageStr));
  const [isCritical, setIsCritical] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<{ rolls: number[]; total: number } | null>(null);

  const handleRoll = async () => {
    setIsRolling(true);

    try {
      const rolls = await rollDamageDice(proficiency, dieSides, isCritical);
      const total = rolls.reduce((sum, value) => sum + value, 0) + weaponMod;
      const rolled = { rolls, total };

      setResult(rolled);
      onRoll({
        type: 'DAMAGE',
        rolls: rolled.rolls,
        dieSides,
        proficiency,
        weaponMod,
        isCritical,
        total: rolled.total,
      });
    } catch (error) {
      console.error('Erro na rolagem de dano:', error);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-white/50 text-center">
        (Dados da Arma × Proficiência) + Modificadores
      </p>

      <div className="flex gap-4">
        <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
          <label className="text-xs uppercase text-white/50 mb-1 block">Proficiência</label>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setProficiency((p) => Math.max(1, p - 1))} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
            <span className="text-xl font-bold text-white w-8 text-center">{proficiency}</span>
            <button onClick={() => setProficiency((p) => p + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
          </div>
        </div>
        <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
          <label className="text-xs uppercase text-white/50 mb-1 block">Dado</label>
          <select
            value={dieSides}
            onChange={(e) => setDieSides(parseInt(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded text-white text-center py-1 outline-none focus:border-gold"
          >
            {[4, 6, 8, 10, 12].map((d) => (
              <option key={d} value={d}>d{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
          <label className="text-xs uppercase text-white/50 mb-1 block">Mod. Arma</label>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setWeaponMod((m) => m - 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
            <span className="text-xl font-bold text-white w-8 text-center">{weaponMod >= 0 ? `+${weaponMod}` : weaponMod}</span>
            <button onClick={() => setWeaponMod((m) => m + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
          </div>
        </div>
        <label className="flex-1 flex items-center justify-center gap-2 bg-gold/10 border border-gold/30 rounded p-3 cursor-pointer">
          <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="accent-gold" />
          <span className="text-xs text-gold font-bold uppercase">Crítico</span>
        </label>
      </div>

      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="w-full py-4 bg-gradient-to-r from-red-900 to-orange-900 hover:from-red-800 hover:to-orange-800 disabled:opacity-60 text-white font-bold font-rpg text-xl rounded shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
      >
        <Sword size={24} weight="fill" /> {isRolling ? 'ROLANDO...' : 'ROLAR DANO'}
      </button>

      {result && (
        <div className="text-center bg-black/30 rounded-lg p-4 border border-red-500/20">
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {result.rolls.map((v, i) => (
              <span key={i} className="w-10 h-10 bg-white/5 border border-white/20 rounded flex items-center justify-center font-bold text-white">{v}</span>
            ))}
          </div>
          <div className="text-4xl font-rpg font-bold text-red-400">{result.total}</div>
          {isCritical && <p className="text-[10px] text-gold mt-1">Crítico: máximo + rolagem normal</p>}
        </div>
      )}
    </div>
  );
}
