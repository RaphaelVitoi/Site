import SimuladorICM from '../../components/SimuladorICM';

export default function AulaICMPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] p-6 md:p-12 relative overflow-hidden">
      {/* Efeito Glow de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Estratégia Avançada de ICM</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Compreenda a distorção da equidade e aplique a matemática do sobrevivencialismo no simulador interativo abaixo.</p>
        </header>

        <section id="simulador-section">
          <SimuladorICM />
        </section>
      </div>
    </main>
  );
}