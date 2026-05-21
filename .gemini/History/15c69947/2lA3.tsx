import Link from 'next/link';

// Mock para simular o componente ArticleCard que ainda não existe
const ArticleCard = ( { title }: { title: string } ) => (
  <div style={ { border: '1px solid #334155', padding: '1rem', borderRadius: '8px' } }>
    <h3 style={ { margin: 0, color: '#e2e8f0' } }>{ title }</h3>
  </div>
);

export default function Home ()
{
  return (
    <main style={ { padding: '2rem', color: '#cbd5e1' } }>
      <header style={ { textAlign: 'center', marginBottom: '4rem' } }>
        <h1 style={ { fontSize: '3rem', fontWeight: 800, color: '#f8fafc' } }>O Edge Mudou de Lugar.</h1>
        <p style={ { fontSize: '1.25rem', color: '#94a3b8' } }>Domine a Incerteza.</p>
        <div style={ { marginTop: '2rem' } }>
          <Link href="/aulas/icm-masterclass" style={ { padding: '0.75rem 1.5rem', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none' } }>
            Iniciar Masterclass
          </Link>
        </div>
      </header>

      <section style={ { marginBottom: '4rem' } }>
        <h2 style={ { fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' } }>Laboratórios</h2>
        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' } }>
          <ArticleCard title="Motor Algorítmico ICM" />
          <ArticleCard title="Psicologia High Stakes" />
          <ArticleCard title="Biblioteca Epistêmica" />
        </div>
      </section>

      <section>
        <h2 style={ { fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' } }>Artigos Recentes</h2>
        {/* Placeholder para o feed de artigos */ }
      </section>
    </main>
  );
}
