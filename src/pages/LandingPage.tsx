import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay para suavizar a entrada
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigate('/login', { state: { playMusic: true } });
  };

  return (
    // CONTAINER MESTRE
    // h-screen w-screen: Trava o tamanho na tela
    // overflow-hidden: Mata o scroll
    // flex items-center justify-center: Garante centralização total
    <div className="fixed inset-0 h-screen w-screen bg-black overflow-hidden flex items-center justify-center font-sans select-none">
      
      {/* CAMADA 1: FUNDO (Imagem) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/wallpaper.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
      </div>

      {/* CAMADA 2: CONTEÚDO */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center gap-12 transition-all duration-1000 ease-out transform ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        
        {/* TÍTULO */}
        <div className="text-center relative">
          {/* Brilho Azulado (Glow) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
          
          <h1 
            className="text-6xl md:text-9xl font-bold text-gray-200 uppercase tracking-widest drop-shadow-2xl"
            style={{ fontFamily: 'Cinzel, serif', textShadow: '0 5px 15px rgba(0,0,0,0.8)' }}
          >
            Daggerheart
          </h1>
          
          <div className="flex items-center justify-center gap-6 mt-4 opacity-90">
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-gold"></div>
            <p className="text-gold text-xl md:text-2xl tracking-[0.5em] uppercase font-serif font-bold text-shadow-sm">
              Virtual Tabletop
            </p>
            <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-gold"></div>
          </div>
        </div>

        {/* BOTÃO */}
        <button 
          onClick={handleStart}
          className="group relative cursor-pointer outline-none transition-all duration-300 hover:scale-105"
        >
          {/* Corpo do Botão */}
          <div className="
            relative z-10 
            px-24 py-6
            bg-gradient-to-b from-[#e6c86e] to-[#8a6a28]
            border-[3px] border-[#ffd700]
            shadow-[0_0_40px_rgba(212,175,55,0.4)]
            rounded-md
            flex items-center gap-4
          ">
            {/* Texto */}
            <span 
              className="text-3xl font-bold text-[#3d2b1f] uppercase tracking-wider drop-shadow-md"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Começar
            </span>
          </div>

          {/* Runas Decorativas (Flutuando fora do botão para estilo) */}
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-gold/50 text-4xl font-serif animate-pulse">ᚱ</span>
          <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-gold/50 text-4xl font-serif animate-pulse">ᚷ</span>

          {/* Borda de Brilho Extra ao passar o mouse */}
          <div className="absolute inset-0 border-2 border-white/50 rounded-md scale-105 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 blur-sm" />
        </button>

      </div>
      
      {/* RODAPÉ (Fixo embaixo) */}
      <div className="absolute bottom-6 w-full text-center z-20 pointer-events-none opacity-40">
        <p className="text-gray-300 text-[10px] uppercase tracking-[0.3em]">
          v1.0.0 • Sistema não-oficial
        </p>
      </div>

    </div>
  );
}