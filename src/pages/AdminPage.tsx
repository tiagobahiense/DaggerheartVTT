import { useNavigate } from 'react-router-dom';
import { Skull, Users, MapTrifold } from '@phosphor-icons/react';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full bg-dungeon-dark p-10 flex flex-col items-center">
      <h1 className="font-rpg text-5xl text-gold mb-12 drop-shadow-md">Painel do Narrador</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <AdminCard 
          icon={<MapTrifold size={64} />}
          title="Abrir Mesa (VTT)"
          desc="Vá para o tabuleiro, controle mapas e NPCs."
          onClick={() => navigate('/vtt-mestre')}
          primary
        />
        <AdminCard 
          icon={<Users size={64} />}
          title="Gerenciar Jogadores"
          desc="Veja fichas, aprove contas e edite status."
          onClick={() => console.log('Gerenciar users')}
        />
        <AdminCard 
          icon={<Skull size={64} />}
          title="Bestiário & Itens"
          desc="Crie monstros e cartas de item."
          onClick={() => console.log('Criar monstros')}
        />
      </div>
    </div>
  );
}

interface AdminCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    onClick: () => void;
    primary?: boolean;
}

const AdminCard = ({ icon, title, desc, onClick, primary }: AdminCardProps) => (
  <div 
    onClick={onClick}
    className={`
      cursor-pointer p-8 rounded-xl border-2 flex flex-col items-center text-center transition-all hover:scale-105
      ${primary 
        ? 'bg-gold/10 border-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]' 
        : 'bg-dungeon-stone/50 border-gray-600 hover:border-gold/50'}
    `}
  >
    <div className={`${primary ? 'text-gold' : 'text-gray-400'} mb-4`}>{icon}</div>
    <h3 className="font-rpg text-2xl text-parchment mb-2">{title}</h3>
    <p className="font-body text-sm text-gray-400">{desc}</p>
  </div>
);