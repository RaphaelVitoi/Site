/**
 * IDENTITY: Psicologia High Stakes (Hub Central)
 * PATH: src/app/artigos/psicologia-hs/page.tsx
 * ROLE: Ponto de entrada para estudos sobre Tilt, Controle Bayesiano e Vieses.
 */

import ContentFooter from '@/components/content/ContentFooter';
import PsychologyHub, { SpecPost } from '@/components/content/PsychologyHub';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Psicologia High Stakes | Raphael Vitoi',
  description: 'Controle Bayesiano, Prospect Theory e a erradicação do Tilt no poker de elite.',
};

const SOTA_PSYCHOLOGY_POSTS: SpecPost[] = [
  {
    id: 'tilt-bayesiano',
    title: 'O Controle Bayesiano do Tilt',
    excerpt: 'Como a elite usa a atualização de crenças para não ancorar em bad beats e resetar o estado mental O(1). O tilt não é raiva; é uma falha na calibração da variância.',
    readTime: '5 min',
    tags: ['Mindset', 'SOTA', 'Controle']
  },
  {
    id: 'aversao-perda',
    title: 'Ilusão de Frequência e Aversão à Perda',
    excerpt: 'Por que o cérebro humano superestima a probabilidade de bad beats e como o Prospect Theory de Kahneman explica o overfold sistemático em spots de alta tensão.',
    readTime: '8 min',
    tags: ['Vieses', 'Prospect Theory']
  },
  {
    id: 'dunning-kruger',
    title: 'Efeito Dunning-Kruger no Pós-Flop',
    excerpt: 'A assimetria fatal entre a confiança do jogador recreativo no flop e a entropia massiva gerada em árvores de decisão profundas no river.',
    readTime: '6 min',
    tags: ['Comportamento', 'Exploit']
  }
];

export default function PsicologiaHighStakesPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="Psicologia High Stakes"
        subtitle="O campo de batalha real não é a mesa, é o Córtex Pré-Frontal. Desconstruindo vieses e forjando a mente SOTA."
        category="Série Comportamental"
        icon="fa-brain"
      />

      <SectionHeader
        step="Ψ"
        label="Acervo"
        title="Protocolos de Resiliência"
        description="Filtre os relatórios e ensaios clínicos para calibrar a sua estabilidade cognitiva."
      />

      <div className="sota-container pb-12">
        <PsychologyHub posts={ SOTA_PSYCHOLOGY_POSTS } />
      </div>
      <ContentFooter shareTitle="Psicologia High Stakes | Raphael Vitoi" shareUrl="https://www.pokerracional.com/artigos/psicologia-hs" backLinkHref="/biblioteca" backLinkText="Voltar para Biblioteca" />
    </div>
  );
}
