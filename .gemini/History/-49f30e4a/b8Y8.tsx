/**
 * IDENTITY: Biblioteca Analítica
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Índice de artigos e ensaios. Agregação dinâmica (Prisma) e estática.
 * BINDING: [layout.tsx, globals.css, AnimatedArticleGrid]
 */

import AnimatedArticleGrid from '@/components/content/AnimatedArticleGrid';
import { HeroArticleButton } from '@/components/HeroArticleButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Biblioteca | Raphael Vitoi',
  description: 'Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes.',
};

export default async function BibliotecaPage () {
  // Busca do banco
  const articleList = await prisma.article.findMany( {
    orderBy: { publishedAt: 'desc' }
  } );

  // Mapeamento dos artigos do banco (Dinamicos)
  const dbArticles = articleList.map( ( item ) => {
    const excerpt = item.content
      ? item.content.replaceAll( /[#*`>[\n]/g, ' ' ).replaceAll( /\s+/g, ' ' ).trim().substring( 0, 120 ) + '...'
      : 'Documento estrutural da Mente Coletiva VITOI.';

    return {
      href: `/biblioteca/${item.slug}`,
      tags: [ 'SOTA', 'Dinamico' ],
      title: item.title,
      description: excerpt,
      readingTime: item.readTime || 'Leitura SOTA',
      isNew: true
    };
  } );

  const staticArticles = [
    {
      href: '/artigos/estado-da-arte',
      tags: [ 'Metagame', 'Tendencias' ],
      title: 'Estado da Arte 2025',
      description: 'Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/artigos/smart-sniper',
      tags: [ 'Gestao', 'Metodologia' ],
      title: 'Protocolo Smart Sniper',
      description: 'Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.',
      readingTime: '12 min',
      isNew: false
    },
    {
      href: '/artigos/validacao-smart-sniper',
      tags: [ 'Ciencia', 'Matematica' ],
      title: 'Validação Científica',
      description: 'Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson).',
      readingTime: '15 min',
      isNew: false
    },
    {
      href: '/artigos/psicologia-hs',
      tags: [ 'Psicologia', 'Mindset' ],
      title: 'Psicologia High Stakes',
      description: 'A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM e controle de tilt.',
      readingTime: '10 min',
      isNew: false
    },
    {
      href: '/biblioteca/entendendo-o-icm-e-suas-heuristicas',
      tags: [ 'ICM', 'Teoria' ],
      title: 'Entendendo o ICM e suas Heurísticas',
      description: 'Risk Premium, Downward Drift, Toy Games e a Perspectiva Matemática aplicada ao pós-flop.',
      readingTime: '15 min',
      isNew: false
    },
    {
      href: '/biblioteca/hermeneutica-blefe',
      tags: [ 'Psicologia', 'Teoria' ],
      title: 'Hermenêutica do Blefe',
      description: 'Lendo as intenções do oponente através da lente do excesso de gozo e da psicanálise lacaniana.',
      readingTime: '10 min',
      isNew: false
    },
    {
      href: '/biblioteca/paradoxo-valuation',
      tags: [ 'ICM', 'Teoria' ],
      title: 'O Paradoxo do Valuation no ICM',
      description: 'Por que acumular fichas pode diminuir sua esperança matemática em spots específicos da reta final.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/biblioteca/voce-aprende-poker-errado',
      tags: [ 'Pedagogia', 'Teoria' ],
      title: 'A Amortização da Edge',
      description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente com 10 big blinds.',
      readingTime: '8 min',
      isNew: false
    },
    {
      href: '/biblioteca/motor-diluicao',
      tags: [ 'ICM', 'Motor' ],
      title: 'O Motor de Diluição',
      description: 'Como o Risk Premium afeta os ranges de call de forma não-linear. Dissipação de RP por street.',
      readingTime: '10 min',
      isNew: false
    },
  ];

  const articles = [ ...dbArticles, ...staticArticles ];

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              Biblioteca Analítica
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
              O acervo de fundamentação teórica da Perspectiva Matemática. Artigos, diretrizes algorítmicas e decomposições analíticas que alimentam a inteligência do framework VITOI.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                { ' ' }Indexado Dinâmico
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Máquina de Conteúdo SOTA
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Link href="/" className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated hover:border-white/10">
              <i className="fa-solid fa-arrow-left text-[0.7rem]" /> VOLTAR AO NEXUS
            </Link>
          </div>
        </div>
      </div>

      {/* Botão Especial SOTA: Destaque do Artigo Principal (Hero) */ }
      <HeroArticleButton />

      {/* Seções com o novo padrão SOTA */ }
      <SectionHeader
        step="01"
        label="Doutrina"
        title="Artigos e Hipóteses"
        description="Publicações densas sobre o colapso cognitivo do EV em ChipEV, a anatomia matemática das Reverse Implied Odds em multiway e a insolvência estratégica do MDF tradicional em mesas finais."
      />

      <div className="max-w-300 mx-auto px-6 pb-24">
        <AnimatedArticleGrid articles={ articles } />
      </div>

    </div>
  );
}
