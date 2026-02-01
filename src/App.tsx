import { useState } from 'react';
import { auth } from './lib/firebase';

function App() {
  // CORREÇÃO: Inicializamos o estado já verificando o auth.
  // Isso evita o "Cascading Render" (renderização em cascata) que causava o erro.
  // Repare que removi o ", setStatus" de dentro dos colchetes
  const [status] = useState<string>(() => {
    return auth 
      ? "Sistema VTT Online - Conectado aos Arcanos (Firebase)" 
      : "Erro: Firebase não detectado";
  });

  return (
    <div className="h-screen w-screen bg-dungeon-dark text-parchment-DEFAULT overflow-hidden relative">
      
      {/* Interface (HUD) */}
      <div className="absolute top-10 left-10 p-6 rpg-panel rounded-lg max-w-md">
        
        <h1 className="font-rpg text-3xl text-gold mb-2 border-b border-gold/30 pb-2">
          Mesa Virtual
        </h1>
        
        <p className="font-body text-sm mb-4">
          {status}
        </p>

        <button className="
          bg-gold-gradient text-dungeon-dark font-rpg font-bold py-2 px-6 rounded shadow-lg
          hover:scale-105 transition-transform border border-gold-dim
        ">
          Iniciar Sessão
        </button>
      </div>

      {/* Área central */}
      <div className="flex items-center justify-center h-full opacity-20 pointer-events-none">
        <h2 className="font-rpg text-6xl text-dungeon-light">
          Área do Tabuleiro
        </h2>
      </div>

    </div>
  );
}

export default App;