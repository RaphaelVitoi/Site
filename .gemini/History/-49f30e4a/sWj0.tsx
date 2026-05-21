/**
 * IDENTITY: Biblioteca
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Página de índice para artigos e ensaios aprofundados.
 * BINDING: [layout.tsx, globals.css, biblioteca.module.css]
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
    // Extracao heuristica de excerto limpando o Markdown basico
    const excerpt = item.content
      ? item.content.replaceAll( /[#*`>[\]\n]/g, ' ' ).replaceAll( /\s+/g, ' ' ).trim().substring( 0, 120 ) + '...'
      : 'Documento estrutural da Mente Coletiva VITOI.';

    return {
      href: `/biblioteca/${item.slug}`,
      tags: [ 'SOTA', 'Acervo Dinamico' ],
      title: item.title,
      description: excerpt,
      readingTime: item.readTime || 'Leitura SOTA',
      isNew: true
    };
  } );

  // Artigos Estaticos (Fisicos no ecossistema)
  const staticArticles = [
    {
      href: '/artigos/estado-da-arte',
      tags: [ 'Metagame', 'Tendencias' ],
      title: 'Estado da Arte 2025',
      description: 'Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.',
      readingTime: '8 min de leitura',
      isNew: false
    },
    {
      href: '/artigos/smart-sniper',
      tags: [ 'Gestao', 'Metodologia' ],
      title: 'Protocolo Smart Sniper',
      description: 'Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.',
      readingTime: '12 min de leitura',
      isNew: false
    },
    {
      href: '/artigos/validacao-smart-sniper',
      tags: [ 'Ciencia', 'Matematica' ],
      title: 'Validação Científica',
      description: 'Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson).',
      readingTime: '15 min de leitura',
      isNew: false
    },
    {
      href: '/artigos/psicologia-hs',
      tags: [ 'Psicologia', 'Mindset' ],
      title: 'Psicologia High Stakes',
      description: 'A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM e controle de tilt.',
      readingTime: '10 min de leitura',
      isNew: false
    },
    {
      href: '/biblioteca/entendendo-o-icm-e-suas-heuristicas',
      tags: [ 'ICM', 'Teoria' ],
      title: 'Entendendo o ICM e suas Heurísticas',
      description: 'Risk Premium, Downward Drift, Toy Games e a Perspectiva Matemática aplicada ao pós-flop.',
      readingTime: '15 min de leitura',
      isNew: false
    },
    {
      href: '/biblioteca/hermeneutica-blefe',
      tags: [ 'Psicologia', 'Teoria' ],
      title: 'Hermenêutica do Blefe',
      description: 'Lendo as intenções do oponente através da lente do excesso de gozo e da psicanálise lacaniana.',
      readingTime: '10 min de leitura',
      isNew: false
    },
    {
      href: '/biblioteca/paradoxo-valuation',
      tags: [ 'ICM', 'Teoria' ],
      title: 'O Paradoxo do Valuation no ICM',
      description: 'Por que acumular fichas pode diminuir sua esperança matemática em spots específicos da reta final.',
      readingTime: '8 min de leitura',
      isNew: false
    },
    {
      href: '/biblioteca/voce-aprende-poker-errado',
      tags: [ 'Pedagogia', 'Teoria' ],
      title: 'A Amortização da Edge',
      description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente com 10 big blinds.',
      readingTime: '8 min de leitura',
      isNew: false
    },
    {
      href: '/biblioteca/motor-diluicao',
      tags: [ 'ICM', 'Motor' ],
      title: 'O Motor de Diluição',
      description: 'Como o Risk Premium afeta os ranges de call de forma não-linear. Dissipação de RP por street.',
      readingTime: '10 min de leitura',
      isNew: false
    },
  ];

  // Fusao Holistica
  const articles = [ ...dbArticles, ...staticArticles ];

  return (
    <div style={ { minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-bright)', overflowX: 'hidden' } }>

      {/* Header Central de Página */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' } }>
        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } }>
          <div>
            <h1 style={ {
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, var(--text-main), var(--text-muted))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            } }>
              Biblioteca Analítica
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '580px' } }>
              O acervo de fundamentação teórica da Perspectiva Matemática. Artigos, diretrizes algorítmicas e decomposições analíticas que alimentam a inteligência do framework VITOI.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { ' ' }
                Indexado Dinâmico (Prisma)
              </span>
              <span style={ { fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Máquina de Conteúdo SOTA
              </span>
            </div>
          </div>

          <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
            <Link href="/" style={ {
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            } }>
              <i className="fa-solid fa-arrow-left" style={ { fontSize: '0.65rem' } }></i> Início
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
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <AnimatedArticleGrid articles={ articles } />
      </div>

    </div>
  );
}
