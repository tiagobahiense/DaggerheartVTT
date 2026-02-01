import { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { ICharacterSheet } from '../../types';
import classTemplates from '../../data/classTemplates.json';

// Registra os componentes do gráfico
Chart.register(RadialLinearScale, PointElement, LineElement, Filler);

interface SheetModalProps {
  character: ICharacterSheet;
  isOpen: boolean;
  onClose: () => void;
}

export const SheetModal = ({ character, isOpen, onClose }: SheetModalProps) => {
  const [activeTab, setActiveTab] = useState('atributos');
  
  if (!isOpen) return null;

  // Pega o template da classe para saber se tem abas extras
  // O "as keyof typeof" é pro TypeScript não reclamar do JSON dinâmico
  const template = classTemplates[character.class as keyof typeof classTemplates];

  // Configuração do Gráfico (Estilo Daggerheart)
  const chartData = {
    labels: ['AGI', 'FOR', 'ACU', 'INS', 'PRE', 'CON'],
    datasets: [{
      label: 'Atributos',
      data: [
        character.attributes.agility.value,
        character.attributes.strength.value,
        character.attributes.finesse.value,
        character.attributes.instinct.value,
        character.attributes.presence.value,
        character.attributes.knowledge.value
      ],
      backgroundColor: 'rgba(212, 175, 55, 0.4)', // Gold transparente
      borderColor: '#d4af37', // Gold puro
      borderWidth: 2,
      pointBackgroundColor: '#fff'
    }]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { 
          color: '#f4e4bc', // Parchment
          font: { family: 'Cinzel', size: 14 } 
        }, 
        ticks: { display: false, max: 3, min: -1 } // Daggerheart vai de -1 a +3 geralmente
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      
      {/* Moldura da Ficha (Estilo Vidro/RPG) */}
      <div className="w-[900px] h-[600px] rpg-panel rounded-xl flex flex-col relative overflow-hidden border-2 border-gold-dim">
        
        {/* Cabeçalho */}
        <div className="h-16 bg-dungeon-stone border-b border-gold/30 flex justify-between items-center px-6">
          <h2 className="font-rpg text-2xl text-gold">{character.name} <span className="text-sm text-gray-400">| {template.label} Nvl {character.level}</span></h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-200 font-bold">X</button>
        </div>

        {/* Corpo: Sidebar + Conteúdo */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar de Navegação (Abas) */}
          <div className="w-48 bg-dungeon-dark border-r border-gold/20 flex flex-col py-4 gap-2">
            <TabButton label="Atributos" active={activeTab === 'atributos'} onClick={() => setActiveTab('atributos')} />
            <TabButton label="Equipamento" active={activeTab === 'equipamento'} onClick={() => setActiveTab('equipamento')} />
            <TabButton label="Habilidades" active={activeTab === 'habilidades'} onClick={() => setActiveTab('habilidades')} />
            
            {/* Abas Dinâmicas (Druida/Patrulheiro) */}
            {template.specialTabs.includes('beastShape') && (
              <TabButton label="Forma Bestial" active={activeTab === 'beastShape'} onClick={() => setActiveTab('beastShape')} />
            )}
            {template.specialTabs.includes('companion') && (
              <TabButton label="Companheiro" active={activeTab === 'companion'} onClick={() => setActiveTab('companion')} />
            )}
          </div>

          {/* Área de Conteúdo */}
          <div className="flex-1 p-6 overflow-y-auto bg-dungeon-dark/50">
            
            {/* CONTEÚDO DA ABA: ATRIBUTOS */}
            {activeTab === 'atributos' && (
              <div className="grid grid-cols-2 gap-8 h-full">
                {/* Coluna 1: Gráfico */}
                <div className="flex items-center justify-center bg-dungeon-stone/30 rounded-lg p-4">
                  <div className="w-64 h-64">
                    <Radar data={chartData} options={chartOptions} />
                  </div>
                </div>
                
                {/* Coluna 2: Inputs Numéricos */}
                <div className="space-y-4">
                  <AttributeRow label="Agilidade" value={character.attributes.agility.value} />
                  <AttributeRow label="Força" value={character.attributes.strength.value} />
                  {/* ... outros atributos */}
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA: FORMA BESTIAL (Exemplo Dinâmico) */}
            {activeTab === 'beastShape' && character.beastShape && (
              <div className="p-4 border border-green-800 rounded bg-green-900/20">
                <h3 className="font-rpg text-xl text-green-400 mb-4">Forma Atual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Nome da Fera</label>
                    <input className="w-full bg-dungeon-dark border border-gray-600 rounded p-2 text-white" 
                           defaultValue={character.beastShape.name} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase">Ferocidade</label>
                    <input type="number" className="w-full bg-dungeon-dark border border-gray-600 rounded p-2 text-white" 
                           defaultValue={character.beastShape.ferocity} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Auxiliar de Botão de Aba
const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`
      w-full text-left px-6 py-3 font-rpg transition-colors border-l-4
      ${active 
        ? 'bg-gold/10 border-gold text-gold' 
        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}
    `}
  >
    {label}
  </button>
);

// Componente Auxiliar de Linha de Atributo
const AttributeRow = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center bg-dungeon-stone p-3 rounded border border-gray-700">
    <span className="font-rpg text-parchment">{label}</span>
    <span className="font-bold text-xl text-gold">{value > 0 ? `+${value}` : value}</span>
  </div>
);