/**
 * IDENTITY: Biblioteca
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Página de índice para artigos e ensaios aprofundados.
 * BINDING: [layout.tsx, globals.css, biblioteca.module.css]
 */

import Link from 'next/link';
import styles from './biblioteca.module.css';

export const metadata = {
  title: 'Biblioteca | Raphael Vitoi',
  description: 'Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes.',
};

const articles = [
  {
    href: '/aulas/voce-aprende-poker-errado',
    label: 'Paradoxo da Competência',
    title: 'A Amortização da Edge',
    description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.',
    isNew: true,
  },
  {
    href: '/biblioteca/motor-diluicao',
    label: 'ICM • Estratégia • Matemática',
    title: 'O Motor de Diluição',
    description: 'Como o Risk Premium afeta os ranges de call de forma não-linear através das streets.',
    isNew: false,
  },
  {
    href: '/biblioteca/paradoxo-valuation',
    label: 'Teoria • ICM • Matemática',
    title: 'O Paradoxo do Valuation no ICM',
    description: 'Por que acumular fichas pode ser matematicamente contraproducente em retas finais.',
    isNew: false,
  },
  {
    href: '/biblioteca/hermeneutica-blefe',
    label: 'Psicologia • Teoria dos Jogos',
    title: 'Hermenêutica do Blefe',
    description: 'Uma análise profunda sobre a estrutura lógica e psicológica do blefe no poker moderno.',
    isNew: false,
  }
];

export default function BibliotecaPage() {
  return (
    <main className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <header className="page-header" style={{ paddingBottom: '2rem', textAlign: 'center' }}>
        <p className="page-label">
          <span className="fa-solid fa-book-open"></span> Acervo de Conhecimento
        </p>
        <h1>Biblioteca</h1>
        <p className="page-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Artigos, ensaios e análises aprofundadas sobre a teoria do poker, ICM e psicologia high-stakes. Mergulhe nos conceitos que formam a base do jogo de elite.
        </p>
      </header>

      <section className={styles.articleGrid}>
        {articles.map((article) => (
          <Link href={article.href} key={article.href} className={styles.articleCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <p className={styles.cardLabel}>{article.label}</p>
                {article.isNew && <span className={styles.newBadge}>Novo</span>}
              </div>
              <h3 className={styles.cardTitle}>{article.title}</h3>
              <p className={styles.cardDescription}>{article.description}</p>
            </div>
            <div className={styles.cardFooter}>
              <span>Ler artigo &rarr;</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}