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
    <main className="min-h-screen bg-transparent text-slate-300" style={{ padding: '6rem 1.5rem 4rem' }}>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section SOTA */}
        <header className="mb-20 text-center space-y-6">
          <h1 style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #6366f1 100%)',
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
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A cristalização do conhecimento. Artigos, teses e destrinchações matemáticas sobre ICM, PKO e a dinâmica visceral do Poker High Stakes.
          </p>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] mt-8"></div>
          <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] mt-8"></div>
        </header>

        {/* Grid de Conteúdo Dinâmico */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-emerald-500 rounded-sm"></span>
              <span className="w-2 h-8 bg-indigo-500 rounded-sm"></span>
              Acervo Indexado
            </h2>
            <span className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded border border-emerald-400/20">
              <span className="text-sm font-mono text-indigo-400 bg-indigo-400/10 px-4 py-1.5 rounded border border-indigo-400/20">
                {contents.length} {contents.length === 1 ? 'DOCUMENTO' : 'DOCUMENTOS'}
              </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
              {contents.map((item) => (
                <Link key={item.id} href={`/biblioteca/${item.slug}`} className="group block h-full">
                  <div className="h-full bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.3)] flex flex-col relative overflow-hidden">

                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 uppercase">{item.category}</span>
                      <span className="text-xs font-mono text-slate-500">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      <article key={item.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_10px_30px_-15px_rgba(99,102,241,0.3)] flex flex-col h-full group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] font-bold tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20 uppercase">
                              {item.category}
                            </span>
                          </div>

                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-300 transition-colors relative z-10">{item.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow relative z-10">{item.description}</p>

                          <div className="mt-auto flex items-center text-xs font-bold tracking-widest text-slate-300 uppercase self-start border-b border-emerald-500/0 group-hover:border-emerald-500/50 group-hover:text-white transition-all pb-1 relative z-10">
                            Acessar Documento <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
                          </div>
                          <span className="text-xs font-mono text-slate-500">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </Link>

                      <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                      <p className="text-slate-400 text-sm flex-grow leading-relaxed">{item.description}</p>

                      <Link href={`/biblioteca/${item.slug}`}>
                        <button className="mt-6 text-xs font-bold tracking-widest text-slate-300 uppercase self-start border-b border-indigo-500/0 group-hover:border-indigo-500/50 group-hover:text-white transition-all pb-1">
                          Acessar Documento &rarr;
                        </button>
                      </Link>
                    </article>
            ))}

                    {contents.length === 0 && (
                      <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                        <p className="text-slate-500 text-lg uppercase tracking-widest font-mono">Nenhum documento indexado no banco SOTA.</p>
                      </div>
                    )}
                  </div>
                </section>
      </div>
          </main>
          );
}