'use client';

/**
 * IDENTITY: Painel de Teoria com Tabs (SOTA v4.1)
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Exibir Fundamento Teórico, Diluição SPR, Vetor de Exploit e Quiz por cenário.
 *       Visão Arquitetural SOTA com alta densidade de informação e RP Dinâmico.
 * BINDING: [engine/types.ts, ui/SprPipeline.tsx, ui/QuizEngine.tsx, simulator.module.css]
 */

import { QuizEngine } from '@/components/quiz/QuizEngine';
import type { QuizQuestion as NormalizedQuestion } from '@/components/quiz/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { NashConvergenceMatrix } from '../../TheoryPanel/NashConvergenceMatrix';
import DegradationChart from '../charts/DegradationChart';
import type { Scenario, ScenarioQuiz, SprStage } from '../engine/types';
import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from '../SotaContext';
import SprPipeline from '../ui/SprPipeline';

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

const SotaTooltip = ( { title, content, align = 'center', theme = 'indigo', children }: any ) => {
  const alignClasses: any = { left: 'left-0', center: 'left-1/2 -translate-x-1/2', right: 'right-0' };
  const themeClasses: any = {
    indigo: 'border-indigo-500/30 text-indigo-400 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)]',
    emerald: 'border-emerald-500/30 text-emerald-400 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.4)]',
    rose: 'border-rose-500/30 text-rose-400 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.4)]'
  };
  return (
    <div className="relative group inline-flex items-center cursor-help">
      { children }
      <div className={ `absolute bottom-full ${alignClasses[align]} mb-2 w-64 sm:w-72 max-w-[85vw] p-3 bg-[#0a0f1c] border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none ${themeClasses[theme]}` }>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{ title }</p>
        <p className="text-neutral-300 text-[10px] leading-relaxed font-sans normal-case tracking-normal text-left">{ content }</p>
      </div>
    </div>
  );
};

const calcBF = ( rp: number ) => {
  if ( rp >= 100 ) return 999; // Evitar infinito que quebra UI
  return 100 / ( 100 - rp );
};

function BubbleFactorDiagnostic( { ipRp, oopRp }: Readonly<{ ipRp: number; oopRp: number }> ) {
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

  if ( hasIpAdvantage ) {
    deltaLabel = `IP com Vantagem de Risco (ΔRP ${Math.abs( deltaRp ).toFixed( 1 )}%)`;
    panelBgClass = 'bg-accent-emerald/5 border-accent-emerald/20';
    iconBgClass = 'bg-accent-emerald/10 text-accent-emerald';
    iconClass = 'fa-bolt-lightning';
    textClass = 'text-accent-emerald';
  } else if ( deltaRp > 0 ) {
    deltaLabel = `IP sob Punição de Valuation (ΔRP +${deltaRp.toFixed( 1 )}%)`;
    panelBgClass = 'bg-accent-rose/5 border-accent-rose/20';
    iconBgClass = 'bg-accent-rose/10 text-accent-rose';
    iconClass = 'fa-biohazard';
    textClass = 'text-accent-rose';
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
        <h4 className="text-label mb-6">
          <i className="fa-solid fa-microscope text-accent-indigo" /> Diagnóstico de Assimetria (VITOI Engine)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SotaTooltip align="left" title="Agressor (IP)" content="O agressor dita o preço. Se o RP dele é significativamente menor, ele usa o Leverage para extrair Fold Equity não-linear da mesa." theme="indigo">
            <div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-indigo/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-chess-knight text-5xl text-accent-indigo" /></div>
              <p className="text-[0.55rem] text-accent-indigo-light font-black uppercase tracking-[0.2em] mb-2">Agressor (IP)</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-text-bright font-heading leading-none">{ ipRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-accent-indigo font-mono font-bold">RP</span>
              </div>
              <p className="text-xs text-text-muted m-0 font-medium">BF Equivalente: <span className="text-accent-indigo-light font-mono font-bold">{ ipBf.toFixed( 2 ) }x</span></p>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">Impacto em MDF:</p>
                <p className="text-sm font-bold text-text-muted">{ ( ipEquity * 100 ).toFixed( 1 ) }% <span className="text-[0.65rem] font-medium text-text-darker">vs 33% ChipEV</span></p>
                <p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1">+{ ipDelta }pp Inflação</p>
              </div>
            </div>
          </SotaTooltip>

          <SotaTooltip align="right" title="Defensor (OOP)" content="O defensor paga a conta do ICM. Ele precisa de uma mão exponencialmente mais forte para justificar o call, ancorando a defesa no Teto de Risco." theme="indigo">
            <div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-rose/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-shield-halved text-5xl text-accent-rose" /></div>
              <p className="text-[0.55rem] text-accent-rose-light font-black uppercase tracking-[0.2em] mb-2">Defensor (OOP)</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-text-bright font-heading leading-none">{ oopRp.toFixed( 1 ) }%</span>
                <span className="text-xs text-accent-rose font-mono font-bold">RP</span>
              </div>
              <p className="text-xs text-text-muted m-0 font-medium">BF Equivalente: <span className="text-accent-rose-light font-mono font-bold">{ oopBf.toFixed( 2 ) }x</span></p>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">Impacto em MDF:</p>
                <p className="text-sm font-bold text-text-muted">{ ( oopEquity * 100 ).toFixed( 1 ) }% <span className="text-[0.65rem] font-medium text-text-darker">vs 33% ChipEV</span></p>
                <p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1">+{ oopDelta }pp Inflação</p>
              </div>
            </div>
          </SotaTooltip>
        </div>
      </div>

      <div className={ `p-6 rounded-3xl border flex items-center gap-6 ${panelBgClass} transition-all duration-500` }>
        <div className={ `w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${iconBgClass}` }>
          <i className={ `fa-solid ${iconClass} text-xl` } />
        </div>
        <div>
          <p className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Vetor de Distorção de Nash</p>
          <p className={ `text-2xl font-black m-0 font-heading tracking-tighter ${textClass}` }>
            { deltaRp > 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) }% ΔRP
          </p>
          <p className="text-xs text-text-muted m-0 mt-1 font-medium">{ deltaLabel }</p>
        </div>
      </div>
    </div>
  );
}

// SOTA (Otimização de Complexidade Ciclomática - SonarLint S3776)
// Adaptador puro e desacoplado: transpila formato de quiz para NormalizedQuestion[]
const normalizeQuizData = ( quizData: ScenarioQuiz | null | undefined, scenarioId: string ): NormalizedQuestion[] => {
  if ( !quizData ) return [];
  const rawList: ScenarioQuiz[] = Array.isArray( quizData ) ? quizData : [quizData];

  return rawList
    .map( ( q, index ): NormalizedQuestion | null => {
      if ( !q ) return null;
      const questionText = q.question || 'Pergunta nao definida';
      const rawOptions = q.options || [];
      const correctIdx = rawOptions.findIndex( opt => opt.isCorrect );
      const correctId = rawOptions[correctIdx]?.id || `opt-${Math.max( 0, correctIdx )}`;

      return {
        id: `q-${scenarioId}-${index}`,
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

// SOTA: Heurística de ChipEV (Vácuo / GTO) isolada para fricção zero cognitiva
function calculatePureEv( rankValue: number, isSuited: boolean, isPair: boolean ): number {
  if ( rankValue >= 16 ) return ( rankValue - 15 ) * 0.8;
  if ( rankValue >= 13 && ( isSuited || isPair ) ) return ( rankValue - 12 ) * 0.3;
  if ( rankValue >= 10 && isSuited ) return 0.1;
  return -0.5;
}

// SOTA: Passivo Sistêmico isolado para previsibilidade matemática
function calculateInsolvencyDelta( rankValue: number, isSuited: boolean, isPair: boolean, rpFactor: number, pureEv: number ): number {
  if ( rpFactor <= 0 || pureEv <= -1 ) return 0;

  let rioVulnerability = 1.2;
  if ( isSuited ) rioVulnerability = 0.5;
  else if ( isPair ) rioVulnerability = 0.3;

  return -( rpFactor * 0.05 ) * rioVulnerability * Math.max( 0.5, ( 22 - rankValue ) * 0.15 );
}

// SOTA: Avaliação vetorial de uma célula
function calculateFallbackCell( i: number, j: number, rpFactor: number, ranks: string[] ) {
  const isPair = i === j;
  const isSuited = j > i;

  let combo = `${ranks[j]}${ranks[i]}o`;
  if ( isPair ) combo = `${ranks[i]}${ranks[j]}`;
  else if ( isSuited ) combo = `${ranks[i]}${ranks[j]}s`;

  const rankValue = ( 14 - i ) + ( 14 - j );
  const pureEv = calculatePureEv( rankValue, isSuited, isPair );
  const insolvencyDelta = calculateInsolvencyDelta( rankValue, isSuited, isPair, rpFactor, pureEv );

  return { combo, pureEv, insolvencyDelta, isSuited, isPair };
}

// SOTA: Função Pura extraída para erradicar a Complexidade Ciclomática (SonarLint S3776)
function generateFallbackMatrix( ipRp: number, oopRp: number ) {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const fallback = [];
  const rpFactor = Math.max( ipRp, oopRp );

  for ( let i = 0; i < ranks.length; i++ ) {
    for ( let j = 0; j < ranks.length; j++ ) {
      fallback.push( calculateFallbackCell( i, j, rpFactor, ranks ) );
    }
  }
  return fallback;
}

export default function TheoryPanel( { scenario, effectiveSprData, effectiveIpRp, effectiveOopRp }: Readonly<TheoryPanelProps> ) {
  const [activeTab, setActiveTab] = useState<TabId>( 'theory' );
  const [isDynamicRpActive, setIsDynamicRpActive] = useState( true );

  // SOTA: Bebe diretamente do Sangue Matemático (Contexto SOTA), descartando props defasadas
  const spotContext = useContext( SotaSpotContext );
  const metricsContext = useContext( SotaMetricsContext );
  const wasmContext = useContext( SotaWasmContext );

  // Prioriza o RP dinâmico (Quantum) calculado pelo MasterSimulator
  const ipRp = spotContext?.effectiveIpRp ?? effectiveIpRp ?? scenario.ipRp;
  const oopRp = spotContext?.effectiveOopRp ?? effectiveOopRp ?? scenario.oopRp;

  const effStack = Math.min( scenario.stacks[0] || 40, scenario.stacks[1] || 40 );
  const preflopPot = ( effectiveSprData ?? scenario.sprData )[0]?.potSize || 2.5;

  // Reset tab ao mudar cenário
  useEffect( () => {
    setActiveTab( 'theory' );
  }, [scenario.id] );

  // SOTA: Erradicação do mock. Orquestração com o motor Rust (WASM).
  useEffect( () => {
    if ( activeTab === 'ranges' && wasmContext?.dispatchInsolvencyMatrix ) {
      const heroInvested = spotContext?.heroInvested ?? 1;
      const currentPot = spotContext?.spotData?.pot ?? 2.5;
      const activePlayers = spotContext?.activePlayers ?? 2;
      // Submissão do fator RP de maior gravidade posicional para testar a matriz.
      const rpFactor = Math.max( ipRp, oopRp );
      const villainRange = "100%";
      const board = "";

      wasmContext.dispatchInsolvencyMatrix( villainRange, board, rpFactor, heroInvested, currentPot, activePlayers );
    }
  }, [activeTab, scenario.id, ipRp, oopRp, spotContext?.heroInvested, spotContext?.spotData?.pot, spotContext?.activePlayers, wasmContext?.dispatchInsolvencyMatrix] );

  // SOTA: Fallback Heurístico (Auto-Healing)
  // Garante a densidade visual e didática caso o Motor WASM falhe ou atrase,
  // simulando a pressão matemática (Insolvência) com base no RP ativo.
  const matrixDataToRender = useMemo( () => {
    if ( wasmContext?.insolvencyMatrixData && wasmContext.insolvencyMatrixData.length > 0 ) return wasmContext.insolvencyMatrixData;
    return generateFallbackMatrix( ipRp, oopRp );
  }, [wasmContext?.insolvencyMatrixData, ipRp, oopRp] );

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
                  <strong className="text-indigo-300">Nota SOTA v4.1:</strong> A Perspectiva Matemática agora integra a <span className="text-emerald-300 font-bold">Amortização da Edge</span> (Poda da Árvore) e a <span className="text-rose-400 font-bold">Insolvência Multiway (Cᵢ)</span>. O <code className="text-fuchsia-300 bg-fuchsia-900/30 px-1 rounded">EV_fold</code> atua como baseline dinâmico punido por RIO exponencial em potes MW. As justificativas abaixo englobam o risco de <em>Pot Entrapment</em> e a diluição do RP.
                </p>
              </div>
              <div dangerouslySetInnerHTML={ { __html: scenario.theory } } />
            </div>
          ) }

          {/* TAB: RANGES */ }
          { activeTab === 'ranges' && (
            <div className="h-full space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3 mb-4 p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-white/5 shadow-inner">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-filter text-fuchsia-400"></i>
                  <span id="rp-toggle-label" className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider cursor-pointer">
                    Filtro de Perspectiva (RP Dinâmico)
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ isDynamicRpActive }
                  aria-labelledby="rp-toggle-label"
                  onClick={ () => setIsDynamicRpActive( !isDynamicRpActive ) }
                  className={ `${isDynamicRpActive ? 'bg-fuchsia-600' : 'bg-zinc-700'
                    } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900` }
                >
                  <span
                    aria-hidden="true"
                    className={ `${isDynamicRpActive ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out` }
                  />
                </button>
              </div>
              { wasmContext?.isCalculatingInsolvency ? (
                <div className="flex items-center justify-center p-12 text-fuchsia-400">
                  <i className="fa-solid fa-circle-notch fa-spin text-3xl mr-4"></i>
                  <span className="font-mono text-sm tracking-widest uppercase">Forjando Matriz de Insolvência SOTA...</span>
                </div>
              ) : (
                <NashConvergenceMatrix matrixData={ matrixDataToRender } isDynamicRpActive={ isDynamicRpActive } />
              ) }
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

              {/* SOTA: Matriz de Diluição de SPR */ }
              <h4 className="text-[0.65rem] font-black text-sky-400 uppercase tracking-[0.2em] mb-3 mt-8 flex items-center gap-2">
                <i className="fa-solid fa-table-cells"></i> Matriz de Diluição (Projeção 33%)
              </h4>
              <div className="overflow-hidden rounded-lg border border-sky-500/20 bg-slate-900/50">
                <table className="w-full text-left text-[0.65rem] font-mono">
                  <thead className="bg-sky-950/30 text-sky-300 uppercase tracking-wider border-b border-sky-500/20">
                    <tr>
                      <th className="p-2 pl-4 font-bold">Street</th>
                      <th className="p-2 font-bold">Pote</th>
                      <th className="p-2 font-bold">Stack Res.</th>
                      <th className="p-2 font-bold">SPR</th>
                      <th className="p-2 font-bold">RP Res.</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 divide-y divide-white/5">
                    { ( effectiveSprData ?? scenario.sprData ).map( ( stage ) => {
                      const investido = Math.max( 0, ( stage.potSize - preflopPot ) / 2 );
                      const residual = Math.max( 0, effStack - investido );
                      const spr = stage.potSize > 0 ? ( residual / stage.potSize ).toFixed( 1 ) : '∞';
                      const isDeath = stage.rpValue >= 35;
                      return (
                        <tr key={ stage.name } className={ `hover:bg-white/5 transition-colors ${isDeath ? 'bg-rose-950/10' : ''}` }>
                          <td className="p-2 pl-4 font-bold text-sky-400">{ stage.name }</td>
                          <td className="p-2">{ stage.potSize.toFixed( 1 ) }bb</td>
                          <td className="p-2">{ residual.toFixed( 1 ) }bb</td>
                          <td className={ `p-2 font-bold ${Number( spr ) < 1 ? 'text-rose-400' : 'text-emerald-400'}` }>{ spr }</td>
                          <td className={ `p-2 font-bold ${isDeath ? 'text-rose-500' : 'text-amber-400'}` }>{ stage.rpValue.toFixed( 1 ) }%</td>
                        </tr>
                      );
                    } ) }
                  </tbody>
                </table>
              </div>

              {/* SOTA: Injeção do Gráfico de Degradação Fractal (Puxado do Contexto Global) */ }
              { metricsContext?.quantumPerspectiva && spotContext?.spotData && spotContext?.actionMetrics && (
                <DegradationChart
                  perspectivaBase={ metricsContext.quantumPerspectiva.perspectivaPct }
                  // SOTA: Consumo da Store Global. Fallback matemático mantido até a refatoração do MasterSimulator.tsx
                  potOddsPct={
                    spotContext?.potOddsPct ?? (
                      ( spotContext.spotData.pot + Math.abs( spotContext.actionMetrics.fold.chipEv ) ) > 0
                        ? ( spotContext.spotData.pot / ( spotContext.spotData.pot + Math.abs( spotContext.actionMetrics.fold.chipEv ) ) ) * 100
                        : 33
                    )
                  }
                  // SOTA: Erradicação do Band-Aid (10). Mapeado para a Tensão Dinâmica (RIO) do Call.
                  potSizePct={ spotContext.actionMetrics.call.tension === undefined ? 10 : spotContext.actionMetrics.call.tension * 100 }
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
              <QuizEngine questions={ normalizeQuizData( scenario.quiz, scenario.id ) } />
            </div>
          ) }

        </div>
      </div>
    </div>
  );
  Degrada
