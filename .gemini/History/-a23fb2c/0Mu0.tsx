/**
 * IDENTITY: Rota Psicologia High Stakes
 * PATH: src/app/psicologia-hs/page.tsx
 * ROLE: Atuar como Server Component para ingestão de dados e repasse ao Hub Visual.
 * BINDING: [src/components/PsychologyHub.tsx (UI), src/app/layout.tsx]
 * TELEOLOGY: Integrar-se futuramente ao Prisma Client de forma irrestrita, extraindo relatórios do banco de dados (MDA) sem sacrificar o FCP (First Contentful Paint).
 */

import PsychologyHub, { SpecPost } from '@/components/PsychologyHub';

export const metadata = {
    title: 'Psicologia High Stakes | Raphael Vitoi',
    description: 'Protocolos de Análise e Hermenêutica Aplicada à Sobrevivência no Poker.',
};

// Função simulada para ingestão de banco de dados (Preparação para o Prisma)
async function getPosts(): Promise<SpecPost[]> {
  // TODO: Habilitar linha abaixo quando `lib/prisma` estiver estabilizado.
  // const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  
  // Mock defensivo provisório garantindo estabilidade do Front-end
  return [
    {
      id: '1',
      title: 'A Ameaça Orgânica no River',
      excerpt: 'Como a sobrecarga de Risk Premium induz o cérebro límbico a cometer blefes irracionais sob a perspectiva da neurociência.',
      readTime: '08 MIN',
      tags: ['Mindset', 'Neurobiologia'],
      slug: 'a-ameaca-organica'
    },
    {
      id: '2',
      title: 'O Paradoxo do Valuation no ICM',
      excerpt: 'Por que acumular fichas pode diminuir sua esperança matemática quando as dinâmicas de poder na mesa final são ignoradas.',
      readTime: '12 MIN',
      tags: ['Teoria', 'ICM'],
      slug: 'paradoxo-do-valuation'
    },
    {
      id: '3',
      title: 'A Metáfora do Homem-Bomba',
      excerpt: 'O excesso de "gozo" lacaniano nas mesas: entendendo a agressividade autodestrutiva como mecanismo de alívio de pressão.',
      readTime: '15 MIN',
      tags: ['Psicanálise', 'Filosofia'],
      slug: 'metafora-homem-bomba'
    }
  ];
}

export default async function PsicologiaHSPage() {
  const posts = await getPosts();

  return (
    <main className="container" style={{ padding: '4rem 0' }}>
        <section style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-up">
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Laboratório Epistêmico</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #d946ef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                Psicologia High Stakes
            </h1>
            <p style={{ fontStyle: 'italic', opacity: 0.8, maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
                O contrapeso humano à rigidez do código binário. Sobrevivendo à fronteira final da incerteza.
            </p>
        </section>

        <PsychologyHub posts={posts} />
    </main>
  );
}