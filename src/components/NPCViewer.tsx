import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { X, Image, Eye, EyeSlash, Trash, FloppyDisk } from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';

interface SceneryData {
    id: string;
    url: string;
    type: 'SCENERY' | 'NPC';
    name: string;
    description?: string;
    visible: boolean;
    timestamp?: number;
}

function legacyItemId(item: Pick<SceneryData, 'url' | 'name' | 'type'>): string {
    return `legacy-${item.type}-${item.url}-${item.name}`.replace(/\s+/g, '-').slice(0, 120);
}

function ensureItemId(item: SceneryData): SceneryData {
    return item.id ? item : { ...item, id: legacyItemId(item) };
}

export default function NPCViewer({ sessaoData, isMaster, showManager, onCloseManager }: any) {
  const [activeScenery, setActiveScenery] = useState<SceneryData | null>(null);
  const [activeNPC, setActiveNPC] = useState<SceneryData | null>(null);
  
  const [tab, setTab] = useState<'SCENERY' | 'NPC'>('SCENERY');
  
  const [inputUrl, setInputUrl] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputDesc, setInputDesc] = useState("");

  const [savedSceneries, setSavedSceneries] = useState<SceneryData[]>([]);
  const [savedNPCs, setSavedNPCs] = useState<SceneryData[]>([]);

  useEffect(() => {
    if (sessaoData) {
      setActiveScenery(sessaoData.active_scenery ? ensureItemId(sessaoData.active_scenery) : null);
      setActiveNPC(sessaoData.active_npc ? ensureItemId(sessaoData.active_npc) : null);
      
      setSavedSceneries((sessaoData.saved_sceneries || []).map((item: SceneryData) => ensureItemId(item)));
      setSavedNPCs((sessaoData.saved_npcs || []).map((item: SceneryData) => ensureItemId(item)));
    }
  }, [sessaoData]);

  const handleProject = async (item: SceneryData) => {
      const content: SceneryData = { ...ensureItemId(item), visible: true, timestamp: Date.now() };
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

  const handleToggleVisibility = async (type: 'SCENERY' | 'NPC') => {
      const current = type === 'SCENERY' ? activeScenery : activeNPC;
      if (!current) return;
      const updated = { ...current, visible: !current.visible, timestamp: Date.now() };
      const field = type === 'SCENERY' ? 'active_scenery' : 'active_npc';
      await updateDoc(doc(db, "sessoes", sessaoData.id), { [field]: updated });
  };

  const handleSaveItem = async () => {
      if (!inputUrl || !inputName) return alert("Preencha URL e Nome");
      const newItem: SceneryData = {
          id: crypto.randomUUID(),
          url: inputUrl,
          name: inputName,
          description: inputDesc,
          type: tab,
          visible: true,
      };
      const field = tab === 'SCENERY' ? 'saved_sceneries' : 'saved_npcs';
      const currentList: SceneryData[] = tab === 'SCENERY' ? savedSceneries : savedNPCs;
      await updateDoc(doc(db, "sessoes", sessaoData.id), { [field]: [...currentList, newItem] });
      setInputUrl(""); setInputName(""); setInputDesc("");
  };

  const handleDeleteItem = async (itemId: string, type: 'SCENERY' | 'NPC') => {
      if(!confirm("Deletar item?")) return;
      const field = type === 'SCENERY' ? 'saved_sceneries' : 'saved_npcs';
      const currentList: SceneryData[] = type === 'SCENERY' ? savedSceneries : savedNPCs;
      await updateDoc(doc(db, "sessoes", sessaoData.id), {
          [field]: currentList.filter(item => item.id !== itemId),
      });
  };

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
                <div className="fixed top-24 right-10 z-[2000] flex gap-2 pointer-events-auto">
                    <button 
                        onClick={() => handleToggleVisibility('SCENERY')} 
                        className="p-3 bg-black/50 text-white hover:text-gold rounded-full border border-white/20 cursor-pointer flex items-center gap-2"
                        title={activeScenery.visible ? "Ocultar dos jogadores" : "Mostrar aos jogadores"}
                    >
                        {activeScenery.visible ? <EyeSlash size={24} /> : <Eye size={24} />}
                        <span className="text-xs font-bold">CENÁRIO</span>
                    </button>
                    <button 
                        onClick={() => handleStopProjection('SCENERY')} 
                        className="p-3 bg-black/50 text-white hover:text-red-500 rounded-full border border-white/20 cursor-pointer"
                        title="Fechar Cenário"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </div>
      );
  };

  const renderNPC = () => {
      if (!activeNPC) return null;
      if (!activeNPC.visible && !isMaster) return null;

      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${activeScenery ? 'bg-black/40' : 'bg-black/70 backdrop-blur-[2px]'}`}></div>

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

            <div className="relative -mt-10 z-20 w-full flex flex-col items-center animate-fade-in-up delay-500 px-4">
                <h2 className={`relative font-rpg text-gold uppercase tracking-[0.2em] drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-center w-full leading-tight z-10
                    ${activeNPC.name.length > 20 ? 'text-4xl' : activeNPC.name.length > 12 ? 'text-5xl' : 'text-6xl'}
                `}>
                    {activeNPC.name}
                </h2>

                <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent shadow-[0_0_15px_#ffd700] opacity-80 my-3"></div>
                
                {activeNPC.description && (
                    <p className="text-white/90 font-serif italic text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)] max-w-3xl text-center px-4">
                        "{activeNPC.description}"
                    </p>
                )}
            </div>

            {isMaster && (
                <div className="absolute top-10 right-10 flex gap-2 pointer-events-auto z-[2000]">
                    <button 
                        onClick={() => handleToggleVisibility('NPC')} 
                        className="p-3 bg-black/50 text-white hover:text-gold rounded-full border border-white/20 transition-all hover:scale-110 cursor-pointer flex items-center gap-2"
                        title={activeNPC.visible ? "Ocultar dos jogadores" : "Mostrar aos jogadores"}
                    >
                        {activeNPC.visible ? <EyeSlash size={24} /> : <Eye size={24} />}
                        <span className="text-xs font-bold">NPC</span>
                    </button>
                    <button 
                        onClick={() => handleStopProjection('NPC')} 
                        className="p-3 bg-black/50 text-white hover:text-red-500 rounded-full border border-white/20 transition-all hover:scale-110 cursor-pointer"
                        title="Fechar NPC"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </div>
      );
  };

  return (
    <>
      {renderScenery()}
      {renderNPC()}

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
                    <div className="flex bg-black/40 p-2 gap-2 border-b border-white/10">
                        <button onClick={() => setTab('SCENERY')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='SCENERY' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>CENÁRIOS</button>
                        <button onClick={() => setTab('NPC')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='NPC' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>NPCs</button>
                    </div>

                    <div className="flex-1 p-6 overflow-hidden flex flex-col">
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

                        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 custom-scrollbar content-start">
                             {(tab === 'SCENERY' ? savedSceneries : savedNPCs).map((item) => (
                                <div key={item.id} className="group relative aspect-video bg-black rounded border border-white/10 overflow-hidden hover:border-gold transition-all shadow-lg">
                                    <img src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 w-full bg-black/80 p-1">
                                        <p className="text-white font-bold text-xs truncate text-center">{item.name}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity backdrop-blur-sm">
                                        <button onClick={() => handleProject(item)} className="p-2 bg-gold rounded-full text-black hover:scale-110 transition-transform" title="Projetar"><Eye size={20} /></button>
                                        <button onClick={() => handleDeleteItem(item.id, tab)} className="p-2 bg-red-600 rounded-full text-white hover:scale-110 transition-transform" title="Excluir"><Trash size={20} /></button>
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
