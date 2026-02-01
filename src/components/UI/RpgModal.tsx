import { X } from '@phosphor-icons/react';
import React from 'react';

interface RpgModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const RpgModal = ({ isOpen, onClose, title, children }: RpgModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rpg-panel rounded-xl flex flex-col relative border-2 border-gold-dim shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b border-gold/30 bg-dungeon-stone/50">
          <h2 className="font-rpg text-2xl text-gold drop-shadow-md">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={32} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 text-parchment font-body">
          {children}
        </div>
      </div>
    </div>
  );
};