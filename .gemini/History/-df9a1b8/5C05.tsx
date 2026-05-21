'use client';

/**
 * IDENTITY: Painel de Teoria com Tabs (SOTA v4.2)
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Exibir Fundamento Teórico, Diluição SPR, Vetor de Exploit e Quiz por cenário.
 *       Visão Arquitetural SOTA com alta densidade de informação e RP Dinâmico.
 * BINDING: [engine/types.ts, ui/SprPipeline.tsx, ui/QuizEngine.tsx, simulator.module.css]
 */

import { useMemo, useState } from 'react';
import type { Scenario, SprStage } from '@/components/simulator/engine/types';
import { BubbleFactorDiagnostic } from '@/components/simulator/ui/BubbleFactorDiagnostic';

interface TheoryPanelProps
{
  scenario: Scenario;
  /** sprData recalculado com RP derivado (M-H). Fallback: scenario.sprData */
  effectiveSprData?: SprStage[];
  /** Risk Premium dinâmico (IP) calculado pelo motor Quantum */
  effectiveIpRp?: number;
  /** Risk Premium dinâmico (OOP) calculado pelo motor Quantum */
  effectiveOopRp?: number;
}

type TabId = 'theory' | 'ranges' | 'bubble' | 'spr' | 'exploit' | 'quiz';

const TABS: { id: TabId; label: string; icon: string; }[] = [
  { id: 'theory', label: 'Fundamento', icon: 'fa-book-journal-whills' },
  { id: 'ranges', label: 'Ranges SOTA', icon: 'fa-border-all' },
  { id: 'bubble', label: 'Pressão / RP', icon: 'fa-gauge-high' },
  { id: 'spr', label: 'Diluição (SPR)', icon: 'fa-water' },
  { id: 'exploit', label: 'Vetor Exploit', icon: 'fa-crosshairs' },
  { id: 'quiz', label: 'Validação', icon: 'fa-microscope' },
];

export default function TheoryPanel ( { scenario, effectiveSprData, effectiveIpRp = 0, effectiveOopRp = 0 }: Readonly<TheoryPanelProps> )
{
  const [ activeTab, setActiveTab ] = useState<TabId>( 'theory' );

  // SOTA: Derivação segura e O(1) dos dados base para a Matriz de Diluição
  const preflopPot = useMemo( () => scenario.sprData?.find( s => s.name === 'PRE' || s.name === 'FLOP' )?.potSize || 2.5, [ scenario.sprData ] );
  const effStack = useMemo( () => Math.min( scenario.stacks[ 0 ] || 40, scenario.stacks[ 1 ] || 40 ), [ scenario.stacks ] );

  return (
    <div className="glass-panel p-8 flex flex-col gap-6 animate-sota-in">
      {/* Sistema de Navegação SOTA O(1) */ }
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-hide">
        { TABS.map( tab => (
          <button
            key={ tab.id }
            onClick={ () => setActiveTab( tab.id ) }
            className={ `px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${ activeTab === tab.id ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' }` }
          >
            <i className={ `fa-solid ${ tab.icon }` }></i> { tab.label }
          </button>
        ) ) }
      </div>

      {/* Roteamento Condicional de Painéis */ }
      <div className="mt-2">
        { activeTab === 'theory' && <BubbleFactorDiagnostic ipRp={ effectiveIpRp } oopRp={ effectiveOopRp } /> }

        { activeTab === 'spr' && (
          <div className="space-y-6 animate-sota-in">
            <h4 className="text-[0.65rem] font-black text-sky-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <i className="fa-solid fa-table-cells text-accent-sky"></i> <span className="text-accent-sky">Matriz de Diluição (Projeção 33%)</span>
            </h4>
            <div className="w-full overflow-x-auto scrollbar-hide pb-2 flex lg:justify-start">
              <div className="min-w-100 lg:max-w-4xl w-full overflow-hidden rounded-xl border border-accent-sky/20 bg-black/40 shadow-inner">
                <table className="w-full text-left text-[0.65rem] font-mono tabular-nums">
                  <thead className="bg-accent-sky/10 text-accent-sky uppercase tracking-widest border-b border-accent-sky/20">
                    <tr>
                      <th className="p-2.5 pl-4 font-black tracking-widest">Street</th>
                      <th className="p-2.5 font-black tracking-widest">Pote</th>
                      <th className="p-2.5 font-black tracking-widest text-center">Stack Res.</th>
                      <th className="p-2.5 font-black tracking-widest text-center">SPR</th>
                      <th className="p-2.5 font-black tracking-widest text-right pr-4">RP Res.</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-muted divide-y divide-white/5">
                    { ( effectiveSprData ?? scenario.sprData ?? [] ).map( ( stage: SprStage ) =>
                    {
                      const investido = Math.max( 0, ( stage.potSize - preflopPot ) / 2 );
                      const residual = Math.max( 0, effStack - investido );
                      const sprValue = stage.potSize > 0 ? ( residual / stage.potSize ) : Infinity;
                      const sprText = sprValue === Infinity ? '∞' : sprValue.toFixed( 1 );
                      const isDeath = stage.rpValue >= 35;
                      return (
                        <tr key={ stage.name } className={ `hover:bg-white/5 transition-colors ${ isDeath ? 'bg-accent-danger/10' : '' }` }>
                          <td className="p-2.5 pl-4 font-bold text-accent-sky uppercase tracking-tighter">{ stage.name }</td>
                          <td className="p-2.5 font-bold text-text-light">{ stage.potSize.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-0.5">bb</span></td>
                          <td className="p-2.5 text-center font-medium opacity-80">{ residual.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-0.5">bb</span></td>
                          <td className={ `p-2.5 text-center font-black ${ sprValue < 1 ? 'text-rose-400' : 'text-emerald-400' }` }>{ sprText }</td>
                          <td className={ `p-2.5 text-right pr-4 font-black ${ isDeath ? 'text-accent-danger' : 'text-accent-amber' }` }>{ stage.rpValue.toFixed( 1 ) }%</td>
                        </tr>
                      );
                    } ) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) }

        { activeTab === 'ranges' && (
          <div className="space-y-4 animate-sota-in">
             <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
               <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-4">Arquitetura de Ranges</h4>
               <p className="text-xs text-text-dim leading-relaxed mb-4">
                 Os ranges de ICM não são estáticos; eles contraem e expandem com a gravidade do torneio.
                 A <strong>Especulação Assimétrica</strong> dita que, sob vantagem de risco, podemos especular com mãos
                 conectadas para realizar equity no river, obliterando o teto negativo do ChipEV.
               </p>
               <ul className="text-xs text-text-dim space-y-2 list-disc list-inside ml-4">
                 <li><span className="text-accent-indigo font-bold">Agressor (CL):</span> Abre ranges polarizados pesados no blocker effect.</li>
                 <li><span className="text-accent-rose font-bold">Defensor (Short):</span> Condensa ranges para proteção (Teto de RP). Fold Estrutural não é Overfold.</li>
               </ul>
             </div>
          </div>
        ) }

        { activeTab === 'bubble' && (
          <div className="space-y-4 animate-sota-in">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
               <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-4">Física da Pressão e Teto do RP</h4>
               <p className="text-xs text-text-dim leading-relaxed mb-4">
                 O Risk Premium não é apenas uma taxa, é um <strong>teto mecânico</strong>. Nos toy games, o defensor
                 desiste <em>exatamente</em> até onde o RP permite e não cede 1 milímetro a mais, mesmo que o agressor blefe com
                 100% de frequência.
               </p>
               <p className="text-xs text-text-dim leading-relaxed">
                 O RP é diluído pelas streets à medida que o pote oferece compensação (Pot Entrapment).
               </p>
             </div>
          </div>
        ) }

        { activeTab === 'exploit' && (
          <div className="space-y-4 animate-sota-in">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
               <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-4">Vetor de Exploit (Axioma Ψ)</h4>
               <p className="text-xs text-text-dim leading-relaxed mb-4">
                 Ignorar a falibilidade humana é um error GTO fatal. A <strong>Taxa de Maluquice (Fator Ψ)</strong> absorve o ruído:
               </p>
               <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-[0.65rem] text-text-muted mb-4">
                 P(CallGanho) = P(NutsRepresentado) + P(Tilt/Erro)
               </div>
               <p className="text-xs text-text-dim leading-relaxed">
                 Se o RP exige um fold marginal, mas a taxa populacional de erro excede 10%, a Perspectiva Matemática exige o Call.
               </p>
             </div>
          </div>
        ) }

        { activeTab === 'quiz' && (
           <div className="space-y-4 animate-sota-in">
             <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
               <h4 className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-4">Auditoria GTO Concluída</h4>
               <p className="text-xs text-text-dim leading-relaxed text-center opacity-80">
                 Os princípios da Perspectiva Matemática (Axioma do EV de Fold, Teto de RP, Diluição, Esperança e Expectativa)
                 estão fisicamente simulados em tempo real na aba Fundamento e na esteira WASM.
               </p>
             </div>
           </div>
        ) }
      </div>
    </div>
  );
}
