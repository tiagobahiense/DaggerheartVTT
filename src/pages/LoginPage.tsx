import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Key } from '@phosphor-icons/react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- MÚSICA DE FUNDO ---
  useEffect(() => {
    if (location.state?.playMusic) {
      const audio = new Audio('/wellcome.mp3'); 
      audio.volume = 0.4;
      audio.loop = true;  
      audio.play().catch(e => console.log("Autoplay bloqueado:", e));
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [location.state]);

  // --- LÓGICA PRINCIPAL DE ENTRADA ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("O grimório exige email e senha.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let user;
      let isNewUser = false;

      // 1. Tenta LOGAR
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } catch (loginErr: any) {
        // Se o erro for "usuário não encontrado", tentamos CRIAR
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
            try {
                // Tenta CRIAR conta
                const newUserCred = await createUserWithEmailAndPassword(auth, email, password);
                user = newUserCred.user;
                isNewUser = true;
            } catch (createErr: any) {
                if (createErr.code === 'auth/email-already-in-use') {
                    throw new Error("Senha incorreta para este email.");
                }
                throw createErr;
            }
        } else {
            throw loginErr;
        }
      }

      // 2. Verifica/Cria dados no Firestore
      const uid = user.uid;
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      let role = '';

      if (!userDocSnap.exists()) {
        // --- AUTO-SETUP: Define se é Narrador ou Jogador ---
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        // Se o banco estiver vazio, o PRIMEIRO a logar vira Narrador. O resto é Jogador.
        role = usersSnapshot.empty ? 'narrador' : 'jogador';

        await setDoc(userDocRef, {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
        console.log(`Novo grimório criado. Cargo definido: ${role}`);
      } else {
        const userData = userDocSnap.data();
        role = userData?.role || 'jogador';
      }

      // 3. DIRECIONAMENTO (A Lógica que você pediu)
      if (role === 'narrador' || role === 'mestre') {
        // Narrador não tem ficha, vai direto pro Admin
        navigate('/admin');
      } else {
        // Jogador: Verifica se tem personagem
        const charsRef = collection(db, 'characters');
        const q = query(charsRef, where('playerId', '==', uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // NÃO tem personagem -> Criação
          navigate('/criar-personagem');
        } else {
          // TEM personagem -> Jogo
          navigate('/vtt-jogador');
        }
      }

    } catch (err: any) {
      console.error(err);
      // Tratamento de mensagens de erro amigáveis
      let msg = "Falha no ritual de entrada.";
      if (err.message.includes("Senha incorreta")) msg = "Senha incorreta.";
      if (err.code === 'auth/weak-password') msg = "A senha deve ter pelo menos 6 runas.";
      if (err.code === 'auth/invalid-email') msg = "Email inválido.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-black font-sans">
      
      {/* --- FUNDO DE VÍDEO --- */}
      <div className="absolute inset-0 z-0 will-change-transform">
        <div className="absolute inset-0 bg-black -z-10"></div>
        <video 
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/login-video.mp4" type="video/mp4" />
          <source src="/login-video.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] via-[#0f0518]/60 to-transparent" />
      </div>

      {/* --- MODAL LOGIN --- */}
      <div className="relative z-10 w-full max-w-md p-6 animate-fade-in">
        <div className="
          relative bg-[#0f0518]/60 backdrop-blur-sm 
          border border-purple-500/30 rounded-xl shadow-2xl p-8 overflow-hidden
        ">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-wider drop-shadow-md mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Portal de Acesso
            </h2>
            <p className="text-purple-200/60 text-xs uppercase tracking-[0.2em]">
              Entre ou crie sua conta automaticamente
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-900/40 border border-red-500/30 rounded text-red-200 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="group">
              <label className="block text-purple-200/50 text-[10px] uppercase tracking-wider mb-1 font-bold ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-purple-500/20 text-white p-3 rounded focus:border-purple-500/50 outline-none transition-all"
                placeholder="aventureiro@exemplo.com"
              />
            </div>

            <div className="group">
              <label className="block text-purple-200/50 text-[10px] uppercase tracking-wider mb-1 font-bold ml-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-purple-500/20 text-white p-3 rounded focus:border-purple-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="
                w-full mt-4 p-4
                bg-gradient-to-r from-purple-900 to-purple-800
                hover:from-purple-800 hover:to-purple-700
                border border-purple-500/40
                text-white font-bold uppercase tracking-widest text-sm
                rounded shadow-[0_0_20px_rgba(168,85,247,0.2)]
                hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]
                transition-all duration-300 transform active:scale-95
                flex items-center justify-center gap-2
              "
            >
              {loading ? "Conjurando..." : <><Key size={20} /> Abrir o Portal</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}