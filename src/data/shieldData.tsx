import React from 'react';
import { 
  Dna, Sword, Shield, Skull, UsersThree, 
  HandFist, Lightning, Brain, Eye 
} from '@phosphor-icons/react';

export interface ShieldRule {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const SHIELD_RULES: ShieldRule[] = [
  {
    id: 'duality',
    title: 'Dados de Dualidade',
    icon: <Dna size={32} />,
    content: (
      <div className="space-y-4">
        <p className="text-white/80">Sempre que o resultado for incerto, role <strong>2d12</strong> (Esperança e Medo) + Modificador.</p>
        
        <div className="grid gap-3">
          <div className="bg-white/5 p-3 rounded border border-gold/30">
            <h4 className="text-gold font-bold uppercase text-sm mb-1">Sucesso Crítico (Dados Iguais)</h4>
            <ul className="list-disc list-inside text-sm text-white/70">
              <li>Recebe 1 Esperança</li>
              <li>Recupera 1 Fadiga</li>
              <li>Causa dano extra (se for ataque)</li>
            </ul>
          </div>

          <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
            <h4 className="text-green-400 font-bold uppercase text-sm mb-1">Sucesso com Esperança</h4>
            {/* CORREÇÃO AQUI: &gt; no lugar de > */}
            <p className="text-sm text-white/70">Total ≥ Dificuldade | Esperança &gt; Medo</p>
            <p className="text-xs text-green-300 mt-1">Ganha 1 Esperança.</p>
          </div>

          <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
            <h4 className="text-yellow-400 font-bold uppercase text-sm mb-1">Sucesso com Medo</h4>
            {/* CORREÇÃO AQUI: &gt; no lugar de > */}
            <p className="text-sm text-white/70">Total ≥ Dificuldade | Medo &gt; Esperança</p>
            <p className="text-xs text-yellow-300 mt-1">O Mestre ganha 1 Medo. Sucesso com consequência.</p>
          </div>

          <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
            <h4 className="text-red-400 font-bold uppercase text-sm mb-1">Falha</h4>
            {/* CORREÇÃO AQUI: &lt; no lugar de < */}
            <p className="text-sm text-white/70">Total &lt; Dificuldade</p>
            <ul className="list-disc list-inside text-xs text-red-300 mt-1">
              <li><strong>Com Esperança:</strong> Ganha 1 Esperança. Coisas não saem como planejado.</li>
              <li><strong>Com Medo:</strong> Mestre ganha 1 Medo. Coisas dão muito errado.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'attributes',
    title: 'Guia de Atributos',
    icon: <Brain size={32} />,
    content: (
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: "Agilidade", desc: "Correr, Saltar, Equilibrar, Armas Ágeis" },
          { name: "Força", desc: "Agarrar, Quebrar, Armas Pesadas" },
          { name: "Acuidade", desc: "Esconder, Mãos Leves, Precisão, Arremesso" },
          { name: "Instinto", desc: "Perceber, Pressentir, Sobrevivência" },
          { name: "Presença", desc: "Comover, Convencer, Enganar, Liderar" },
          { name: "Conhecimento", desc: "Analisar, Aprender, Lembrar (Lore)" }
        ].map(attr => (
          <div key={attr.name} className="bg-white/5 p-2 rounded border border-white/10">
            <strong className="text-gold block">{attr.name}</strong>
            <span className="text-xs text-white/60">{attr.desc}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'attack',
    title: 'Combate: Ataque',
    icon: <Sword size={32} />,
    content: (
      <div className="space-y-4">
        <div className="p-3 bg-black/40 rounded border border-white/10">
          <h3 className="text-gold font-bold mb-2">1. Teste de Ataque</h3>
          <p className="text-xl font-rpg text-white">2d12 + Atributo + Bônus</p>
          <p className="text-xs text-white/50">Se o total ≥ Dificuldade do Inimigo, acertou.</p>
        </div>

        <div className="p-3 bg-black/40 rounded border border-white/10">
          <h3 className="text-red-400 font-bold mb-2">2. Cálculo de Dano</h3>
          <p className="text-sm text-white mb-2 font-mono bg-white/10 p-1 rounded text-center">
            (Dados da Arma × Proficiência) + Modificadores
          </p>
          <ul className="list-disc list-inside text-sm text-white/70">
            <li><strong>Proficiência:</strong> Quantidade de dados que você rola.</li>
            <li><strong>Crítico:</strong> Dano máximo possível + rolagem normal.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'defense',
    title: 'Combate: Dano/Defesa',
    icon: <Shield size={32} />,
    content: (
      <div className="space-y-4 text-sm">
        <ol className="list-decimal list-inside space-y-2 text-white/80">
          <li className="p-2 bg-white/5 rounded">
            <strong>Mestre Ataca:</strong> 1d20 + Modificador vs Evasão do Jogador.
          </li>
          <li className="p-2 bg-white/5 rounded">
            <strong>Dano Recebido:</strong> Se acertar, o mestre rola o dano.
          </li>
          <li className="p-2 bg-white/5 rounded">
            <strong>Comparar Limiares:</strong>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 bg-green-900/50 rounded text-xs">Menor (1 PV)</span>
              <span className="px-2 py-0.5 bg-yellow-900/50 rounded text-xs">Maior (2 PV)</span>
              <span className="px-2 py-0.5 bg-red-900/50 rounded text-xs">Grave (3 PV)</span>
            </div>
          </li>
          <li className="p-2 bg-white/5 rounded border border-blue-500/30">
            <strong>Armadura (Opcional):</strong> Marque slots de armadura para reduzir a gravidade em 1 nível (ex: Grave virou Maior).
          </li>
        </ol>
      </div>
    )
  },
  {
    id: 'fear',
    title: 'Usando Medo (GM)',
    icon: <Skull size={32} />,
    content: (
      <div className="grid grid-cols-1 gap-2">
        {[
          { cost: 1, desc: "Interromper jogadores para fazer um movimento." },
          { cost: 1, desc: "Fazer um movimento adicional no seu turno." },
          { cost: 1, desc: "Adicionar mod. de Experiência a um teste." },
          { cost: 1, desc: "Ativar habilidade especial de monstro/ambiente." },
          { cost: 2, desc: "Habilidades poderosas ou Reanimar NPC morto." },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-purple-900/20 p-2 rounded border border-purple-500/30">
            <div className="bg-purple-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full shrink-0">{item.cost}</div>
            <span className="text-sm text-purple-200">{item.desc}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'group',
    title: 'Regras de Grupo',
    icon: <UsersThree size={32} />,
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-white/5 p-3 rounded">
          <h4 className="text-gold font-bold mb-1">Teste em Grupo</h4>
          <p className="text-white/70">Líder faz o teste. Aliados fazem CD de reação.</p>
          <ul className="flex gap-4 mt-2">
            <li className="text-green-400">Sucesso: +1 no Líder</li>
            <li className="text-red-400">Falha: -1 no Líder</li>
          </ul>
        </div>
        <div className="bg-white/5 p-3 rounded">
          <h4 className="text-gold font-bold mb-1">Ataque em Dupla (3 Esperanças)</h4>
          <p className="text-white/70">Dois jogadores narram e rolam. Escolha o melhor resultado para acertar. Somem os danos.</p>
        </div>
        <div className="bg-white/5 p-3 rounded">
          <h4 className="text-gold font-bold mb-1">Hordas e Lacaios</h4>
          <p className="text-white/70">Lacaios morrem com 1 golpe. Hordas diminuem dano na metade da vida.</p>
        </div>
      </div>
    )
  },
  {
    id: 'conditions',
    title: 'Condições',
    icon: <Lightning size={32} />,
    content: (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-900/10 border border-red-500/20 p-2 rounded">
          <strong className="text-red-300 block">Vulnerável</strong>
          <span className="text-xs text-white/60">Ataques contra têm Vantagem.</span>
        </div>
        <div className="bg-blue-900/10 border border-blue-500/20 p-2 rounded">
          <strong className="text-blue-300 block">Imobilizado</strong>
          <span className="text-xs text-white/60">Não pode sair do lugar.</span>
        </div>
        <div className="bg-gray-900/10 border border-gray-500/20 p-2 rounded">
          <strong className="text-gray-300 block">Escondido</strong>
          <span className="text-xs text-white/60">Ataques contra têm Desvantagem.</span>
        </div>
        <div className="bg-yellow-900/10 border border-yellow-500/20 p-2 rounded">
          <strong className="text-yellow-300 block">Dano Direto</strong>
          <span className="text-xs text-white/60">Ignora armadura.</span>
        </div>
      </div>
    )
  }
];