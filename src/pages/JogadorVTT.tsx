import { useState } from 'react';
import { Scroll, Backpack, DiceFive, Sword } from '@phosphor-icons/react';
import { RpgModal } from '../components/UI/RpgModal';
import { SheetModal } from '../components/CharacterSheet/SheetModal'; 
import { FloatingButton } from '../components/UI/FloatingButton';
import { ICharacterSheet } from '../types';

// Mock temporário para evitar erro enquanto não puxa do Firebase
const fakeChar: ICharacterSheet = { 
    id: '1', playerId: '123', name: 'Sanchez', pronouns: 'Ele/Dele', 
    class: 'bardo', subclass: '', level: 1, 
    attributes: { agility: {value:0, modifier:0}, strength: {value:0, modifier:0}, finesse: {value:0, modifier:0}, instinct: {value:0, modifier:0}, presence: {value:0, modifier:0}, knowledge: {value:0, modifier:0} },
    evasion: 10, armor: 0, armorSlots: 6, currentArmor: 0, damageThresholds: {minor:0, major:0, severe:0}, currentHp: 0, markedDamage: 0, hope: 2, fear: 0, weapons: [], gold: 0, inventory: [], classFeatures: [], notes: '' 
};

export default function JogadorVTT() {
  const [modalOpen, setModalOpen] = useState<'ficha' | 'inventario' | 'dados' | null>(null);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      
      {/* 1. O Mapa/Tabuleiro (Fundo) */}
      <div className="absolute inset-0 z-0">
         <div className="w-full h-full bg-[url('/mapa-exemplo.jpg')] bg-cover opacity-50 flex items-center justify-center">
            <h1 className="text-white font-rpg text-4xl opacity-30">MAPA AQUI</h1>
         </div>
      </div>

      {/* 2. Menu Flutuante (HUD) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-40">
        <FloatingButton icon={<Scroll size={32} />} label="Ficha" onClick={() => setModalOpen('ficha')} />
        <FloatingButton icon={<Backpack size={32} />} label="Inventário" onClick={() => setModalOpen('inventario')} />
        <FloatingButton icon={<DiceFive size={32} />} label="Dados" onClick={() => setModalOpen('dados')} />
        <FloatingButton icon={<Sword size={32} />} label="Combate" onClick={() => console.log("Iniciativa!")} />
      </div>

      {/* 3. Modais */}
      <SheetModal 
        isOpen={modalOpen === 'ficha'} 
        onClose={() => setModalOpen(null)} 
        character={fakeChar} 
      />

      <RpgModal isOpen={modalOpen === 'inventario'} onClose={() => setModalOpen(null)} title="Mochila do Aventureiro">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-24 bg-dungeon-stone border border-gray-600 rounded flex items-center justify-center hover:border-gold cursor-pointer">
              Item {i}
            </div>
          ))}
        </div>
      </RpgModal>

      <RpgModal isOpen={modalOpen === 'dados'} onClose={() => setModalOpen(null)} title="Rolagem de Dados">
        <div className="text-center p-10">
          <p>Seletor de Dados 2d12 aqui...</p>
        </div>
      </RpgModal>

    </div>
  );
}