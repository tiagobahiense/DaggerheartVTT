import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';

// Importação das Páginas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import MestreVTT from './pages/MestreVTT';
import CharacterCreation from './pages/CharacterCreation';
import JogadorVTT from './pages/JogadorVTT';

// Importação do CSS Global
import './index.css';

// --- COMPONENTE DE ROTA PROTEGIDA ---
// Verifica se o usuário está logado antes de deixar ele entrar na página
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ouve as mudanças de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Tela de Carregamento enquanto verifica o login
  if (loading) {
    return (
      <div className="h-screen w-screen bg-dungeon-dark flex items-center justify-center">
        <div className="font-rpg text-2xl text-gold animate-pulse">
          Consultando o Grimório...
        </div>
      </div>
    );
  }

  // Se não estiver logado, manda para o login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se estiver tudo ok, mostra a página
  return <>{children}</>;
};

// --- COMPONENTE PRINCIPAL (APP) ---
function App() {
  return (
    // O BrowserRouter deve envolver toda a aplicação
    <BrowserRouter>
      <div className="h-screen w-screen bg-dungeon-dark overflow-hidden font-body text-parchment">
        <Routes>
          {/* --- ROTAS PÚBLICAS --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- ROTAS DO JOGADOR (PROTEGIDAS) --- */}
          <Route 
            path="/criar-personagem" 
            element={
              <ProtectedRoute>
                <CharacterCreation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vtt-jogador" 
            element={
              <ProtectedRoute>
                <JogadorVTT />
              </ProtectedRoute>
            } 
          />

          {/* --- ROTAS DO MESTRE (PROTEGIDAS) --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vtt-mestre" 
            element={
              <ProtectedRoute>
                <MestreVTT />
              </ProtectedRoute>
            } 
          />
          
          {/* --- ROTA DE FALLBACK (Qualquer link errado volta pro início) --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;