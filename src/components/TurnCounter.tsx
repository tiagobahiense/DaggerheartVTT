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
  
  // Posicionamento inicial inteligente: Centro no Desktop, Canto Direito no Mobile
  const [position, setPosition] = useState({ 
      x: window.innerWidth > 768 ? window.innerWidth / 2 - 120 : window.innerWidth - 180, 
      y: window.innerWidth > 768 ? 50 : 100 
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false);

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
        if (isMinimized) setIsMinimized(false);
        lastValue.current = turnData.current;
    }
  }, [turnData.current, turnData.visible]);

  // --- EVENTOS DE MOUSE ---
  const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      setIsDragging(true);
      dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
      };
  };

  // --- EVENTOS DE TOQUE (MOBILE) ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      setIsDragging(true);
      dragOffset.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
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

      const handleTouchMove = (e: TouchEvent) => {
          if (!isDragging) return;
          e.preventDefault(); 
          setPosition({
              x: e.touches[0].clientX - dragOffset.current.x,
              y: e.touches[0].clientY - dragOffset.current.y
          });
      };
      const handleTouchEnd = () => setIsDragging(false);

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
          window.addEventListener('touchmove', handleTouchMove, { passive: false });
          window.addEventListener('touchend', handleTouchEnd);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchmove', handleTouchMove);
          window.removeEventListener('touchend', handleTouchEnd);
      };
  }, [isDragging]);

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

  if (isMinimized) {
      return (
          <div 
            style={{ left: position.x, top: position.y }}
            className="fixed z-[45] bg-black/90 border border-red-500/50 rounded-full p-2 pr-4 flex items-center gap-3 cursor-move shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-scale-up hover:bg-white/10 transition-colors select-none scale-75 md:scale-100 origin-top-right md:origin-top"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
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

  return (
    <div 
        style={{ left: position.x, top: position.y }}
        className="fixed z-[45] animate-fade-in-down select-none scale-75 md:scale-100 origin-top-right md:origin-top"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
    >
        <div className="bg-black/85 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[200px] cursor-move relative group">
            
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
                {isMaster && (
                    <button 
                        onClick={() => handleUpdate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-900/30 rounded-full text-white/50 hover:text-white transition-colors border border-white/10 hover:border-red-500 active:scale-95"
                    >
                        <CaretDown size={24} weight="bold" />
                    </button>
                )}

                <div className="relative bg-black px-6 py-2 rounded border border-white/10 shadow-inner pointer-events-none">
                    <span className="absolute left-6 top-2 font-mono text-6xl font-black tracking-widest text-[#220000] select-none z-0 opacity-50">
                        888
                    </span>
                    <span className="relative z-10 font-mono text-6xl font-black tracking-widest text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] select-none">
                        {formatNumber(turnData.current)}
                    </span>
                </div>

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