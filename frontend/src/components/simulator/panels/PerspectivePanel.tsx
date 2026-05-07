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
import React from 'react';

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
    <div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-6">
        <div>
          <h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">
            Perspectiva Matemática &middot; <span className="text-text-muted">v4.2 Quantum</span>
          </h3>
          <p className="text-[0.65rem] text-text-dim mt-2 m-0 leading-relaxed max-w-md font-medium uppercase tracking-wider">
            Física da Decisão: Piso Dinâmico (EV_fold) e Dívida RIO.
          </p>
        </div>
        <div className={ `text-[0.6rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border transition-all shadow-lg flex items-center gap-2 ${ isNearPayjump ? 'bg-emerald-500/10 border-emerald-500/20 text-accent-emerald' : 'bg-black/40 border-white/5 text-text-darker' }` }>
          <div className={`w-1.5 h-1.5 rounded-full ${isNearPayjump ? 'bg-accent-emerald animate-pulse' : 'bg-text-darker'}`} />
          { isNearPayjump ? "LADDERING ATIVO" : "EQUILÍBRIO ESTÁVEL" }
        </div>
      </div>

      {/* CONTROLES QUANTUM */ }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 bg-black/40 p-6 sm:p-8 rounded-3xl border border-white/5 shadow-inner">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="perspective-opponents" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Oponentes</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-danger bg-black/60 px-2 py-0.5 rounded border border-white/5">{ numPlayers }{ numPlayers > 2 ? ' MW' : ' HU' }</span>
          </div>
          <input id="perspective-opponents" type="range" min="2" max="5" step="1" value={ numPlayers } onChange={ ( e ) => setNumPlayers( Number.parseInt( e.target.value ) ) } className="w-full h-1 accent-accent-danger bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="flex flex-col gap-3 justify-center bg-black/40 p-5 rounded-2xl border border-white/5 shadow-lg">
          <label htmlFor="perspective-payjump" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest flex items-center gap-3 cursor-pointer group">
            <input id="perspective-payjump" type="checkbox" checked={ isNearPayjump } onChange={ ( e ) => setIsNearPayjump( e.target.checked ) } className="w-4 h-4 accent-accent-emerald rounded-lg bg-black/60 border-white/10" />
            <span className="group-hover:text-white transition-colors">Perto de Payjump</span>
          </label>
          <label htmlFor="perspective-blinds" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest flex items-center gap-3 cursor-pointer group">
            <input id="perspective-blinds" type="checkbox" checked={ blindsRising } onChange={ ( e ) => setBlindsRising( e.target.checked ) } className="w-4 h-4 accent-accent-danger rounded-lg bg-black/60 border-white/10" />
            <span className="group-hover:text-white transition-colors">Blinds Subindo</span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="perspective-pko" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">PKO Bounty</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-gold bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( bountyValue * 100 ) }%</span>
          </div>
          <input id="perspective-pko" type="range" min="0" max="0.1" step="0.005" value={ bountyValue } onChange={ ( e ) => setBountyValue( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-gold bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="perspective-kappa" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Credibilidade κ</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-pink bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( kappa * 100 ) }%</span>
          </div>
          <input id="perspective-kappa" type="range" min="0" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-pink bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="hidden sm:block h-px bg-white/5 col-span-1 my-auto" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="perspective-equity" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Equity</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-indigo bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( winProb * 100 ) }%</span>
          </div>
          <input id="perspective-equity" type="range" min="0" max="1" step="0.01" value={ winProb } onChange={ ( e ) => setWinProb( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="bg-black/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-center shadow-lg">
          <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.25em] mb-2">Sunk Cost / Pot</span>
          <div className="text-[0.8rem] font-black text-accent-amber font-mono tabular-nums tracking-tighter">-{ heroCost.toFixed( 2 ) }bb / { potSize.toFixed( 1 ) }bb</div>
        </div>

        <div className="space-y-4 col-span-1 sm:col-span-2">
          <div className="flex justify-between items-center">
            <label htmlFor="perspective-realization" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Realização R</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-emerald bg-black/60 px-2 py-0.5 rounded border border-white/5">{ realization }x</span>
          </div>
          <input id="perspective-realization" type="range" min="0.5" max="1.5" step="0.05" value={ realization } onChange={ ( e ) => setRealization( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>
      </div>


      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */ }
      <div className="flex flex-col gap-6">
        <SotaTooltip title="LAYER 1: ICMev (Snapshot)" content="A fotografia estática. Fichas convertidas em equidade de prêmio (Malmuth-Harville). Ignora completamente a variância, a posição e o tempo. Útil como base, perigoso como conclusão." align="left" theme="indigo">
          <div className="p-6 md:p-8 rounded-2xl border-l-[6px] border-l-text-darker bg-linear-to-r from-slate-900/80 to-bg-panel/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg transition-all duration-300 hover:bg-slate-800/90 hover:shadow-2xl hover:-translate-y-1 gap-4 md:gap-0 border border-white/5 hover:border-white/10">
            <div>
              <span className="text-[0.75rem] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">LAYER 1: ICMev</span>
              <span className="text-[0.75rem] text-text-dim leading-relaxed">Perspectiva base e ingênua.</span>
            </div>
            <span className="text-2xl font-black text-text-light tabular-nums font-mono">{ result.currentEquityPct.toFixed( 2 ) }%</span>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 2: Esperança Matemática" content="A injeção da Lógica. O Valuation corrige a assimetria (fichas ganhas vs perdidas) e a Dívida RIO pune a insolvência de múltiplos jogadores no pote." align="left" theme="indigo">
          <div className="p-6 md:p-8 rounded-2xl border-l-[6px] border-l-accent-amber bg-linear-to-r from-slate-900/80 to-bg-panel/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg transition-all duration-300 hover:bg-slate-800/90 hover:shadow-2xl hover:-translate-y-1 gap-4 md:gap-0 border border-white/5 hover:border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-black text-accent-amber uppercase tracking-[0.2em]">LAYER 2: ESPERANÇA MATEMÁTICA</span>
              <span className="text-[0.75rem] text-text-dim font-medium tracking-wide">
                Valuation: <strong className="text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">{ result.valuation.toFixed( 2 ) }x</strong>
                <span className="mx-3 opacity-30">|</span>
                Dívida RIO: <strong className="text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">-{ result.rioLiability.toFixed( 2 ) }%</strong>
              </span>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[0.6rem] uppercase tracking-widest text-text-dim mb-1">Explosão</span>
              <span className="text-2xl font-black text-accent-amber tabular-nums font-mono">{ ( ( result.valuation - 1 ) * 100 ).toFixed( 0 ) }%</span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 3: Expectativa Preditiva" content="A Psicologia do Tempo. FGS mede a urgência da sobrevivência (t-3 blinds) e o Piso Dinâmico estabelece o verdadeiro custo do fold." align="left" theme="indigo">
          <div className="p-6 md:p-8 rounded-2xl border-l-[6px] border-l-accent-emerald bg-linear-to-r from-slate-900/80 to-bg-panel/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg transition-all duration-300 hover:bg-slate-800/90 hover:shadow-2xl hover:-translate-y-1 gap-4 md:gap-0 border border-white/5 hover:border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-black text-accent-emerald uppercase tracking-[0.2em]">LAYER 3: EXPECTATIVA MATEMÁTICA</span>
              <span className="text-[0.75rem] text-text-dim font-medium tracking-wide">
                Piso (EV_fold): <strong className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{ result.dynamicEvFold.toFixed( 2 ) }%</strong>
                <span className="mx-3 opacity-30">|</span>
                FGS Health: <strong className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{ result.fgsHealth.toFixed( 2 ) }x</strong>
              </span>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[0.6rem] uppercase tracking-widest text-text-dim mb-1">Status</span>
              <span className="text-xl font-black text-accent-emerald uppercase tracking-widest">{ result.isActionBetterThanFold ? "Soberano" : "Insolvente" }</span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 4: Perspectiva Matemática" content="A Síntese Máxima SOTA. Se o valor é positivo, a utilidade da colisão supera o piso estrutural do fold e a erosão do tempo, justificando a agressão." align="left" theme="indigo">
          <div className="p-8 md:p-10 rounded-2xl border-l-[8px] border-l-accent-indigo-light bg-linear-to-br from-accent-indigo/10 via-slate-900/90 to-bg-panel/60 backdrop-blur-xl border border-accent-indigo/30 shadow-[0_15px_50px_rgba(99,102,241,0.15)] flex flex-col gap-6 transition-transform duration-500 hover:-translate-y-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              <div className="flex flex-col gap-2">
                <span className="text-[0.85rem] font-black text-accent-indigo-light uppercase tracking-[0.25em] mb-1">LAYER 4: PERSPECTIVA MATEMÁTICA (PM)</span>
                <span className="text-[0.75rem] text-text-light font-medium tracking-wide flex flex-wrap gap-y-2">
                  <span className="mr-4">Edge Amortizada: <strong className="text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded ml-1">{ result.amortizedEdge.toFixed( 2 ) }x</strong></span>
                  <span className="mr-4">Cᵢ: <strong className="text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded ml-1">{ result.ci.toFixed( 2 ) }</strong></span>
                  <span>κ: <strong className="text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded ml-1">{ Math.round( kappa * 100 ) }%</strong></span>
                </span>
              </div>
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-text-dim mb-2">Métrica Soberana</span>
                <span className={ `text-4xl md:text-5xl font-black tabular-nums font-mono tracking-tighter ${ result.isActionBetterThanFold ? 'text-accent-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-accent-danger drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]' }` }>
                  { result.perspectivaPct > 0 ? '+' : '' }{ result.perspectivaPct.toFixed( 2 ) }%
                </span>
              </div>
            </div>
            { Math.abs( result.perspectivaPct ) <= 5 && (
              <div className="mt-2 p-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[0.75rem] text-accent-pink-light font-medium leading-relaxed flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-triangle-exclamation text-rose-400"></i>
                  </div>
                  <strong className="uppercase tracking-widest text-[0.7rem] text-rose-300">Zona Marginal (EV Instável)</strong>
                </div>
                <p className="m-0 pl-11">Decisão altamente sensível à imprecisão de range.</p>
                <div className="mt-2 pl-11 text-text-bright font-medium italic opacity-90 border-l-2 border-rose-500/40 ml-1 py-1 px-3">
                  &quot;O tamanho do desvio (exploit) deve ser proporcional à credibilidade da sua informação.&quot; — Axioma Lipe Piv
                </div>
              </div>
            ) }
          </div>
        </SotaTooltip>
      </div>

      {/* EQUITY CURVES CHART */ }
      <div className="w-full">
        <PerspectiveChart chartData={chartData} />
      </div>

      {/* DIAGNÓSTICO SOTA */ }
      <div className="p-6 bg-linear-to-br from-accent-indigo/10 to-transparent backdrop-blur-sm border-l-4 border-l-accent-indigo rounded-xl text-xs text-indigo-100/80 leading-relaxed shadow-lg border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse"></div>
          <strong className="text-indigo-300 uppercase tracking-widest font-black text-[0.6rem]">Síntese Quantum</strong>
        </div>
        <p className="m-0">{ result.diagnostico }</p>
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2">
          <span className="text-text-muted font-bold"><span className="text-text-darker mr-1.5 uppercase tracking-tighter">Protocolo:</span> { result.isActionBetterThanFold ? "A utilidade da colisão neutraliza a erosão do tempo." : "A omissão estratégica preserva o capital sistêmico." }</span>
        </div>
        { isNearPayjump && <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-accent-gold font-bold leading-relaxed shadow-lg shadow-amber-500/5"><i className="fa-solid fa-bolt-lightning mr-3"></i>[EXTREMA AVERSÃO AO RISCO]: A pressão de payjump induz o overfold. A inversão de EVs negativos da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade dessa leitura (Axioma Lipe Piv).</div> }
      </div>
    </div>
  );
}
