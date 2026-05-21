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
  },
  {
    id: "agonia", title: "Agonia do Bluffcatcher", env: "Teto do MDF (Condensado vs Polar)", icon: "💔",
    verdict: { label: "MDF Quebrado", className: "text-sky-400 border-sky-500/30 bg-sky-950/50" },
    ip: { pos: "CL (Pot Bet)", stack: "80 bb", rp: 4.5, morph: "Polar Extremado" },
    oop: { pos: "Mid (Call)", stack: "30 bb", rp: 22, morph: "Condensado Sangrante" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Colapso do MDF</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">A ilusão do MDF (Minimum Defense Frequency) morre aqui. O CL faz uma aposta Pot-Size. O Mid-stack tem um <em>bluffcatcher</em> puro. Em ChipEV, defenderia metade das vezes.</p><p class="text-slate-300 leading-relaxed mb-6 text-[15px]">No ICM, um range estritamente condensado contra um range polar com <strong>Vantagem de Risco</strong> gera dissipação de equidade absurda. A pressão de 22% obriga o Mid a "quebrar" a matemática e foldar mãos médias mecanicamente (Teto do RP).</p>`,
    exploit: `<p>O solver não só autoriza, como exige que o CL abuse dessa falha estrutural do range defensivo.</p>`
  },
  {
    id: "lama", title: "Guerra na Lama", env: "Micro vs Micro (Escada)", icon: "⚔️",
    verdict: { label: "Fome de Laddering", className: "text-emerald-400 border-emerald-500/30 bg-emerald-950/50" },
    ip: { pos: "Micro", stack: "12 bb", rp: 8.5, morph: "Push Estendido" },
    oop: { pos: "Micro", stack: "10 bb", rp: 7.5, morph: "Call Seletivo" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Minitorneio de Sobrevivência</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Com gigantes monopolizando as fichas, os <em>shorts</em> jogam na lama. A probabilidade matemática de qualquer um deles cravar o torneio é nula.</p><p class="text-slate-300 leading-relaxed mb-6 text-[15px]">O instinto grita "ChipEV puro!". Falso. A abundância de outros shorts eleva drasticamente o <strong>EV do Fold</strong>. Cruzar os braços garante <em>laddering</em> à medida que os outros caem. A sobrevida passiva vale dólares, exigindo um prêmio de risco moderado (~8%) para justificar a abdicação dessa garantia.</p>`,
    exploit: `<p>Se o vilão sofre de aversão cega ao risco para garantir um payjump, a matemática exige que você roube os blinds agressivamente.</p>`
  },
  {
    id: "ameaca", title: "A Ameaça Orgânica", env: "Dominância Absoluta (God Mode)", icon: "👑",
    verdict: { label: "Criação de Monstros", className: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/50" },
    ip: { pos: "God Mode (CL)", stack: "90 bb", rp: 12, morph: "Polar Controlado" },
    oop: { pos: "Vice", stack: "25 bb", rp: 21, morph: "Inelástico Defensivo" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Limite do God Mode</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">O CL (90bb) ataca o Vice (25bb). O CL é imune à eliminação; a teoria linear diria que ele tem RP 0% e pode esmagar o <em>board</em>.</p><p class="text-slate-300 leading-relaxed mb-6 text-[15px]">Mas o torneio é orgânico. A <strong>Elasticidade do Bubble Factor</strong> intervém. Se o CL aplicar <em>hero-bluffs</em> arrogantes e dobrar o Vice, este salta para 50bb+. <strong>O CL acaba de armar o único rival capaz de usurpar o seu império.</strong> O solver impõe ~12% de RP à liderança, blindando o jogador contra o erro de criar o próprio carrasco.</p>`,
    exploit: `<p>O Vice sofre uma pressão letal de 21%. Expurgue os overbluffs contra ranges inelásticos e mude a marcha inteiramente para Thin Value.</p>`
  },
  {
    id: "chipev", title: "O Vácuo Matemático", env: "Sem Payjumps (ChipEV Puro)", icon: "⚙️",
    verdict: { label: "MDF Perfeito", className: "text-slate-400 border-slate-500/30 bg-slate-900/50" },
    ip: { pos: "Qualquer IP", stack: "100 bb", rp: 0, morph: "Polar Perfeito" },
    oop: { pos: "Qualquer OOP", stack: "100 bb", rp: 0, morph: "Defesa Base" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Equilíbrio Linear</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Início de torneio ou Cash Game. Não há ICM. A utilidade das fichas é estritamente linear: 1 ficha vale 1 ficha.</p><p class="text-slate-300 leading-relaxed mb-6 text-[15px]">O Nash Equilibrium atua como um relógio suíço. Contra uma aposta do tamanho do pote, o <strong>Alpha</strong> dita exatos 33.3% de bluffs. O <strong>MDF</strong> repousa em perfeitos 50.0%. A matemática não sofre deformações emocionais ou utilitárias.</p>`,
    exploit: `<p>Sem a proteção das bolhas de prêmios, a exploração baseia-se em punir desvios de frequência estritos com precisão mecânica.</p>`
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

  // Motor de Dinâmicas de Nash (Adaptado do protótipo)
  const solveNashDynamics = ( ip_rp: number, oop_rp: number ) => {
    let defense = 50 - ( oop_rp * 1.4 ) + ( ip_rp * 0.3 );
    let bluff = 33.3 + ( oop_rp * 1.1 ) - ( ip_rp * 0.8 );
    defense = Math.max( 0, Math.min( 100, defense ) );
    bluff = Math.max( 0, Math.min( 100, bluff ) );
    if ( ip_rp === 0 && oop_rp === 0 ) { bluff = 33.3; defense = 50; }
    return { bluff, defense };
  };

  const dynamics = activeScenario ? solveNashDynamics( activeScenario.ip.rp, activeScenario.oop.rp ) : { bluff: 33.3, defense: 50 };
  const dB = dynamics.bluff - 33.3;
  const dD = dynamics.defense - 50;

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
                <h3 className="text-sky-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-2"><span>IP / Agressor</span></h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-1">{ activeScenario.ip.pos }</div>
                  <div className="inline-block data-mono text-sm text-slate-400 font-medium bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">Stack: { activeScenario.ip.stack }</div>
                </div>

                {/* GAUGE IP */ }
                <div className="relative w-32 h-32 mx-auto my-6">
                  <svg viewBox="0 0 36 36" className="block w-full h-full">
                    <path fill="none" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="2.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] transition-all duration-1000 ease-out" strokeDasharray={ `${Math.min( 100, ( activeScenario.ip.rp / 26 ) * 100 )}, 100` } d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="data-mono text-3xl font-black text-white">{ activeScenario.ip.rp }%</span>
                    <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-1">R. Premium</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Morfologia de Range</p>
                  <span className="inline-block text-xs font-bold text-sky-300 bg-sky-950/30 px-4 py-2 rounded-lg border border-sky-500/20">{ activeScenario.ip.morph }</span>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-red-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
                <h3 className="text-rose-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-2"><span>OOP / Defensor</span></h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-1">{ activeScenario.oop.pos }</div>
                  <div className="inline-block data-mono text-sm text-slate-400 font-medium bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">Stack: { activeScenario.oop.stack }</div>
                </div>

                {/* GAUGE OOP */ }
                <div className="relative w-32 h-32 mx-auto my-6">
                  <svg viewBox="0 0 36 36" className="block w-full h-full">
                    <path fill="none" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="2.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.6)] transition-all duration-1000 ease-out" strokeDasharray={ `${Math.min( 100, ( activeScenario.oop.rp / 26 ) * 100 )}, 100` } d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="data-mono text-3xl font-black text-white">{ activeScenario.oop.rp }%</span>
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">R. Premium</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Morfologia de Range</p>
                  <span className="inline-block text-xs font-bold text-rose-300 bg-rose-950/30 px-4 py-2 rounded-lg border border-rose-500/20">{ activeScenario.oop.morph }</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC FREQUENCIES PANEL */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Alpha / Bluff */ }
              <div className="bg-slate-900/60 p-6 rounded-xl border-t-4 border-t-sky-500 border-x border-b border-white/5 hover:border-t-sky-400 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Teto de Agressão</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Frequência Ótima de Bluff</p>
                  </div>
                  <span className={ `data-mono text-xs font-bold px-2 py-1 rounded border ${dB > 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : ( dB < 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'bg-slate-800 border-slate-700 text-slate-400' )}` }>
                    { dB > 0 ? '+' : '' }{ dB.toFixed( 1 ) }% vs cEV
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="data-mono text-5xl font-black text-white tracking-tighter">{ dynamics.bluff.toFixed( 1 ) }</span>
                    <span className="text-xl font-bold text-sky-400">%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
                    <div className="h-full bg-sky-500 transition-all duration-1000 ease-out" style={ { width: `${dynamics.bluff}%` } }></div>
                  </div>
                </div>
              </div>

              {/* MDF / Defense */ }
              <div className="bg-slate-900/60 p-6 rounded-xl border-t-4 border-t-rose-500 border-x border-b border-white/5 hover:border-t-rose-400 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ponto de Ruptura</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Limiar de Indiferença (Call)</p>
                  </div>
                  <span className={ `data-mono text-xs font-bold px-2 py-1 rounded border ${dD > 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : ( dD < 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'bg-slate-800 border-slate-700 text-slate-400' )}` }>
                    { dD > 0 ? '+' : '' }{ dD.toFixed( 1 ) }% vs cEV
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="data-mono text-5xl font-black text-white tracking-tighter">{ dynamics.defense.toFixed( 1 ) }</span>
                    <span className="text-xl font-bold text-rose-400">%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
                    <div className="h-full bg-rose-500 transition-all duration-1000 ease-out" style={ { width: `${dynamics.defense}%` } }></div>
                  </div>
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
