/**
 * IDENTITY: Biblioteca
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Página de índice para artigos e ensaios aprofundados.
 * BINDING: [layout.tsx, globals.css, biblioteca.module.css]
 */

import AnimatedArticleGrid from '@/components/content/AnimatedArticleGrid';
import { HeroArticleButton } from '@/components/HeroArticleButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const metadata = {
  title: 'Biblioteca | Raphael Vitoi',
  description: 'Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes.',
};

const prisma = new PrismaClient();

export default async function BibliotecaPage () {
  // Busca do banco
  const contentList = await prisma.content.findMany( {
    where: { category: 'biblioteca', isPublished: true },
    orderBy: { createdAt: 'desc' }
  } );

  // Mapeamento para o formato do grid
  const articles = contentList.map( ( item, index ) => ( {
    href: `/biblioteca/${item.slug}`,
    tags: [ 'SOTA', 'Perspectiva' ], // Pode evoluir para campo real de tags no schema no futuro
    title: item.title,
    description: item.description || 'Um artigo do ecossistema SOTA.',
    readingTime: 'Aprox. 6 min de leitura',
    isNew: index === 0 // Marca o primeiro como novo apenas para a UI
  } ) );

  return (
    <div style={ { minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' } }>

      {/* Header Central de Página */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' } }>
        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } }>
          <div>
            <h1 style={ {
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            } }>
              Biblioteca Analítica
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' } }>
              O acervo de fundamentação téorica da Perspectiva Matemática. Artigos, diretrizes algorítmicas e decomposições analíticas que alimentam a inteligência do framework VITOI.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { ' ' }
                Indexado Dinâmico (Prisma)
              </span>
              <span style={ { fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Máquina de Conteúdo SOTA
              </span>
            </div>
          </div>

          <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
            <Link href="/" style={ {
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
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
