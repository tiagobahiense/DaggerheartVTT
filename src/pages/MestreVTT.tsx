import { Eye, Lightning, HandPalm } from '@phosphor-icons/react';
import { FloatingButton } from '../components/UI/FloatingButton';

export default function MestreVTT() {
  return (
    <div className="h-screen w-screen bg-black relative">
       <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-rpg text-4xl">
         VISÃO DO MESTRE (MAPA)
       </div>

       {/* HUD do Mestre */}
       <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-40">
          <FloatingButton icon={<Eye size={32} />} label="Revelar Mapa" />
          <FloatingButton icon={<Lightning size={32} />} label="Dano em Área" />
          <FloatingButton icon={<HandPalm size={32} />} label="Controlar NPC" />
       </div>
    </div>
  );
}