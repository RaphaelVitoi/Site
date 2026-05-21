import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Biblioteca | Poker Racional',
};

export default async function BibliotecaIndex() {
  const contents = await prisma.content.findMany({
    where: { isPublished: true, category: 'biblioteca' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="container mx-auto" style={{ padding: '4rem 1.5rem', maxWidth: '1200px' }}>
      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--accent-emerald, #10b981)' }}>Biblioteca</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contents.map((item) => (
          <Link key={item.id} href={`/biblioteca/${item.slug}`}>
            <div className="glass-panel p-6 transition-all duration-300 hover:border-emerald-500 cursor-pointer h-full" style={{ borderRadius: 'var(--radius-md, 0.5rem)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs text-gray-500 mb-2">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
              <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
              {item.description && <p className="text-gray-400">{item.description}</p>}
            </div>
          </Link>
        ))}

        {contents.length === 0 && <p className="text-gray-500">Nenhum conteúdo publicado na biblioteca ainda.</p>}
      </div>
    </main>
  );
}