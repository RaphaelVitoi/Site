'use client';

/**
 * IDENTITY: Dashboard de Perspectiva Matemática SOTA v4.2 (VITOI - QUANTUM)
 * PATH: src/components/simulator/panels/PerspectivePanel.tsx
 * ROLE: Visualização da Física Quântica do Poker: Piso Dinâmico, RIO Exponencial e Valuation.
 */

import { useEffect, useMemo, useState } from 'react';
import { usePerspectiveCalculations } from '@/components/simulator/hooks/usePerspectiveCalculations';
import { PerspectiveChart } from '@/components/simulator/ui/PerspectiveChart';
import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import { GlassPanel } from '@/components/ui/GlassPanel';

const DEFAULT_STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
const DEFAULT_PRIZES = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

interface PerspectivePanelProps
{
  initialStacks?: number[];
  initialPrizes?: number[];
  scenarioId?: string;
  anteSize?: number;
  heroInvestedBb?: number;
  currentPotBb?: number;
  initialActivePlayers?: number;
  initialPkoValue?: number;
  initialIsNearPayjump?: boolean;
  initialBlindsRising?: boolean;
}

export default function PerspectivePanel ( {
  initialStacks,
  initialPrizes,
  scenarioId,
  anteSize = 12.5,
  heroInvestedBb = 1,
  currentPotBb = 2.5,
  initialActivePlayers = 2,
  initialPkoValue = 0,
  initialIsNearPayjump = false,
  initialBlindsRising = false
}: Readonly<PerspectivePanelProps> )
{
  const stacks = useMemo( () => initialStacks ?? DEFAULT_STACKS, [ initialStacks ] );
  const prizes = useMemo( () => initialPrizes ?? DEFAULT_PRIZES, [ initialPrizes ] );

  // --- ESTADO DO SIMULADOR ---
  const [ winProb, setWinProb ] = useState( 0.55 );
  const [ realization, setRealization ] = useState( 1 );
  const edgeBase = 1.2;
  const [ bountyValue, setBountyValue ] = useState( initialPkoValue );
  const [ numPlayers, setNumPlayers ] = useState( initialActivePlayers );
  const [ isNearPayjump, setIsNearPayjump ] = useState( initialIsNearPayjump );
  const [ blindsRising, setBlindsRising ] = useState( initialBlindsRising );
  const [ kappa, setKappa ] = useState( 0.5 );

  useEffect( () => {
    setNumPlayers( initialActivePlayers );
    setBountyValue( initialPkoValue );
    setIsNearPayjump( initialIsNearPayjump );
    setBlindsRising( initialBlindsRising );
  }, [ scenarioId, initialActivePlayers, initialPkoValue, initialIsNearPayjump, initialBlindsRising ] );

  const potSize = currentPotBb;
  const foldEvBb = useMemo( () => -( Math.abs( heroInvestedBb ) + ( anteSize / 100 ) ), [ heroInvestedBb, anteSize ] );
  const heroCost = Math.abs( foldEvBb );

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { result, chartData } = usePerspectiveCalculations({
    stacks, prizes, potSize, heroCost, winProb, realization, edgeBase, bountyValue, kappa, numPlayers, isNearPayjump, blindsRising
  });

  return (
    <GlassPanel className="flex flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
        <div>
          <h3 className="text-sm font-black text-accent-indigo-light uppercase tracking-widest m-0">
            Perspectiva Matemática &middot; <span className="text-text-muted">v4.2 Quantum</span>
          </h3>
          <p className="text-xs text-text-dim mt-1.5 m-0 leading-relaxed max-w-md">
            Física da Decisão: Piso Dinâmico (EV_fold) e Dívida RIO.
          </p>
        </div>
        <div className={ `text-[0.65rem] font-bold px-3 py-1.5 rounded-md border transition-all ${ isNearPayjump ? 'bg-emerald-500/10 border-emerald-500/20 text-accent-emerald' : 'bg-white/5 border-white/5 text-text-darker' }` }>
          { isNearPayjump ? "LADDERING ATIVO" : "EQUILÍBRIO ESTÁVEL" }
        </div>
      </div>

      {/* CONTROLES QUANTUM */ }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
        <div className="space-y-3">
          <div className="flex justify-between">
            <label htmlFor="perspective-opponents" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Oponentes</label>
            <span className="text-[0.65rem] font-mono font-bold text-accent-danger">{ numPlayers }{ numPlayers > 2 ? ' MW' : ' HU' }</span>
          </div>
          <input id="perspective-opponents" type="range" min="2" max="5" step="1" value={ numPlayers } onChange={ ( e ) => setNumPlayers( Number.parseInt( e.target.value ) ) } className="w-full h-1.5 accent-accent-danger bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="flex flex-col gap-3 justify-center bg-black/20 p-4 rounded-xl border border-white/5">
          <label htmlFor="perspective-payjump" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest flex items-center gap-3 cursor-pointer group">
            <input id="perspective-payjump" type="checkbox" checked={ isNearPayjump } onChange={ ( e ) => setIsNearPayjump( e.target.checked ) } className="w-4 h-4 accent-accent-emerald rounded bg-white/5 border-white/10" />
            <span className="group-hover:text-text-bright transition-colors">Perto de Payjump</span>
          </label>
          <label htmlFor="perspective-blinds" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest flex items-center gap-3 cursor-pointer group">
            <input id="perspective-blinds" type="checkbox" checked={ blindsRising } onChange={ ( e ) => setBlindsRising( e.target.checked ) } className="w-4 h-4 accent-accent-danger rounded bg-white/5 border-white/10" />
            <span className="group-hover:text-text-bright transition-colors">Blinds Subindo</span>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label htmlFor="perspective-pko" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">PKO Bounty</label>
            <span className="text-[0.65rem] font-mono font-bold text-accent-gold">{ Math.round( bountyValue * 100 ) }%</span>
          </div>
          <input id="perspective-pko" type="range" min="0" max="0.1" step="0.005" value={ bountyValue } onChange={ ( e ) => setBountyValue( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-gold bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label htmlFor="perspective-kappa" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Credibilidade κ</label>
            <span className="text-[0.65rem] font-mono font-bold text-accent-pink">{ Math.round( kappa * 100 ) }%</span>
          </div>
          <input id="perspective-kappa" type="range" min="0" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-pink bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="col-span-1 sm:col-span-3 h-px bg-white/5 my-1" />

        <div className="space-y-3">
          <div className="flex justify-between">
            <label htmlFor="perspective-equity" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Equity</label>
            <span className="text-[0.65rem] font-mono font-bold text-accent-indigo">{ Math.round( winProb * 100 ) }%</span>
          </div>
          <input id="perspective-equity" type="range" min="0" max="1" step="0.01" value={ winProb } onChange={ ( e ) => setWinProb( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
          <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.2em] mb-1">Sunk Cost / Pot</span>
          <div className="text-sm font-black text-accent-amber font-mono tabular-nums tracking-tighter">-{ heroCost.toFixed( 2 ) }bb / { potSize.toFixed( 1 ) }bb</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label htmlFor="perspective-realization" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Realização R</label>
            <span className="text-[0.65rem] font-mono font-bold text-accent-emerald">{ realization }x</span>
          </div>
          <input id="perspective-realization" type="range" min="0.5" max="1.5" step="0.05" value={ realization } onChange={ ( e ) => setRealization( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>
      </div>

      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */ }
      <div className="flex flex-col gap-4">
        <SotaTooltip title="LAYER 1: ICMev (Snapshot)" content="A fotografia estática. Fichas convertidas em equidade de prêmio (Malmuth-Harville). Ignora completamente a variância, a posição e o tempo. Útil como base, perigoso como conclusão." align="left" theme="indigo">
          <div className="p-5 rounded-xl border-l-4 border-l-text-darker bg-linear-to-r from-slate-900/60 to-bg-panel/20 backdrop-blur-md flex justify-between items-center shadow-lg transition-all duration-300 hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-0.5 border border-white/5 hover:border-white/10">
            <span className="text-[0.7rem] font-black text-text-muted uppercase tracking-widest">LAYER 1: ICMev</span>
            <span className="text-base font-black text-text-light tabular-nums font-mono">{ result.currentEquityPct.toFixed( 2 ) }%</span>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 2: Esperança Matemática" content="A injeção da Lógica. O Valuation corrige a assimetria (fichas ganhas vs perdidas) e a Dívida RIO pune a insolvência de múltiplos jogadores no pote." align="left" theme="indigo">
          <div className="p-5 rounded-xl border-l-4 border-l-accent-amber bg-linear-to-r from-slate-900/60 to-bg-panel/20 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg transition-all duration-300 hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-0.5 gap-2 sm:gap-0 border border-white/5 hover:border-white/10">
            <div>
              <span className="text-[0.7rem] font-black text-accent-amber block uppercase tracking-widest mb-1">LAYER 2: ESPERANÇA MATEMÁTICA (LÓGICA)</span>
              <span className="text-[0.65rem] text-text-dim font-semibold tabular-nums font-mono">Valuation: <strong className="text-amber-500/80">{ result.valuation.toFixed( 2 ) }x</strong> | Dívida RIO: <strong className="text-amber-500/80">-{ result.rioLiability.toFixed( 2 ) }%</strong></span>
            </div>
            <span className="text-base font-black text-accent-amber tabular-nums font-mono">Explosão: { ( ( result.valuation - 1 ) * 100 ).toFixed( 0 ) }%</span>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 3: Expectativa Preditiva" content="A Psicologia do Tempo. FGS mede a urgência da sobrevivência (t-3 blinds) e o Piso Dinâmico estabelece o verdadeiro custo do fold." align="left" theme="indigo">
          <div className="p-5 rounded-xl border-l-4 border-l-accent-emerald bg-linear-to-r from-slate-900/60 to-bg-panel/20 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg transition-all duration-300 hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-0.5 gap-2 sm:gap-0 border border-white/5 hover:border-white/10">
            <div>
              <span className="text-[0.7rem] font-black text-accent-emerald block uppercase tracking-widest mb-1">LAYER 3: EXPECTATIVA MATEMÁTICA (PREDITIVA)</span>
              <span className="text-[0.65rem] text-text-dim font-semibold tabular-nums font-mono">Piso (EV_fold): <strong className="text-emerald-500/80">{ result.dynamicEvFold.toFixed( 2 ) }%</strong> | FGS Health: <strong className="text-emerald-500/80">{ result.fgsHealth.toFixed( 2 ) }x</strong></span>
            </div>
            <span className="text-base font-black text-accent-emerald uppercase tracking-widest">{ result.isActionBetterThanFold ? "Soberano" : "Insolvente" }</span>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 4: Perspectiva Matemática" content="A Síntese Máxima SOTA. Se o valor é positivo, a utilidade da colisão supera o piso estrutural do fold e a erosão do tempo, justificando a agressão." align="left" theme="indigo">
          <div className="p-6 rounded-xl border-l-4 border-l-accent-indigo-light bg-linear-to-r from-accent-indigo/20 to-accent-indigo/5 backdrop-blur-md border border-accent-indigo/40 shadow-[0_8px_30px_rgba(99,102,241,0.2)] flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div>
                <span className="text-[0.8rem] font-black text-accent-indigo-light block uppercase tracking-widest mb-1">LAYER 4: PERSPECTIVA MATEMÁTICA (PM)</span>
                <span className="text-[0.65rem] text-text-light font-semibold tabular-nums font-mono">Edge Amortizada: <strong className="text-indigo-300">{ result.amortizedEdge.toFixed( 2 ) }x</strong> | Cᵢ: <strong className="text-indigo-300">{ result.ci.toFixed( 2 ) }</strong> | κ: <strong className="text-indigo-300">{ Math.round( kappa * 100 ) }%</strong></span>
              </div>
              <span className={ `text-3xl sm:text-4xl font-black tabular-nums font-mono ${ result.isActionBetterThanFold ? 'text-accent-emerald' : 'text-accent-danger' }` }>
                { result.perspectivaPct.toFixed( 2 ) }%
              </span>
            </div>
            { Math.abs( result.perspectivaPct ) <= 5 && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-[0.65rem] text-accent-pink-light font-extrabold leading-relaxed">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> ZONA MARGINAL (EV INSTÁVEL): Decisão altamente sensível à imprecisão de range.
                <div className="mt-1 text-text-bright font-semibold italic opacity-80">&quot;O tamanho do desvio (exploit) deve ser proporcional à credibilidade da sua informação.&quot; — Axioma Lipe Piv</div>
              </div>
            ) }
          </div>
        </SotaTooltip>
      </div>

      {/* EQUITY CURVES CHART */ }
      <PerspectiveChart chartData={chartData} />

      {/* DIAGNÓSTICO SOTA */ }
      <div className="p-6 bg-linear-to-br from-accent-indigo/10 to-transparent backdrop-blur-sm border-l-4 border-l-accent-indigo rounded-xl text-xs text-indigo-100/80 leading-relaxed shadow-lg border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse"></div>
          <strong className="text-indigo-300 uppercase tracking-widest font-black text-[0.6rem]">Síntese Quantum</strong>
        </div>
        { result.diagnostico }
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2">
          <span className="text-text-muted font-bold"><span className="text-text-darker mr-1.5 uppercase tracking-tighter">Protocolo:</span> { result.isActionBetterThanFold ? "A utilidade da colisão neutraliza a erosão do tempo." : "A omissão estratégica preserva o capital sistêmico." }</span>
        </div>
        { isNearPayjump && <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-accent-gold font-bold leading-relaxed shadow-lg shadow-amber-500/5"><i className="fa-solid fa-bolt-lightning mr-3"></i>[EXTREMA AVERSÃO AO RISCO]: A pressão de payjump induz o overfold. A inversão de EVs negativos da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade dessa leitura (Axioma Lipe Piv).</div> }
      </div>
    </GlassPanel>
  );
}
