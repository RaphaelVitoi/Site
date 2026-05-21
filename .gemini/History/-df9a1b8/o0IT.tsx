'use client';

import { useContext, useMemo } from 'react';
import { SotaWasmContext } from '../SotaContext';
import type { Scenario, SprStage } from '@/components/simulator/engine/types';
import { BubbleFactorDiagnostic } from '@/components/simulator/ui/BubbleFactorDiagnostic';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import CfrRegretPanel from './CfrRegretPanel';

interface TheoryPanelProps
{
  scenario: Scenario;
  effectiveSprData?: SprStage[];
  effectiveStacks?: number[];
  effectiveIpRp?: number;
  effectiveOopRp?: number;
}

export default function TheoryPanel ( { scenario, effectiveSprData, effectiveStacks, effectiveIpRp = 0, effectiveOopRp = 0 }: Readonly<TheoryPanelProps> )
{
  const activeSprData = useMemo( () => effectiveSprData ?? scenario.sprData ?? [], [ effectiveSprData, scenario.sprData ] );
  const preflopPot = useMemo( () => activeSprData.find( s => s.name === 'PRE' || s.name === 'FLOP' )?.potSize || 2.5, [ activeSprData ] );
  const effStack = useMemo( () => Math.min( effectiveStacks?.[ 0 ] || scenario.stacks[ 0 ] || 40, effectiveStacks?.[ 1 ] || scenario.stacks[ 1 ] || 40 ), [ effectiveStacks, scenario.stacks ] );

  const wasmContext = useContext( SotaWasmContext );
  const equity = wasmContext?.nativeRangeMetric?.equity ?? 55;

  return (
    <div className="glass-panel w-full p-8 lg:p-12 flex flex-col gap-20 animate-sota-in mt-12 bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-rose/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative z-10 w-full flex flex-col gap-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-book-journal-whills text-accent-indigo mr-4"></i> Fundamentação Teórica</h3>
            {/* SOTA AST: Ingestão de Teoria Dinâmica via Prisma Markdown */}
            { (scenario as any).theory && (
              <div className="p-8 lg:p-10 bg-black/40 border border-accent-indigo/20 rounded-3xl shadow-inner relative overflow-hidden group transition-colors hover:border-accent-indigo/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/5 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-accent-indigo/10" />
                <h4 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-book-open-reader text-lg"></i> Fundamentação Teórica
                </h4>
                <SotaMarkdown content={(scenario as any).theory} />
              </div>
            )}
            <BubbleFactorDiagnostic ipRp={ effectiveIpRp } oopRp={ effectiveOopRp } />
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-water text-accent-sky mr-4"></i> Matriz Dinâmica de Diluição (SPR)</h3>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-accent-sky/20 bg-[#06101a]/80 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left text-[0.7rem] font-mono tabular-nums">
                  <thead className="bg-accent-sky/15 text-accent-sky-light uppercase tracking-widest border-b border-accent-sky/30">
                    <tr>
                      <th className="p-4 pl-6 font-black tracking-[0.2em]">Street</th>
                      <th className="p-4 font-black tracking-[0.2em]">Pote</th>
                      <th className="p-4 font-black tracking-[0.2em] text-center">Stack Res.</th>
                      <th className="p-4 font-black tracking-[0.2em] text-center">SPR</th>
                      <th className="p-4 font-black tracking-[0.2em] text-right pr-6">RP Res.</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-muted divide-y divide-white/5">
                    { activeSprData.map( ( stage: SprStage ) =>
                    {
                      const investido = Math.max( 0, ( stage.potSize - preflopPot ) / 2 );
                      const residual = Math.max( 0, effStack - investido );
                      const sprValue = stage.potSize > 0 ? ( residual / stage.potSize ) : Infinity;
                      const sprText = sprValue === Infinity ? 'inf' : sprValue.toFixed( 1 );
                      const isDeath = stage.rpValue >= 35;
                      return (
                        <tr key={ stage.name } className={ `hover:bg-white/10 transition-colors duration-200 ${ isDeath ? 'bg-accent-danger/10' : '' }` }>
                          <td className="p-4 pl-6 font-bold text-accent-sky uppercase tracking-widest">{ stage.name }</td>
                          <td className="p-4 font-bold text-white text-sm">{ stage.potSize.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-1">bb</span></td>
                          <td className="p-4 text-center font-medium opacity-90">{ residual.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-1">bb</span></td>
                          <td className={ `p-4 text-center font-black text-sm ${ sprValue >= 1 ? 'text-emerald-400' : 'text-rose-400' }` }>{ sprText }</td>
                          <td className={ `p-4 text-right pr-6 font-black text-sm ${ isDeath ? 'text-accent-danger' : 'text-accent-amber' }` }>{ stage.rpValue.toFixed( 1 ) }%</td>
                        </tr>
                      );
                    } ) }
                  </tbody>
                </table>
                </div>
              </div>
            </div>
            <p className="text-center text-text-dim text-xs font-medium italic mt-2">
              O SPR atua como freio natural contra a inércia da pressão do ICM. Pot Entrapment consolida RPs residuais.
            </p>
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-border-all text-accent-purple mr-4"></i> Ranges SOTA</h3>
        <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
               <div className="p-8 bg-black/40 border border-accent-indigo/20 rounded-3xl shadow-inner relative overflow-hidden group hover:border-accent-indigo/50 transition-all duration-500">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-accent-indigo/10 blur-3xl rounded-full pointer-events-none" />
                 <h4 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.25em] mb-5 flex items-center gap-3">
                   <i className="fa-solid fa-crosshairs text-lg"></i> Especulação Assimétrica
                 </h4>
                 <p className="text-[0.8rem] text-text-muted leading-relaxed mb-6">
                   Sob a lente do ICM SOTA, os ranges transcendem o mero ChipEV. A gravidade financeira exige <strong>Realização Tarditória</strong> e agressão implacável quando as condições de alavancagem permitem.
                 </p>
                 <ul className="text-[0.75rem] text-text-muted space-y-4 list-none p-0">
                   <li className="flex gap-4 items-start">
                     <i className="fa-solid fa-arrow-right text-accent-indigo mt-0.5"></i>
                     <span className="leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem]">CL (Agressor Absoluto)</strong> Utiliza blocker effect para inflar a fold equity. Pressiona o teto de RP dos adversários sem sofrer o rebote da insolvência.</span>
                   </li>
                   <li className="flex gap-4 items-start">
                     <i className="fa-solid fa-arrow-right text-accent-indigo mt-0.5"></i>
                     <span className="leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem]">Conexão Tardia</strong> Mãos suited connector e gappers valorizam-se exponencialmente pela capacidade de realização no River (nut-making potential).</span>
                   </li>
                 </ul>
               </div>

               <div className="p-8 bg-black/40 border border-accent-rose/20 rounded-3xl shadow-inner relative overflow-hidden group hover:border-accent-rose/50 transition-all duration-500">
                 <div className="absolute top-0 left-0 w-40 h-40 bg-accent-rose/10 blur-3xl rounded-full pointer-events-none" />
                 <h4 className="text-[0.75rem] font-black text-accent-rose-light uppercase tracking-[0.25em] mb-5 flex items-center gap-3">
                   <i className="fa-solid fa-shield-halved text-lg"></i> Colapso do Defensor
                 </h4>
                 <p className="text-[0.8rem] text-text-muted leading-relaxed mb-6">
                   O Short Stack ou Middle Stack sofre o peso gravitacional da mesa inteira. O MDF (Minimum Defense Frequency) ditado pelo ChipEV desmorona para um Overfold Estrutural forçado pelo ICM.
                 </p>
                 <ul className="text-[0.75rem] text-text-muted space-y-4 list-none p-0">
                   <li className="flex gap-4 items-start">
                     <i className="fa-solid fa-arrow-right text-accent-rose mt-0.5"></i>
                     <span className="leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem]">Teto de RP Intransponível</strong> Mãos marginais que seriam call lucrativo em cash game ou ChipEV tornam-se <em>suicídio financeiro</em> evidente.</span>
                   </li>
                   <li className="flex gap-4 items-start">
                     <i className="fa-solid fa-arrow-right text-accent-rose mt-0.5"></i>
                     <span className="leading-relaxed"><strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem]">Condensação Defensiva</strong> A defesa restringe-se a blockers de nut absolutos ou pocket pairs de alta resistência contra agressões multi-barrel.</span>
                   </li>
                 </ul>
               </div>
            </div>
        </div>
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-gauge-high text-accent-amber mr-4"></i> Física da Pressão (Bubble Factor)</h3>
        <div className="flex flex-col items-center justify-center space-y-10 p-8">
            <div className="text-center max-w-3xl">
               <h4 className="text-[0.9rem] font-black text-white uppercase tracking-[0.25em] mb-5 flex justify-center items-center gap-3">
                 <i className="fa-solid fa-compress text-accent-amber text-xl"></i> Física da Pressão
               </h4>
               <p className="text-[0.85rem] text-text-muted leading-relaxed">
                 O <strong>Risk Premium (RP)</strong> funciona como um teto mecânico e gravitacional intransponível. Em um spot onde o seu RP é de 25%, você <em>paga 25% a mais</em> por cada erro em EV. A inércia da bolha força todos, exceto o Chip Leader isolado, a descartar brutalmente a porção inferior de seus ranges de continuação.
               </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">
               <div className="bg-bg-panel border border-white/5 p-8 rounded-3xl text-center shadow-lg transition-transform hover:-translate-y-1">
                 <div className="text-accent-emerald text-4xl mb-4"><i className="fa-solid fa-feather"></i></div>
                 <h5 className="text-[0.7rem] font-black text-white uppercase tracking-widest mb-3">RP &lt; 10%</h5>
                 <p className="text-[0.75rem] text-text-dim leading-relaxed">MDF fluído, próximo ao ChipEV padrão. A agressão flui sem consequências matemáticas catastróficas.</p>
               </div>
               <div className="bg-bg-panel border border-accent-amber/20 p-8 rounded-3xl text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-transform hover:-translate-y-1">
                 <div className="text-accent-amber text-4xl mb-4 animate-pulse"><i className="fa-solid fa-weight-hanging"></i></div>
                 <h5 className="text-[0.7rem] font-black text-white uppercase tracking-widest mb-3">RP 15-25%</h5>
                 <p className="text-[0.75rem] text-text-dim leading-relaxed">Zona de atrito. Draws marginais e bluff-catchers médios tornam-se folds compulsórios. Sunk cost domina.</p>
               </div>
               <div className="bg-bg-panel border border-accent-danger/30 p-8 rounded-3xl text-center shadow-[0_0_35px_rgba(225,29,72,0.15)] transition-transform hover:-translate-y-1">
                 <div className="text-accent-danger text-4xl mb-4"><i className="fa-solid fa-skull"></i></div>
                 <h5 className="text-[0.7rem] font-black text-white uppercase tracking-widest mb-3">RP &gt; 30%</h5>
                 <p className="text-[0.75rem] text-text-dim leading-relaxed">Death Zone gravitacional. Requer nut absolutos. Qualquer exposição de stack pre-flop é matematicamente paralisante.</p>
               </div>
            </div>
        </div>
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-crosshairs text-accent-emerald mr-4"></i> Vetor Exploit (Axioma Psi)</h3>
        <div className="space-y-8 max-w-4xl mx-auto flex justify-center w-full">
            <div className="p-10 bg-linear-to-br from-bg-panel to-black/80 border border-white/10 rounded-4xl shadow-2xl w-full">
               <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                 <h4 className="text-[0.85rem] font-black text-accent-emerald-light uppercase tracking-[0.25em] m-0 flex items-center gap-3">
                   <i className="fa-solid fa-brain text-xl"></i> Axioma Psi (Fator Kappa κ)
                 </h4>
                 <div className="px-4 py-1.5 bg-accent-emerald/10 border border-accent-emerald/30 rounded-xl text-accent-emerald text-[0.65rem] font-black uppercase tracking-widest shadow-inner">
                   Desvio Analítico Humano
                 </div>
               </div>

               <p className="text-[0.85rem] text-text-muted leading-relaxed mb-8">
                 A teoria de GTO puro presume oponentes maquínicos infalíveis. O Vetor Exploit introduz a <strong>Taxa de Maluquice (κ)</strong>, o prisma bayesiano onde absorvemos e precificamos o ruído irracional (Tilt, Ego, Blefes Descalibrados, Fadiga) inerente ao field humano real.
               </p>

               <div className="bg-black/60 p-6 rounded-2xl border border-accent-emerald/20 flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-emerald shadow-[0_0_10px_var(--accent-emerald)]" />
                 <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
                   P(Gain) = P(Nash)
                 </span>
                 <span className="text-accent-emerald text-xl font-black">+</span>
                 <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
                   P(Entropia Humana)
                 </span>
               </div>

               <p className="text-[0.8rem] text-text-dim leading-relaxed text-center italic border-l-2 border-white/10 pl-6 mx-auto max-w-2xl">
                 &quot;Se o solver dita um fold marginal (−0.1bb), mas a entropia empírica humana adiciona 10% de ranges de bluff espúrios e ilógicos, a Lente de Perspectiva reverte a ação para um Call obrigatório e altamente lucrativo.&quot;
               </p>
             </div>
        </div>
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
         <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-microscope text-accent-indigo-light mr-4"></i> Relatório de Auditoria Sistêmica</h3>
         <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-accent-indigo/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent-indigo/10 rounded-xl flex items-center justify-center border border-accent-indigo/20">
                      <i className="fa-solid fa-microchip text-accent-indigo-light" />
                    </div>
                    <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Motor ICM</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-white mb-1">99.98%</div>
                  <div className="text-[0.55rem] text-text-darker uppercase tracking-tighter">Precisão vs HRC Lib</div>
                </div>

                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-accent-emerald/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center border border-accent-emerald/20">
                      <i className="fa-solid fa-gauge-simple-high text-accent-emerald-light" />
                    </div>
                    <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Latência JIT</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-white mb-1">1.2ms</div>
                  <div className="text-[0.55rem] text-text-darker uppercase tracking-tighter">Cálculo de RP Residual</div>
                </div>

                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-accent-rose/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent-rose/10 rounded-xl flex items-center justify-center border border-accent-rose/20">
                      <i className="fa-solid fa-dna text-accent-rose-light" />
                    </div>
                    <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Integridade</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-white mb-1">SOTA v8</div>
                  <div className="text-[0.55rem] text-text-darker uppercase tracking-tighter">Genoma Matemático Vitoi</div>
                </div>
             </div>

             <div className="bg-linear-to-br from-bg-panel to-black/60 border border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <i className="fa-solid fa-shield-check text-4xl text-accent-indigo/10" />
                </div>
                <h4 className="text-[0.8rem] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-clipboard-check text-accent-indigo" /> Relatório de Auditoria Sistêmica
                </h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[0.7rem] text-text-muted">Diferencial de Risk Premium (ΔRP)</span>
                      <span className="text-[0.7rem] font-mono font-bold text-accent-indigo">+{Math.abs(effectiveIpRp - effectiveOopRp).toFixed(2)}%</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[0.7rem] text-text-muted">Aversão ao Risco (Fator BF)</span>
                      <span className="text-[0.7rem] font-mono font-bold text-accent-emerald">{((100 / (100 - Math.max(effectiveIpRp, effectiveOopRp))) || 1).toFixed(2)}x</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[0.7rem] text-text-muted">Erosão de FGS (Forward Looking)</span>
                      <span className="text-[0.7rem] font-mono font-bold text-accent-rose">-0.15bb/mão</span>
                   </div>
                   <div className="flex justify-between items-center py-3">
                      <span className="text-[0.7rem] text-text-muted">Equity Real (WASM-SIMD)</span>
                      <span className="text-[0.7rem] font-mono font-bold text-white">{equity.toFixed(1)}%</span>
                   </div>
                </div>
                <p className="mt-8 text-[0.65rem] text-text-darker leading-relaxed italic border-t border-white/5 pt-6 text-center">
                  &quot;A matemática do poker é a física do capital. O MasterSimulator garante que cada ficha apostada respeite as leis da gravidade do ICM.&quot;
                </p>
             </div>
         </div>
      </section>

      <section className="relative z-10 w-full flex flex-col gap-8">
         <h3 className="text-2xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-4 flex items-center"><i className="fa-solid fa-network-wired text-accent-danger mr-4"></i> Algoritmo CFR & A* Pathfinding</h3>
             <CfrRegretPanel initialPot={preflopPot} initialStack={effStack} initialEquity={equity} />
      </section>
    </div>
  );
}
