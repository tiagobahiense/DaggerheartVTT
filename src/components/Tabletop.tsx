import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { 
  X, MapTrifold, Plus, Trash, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Ruler, Minus, FloppyDisk, Upload, Skull, User, GridFour
} from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';

// --- INTERFACES ---
interface Token {
  id: string;
  charId?: string;
  name: string;
  img: string;
  x: number;
  y: number;
  size: number; // Em células (1 = 1x1, 2 = 2x2...)
  type: 'player' | 'enemy';
  visible: boolean;
  imgOffX: number;
  imgOffY: number;
  imgScale: number;
}

interface MapData {
  url: string;
  name: string;
  gridSizePx: number; // Pixels por célula
  globalZoom: number; 
  globalPanX: number;
  globalPanY: number;
  tokens: Token[];
}

interface SavedMap {
    name: string;
    url: string;
    gridSizePx: number;
    tokens: Token[]; // Salva os inimigos posicionados
}

interface SavedEnemy {
    name: string;
    img: string;
    defaultSize: number;
}

export default function Tabletop({ sessaoData, isMaster, charactersData, showManager, onCloseManager }: any) {
  // --- ESTADOS GLOBAIS ---
  const [activeMap, setActiveMap] = useState<MapData | null>(null);
  const [localTokens, setLocalTokens] = useState<Token[]>([]);
  
  // --- ESTADOS DE INTERAÇÃO ---
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isRulerMode, setIsRulerMode] = useState(false);
  
  // Régua (Coordenadas no mundo do jogo, já compensadas por zoom/pan)
  const [rulerStart, setRulerStart] = useState<{x:number, y:number} | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{x:number, y:number} | null>(null);

  // Editor de Token (Modal Flutuante)
  const [editingToken, setEditingToken] = useState<{id: string, screenX: number, screenY: number} | null>(null);

  // --- ESTADOS DO GERENCIADOR (MESTRE) ---
  const [managerTab, setManagerTab] = useState<'MAPS' | 'ENEMIES' | 'SAVED'>('MAPS');
  
  // Inputs Novo Mapa
  const [inputMapUrl, setInputMapUrl] = useState("");
  const [inputMapName, setInputMapName] = useState("");
  const [inputGridSize, setInputGridSize] = useState(50); // NOVO: Controle de Grid

  // Inputs Novo Inimigo
  const [inputEnemyName, setInputEnemyName] = useState("");
  const [inputEnemyImg, setInputEnemyImg] = useState("");
  
  // Dados salvos (Carregados do Firebase via sessaoData)
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [savedEnemies, setSavedEnemies] = useState<SavedEnemy[]>([]);

  // Refs para performance
  const containerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef({ x: 0, y: 0 }); // Onde o mouse clicou na tela
  const panStartMap = useRef({ x: 0, y: 0 }); // Onde o mapa estava
  const dragOffset = useRef({ x: 0, y: 0 }); // Offset do token sendo arrastado

  // --- SINCRONIZAÇÃO ---
  useEffect(() => {
    if (sessaoData) {
        // Mapas e Inimigos Salvos
        setSavedMaps(sessaoData.saved_maps || []);
        setSavedEnemies(sessaoData.saved_enemies || []);

        if (sessaoData.active_map) {
            const serverMap = sessaoData.active_map;
            
            // Atualiza View (Zoom/Pan) se mudou no servidor
            setActiveMap(prev => {
                // Evita re-render se for igual (comparação rasa simples para evitar loop)
                if (prev && 
                    prev.url === serverMap.url &&
                    prev.globalZoom === serverMap.globalZoom &&
                    prev.globalPanX === serverMap.globalPanX &&
                    prev.globalPanY === serverMap.globalPanY &&
                    prev.gridSizePx === serverMap.gridSizePx
                ) return prev;

                return {
                    ...serverMap,
                    gridSizePx: serverMap.gridSizePx || 50,
                    globalZoom: serverMap.globalZoom || 1,
                    globalPanX: serverMap.globalPanX || 0,
                    globalPanY: serverMap.globalPanY || 0,
                };
            });

            // Atualiza Tokens se não estiver arrastando
            if (!draggingTokenId) {
                setLocalTokens(serverMap.tokens || []);
            }
        } else {
            setActiveMap(null);
            setLocalTokens([]);
        }
    }
  }, [sessaoData, draggingTokenId]);

  // --- FIREBASE UPDATES ---
  const pushMapUpdate = async (updates: any) => {
      if (!isMaster || !sessaoData?.id) return;
      // Constrói o objeto de atualização flattening
      const payload: any = {};
      Object.keys(updates).forEach(key => {
          payload[`active_map.${key}`] = updates[key];
      });
      await updateDoc(doc(db, 'sessoes', sessaoData.id), payload);
  };

  const pushTokensUpdate = async (newTokens: Token[]) => {
      if (!sessaoData?.id) return;
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { "active_map.tokens": newTokens });
  };

  const saveMapToBank = async () => {
      if (!activeMap || !inputMapName) return alert("Defina um nome para o mapa atual (Use a aba Novo).");
      const newMapData: SavedMap = {
          name: inputMapName || activeMap.name,
          url: activeMap.url,
          gridSizePx: activeMap.gridSizePx, // Salva o tamanho do grid atual
          tokens: localTokens.filter(t => t.type === 'enemy') // Salva apenas inimigos pré-posicionados
      };
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_maps: arrayUnion(newMapData) });
      alert("Mapa salvo no banco!");
  };

  const saveEnemyToBank = async () => {
      if (!inputEnemyName || !inputEnemyImg) return alert("Preencha nome e imagem.");
      const newEnemy: SavedEnemy = { name: inputEnemyName, img: inputEnemyImg, defaultSize: 1 };
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_enemies: arrayUnion(newEnemy) });
      setInputEnemyName(""); setInputEnemyImg("");
  };

  const loadMapFromBank = async (savedMap: SavedMap) => {
      if(!confirm(`Carregar ${savedMap.name}? O mapa atual será substituído.`)) return;
      
      // Inimigos carregados começam invisíveis
      const enemiesHidden = savedMap.tokens.map(t => ({ ...t, visible: false }));
      
      const newActiveMap = {
          url: savedMap.url,
          name: savedMap.name,
          gridSizePx: savedMap.gridSizePx || 50, // Carrega o grid salvo
          globalZoom: 1,
          globalPanX: 0,
          globalPanY: 0,
          tokens: enemiesHidden
      };
      
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { active_map: newActiveMap });
  };

  const spawnSavedEnemy = (enemy: SavedEnemy) => {
      const newToken: Token = {
          id: crypto.randomUUID(),
          name: enemy.name,
          img: enemy.img,
          x: 5 + Math.floor(Math.random() * 3),
          y: 5 + Math.floor(Math.random() * 3),
          size: 1,
          type: 'enemy',
          visible: false, // Começa invisível para o mestre posicionar
          imgOffX: 0, imgOffY: 0, imgScale: 1
      };
      const updatedTokens = [...localTokens, newToken];
      setLocalTokens(updatedTokens);
      pushTokensUpdate(updatedTokens);
  };

  // --- MATEMÁTICA DE COORDENADAS (CORE) ---
  const getSceneCoord = (clientX: number, clientY: number) => {
      if (!containerRef.current || !activeMap) return { x: 0, y: 0 };
      
      const rect = containerRef.current.getBoundingClientRect();
      
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const worldX = (relX - activeMap.globalPanX) / activeMap.globalZoom;
      const worldY = (relY - activeMap.globalPanY) / activeMap.globalZoom;

      return { x: worldX, y: worldY };
  };

  // --- INTERAÇÕES MOUSE ---

  const handleMouseDown = (e: React.MouseEvent) => {
      if (!activeMap) return;
      if ((e.target as HTMLElement).closest('button')) return; 
      
      // 1. Régua
      if (isRulerMode) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          setRulerStart(coords);
          setRulerEnd(coords);
          return;
      }

      // 2. Pan
      if (isMaster && !draggingTokenId) {
          setIsPanning(true);
          panStart.current = { x: e.clientX, y: e.clientY };
          panStartMap.current = { x: activeMap.globalPanX, y: activeMap.globalPanY };
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!activeMap) return;

      // 1. Régua
      if (isRulerMode && rulerStart) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          setRulerEnd(coords);
          return;
      }

      // 2. Arrastar Token
      if (draggingTokenId) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          // Snap to Grid
          const gridX = Math.floor((coords.x - dragOffset.current.x) / activeMap.gridSizePx);
          const gridY = Math.floor((coords.y - dragOffset.current.y) / activeMap.gridSizePx);
          
          setLocalTokens(prev => prev.map(t => {
              if (t.id === draggingTokenId) {
                  return { ...t, x: gridX, y: gridY };
              }
              return t;
          }));
          return;
      }

      // 3. Pan do Mapa (Otimizado com requestAnimationFrame implicito pelo React Batching ou refs se fosse pesado)
      if (isPanning && isMaster) {
          const dx = e.clientX - panStart.current.x;
          const dy = e.clientY - panStart.current.y;
          
          setActiveMap(prev => prev ? ({
              ...prev,
              globalPanX: panStartMap.current.x + dx,
              globalPanY: panStartMap.current.y + dy
          }) : null);
      }
  };

  const handleMouseUp = () => {
      if (isRulerMode) {
          setRulerStart(null);
          setRulerEnd(null);
      }
      if (draggingTokenId) {
          pushTokensUpdate(localTokens);
          setDraggingTokenId(null);
      }
      if (isPanning) {
          setIsPanning(false);
          if (activeMap) {
              pushMapUpdate({ globalPanX: activeMap.globalPanX, globalPanY: activeMap.globalPanY });
          }
      }
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (!isMaster || !activeMap) return;
      e.stopPropagation();
      const newZoom = Math.max(0.1, Math.min(5, activeMap.globalZoom - (e.deltaY * 0.001)));
      pushMapUpdate({ globalZoom: newZoom });
  };

  // --- TOKEN LOGIC ---
  
  const handleTokenMouseDown = (e: React.MouseEvent, token: Token) => {
      e.stopPropagation();
      if (isRulerMode) return;
      if (!isMaster && token.type === 'enemy') return; 
      if (!isMaster && token.charId && token.charId !== auth.currentUser?.uid) {
          // Jogador só mexe no seu
      }

      const coords = getSceneCoord(e.clientX, e.clientY);
      dragOffset.current = {
          x: coords.x - (token.x * activeMap!.gridSizePx),
          y: coords.y - (token.y * activeMap!.gridSizePx)
      };
      
      setDraggingTokenId(token.id);
      if (editingToken?.id !== token.id) setEditingToken(null);
  };

  const handleTokenDoubleClick = (e: React.MouseEvent, token: Token) => {
      e.stopPropagation();
      if (!isMaster && token.type === 'enemy') return;
      
      setEditingToken({
          id: token.id,
          screenX: e.clientX + 20,
          screenY: e.clientY - 50
      });
  };

  const updateEditingToken = (updates: Partial<Token>) => {
      if (!editingToken) return;
      const newTokens = localTokens.map(t => t.id === editingToken.id ? { ...t, ...updates } : t);
      setLocalTokens(newTokens);
      pushTokensUpdate(newTokens);
  };

  const deleteEditingToken = () => {
      if (!editingToken) return;
      const newTokens = localTokens.filter(t => t.id !== editingToken.id);
      setLocalTokens(newTokens);
      pushTokensUpdate(newTokens);
      setEditingToken(null);
  };

  // --- RENDER CONTENT ---
  
  const renderMapContent = () => {
      if (!activeMap) return <div className="text-white/30 flex items-center justify-center h-full">Nenhum mapa carregado</div>;

      return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full bg-[#101010] overflow-hidden ${isRulerMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* CAMADA TRANSFORMADA (MAPA + TOKENS) */}
            <div 
                style={{ 
                    transform: `translate3d(${activeMap.globalPanX}px, ${activeMap.globalPanY}px, 0) scale(${activeMap.globalZoom})`,
                    transformOrigin: 'top left',
                    width: '0px', height: '0px'
                }}
            >
                {/* 1. Imagem do Mapa */}
                <img 
                    src={activeMap.url} 
                    className="max-w-none select-none pointer-events-none" 
                    draggable={false}
                />

                {/* 2. Grid Overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-30 z-[5]"
                    style={{ 
                        width: '5000px', height: '5000px', 
                        backgroundSize: `${activeMap.gridSizePx}px ${activeMap.gridSizePx}px`, 
                        backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)' 
                    }}
                />

                {/* 3. Tokens */}
                {localTokens.map(token => {
                    if (!isMaster && !token.visible) return null; 
                    
                    const isEditing = editingToken?.id === token.id;
                    const width = token.size * activeMap.gridSizePx;
                    const height = token.size * activeMap.gridSizePx;

                    return (
                        <div
                            key={token.id}
                            className={`absolute z-[10] group transition-opacity ${isEditing ? 'z-[20] ring-2 ring-gold' : ''}`}
                            style={{
                                left: token.x * activeMap.gridSizePx,
                                top: token.y * activeMap.gridSizePx,
                                width: width,
                                height: height,
                                opacity: !token.visible ? 0.5 : 1
                            }}
                            onMouseDown={(e) => handleTokenMouseDown(e, token)}
                            onDoubleClick={(e) => handleTokenDoubleClick(e, token)}
                        >
                            {/* IMAGEM DO TOKEN (CORREÇÃO: object-contain) */}
                            <div className={`w-full h-full overflow-hidden shadow-lg ${token.type === 'player' ? 'rounded-full border-2 border-green-500' : 'rounded-sm border-2 border-red-500'} bg-black`}>
                                <img 
                                    src={token.img} 
                                    className="max-w-none w-full h-full object-contain pointer-events-none select-none" // CORRIGIDO AQUI
                                    style={{
                                        transform: `scale(${token.imgScale}) translate(${token.imgOffX}px, ${token.imgOffY}px)`
                                    }}
                                    draggable={false}
                                />
                            </div>
                            
                            {/* Nome */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                {token.name}
                            </div>
                        </div>
                    );
                })}

                {/* 4. Régua Visual */}
                {rulerStart && rulerEnd && (
                    <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-[100] overflow-visible">
                        <line 
                            x1={rulerStart.x} y1={rulerStart.y} 
                            x2={rulerEnd.x} y2={rulerEnd.y} 
                            stroke="#fbbf24" strokeWidth={2 / activeMap.globalZoom} strokeDasharray={`${10/activeMap.globalZoom},${5/activeMap.globalZoom}`} 
                        />
                        <text 
                            x={rulerEnd.x + 10} y={rulerEnd.y} 
                            fill="#fbbf24" 
                            fontSize={20 / activeMap.globalZoom} 
                            fontWeight="bold"
                            style={{ textShadow: '2px 2px 0px black' }}
                        >
                            {(() => {
                                const dx = rulerEnd.x - rulerStart.x;
                                const dy = rulerEnd.y - rulerStart.y;
                                const distPx = Math.sqrt(dx*dx + dy*dy);
                                const distCells = distPx / activeMap.gridSizePx;
                                return `${(distCells * 1.5).toFixed(1)}m`;
                            })()}
                        </text>
                    </svg>
                )}
            </div>

            {/* HUD */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 bg-black/80 p-2 rounded border border-white/20 z-[500]">
                <button 
                    onClick={() => setIsRulerMode(!isRulerMode)} 
                    className={`p-2 rounded ${isRulerMode ? 'bg-gold text-black' : 'text-white hover:bg-white/10'}`} 
                    title="Régua"
                >
                    <Ruler size={24} />
                </button>
                {isMaster && activeMap && (
                    <>
                        <div className="h-[1px] bg-white/20 my-1"></div>
                        <button onClick={() => pushMapUpdate({ globalZoom: activeMap.globalZoom + 0.1 })} className="text-white hover:text-gold"><Plus /></button>
                        <span className="text-xs text-center text-white select-none">{Math.round(activeMap.globalZoom * 100)}%</span>
                        <button onClick={() => pushMapUpdate({ globalZoom: activeMap.globalZoom - 0.1 })} className="text-white hover:text-gold"><Minus /></button>
                    </>
                )}
            </div>

            {/* EDITOR DE TOKEN */}
            {isMaster && editingToken && (
                <div 
                    className="fixed z-[9999] bg-[#1a120b] border border-gold p-3 rounded-lg shadow-2xl animate-scale-up w-64"
                    style={{ left: editingToken.screenX, top: editingToken.screenY }}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                        <span className="text-gold font-bold text-xs uppercase">Editar Token</span>
                        <X className="text-white cursor-pointer hover:text-red-500" onClick={() => setEditingToken(null)} />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="col-span-3 flex justify-center"><button onClick={() => updateEditingToken({ imgOffY: (localTokens.find(t=>t.id===editingToken.id)?.imgOffY||0) - 5 })} className="p-1 bg-white/10 hover:bg-gold rounded"><ArrowUp /></button></div>
                        <button onClick={() => updateEditingToken({ imgOffX: (localTokens.find(t=>t.id===editingToken.id)?.imgOffX||0) - 5 })} className="p-1 bg-white/10 hover:bg-gold rounded"><ArrowLeft /></button>
                        <div className="flex justify-center items-center"><span className="text-[10px] text-white/50">POS</span></div>
                        <button onClick={() => updateEditingToken({ imgOffX: (localTokens.find(t=>t.id===editingToken.id)?.imgOffX||0) + 5 })} className="p-1 bg-white/10 hover:bg-gold rounded"><ArrowRight /></button>
                        <div className="col-span-3 flex justify-center"><button onClick={() => updateEditingToken({ imgOffY: (localTokens.find(t=>t.id===editingToken.id)?.imgOffY||0) + 5 })} className="p-1 bg-white/10 hover:bg-gold rounded"><ArrowDown /></button></div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-white">Zoom Img</label>
                            <input type="range" min="0.5" max="3" step="0.1" 
                                value={localTokens.find(t=>t.id===editingToken.id)?.imgScale||1} 
                                onChange={e=>updateEditingToken({imgScale: parseFloat(e.target.value)})} 
                                className="w-24 accent-gold" 
                            />
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-white">Células</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => updateEditingToken({ size: s })}
                                        className={`w-6 h-6 text-xs font-bold border ${localTokens.find(t=>t.id===editingToken.id)?.size === s ? 'bg-gold text-black border-gold' : 'bg-black text-white border-white/20'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-white/10">
                            <button 
                                onClick={() => updateEditingToken({ visible: !localTokens.find(t=>t.id===editingToken.id)?.visible })} 
                                className={`flex-1 py-1 rounded text-xs border ${localTokens.find(t=>t.id===editingToken.id)?.visible ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
                            >
                                {localTokens.find(t=>t.id===editingToken.id)?.visible ? 'Visível' : 'Oculto'}
                            </button>
                            <button onClick={deleteEditingToken} className="p-1 bg-red-900/50 border border-red-500 text-red-400 rounded hover:bg-red-600 hover:text-white">
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <>
        {/* JANELA DO TABLETOP */}
        {activeMap && (
            <DraggableWindow 
                title={activeMap.name} 
                onClose={isMaster ? () => { setActiveMap(null); updateDoc(doc(db, 'sessoes', sessaoData.id), { active_map: null }); } : undefined}
                headerIcon={<MapTrifold size={20} />}
                initialWidth="95vw" initialHeight="85vh"
                minimizedPosition="top-right"
            >
                {renderMapContent()}
            </DraggableWindow>
        )}

        {/* GERENCIADOR DO MESTRE */}
        {isMaster && showManager && (
             <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                 <div className="w-[900px] h-[700px] bg-[#1a120b] border border-gold/30 rounded-xl shadow-2xl flex flex-col p-4 animate-scale-up">
                     
                     <div className="flex justify-between mb-4 border-b border-white/10 pb-2">
                         <div className="flex gap-4">
                             <h2 className="text-gold font-bold flex items-center gap-2"><MapTrifold /> Gerenciador de Mesa</h2>
                             <div className="flex gap-2">
                                <button onClick={() => setManagerTab('MAPS')} className={`px-3 py-1 text-xs rounded ${managerTab==='MAPS' ? 'bg-gold text-black' : 'bg-white/5 text-white'}`}>Ativo / Novo</button>
                                <button onClick={() => setManagerTab('SAVED')} className={`px-3 py-1 text-xs rounded ${managerTab==='SAVED' ? 'bg-gold text-black' : 'bg-white/5 text-white'}`}>Banco Mapas</button>
                                <button onClick={() => setManagerTab('ENEMIES')} className={`px-3 py-1 text-xs rounded ${managerTab==='ENEMIES' ? 'bg-gold text-black' : 'bg-white/5 text-white'}`}>Banco Inimigos</button>
                             </div>
                         </div>
                         <X onClick={onCloseManager} className="text-white cursor-pointer hover:text-red-500"/>
                     </div>

                     <div className="flex-1 overflow-hidden p-2">
                        
                        {/* ABA: MAPA ATIVO / CRIAR NOVO */}
                        {managerTab === 'MAPS' && (
                            <div className="flex flex-col gap-4 h-full">
                                <div className="bg-black/40 p-4 rounded border border-white/10">
                                    <h3 className="text-white text-sm mb-2 font-bold">Definir Mapa Ativo</h3>
                                    <div className="flex gap-2 mb-2">
                                        <input className="bg-black/50 border border-white/20 p-2 text-white text-sm flex-1" placeholder="Nome do Mapa" value={inputMapName} onChange={e=>setInputMapName(e.target.value)} />
                                        <input className="bg-black/50 border border-white/20 p-2 text-white text-sm flex-[2]" placeholder="URL da Imagem" value={inputMapUrl} onChange={e=>setInputMapUrl(e.target.value)} />
                                        
                                        {/* NOVO: Input de GRID */}
                                        <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-2 rounded">
                                            <GridFour className="text-white/50" />
                                            <input 
                                                type="number" 
                                                className="bg-transparent text-white text-sm w-12 outline-none" 
                                                value={inputGridSize} 
                                                onChange={e => setInputGridSize(Number(e.target.value))} 
                                                title="Tamanho do Grid (px)"
                                            />
                                            <span className="text-xs text-white/30">px</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if(!inputMapUrl) return;
                                            // Salva com o Grid definido
                                            await updateDoc(doc(db, 'sessoes', sessaoData.id), { 
                                                active_map: { url: inputMapUrl, name: inputMapName || "Mapa", gridSizePx: inputGridSize, globalZoom: 1, globalPanX: 0, globalPanY: 0, tokens: [] } 
                                            });
                                            setActiveMap({ url: inputMapUrl, name: inputMapName || "Mapa", gridSizePx: inputGridSize, globalZoom: 1, globalPanX: 0, globalPanY: 0, tokens: [] });
                                        }}
                                        className="w-full bg-gold text-black font-bold py-2 rounded hover:bg-yellow-500"
                                    >
                                        PROJETAR MAPA
                                    </button>
                                </div>

                                <div className="flex-1 bg-black/20 p-4 rounded border border-white/10 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-white text-xs opacity-50 uppercase">Tokens em Cena</h3>
                                        <button onClick={saveMapToBank} className="text-gold text-xs flex items-center gap-1 hover:underline"><FloppyDisk /> Salvar Estado no Banco</button>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-white/30 text-[10px] uppercase mb-1">Jogadores</p>
                                        <div className="flex flex-wrap gap-2">
                                            {charactersData.map((c:any) => (
                                                <button key={c.id} onClick={async () => {
                                                    if (!activeMap) return alert("Projete um mapa primeiro");
                                                    const newToken: Token = { id: crypto.randomUUID(), charId: c.id, name: c.name, img: c.imageUrl || '/default-token.png', x: 2, y: 2, size: 1, type: 'player', visible: true, imgOffX: 0, imgOffY: 0, imgScale: 1 };
                                                    const newTokens = [...localTokens, newToken];
                                                    setLocalTokens(newTokens);
                                                    await pushTokensUpdate(newTokens);
                                                }} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded hover:border-gold">
                                                    <img src={c.imageUrl} className="w-6 h-6 rounded-full"/> <span className="text-white text-xs">{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-white/30 text-[10px] uppercase mb-1">Inimigos em Cena</p>
                                        <div className="space-y-1">
                                            {localTokens.filter(t => t.type === 'enemy').map(t => (
                                                <div key={t.id} className="flex justify-between items-center bg-black/40 p-1 px-2 rounded border border-white/5">
                                                    <span className="text-white text-xs">{t.name}</span>
                                                    <Trash size={14} className="text-red-500 cursor-pointer" onClick={() => {
                                                        const nt = localTokens.filter(x => x.id !== t.id);
                                                        setLocalTokens(nt);
                                                        pushTokensUpdate(nt);
                                                    }}/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABA: BANCO DE MAPAS */}
                        {managerTab === 'SAVED' && (
                            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto custom-scrollbar">
                                {savedMaps.map((map, i) => (
                                    <div key={i} className="group relative aspect-video bg-black border border-white/20 rounded hover:border-gold transition-all overflow-hidden">
                                        <img src={map.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 w-full bg-black/80 p-2">
                                            <p className="text-white font-bold text-sm truncate">{map.name}</p>
                                            <p className="text-white/50 text-[10px]">Grid: {map.gridSizePx}px | {map.tokens.length} Inimigos</p>
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-sm">
                                            <button onClick={() => loadMapFromBank(map)} className="bg-gold px-3 py-1 rounded text-black text-xs font-bold flex items-center gap-1"><Upload /> CARREGAR</button>
                                            <button onClick={async () => {
                                                if(confirm("Deletar mapa do banco?")) {
                                                    await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_maps: arrayRemove(map) });
                                                }
                                            }} className="bg-red-600 p-2 rounded text-white"><Trash /></button>
                                        </div>
                                    </div>
                                ))}
                                {savedMaps.length === 0 && <div className="col-span-3 text-white/30 text-center py-10">Nenhum mapa salvo no banco.</div>}
                            </div>
                        )}

                        {/* ABA: BANCO DE INIMIGOS */}
                        {managerTab === 'ENEMIES' && (
                            <div className="flex gap-4 h-full">
                                <div className="w-1/3 bg-black/40 p-4 border-r border-white/10">
                                    <h3 className="text-white font-bold text-sm mb-4">Adicionar ao Banco</h3>
                                    <input className="w-full bg-black/50 border border-white/20 p-2 text-white text-sm mb-2 rounded" placeholder="Nome do Inimigo" value={inputEnemyName} onChange={e=>setInputEnemyName(e.target.value)} />
                                    <input className="w-full bg-black/50 border border-white/20 p-2 text-white text-sm mb-2 rounded" placeholder="URL da Imagem" value={inputEnemyImg} onChange={e=>setInputEnemyImg(e.target.value)} />
                                    <button onClick={saveEnemyToBank} className="w-full bg-green-700 text-white font-bold py-2 rounded text-xs hover:bg-green-600 flex items-center justify-center gap-2"><Plus /> CADASTRAR</button>
                                </div>
                                <div className="w-2/3 grid grid-cols-4 gap-2 content-start overflow-y-auto custom-scrollbar">
                                    {savedEnemies.map((enemy, i) => (
                                        <div key={i} className="group relative aspect-square bg-black border border-white/20 rounded hover:border-red-500 transition-all cursor-pointer" onClick={() => spawnSavedEnemy(enemy)}>
                                            <img src={enemy.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                            <div className="absolute bottom-0 w-full bg-black/80 text-center py-1">
                                                <p className="text-white text-[10px] truncate px-1">{enemy.name}</p>
                                            </div>
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if(confirm("Remover inimigo do banco?")) {
                                                        updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_enemies: arrayRemove(enemy) });
                                                    }
                                                }} className="bg-red-600 text-white p-1 rounded-full"><Trash size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                     </div>
                 </div>
             </div>
        )}
    </>
  );
}