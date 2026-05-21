'use client';

/**
 * IDENTITY: Painel de Teoria com Tabs (SOTA v4.1)
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Exibir Fundamento Teórico, Diluição SPR, Vetor de Exploit e Quiz por cenário.
 *       Visão Arquitetural SOTA com alta densidade de informação e RP Dinâmico.
 * BINDING: [engine/types.ts, ui/SprPipeline.tsx, ui/QuizEngine.tsx, simulator.module.css]
 */

import { MetricTooltip } from '@/app/ICMlaboratory/RiskPremiumDashboard';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import type { QuizQuestion as NormalizedQuestion } from '@/components/quiz/types';
import { useContext, useEffect, useState } from 'react';
import DegradationChart from '../charts/DegradationChart';
import type { Scenario, ScenarioQuiz, SprStage } from '../engine/types';
import { SotaEcosystemContext } from '../MasterSimulator';
import SprPipeline from '../ui/SprPipeline';
import RangeMatrix from './RangeMatrix';

interface TheoryPanelProps {
  scenario: Scenario;
  /** sprData recalculado com RP derivado (M-H). Fallback: scenario.sprData */
  effectiveSprData?: SprStage[];
  /** Risk Premium dinâmico (IP) calculado pelo motor Quantum */
  effectiveIpRp?: number;
  /** Risk Premium dinâmico (OOP) calculado pelo motor Quantum */
  effectiveOopRp?: number;
}

type TabId = 'theory' | 'ranges' | 'bubble' | 'spr' | 'exploit' | 'quiz';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'theory', label: 'Fundamento', icon: 'fa-book-journal-whills' },
  { id: 'ranges', label: 'Ranges SOTA', icon: 'fa-border-all' },
  { id: 'bubble', label: 'Pressão / RP', icon: 'fa-gauge-high' },
  { id: 'spr', label: 'Diluição (SPR)', icon: 'fa-water' },
  { id: 'exploit', label: 'Vetor Exploit', icon: 'fa-crosshairs' },
  { id: 'quiz', label: 'Validação', icon: 'fa-microscope' },
];

const calcBF = ( rp: number ) => {
  if ( rp >= 100 ) return 999; // Evitar infinito que quebra UI
  return 100 / ( 100 - rp );
};

function BubbleFactorDiagnostic ( { ipRp, oopRp }: Readonly<{ ipRp: number; oopRp: number }> ) {
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
  let panelBgClass = 'bg-slate-800/30 border-white/5';
  let iconBgClass = 'bg-slate-700 text-slate-400';
  let iconClass = 'fa-equals';
  let textClass = 'text-slate-300';

  if ( hasIpAdvantage )
  {
    deltaLabel = `IP com Vantagem de Risco (ΔRP ${Math.abs( deltaRp ).toFixed( 1 )}%)`;
    panelBgClass = 'bg-emerald-950/20 border-emerald-500/20';
    iconBgClass = 'bg-emerald-500/10 text-emerald-400';
    iconClass = 'fa-bolt';
    textClass = 'text-emerald-400';
  } else if ( deltaRp > 0 )
  {
    deltaLabel = `IP sob Punição de Valuation (ΔRP +${deltaRp.toFixed( 1 )}%)`;
    panelBgClass = 'bg-rose-950/20 border-rose-500/20';
    iconBgClass = 'bg-rose-500/10 text-rose-400';
    iconClass = 'fa-weight-hanging';
    textClass = 'text-rose-400';
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
        <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <i className="fa-solid fa-scale-unbalanced text-fuchsia-500" /> Diagnóstico de Assimetria (Malmuth-Harville)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricTooltip align="left" title="Agressor (IP)" desc="O agressor dita o preço. Se o RP dele é significativamente menor, ele usa o Leverage para extrair Fold Equity não-linear da mesa.">
            <div className="h-full p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><i className="fa-solid fa-khanda text-4xl text-indigo-400" /></div>
              <p className="text-[0.6rem] text-indigo-400 font-bold uppercase tracking-widest mb-1">Agressor (IP)</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-indigo-300 font-mono leading-none">{ ipRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-indigo-500 font-mono">RP</span>
              </div>
              <p className="text-xs text-slate-400 m-0">BF Equivalente: <span className="text-indigo-300 font-mono font-bold">{ ipBf.toFixed( 2 ) }x</span></p>
              <div className="mt-4 pt-3 border-t border-indigo-500/10">
                <p className="text-[0.65rem] text-slate-400 mb-1">Custo de Defesa (Pot-Size):</p>
                <p className="text-sm font-bold text-indigo-300">{ ( ipEquity * 100 ).toFixed( 1 ) }% <span className="text-xs font-normal text-slate-500">vs 33.3% ChipEV</span></p>
                <p className="text-[0.6rem] text-rose-400 font-bold">+{ ipDelta }pp de inflação sobre MDF</p>
              </div>
            </div>
          </MetricTooltip>

          <MetricTooltip align="right" title="Defensor (OOP)" desc="O defensor paga a conta do ICM. Ele precisa de uma mão exponencialmente mais forte para justificar o call, ancorando a defesa no Teto de Risco.">
            <div className="h-full p-4 rounded-lg bg-rose-950/20 border border-rose-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><i className="fa-solid fa-shield-halved text-4xl text-rose-400" /></div>
              <p className="text-[0.6rem] text-rose-400 font-bold uppercase tracking-widest mb-1">Defensor (OOP)</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-rose-300 font-mono leading-none">{ oopRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-rose-500 font-mono">RP</span>
              </div>
              <p className="text-xs text-slate-400 m-0">BF Equivalente: <span className="text-rose-300 font-mono font-bold">{ oopBf.toFixed( 2 ) }x</span></p>
              <div className="mt-4 pt-3 border-t border-rose-500/10">
                <p className="text-[0.65rem] text-slate-400 mb-1">Custo de Defesa (Pot-Size):</p>
                <p className="text-sm font-bold text-rose-300">{ ( oopEquity * 100 ).toFixed( 1 ) }% <span className="text-xs font-normal text-slate-500">vs 33.3% ChipEV</span></p>
                <p className="text-[0.6rem] text-rose-400 font-bold">+{ oopDelta }pp de inflação sobre MDF</p>
              </div>
            </div>
          </MetricTooltip>
        </div>
      </div>

      <div className={ `p-4 rounded-xl border flex items-center gap-4 ${panelBgClass}` }>
        <div className={ `w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}` }>
          <i className={ `fa-solid ${iconClass} text-lg` } />
        </div>
        <div>
          <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Vetor de Distorção de Nash</p>
          <p className={ `text-lg font-black m-0 font-mono ${textClass}` }>
            { deltaRp > 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) }% ΔRP
          </p>
          <p className="text-xs text-slate-400 m-0 mt-0.5">{ deltaLabel }</p>
        </div>
      </div>
    </div>
  );
}

export default function TheoryPanel ( { scenario, effectiveSprData, effectiveIpRp, effectiveOopRp }: Readonly<TheoryPanelProps> ) {
  const [ activeTab, setActiveTab ] = useState<TabId>( 'theory' );

  // SOTA: Bebe diretamente do Sangue Matemático (Contexto SOTA), descartando props defasadas
  const context = useContext( SotaEcosystemContext );

  // Prioriza o RP dinâmico (Quantum) calculado pelo MasterSimulator
  const ipRp = context?.effectiveIpRp ?? effectiveIpRp ?? scenario.ipRp;
  const oopRp = context?.effectiveOopRp ?? effectiveOopRp ?? scenario.oopRp;

  // Reset tab ao mudar cenário
  useEffect( () => {
    setActiveTab( 'theory' );
  }, [ scenario.id ] );


  // Adaptador: transpila formato de quiz vinculado ao cenário para NormalizedQuestion[]
  const normalizeQuizData = ( quizData: ScenarioQuiz | null | undefined ): NormalizedQuestion[] => {
    if ( !quizData ) return [];

    const rawList: ScenarioQuiz[] = Array.isArray( quizData ) ? quizData : [ quizData ];

    return rawList
      .map( ( q, index ): NormalizedQuestion | null => {
        if ( !q ) return null;

        const questionText = q.question || 'Pergunta nao definida';
        const rawOptions = q.options || [];

        const correctIdx = rawOptions.findIndex( opt => opt.isCorrect );
        const correctId = rawOptions[ correctIdx ]?.id || `opt-${Math.max( 0, correctIdx )}`;

        return {
          id: `q-${scenario.id}-${index}`,
          text: questionText,
          options: rawOptions.map( ( opt, i ) => ( {
            id: opt.id || `opt-${i}`,
            label: opt.text || 'Opcao vazia',
          } ) ),
          correctOptionId: correctId,
          explanation: q.explanation || '',
        };
      } )
      .filter( ( q ): q is NormalizedQuestion => q !== null );
  };

  return (
    <div className="glass-panel border border-white/5 rounded-2xl shadow-2xl shadow-slate-900/50 bg-(--bg-deep)/80 backdrop-blur-md flex flex-col transition-all duration-500">

      {/* Header do Painel */ }
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-linear-to-r from-slate-900/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
            <i className="fa-solid fa-atom text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 m-0 uppercase tracking-wider">Câmara Analítica</h3>
            <p className="text-[0.65rem] text-slate-500 m-0 font-mono tracking-widest mt-0.5">ESTADO DA ARTE V4.1</p>
          </div>
        </div>
      </div>

      {/* Tabs */ }
      <div className="flex flex-wrap border-b border-white/5 bg-slate-950/50 px-2 pt-2 gap-1 justify-center sm:justify-start">
        { TABS.map( ( tab ) => (
          <button
            key={ tab.id }
            onClick={ () => setActiveTab( tab.id ) }
            className={ `
              flex items-center gap-2 px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest transition-all
              border-b-2 whitespace-nowrap rounded-t-lg
              ${activeTab === tab.id
                ? 'text-fuchsia-400 border-fuchsia-500 bg-linear-to-t from-fuchsia-500/10 to-transparent'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}
            `}
          >
            <i className={ `fa-solid ${tab.icon} ${activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-50'} transition-transform` } />
            { tab.label }
          </button>
        ) ) }
      </div>

      {/* Conteúdo por tab */ }
      <div className="flex-1 p-6 flex flex-col min-h-87.5 transition-all duration-500">
        <div className="animate-fade-in w-full" key={ `${scenario.id}-${activeTab}` }>

          {/* TAB: FUNDAMENTO */ }
          { activeTab === 'theory' && (
            <div className="prose prose-invert prose-fuchsia prose-sm max-w-none text-slate-300">
              <div className="mb-6 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex gap-4 items-start">
                <i className="fa-solid fa-circle-info text-indigo-400 mt-1"></i>
                <p className="m-0 text-xs leading-relaxed text-indigo-200/80">
                  <strong className="text-indigo-300">Nota SOTA:</strong> A Perspectiva Matemática dita que o <code className="text-fuchsia-300 bg-fuchsia-900/30 px-1 rounded">EV_fold</code> neste cenário atua como baseline dinâmico. As justificativas abaixo englobam o risco de <em>Pot Entrapment</em> e a diluição progressiva do Risk Premium.
                </p>
              </div>
              <div dangerouslySetInnerHTML={ { __html: scenario.theory } } />
            </div>
          ) }

          {/* TAB: RANGES */ }
          { activeTab === 'ranges' && (
            <div className="h-full">
              <RangeMatrix ipRp={ ipRp } oopRp={ oopRp } scenarioId={ scenario.id } />
            </div>
          ) }

          {/* TAB: BUBBLE FACTOR & PRESSÃO */ }
          { activeTab === 'bubble' && (
            <BubbleFactorDiagnostic ipRp={ ipRp } oopRp={ oopRp } />
          ) }

          {/* TAB: SPR E DILUIÇÃO */ }
          { activeTab === 'spr' && (
            <div className="space-y-6">
              <div className="mb-2 p-4 rounded-lg bg-sky-950/20 border border-sky-500/20 flex gap-4 items-start">
                <i className="fa-solid fa-water text-sky-400 mt-1"></i>
                <p className="m-0 text-xs leading-relaxed text-sky-200/80">
                  <strong className="text-sky-300">Pot Entrapment:</strong> A pressão do ICM não evapora pós-flop, ela sofre <em>Diluição Dinâmica</em>. Conforme o pote cresce, a equidade da sua stack cai, mas a recompensa financeira (Valuation) das fichas no centro da mesa aumenta. Observe a propagação reversa de Risco a cada street paga.
                </p>
              </div>
              <SprPipeline stages={ effectiveSprData ?? scenario.sprData } activeStage={ 0 } />

              {/* SOTA: Injeção do Gráfico de Degradação Fractal (Puxado do Contexto Global) */ }
              { context?.quantumPerspectiva && context?.spotData && context?.actionMetrics && (
                <DegradationChart
                  perspectivaBase={ context.quantumPerspectiva.perspectivaPct }
                  // SOTA: Consumo da Store Global. Fallback matemático mantido até a refatoração do MasterSimulator.tsx
                  potOddsPct={
                    context?.potOddsPct ?? (
                      ( context.spotData.pot + Math.abs( context.actionMetrics.fold.chipEv ) ) > 0
                        ? ( context.spotData.pot / ( context.spotData.pot + Math.abs( context.actionMetrics.fold.chipEv ) ) ) * 100
                        : 33
                    )
                  }
                  // SOTA: Erradicação do Band-Aid (10). Mapeado para a Tensão Dinâmica (RIO) do Call.
                  potSizePct={ context.actionMetrics.call.tension === undefined ? 10 : context.actionMetrics.call.tension * 100 }
                />
              ) }
            </div>
          ) }

          {/* TAB: VETOR EXPLOIT */ }
          { activeTab === 'exploit' && (
            <div className="space-y-4">
              <h4 className="text-[0.65rem] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-crosshairs"></i> Matriz de Antevisão
              </h4>
              <div className="flex flex-col gap-3">
                { scenario.exploit.map( ( item, idx ) => (
                  <div key={ `${item}-${idx}` } className="p-4 rounded-xl bg-slate-900/40 border border-emerald-500/20 flex gap-4 items-start hover:bg-emerald-950/20 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[0.6rem] font-black text-emerald-400">{ idx + 1 }</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed m-0 font-medium">
                      { item }
                    </p>
                  </div>
                ) ) }
              </div>
            </div>
          ) }

          {/* TAB: QUIZ DE VALIDAÇÃO */ }
          { activeTab === 'quiz' && (
            <div className="bg-slate-900/30 rounded-xl p-1 border border-white/5">
              <QuizEngine questions={ normalizeQuizData( scenario.quiz ) } />
            </div>
          ) }

        </div>
      </div>
    </div>
  );
}
