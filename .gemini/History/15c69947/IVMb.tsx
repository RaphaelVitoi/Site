
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
          Nexus SOTA Engine
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-lg">
          Ecossistema ativo. A fundação foi estabelecida com sucesso.
        </p>

        <div className="pt-8">
          <a
            href="/aula-icm"
            className="inline-flex items-center px-8 py-4 bg-slate-800/80 border border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-800 hover:scale-105 rounded-xl text-cyan-300 font-bold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-cyan-900/20"
          >
            Acessar Simulador ICM
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}