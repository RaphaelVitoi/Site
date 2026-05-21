'use client';

/**
 * IDENTITY: Painel de Teoria com Tabs (SOTA v4.1)
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Exibir Fundamento Teórico, Diluição SPR, Vetor de Exploit e Quiz por cenário.
 *       Visão Arquitetural SOTA com alta densidade de informação e RP Dinâmico.
 * BINDING: [engine/types.ts, ui/SprPipeline.tsx, ui/QuizEngine.tsx, simulator.module.css]
 */

import { useMemo, useState } from 'react';
import type { Scenario, SprStage } from '../engine/types';
import { SotaTooltip } from '../ui/SotaTooltip';

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

const calcBF = ( rp: number ) =>
{
  if ( rp >= 100 ) return 999; // Evitar infinito que quebra UI
  return 100 / ( 100 - rp );
};

function BubbleFactorDiagnostic ( { ipRp, oopRp }: Readonly<{ ipRp: number; oopRp: number; }> )
{
  const ipBf = calcBF( ipRp );
  const oopBf = calcBF( oopRp );
  const deltaRp = ipRp - oopRp;
  const ipEquity = ipBf / ( ipBf + 2 );
  const oopEquity = oopBf / ( oopBf + 2 );
  const chipEvEquity = 1 / 3;
  const ipDelta = ( ( ipEquity - chipEvEquity ) * 100 ).toFixed( 1 );
  const oopDelta = ( ( oopEquity - chipEvEquity ) * 100 ).toFixed( 1 );

  const hasIpAdvantage = deltaRp < 0;

  let deltaLabel = 'Simetria de Pressão (ΔRP 0%)';
  let panelBgClass = 'bg-bg-panel/40 border-white/5';
  let iconBgClass = 'bg-white/5 text-text-muted';
  let iconClass = 'fa-equals';
  let textClass = 'text-text-muted';

  if ( hasIpAdvantage )
  {
    deltaLabel = `IP com Vantagem de Risco (ΔRP ${ Math.abs( deltaRp ).toFixed( 1 ) }%)`;
    panelBgClass = 'bg-accent-emerald/5 border-accent-emerald/20';
    iconBgClass = 'bg-accent-emerald/10 text-accent-emerald';
    iconClass = 'fa-bolt-lightning';
    textClass = 'text-accent-emerald';
  } else if ( deltaRp > 0 )
  {
    deltaLabel = `IP sob Punição de Valuation (ΔRP +${ deltaRp.toFixed( 1 ) }%)`;
    panelBgClass = 'bg-accent-rose/5 border-accent-rose/20';
    iconBgClass = 'bg-accent-rose/10 text-accent-rose';
    iconClass = 'fa-biohazard';
    textClass = 'text-accent-rose';
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-black/20 border border-white/5 shadow-inner">
        <h4 className="text-label mb-6 flex items-center gap-2">
          <i className="fa-solid fa-microscope text-accent-indigo" />
          <span className="uppercase tracking-widest font-black text-[0.6rem]">Diagnóstico de Assimetria</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SotaTooltip align="left" title="Agressor (IP)" content="O agressor dita o preço. Se o RP dele é significativamente menor, ele usa o Leverage para extrair Fold Equity não-linear da mesa." theme="indigo">
            <div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-indigo/20 relative overflow-hidden group transition-all hover:bg-bg-panel/60">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-chess-knight text-5xl text-accent-indigo" /></div>
              <p className="text-[0.55rem] text-accent-indigo-light font-black uppercase tracking-[0.2em] mb-2">Agressor (IP)</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-text-bright leading-none tabular-nums font-mono">{ ipRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-accent-indigo font-mono font-bold uppercase tracking-widest">RP</span>
              </div>
              <p className="text-xs text-text-muted m-0 font-medium">BF Equivalente: <span className="text-accent-indigo-light font-mono font-bold tabular-nums">{ ipBf.toFixed( 2 ) }x</span></p>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">Impacto em MDF:</p>
                <p className="text-sm font-bold text-text-muted tabular-nums font-mono">{ ( ipEquity * 100 ).toFixed( 1 ) }% <span className="text-[0.65rem] font-medium text-text-darker">vs 33% ChipEV</span></p>
                <p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1 tabular-nums tracking-tighter">+{ ipDelta }pp Inflação</p>
              </div>
            </div>
          </SotaTooltip>

          <SotaTooltip align="right" title="Defensor (OOP)" content="O defensor paga a conta do ICM. Ele precisa de uma mão exponencialmente mais forte para justificar o call, ancorando a defesa no Teto de Risco." theme="indigo">
            <div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-rose/20 relative overflow-hidden group transition-all hover:bg-bg-panel/60">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-shield-halved text-5xl text-accent-rose" /></div>
              <p className="text-[0.55rem] text-accent-rose-light font-black uppercase tracking-[0.2em] mb-2">Defensor (OOP)</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-text-bright leading-none tabular-nums font-mono">{ oopRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-accent-rose font-mono font-bold uppercase tracking-widest">RP</span>
              </div>
              <p className="text-xs text-text-muted m-0 font-medium">BF Equivalente: <span className="text-accent-rose-light font-mono font-bold tabular-nums">{ oopBf.toFixed( 2 ) }x</span></p>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">Impacto em MDF:</p>
                <p className="text-sm font-bold text-text-muted tabular-nums font-mono">{ ( oopEquity * 100 ).toFixed( 1 ) }% <span className="text-[0.65rem] font-medium text-text-darker">vs 33% ChipEV</span></p>
                <p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1 tabular-nums tracking-tighter">+{ oopDelta }pp Inflação</p>
              </div>
            </div>
          </SotaTooltip>
        </div>
      </div>

      <div className={ `p-6 rounded-3xl border flex items-center gap-6 ${ panelBgClass } transition-all duration-500 shadow-lg` }>
        <div className={ `w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${ iconBgClass } border border-white/10` }>
          <i className={ `fa-solid ${ iconClass } text-xl` } />
        </div>
        <div>
          <p className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Vetor de Distorção de Nash</p>
          <p className={ `text-2xl font-black m-0 font-heading tracking-tighter tabular-nums ${ textClass }` }>
            { deltaRp > 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) }% <span className="text-sm ml-1 opacity-60">ΔRP</span>
          </p>
          <p className="text-xs text-text-muted m-0 mt-1 font-medium">{ deltaLabel }</p>
        </div>
      </div>
    </div>
  );
}

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
              <i className="fa-solid fa-table-cells"></i> Matriz de Diluição (Projeção 33%)
            </h4>
            <div className="w-full overflow-x-auto scrollbar-hide pb-2">
              <div className="min-w-[400px] overflow-hidden rounded-lg border border-sky-500/20 bg-slate-900/50 shadow-inner">
                <table className="w-full text-left text-[0.65rem] font-mono tabular-nums">
                  <thead className="bg-sky-950/30 text-sky-300 uppercase tracking-wider border-b border-sky-500/20">
                    <tr>
                      <th className="p-2.5 pl-4 font-black tracking-widest">Street</th>
                      <th className="p-2.5 font-black tracking-widest">Pote</th>
                      <th className="p-2.5 font-black tracking-widest text-center">Stack Res.</th>
                      <th className="p-2.5 font-black tracking-widest text-center">SPR</th>
                      <th className="p-2.5 font-black tracking-widest text-right pr-4">RP Res.</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 divide-y divide-white/5">
                    { ( effectiveSprData ?? scenario.sprData ?? [] ).map( ( stage: SprStage ) =>
                    {
                      const investido = Math.max( 0, ( stage.potSize - preflopPot ) / 2 );
                      const residual = Math.max( 0, effStack - investido );
                      const sprValue = stage.potSize > 0 ? ( residual / stage.potSize ) : Infinity;
                      const sprText = sprValue === Infinity ? '∞' : sprValue.toFixed( 1 );
                      const isDeath = stage.rpValue >= 35;
                      return (
                        <tr key={ stage.name } className={ `hover:bg-white/5 transition-colors ${ isDeath ? 'bg-rose-950/10' : '' }` }>
                          <td className="p-2.5 pl-4 font-bold text-sky-400 uppercase tracking-tighter">{ stage.name }</td>
                          <td className="p-2.5 font-bold">{ stage.potSize.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-0.5">bb</span></td>
                          <td className="p-2.5 text-center font-medium opacity-80">{ residual.toFixed( 1 ) }<span className="text-[0.55rem] text-text-darker ml-0.5">bb</span></td>
                          <td className={ `p-2.5 text-center font-black ${ sprValue < 1 ? 'text-rose-400' : 'text-emerald-400' }` }>{ sprText }</td>
                          <td className={ `p-2.5 text-right pr-4 font-black ${ isDeath ? 'text-rose-500' : 'text-amber-400' }` }>{ stage.rpValue.toFixed( 1 ) }%</td>
                        </tr>
                      );
                    } ) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) }

        { activeTab !== 'theory' && activeTab !== 'spr' && (
          <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-xl bg-black/20 font-mono text-xs uppercase tracking-widest animate-sota-in">
            Painel <span className="text-white font-bold">[{ TABS.find( t => t.id === activeTab )?.label }]</span> em calibração SOTA...
          </div>
        ) }
      </div>
    </div>
  );
}
