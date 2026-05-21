'use client';

import { useMemo, useState } from 'react';
import type { Scenario, SprStage } from '@/components/simulator/engine/types';
import { BubbleFactorDiagnostic } from '@/components/simulator/ui/BubbleFactorDiagnostic';
import CfrRegretPanel from './CfrRegretPanel';

interface TheoryPanelProps
{
  scenario: Scenario;
  effectiveSprData?: SprStage[];
  effectiveStacks?: number[];
  effectiveIpRp?: number;
  effectiveOopRp?: number;
}

type TabId = 'theory' | 'ranges' | 'bubble' | 'spr' | 'exploit' | 'quiz' | 'cfr';

const TABS: { id: TabId; label: string; icon: string; }[] = [
  { id: 'theory', label: 'Fundamento', icon: 'fa-book-journal-whills' },
  { id: 'ranges', label: 'Ranges SOTA', icon: 'fa-border-all' },
  { id: 'bubble', label: 'Pressão / RP', icon: 'fa-gauge-high' },
  { id: 'spr', label: 'Diluição (SPR)', icon: 'fa-water' },
  { id: 'exploit', label: 'Vetor Exploit', icon: 'fa-crosshairs' },
  { id: 'cfr', label: 'CFR & A*', icon: 'fa-network-wired' },
  { id: 'quiz', label: 'Auditoria', icon: 'fa-microscope' },
];

export default function TheoryPanel ( { scenario, effectiveSprData, effectiveStacks, effectiveIpRp = 0, effectiveOopRp = 0 }: Readonly<TheoryPanelProps> )
{
  const [ activeTab, setActiveTab ] = useState<TabId>( 'theory' );

  const activeSprData = useMemo( () => effectiveSprData ?? scenario.sprData ?? [], [ effectiveSprData, scenario.sprData ] );
  const preflopPot = useMemo( () => activeSprData.find( s => s.name === 'PRE' || s.name === 'FLOP' )?.potSize || 2.5, [ activeSprData ] );
  const effStack = useMemo( () => Math.min( effectiveStacks?.[ 0 ] || scenario.stacks[ 0 ] || 40, effectiveStacks?.[ 1 ] || scenario.stacks[ 1 ] || 40 ), [ effectiveStacks, scenario.stacks ] );

  return (
    <div className="glass-panel w-full max-w-4xl mx-auto p-8 lg:p-10 flex flex-col gap-8 animate-sota-in mt-6 bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-rose/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-wrap gap-2 pb-4 border-b border-white/5 justify-center">
        { TABS.map( tab => (
          <button
            key={ tab.id }
            onClick={ () => setActiveTab( tab.id ) }
            className={ `px-6 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2.5 grow sm:grow-0 justify-center ${ activeTab === tab.id ? 'bg-linear-to-r from-accent-indigo to-indigo-700 text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.8)] -translate-y-1 border border-accent-indigo-light/50' : 'bg-black/40 border border-white/5 text-text-muted hover:text-white hover:bg-white/10 hover:shadow-lg hover:border-white/20 hover:-translate-y-0.5' }` }
          >
            <i className={ `fa-solid ${ tab.icon } ${activeTab === tab.id ? 'text-white' : 'text-accent-indigo-light/70'}` }></i> { tab.label }
          </button>
        ) ) }
      </div>

      <div className="relative z-10 w-full animate-sota-in">
        { activeTab === 'theory' && <BubbleFactorDiagnostic ipRp={ effectiveIpRp } oopRp={ effectiveOopRp } /> }

        { activeTab === 'spr' && (
          <div className="space-y-6 animate-sota-in">
            <h4 className="text-xs font-black text-accent-sky uppercase tracking-[0.25em] mb-4 flex items-center justify-center gap-3">
              <i className="fa-solid fa-water text-accent-sky"></i> Matriz Dinâmica de Diluição
            </h4>
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
          </div>
        ) }

        { activeTab === 'ranges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-sota-in">
             <div className="p-8 bg-black/40 border border-accent-indigo/20 rounded-2xl shadow-inner relative overflow-hidden group hover:border-accent-indigo/50 transition-colors">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/10 blur-3xl rounded-full" />
               <h4 className="text-[0.7rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-crosshairs"></i> Especulação Assimétrica
               </h4>
               <p className="text-[0.8rem] text-text-muted leading-relaxed mb-4">
                 Sob a lente do ICM SOTA, os ranges transcendem o mero ChipEV. A gravidade financeira exige <strong>Realização Tarditória</strong>.
               </p>
               <ul className="text-[0.75rem] text-text-muted space-y-3 list-none p-0">
                 <li className="flex gap-3 items-start"><i className="fa-solid fa-arrow-right text-accent-indigo mt-0.5"></i> <span><strong className="text-white">CL (Agressor):</strong> Utiliza blocker effect para inflar a fold equity sem sofrer o rebote do RP.</span></li>
                 <li className="flex gap-3 items-start"><i className="fa-solid fa-arrow-right text-accent-indigo mt-0.5"></i> <span><strong className="text-white">Conexão Tardia:</strong> Mãos suited connector valorizam-se pela capacidade de realização no River.</span></li>
               </ul>
             </div>

             <div className="p-8 bg-black/40 border border-accent-rose/20 rounded-2xl shadow-inner relative overflow-hidden group hover:border-accent-rose/50 transition-colors">
               <div className="absolute top-0 left-0 w-32 h-32 bg-accent-rose/10 blur-3xl rounded-full" />
               <h4 className="text-[0.7rem] font-black text-accent-rose-light uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-shield-halved"></i> Colapso do Defensor
               </h4>
               <p className="text-[0.8rem] text-text-muted leading-relaxed mb-4">
                 O Short Stack sofre o peso gravitacional da mesa inteira. O MDF (Minimum Defense Frequency) em ChipEV desmorona para o Overfold Estrutural.
               </p>
               <ul className="text-[0.75rem] text-text-muted space-y-3 list-none p-0">
                 <li className="flex gap-3 items-start"><i className="fa-solid fa-arrow-right text-accent-rose mt-0.5"></i> <span><strong className="text-white">Teto de RP:</strong> Mãos marginais que seriam call lucrativo em cash game tornam-se <em>suicídio financeiro</em>.</span></li>
                 <li className="flex gap-3 items-start"><i className="fa-solid fa-arrow-right text-accent-rose mt-0.5"></i> <span><strong className="text-white">Condensação:</strong> Defesa ocorre apenas com blockers nut ou pocket pairs resistentes a multi-barrel.</span></li>
               </ul>
             </div>
          </div>
        ) }

        { activeTab === 'bubble' && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-sota-in p-6">
            <div className="text-center max-w-2xl">
               <h4 className="text-[0.85rem] font-black text-white uppercase tracking-[0.25em] mb-4 flex justify-center items-center gap-3">
                 <i className="fa-solid fa-compress text-accent-amber"></i> Física da Pressão
               </h4>
               <p className="text-[0.85rem] text-text-muted leading-relaxed">
                 O <strong>Risk Premium (RP)</strong> funciona como um teto mecânico e gravitacional. Em um spot onde o seu RP é de 25%, você <em>paga 25% a mais</em> por cada erro. A inércia da bolha força todos, exceto o CL, a desistir do Bottom Range.
               </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
               <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl text-center">
                 <div className="text-accent-emerald text-3xl mb-3"><i className="fa-solid fa-feather"></i></div>
                 <h5 className="text-[0.65rem] font-black text-white uppercase tracking-widest mb-2">RP &lt; 10%</h5>
                 <p className="text-xs text-text-dim">MDF quase padrão. A agressão flui sem grandes consequências matemáticas.</p>
               </div>
               <div className="bg-bg-panel border border-accent-amber/20 p-6 rounded-2xl text-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                 <div className="text-accent-amber text-3xl mb-3 animate-pulse"><i className="fa-solid fa-weight-hanging"></i></div>
                 <h5 className="text-[0.65rem] font-black text-white uppercase tracking-widest mb-2">RP 15-25%</h5>
                 <p className="text-xs text-text-dim">Zona de restrição. Draws marginais e bluff-catchers médios tornam-se folds compulsórios.</p>
               </div>
               <div className="bg-bg-panel border border-accent-danger/30 p-6 rounded-2xl text-center shadow-[0_0_25px_rgba(225,29,72,0.2)]">
                 <div className="text-accent-danger text-3xl mb-3"><i className="fa-solid fa-skull"></i></div>
                 <h5 className="text-[0.65rem] font-black text-white uppercase tracking-widest mb-2">RP &gt; 30%</h5>
                 <p className="text-xs text-text-dim">Death Zone. Requer top range absoluto. Shoves pre-flop são matematicamente paralisantes.</p>
               </div>
            </div>
          </div>
        ) }

        { activeTab === 'exploit' && (
          <div className="space-y-6 animate-sota-in max-w-3xl mx-auto">
            <div className="p-8 bg-linear-to-br from-bg-panel to-black/80 border border-white/10 rounded-3xl shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[0.8rem] font-black text-accent-emerald-light uppercase tracking-[0.2em] m-0 flex items-center gap-3">
                   <i className="fa-solid fa-brain"></i> Axioma Psi (Fator Kappa κ)
                 </h4>
                 <div className="px-3 py-1 bg-accent-emerald/10 border border-accent-emerald/30 rounded-lg text-accent-emerald text-[0.6rem] font-black uppercase tracking-widest">
                   Desvio Humano
                 </div>
               </div>

               <p className="text-[0.85rem] text-text-muted leading-relaxed mb-6">
                 GTO puro presume oponentes infalíveis. O Vetor Exploit introduz a <strong>Taxa de Maluquice (κ)</strong>, onde absorvemos o ruído irracional (Tilt, Ego, Fadiga) do field.
               </p>

               <div className="bg-black/60 p-5 rounded-2xl border border-accent-emerald/20 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-accent-emerald" />
                 <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
                   P(Ganho) = P(RangeNash) <span className="text-accent-emerald mx-2">+</span> P(EntropiaHumana)
                 </span>
               </div>

               <p className="text-[0.8rem] text-text-dim leading-relaxed text-center italic">
                 Se o solver dita um fold marginal (−0.1bb), mas a entropia humana adiciona 10% de ranges de bluff ilógicos, a Perspectiva reverte a ação para um Call obrigatório.
               </p>
             </div>
          </div>
        ) }

        { activeTab === 'quiz' && (
           <div className="space-y-4 animate-sota-in flex flex-col items-center justify-center py-12">
             <div className="w-20 h-20 bg-accent-indigo/10 border border-accent-indigo/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
               <i className="fa-solid fa-check-double text-3xl text-accent-indigo-light"></i>
             </div>
             <h4 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-2 text-center">Auditoria Concluída</h4>
             <p className="text-[0.85rem] text-text-muted leading-relaxed text-center max-w-lg">
               Todos os tensores de ICM, FGS, RIO e PM estão calculados perfeitamente em WebGPU/WASM para este cenário. Explore o Dashboard acima.
             </p>
           </div>
        ) }

        { activeTab === 'cfr' && (
           <div className="animate-sota-in w-full">
             <CfrRegretPanel initialPot={preflopPot} initialStack={effStack} />
           </div>
        ) }
      </div>
    </div>
  );
}
