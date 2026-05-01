import Link from 'next/link';

export default function Home ()
{
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-up">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/30 mb-8">
        <span className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse"></span>
        <span className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest">Protocolo SOTA Ativo</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-black text-gradient-sota tracking-tighter mb-6 leading-tight">
        O Edge Mudou de Lugar
      </h1>

      <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mb-12 leading-relaxed">
        A Geometria do Risco: ICM Pós-Flop, Risk Premium e a nova fronteira do Poker de Alta Performance.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link href="/aulas/icm-masterclass" className="px-8 py-3.5 rounded-full bg-accent-indigo text-white font-black uppercase tracking-widest text-xs hover:bg-accent-indigo-light hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all">
          Conhecer o Método
        </Link>
        <Link href="/simulador" className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
          Acessar Motor ICM
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <FeatureCard title="Motor ICM" icon="fa-microchip" href="/simulador" desc="Simulador SOTA de Distorções" />
        <FeatureCard title="Psicologia High Stakes" icon="fa-brain" href="/psicologia-hs" desc="Filtros Cognitivos e Mindset" />
        <FeatureCard title="Biblioteca Epistêmica" icon="fa-book-journal-whills" href="/biblioteca" desc="Acervo de Teorias e Protocolos" />
        <FeatureCard title="Oráculo Híbrido" icon="fa-satellite-dish" href="/dashboard" desc="Telemetria e Inteligência" />
      </div>
    </div>
  );
}

function FeatureCard ( { title, icon, href, desc }: Readonly<{ title: string, icon: string, href: string, desc: string; }> )
{
  return (
    <Link href={ href } className="glass-panel p-6 flex flex-col items-center text-center group hover:border-accent-indigo/30 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent-indigo/20 group-hover:text-accent-indigo-light transition-colors text-text-muted">
        <i className={ `fa-solid ${ icon } text-xl` }></i>
      </div>
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">{ title }</h3>
      <p className="text-xs text-slate-400">{ desc }</p>
    </Link>
  );
}
