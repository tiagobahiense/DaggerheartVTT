import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Trash, Key, Skull, Crown, Shield, SignOut, Sword, PencilSimple, Check, X, MapTrifold } from '@phosphor-icons/react';

interface UserData {
  id: string;
  email: string;
  role: string;
  displayName?: string;
}

interface CharacterData {
  id: string;
  name: string;
  playerId: string;
  class?: string;
  level?: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para edição de nome
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const charsSnap = await getDocs(collection(db, 'characters'));

      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserData)));
      setCharacters(charsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CharacterData)));
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  // --- AÇÕES ---
  const startEditing = (user: UserData) => {
    setEditingId(user.id);
    setTempName(user.displayName || '');
  };

  const handleSaveName = async (userId: string) => {
    if (!tempName.trim()) {
      showMsg('error', 'O nome não pode ser vazio.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { displayName: tempName });
      showMsg('success', 'Nome do Mestre atualizado!');
      setEditingId(null);
      fetchData();
    } catch (e) {
      showMsg('error', 'Erro ao salvar nome.');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showMsg('success', `Email enviado para ${email}`);
    } catch (e) {
      showMsg('error', 'Erro ao enviar email.');
    }
  };

  const handleDeleteUser = async (userId: string, charId?: string) => {
    if (!confirm("Tem certeza? Isso apagará a conta e o personagem.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (charId) await deleteDoc(doc(db, 'characters', charId));
      showMsg('success', 'Usuário banido.');
      fetchData();
    } catch (e) {
      showMsg('error', 'Erro ao apagar dados.');
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (!confirm("Apagar apenas a ficha do personagem?")) return;
    try {
      await deleteDoc(doc(db, 'characters', charId));
      showMsg('success', 'Ficha excluída.');
      fetchData();
    } catch (e) {
      showMsg('error', 'Erro ao excluir ficha.');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black font-sans text-parchment overflow-hidden">
      
      {/* --- FUNDO DE VÍDEO --- */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
          <source src="/login-video.mp4" type="video/mp4" />
          <source src="/login-video.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] via-[#0f0518]/80 to-[#0f0518]/40" />
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gold drop-shadow-lg tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
              Painel do Narrador
            </h1>
            <p className="text-purple-300/50 text-xs md:text-sm uppercase tracking-[0.3em] mt-2">
              Gerenciamento de Jogadores & Personagens
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* BOTÃO IR PARA O VTT (NOVO) */}
            <button 
              onClick={() => navigate('/vtt-mestre')}
              className="
                group flex items-center gap-2 px-6 py-3 
                bg-gradient-to-r from-yellow-700/40 to-yellow-600/40 
                border border-yellow-500/50 rounded 
                hover:bg-yellow-600/60 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] 
                transition-all text-yellow-100 font-bold uppercase tracking-widest text-sm
              "
            >
              <MapTrifold size={20} className="text-yellow-300" />
              <span>Abrir Mesa (VTT)</span>
            </button>

            {/* Botão Sair */}
            <button 
              onClick={() => auth.signOut().then(() => navigate('/'))}
              className="group flex items-center gap-2 px-4 py-3 border border-red-500/30 rounded hover:bg-red-900/20 transition-all text-red-400 text-sm"
              title="Sair do Jogo"
            >
              <SignOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feedback Visual (Toast) */}
        {msg && (
          <div className={`
            fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl border backdrop-blur-md animate-fade-in
            ${msg.type === 'success' ? 'bg-green-900/60 border-green-500 text-green-100' : 'bg-red-900/60 border-red-500 text-red-100'}
          `}>
            {msg.text}
          </div>
        )}

        {/* GRID DE CARTAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full pb-20">
          
          {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse text-purple-300 font-rpg text-xl">
              Consultando os Grimórios...
            </div>
          ) : (
            users.map(user => {
              const char = characters.find(c => c.playerId === user.id);
              const isNarrador = user.role === 'narrador' || user.role === 'mestre';
              const isEditing = editingId === user.id;

              return (
                <div 
                  key={user.id} 
                  className={`
                    group relative p-6 rounded-xl border flex flex-col justify-between min-h-[220px]
                    transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl
                    backdrop-blur-md overflow-hidden
                    ${isNarrador 
                      ? 'bg-gradient-to-br from-yellow-950/40 to-black/60 border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-900/20' 
                      : 'bg-gradient-to-br from-[#1a0b2e]/60 to-black/60 border-purple-500/20 hover:border-purple-400/50 hover:shadow-purple-900/20'
                    }
                  `}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none -z-10 ${isNarrador ? 'bg-yellow-500/10' : 'bg-purple-600/10'}`}></div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-3 rounded-lg shadow-inner shrink-0 ${isNarrador ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-400'}`}>
                        {isNarrador ? <Crown size={28} weight="duotone" /> : <Shield size={28} weight="duotone" />}
                      </div>
                      
                      <div className="flex-grow overflow-hidden">
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${isNarrador ? 'text-yellow-600' : 'text-purple-500'}`}>
                          {isNarrador ? "Mestre do Jogo" : "Jogador"}
                        </p>
                        
                        {isNarrador && isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="text" 
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="w-full bg-black/40 border border-yellow-500/50 text-white text-sm px-2 py-1 rounded outline-none focus:border-yellow-400"
                              autoFocus
                            />
                            <button onClick={() => handleSaveName(user.id)} className="text-green-400 hover:text-green-300"><Check size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X size={18} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/name">
                             <p className="text-white font-bold text-sm truncate" title={user.displayName || user.email}>
                               {user.displayName || user.email.split('@')[0]}
                             </p>
                             {isNarrador && (
                               <button 
                                 onClick={() => startEditing(user)} 
                                 className="text-yellow-600 hover:text-yellow-400 opacity-0 group-hover/name:opacity-100 transition-opacity"
                                 title="Alterar Nome Público"
                               >
                                 <PencilSimple size={14} />
                               </button>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow border-t border-white/5 py-4">
                    {isNarrador ? (
                      <div className="flex flex-col items-center justify-center h-full text-white/20 text-xs italic">
                        <span>Onisciente & Onipotente</span>
                        <span className="text-[10px] mt-1 text-yellow-500/30">Nome visível: {user.displayName || "Padrão"}</span>
                      </div>
                    ) : char ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sword size={16} className="text-purple-400" />
                          <p className="text-lg font-rpg text-parchment">{char.name}</p>
                        </div>
                        <p className="text-xs text-purple-300/60 uppercase tracking-wide pl-6">
                          {char.class || 'Classe Desconhecida'} • Nível {char.level || 1}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-red-400/40 text-xs italic border border-dashed border-white/5 rounded p-2">
                        <span>Ainda sem personagem</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-white/5">
                    <button onClick={() => handleResetPassword(user.email)} title="Resetar Senha" className="p-2 rounded hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-300 transition-colors">
                      <Key size={20} />
                    </button>

                    {!isNarrador && (
                      <>
                        {char && (
                          <button onClick={() => handleDeleteCharacter(char.id)} title="Excluir ficha" className="p-2 rounded hover:bg-orange-500/20 text-orange-400/70 hover:text-orange-300 transition-colors">
                            <Skull size={20} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(user.id, char?.id)} title="Banir Jogador" className="p-2 rounded hover:bg-red-500/20 text-red-500/60 hover:text-red-400 transition-colors">
                          <Trash size={20} />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}