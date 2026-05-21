/**
 * IDENTITY: Laboratório Toy Games (Predator Mode)
 * PATH: src/app/toy-games/page.tsx
 * ROLE: Renderizar cenários didáticos extremos de ICM para gamificação do aprendizado.
 * BINDING: [src/app/layout.tsx, globals.css]
 * TELEOLOGY: Evoluir para consumir engines de NashSolver reais no navegador, testando o Risk Premium do usuário em tempo real.
 */
'use client';

import { useState } from 'react';

export type PlayerState = { pos: string; stack: string; rp: number; morph: string; };
export type Scenario = {
  id: string; title: string; env: string; icon: string;
  verdict: { label: string; className: string; };
  ip: PlayerState; oop: PlayerState; theory: string; exploit: string;
};

const SCENARIOS_DATABASE: Scenario[] = [
  {
    id: "paradoxo", title: "O Paradoxo do Valuation", env: "Estrutura Padrão (Mid vs Big)", icon: "⚖️",
    verdict: { label: "Agressão Estrangulada", className: "text-rose-400 border-rose-500/30 bg-rose-950/50" },
    ip: { pos: "BTN", stack: "40 bb", rp: 21.4, morph: "Inelástico (Valor Estrito)" },
    oop: { pos: "BB (CL)", stack: "55 bb", rp: 12.9, morph: "Defensivo Condensado" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Instinto Traído pela Matemática</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">O senso comum dita que o BTN com 40bb possui conforto suficiente para oprimir a mesa. Contudo, o HRC revela o pesadelo: o "RP de ida" do BTN é quase o dobro do "RP de volta" do BB.</p>`,
    exploit: `<p>Se você é o BTN, a sua Desvantagem de Risco é a sua algema...</p>`
  },
  {
    id: "pacto", title: "O Pacto Silencioso", env: "Colisão de Gigantes", icon: "🤝",
    verdict: { label: "Evitação de Ruína", className: "text-indigo-400 border-indigo-500/30 bg-indigo-950/50" },
    ip: { pos: "Vice CL", stack: "65 bb", rp: 24.5, morph: "Linear Especulativo" },
    oop: { pos: "CL", stack: "70 bb", rp: 23.5, morph: "Flat Call Massivo" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">A Mútua Destruição Assegurada</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Dois gigantes colidem. É essencial notar que esta dinâmica ocorre quase estritamente entre os dois CLs.</p>`,
    exploit: `<p>O GTO dita passividade. Contudo, se o seu adversário sente que deve mandar na mesa...</p>`
  },
  {
    id: "batata", title: "O Efeito Batata Quente", env: "A Dinâmica do Shove", icon: "🔥",
    verdict: { label: "Transferência de Fardo", className: "text-amber-400 border-amber-500/30 bg-amber-950/50" },
    ip: { pos: "UTG (Shove)", stack: "25 bb", rp: 15, morph: "Polar Máximo" },
    oop: { pos: "BB (Call)", stack: "20 bb", rp: 19.5, morph: "Bluffcatcher Rígido" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Peso de Agir Primeiro</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Quando o UTG faz um open-shove direto, ele altera organicamente a utilidade da mão.</p>`,
    exploit: `<p>Se você é o Agressor, expanda zonas de shove contra adversários aterrorizados.</p>`
  }
];

export default function ToyGamesPage () {
  const [ activeScenarioId, setActiveScenarioId ] = useState<string | null>( 'paradoxo' );
  const activeScenario = SCENARIOS_DATABASE.find( s => s.id === activeScenarioId );

  // Efeito sonoro gamificado (Radar Lock) via Web Audio API (opcional/conceitual)
  const playRadarLock = () => {
    try
    {
      const ctx = new ( globalThis.AudioContext || ( globalThis as any ).webkitAudioContext )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect( gain );
      gain.connect( ctx.destination );
      osc.type = 'square';
      osc.frequency.setValueAtTime( 800, ctx.currentTime );
      osc.frequency.exponentialRampToValueAtTime( 1200, ctx.currentTime + 0.1 );
      gain.gain.setValueAtTime( 0.1, ctx.currentTime );
      gain.gain.exponentialRampToValueAtTime( 0.01, ctx.currentTime + 0.3 );
      osc.start();
      osc.stop( ctx.currentTime + 0.3 );
    } catch ( e )
    {
      console.warn( 'Efeito sonoro bloqueado pelo navegador:', e );
    }
  };

  const handleScenarioSelect = ( scenarioId: string ) => {
    setActiveScenarioId( scenarioId );
    playRadarLock();
  };

  return (
    <main className="container mx-auto px-4" style={ { padding: '4rem 0' } }>
      <div className="text-center mb-16 animate-fade-up">
        <span className="block font-mono text-xs text-red-500 tracking-widest uppercase mb-4 animate-pulse">
          [ AVISO: DINÂMICAS EXCLUSIVAS DE ICM ]
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
          Toy Games: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Predator Mode</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic text-sm">
          Isolando a mecânica do Risk Premium. Sinta a impunidade de agredir quando o oponente está paralisado na Death Zone.
        </p>
      </div>

      {/* Seleção de Cenário */ }
      <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-up" style={ { animationDelay: '0.1s' } }>
        { SCENARIOS_DATABASE.map( sc => (
          <button
            key={ sc.id }
            onClick={ () => handleScenarioSelect( sc.id ) }
            className={ `px-6 py-3 rounded-lg font-heading font-bold uppercase tracking-widest text-sm transition-all duration-300 border ${activeScenarioId === sc.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-slate-500'}` }
          >
            <span className="mr-2">{ sc.icon }</span> { sc.title }
          </button>
        ) ) }
      </div>

      {/* Palco do Cenário */ }
      <div className="max-w-4xl mx-auto animate-fade-up" style={ { minHeight: '300px' } }>
        { activeScenario && (
          <div className="glass-panel p-8 border-t-4 border-indigo-500 shadow-[inset_0_0_50px_rgba(99,102,241,0.05)]">
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-700/50">{ activeScenario.env }</span>
                <h2 className="text-2xl font-bold text-white mt-4">{ activeScenario.title }</h2>
              </div>
              <span className={ `px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${activeScenario.verdict.className}` }>
                { activeScenario.verdict.label }
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-950/50 p-6 rounded-xl border border-sky-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all"></div>
                <h3 className="text-sky-400 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><span>IP / Agressor</span></h3>
                <div className="text-3xl font-bold text-white mb-1">{ activeScenario.ip.pos }</div>
                <div className="text-slate-400 data-mono text-sm mb-4">Stack: { activeScenario.ip.stack }</div>
                <div className="bg-slate-900 rounded p-3 border border-white/5">
                  <div className="text-xs text-slate-500 uppercase">Risk Premium</div>
                  <div className="text-xl text-sky-400 data-mono font-bold">{ activeScenario.ip.rp }%</div>
                  <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">{ activeScenario.ip.morph }</p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-red-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
                <h3 className="text-rose-400 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><span>OOP / Defensor</span></h3>
                <div className="text-3xl font-bold text-white mb-1">{ activeScenario.oop.pos }</div>
                <div className="text-slate-400 data-mono text-sm mb-4">Stack: { activeScenario.oop.stack }</div>
                <div className="bg-slate-900 rounded p-3 border border-red-500/20">
                  <div className="text-xs text-slate-500 uppercase">Risk Premium</div>
                  <div className="text-xl text-rose-500 data-mono font-bold animate-pulse">{ activeScenario.oop.rp }%</div>
                  <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">{ activeScenario.oop.morph }</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={ { __html: activeScenario.theory } } />
            </div>
          </div>
        ) }
      </div>
    </main>
  );
}
