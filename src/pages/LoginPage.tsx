import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase'; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 1. Verificar Role do Usuário
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      const role = userData?.role || 'jogador'; 

      if (role === 'mestre' || role === 'narrador') {
        navigate('/admin');
        return;
      }

      // 2. Lógica do Jogador
      const charsQuery = query(collection(db, 'characters'), where('playerId', '==', uid));
      const charsSnapshot = await getDocs(charsQuery);

      if (charsSnapshot.empty) {
        navigate('/criar-personagem');
      } else {
        navigate('/vtt-jogador');
      }

    } catch (err) {
      console.error(err);
      setError("Falha ao entrar nos portões. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-dungeon-dark relative p-4">
      <div className="rpg-panel p-8 w-full max-w-md rounded-lg border border-gold/40">
        <h2 className="font-rpg text-3xl text-gold text-center mb-6">Identifique-se</h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-900/20 p-2 border border-red-900">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-rpg text-parchment-dark mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dungeon-stone border border-gray-600 text-white p-3 rounded focus:border-gold outline-none font-body"
              placeholder="aventureiro@exemplo.com"
            />
          </div>
          <div>
            <label className="block font-rpg text-parchment-dark mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dungeon-stone border border-gray-600 text-white p-3 rounded focus:border-gold outline-none font-body"
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold-gradient text-dungeon-dark font-rpg font-bold py-3 rounded shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Invocando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}