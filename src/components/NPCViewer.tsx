import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { X, Image, Eye, EyeSlash, Trash, FloppyDisk } from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';

interface SceneryData {
    url: string;
    type: 'SCENERY' | 'NPC';
    name: string;
    description?: string;
    visible: boolean;
}

export default function NPCViewer({ sessaoData, isMaster, showManager, onCloseManager }: any) {
  // Agora gerenciamos dois estados separados para permitir sobreposição
  const [activeScenery, setActiveScenery] = useState<SceneryData | null>(null);
  const [activeNPC, setActiveNPC] = useState<SceneryData | null>(null);
  
  const [tab, setTab] = useState<'SCENERY' | 'NPC'>('SCENERY');
  
  // Inputs Formulário
  const [inputUrl, setInputUrl] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputDesc, setInputDesc] = useState("");

  const [savedSceneries, setSavedSceneries] = useState<SceneryData[]>([]);
  const [savedNPCs, setSavedNPCs] = useState<SceneryData[]>([]);

  useEffect(() => {
    if (sessaoData) {
      // Carrega estados separados do banco
      setActiveScenery(sessaoData.active_scenery || null);
      setActiveNPC(sessaoData.active_npc || null);
      
      setSavedSceneries(sessaoData.saved_sceneries || []);
      setSavedNPCs(sessaoData.saved_npcs || []);
    }
  }, [sessaoData]);

  const handleProject = async (item: SceneryData) => {
      const content = { ...item, visible: true, timestamp: Date.now() };
      // Grava em campos separados dependendo do tipo
      if (item.type === 'SCENERY') {
          await updateDoc(doc(db, "sessoes", sessaoData.id), { active_scenery: content });
      } else {
          await updateDoc(doc(db, "sessoes", sessaoData.id), { active_npc: content });
      }
  };

  const handleStopProjection = async (type: 'SCENERY' | 'NPC') => {
      if (type === 'SCENERY') {
          await updateDoc(doc(db, "sessoes", sessaoData.id), { active_scenery: null });
      } else {
          await updateDoc(doc(db, "sessoes", sessaoData.id), { active_npc: null });
      }
  };

  const handleSaveItem = async () => {
      if (!inputUrl || !inputName) return alert("Preencha URL e Nome");
      const newItem: SceneryData = {
          url: inputUrl, name: inputName, description: inputDesc, type: tab, visible: true
      };
      const field = tab === 'SCENERY' ? 'saved_sceneries' : 'saved_npcs';
      await updateDoc(doc(db, "sessoes", sessaoData.id), { [field]: arrayUnion(newItem) });
      setInputUrl(""); setInputName(""); setInputDesc("");
  };

  const handleDeleteItem = async (item: SceneryData, type: 'SCENERY' | 'NPC') => {
      if(!confirm("Deletar item?")) return;
      const field = type === 'SCENERY' ? 'saved_sceneries' : 'saved_npcs';
      await updateDoc(doc(db, "sessoes", sessaoData.id), { [field]: arrayRemove(item) });
  };

  // --- RENDERIZADORES INDIVIDUAIS ---

  const renderScenery = () => {
      if (!activeScenery) return null;
      if (!activeScenery.visible && !isMaster) return null;

      return (
        <div className="fixed inset-0 z-[50] bg-black animate-ken-burns pointer-events-none">
            <img src={activeScenery.url} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000000_100%)]"></div>

            <div className="absolute bottom-20 w-full text-center p-4 animate-fade-in-up">
                <h2 className="font-rpg text-7xl text-white/90 uppercase tracking-[0.5em] drop-shadow-[0_10px_20px_black] mix-blend-overlay">
                    {activeScenery.name}
                </h2>
            </div>
            
            {isMaster && (
                <button 
                    onClick={() => handleStopProjection('SCENERY')} 
                    className="fixed top-24 right-10 z-[2000] p-3 bg-black/50 text-white hover:text-red-500 rounded-full border border-white/20 cursor-pointer pointer-events-auto flex items-center gap-2"
                    title="Fechar Cenário"
                >
                    <EyeSlash size={24} /> <span className="text-xs font-bold">CENÁRIO</span>
                </button>
            )}
        </div>
      );
  };

  const renderNPC = () => {
      if (!activeNPC) return null;
      if (!activeNPC.visible && !isMaster) return null;

      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            {/* Overlay Escuro Suave (apenas se não tiver cenário, ou mais fraco se tiver) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${activeScenery ? 'bg-black/40' : 'bg-black/70 backdrop-blur-[2px]'}`}></div>

            {/* Container Imagem */}
            <div className="relative z-10 animate-scale-up duration-1000 flex flex-col items-center">
                 <img 
                    src={activeNPC.url} 
                    className="max-h-[80vh] max-w-[80vw] object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                    style={{ 
                        maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
                    }}
                 />
            </div>

            {/* Nome e Linha Dourada (Estilo Atualizado: Sem rounded-full) */}
            <div className="relative -mt-10 z-20 w-full flex flex-col items-center animate-fade-in-up delay-500">
                <div className="relative w-full max-w-4xl flex items-center justify-center">
                    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_0_15px_#ffd700]"></div>
                    
                    <h2 className="relative font-rpg text-6xl text-gold uppercase tracking-[0.2em] px-12 py-2 bg-black/80 border-y border-gold/20 shadow-2xl">
                        {activeNPC.name}
                    </h2>
                </div>
                
                {activeNPC.description && (
                    <p className="mt-4 text-white/80 font-serif italic text-2xl drop-shadow-md max-w-2xl text-center bg-black/40 px-4 py-2 rounded">
                        "{activeNPC.description}"
                    </p>
                )}
            </div>

            {/* Botão Fechar NPC */}
            {isMaster && (
                <button 
                    onClick={() => handleStopProjection('NPC')} 
                    className="absolute top-10 right-10 p-3 bg-black/50 text-white hover:text-red-500 rounded-full border border-white/20 pointer-events-auto transition-all hover:scale-110 cursor-pointer z-[2000] flex items-center gap-2"
                    title="Fechar NPC"
                >
                    <EyeSlash size={24} /> <span className="text-xs font-bold">NPC</span>
                </button>
            )}
        </div>
      );
  };

  return (
    <>
      {/* Renderiza ambos se existirem */}
      {renderScenery()}
      {renderNPC()}

      {/* 2. GERENCIADOR DO MESTRE (Janela Arrastável) */}
      {isMaster && showManager && (
        <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <DraggableWindow 
                title="Projetor de Mundos" 
                headerIcon={<Image />} 
                onClose={onCloseManager}
                initialWidth="800px" 
                initialHeight="600px"
                minimizedPosition="top-right"
            >
                <div className="flex flex-col h-full bg-[#1a120b]">
                     {/* Tabs */}
                    <div className="flex bg-black/40 p-2 gap-2 border-b border-white/10">
                        <button onClick={() => setTab('SCENERY')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='SCENERY' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>CENÁRIOS</button>
                        <button onClick={() => setTab('NPC')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='NPC' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>NPCs</button>
                    </div>

                    <div className="flex-1 p-6 overflow-hidden flex flex-col">
                        {/* Form */}
                        <div className="bg-white/5 p-4 rounded mb-6 border border-white/10">
                            <div className="flex gap-2 mb-2">
                                <input value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="URL da Imagem..." className="flex-[2] bg-black/50 border border-white/20 p-2 rounded text-white text-sm" />
                                <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="Nome..." className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-white text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <input value={inputDesc} onChange={e => setInputDesc(e.target.value)} placeholder="Descrição (Opcional)..." className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-white text-sm" />
                                <button onClick={handleSaveItem} className="px-4 bg-green-700 hover:bg-green-600 text-white font-bold rounded text-xs uppercase flex items-center gap-2"><FloppyDisk size={18} /> Salvar</button>
                            </div>
                        </div>

                        {/* Lista Grid */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 custom-scrollbar content-start">
                             {(tab === 'SCENERY' ? savedSceneries : savedNPCs).map((item, i) => (
                                <div key={i} className="group relative aspect-video bg-black rounded border border-white/10 overflow-hidden hover:border-gold transition-all shadow-lg">
                                    <img src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 w-full bg-black/80 p-1">
                                        <p className="text-white font-bold text-xs truncate text-center">{item.name}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity backdrop-blur-sm">
                                        <button onClick={() => handleProject(item)} className="p-2 bg-gold rounded-full text-black hover:scale-110 transition-transform" title="Projetar"><Eye size={20} /></button>
                                        <button onClick={() => handleDeleteItem(item, tab)} className="p-2 bg-red-600 rounded-full text-white hover:scale-110 transition-transform" title="Excluir"><Trash size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DraggableWindow>
        </div>
      )}
    </>
  );
}