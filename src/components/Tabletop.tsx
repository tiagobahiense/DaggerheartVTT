import { auth } from '../lib/firebase';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { 
  X, MapTrifold, Plus, Trash, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Ruler, Minus, FloppyDisk, Upload, GridFour,
  PawPrint, PencilSimple, Sword, Skull
} from '@phosphor-icons/react';
import DraggableWindow from './DraggableWindow';

// --- INTERFACES COMPARTILHADAS ---
// (Adicionamos as interfaces de Stats aqui para salvar no banco)
interface Ability {
  name: string;
  tag: string;
  description: string;
}

interface EnemyStats {
  type: string;
  description: string;
  motivations: string;
  difficulty: number;
  thresholdMajor: number;
  thresholdMinor: number;
  maxPV: number;
  currentPV: number;
  maxPF: number;
  currentPF: number;
  atqBonus: string;
  weaponName: string;
  damageType: string;
  damageFormula: string;
  abilities: Ability[];
}

interface Token {
  id: string;
  charId?: string;
  ownerId?: string;
  name: string;
  img: string;
  x: number;
  y: number;
  size: number;
  type: 'player' | 'enemy' | 'companion'; 
  visible: boolean;
  imgOffX: number;
  imgOffY: number;
  imgScale: number;
  stats?: EnemyStats; // Token agora carrega os stats completos
}

interface MapData {
  url: string;
  name: string;
  gridSizePx: number;
  globalZoom: number; 
  globalPanX: number;
  globalPanY: number;
  tokens: Token[];
}

interface SavedMap {
    name: string;
    url: string;
    gridSizePx: number;
    tokens: Token[];
}

interface SavedEnemy {
    name: string;
    img: string;
    defaultSize: number;
    stats: EnemyStats; // O inimigo salvo TEM que ter stats
}

const DEFAULT_STATS: EnemyStats = {
    type: "Comum (1º Patamar)", 
    description: "", 
    motivations: "",
    difficulty: 10, 
    thresholdMajor: 5, 
    thresholdMinor: 10,
    maxPV: 10, 
    currentPV: 10, 
    maxPF: 5, 
    currentPF: 5,
    atqBonus: "+0", 
    weaponName: "Ataque Básico", 
    damageType: "Físico", 
    damageFormula: "1d4",
    abilities: []
};

export default function Tabletop({ sessaoData, isMaster, charactersData, showManager, onCloseManager }: any) {
  // --- OTIMIZAÇÃO: MAPA DE PERSONAGENS (Lookup O(1)) ---
  const charMap = useMemo(() => {
      const map: Record<string, any> = {};
      if(charactersData && Array.isArray(charactersData)) {
          charactersData.forEach((c: any) => { map[c.id] = c; });
      }
      return map;
  }, [charactersData]);

  // --- ESTADOS GLOBAIS ---
  const [activeMap, setActiveMap] = useState<MapData | null>(null);
  const [localTokens, setLocalTokens] = useState<Token[]>([]);
  
  // --- VIEWPORT LOCAL ---
  const [localView, setLocalView] = useState({ zoom: 1, panX: 0, panY: 0 });
  const lastMapUrl = useRef<string | null>(null);

  // --- ESTADOS DE INTERAÇÃO ---
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isRulerMode, setIsRulerMode] = useState(false);
  
  const [rulerStart, setRulerStart] = useState<{x:number, y:number} | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{x:number, y:number} | null>(null);

  const [editingToken, setEditingToken] = useState<{id: string, screenX: number, screenY: number} | null>(null);

  // --- MESTRE: GERENCIADOR ---
  const [managerTab, setManagerTab] = useState<'MAPS' | 'ENEMIES' | 'SAVED'>('MAPS');
  const [inputMapUrl, setInputMapUrl] = useState("");
  const [inputMapName, setInputMapName] = useState("");
  const [inputGridSize, setInputGridSize] = useState(50);
  
  // Mestre: Editor de Inimigo do Banco
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [savedEnemies, setSavedEnemies] = useState<SavedEnemy[]>([]);
  const [editingEnemyBank, setEditingEnemyBank] = useState<SavedEnemy | null>(null); // Se !null, mostra o modal de edição

  const containerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef({ x: 0, y: 0 }); 
  const panStartView = useRef({ x: 0, y: 0 }); 
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- SINCRONIZAÇÃO ---
  useEffect(() => {
    if (sessaoData) {
        setSavedMaps(sessaoData.saved_maps || []);
        setSavedEnemies(sessaoData.saved_enemies || []);

        if (sessaoData.active_map) {
            const serverMap = sessaoData.active_map;
            
            if (serverMap.url !== lastMapUrl.current) {
                setLocalView({ zoom: 1, panX: 0, panY: 0 });
                lastMapUrl.current = serverMap.url;
            }

            setActiveMap(prev => {
                if (prev && 
                    prev.url === serverMap.url &&
                    prev.gridSizePx === serverMap.gridSizePx &&
                    JSON.stringify(prev.tokens) === JSON.stringify(serverMap.tokens)
                ) return prev;

                return {
                    ...serverMap,
                    gridSizePx: serverMap.gridSizePx || 50,
                    globalZoom: serverMap.globalZoom || 1,
                    globalPanX: serverMap.globalPanX || 0,
                    globalPanY: serverMap.globalPanY || 0,
                };
            });

            if (!draggingTokenId) {
                setLocalTokens(serverMap.tokens || []);
            }
        } else {
            setActiveMap(null);
            setLocalTokens([]);
            lastMapUrl.current = null;
        }
    }
  }, [sessaoData, draggingTokenId]);

  // --- HELPER DE PERMISSÃO ---
  const isTokenOwner = (token: Token) => {
      if (isMaster) return true;
      if (token.type === 'enemy') return false;
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return false;
      if (token.ownerId && token.ownerId === currentUserId) return true;
      if (token.charId && charMap[token.charId]) {
          const char = charMap[token.charId];
          if (char.playerId === currentUserId) return true;
      }
      return false;
  };

  const handleImageError = (e: any, token: Token) => {
      const target = e.target;
      if (target.getAttribute('data-error-handled')) return;
      target.setAttribute('data-error-handled', 'true');
      let fallbackUrl = '/default-token.png';
      if (token.charId && charMap[token.charId]) {
          const char = charMap[token.charId];
          if (char.imageUrl) fallbackUrl = char.imageUrl;
      }
      target.src = fallbackUrl;
  };

  // --- FIREBASE UPDATES ---
  const pushTokensUpdate = async (newTokens: Token[]) => {
      if (!sessaoData?.id) return;
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { "active_map.tokens": newTokens });
  };

  const saveMapToBank = async () => {
      if (!activeMap || !inputMapName) return alert("Defina um nome para o mapa atual (Use a aba Novo).");
      const newMapData: SavedMap = {
          name: inputMapName || activeMap.name,
          url: activeMap.url,
          gridSizePx: activeMap.gridSizePx,
          tokens: localTokens.filter(t => t.type === 'enemy')
      };
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_maps: arrayUnion(newMapData) });
      alert("Mapa salvo no banco!");
  };

  // --- GERENCIAMENTO DE BANCO DE INIMIGOS ---
  
  // 1. Criar novo (Abre o editor vazio)
  const startNewEnemy = () => {
      setEditingEnemyBank({
          name: "Novo Inimigo",
          img: "",
          defaultSize: 1,
          stats: { ...DEFAULT_STATS }
      });
  };

  // 2. Salvar ou Atualizar Inimigo no Banco
  const saveEnemyToBank = async () => {
      if (!editingEnemyBank || !editingEnemyBank.name || !editingEnemyBank.img) return alert("Preencha nome e imagem.");
      
      // Verifica se é edição (já existe no array) ou novo
      const existingIndex = savedEnemies.findIndex(e => e.name === editingEnemyBank.name); // *Nome é a chave primária simples aqui*
      
      let newEnemiesList = [...savedEnemies];
      
      if (existingIndex >= 0) {
          // Substitui
          newEnemiesList[existingIndex] = editingEnemyBank;
      } else {
          // Adiciona
          newEnemiesList.push(editingEnemyBank);
      }

      await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_enemies: newEnemiesList });
      setEditingEnemyBank(null);
  };

  // 3. Spawnar Inimigo (Copia os stats do banco para o Token)
  const spawnSavedEnemy = (enemy: SavedEnemy) => {
      const newToken: Token = {
          id: crypto.randomUUID(),
          name: enemy.name,
          img: enemy.img,
          x: 5, y: 5, size: enemy.defaultSize || 1,
          type: 'enemy',
          visible: false,
          imgOffX: 0, imgOffY: 0, imgScale: 1,
          stats: { ...enemy.stats, currentPV: enemy.stats.maxPV, currentPF: enemy.stats.maxPF } // Reseta HP ao spawnar
      };
      const updatedTokens = [...localTokens, newToken];
      setLocalTokens(updatedTokens);
      pushTokensUpdate(updatedTokens);
  };

  // --- INTERFACE DO EDITOR DE INIMIGO (DENTRO DO TABLETOP) ---
  const renderEnemyEditor = () => {
      if (!editingEnemyBank) return null;
      const stats = editingEnemyBank.stats;

      const handleChange = (field: keyof EnemyStats, value: any) => {
          setEditingEnemyBank({ ...editingEnemyBank, stats: { ...stats, [field]: value } });
      };

      const handleAbilityChange = (idx: number, field: keyof Ability, value: string) => {
          const newAbilities = [...stats.abilities];
          newAbilities[idx] = { ...newAbilities[idx], [field]: value };
          handleChange('abilities', newAbilities);
      };

      return (
          <div className="fixed inset-0 z-[10000001] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-[#1a120b] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gold rounded-lg shadow-2xl p-4 custom-scrollbar">
                  <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                      <h2 className="text-gold font-bold text-lg">Editor de Ficha (Banco)</h2>
                      <button onClick={() => setEditingEnemyBank(null)}><X className="text-white hover:text-red-500" size={24} /></button>
                  </div>

                  {/* Dados Básicos */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="text-xs text-white/50 block">Nome do Inimigo</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={editingEnemyBank.name} onChange={e => setEditingEnemyBank({...editingEnemyBank, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs text-white/50 block">URL da Imagem</label>
                          <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={editingEnemyBank.img} onChange={e => setEditingEnemyBank({...editingEnemyBank, img: e.target.value})} />
                      </div>
                  </div>

                  {/* Stats RPG */}
                  <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] uppercase text-white/50">Tipo/Patamar</label><input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={stats.type} onChange={e => handleChange('type', e.target.value)} /></div>
                            <div><label className="text-[10px] uppercase text-white/50">Descrição Visual</label><input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={stats.description} onChange={e => handleChange('description', e.target.value)} /></div>
                        </div>
                        <div><label className="text-[10px] uppercase text-white/50">Motivações</label><textarea className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm h-16 resize-none" value={stats.motivations} onChange={e => handleChange('motivations', e.target.value)} /></div>
                        
                        <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded">
                            <div><label className="text-[10px] uppercase text-gold text-center block">Dificuldade</label><input type="number" className="w-full bg-black text-white text-center font-bold" value={stats.difficulty} onChange={e => handleChange('difficulty', Number(e.target.value))} /></div>
                            <div><label className="text-[10px] uppercase text-red-400 text-center block">PV Máx</label><input type="number" className="w-full bg-black text-red-200 text-center font-bold" value={stats.maxPV} onChange={e => handleChange('maxPV', Number(e.target.value))} /></div>
                            <div><label className="text-[10px] uppercase text-blue-400 text-center block">PF Máx</label><input type="number" className="w-full bg-black text-blue-200 text-center font-bold" value={stats.maxPF} onChange={e => handleChange('maxPF', Number(e.target.value))} /></div>
                            <div><label className="text-[10px] uppercase text-white/50 text-center block">Limiares (Me/Ma)</label><div className="flex gap-1"><input type="number" className="w-full bg-black text-white text-xs text-center" value={stats.thresholdMajor} onChange={e => handleChange('thresholdMajor', Number(e.target.value))} /><input type="number" className="w-full bg-black text-white text-xs text-center" value={stats.thresholdMinor} onChange={e => handleChange('thresholdMinor', Number(e.target.value))} /></div></div>
                        </div>

                        <div className="flex gap-2 items-center bg-white/5 p-2 rounded">
                            <Sword size={20} className="text-white/50" />
                            <div className="w-16"><label className="text-[8px] uppercase text-white/50">ATQ</label><input className="w-full bg-black text-white text-center font-bold" value={stats.atqBonus} onChange={e => handleChange('atqBonus', e.target.value)} /></div>
                            <div className="flex-1"><label className="text-[8px] uppercase text-white/50">Arma</label><input className="w-full bg-black text-white px-2 text-sm" value={stats.weaponName} onChange={e => handleChange('weaponName', e.target.value)} /></div>
                            <div className="w-24"><label className="text-[8px] uppercase text-white/50">Dano</label><input className="w-full bg-black text-white px-2 text-sm" value={stats.damageFormula} onChange={e => handleChange('damageFormula', e.target.value)} /></div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase text-gold font-bold">Habilidades</label>
                                <button onClick={() => handleChange('abilities', [...stats.abilities, {name: "Nova", tag: "Ação", description: ""}])} className="text-[10px] bg-gold text-black px-2 rounded font-bold">+ Add</button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {stats.abilities.map((ab, idx) => (
                                    <div key={idx} className="bg-black/40 border border-white/5 rounded p-2 relative group">
                                        <div className="flex gap-2 mb-1">
                                            <input className="flex-1 bg-transparent border-b border-white/10 text-white font-bold text-sm" value={ab.name} onChange={e => handleAbilityChange(idx, 'name', e.target.value)} />
                                            <input className="w-20 bg-transparent border-b border-white/10 text-white/50 text-xs text-right" value={ab.tag} onChange={e => handleAbilityChange(idx, 'tag', e.target.value)} />
                                        </div>
                                        <textarea className="w-full bg-transparent text-white/80 text-xs resize-none" value={ab.description} onChange={e => handleAbilityChange(idx, 'description', e.target.value)} />
                                        <button onClick={() => {
                                            const newAbs = [...stats.abilities];
                                            newAbs.splice(idx, 1);
                                            handleChange('abilities', newAbs);
                                        }} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100"><Trash size={12}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setEditingEnemyBank(null)} className="px-4 py-2 text-white/50 hover:text-white">Cancelar</button>
                      <button onClick={saveEnemyToBank} className="px-6 py-2 bg-gold text-black font-bold rounded shadow-lg hover:bg-yellow-500 flex items-center gap-2"><FloppyDisk weight="fill" /> SALVAR NO BANCO</button>
                  </div>
              </div>
          </div>
      );
  };

  const loadMapFromBank = async (savedMap: SavedMap) => {
      if(!confirm(`Carregar ${savedMap.name}? O mapa atual será substituído.`)) return;
      const enemiesHidden = savedMap.tokens.map(t => ({ ...t, visible: false }));
      const newActiveMap = {
          url: savedMap.url,
          name: savedMap.name,
          gridSizePx: savedMap.gridSizePx || 50,
          globalZoom: 1, globalPanX: 0, globalPanY: 0,
          tokens: enemiesHidden
      };
      await updateDoc(doc(db, 'sessoes', sessaoData.id), { active_map: newActiveMap });
  };

  // --- RENDER DO TABLETOP (CÓDIGO ORIGINAL COM AJUSTES) ---
  const getSceneCoord = (clientX: number, clientY: number) => {
      if (!containerRef.current || !activeMap) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = ((clientX - rect.left) - localView.panX) / localView.zoom;
      const worldY = ((clientY - rect.top) - localView.panY) / localView.zoom;
      return { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (!activeMap) return;
      if ((e.target as HTMLElement).closest('button')) return; 
      
      if (isRulerMode) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          setRulerStart(coords);
          setRulerEnd(coords);
          return;
      }
      if (!draggingTokenId) {
          setIsPanning(true);
          panStart.current = { x: e.clientX, y: e.clientY };
          panStartView.current = { x: localView.panX, y: localView.panY };
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!activeMap) return;
      if (isRulerMode && rulerStart) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          setRulerEnd(coords);
          return;
      }
      if (draggingTokenId) {
          const coords = getSceneCoord(e.clientX, e.clientY);
          const gridX = Math.round((coords.x - dragOffset.current.x) / activeMap.gridSizePx);
          const gridY = Math.round((coords.y - dragOffset.current.y) / activeMap.gridSizePx);
          setLocalTokens(prev => prev.map(t => {
              if (t.id === draggingTokenId) return { ...t, x: gridX, y: gridY };
              return t;
          }));
          return;
      }
      if (isPanning) {
          const dx = e.clientX - panStart.current.x;
          const dy = e.clientY - panStart.current.y;
          setLocalView(prev => ({
              ...prev,
              panX: panStartView.current.x + dx,
              panY: panStartView.current.y + dy
          }));
      }
  };

  const handleMouseUp = () => {
      if (isRulerMode) { setRulerStart(null); setRulerEnd(null); }
      if (draggingTokenId) {
          pushTokensUpdate(localTokens);
          setDraggingTokenId(null);
      }
      if (isPanning) setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (!activeMap) return;
      e.stopPropagation();
      const newZoom = Math.max(0.1, Math.min(5, localView.zoom - (e.deltaY * 0.001)));
      setLocalView(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleTokenMouseDown = (e: React.MouseEvent, token: Token) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (isRulerMode) return;
      if (!isTokenOwner(token)) return;

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
      if (!isTokenOwner(token)) return;
      setEditingToken({ id: token.id, screenX: e.clientX + 20, screenY: e.clientY - 50 });
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

  // --- RENDER ---
  return (
    <>
        {activeMap && (
            <DraggableWindow 
                title={activeMap.name} 
                onClose={isMaster ? () => { setActiveMap(null); updateDoc(doc(db, 'sessoes', sessaoData.id), { active_map: null }); } : undefined}
                headerIcon={<MapTrifold size={20} />}
                initialWidth="95vw" initialHeight="85vh"
                minimizedPosition="top-right"
            >
                <div 
                    ref={containerRef}
                    className={`relative w-full h-full bg-[#101010] overflow-hidden ${isRulerMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div style={{ transform: `translate3d(${localView.panX}px, ${localView.panY}px, 0) scale(${localView.zoom})`, transformOrigin: 'top left', width: '0px', height: '0px' }}>
                        <img src={activeMap.url} className="max-w-none select-none pointer-events-none" draggable={false} />
                        <div className="absolute inset-0 pointer-events-none opacity-30 z-[5]" style={{ width: '5000px', height: '5000px', backgroundSize: `${activeMap.gridSizePx}px ${activeMap.gridSizePx}px`, backgroundImage: 'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)' }} />

                        {localTokens.map(token => {
                            if (!isMaster && !token.visible) return null; 
                            const isEditing = editingToken?.id === token.id;
                            const canMove = isTokenOwner(token);
                            const width = token.size * activeMap.gridSizePx;
                            const height = token.size * activeMap.gridSizePx;
                            const borderClass = token.type === 'player' ? 'border-green-500' : token.type === 'companion' ? 'border-cyan-400' : 'border-red-500';
                            const shapeClass = (token.type === 'player' || token.type === 'companion') ? 'rounded-full' : 'rounded-sm';
                            
                            let displayImg = token.img;
                            const foundChar = token.charId ? charMap[token.charId] : null;
                            if (foundChar) {
                                if (token.type === 'companion') displayImg = foundChar.companion?.image || token.img || foundChar.imageUrl || '/default-token.png';
                                else if (token.type === 'player') displayImg = foundChar.imageUrl || token.img;
                            }

                            return (
                                <div key={token.id} className={`absolute z-[10] group transition-opacity ${isEditing ? 'z-[30] ring-2 ring-gold' : ''} ${canMove ? 'cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-white/50' : 'cursor-default'}`}
                                    style={{ left: token.x * activeMap.gridSizePx, top: token.y * activeMap.gridSizePx, width: width, height: height, opacity: !token.visible ? 0.5 : 1 }}
                                    onMouseDown={(e) => handleTokenMouseDown(e, token)}
                                    onDoubleClick={(e) => handleTokenDoubleClick(e, token)}
                                    onDragStart={(e) => e.preventDefault()} 
                                >
                                    <div className={`w-full h-full overflow-hidden shadow-lg ${shapeClass} border-2 ${borderClass} bg-black relative`}>
                                        <img src={displayImg} onError={(e) => handleImageError(e, token)} className="max-w-none w-full h-full object-contain pointer-events-none select-none" style={{ transform: `scale(${token.imgScale}) translate(${token.imgOffX}px, ${token.imgOffY}px)` }} draggable={false} />
                                        {token.type === 'companion' && (<div className="absolute bottom-0 right-0 p-0.5 bg-cyan-900/80 rounded-tl"><PawPrint size={10} className="text-cyan-200" weight="fill" /></div>)}
                                    </div>
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none border border-white/20 z-[30]">{token.name}</div>
                                </div>
                            );
                        })}

                        {rulerStart && rulerEnd && (
                            <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-[100] overflow-visible">
                                <line x1={rulerStart.x} y1={rulerStart.y} x2={rulerEnd.x} y2={rulerEnd.y} stroke="#fbbf24" strokeWidth={2 / localView.zoom} strokeDasharray={`${10/localView.zoom},${5/localView.zoom}`} />
                                <text x={rulerEnd.x + 10} y={rulerEnd.y} fill="#fbbf24" fontSize={20 / localView.zoom} fontWeight="bold" style={{ textShadow: '2px 2px 0px black' }}>{`${(Math.sqrt(Math.pow(rulerEnd.x - rulerStart.x, 2) + Math.pow(rulerEnd.y - rulerStart.y, 2)) / activeMap.gridSizePx * 1.5).toFixed(1)}m`}</text>
                            </svg>
                        )}
                    </div>

                    <div className="absolute top-4 left-4 flex flex-col gap-2 bg-black/80 p-2 rounded border border-white/20 z-[500]">
                        <button onClick={() => setIsRulerMode(!isRulerMode)} className={`p-2 rounded ${isRulerMode ? 'bg-gold text-black' : 'text-white hover:bg-white/10'}`} title="Régua"><Ruler size={24} /></button>
                        <div className="h-[1px] bg-white/20 my-1"></div>
                        <button onClick={() => setLocalView(prev => ({ ...prev, zoom: prev.zoom + 0.1 }))} className="text-white hover:text-gold"><Plus /></button>
                        <span className="text-xs text-center text-white select-none">{Math.round(localView.zoom * 100)}%</span>
                        <button onClick={() => setLocalView(prev => ({ ...prev, zoom: prev.zoom - 0.1 }))} className="text-white hover:text-gold"><Minus /></button>
                    </div>

                    {editingToken && (
                        <div className="fixed z-[9999999] bg-[#1a120b] border border-gold p-3 rounded-lg shadow-2xl animate-scale-up w-64" style={{ left: editingToken.screenX, top: editingToken.screenY }} onMouseDown={(e) => e.stopPropagation()}>
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
                                <div className="flex justify-between items-center"><label className="text-xs text-white">Zoom Img</label><input type="range" min="0.5" max="3" step="0.1" value={localTokens.find(t=>t.id===editingToken.id)?.imgScale||1} onChange={e=>updateEditingToken({imgScale: parseFloat(e.target.value)})} className="w-24 accent-gold" /></div>
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-white">Células</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(s => (<button key={s} onClick={() => updateEditingToken({ size: s })} className={`w-6 h-6 text-xs font-bold border ${localTokens.find(t=>t.id===editingToken.id)?.size === s ? 'bg-gold text-black border-gold' : 'bg-black text-white border-white/20'}`}>{s}</button>))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-white/10">
                                    {isMaster && (<button onClick={() => updateEditingToken({ visible: !localTokens.find(t=>t.id===editingToken.id)?.visible })} className={`flex-1 py-1 rounded text-xs border ${localTokens.find(t=>t.id===editingToken.id)?.visible ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>{localTokens.find(t=>t.id===editingToken.id)?.visible ? 'Visível' : 'Oculto'}</button>)}
                                    <button onClick={deleteEditingToken} className="p-1 bg-red-900/50 border border-red-500 text-red-400 rounded hover:bg-red-600 hover:text-white"><Trash size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DraggableWindow>
        )}

        {/* MODAL DO GERENCIADOR (MESTRE) */}
        {isMaster && showManager && (
             <div className="fixed inset-0 z-[10000000] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
                        {managerTab === 'MAPS' && (
                            /* ... Conteúdo de Mapas mantido similar ao original, apenas abreviado para focar na mudança ... */
                            <div className="flex flex-col gap-4 h-full">
                                <div className="bg-black/40 p-4 rounded border border-white/10">
                                    <h3 className="text-white text-sm mb-2 font-bold">Definir Mapa Ativo</h3>
                                    <div className="flex gap-2 mb-2">
                                        <input className="bg-black/50 border border-white/20 p-2 text-white text-sm flex-1" placeholder="Nome do Mapa" value={inputMapName} onChange={e=>setInputMapName(e.target.value)} />
                                        <input className="bg-black/50 border border-white/20 p-2 text-white text-sm flex-[2]" placeholder="URL da Imagem" value={inputMapUrl} onChange={e=>setInputMapUrl(e.target.value)} />
                                        <div className="flex items-center gap-2 bg-black/50 border border-white/20 px-2 rounded">
                                            <GridFour className="text-white/50" />
                                            <input type="number" className="bg-transparent text-white text-sm w-12 outline-none" value={inputGridSize} onChange={e => setInputGridSize(Number(e.target.value))} />
                                            <span className="text-xs text-white/30">px</span>
                                        </div>
                                    </div>
                                    <button onClick={async () => {
                                            if(!inputMapUrl) return;
                                            await updateDoc(doc(db, 'sessoes', sessaoData.id), { 
                                                active_map: { url: inputMapUrl, name: inputMapName || "Mapa", gridSizePx: inputGridSize, globalZoom: 1, globalPanX: 0, globalPanY: 0, tokens: [] } 
                                            });
                                            setActiveMap({ url: inputMapUrl, name: inputMapName || "Mapa", gridSizePx: inputGridSize, globalZoom: 1, globalPanX: 0, globalPanY: 0, tokens: [] });
                                        }} className="w-full bg-gold text-black font-bold py-2 rounded hover:bg-yellow-500">PROJETAR MAPA</button>
                                </div>
                                <div className="flex-1 bg-black/20 p-4 rounded border border-white/10 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-white text-xs opacity-50 uppercase">Jogadores</h3>
                                        <button onClick={saveMapToBank} className="text-gold text-xs flex items-center gap-1 hover:underline"><FloppyDisk /> Salvar Estado</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                            {charactersData.map((c:any) => (
                                                <button key={c.id} onClick={async () => {
                                                    if (!activeMap) return alert("Projete um mapa primeiro");
                                                    const newToken: Token = { 
                                                        id: crypto.randomUUID(), charId: c.id, ownerId: c.playerId, name: c.name, 
                                                        img: c.imageUrl || '/default-token.png', x: 2, y: 2, size: 1, type: 'player', visible: true, imgOffX: 0, imgOffY: 0, imgScale: 1 
                                                    };
                                                    let tokensToAdd = [newToken];
                                                    if (c.class === 'Patrulheiro' && c.subclass === 'Treinador') {
                                                        tokensToAdd.push({
                                                            id: crypto.randomUUID(), charId: c.id, ownerId: c.playerId, name: c.companionName || `${c.name} (Comp.)`,
                                                            img: c.companion?.image || c.imageUrl || '/default-token.png', x: 3, y: 2, size: 1, type: 'companion', visible: true, imgOffX: 0, imgOffY: 0, imgScale: 1
                                                        });
                                                    }
                                                    const newTokens = [...localTokens, ...tokensToAdd];
                                                    setLocalTokens(newTokens);
                                                    await pushTokensUpdate(newTokens);
                                                }} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded hover:border-gold">
                                                    <img src={c.imageUrl} className="w-6 h-6 rounded-full"/> <span className="text-white text-xs">{c.name}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {managerTab === 'SAVED' && (
                            <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto custom-scrollbar">
                                {savedMaps.map((map, i) => (
                                    <div key={i} className="group relative aspect-video bg-black border border-white/20 rounded hover:border-gold transition-all overflow-hidden">
                                        <img src={map.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 w-full bg-black/80 p-2">
                                            <p className="text-white font-bold text-sm truncate">{map.name}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-sm">
                                            <button onClick={() => loadMapFromBank(map)} className="bg-gold px-3 py-1 rounded text-black text-xs font-bold flex items-center gap-1"><Upload /> CARREGAR</button>
                                            <button onClick={async () => { if(confirm("Deletar?")) await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_maps: arrayRemove(map) }); }} className="bg-red-600 p-2 rounded text-white"><Trash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- NOVA ABA DE INIMIGOS --- */}
                        {managerTab === 'ENEMIES' && (
                            <div className="flex flex-col h-full">
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="text-white font-bold text-sm">Biblioteca de Inimigos (Clique para Editar)</h3>
                                    <button onClick={startNewEnemy} className="bg-green-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 hover:bg-green-600">
                                        <Plus size={16} /> CRIAR NOVO MODELO
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto custom-scrollbar p-2">
                                    {savedEnemies.map((enemy, i) => (
                                        <div key={i} className="group relative bg-[#0a0a0a] border border-white/20 rounded-lg hover:border-gold transition-all flex flex-col overflow-hidden">
                                            {/* Área de Spawn (Imagem) */}
                                            <div className="relative aspect-square cursor-pointer overflow-hidden bg-black" onClick={() => spawnSavedEnemy(enemy)} title="Clique para Spawnar no Mapa">
                                                <img src={enemy.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-opacity">
                                                    <span className="text-gold font-bold text-xs uppercase tracking-widest border border-gold px-2 py-1 rounded bg-black/50">Spawnar</span>
                                                </div>
                                            </div>
                                            
                                            {/* Rodapé (Nome e Editar) */}
                                            <div className="bg-[#151515] p-2 flex justify-between items-center border-t border-white/10">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-white font-bold text-xs truncate" title={enemy.name}>{enemy.name}</span>
                                                    <span className="text-[9px] text-white/50 truncate">Dificuldade {enemy.stats?.difficulty || 10}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditingEnemyBank(enemy)} className="p-1.5 text-white/50 hover:text-blue-400 hover:bg-blue-900/30 rounded" title="Editar Ficha"><PencilSimple size={14} /></button>
                                                    <button onClick={async () => { if(confirm("Remover do banco?")) { const newList = savedEnemies.filter(e => e.name !== enemy.name); await updateDoc(doc(db, 'sessoes', sessaoData.id), { saved_enemies: newList }); } }} className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-900/30 rounded" title="Excluir"><Trash size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {savedEnemies.length === 0 && <div className="col-span-4 text-center text-white/30 py-10">Nenhum inimigo cadastrado.</div>}
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
             </div>
        )}

        {/* RENDER DO EDITOR DE INIMIGO (SE ABERTO) */}
        {renderEnemyEditor()}
    </>
  );
}