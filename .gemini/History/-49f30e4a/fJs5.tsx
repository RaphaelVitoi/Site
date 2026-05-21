import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Biblioteca Epistêmica | Poker Racional',
  description: 'O acervo definitivo de Teoria dos Jogos, ICM e Psicologia High Stakes.',
};

export const dynamic = 'force-dynamic';

export default async function BibliotecaIndex() {
  const contents = await prisma.content.findMany({
    where: { isPublished: true, category: 'biblioteca' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-50">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/80 to-slate-950 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Acervo Indexado SOTA
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Biblioteca <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Epistêmica.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A cristalização do conhecimento. Artigos, teses e destrinchações matemáticas sobre ICM, PKO e a dinâmica visceral do Poker High Stakes.
          </p>
        </div>
      </section>

      <hr className="border-0 border-t border-white/5 max-w-[200px] mx-auto my-8" />

      {/* Grid de Conteúdo Dinâmico */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Documentos
          </h2>
          <span className="text-sm font-bold text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded border border-indigo-500/20 uppercase tracking-widest">
            {contents.length} {contents.length === 1 ? 'Registro' : 'Registros'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contents.map((item) => (
            <article key={item.id} className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col hover:shadow-[0_10px_30px_-15px_rgba(99,102,241,0.3)] hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/20">
                    <i className="fa-solid fa-book-journal-whills mr-1.5"></i>
                    {item.category}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <i className="fa-regular fa-calendar"></i>
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-cyan-400 transition-colors relative z-10">
                <Link href={`/biblioteca/${item.slug}`} className="focus:outline-none">
                  {item.title}
                </Link>
              </h3>

              <p className="text-slate-400 mb-6 leading-relaxed flex-grow relative z-10 text-sm">
                {item.description}
              </p>

              <div className="pt-4 border-t border-slate-800/80 relative z-10">
                <Link href={`/biblioteca/${item.slug}`} className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  Acessar Documento <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            </article>
          ))}

          {contents.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <i className="fa-solid fa-database text-4xl text-slate-700 mb-4"></i>
              <p className="text-slate-500 text-lg uppercase tracking-widest font-mono">Nenhum documento indexado no banco SOTA.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}