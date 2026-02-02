import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
// CORREÇÃO: Mudamos ProjectionScreen para ProjectorScreen
import { X, Image, ProjectorScreen, Minus, EyeSlash } from '@phosphor-icons/react';

export default function SceneryViewer({ sessaoData, isMaster, showManager, onCloseManager }: any) {
  const [activeScenery, setActiveScenery] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false); // Só afeta o Mestre localmente
  
  // Estados do Gerenciador
  const [sceneryList, setSceneryList] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (sessaoData) {
      setActiveScenery(sessaoData.active_scenery || null);
      if (isMaster) {
        setSceneryList(sessaoData.cenarios || []); // Lista pré-salva
      }
    }
  }, [sessaoData]);

  // Se o cenário mudar externamente, restaura a visão
  useEffect(() => {
    if (activeScenery) setIsMinimized(false);
  }, [activeScenery?.url]);

  const handleProject = async (url: string, name: string) => {
    const sessaoRef = doc(db, "sessoes", sessaoData.id);
    await updateDoc(sessaoRef, { 
        active_scenery: { url, name, timestamp: Date.now() } 
    });
    if (onCloseManager) onCloseManager();
  };

  const handleCloseScenery = async () => {
      const sessaoRef = doc(db, "sessoes", sessaoData.id);
      await updateDoc(sessaoRef, { active_scenery: null });
  };

  // Se não tem cenário ativo e não é mestre gerenciando, não renderiza nada
  if (!activeScenery && !showManager) return null;

  return (
    <div className="w-full h-full pointer-events-auto">
      
      {/* VISUALIZAÇÃO (O que todos veem) */}
      {activeScenery && (
        <div className={`
            transition-all duration-500 ease-in-out
            ${isMinimized && isMaster 
                ? 'absolute top-4 left-4 w-64 h-36 border-2 border-gold rounded-lg z-[60] overflow-hidden shadow-2xl bg-black' 
                : 'absolute inset-0 z-10 bg-black'
            }
        `}>
            {/* Imagem com efeito Ken Burns suave */}
            <img 
                src={activeScenery.url} 
                className={`w-full h-full object-cover opacity-90 ${!isMinimized && 'animate-[kenBurns_60s_infinite_alternate]'}`} 
            />
            
            {/* Overlay Cinemático */}
            {!isMinimized && (
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-60"></div>
            )}

            {/* Título (Só aparece na versão full) */}
            {!isMinimized && (
                <div className="absolute top-[10%] w-full text-center">
                    <h2 className="font-rpg text-6xl text-gold uppercase tracking-[0.5em] drop-shadow-[0_4px_10px_rgba(0,0,0,1)] opacity-80 animate-fade-in-down">
                        {activeScenery.name}
                    </h2>
                </div>
            )}

            {/* CONTROLES LOCAIS DO CENÁRIO (Só aparecem pro Mestre ao passar o mouse) */}
            {isMaster && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/50 p-1 rounded backdrop-blur">
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 text-white hover:text-gold"
                        title={isMinimized ? "Maximizar" : "Minimizar (Ver Mapa)"}
                    >
                        {isMinimized ? <ProjectorScreen size={20} /> : <Minus size={20} />}
                    </button>
                    <button 
                        onClick={handleCloseScenery}
                        className="p-2 text-white hover:text-red-500"
                        title="Parar Projeção (Para Todos)"
                    >
                        <EyeSlash size={20} />
                    </button>
                </div>
            )}
        </div>
      )}

      {/* GERENCIADOR (Modal do Mestre) */}
      {isMaster && showManager && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-[#1a120b] border border-gold/30 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                    <h3 className="font-rpg text-xl text-gold flex items-center gap-2"><Image /> Projetor de Ambientes</h3>
                    <button onClick={onCloseManager} className="text-white/50 hover:text-red-400"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 custom-scrollbar">
                    {/* Input de URL Custom */}
                    <div className="col-span-full flex gap-2 mb-4 border-b border-white/10 pb-4">
                        <input 
                            type="text" 
                            placeholder="Cole uma URL de imagem..." 
                            className="flex-1 bg-black/50 border border-white/20 p-3 rounded text-white focus:border-gold outline-none"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <button 
                            onClick={() => handleProject(customUrl, "Personalizado")}
                            className="px-6 bg-gold text-black font-bold font-rpg rounded hover:bg-yellow-400"
                        >
                            PROJETAR
                        </button>
                    </div>

                    {/* Lista Pré-definida */}
                    {sceneryList.map((sc, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleProject(typeof sc === 'string' ? sc : (sc as any).url, "Cenário " + (i+1))}
                            className="group relative aspect-video bg-black rounded border border-white/10 cursor-pointer overflow-hidden hover:border-gold transition-all"
                        >
                            <img src={typeof sc === 'string' ? sc : (sc as any).url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                <ProjectorScreen size={32} className="text-gold" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes kenBurns { 
            0% { transform: scale(1.0) translate(0,0); } 
            100% { transform: scale(1.1) translate(-2%, -2%); } 
        }
      `}</style>
    </div>
  );
}