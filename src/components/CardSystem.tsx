import { useState, useEffect } from 'react';
import { X, HandGrabbing, Stack, ArrowsOutSimple, MagnifyingGlass, LockKey, Plus } from '@phosphor-icons/react';

interface Card {
  caminho: string;
  nome: string;
  categoria: string;
}

interface CardSystemProps {
  character: {
    class: string;
    subclass: string;
    ancestry: string;
    community: string;
  };
  allCards: Card[];
}

export default function CardSystem({ character, allCards }: CardSystemProps) {
  // --- PROTEÇÃO CONTRA ERRO ---
  const safeCards = Array.isArray(allCards) ? allCards : [];

  const [hand, setHand] = useState<Card[]>([]);
  const [reserve, setReserve] = useState<Card[]>([]);
  
  // Cartas fixas na mesa
  const [ancestryCard, setAncestryCard] = useState<Card | null>(null);
  const [communityCard, setCommunityCard] = useState<Card | null>(null);
  
  // Subclasse: [0]=Fundamental, [1]=Vazio, [2]=Vazio
  const [subclassCards, setSubclassCards] = useState<(Card | null)[]>([null, null, null]);

  // Modals e Busca
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<{ card: Card, source: 'hand' | 'grimoire' | 'reserve' | 'table' } | null>(null);

  useEffect(() => {
    if (!character || safeCards.length === 0) return;

    // 1. Busca Ancestralidade e Comunidade (Correspondência exata com o JSON)
    const anc = safeCards.find(c => 
      c.categoria === "Ancestralidade" && 
      c.nome.toLowerCase().includes(character.ancestry.toLowerCase())
    );
    
    const com = safeCards.find(c => 
      c.categoria === "Comunidade" && 
      c.nome.toLowerCase().includes(character.community.toLowerCase())
    );
    
    setAncestryCard(anc || null);
    setCommunityCard(com || null);

    // 2. Busca a Carta FUNDAMENTAL da Subclasse
    // Aqui buscamos dentro da categoria "Classes" especificamente para montar o topo da mesa
    const fundamental = safeCards.find(c => 
      c.categoria === "Classes" &&
      c.nome.toLowerCase().includes(character.subclass.toLowerCase()) &&
      c.nome.toLowerCase().includes("fundamental") // Garante que pega a carta Fundamental
    );
    
    // Se não achar a "Fundamental" exata, tenta pegar a primeira que coincida com a subclasse
    const fallbackSub = safeCards.find(c => 
      c.categoria === "Classes" &&
      c.nome.toLowerCase().includes(character.subclass.toLowerCase())
    );

    setSubclassCards([fundamental || fallbackSub || null, null, null]);

    // Mão Inicial
    if (hand.length === 0) {
      const startingHand = safeCards.filter(c => c.categoria === 'Talento').slice(0, 2);
      setHand(startingHand);
    }

  }, [character, safeCards]);

  const drawCard = (card: Card) => {
    if (hand.length >= 5) {
      alert("Sua mão está cheia (Máx 5). Mova cartas para a reserva.");
      return;
    }
    if (hand.some(c => c.nome === card.nome)) {
      alert("Você já tem essa carta na mão.");
      return;
    }
    setHand([...hand, card]);
    setShowGrimoire(false);
    setSearchTerm('');
  };

  const moveToReserve = (index: number) => {
    const card = hand[index];
    setHand(hand.filter((_, i) => i !== index));
    setReserve([...reserve, card]);
    setSelectedCard(null);
  };

  const retrieveFromReserve = (index: number) => {
    if (hand.length >= 5) {
        alert("Mão cheia! Descarte algo antes.");
        return;
    }
    const card = reserve[index];
    setReserve(reserve.filter((_, i) => i !== index));
    setHand([...hand, card]);
    setShowReserve(false);
  };

  const TableCard = ({ card, label }: { card: Card | null, label: string }) => {
    if (!card) return (
      <div className="w-20 h-28 border border-white/10 rounded bg-white/5 flex flex-col items-center justify-center text-[8px] text-white/30 uppercase tracking-widest text-center px-1 gap-2 border-dashed border-white/20">
        <Plus size={16} />
        <span>{label}</span>
      </div>
    );
    
    return (
      <div 
        onClick={() => setSelectedCard({ card, source: 'table' })}
        className="group relative w-20 h-28 md:w-24 md:h-36 rounded border border-white/20 bg-black/50 transition-all duration-300 hover:scale-[2.5] hover:z-50 hover:translate-y-20 cursor-help shadow-lg origin-top"
      >
        <img src={card.caminho} className="w-full h-full object-cover rounded opacity-90 group-hover:opacity-100" />
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-gold/30 transition-opacity z-50">
          {label}
        </span>
        <div className="absolute bottom-1 right-1 text-white/20 group-hover:hidden">
            <LockKey size={12} weight="fill" />
        </div>
      </div>
    );
  };

  // --- CORREÇÃO DEFINITIVA DO FILTRO ---
  const filteredGrimoire = safeCards.filter(c => {
    // 1. LISTA DE PERMISSÃO (WHITELIST)
    // Só permite EXATAMENTE estas categorias do seu JSON
    const categoriasPermitidas = ["Feitiço", "Grimório", "Talento"];
    
    if (!categoriasPermitidas.includes(c.categoria)) {
      return false; // Se for "Classes", "Ancestralidade" ou "Comunidade", cai fora aqui.
    }

    // 2. Busca por Texto
    return c.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      {/* 1. MESA (TOPO) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-start gap-4 md:gap-8 z-40 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
          <TableCard card={ancestryCard} label="Ancestralidade" />
          <TableCard card={communityCard} label="Comunidade" />
        </div>
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-gold/50 to-transparent"></div>
        <div className="flex gap-1 pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
          <TableCard card={subclassCards[0]} label="Fundamental" />
          <TableCard card={subclassCards[1]} label="Especialização" />
          <TableCard card={subclassCards[2]} label="Maestria" />
        </div>
      </div>

      {/* 2. GRIMÓRIO (BOTÃO) */}
      <div className="absolute bottom-8 right-8 z-40">
        <button 
          onClick={() => setShowGrimoire(true)}
          className="group relative w-28 h-28 hover:scale-110 transition-transform active:scale-95 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <img src="/pote_deck.png" alt="Grimório" className="w-full h-full object-contain" />
          <div className="absolute inset-0 flex items-center justify-center pt-4">
             <span className="font-rpg text-gold font-bold text-shadow text-lg group-hover:text-white transition-colors">Grimório</span>
          </div>
        </button>
      </div>

      {/* 3. RESERVA (BOTÃO) */}
      <div className="absolute bottom-8 left-8 z-40">
        <button 
          onClick={() => setShowReserve(true)}
          className="relative w-24 h-32 bg-dungeon-stone border border-white/20 rounded-lg shadow-2xl hover:border-gold hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all group flex items-center justify-center"
        >
          {reserve.length > 0 ? (
             <>
               <div className="absolute top-1 left-1 w-full h-full bg-black/50 rounded-lg -z-10 border border-white/10"></div>
               <div className="absolute top-2 left-2 w-full h-full bg-black/50 rounded-lg -z-20 border border-white/10"></div>
               <div className="w-full h-full rounded-lg overflow-hidden relative">
                 <img src={reserve[reserve.length-1].caminho} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                    <span className="text-2xl font-bold text-white drop-shadow-md">{reserve.length}</span>
                 </div>
               </div>
             </>
          ) : (
            <div className="text-center p-2">
              <Stack size={24} className="mx-auto text-white/20 mb-1" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest block">Reserva</span>
            </div>
          )}
        </button>
      </div>

      {/* 4. MÃO */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-48 flex items-end justify-center z-30 pointer-events-none">
        <div className="flex items-end justify-center -space-x-12 pb-6 pointer-events-auto perspective-500">
          {hand.map((card, idx) => {
            const total = hand.length;
            const rotation = (idx - (total - 1) / 2) * 6; 
            const translateY = Math.abs(idx - (total - 1) / 2) * 15;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedCard({ card, source: 'hand' })}
                className="relative w-40 h-60 rounded-xl shadow-[-5px_5px_15px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-300 cursor-pointer origin-bottom hover:z-50 hover:scale-110 hover:-translate-y-24 hover:rotate-0 hover:border-gold bg-cover bg-center bg-[#1a120b]"
                style={{ 
                  backgroundImage: `url('${card.caminho}')`,
                  transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                  zIndex: idx
                }}
              >
                <div className="absolute inset-0 bg-white/0 hover:bg-white/10 rounded-xl transition-colors"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL (Grimório/Reserva) */}
      {(showGrimoire || showReserve) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[85%] h-[85%] bg-[#0f0b15]/90 border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-4">
              <h2 className="text-3xl text-gold font-rpg">{showGrimoire ? "Seu Grimório" : "Pilha de Reserva"}</h2>
              
              {showGrimoire && (
                 <div className="relative w-full md:w-96">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                    <input 
                      type="text" 
                      placeholder="Buscar Feitiço, Talento ou Grimório..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white focus:border-gold outline-none transition-colors"
                      autoFocus
                    />
                 </div>
              )}

              <button onClick={() => { setShowGrimoire(false); setShowReserve(false); setSearchTerm(''); }} className="hover:bg-red-500/20 p-2 rounded-full transition-colors group">
                <X size={28} className="text-white/50 group-hover:text-red-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 custom-scrollbar">
              {showGrimoire && filteredGrimoire.map((card, idx) => (
                <div key={idx} onClick={() => drawCard(card)} className="cursor-pointer group flex flex-col items-center">
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-gold transition-all group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <img src={card.caminho} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-center text-xs text-white/40 mt-3 group-hover:text-white transition-colors truncate w-full">{card.nome}</p>
                </div>
              ))}

              {showReserve && reserve.map((card, idx) => (
                <div key={idx} onClick={() => retrieveFromReserve(idx)} className="cursor-pointer group hover:-translate-y-2 transition-transform">
                   <img src={card.caminho} className="w-full rounded-lg shadow-lg opacity-80 hover:opacity-100" />
                   <p className="text-center text-xs text-white/30 mt-2">Recuperar</p>
                </div>
              ))}

              {showGrimoire && filteredGrimoire.length === 0 && <div className="col-span-full text-center text-white/30 py-20">Nenhuma carta disponível.</div>}
              {showReserve && reserve.length === 0 && <div className="col-span-full flex flex-col items-center justify-center text-white/20 h-40"><Stack size={48} className="mb-2"/><p>Reserva vazia.</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM */}
      {selectedCard && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedCard(null)}>
          <div className="relative flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full p-4" onClick={e => e.stopPropagation()}>
            <div className="relative h-[65vh] aspect-[2/3] rounded-xl shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/20 overflow-hidden transform transition-transform hover:scale-[1.02]">
              <img src={selectedCard.card.caminho} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-4 min-w-[300px]">
              <h3 className="text-3xl font-rpg text-white mb-2">{selectedCard.card.nome}</h3>
              <span className="text-xs uppercase tracking-widest text-gold border border-gold/30 px-2 py-1 rounded w-fit mb-4">{selectedCard.card.categoria}</span>

              {selectedCard.source === 'hand' && (
                <>
                  <button className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/50 text-blue-100 rounded hover:from-blue-800 hover:to-blue-700 hover:border-blue-400 transition-all group">
                    <HandGrabbing size={32} className="text-blue-400 group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Usar Carta</span><span className="text-xs opacity-60">Ativar e manter</span></div>
                  </button>
                  <button onClick={() => { const idx = hand.findIndex(c => c.nome === selectedCard.card.nome); if (idx > -1) moveToReserve(idx); }} className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 text-gray-300 rounded hover:bg-white/10 hover:border-white/30 transition-all group">
                    <Stack size={32} className="text-gray-500 group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Reserva</span><span className="text-xs opacity-60">Guardar</span></div>
                  </button>
                </>
              )}
              
              <button onClick={() => setSelectedCard(null)} className="mt-4 flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors"><ArrowsOutSimple size={20} /> Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}