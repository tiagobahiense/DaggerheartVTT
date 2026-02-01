import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      {/* Fundo com Overlay Escuro */}
      <div className="absolute inset-0 bg-[url('/bg-landing.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-dungeon-dark via-transparent to-dungeon-dark" />

      <div className="z-10 text-center space-y-6 animate-pulse-slow">
        <h1 className="font-rpg text-6xl md:text-8xl text-gold drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          DAGGERHEART
        </h1>
        <h2 className="font-rpg text-2xl text-parchment-dark tracking-[0.5em]">
          VIRTUAL TABLETOP
        </h2>
        
        <button 
          onClick={() => navigate('/login')}
          className="mt-12 px-12 py-4 bg-transparent border-2 border-gold text-gold font-rpg text-xl 
                     hover:bg-gold hover:text-dungeon-dark hover:shadow-[0_0_30px_#d4af37] 
                     transition-all duration-300 rounded-sm uppercase tracking-widest"
        >
          Entrar no Reino
        </button>
      </div>
    </div>
  );
}