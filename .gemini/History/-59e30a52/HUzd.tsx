import Link from 'next/link';

async function getSystemPulse() {
  try {
    const { buildNexusServerUrl } = await import('@/lib/api-contract');
    const token = process.env.API_SECRET_TOKEN || '';
    const res = await fetch(buildNexusServerUrl('/db-summary'), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { active: (data?.tasks?.running || 0) + (data?.tasks?.pending || 0) };
  } catch (e) {
    console.debug('[System Pulse] Graceful fallback active.', e);
    // SOTA Fallback: Silencia erro de conexão para manter UI limpa em ambiente local/desconectado
    return null;
  }
}

export default async function Home ()
{
  const pulse = await getSystemPulse();

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 py-12 animate-fade-up">
      {/* SOTA System Pulse - Status Visceral */}
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border mb-10 transition-all duration-700 ${pulse ? 'bg-accent-emerald/10 border-accent-emerald/30 shadow-emerald-500/5' : 'bg-rose-500/5 border-white/5 shadow-inner'}`}>
        <span className={`w-2 h-2 rounded-full ${pulse ? 'bg-accent-emerald animate-pulse shadow-[0_0_10px_var(--accent-emerald)]' : 'bg-text-darker'}`}></span>
        <span className={`text-[0.6rem] font-black uppercase tracking-[0.25em] ${pulse ? 'text-accent-emerald-light' : 'text-text-muted'}`}>
          {pulse ? `Mente Coletiva SOTA · ${pulse.active} Tarefas em Vácuo` : 'Orquestrador em Hibernação'}
        </span>
      </div>

      <div className="max-w-5xl space-y-6 mb-16">
        <h1 className="text-6xl md:text-8xl font-black text-gradient-sota tracking-tighter leading-[0.95] drop-shadow-2xl">
          O Edge Mudou <br/> de Lugar
        </h1>

        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
          A Geometria do Risco: ICM Pós-Flop, Risk Premium e a <br className="hidden md:block" /> exegese da nova fronteira do Poker High Stakes.
        </p>
      </div>

      {/* CTAs Primários - Hierarquia de Decisão */}
      <div className="flex flex-col sm:flex-row gap-6 mb-24 w-full justify-center items-center">
        <Link
          href="/aulas/icm-masterclass"
          className="group relative px-10 py-4 rounded-full bg-accent-indigo text-white font-black uppercase tracking-[0.2em] text-[0.7rem] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          Conhecer o Método
        </Link>

        <Link
          href="/simulador"
          className="px-10 py-4 rounded-full bg-black/40 border border-white/10 text-text-light font-black uppercase tracking-[0.2em] text-[0.7rem] hover:bg-black/60 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-md active:scale-95"
        >
          Abrir Simulador
        </Link>
      </div>

      {/* Grid de Conteúdo Estratégico - Simetria SOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl relative z-10">
        <FeatureCard
          title="Teoria ICM"
          icon="fa-microchip"
          href="/biblioteca/downward-drift-sota"
          desc="O Paradoxo do Downward Drift"
          label="Fundamentos"
          color="indigo"
        />
        <FeatureCard
          title="Telemetria"
          icon="fa-satellite-dish"
          href="/dashboard"
          desc="Assinatura Bayesiana em Tempo Real"
          label="Live Engine"
          color="emerald"
        />
        <FeatureCard
          title="Doutrina"
          icon="fa-book-journal-whills"
          href="/biblioteca"
          desc="Acervo de Teorias e Heurísticas"
          label="Knowledge Base"
          color="violet"
        />
        <FeatureCard
          title="Simulação"
          icon="fa-brain"
          href="/quiz"
          desc="Teste seu Range vs Teto do RP"
          label="Analytical Quiz"
          color="rose"
        />
      </div>
    </div>
  );
}

function FeatureCard ( { title, icon, href, desc, label, color }: Readonly<{ title: string, icon: string, href: string, desc: string, label: string, color: string; }> )
{
  const colorMap: Record<string, string> = {
    indigo: 'group-hover:text-accent-indigo-light bg-accent-indigo/5 group-hover:bg-accent-indigo/20 border-accent-indigo/10 group-hover:border-accent-indigo/30 shadow-accent-indigo/5',
    emerald: 'group-hover:text-accent-emerald-light bg-accent-emerald/5 group-hover:bg-accent-emerald/20 border-accent-emerald/10 group-hover:border-accent-emerald/30 shadow-accent-emerald/5',
    violet: 'group-hover:text-accent-violet-light bg-accent-violet/5 group-hover:bg-accent-violet/20 border-accent-violet/10 group-hover:border-accent-violet/30 shadow-accent-violet/5',
    rose: 'group-hover:text-accent-rose-light bg-accent-rose/5 group-hover:bg-accent-rose/20 border-accent-rose/10 group-hover:border-accent-rose/30 shadow-accent-rose/5',
  };

  return (
    <Link href={ href } className="glass-panel group p-12 flex flex-col items-center text-center transition-all duration-[800ms] hover:-translate-y-3 border-white/5 shadow-sota-glass relative overflow-hidden active:scale-[0.98]">
    <Link href={ href } className="glass-panel group p-12 flex flex-col items-center text-center transition-all duration-800 hover:-translate-y-3 border-white/5 shadow-sota-glass relative overflow-hidden active:scale-[0.98]">
      <div className="absolute inset-0 bg-radial-[at_top_right] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-1000">
        <i className={ `fa-solid ${ icon } text-8xl` }></i>
      </div>

      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-700 border text-text-muted shadow-2xl ${colorMap[color]}`}>
      <div className={`w-20 h-20 rounded-4xl flex items-center justify-center mb-10 transition-all duration-700 border text-text-muted shadow-2xl ${colorMap[color]}`}>
        <i className={ `fa-solid ${ icon } text-3xl group-hover:scale-110 transition-transform duration-700` }></i>
      </div>

      <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-text-darker mb-4 group-hover:text-text-muted transition-colors duration-500">{ label }</span>
      <h3 className="text-base font-black text-white uppercase tracking-[0.2em] mb-5 group-hover:text-gradient-sota transition-all duration-500">{ title }</h3>
      <p className="text-[0.75rem] text-slate-500 font-medium leading-relaxed group-hover:text-slate-300 transition-colors duration-500 px-2">{ desc }</p>

      <div className="mt-10 flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.3em] text-text-darker group-hover:text-white transition-all duration-700 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
        Explorar Camada <i className="fa-solid fa-chevron-right text-[0.5rem] ml-1 group-hover:translate-x-1 transition-transform"></i>
      </div>
    </Link>
  );
}
