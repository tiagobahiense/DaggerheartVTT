import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, ArrowsOutSimple, ArrowsInSimple } from '@phosphor-icons/react';

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  initialWidth?: string;
  initialHeight?: string;
  headerIcon?: React.ReactNode;
  minimizedPosition?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
}

export default function DraggableWindow({ 
    title, children, onClose, 
    initialWidth = "95vw", initialHeight = "85vh", 
    headerIcon, minimizedPosition = 'top-right' 
}: DraggableWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });
  
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Define posição do botão minimizado
  const minPosClass = {
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-left': 'top-20 left-4',
      'top-right': 'top-24 right-4'
  }[minimizedPosition];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      requestAnimationFrame(() => {
        let newY = e.clientY - dragOffset.current.y;
        let newX = e.clientX - dragOffset.current.x;

        // Proteção de borda superior
        if (newY < 0) newY = 0;

        setPosition({ x: newX, y: newY });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging.current && e.clientY < 5) {
          setIsMaximized(true);
      }
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (isMinimized) {
    return (
      <div 
        className={`fixed z-[5000] bg-[#1a120b] border border-gold/50 rounded-lg shadow-[0_0_15px_black] p-3 flex items-center gap-3 animate-fade-in cursor-pointer hover:bg-white/10 transition-colors group ${minPosClass}`} 
        onClick={() => setIsMinimized(false)}
      >
        <span className="text-gold group-hover:scale-110 transition-transform">{headerIcon}</span>
        <span className="text-white font-bold font-rpg text-sm">{title}</span>
        <ArrowsOutSimple size={16} className="text-white/50" />
      </div>
    );
  }

  return (
    <div 
        ref={windowRef}
        className={`fixed flex flex-col bg-[#0f0b15] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-100 ease-out
            ${isMaximized ? 'inset-0 rounded-none z-[4000]' : 'rounded-xl z-[900]'}
        `}
        style={!isMaximized ? { 
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            width: size.w, 
            height: size.h,
        } : {}}
    >
      <div 
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setIsMaximized(!isMaximized)}
        className={`h-12 bg-gradient-to-r from-[#1a120b] via-black to-[#1a120b] border-b border-white/10 flex justify-between items-center px-4 select-none
            ${isMaximized ? '' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        <div className="flex items-center gap-3 text-gold font-rpg font-bold text-lg pointer-events-none">
            {headerIcon}
            <span className="drop-shadow-md">{title}</span>
        </div>
        
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={() => setIsMinimized(true)} className="text-white/40 hover:text-gold p-2 rounded hover:bg-white/5 transition-colors">
                <Minus size={20} />
            </button>
            <button onClick={() => setIsMaximized(!isMaximized)} className="text-white/40 hover:text-blue-400 p-2 rounded hover:bg-white/5 transition-colors">
                {isMaximized ? <ArrowsInSimple size={20} /> : <ArrowsOutSimple size={20} />}
            </button>
            {onClose && (
                <button onClick={onClose} className="text-white/40 hover:text-red-400 p-2 rounded hover:bg-white/5 transition-colors">
                   <X size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#050505] flex items-center justify-center">
        {children}
      </div>

      {!isMaximized && (
        <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50"
            style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, gold 50%)', opacity: 0.5 }}
            onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startW = windowRef.current?.offsetWidth || 800;
                const startH = windowRef.current?.offsetHeight || 600;

                const onMove = (mv: MouseEvent) => {
                    setSize({
                        w: `${Math.max(300, startW + (mv.clientX - startX))}px`,
                        h: `${Math.max(200, startH + (mv.clientY - startY))}px`
                    });
                };
                const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            }}
        />
      )}
    </div>
  );
}