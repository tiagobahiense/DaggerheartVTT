import { useState } from 'react';
import { UsersThree, HandWaving } from '@phosphor-icons/react';

interface GroupTestPanelProps {
  onRoll: (result: {
    type: 'REACTION' | 'GROUP';
    mode: 'reaction' | 'group';
    hopeDie: number;
    fearDie: number;
    modifier: number;
    total: number;
    difficulty: number;
    isSuccess: boolean;
    allyBonus?: number;
    suggestedLeaderMod?: number;
  }) => void;
}

function rollDualityPair() {
  const hope = Math.floor(Math.random() * 12) + 1;
  const fear = Math.floor(Math.random() * 12) + 1;
  return { hope, fear };
}

export function GroupTestPanel({ onRoll }: GroupTestPanelProps) {
  const [mode, setMode] = useState<'reaction' | 'group'>('reaction');
  const [modifier, setModifier] = useState(0);
  const [difficulty, setDifficulty] = useState(12);
  const [allySuccesses, setAllySuccesses] = useState(0);
  const [allyFailures, setAllyFailures] = useState(0);
  const [lastResult, setLastResult] = useState<{
    hope: number;
    fear: number;
    total: number;
    isSuccess: boolean;
  } | null>(null);

  const allyBonus = allySuccesses - allyFailures;

  const handleRoll = () => {
    const { hope, fear } = rollDualityPair();
    const total = hope + fear + modifier + (mode === 'group' ? allyBonus : 0);
    const isSuccess = total >= difficulty;

    setLastResult({ hope, fear, total, isSuccess });

    onRoll({
      type: mode === 'group' ? 'GROUP' : 'REACTION',
      mode,
      hopeDie: hope,
      fearDie: fear,
      modifier,
      total,
      difficulty,
      isSuccess,
      allyBonus: mode === 'group' ? allyBonus : undefined,
      suggestedLeaderMod: mode === 'group' ? allyBonus : undefined,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('reaction')}
          className={`flex-1 py-2 rounded border text-xs font-bold uppercase flex items-center justify-center gap-1 ${mode === 'reaction' ? 'bg-blue-900/50 border-blue-400 text-blue-100' : 'bg-black/40 border-white/10 text-white/40'}`}
        >
          <HandWaving size={14} /> Reação
        </button>
        <button
          onClick={() => setMode('group')}
          className={`flex-1 py-2 rounded border text-xs font-bold uppercase flex items-center justify-center gap-1 ${mode === 'group' ? 'bg-green-900/50 border-green-400 text-green-100' : 'bg-black/40 border-white/10 text-white/40'}`}
        >
          <UsersThree size={14} /> Grupo
        </button>
      </div>

      <p className="text-[10px] text-white/40 text-center">
        {mode === 'reaction'
          ? 'Teste de Reação contra CD definida pelo Mestre.'
          : 'Líder rola com bônus dos aliados (+1 sucesso / −1 falha).'}
      </p>

      <div className="flex gap-4">
        <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
          <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setModifier((m) => m - 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
            <span className="text-xl font-bold text-white w-8 text-center">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            <button onClick={() => setModifier((m) => m + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
          </div>
        </div>
        <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
          <label className="text-xs uppercase text-white/50 mb-1 block">CD / Dificuldade</label>
          <input
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full bg-transparent text-xl font-bold text-white text-center outline-none border-b border-white/20 focus:border-gold"
          />
        </div>
      </div>

      {mode === 'group' && (
        <div className="bg-white/5 p-3 rounded border border-white/10 space-y-2">
          <span className="text-xs uppercase text-white/50 block">Reações dos aliados</span>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <div className="flex items-center gap-2">
                <button onClick={() => setAllySuccesses((s) => Math.max(0, s - 1))} className="w-6 h-6 bg-green-900/40 rounded text-white text-xs">-</button>
                <span className="text-green-400 font-bold w-6">{allySuccesses}</span>
                <button onClick={() => setAllySuccesses((s) => s + 1)} className="w-6 h-6 bg-green-900/40 rounded text-white text-xs">+</button>
              </div>
              <span className="text-[9px] text-green-400/70">Sucessos</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2">
                <button onClick={() => setAllyFailures((f) => Math.max(0, f - 1))} className="w-6 h-6 bg-red-900/40 rounded text-white text-xs">-</button>
                <span className="text-red-400 font-bold w-6">{allyFailures}</span>
                <button onClick={() => setAllyFailures((f) => f + 1)} className="w-6 h-6 bg-red-900/40 rounded text-white text-xs">+</button>
              </div>
              <span className="text-[9px] text-red-400/70">Falhas</span>
            </div>
          </div>
          <p className="text-center text-sm text-gold font-bold">
            Bônus sugerido no líder: {allyBonus >= 0 ? `+${allyBonus}` : allyBonus}
          </p>
        </div>
      )}

      <button
        onClick={handleRoll}
        className="w-full py-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold font-rpg text-lg rounded shadow-lg transition-all hover:scale-[1.02] active:scale-95"
      >
        ROLAR {mode === 'reaction' ? 'REAÇÃO' : 'TESTE DO LÍDER'}
      </button>

      {lastResult && (
        <div className={`text-center p-4 rounded-lg border ${lastResult.isSuccess ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
          <p className="text-white/50 text-sm">
            {lastResult.hope} + {lastResult.fear} + {modifier}
            {mode === 'group' && (allyBonus >= 0 ? ` + ${allyBonus}` : ` ${allyBonus}`)} = {lastResult.total}
          </p>
          <p className={`text-2xl font-bold ${lastResult.isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult.isSuccess ? 'Sucesso' : 'Falha'}
          </p>
          <p className="text-xs text-white/40">vs CD {difficulty}</p>
        </div>
      )}
    </div>
  );
}
