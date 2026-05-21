/**
 * IDENTITY: Biblioteca
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Página de índice para artigos e ensaios aprofundados.
 * BINDING: [layout.tsx, globals.css, biblioteca.module.css]
 */

import AnimatedArticleGrid from '@/components/content/AnimatedArticleGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Biblioteca | Raphael Vitoi',
  description: 'Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes.',
};

const articles = [
  {
    href: '/biblioteca/voce-aprende-poker-errado',
    tags: ['Paradoxo', 'Competência'],
    title: 'A Amortização da Edge',
    description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.',
    readingTime: 'Aprox. 4 min de leitura',
    isNew: true,
  },
  {
    href: '/biblioteca/entendendo-o-icm-e-suas-heuristicas',
    tags: ['ICM', 'Risk Premium', 'Toy Games'],
    title: 'Entendendo o ICM e suas heurísticas',
    description: 'Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games.',
    readingTime: 'Aprox. 13 min de leitura',
    isNew: false,
  },
  {
    href: '/biblioteca/motor-diluicao',
    tags: ['ICM', 'Estratégia', 'Matemática'],
    title: 'O Motor de Diluição',
    description: 'Como o Risk Premium afeta os ranges de call de forma não-linear através das streets.',
    readingTime: 'Aprox. 7 min de leitura',
    isNew: false,
  },
  {
    href: '/biblioteca/paradoxo-valuation',
    tags: ['Teoria', 'ICM', 'Matemática'],
    title: 'O Paradoxo do Valuation no ICM',
    description: 'Por que acumular fichas pode ser matematicamente contraproducente em retas finais.',
    readingTime: 'Aprox. 6 min de leitura',
    isNew: false,
  },
  {
    href: '/biblioteca/hermeneutica-blefe',
    tags: ['Psicologia', 'Teoria dos Jogos'],
    title: 'Hermenêutica do Blefe',
    description: 'Uma análise profunda sobre a estrutura lógica e psicológica do blefe no poker moderno.',
    readingTime: 'Aprox. 9 min de leitura',
    isNew: false,
  }
];

export default function BibliotecaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' }}>

      {/* Header Central de Página */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Biblioteca Analítica
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
              O acervo de fundamentação téorica da Perspectiva Matemática. Artigos, diretrizes algorítmicas e decomposições analíticas que alimentam a inteligência do framework VITOI.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}/>
                Indexado
              </span>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                Documentação SOTA
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/" style={{
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }}></i> Início
            </Link>
          </div>
        </div>
      </div>

      {/* Seções com o novo padrão SOTA */}
      <SectionHeader
        step="01"
        label="Doutrina"
        title="Artigos e Hipóteses"
        description="Publicações densas sobre o colapso cognitivo do EV em ChipEV, a anatomia matemática das Reverse Implied Odds em multiway e a insolvência estratégica do MDF tradicional em mesas finais."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <AnimatedArticleGrid articles={articles} />
      </div>

    </div>
  );
}
