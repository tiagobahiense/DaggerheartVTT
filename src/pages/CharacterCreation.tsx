import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [classe, setClasse] = useState('guerreiro');

  const handleCreate = async () => {
    if (!auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'characters'), {
        playerId: auth.currentUser.uid,
        name: name,
        class: classe,
        level: 1,
        attributes: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
        // ... outros campos iniciais baseados no classTemplates.json
      });
      
      navigate('/vtt-jogador');
    } catch (error) {
      console.error("Erro ao criar ficha:", error);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-[url('/bg-creation.jpg')] bg-cover">
      <div className="rpg-panel p-8 w-full max-w-2xl border-2 border-gold text-center">
        <h1 className="font-rpg text-4xl text-gold mb-4">Quem é você?</h1>
        <p className="text-parchment mb-8">O destino aguarda sua história.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          <div>
            <label className="block font-rpg text-gold mb-2">Nome</label>
            <input 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-dungeon-dark border border-gray-600 p-3 text-white rounded"
            />
          </div>
          <div>
            <label className="block font-rpg text-gold mb-2">Classe</label>
            <select 
              value={classe} onChange={e => setClasse(e.target.value)}
              className="w-full bg-dungeon-dark border border-gray-600 p-3 text-white rounded"
            >
              <option value="guerreiro">Guerreiro</option>
              <option value="mago">Mago</option>
              <option value="ladino">Ladino</option>
              <option value="bardo">Bardo</option>
              {/* ... outras classes */}
            </select>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="px-8 py-3 bg-gold-gradient text-dungeon-dark font-rpg font-bold rounded hover:scale-105 transition-transform"
        >
          Forjar Destino
        </button>
      </div>
    </div>
  );
}