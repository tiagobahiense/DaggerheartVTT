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

  // Lógica segura para pegar o template
  const charClass = character.class as keyof typeof classTemplates;
  const template = classTemplates[charClass] || classTemplates.guerreiro; // Fallback para guerreiro se der erro

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
      backgroundColor: 'rgba(212, 175, 55, 0.4)',
      borderColor: '#d4af37',
      borderWidth: 2,
      pointBackgroundColor: '#fff'
    }]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#f4e4bc', font: { family: 'Cinzel', size: 14 } }, 
        ticks: { display: false, max: 3, min: -1 }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[900px] h-[600px] rpg-panel rounded-xl flex flex-col relative overflow-hidden border-2 border-gold-dim">
        
        {/* Header */}
        <div className="h-16 bg-dungeon-stone border-b border-gold/30 flex justify-between items-center px-6">
          <h2 className="font-rpg text-2xl text-gold">{character.name} <span className="text-sm text-gray-400">| {template.label} Nvl {character.level}</span></h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-200 font-bold">X</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-dungeon-dark border-r border-gold/20 flex flex-col py-4 gap-2">
            <TabButton label="Atributos" active={activeTab === 'atributos'} onClick={() => setActiveTab('atributos')} />
            
            {(template.specialTabs as string[]).includes('beastShape') && (
              <TabButton label="Forma Bestial" active={activeTab === 'beastShape'} onClick={() => setActiveTab('beastShape')} />
            )}
             {(template.specialTabs as string[]).includes('companion') && (
              <TabButton label="Companheiro" active={activeTab === 'companion'} onClick={() => setActiveTab('companion')} />
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-6 overflow-y-auto bg-dungeon-dark/50">
            {activeTab === 'atributos' && (
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="flex items-center justify-center bg-dungeon-stone/30 rounded-lg p-4">
                  <div className="w-64 h-64">
                    <Radar data={chartData} options={chartOptions} />
                  </div>
                </div>
                <div className="space-y-4">
                  <AttributeRow label="Agilidade" value={character.attributes.agility.value} />
                  <AttributeRow label="Força" value={character.attributes.strength.value} />
                  <AttributeRow label="Acuidade" value={character.attributes.finesse.value} />
                  <AttributeRow label="Instinto" value={character.attributes.instinct.value} />
                  <AttributeRow label="Presença" value={character.attributes.presence.value} />
                  <AttributeRow label="Conhec." value={character.attributes.knowledge.value} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-6 py-3 font-rpg transition-colors border-l-4 ${active ? 'bg-gold/10 border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
  >
    {label}
  </button>
);

const AttributeRow = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center bg-dungeon-stone p-3 rounded border border-gray-700">
    <span className="font-rpg text-parchment">{label}</span>
    <span className="font-bold text-xl text-gold">{value > 0 ? `+${value}` : value}</span>
  </div>
);