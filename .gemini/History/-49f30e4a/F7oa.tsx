/**
 * IDENTITY: Biblioteca Analítica
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Índice de artigos e ensaios. Agregação dinâmica (Prisma) e estática.
 * BINDING: [layout.tsx, globals.css, AnimatedArticleGrid]
 */

import AnimatedArticleGrid from '@/components/content/AnimatedArticleGrid';
import { HeroArticleButton } from '@/components/HeroArticleButton';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Biblioteca | Raphael Vitoi',
  description: 'Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes.',
};

export default async function BibliotecaPage() {
  // Busca do banco
  const articleList = await ( prisma as any ).article?.findMany( {
    orderBy: { publishedAt: 'desc' }
  } ).catch( () => [] ) || [];

  const dbArticles = articleList.map( ( item ) => {
    const excerpt = item.content
      ? String( item.content ).replaceAll( /[#*`>[\n]/g, ' ' ).replaceAll( /\s+/g, ' ' ).trim().substring( 0, 120 ) + '...'
      : 'Documento estrutural da Mente Coletiva VITOI.';

    return {
      href: `/biblioteca/${item.slug}`,
      tags: ['SOTA', 'Dinamico'],
      title: item.title,
      description: excerpt,
      readingTime: item.readTime || 'Leitura SOTA',
      isNew: true
    };
  } );

  const staticArticles = [
    {
      href: '/artigos/estado-da-arte',
      tags: ['Metagame', 'Tendencias'],
      title: 'Estado da Arte 2025',
      description: 'Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/artigos/smart-sniper',
      tags: ['Gestao', 'Metodologia'],
      title: 'Protocolo Smart Sniper',
      description: 'Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.',
      readingTime: '12 min',
      isNew: false
    },
    {
      href: '/artigos/validacao-smart-sniper',
      tags: ['Ciencia', 'Matematica'],
      title: 'Validação Científica',
      description: 'Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson).',
      readingTime: '15 min',
      isNew: false
    },
    {
      href: '/artigos/psicologia-hs',
      tags: ['Psicologia', 'Mindset'],
      title: 'Psicologia High Stakes',
      description: 'A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM e controle de tilt.',
      readingTime: '10 min',
      isNew: false
    },
    {
      href: '/biblioteca/entendendo-o-icm-e-suas-heuristicas',
      tags: ['ICM', 'Teoria'],
      title: 'Entendendo o ICM e suas Heurísticas',
      description: 'Risk Premium, Downward Drift, Toy Games e a Perspectiva Matemática aplicada ao pós-flop.',
      readingTime: '15 min',
      isNew: false
    },
    {
      href: '/biblioteca/hermeneutica-blefe',
      tags: ['Psicologia', 'Teoria'],
      title: 'Hermenêutica do Blefe',
      description: 'Lendo as intenções do oponente através da lente do excesso de gozo e da psicanálise lacaniana.',
      readingTime: '10 min',
      isNew: false
    },
    {
      href: '/biblioteca/paradoxo-valuation',
      tags: ['ICM', 'Teoria'],
      title: 'O Paradoxo do Valuation no ICM',
      description: 'Por que acumular fichas pode diminuir sua esperança matemática em spots específicos.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/biblioteca/voce-aprende-poker-errado',
      tags: ['Pedagogia', 'Teoria'],
      title: 'A Amortização da Edge',
      description: 'Por que a distância entre um jogador de elite e um amador diminui com 10 big blinds.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/biblioteca/motor-diluicao',
      tags: ['ICM', 'Motor'],
      title: 'O Motor de Diluição',
      description: 'Como o Risk Premium afeta os ranges de call de forma não-linear. Dissipação de RP por street.',
      readingTime: '10 min',
      isNew: false
    },
  ];

  const articles = [...dbArticles, ...staticArticles];

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">

      <ContentPageHeader
        title="Biblioteca Analítica"
        subtitle="O acervo de fundamentação teórica da Perspectiva Matemática. Artigos e diretrizes que alimentam a inteligência do framework VITOI."
        category="Arquivo"
        icon="fa-atom"
      />

      <div className="sota-container -mt-12">
        <HeroArticleButton />
      </div>

      <div className="mt-16">
        <SectionHeader
          step="DOC"
          label="Doutrina"
          title="Ensaios & Hipóteses"
          description="Decomposições analíticas sobre o colapso cognitivo do EV e a insolvência estratégica do MDF tradicional."
        />

        <div className="sota-container mt-12">
          <AnimatedArticleGrid articles={ articles } />
        </div>
      </div>

    </div>
  );
}
