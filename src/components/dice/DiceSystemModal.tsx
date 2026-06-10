import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { X, Dna, Cube, Skull, Sparkle, Coins } from '@phosphor-icons/react';
import { db } from '../../lib/firebase';
import {
  computeDualityOutcome,
  rollDualityPair,
  rollStandardDice,
} from '../../lib/diceRollHelpers';
import { DamageRollPanel } from './DamageRollPanel';
import { GroupTestPanel } from './GroupTestPanel';
import { warmUpDiceBox } from '../../stores/diceRollStore';

interface DualityResult {
  type: 'DUALITY';
  hopeDie: number;
  fearDie: number;
  modifier: number;
  total: number;
  outcome: 'CRITICAL' | 'HOPE' | 'FEAR';
  isSuccess: boolean;
}

interface StandardResult {
  type: 'STANDARD';
  rolls: number[];
  dieType: number;
  modifier: number;
  total: number;
}

type RollResult = DualityResult | StandardResult;

interface DiceSystemModalProps {
  playerName: string;
  character?: {
    proficiency?: number;
    weapons?: { main?: { damageType?: string } };
  };
  onClose: () => void;
  overlayClassName?: string;
}

export function DiceSystemModal({
  playerName,
  character,
  onClose,
  overlayClassName = 'z-[200]',
}: DiceSystemModalProps) {
  const [tab, setTab] = useState<'DUALITY' | 'STANDARD' | 'DAMAGE' | 'GROUP'>('DUALITY');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  const [modifier, setModifier] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(12);
  const [advantage, setAdvantage] = useState<'none' | 'advantage' | 'disadvantage'>('none');

  const [selectedDie, setSelectedDie] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [standardMod, setStandardMod] = useState(0);

  useEffect(() => {
    warmUpDiceBox();
  }, []);

  const pushRollToFirebase = async (rollResult: unknown, type: string) => {
    try {
      await addDoc(collection(db, 'rolls'), {
        playerName,
        type,
        result: rollResult,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao enviar rolagem:', error);
    }
  };

  const rollDuality = async () => {
    setIsRolling(true);
    setResult(null);

    try {
      const { hope, fear, advRoll } = await rollDualityPair(advantage);
      const finalAdvMod =
        advantage === 'advantage' ? advRoll : advantage === 'disadvantage' ? -advRoll : 0;
      const total = hope + fear + modifier + finalAdvMod;
      const outcome = computeDualityOutcome(hope, fear);

      const finalResult: DualityResult = {
        type: 'DUALITY',
        hopeDie: hope,
        fearDie: fear,
        modifier: modifier + finalAdvMod,
        total,
        outcome,
        isSuccess: total >= difficulty,
      };

      setResult(finalResult);
      await pushRollToFirebase(finalResult, 'DUALITY');
    } catch (error) {
      console.error('Erro na rolagem de dualidade:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const rollStandard = async () => {
    setIsRolling(true);
    setResult(null);

    try {
      const rolls = await rollStandardDice(diceCount, selectedDie);
      const sum = rolls.reduce((a, b) => a + b, 0);

      const finalResult: StandardResult = {
        type: 'STANDARD',
        rolls,
        dieType: selectedDie,
        modifier: standardMod,
        total: sum + standardMod,
      };

      setResult(finalResult);
      await pushRollToFirebase(finalResult, 'STANDARD');
    } catch (error) {
      console.error('Erro na rolagem padrão:', error);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${overlayClassName} flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in`}
      onClick={onClose}
    >
      <div
        className="bg-[#1a1520] border border-gold/30 w-full max-w-lg md:max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto custom-scrollbar"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-1 flex-wrap">
            {(['DUALITY', 'STANDARD', 'DAMAGE', 'GROUP'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setResult(null);
                }}
                className={`text-xs font-rpg font-bold px-2 py-1 rounded transition-colors ${
                  tab === t ? 'text-gold bg-white/10' : 'text-white/30 hover:text-white'
                }`}
              >
                {t === 'DUALITY'
                  ? 'Dualidade'
                  : t === 'STANDARD'
                    ? 'Padrão'
                    : t === 'DAMAGE'
                      ? 'Dano'
                      : 'Grupo'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-red-400">
            <X size={24} />
          </button>
        </div>

        {tab === 'DUALITY' && !isRolling && !result && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between gap-4">
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => setModifier((m) => m - 1)}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white w-8 text-center">
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button
                    onClick={() => setModifier((m) => m + 1)}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Dificuldade</label>
                <input
                  type="number"
                  value={difficulty}
                  onChange={(event) => setDifficulty(Number(event.target.value))}
                  className="w-full bg-transparent text-xl font-bold text-white text-center outline-none border-b border-white/20 focus:border-gold"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setAdvantage((value) => (value === 'advantage' ? 'none' : 'advantage'))
                }
                className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${
                  advantage === 'advantage'
                    ? 'bg-green-900/50 border-green-500 text-green-100'
                    : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                Vantagem (+d6)
              </button>
              <button
                onClick={() =>
                  setAdvantage((value) => (value === 'disadvantage' ? 'none' : 'disadvantage'))
                }
                className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${
                  advantage === 'disadvantage'
                    ? 'bg-red-900/50 border-red-500 text-red-100'
                    : 'bg-black/40 border-white/10 text-white/40'
                }`}
              >
                Desvantagem (-d6)
              </button>
            </div>

            <button
              onClick={rollDuality}
              className="w-full py-4 bg-gradient-to-r from-gold/80 to-yellow-600/80 hover:from-gold hover:to-yellow-500 text-black font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Dna size={24} weight="fill" /> ROLAR DUALIDADE
            </button>
          </div>
        )}

        {tab === 'DAMAGE' && (
          <DamageRollPanel
            defaultProficiency={character?.proficiency || 1}
            defaultDamageStr={character?.weapons?.main?.damageType || 'd6'}
            onRoll={(rollResult) => pushRollToFirebase(rollResult, 'DAMAGE')}
          />
        )}

        {tab === 'GROUP' && (
          <GroupTestPanel onRoll={(rollResult) => pushRollToFirebase(rollResult, rollResult.type)} />
        )}

        {tab === 'STANDARD' && !isRolling && !result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 10, 12, 20, 100].map((die) => (
                <button
                  key={die}
                  onClick={() => setSelectedDie(die)}
                  className={`py-2 rounded border text-sm font-bold ${
                    selectedDie === die
                      ? 'bg-purple-900 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  d{die}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Quantidade</label>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => setDiceCount((count) => Math.max(1, count - 1))}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white w-8 text-center">{diceCount}</span>
                  <button
                    onClick={() => setDiceCount((count) => count + 1)}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => setStandardMod((mod) => mod - 1)}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white w-8 text-center">
                    {standardMod >= 0 ? `+${standardMod}` : standardMod}
                  </span>
                  <button
                    onClick={() => setStandardMod((mod) => mod + 1)}
                    className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={rollStandard}
              className="w-full py-4 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Cube size={24} weight="fill" /> ROLAR DADOS
            </button>
          </div>
        )}

        {result?.type === 'DUALITY' && !isRolling && (
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-gold to-yellow-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/20 transform hover:scale-110 transition-transform">
                  <span className="text-5xl font-bold text-white drop-shadow-md">{result.hopeDie}</span>
                  <span className="absolute -top-3 bg-black/80 text-[10px] text-gold px-2 py-0.5 rounded border border-gold/30 uppercase tracking-widest">
                    Esperança
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white/20">+</div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] border border-white/20 transform hover:scale-110 transition-transform">
                  <span className="text-5xl font-bold text-purple-100 drop-shadow-md">{result.fearDie}</span>
                  <span className="absolute -top-3 bg-black/80 text-[10px] text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest">
                    Medo
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-white/50 text-sm mb-1">
                {result.hopeDie} (Esp) + {result.fearDie} (Medo) + {result.modifier} (Mod) ={' '}
              </div>
              <div
                className={`text-6xl font-rpg font-bold drop-shadow-lg ${
                  result.isSuccess ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.total}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">
                vs Dificuldade {difficulty}
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 mb-6 ${
                result.outcome === 'CRITICAL'
                  ? 'bg-gold/10 border-gold text-gold'
                  : result.outcome === 'HOPE'
                    ? 'bg-blue-900/20 border-blue-400 text-blue-200'
                    : 'bg-purple-900/20 border-purple-500 text-purple-200'
              }`}
            >
              <h3 className="text-xl font-bold uppercase flex items-center justify-center gap-2">
                {result.outcome === 'CRITICAL' && <Sparkle size={24} weight="fill" />}
                {result.outcome === 'HOPE' && <Coins size={24} weight="fill" />}
                {result.outcome === 'FEAR' && <Skull size={24} weight="fill" />}
                {result.isSuccess ? 'Sucesso' : 'Falha'} com{' '}
                {result.outcome === 'CRITICAL'
                  ? ' CRÍTICO!'
                  : result.outcome === 'HOPE'
                    ? ' ESPERANÇA'
                    : ' MEDO'}
              </h3>
              <p className="text-sm opacity-80 mt-1">
                {result.outcome === 'CRITICAL' && 'Ganhe 1 Esperança E Limpe 1 Estresse.'}
                {result.outcome === 'HOPE' && 'Ganhe 1 Esperança. Você consegue.'}
                {result.outcome === 'FEAR' && 'O Mestre ganha 1 Medo. Prepare-se.'}
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-white/40 hover:text-white underline text-sm"
            >
              Rolar Novamente
            </button>
          </div>
        )}

        {result?.type === 'STANDARD' && !isRolling && (
          <div className="text-center animate-fade-in-up">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {result.rolls.map((value, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <span className="text-2xl font-bold text-white">{value}</span>
                  <span className="absolute -bottom-2 text-[8px] bg-black px-1 rounded text-white/50">
                    d{result.dieType}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="text-white/50 text-sm mb-1">
                [{result.rolls.join(' + ')}]{' '}
                {result.modifier >= 0 ? `+ ${result.modifier}` : result.modifier} (Mod) =
              </div>
              <div className="text-6xl font-rpg font-bold text-white drop-shadow-lg">
                {result.total}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-white/40 hover:text-white underline text-sm"
            >
              Rolar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
