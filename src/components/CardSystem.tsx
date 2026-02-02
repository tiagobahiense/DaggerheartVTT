import { useState, useEffect } from 'react';
import { X, HandGrabbing, Stack, MagnifyingGlass, ArrowUUpLeft, Eye } from '@phosphor-icons/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Card {
  caminho: string;
  nome: string;
  categoria: string;
}

interface CardSystemProps {
  character: any; 
  allCards: Card[];
}

export default function CardSystem({ character, allCards }: CardSystemProps) {
  const safeCards = Array.isArray(allCards) ? allCards : [];

  const [hand, setHand] = useState<Card[]>([]);
  const [reserve, setReserve] = useState<Card[]>([]);
  const [ancestryCard, setAncestryCard] = useState<Card | null>(null);
  const [communityCard, setCommunityCard] = useState<Card | null>(null);
  const [subclassCards, setSubclassCards] = useState<(Card | null)[]>([null, null, null]);

  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ card: Card, origin: 'hand' | 'reserve' | 'library' | 'fixed' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');

  // --- SINCRONIA COM F5 (CARREGAMENTO) ---
  useEffect(() => {
    if (character?.cards) {
        setHand(character.cards.hand || []);
        setReserve(character.cards.reserve || []);
        if (character.cards.fixed) {
            setAncestryCard(character.cards.fixed.ancestry || null);
            setCommunityCard(character.cards.fixed.community || null);
            setSubclassCards(character.cards.fixed.subclass || [null, null, null]);
        }
    } else if (character && safeCards.length > 0) {
        const anc = safeCards.find(c => c.nome.toLowerCase().includes(character.ancestry?.toLowerCase() || 'xyz'));
        const com = safeCards.find(c => c.nome.toLowerCase().includes(character.community?.toLowerCase() || 'xyz'));
        const sub = safeCards.find(c => c.nome.toLowerCase().includes(character.subclass?.toLowerCase() || 'xyz'));
        if (anc) setAncestryCard(anc);
        if (com) setCommunityCard(com);
        if (sub) setSubclassCards([sub, null, null]);
    }
  }, [character]); 

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    if (character?.id) {
        const timeoutId = setTimeout(() => { 
            const cardData = {
                hand,
                reserve,
                fixed: {
                    ancestry: ancestryCard,
                    community: communityCard,
                    subclass: subclassCards
                }
            };
            const charRef = doc(db, 'characters', character.id);
            updateDoc(charRef, { cards: cardData }).catch(e => console.error(e));
        }, 1000);
        return () => clearTimeout(timeoutId);
    }
  }, [hand, reserve, ancestryCard, communityCard, subclassCards]);

  // --- AÇÕES ---
  const addToHand = (card: Card) => {
    setHand(prev => [...prev, card]); 
    setSelectedCard(null);
    setShowGrimoire(false); 
  };

  const returnToGrimoire = (cardName: string) => {
      setHand(prev => prev.filter(c => c.nome !== cardName));
      setSelectedCard(null);
  };

  const moveToReserve = (index: number) => {
    const card = hand[index];
    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
    setReserve(prev => [...prev, card]);
    setSelectedCard(null);
  };

  const retrieveFromReserve = (index: number) => {
    const card = reserve[index];
    const newReserve = [...reserve];
    newReserve.splice(index, 1);
    setReserve(newReserve);
    setHand(prev => [...prev, card]);
    setSelectedCard(null);
  };

  // --- MINI CARD COM CORREÇÃO DE CORTE ---
  const MiniCard = ({ card, onClick, isFixed = false, originClass = "" }: { card: Card | null, onClick?: () => void, isFixed?: boolean, originClass?: string }) => {
    if (!card) return <div className="w-24 h-32 md:w-32 md:h-44 rounded-lg border-2 border-white/10 border-dashed bg-white/5"></div>;
    
    return (
      <div 
        onClick={onClick}
        className={`
            relative group cursor-pointer transition-all duration-300 ease-out
            w-28 h-[10rem] md:w-36 md:h-[12.5rem] 
            hover:scale-150 hover:z-50 hover:shadow-[0_0_50px_rgba(0,0,0,0.9)]
            ${originClass ? originClass : 'hover:-translate-y-16'}
            rounded-lg overflow-hidden border border-black/50 shadow-lg bg-[#0a080c]
        `}
      >
        <img src={card.caminho} alt={card.nome} className="w-full h-full object-fill" />
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-4">
      
      {/* --- CARTAS FIXAS (SUBCLASSE, ANCESTRALIDADE) --- */}
      <div className="absolute top-24 left-4 pointer-events-auto flex flex-col gap-4 z-10">
         <div className="flex gap-2">
            <MiniCard card={ancestryCard} onClick={() => ancestryCard && setSelectedCard({ card: ancestryCard, origin: 'fixed' })} isFixed originClass="hover:origin-top-left" />
            <MiniCard card={communityCard} onClick={() => communityCard && setSelectedCard({ card: communityCard, origin: 'fixed' })} isFixed originClass="hover:origin-top-left" />
         </div>
         <div className="flex gap-2 pl-6 border-l-2 border-white/10 ml-2">
            {subclassCards.map((card, i) => (
                <div key={i}>
                    {/* CORREÇÃO AQUI: hover:origin-left faz a carta crescer para a direita */}
                    <MiniCard card={card} onClick={() => card && setSelectedCard({ card, origin: 'fixed' })} originClass="hover:origin-left" />
                </div>
            ))}
         </div>
      </div>

      {/* --- BOTÕES FLUTUANTES --- */}
      <div className="absolute bottom-48 left-4 pointer-events-auto flex flex-col gap-3 z-20">
        <button onClick={() => setShowGrimoire(true)} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:bg-gold/20 hover:border-gold text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-sm">
            <MagnifyingGlass size={24} />
        </button>
        <button onClick={() => setShowReserve(true)} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:bg-blue-900/50 hover:border-blue-400 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-sm relative">
            <Stack size={24} />
            {reserve.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full text-[10px] flex items-center justify-center font-bold border border-white/20">{reserve.length}</span>}
        </button>
      </div>

      {/* --- MÃO --- */}
      <div className="pointer-events-auto w-full flex justify-center items-end perspective-[1000px] z-30">
        <div className="flex gap-[-4rem] items-end px-4 py-2 max-w-[90vw] overflow-x-visible">
            {hand.length === 0 ? (
                <div className="text-white/30 text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">Mão Vazia</div>
            ) : (
                hand.map((card, i) => (
                    <div key={i} className="-ml-4 first:ml-0 hover:z-50 transition-all duration-300 origin-bottom hover:-translate-y-4">
                         <MiniCard card={card} onClick={() => setSelectedCard({ card, origin: 'hand' })} />
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- MODAL DE DETALHES --- */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center pointer-events-auto p-4 animate-fade-in" onClick={() => setSelectedCard(null)}>
          <div className="relative max-w-5xl w-full flex flex-col md:flex-row gap-8 items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="relative w-[350px] md:w-[420px] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 bg-[#0a080c]">
                 <img src={selectedCard.card.caminho} alt={selectedCard.card.nome} className="w-full h-auto object-contain" />
            </div>

            <div className="flex flex-col gap-4 min-w-[240px]">
              <h3 className="text-3xl font-serif text-white font-bold">{selectedCard.card.nome}</h3>
              <p className="text-white/50 text-sm uppercase tracking-widest mb-4">{selectedCard.card.categoria}</p>

              {selectedCard.origin === 'hand' && (
                <>
                  <button onClick={() => { const idx = hand.findIndex(c => c.nome === selectedCard.card.nome); if (idx > -1) moveToReserve(idx); }} className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 text-gray-300 rounded hover:bg-white/10 hover:border-white/30 transition-all group">
                    <Stack size={28} className="text-gray-500 group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Guardar</span><span className="text-xs opacity-60">Mover para Reserva</span></div>
                  </button>
                  <button onClick={() => returnToGrimoire(selectedCard.card.nome)} className="flex items-center gap-4 px-6 py-4 bg-red-900/20 border border-red-500/20 text-red-300 rounded hover:bg-red-900/40 hover:border-red-500/40 transition-all group mt-2">
                    <ArrowUUpLeft size={28} className="text-red-500 group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Devolver</span><span className="text-xs opacity-60">Retornar ao Grimório</span></div>
                  </button>
                </>
              )}

              {selectedCard.origin === 'library' && (
                  <button onClick={() => addToHand(selectedCard.card)} className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-gold/20 to-yellow-900/20 border border-gold/50 text-gold rounded hover:bg-gold/30 hover:text-white transition-all group">
                    <HandGrabbing size={32} className="text-gold group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Pegar Carta</span><span className="text-xs opacity-60">Adicionar à Mão</span></div>
                  </button>
              )}

              {selectedCard.origin === 'reserve' && (
                 <button onClick={() => { const idx = reserve.findIndex(c => c.nome === selectedCard.card.nome); if (idx > -1) retrieveFromReserve(idx); }} className="flex items-center gap-4 px-6 py-4 bg-blue-900/40 border border-blue-500/50 text-blue-100 rounded hover:bg-blue-800/60 hover:border-blue-400 transition-all group">
                    <HandGrabbing size={32} className="text-blue-400 group-hover:text-white" />
                    <div className="text-left"><span className="block font-bold text-lg">Recuperar</span><span className="text-xs opacity-60">Mover para Mão</span></div>
                 </button>
              )}

              <button onClick={() => setSelectedCard(null)} className="mt-8 text-white/40 hover:text-white text-sm flex items-center justify-center gap-2"><X /> Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- GRIMÓRIO --- */}
      {showGrimoire && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col pointer-events-auto p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-serif text-gold flex items-center gap-3"><MagnifyingGlass weight="bold" /> Grimório</h2>
                <div className="flex gap-4">
                    <input type="text" placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-gold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <select className="bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-gold outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="Todas">Todas</option>
                        <option value="Domínio">Domínio</option>
                        <option value="Ancestralidade">Ancestralidade</option>
                        <option value="Comunidade">Comunidade</option>
                    </select>
                    <button onClick={() => setShowGrimoire(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={24}/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
                {safeCards.filter(c => (filterCategory === 'Todas' || c.categoria === filterCategory) && c.nome.toLowerCase().includes(searchTerm.toLowerCase())).map((card, i) => (
                    <div key={i} className="flex flex-col gap-2 group cursor-pointer" onClick={() => setSelectedCard({ card, origin: 'library' })}>
                        <div className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden border border-white/10 hover:border-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                            <img src={card.caminho} alt={card.nome} className="w-full h-full object-fill" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye size={32} className="text-white"/></div>
                        </div>
                        <span className="text-center text-white/50 text-xs group-hover:text-white transition-colors truncate">{card.nome}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- RESERVA --- */}
      {showReserve && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col pointer-events-auto p-8 animate-fade-in">
             <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-serif text-blue-400 flex items-center gap-3"><Stack weight="bold" /> Reserva</h2>
                <button onClick={() => setShowReserve(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={32}/></button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
                {reserve.map((card, i) => (
                    <div key={i} className="cursor-pointer" onClick={() => setSelectedCard({ card, origin: 'reserve' })}>
                         <div className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden border border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                            <img src={card.caminho} alt={card.nome} className="w-full h-full object-fill" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}