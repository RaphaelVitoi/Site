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
  const articleList = await prisma.content.findMany( {
    where: { category: { in: ['Artigo', 'Ensaio'] } },
    orderBy: { createdAt: 'desc' }
  } ).catch( () => [] ) || [];

  const dbArticles = articleList.map( ( item ) => {
    const excerpt = item.body
      ? String( item.body ).replaceAll( /[#*`>[\n]/g, ' ' ).replaceAll( /\s+/g, ' ' ).trim().substring( 0, 120 ) + '...'
      : 'Documento estrutural da Mente Coletiva VITOI.';

    return {
      href: `/biblioteca/${item.slug}`,
      tags: ['SOTA', 'Dinamico'],
      title: item.title,
      description: excerpt,
      readingTime: 'Leitura SOTA',
      isNew: true
    };
  } );

  const staticArticles = [
    {
      href: '/biblioteca/axioma-ev-fold-dinamico',
      tags: ['Teoria', 'ICM'],
      title: 'Axioma do EV do Fold',
      description: 'Por que foldar quase nunca tem EV zero e como o ICM pode tornar o fold matematicamente positivo.',
      readingTime: '10 min',
      isNew: true
    },
    {
      href: '/biblioteca/teto-equidade-river-icm',
      tags: ['Matemática', 'Nash'],
      title: 'O Teto de Equidade',
      description: 'Prova Clínica: Por que é estruturalmente impossível precisar de mais de 41% de equidade para pagar no river.',
      readingTime: '15 min',
      isNew: true
    },
    {
      href: '/biblioteca/downward-drift-sota',
      tags: ['ICM', 'Teoria'],
      title: 'Downward Drift SOTA',
      description: 'Como a assimetria do Risk Premium força a contração de ranges e o rebaixamento de sizings sob pressão ICM.',
      readingTime: '12 min',
      isNew: true
    },
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8">
          <SectionHeader
            step="DOC"
            label="Doutrina"
            title="Ensaios & Hipóteses"
            description="Decomposições analíticas sobre o colapso cognitivo do EV e a insolvência estratégica do MDF tradicional."
          />
          <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 bg-accent-indigo/5 border-accent-indigo/20">
             <i className="fa-solid fa-radar text-accent-indigo-light animate-pulse text-xl"></i>
             <div className="text-left">
               <div className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest">Base de Conhecimento</div>
               <div className="text-sm font-medium text-text-muted">{articles.length} Artefatos Indexados</div>
             </div>
          </div>
        </div>

        <div className="sota-container">
          <AnimatedArticleGrid articles={ articles } />
        </div>
      </div>

    </div>
  );
}
