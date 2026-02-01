import { useState } from 'react';
import { Dna, Sword, Shield, X, Check, Sparkle, Skull, Coins } from '@phosphor-icons/react';

// Tipos de Resultado Daggerheart
type RollOutcome = 
  | 'CRITICAL'    // 5,5 (Sucesso Crítico)
  | 'HOPE'        // Esperança > Medo
  | 'FEAR';       // Medo > Esperança

interface RollResult {
  hopeDie: number;
  fearDie: number;
  modifier: number;
  total: number;
  outcome: RollOutcome;
  isSuccess: boolean; // Comparado com a dificuldade (se fornecida)
}

export default function DiceSystem({ attributeValue = 0, onClose }: { attributeValue?: number, onClose: () => void }) {
  const [modifier, setModifier] = useState(attributeValue);
  const [difficulty, setDifficulty] = useState<number>(12); // Dificuldade padrão média
  const [result, setResult] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Estados de Vantagem (d6)
  const [advantage, setAdvantage] = useState<'none' | 'advantage' | 'disadvantage'>('none');

  const rollDaggerheart = () => {
    setIsRolling(true);
    setResult(null);

    // Simula tempo de rolagem
    setTimeout(() => {
      const hope = Math.floor(Math.random() * 12) + 1;
      const fear = Math.floor(Math.random() * 12) + 1;
      
      // Lógica de Vantagem/Desvantagem (d6)
      let advRoll = 0;
      if (advantage !== 'none') {
        advRoll = Math.floor(Math.random() * 6) + 1;
      }
      const finalAdvMod = advantage === 'advantage' ? advRoll : advantage === 'disadvantage' ? -advRoll : 0;

      const total = hope + fear + modifier + finalAdvMod;

      // Determina Narrativa
      let outcome: RollOutcome = 'FEAR';
      if (hope === fear) outcome = 'CRITICAL';
      else if (hope > fear) outcome = 'HOPE';
      else outcome = 'FEAR'; // fear > hope

      setResult({
        hopeDie: hope,
        fearDie: fear,
        modifier: modifier + finalAdvMod,
        total,
        outcome,
        isSuccess: total >= difficulty
      });
      setIsRolling(false);
    }, 800); // 800ms de suspense
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#1a1520] border border-gold/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-rpg text-gold flex items-center gap-2">
            <Dna size={28} /> Teste de Dualidade
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-red-400"><X size={24} /></button>
        </div>

        {/* --- ÁREA DE CONFIGURAÇÃO (SÓ APARECE SE NÃO TIVER RESULTADO) --- */}
        {!result && !isRolling && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. Modificadores */}
            <div className="flex justify-between gap-4">
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Modificador</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setModifier(m => m - 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">-</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                  <button onClick={() => setModifier(m => m + 1)} className="w-8 h-8 bg-black hover:bg-white/10 rounded border border-white/20 text-white">+</button>
                </div>
              </div>
              
              <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                <label className="text-xs uppercase text-white/50 mb-1 block">Dificuldade</label>
                <input 
                  type="number" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full bg-transparent text-xl font-bold text-white text-center outline-none border-b border-white/20 focus:border-gold"
                />
              </div>
            </div>

            {/* 2. Vantagem / Desvantagem */}
            <div className="flex gap-2">
              <button 
                onClick={() => setAdvantage(v => v === 'advantage' ? 'none' : 'advantage')}
                className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${advantage === 'advantage' ? 'bg-green-900/50 border-green-500 text-green-100' : 'bg-black/40 border-white/10 text-white/40'}`}
              >
                Vantagem (+d6)
              </button>
              <button 
                onClick={() => setAdvantage(v => v === 'disadvantage' ? 'none' : 'disadvantage')}
                className={`flex-1 py-2 rounded border transition-all text-xs font-bold uppercase ${advantage === 'disadvantage' ? 'bg-red-900/50 border-red-500 text-red-100' : 'bg-black/40 border-white/10 text-white/40'}`}
              >
                Desvantagem (-d6)
              </button>
            </div>

            {/* BOTÃO ROLAR */}
            <button 
              onClick={rollDaggerheart}
              className="w-full py-4 bg-gradient-to-r from-gold/80 to-yellow-600/80 hover:from-gold hover:to-yellow-500 text-black font-bold font-rpg text-xl rounded shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Dna size={24} weight="fill" /> ROLAR DUALIDADE
            </button>
          </div>
        )}

        {/* --- ANIMAÇÃO DE ROLAGEM --- */}
        {isRolling && (
          <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="flex gap-8">
                <div className="w-20 h-20 bg-gold/20 rounded-xl border-2 border-gold animate-spin"></div>
                <div className="w-20 h-20 bg-purple-900/20 rounded-xl border-2 border-purple-500 animate-spin flex-col-reverse"></div>
            </div>
            <p className="text-gold font-rpg tracking-widest text-lg">O DESTINO GIRA...</p>
          </div>
        )}

        {/* --- RESULTADO FINAL --- */}
        {result && !isRolling && (
          <div className="text-center animate-fade-in-up">
            
            {/* Visual dos Dados */}
            <div className="flex justify-center items-center gap-6 mb-6">
              {/* Dado de Esperança */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-gold to-yellow-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] border border-white/20">
                   <span className="text-5xl font-bold text-white drop-shadow-md">{result.hopeDie}</span>
                   <span className="absolute -top-3 bg-black/80 text-[10px] text-gold px-2 py-0.5 rounded border border-gold/30 uppercase tracking-widest">Esperança</span>
                </div>
              </div>

              <div className="text-2xl font-bold text-white/20">+</div>

              {/* Dado de Medo */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] border border-white/20">
                   <span className="text-5xl font-bold text-purple-100 drop-shadow-md">{result.fearDie}</span>
                   <span className="absolute -top-3 bg-black/80 text-[10px] text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest">Medo</span>
                </div>
              </div>
            </div>

            {/* Cálculo Total */}
            <div className="mb-6">
                <div className="text-white/50 text-sm mb-1">
                   {result.hopeDie} (Esp) + {result.fearDie} (Medo) + {result.modifier} (Mod) = 
                </div>
                <div className={`text-6xl font-rpg font-bold drop-shadow-lg ${result.isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {result.total}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">
                    vs Dificuldade {difficulty}
                </div>
            </div>

            {/* Sentença Narrativa (O CORAÇÃO DO SISTEMA) */}
            <div className={`p-4 rounded-lg border-2 mb-6 ${
                result.outcome === 'CRITICAL' ? 'bg-gold/10 border-gold text-gold' :
                result.outcome === 'HOPE' ? 'bg-blue-900/20 border-blue-400 text-blue-200' :
                'bg-purple-900/20 border-purple-500 text-purple-200'
            }`}>
                <h3 className="text-xl font-bold uppercase flex items-center justify-center gap-2">
                    {result.outcome === 'CRITICAL' && <Sparkle size={24} weight="fill" />}
                    {result.outcome === 'HOPE' && <Coins size={24} weight="fill" />}
                    {result.outcome === 'FEAR' && <Skull size={24} weight="fill" />}
                    
                    {result.isSuccess ? "Sucesso" : "Falha"} com 
                    
                    {result.outcome === 'CRITICAL' ? " CRÍTICO!" : result.outcome === 'HOPE' ? " ESPERANÇA" : " MEDO"}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                    {result.outcome === 'CRITICAL' && "Ganhe 1 Esperança E Limpe 1 Estresse (ou cause dano max)."}
                    {result.outcome === 'HOPE' && "Ganhe 1 Esperança. Você consegue o que queria."}
                    {result.outcome === 'FEAR' && "O Mestre ganha 1 Medo. Prepare-se para consequências."}
                </p>
            </div>

            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white underline text-sm">Rolar Novamente</button>
          </div>
        )}

      </div>
    </div>
  );
}