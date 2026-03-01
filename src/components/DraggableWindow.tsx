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

  const minPosClass = {
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-right': 'top-20 right-4',
      'top-left': 'top-20 left-4'
  }[minimizedPosition];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || isMaximized) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.userSelect = 'auto'; 
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging.current || isMaximized) return;
        e.preventDefault(); 
        setPosition({
            x: e.touches[0].clientX - dragOffset.current.x,
            y: e.touches[0].clientY - dragOffset.current.y
        });
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMaximized]);

  const startDrag = (e: React.MouseEvent) => {
      if (isMaximized) return;
      isDragging.current = true;
      dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
      };
      document.body.style.userSelect = 'none'; 
  };

  const startTouchDrag = (e: React.TouchEvent) => {
      if (isMaximized) return;
      isDragging.current = true;
      dragOffset.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
      };
  };

  if (isMinimized) {
      return (
          // Reduzido para z-[45] para ficar abaixo do botão de dado
          <div 
            className={`fixed ${minPosClass} z-[45] bg-[#1a120b] border border-gold/50 rounded-lg shadow-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors animate-scale-up`}
            onClick={() => setIsMinimized(false)}
          >
              <div className="text-gold">{headerIcon}</div>
              <span className="text-white font-bold text-sm max-w-[150px] truncate">{title}</span>
              <ArrowsOutSimple size={16} className="text-white/50" />
          </div>
      );
  }

  return (
      // Reduzido para z-[45]
      <div 
        ref={windowRef}
        className="fixed z-[45] bg-[#1a120b] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-w-[100vw] max-h-[100dvh]"
        style={isMaximized ? { inset: 0, width: '100%', height: '100%' } : { left: Math.max(0, position.x), top: Math.max(0, position.y), width: size.w, height: size.h }}
      >
        <div 
            className="bg-black/80 p-3 border-b border-white/10 flex justify-between items-center cursor-move select-none touch-none"
            onMouseDown={startDrag}
            onTouchStart={startTouchDrag}
            onDoubleClick={() => setIsMaximized(!isMaximized)}
        >
            <div className="flex items-center gap-3 pointer-events-none">
                <div className="text-gold">{headerIcon}</div>
                <h3 className="text-white font-rpg font-bold tracking-wide">{title}</h3>
            </div>
            
            <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                <button onClick={() => setIsMinimized(true)} className="p-1 text-white/50 hover:text-white rounded hover:bg-white/5 transition-colors">
                   <Minus size={20} />
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 text-white/50 hover:text-white rounded hover:bg-white/5 transition-colors">
                   {isMaximized ? <ArrowsInSimple size={20} /> : <ArrowsOutSimple size={20} />}
                </button>
                {onClose && (
                    <button onClick={onClose} className="p-1 text-white/50 hover:text-red-400 rounded hover:bg-white/5 transition-colors">
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
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 touch-none"
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