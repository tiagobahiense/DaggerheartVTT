import React, { useEffect, useRef, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { CaretUp, CaretDown, Clock, Minus, ArrowsOutSimple } from '@phosphor-icons/react';

interface TurnCounterProps {
  sessaoData: any;
  isMaster: boolean;
}

export default function TurnCounter({ sessaoData, isMaster }: TurnCounterProps) {
  const turnData = sessaoData?.turn_data || { visible: false, current: 1 };
  const lastValue = useRef(turnData.current);
  
  // Estado de Posição (Arrastável) - Inicializado no centro superior
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 120, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Estado de Minimização
  const [isMinimized, setIsMinimized] = useState(false);

  // --- LÓGICA DE SOM (BIP) E AUTO-ABERTURA ---
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.1;

      osc.start();
      setTimeout(() => {
          osc.stop();
          ctx.close();
      }, 150);
    } catch (e) {
      console.error("Erro ao tocar som", e);
    }
  };

  useEffect(() => {
    if (turnData.visible && turnData.current !== lastValue.current) {
        playBeep();
        // Se o turno mudar e estiver minimizado, abre automaticamente para o jogador
        if (isMinimized) setIsMinimized(false);
        lastValue.current = turnData.current;
    }
  }, [turnData.current, turnData.visible]);

  // --- LÓGICA DE ARRASTO ---
  const handleMouseDown = (e: React.MouseEvent) => {
      // Impede o arrasto se clicar nos botões de controle
      if ((e.target as HTMLElement).closest('button')) return;
      
      setIsDragging(true);
      dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
      };
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          setPosition({
              x: e.clientX - dragOffset.current.x,
              y: e.clientY - dragOffset.current.y
          });
      };
      const handleMouseUp = () => setIsDragging(false);

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging]);

  // Se não estiver visível (Mestre fechou), não renderiza nada
  if (!turnData.visible) return null;

  const handleUpdate = async (delta: number) => {
      if (!isMaster) return;
      const newValue = Math.min(999, Math.max(0, turnData.current + delta));
      await updateDoc(doc(db, "sessoes", sessaoData.id), {
          "turn_data.current": newValue,
          "turn_data.timestamp": Date.now()
      });
  };

  const formatNumber = (num: number) => {
      return num.toString().padStart(3, '0');
  };

  // --- RENDERIZAÇÃO MINIMIZADA ---
  if (isMinimized) {
      return (
          <div 
            style={{ left: position.x, top: position.y }}
            className="fixed z-[9999] bg-black/90 border border-red-500/50 rounded-full p-2 pr-4 flex items-center gap-3 cursor-move shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-scale-up hover:bg-white/10 transition-colors select-none"
            onMouseDown={handleMouseDown}
          >
              <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
                  <Clock size={20} weight="fill" className="animate-pulse" />
              </div>
              <span className="font-mono text-xl font-black text-red-100 tracking-widest leading-none mt-0.5">
                  {formatNumber(turnData.current)}
              </span>
              <button 
                onClick={() => setIsMinimized(false)} 
                className="text-white/30 hover:text-white transition-colors ml-2"
                title="Maximizar"
              >
                  <ArrowsOutSimple size={16} />
              </button>
          </div>
      );
  }

  // --- RENDERIZAÇÃO COMPLETA ---
  return (
    <div 
        style={{ left: position.x, top: position.y }}
        className="fixed z-[9999] animate-fade-in-down select-none"
        onMouseDown={handleMouseDown}
    >
        {/* Container Glassmorphism */}
        <div className="bg-black/85 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[200px] cursor-move relative group">
            
            {/* Header: Título + Botão Minimizar */}
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-2 mb-1 pl-1">
                <div className="text-[10px] uppercase text-white/50 tracking-[0.3em] font-bold flex items-center gap-2 pointer-events-none">
                    <Clock className="text-red-500" /> Turno Atual
                </div>
                <button 
                    onClick={() => setIsMinimized(true)}
                    className="text-white/20 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    title="Minimizar"
                >
                    <Minus size={14} weight="bold" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* Botão Menos (Só Mestre) */}
                {isMaster && (
                    <button 
                        onClick={() => handleUpdate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-900/30 rounded-full text-white/50 hover:text-white transition-colors border border-white/10 hover:border-red-500 active:scale-95"
                    >
                        <CaretDown size={24} weight="bold" />
                    </button>
                )}

                {/* DISPLAY DE RELÓGIO DE ACADEMIA */}
                <div className="relative bg-black px-6 py-2 rounded border border-white/10 shadow-inner pointer-events-none">
                    {/* Fundo "fantasma" 888 para dar efeito de display digital apagado */}
                    <span className="absolute left-6 top-2 font-mono text-6xl font-black tracking-widest text-[#220000] select-none z-0 opacity-50">
                        888
                    </span>
                    
                    {/* Número Real Aceso */}
                    <span className="relative z-10 font-mono text-6xl font-black tracking-widest text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] select-none">
                        {formatNumber(turnData.current)}
                    </span>
                </div>

                {/* Botão Mais (Só Mestre) */}
                {isMaster && (
                    <button 
                        onClick={() => handleUpdate(1)}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-green-900/30 rounded-full text-white/50 hover:text-white transition-colors border border-white/10 hover:border-green-500 active:scale-95"
                    >
                        <CaretUp size={24} weight="bold" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}