import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Biblioteca SOTA | Poker Racional',
  description: 'O acervo definitivo de Teoria dos Jogos e ICM.',
};

export default async function BibliotecaIndex() {
  const contents = await prisma.content.findMany({
    where: { isPublished: true, category: 'biblioteca' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-200" style={{ padding: '6rem 1.5rem 4rem' }}>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section SOTA */}
        <header className="mb-20 text-center space-y-6">
          <h1 style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            O Estado da Arte
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A cristalização do conhecimento. Artigos, teses e destrinchações matemáticas sobre ICM, PKO e a dinâmica visceral do Poker High Stakes.
          </p>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] mt-8"></div>
        </header>

        {/* Grid de Conteúdo Dinâmico */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-emerald-500 rounded-sm"></span>
              Acervo Indexado
            </h2>
            <span className="text-sm font-mono text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              {contents.length} {contents.length === 1 ? 'DOCUMENTO' : 'DOCUMENTOS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((item) => (
              <Link key={item.id} href={`/biblioteca/${item.slug}`} className="group block h-full">
                <div className="h-full bg-white/[0.02] backdrop-blur-md p-8 transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-1 relative overflow-hidden group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col"
                  style={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>

                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">{item.category}</span>
                    <span className="text-xs font-mono text-gray-500">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors relative z-10">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow relative z-10">{item.description}</p>

                  <div className="mt-auto flex items-center text-sm font-semibold text-emerald-500 group-hover:text-emerald-400 relative z-10">
                    Acessar Documento <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}

            {contents.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
                <p className="text-gray-500 text-lg">O banco de dados está vazio. Execute a sincronização SOTA.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}