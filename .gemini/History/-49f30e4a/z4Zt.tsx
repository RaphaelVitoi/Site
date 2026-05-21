import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

interface BibliotecaPageProps {
  readonly params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BibliotecaPageProps) {
  const resolvedParams = await params;
  const content = await prisma.content.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!content) return { title: 'Conteúdo não encontrado | Poker Racional' };

  return { title: `${content.title} | Poker Racional`, description: content.description };
}

export default async function BibliotecaPage({ params }: BibliotecaPageProps) {
  const resolvedParams = await params;
  const content = await prisma.content.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!content) notFound();

  return (
    <main style={{ padding: '4rem 1.5rem' }}>
      <article className="max-w-4xl mx-auto">
        <header className="page-header" style={{ paddingBottom: '2rem' }}>
          <p className="page-label uppercase text-emerald-500 font-bold text-sm tracking-wider mb-2">{content.category}</p>
          <h1 style={{
            background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginTop: 0
          }}>
            {content.title}
          </h1>
        </header>
        <div className="glass-panel p-6 md:p-10" style={{ borderRadius: 'var(--radius-lg, 0.75rem)' }}>
          <MarkdownRenderer content={content.body} />
        </div>
      </article>
    </main>
  );
}