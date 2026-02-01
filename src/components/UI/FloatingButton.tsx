import React from 'react';

interface FloatingButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export const FloatingButton = ({ icon, label, onClick }: FloatingButtonProps) => (
  <div className="group relative flex flex-col items-center gap-2">
    <button 
      onClick={onClick}
      className="w-16 h-16 rounded-full bg-dungeon-stone border-2 border-gold text-gold 
                 shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-110 hover:shadow-[0_0_25px_#d4af37] 
                 transition-all duration-300 flex items-center justify-center z-10"
    >
      {icon}
    </button>
    <span className="absolute -top-10 bg-black/80 text-gold text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-rpg">
      {label}
    </span>
  </div>
);