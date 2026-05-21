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
  const stacks = useMemo( () => initialStacks && initialStacks.length > 0 ? initialStacks : DEFAULT_STACKS, [ initialStacks ] );
  const prizes = useMemo( () => initialPrizes && initialPrizes.length > 0 ? initialPrizes : DEFAULT_PRIZES, [ initialPrizes ] );

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
    <div className="glass-panel flex flex-col gap-10 p-6 sm:p-10 lg:p-14 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-6">
        <div>
          <h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
             Perspectiva Matemática &middot; <span className="text-text-muted">v4.2 Quantum</span>
          </h3>
          <p className="text-[0.6rem] text-text-dim mt-1.5 m-0 leading-relaxed max-w-md font-medium uppercase tracking-widest">
            Física da Decisão: Piso Dinâmico (EV_fold) e Dívida RIO
          </p>
        </div>
        <div className={ `text-[0.6rem] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border transition-all shadow-2xl flex items-center gap-3 ${ isNearPayjump ? 'bg-emerald-500/10 border-emerald-500/20 text-accent-emerald shadow-emerald-500/5' : 'bg-black/40 border-white/5 text-text-darker' }` }>
          <div className={`w-1.5 h-1.5 rounded-full ${isNearPayjump ? 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)] animate-pulse' : 'bg-text-darker'}`} />
          { isNearPayjump ? "LADDERING ATIVO" : "EQUILÍBRIO ESTÁVEL" }
        </div>
      </div>

      {/* CONTROLES QUANTUM */ }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 p-6 lg:p-10 rounded-3xl border border-white/5 shadow-inner">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="perspective-opponents" className="text-[0.55rem] text-text-muted uppercase font-black tracking-[0.25em]">Oponentes</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-danger bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-lg tabular-nums">{ numPlayers }{ numPlayers > 2 ? ' MW' : ' HU' }</span>
          </div>
          <input id="perspective-opponents" type="range" min="2" max="5" step="1" value={ numPlayers } onChange={ ( e ) => setNumPlayers( Number.parseInt( e.target.value ) ) } className="w-full h-1.5 accent-accent-danger bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="flex flex-col gap-3 justify-center bg-black/40 p-5 rounded-2xl border border-white/5 shadow-2xl">
          <label htmlFor="perspective-payjump" className="text-[0.6rem] text-text-muted uppercase font-black tracking-[0.2em] flex items-center gap-3 cursor-pointer group active:scale-95 transition-all">
            <input id="perspective-payjump" type="checkbox" checked={ isNearPayjump } onChange={ ( e ) => setIsNearPayjump( e.target.checked ) } className="w-4 h-4 accent-accent-emerald rounded-lg bg-black/60 border-white/10 cursor-pointer" />
            <span className="group-hover:text-white transition-colors">Perto de Payjump</span>
          </label>
          <label htmlFor="perspective-blinds" className="text-[0.6rem] text-text-muted uppercase font-black tracking-[0.2em] flex items-center gap-3 cursor-pointer group active:scale-95 transition-all">
            <input id="perspective-blinds" type="checkbox" checked={ blindsRising } onChange={ ( e ) => setBlindsRising( e.target.checked ) } className="w-4 h-4 accent-accent-danger rounded-lg bg-black/60 border-white/10 cursor-pointer" />
            <span className="group-hover:text-white transition-colors">Blinds Subindo</span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="perspective-pko" className="text-[0.55rem] text-text-muted uppercase font-black tracking-[0.25em]">PKO Bounty</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-gold bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-lg tabular-nums">{ Math.round( bountyValue * 100 ) }%</span>
          </div>
          <input id="perspective-pko" type="range" min="0" max="0.1" step="0.005" value={ bountyValue } onChange={ ( e ) => setBountyValue( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-gold bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="perspective-kappa" className="text-[0.55rem] text-text-muted uppercase font-black tracking-[0.25em]">Credibilidade κ</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-pink bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-lg tabular-nums">{ Math.round( kappa * 100 ) }%</span>
          </div>
          <input id="perspective-kappa" type="range" min="0" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-pink bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="bg-black/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden group/sunk">
          <div className="absolute inset-0 bg-linear-to-b from-accent-amber/5 to-transparent pointer-events-none" />
          <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.3em] mb-1.5 relative z-10 group-hover/sunk:text-text-dim transition-colors">Sunk Cost &middot; Pot</span>
          <div className="text-lg font-black text-accent-amber font-mono tabular-nums tracking-tighter relative z-10">-{ heroCost.toFixed( 2 ) }bb <span className="text-text-darker mx-1">/</span> { potSize.toFixed( 1 ) }bb</div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="perspective-equity" className="text-[0.55rem] text-text-muted uppercase font-black tracking-[0.25em]">Equity Estimada</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-indigo bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-lg tabular-nums">{ Math.round( winProb * 100 ) }%</span>
          </div>
          <input id="perspective-equity" type="range" min="0" max="1" step="0.01" value={ winProb } onChange={ ( e ) => setWinProb( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer" />
        </div>

        <div className="space-y-4 md:col-span-3 pt-2">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="perspective-realization" className="text-[0.55rem] text-text-muted uppercase font-black tracking-[0.25em]">Fator de Realização Posicional (R)</label>
            <span className="text-[0.65rem] font-mono font-black text-accent-emerald bg-black/60 px-3 py-1 rounded-lg border border-white/10 shadow-lg tabular-nums">{ realization.toFixed(2) }x</span>
          </div>
          <input id="perspective-realization" type="range" min="0.5" max="1.5" step="0.05" value={ realization } onChange={ ( e ) => setRealization( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer shadow-inner" />
        </div>
      </div>


      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */ }
      <div className="flex flex-col gap-6 scrollbar-hide">
        <SotaTooltip title="LAYER 1: ICMev (Snapshot)" content="A fotografia estática. Fichas convertidas em equidade de prêmio (Malmuth-Harville). Ignora completamente a variância, a posição e o tempo. Útil como base, perigoso como conclusão." align="left" theme="indigo">
          <div className="p-6 lg:p-8 rounded-3xl border border-white/5 border-l-8 border-l-text-darker bg-black/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl transition-all duration-500 hover:bg-black/60 hover:-translate-y-1.5 group/layer">
            <div className="space-y-1.5">
              <span className="text-[0.75rem] font-black text-text-muted uppercase tracking-[0.3em] group-hover/layer:text-text-light transition-colors">LAYER 1 &middot; ICMev</span>
              <p className="text-[0.7rem] text-text-darker leading-relaxed m-0 font-medium">Perspectiva base e ingênua (Física Newtoniana).</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-0.5">
                <span className="text-[0.55rem] uppercase font-black tracking-widest text-text-darker">Base Equity</span>
                <span className="text-2xl font-black text-text-muted tabular-nums font-mono tracking-tighter group-hover/layer:text-text-light transition-colors">{ result.currentEquityPct.toFixed( 2 ) }%</span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 2: Esperança Matemática" content="A injeção da Lógica. O Valuation corrige a assimetria (fichas ganhas vs perdidas) e a Dívida RIO pune a insolvência de múltiplos jogadores no pote." align="left" theme="indigo">
          <div className="p-6 lg:p-8 rounded-3xl border border-white/5 border-l-8 border-l-accent-amber bg-black/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl transition-all duration-500 hover:bg-black/60 hover:-translate-y-1.5 group/layer">
            <div className="flex flex-col gap-3">
              <span className="text-[0.75rem] font-black text-accent-amber uppercase tracking-[0.3em]">LAYER 2 &middot; ESPERANÇA MATEMÁTICA</span>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Valuation Factor</span>
                    <strong className="text-accent-amber font-mono text-base font-black bg-accent-amber/10 px-2.5 py-0.5 rounded-lg border border-accent-amber/20 tabular-nums">{ result.valuation.toFixed( 2 ) }x</strong>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Dívida RIO</span>
                    <strong className="text-accent-amber font-mono text-base font-black bg-accent-amber/10 px-2.5 py-0.5 rounded-lg border border-accent-amber/20 tabular-nums">-{ result.rioLiability.toFixed( 2 ) }%</strong>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-0.5 mt-4 md:mt-0">
              <span className="text-[0.55rem] uppercase font-black tracking-widest text-text-darker">Assimetria</span>
              <span className="text-3xl font-black text-accent-amber tabular-nums font-mono tracking-tighter shadow-accent-amber/10">{ ( ( result.valuation - 1 ) * 100 ).toFixed( 0 ) }%</span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 3: Expectativa Preditiva" content="A Psicologia do Tempo. FGS mede a urgência da sobrevivência (t-3 blinds) e o Piso Dinâmico estabelece o verdadeiro custo do fold." align="left" theme="indigo">
          <div className="p-6 lg:p-8 rounded-3xl border border-white/5 border-l-8 border-l-accent-emerald bg-black/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-2xl transition-all duration-500 hover:bg-black/60 hover:-translate-y-1.5 group/layer">
            <div className="flex flex-col gap-3">
              <span className="text-[0.75rem] font-black text-accent-emerald uppercase tracking-[0.3em]">LAYER 3 &middot; EXPECTATIVA PREDITIVA</span>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Piso (EV_fold)</span>
                    <strong className="text-accent-emerald font-mono text-base font-black bg-accent-emerald/10 px-2.5 py-0.5 rounded-lg border border-accent-emerald/20 tabular-nums">{ result.dynamicEvFold.toFixed( 2 ) }%</strong>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">FGS Health</span>
                    <strong className="text-accent-emerald font-mono text-base font-black bg-accent-emerald/10 px-2.5 py-0.5 rounded-lg border border-accent-emerald/20 tabular-nums">{ result.fgsHealth.toFixed( 2 ) }x</strong>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-0.5 mt-4 md:mt-0">
              <span className="text-[0.55rem] uppercase font-black tracking-widest text-text-darker">Status Orgânico</span>
              <span className="text-xl font-black text-accent-emerald uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{ result.isActionBetterThanFold ? "Soberano" : "Insolvente" }</span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip title="LAYER 4: Perspectiva Matemática" content="A Síntese Máxima SOTA. Se o valor é positivo, a utilidade da colisão supera o piso estrutural do fold e a erosão do tempo, justificando a agressão." align="left" theme="indigo">
          <div className="p-8 lg:p-10 xl:p-14 rounded-4xl border border-accent-indigo/30 border-l-10 border-l-accent-indigo bg-linear-to-br from-accent-indigo/10 via-slate-950/90 to-bg-panel/60 backdrop-blur-2xl shadow-3xl flex flex-col gap-8 transition-all duration-700 hover:-translate-y-2 group/pm">
            <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="flex flex-col gap-4">
                <span className="text-[0.8rem] font-black text-accent-indigo-light uppercase tracking-[0.4em] mb-1 group-hover/pm:tracking-[0.45em] transition-all duration-700">LAYER 4 &middot; PERSPECTIVA (PM)</span>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Edge Amortizada</span>
                    <strong className="text-white font-mono text-lg font-black bg-white/5 px-3 py-1 rounded-xl border border-white/10 shadow-inner tabular-nums">{ result.amortizedEdge.toFixed( 2 ) }x</strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Insolvência Cᵢ</span>
                    <strong className="text-white font-mono text-lg font-black bg-white/5 px-3 py-1 rounded-xl border border-white/10 shadow-inner tabular-nums">{ result.ci.toFixed( 2 ) }</strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.55rem] uppercase font-black text-text-darker tracking-widest">Axioma Psi (κ)</span>
                    <strong className="text-white font-mono text-lg font-black bg-white/5 px-3 py-1 rounded-xl border border-white/10 shadow-inner tabular-nums">{ Math.round( kappa * 100 ) }%</strong>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1.5">
                <span className="text-[0.6rem] uppercase tracking-[0.3em] font-black text-text-dim mb-0.5">Métrica Soberana</span>
                <span className={ `text-5xl lg:text-6xl font-black tabular-nums font-mono tracking-tighter drop-shadow-2xl transition-all duration-700 ${ result.isActionBetterThanFold ? 'text-accent-emerald group-hover/pm:drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'text-accent-danger group-hover/pm:drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]' }` }>
                  { result.perspectivaPct > 0 ? '+' : '' }{ result.perspectivaPct.toFixed( 2 ) }%
                </span>
              </div>
            </div>
            { Math.abs( result.perspectivaPct ) <= 5 && (
              <div className="mt-2 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[0.8rem] text-accent-pink-light font-medium leading-relaxed flex flex-col gap-3 shadow-2xl relative overflow-hidden group/marginal">
                <div className="absolute inset-0 bg-linear-to-r from-accent-rose/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-accent-rose/20 border border-accent-rose/30 flex items-center justify-center shrink-0 shadow-lg">
                    <i className="fa-solid fa-triangle-exclamation text-accent-rose-light text-lg animate-pulse"></i>
                  </div>
                  <strong className="uppercase tracking-[0.3em] text-[0.7rem] font-black text-accent-rose-light">Zona Marginal &middot; <span className="text-text-darker">Equilíbrio Instável</span></strong>
                </div>
                <p className="m-0 pl-14 opacity-80 leading-relaxed font-medium">Decisão altamente sensível à imprecisão de range e entropia informacional.</p>
                <div className="mt-1 pl-10 text-text-bright font-bold italic border-l-4 border-accent-rose/40 ml-4 py-1.5 px-5 bg-black/20 rounded-r-xl">
                  &quot;O tamanho do desvio (exploit) deve ser estritamente proporcional à credibilidade da sua informação.&quot; — Axioma Lipe Piv
                </div>
              </div>
            ) }
          </div>
        </SotaTooltip>
      </div>

      {/* EQUITY CURVES CHART */ }
      <div className="w-full h-80 bg-black/40 rounded-4xl border border-white/5 p-6 shadow-inner overflow-hidden">
        <PerspectiveChart chartData={chartData} />
      </div>

      {/* DIAGNÓSTICO SOTA */ }
      <div className="p-8 bg-linear-to-br from-accent-indigo/10 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 border-l-10 border-l-accent-indigo rounded-4xl text-[0.8rem] text-indigo-100/90 leading-relaxed shadow-3xl group/diag hover:border-accent-indigo/30 transition-all duration-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_15px_var(--accent-indigo)] animate-pulse"></div>
          <strong className="text-accent-indigo-light uppercase tracking-[0.4em] font-black text-[0.65rem]">Síntese do Orquestrador Quantum</strong>
        </div>
        <p className="m-0 relative z-10 font-medium leading-loose max-w-5xl">{ result.diagnostico }</p>
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-x-10 gap-y-3 relative z-10">
          <div className="flex items-center gap-2.5">
              <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest">Protocolo SOTA</span>
              <span className="text-white font-black uppercase tracking-widest text-[0.65rem] bg-white/5 px-3 py-1 rounded-lg border border-white/10 shadow-lg">{ result.isActionBetterThanFold ? "Agressão Dominante" : "Omissão Estratégica" }</span>
          </div>
          <div className="flex items-center gap-2.5">
              <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest">Diretriz</span>
              <span className="text-text-muted font-bold italic text-[0.75rem]">{ result.isActionBetterThanFold ? "A utilidade da colisão neutraliza a erosão do tempo." : "A omissão preserva o capital sistêmico da órbita." }</span>
          </div>
        </div>
        { isNearPayjump && (
            <div className="mt-8 p-6 bg-amber-500/10 rounded-3xl border border-amber-500/30 text-accent-gold font-bold leading-relaxed shadow-3xl shadow-amber-500/5 relative overflow-hidden group/payjump">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/payjump:opacity-20 transition-opacity">
                <i className="fa-solid fa-bolt-lightning text-6xl"></i>
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <i className="fa-solid fa-bolt-lightning text-lg text-accent-amber animate-pulse"></i>
                <span className="uppercase tracking-[0.3em] text-[0.7rem] font-black">Extrema Aversão ao Risco Identificada</span>
              </div>
              <p className="m-0 relative z-10 text-[0.85rem] leading-relaxed">
                A pressão de payjump induz o overfold estrutural. A inversão de EVs da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade informacional (Axioma Lipe Piv).
              </p>
            </div>
        ) }
      </div>
    </div>
  );
}
