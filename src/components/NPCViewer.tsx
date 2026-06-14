import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { X, Image, Eye, EyeSlash, Trash, FloppyDisk, User, Mountains } from '@phosphor-icons/react';
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

/** Tabletop usa z-[980]/990 — cenário acima do mapa, NPC acima do cenário */
const Z_SCENERY = 992;
const Z_NPC = 994;
const Z_PROJECTION_CONTROLS = 1010;

function ProjectionControlBar({
  activeScenery,
  activeNPC,
  onToggleVisibility,
  onStopProjection,
}: {
  activeScenery: SceneryData | null;
  activeNPC: SceneryData | null;
  onToggleVisibility: (type: 'SCENERY' | 'NPC') => void;
  onStopProjection: (type: 'SCENERY' | 'NPC') => void;
}) {
  if (!activeScenery && !activeNPC) return null;

  const rows: { type: 'SCENERY' | 'NPC'; item: SceneryData; icon: React.ReactNode; label: string }[] = [];
  if (activeScenery) rows.push({ type: 'SCENERY', item: activeScenery, icon: <Mountains size={16} className="text-gold" />, label: 'Cenário' });
  if (activeNPC) rows.push({ type: 'NPC', item: activeNPC, icon: <User size={16} className="text-gold" />, label: 'NPC' });

  return (
    <div className="fixed bottom-28 left-6 pointer-events-auto animate-slide-up" style={{ zIndex: Z_PROJECTION_CONTROLS }}>
      <div className="bg-[#1a120b]/95 border border-gold/40 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden min-w-[280px] max-w-[360px]">
        <div className="px-3 py-2 bg-black/50 border-b border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Projeções ativas</span>
        </div>
        <div className="p-2 space-y-2">
          {rows.map(({ type, item, icon, label }) => (
            <div key={type} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-2 border border-white/10">
              {icon}
              <div className="flex-1 min-w-0">
                <div className="text-[9px] uppercase text-white/40 leading-none">{label}</div>
                <div className="text-white text-xs font-bold truncate">{item.name}</div>
                <div className={`text-[9px] mt-0.5 ${item.visible ? 'text-green-400' : 'text-orange-300'}`}>
                  {item.visible ? 'Visível aos jogadores' : 'Oculto dos jogadores'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleVisibility(type)}
                className="p-2 rounded-lg border border-white/20 bg-black/40 text-white hover:text-gold hover:border-gold transition-colors"
                title={item.visible ? 'Ocultar dos jogadores' : 'Mostrar aos jogadores'}
              >
                {item.visible ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
              <button
                type="button"
                onClick={() => onStopProjection(type)}
                className="p-2 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                title={`Remover ${label.toLowerCase()} da tela`}
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

  const isLive = (type: 'SCENERY' | 'NPC', item: SceneryData) => {
      const active = type === 'SCENERY' ? activeScenery : activeNPC;
      return active?.id === item.id || (active?.url === item.url && active?.name === item.name);
  };

  const renderScenery = () => {
      if (!activeScenery) return null;
      if (!activeScenery.visible && !isMaster) return null;

      return (
        <div className="fixed inset-0 bg-black animate-ken-burns pointer-events-none" style={{ zIndex: Z_SCENERY }}>
            <img src={activeScenery.url} className="w-full h-full object-cover opacity-80" alt="" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000000_100%)]"></div>

            <div className="absolute bottom-20 w-full text-center p-4 animate-fade-in-up pointer-events-none">
                <h2 className="font-rpg text-7xl text-white/90 uppercase tracking-[0.5em] drop-shadow-[0_10px_20px_black] mix-blend-overlay">
                    {activeScenery.name}
                </h2>
            </div>
        </div>
      );
  };

  const renderNPC = () => {
      if (!activeNPC) return null;
      if (!activeNPC.visible && !isMaster) return null;

      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in" style={{ zIndex: Z_NPC }}>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${activeScenery ? 'bg-black/40' : 'bg-black/70 backdrop-blur-[2px]'}`}></div>

            <div className="relative z-10 animate-scale-up duration-1000 flex flex-col items-center pointer-events-none">
                 <img 
                    src={activeNPC.url} 
                    className="max-h-[80vh] max-w-[80vw] object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                    alt={activeNPC.name}
                    style={{ 
                        maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
                    }}
                 />
            </div>

            <div className="relative -mt-10 z-20 w-full flex flex-col items-center animate-fade-in-up delay-500 px-4 pointer-events-none">
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
        </div>
      );
  };

  const currentList = tab === 'SCENERY' ? savedSceneries : savedNPCs;

  return (
    <>
      {renderScenery()}
      {renderNPC()}

      {isMaster && (
        <ProjectionControlBar
          activeScenery={activeScenery}
          activeNPC={activeNPC}
          onToggleVisibility={handleToggleVisibility}
          onStopProjection={handleStopProjection}
        />
      )}

      {isMaster && showManager && (
        <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <DraggableWindow 
                title="Cenários & NPCs" 
                headerIcon={<Image />} 
                onClose={onCloseManager}
                initialWidth="min(820px, 95vw)" 
                initialHeight="min(720px, 90dvh)"
                minimizedPosition="top-right"
                zIndex={3000}
            >
                <div className="flex flex-col h-full min-h-0 w-full bg-[#1a120b] overflow-hidden">
                    <div className="flex shrink-0 bg-black/40 p-2 gap-2 border-b border-white/10">
                        <button onClick={() => setTab('SCENERY')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='SCENERY' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>CENÁRIOS</button>
                        <button onClick={() => setTab('NPC')} className={`flex-1 py-2 font-bold font-rpg rounded transition-colors ${tab==='NPC' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>NPCs</button>
                    </div>

                    {(activeScenery || activeNPC) && (
                      <div className="shrink-0 mx-4 mt-3 p-3 rounded-lg border border-gold/30 bg-gold/5">
                        <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2">No ar agora</div>
                        <div className="flex flex-wrap gap-2">
                          {activeScenery && (
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1.5 border border-white/10">
                              <Mountains size={14} className="text-gold shrink-0" />
                              <span className="text-white text-xs font-bold truncate max-w-[140px]">{activeScenery.name}</span>
                              <button onClick={() => handleStopProjection('SCENERY')} className="text-[10px] px-2 py-1 rounded bg-red-900/50 text-red-200 hover:bg-red-700 border border-red-500/30">Tirar do ar</button>
                            </div>
                          )}
                          {activeNPC && (
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1.5 border border-white/10">
                              <User size={14} className="text-gold shrink-0" />
                              <span className="text-white text-xs font-bold truncate max-w-[140px]">{activeNPC.name}</span>
                              <button onClick={() => handleStopProjection('NPC')} className="text-[10px] px-2 py-1 rounded bg-red-900/50 text-red-200 hover:bg-red-700 border border-red-500/30">Tirar do ar</button>
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-white/40 mt-2">Use a barra no canto inferior esquerdo da tela para ocultar/mostrar ou remover sem abrir este painel.</p>
                      </div>
                    )}

                    <div className="flex-1 min-h-0 flex flex-col p-4 pt-3 gap-3 overflow-hidden">
                        <div className="bg-white/5 p-3 rounded border border-white/10 shrink-0">
                            <div className="text-[10px] uppercase text-white/40 mb-2">Cadastrar {tab === 'SCENERY' ? 'cenário' : 'NPC'}</div>
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <input value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="URL da imagem..." className="sm:flex-[2] bg-black/50 border border-white/20 p-2 rounded text-white text-sm min-w-0" />
                                <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="Nome..." className="sm:flex-1 bg-black/50 border border-white/20 p-2 rounded text-white text-sm min-w-0" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input value={inputDesc} onChange={e => setInputDesc(e.target.value)} placeholder="Descrição (opcional)..." className="flex-1 bg-black/50 border border-white/20 p-2 rounded text-white text-sm min-w-0" />
                                <button onClick={handleSaveItem} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded text-xs uppercase flex items-center justify-center gap-2 shrink-0"><FloppyDisk size={18} /> Salvar</button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar pb-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                             {currentList.length === 0 && (
                               <div className="col-span-full text-center text-white/30 py-8 text-sm">
                                 Nenhum {tab === 'SCENERY' ? 'cenário' : 'NPC'} salvo. Cadastre acima ou projete pela URL.
                               </div>
                             )}
                             {currentList.map((item) => {
                               const live = isLive(tab, item);
                               return (
                                <div
                                  key={item.id}
                                  className={`flex flex-col rounded-lg border overflow-hidden shadow-lg bg-black ${live ? 'border-gold ring-1 ring-gold/30' : 'border-white/10 hover:border-gold/50'} transition-colors`}
                                >
                                    <div className="relative h-28 sm:h-32 w-full shrink-0 bg-[#0a0a0a]">
                                      <img src={item.url} className="absolute inset-0 w-full h-full object-cover object-top" alt="" />
                                      {live && (
                                        <span className="absolute top-1 left-1 text-[8px] font-bold uppercase tracking-wider bg-gold text-black px-1.5 py-0.5 rounded z-10">No ar</span>
                                      )}
                                    </div>
                                    <div className="shrink-0 p-2 bg-[#111] border-t border-white/10 flex flex-col gap-2">
                                        <p className="text-white font-bold text-xs truncate text-center leading-tight" title={item.name}>{item.name}</p>
                                        <div className="flex gap-1">
                                          {live ? (
                                            <button
                                              onClick={() => handleStopProjection(tab)}
                                              className="flex-1 min-h-[32px] py-1.5 rounded text-[10px] font-bold uppercase bg-red-900/60 text-red-200 border border-red-500/30 hover:bg-red-700 hover:text-white"
                                            >
                                              Tirar do ar
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => handleProject(item)}
                                              className="flex-1 min-h-[32px] py-1.5 rounded text-[10px] font-bold uppercase bg-gold text-black hover:bg-yellow-400 flex items-center justify-center gap-1"
                                            >
                                              <Eye size={14} /> Projetar
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleDeleteItem(item.id, tab)}
                                            className="shrink-0 w-8 min-h-[32px] flex items-center justify-center rounded bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-900/30 border border-white/10"
                                            title="Excluir do banco"
                                          >
                                            <Trash size={16} />
                                          </button>
                                        </div>
                                    </div>
                                </div>
                            );})}
                            </div>
                        </div>
                    </div>
                </div>
            </DraggableWindow>
        </div>
      )}
    </>
  );
}
