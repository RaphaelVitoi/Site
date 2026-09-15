'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid) v7.0 GOLD
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar a física de defesa e push/fold de todas as 169 mãos Texas Hold'em
 *       com cálculo exato de Equidade Requerida e Margem de Lucro baseadas no Bubble Factor.
 * BINDING: [src/lib/holdemEquities.ts, src/components/simulator/BubbleFactorMatrix.tsx]
 */

import React, { useMemo, useState } from 'react';
import {
  computeRangeMatrixSummary,
  evaluateHandDetail,
  RANKS,
  SHOVE_PROFILES,
  type HandEquityDetail,
  type HandVerdict,
  type ShoveProfile,
} from '@/lib/holdemEquities';

import { calculateReverseRequiredFoldEquity } from '@/lib/dynamicFoldEquityEngine';

interface RangeMatrixProps {
  ipRp: number;
  oopRp: number;
  scenarioId?: string;
}

type Perspective = 'ip' | 'oop';
type CellDisplayMode = 'MARGIN' | 'EQUITY' | 'STATUS' | 'FE_REQ';

function getPerspectiveButtonClass(isActive: boolean, p: Perspective): string {
  if (!isActive) return 'text-text-muted hover:text-white';
  if (p === 'ip')
    return 'bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 shadow-lg shadow-indigo-500/10';
  return 'bg-accent-rose/20 text-accent-rose border border-accent-rose/40 shadow-lg shadow-rose-500/10';
}

function getCellDisplayModeLabel(mode: CellDisplayMode): string {
  switch (mode) {
    case 'MARGIN':
      return 'Margem \u0394';
    case 'EQUITY':
      return 'Equidade %';
    case 'STATUS':
      return 'Veredito';
    case 'FE_REQ':
      return 'Fold Req %';
  }
}

function getHandTypeDescription(isPair: boolean, isSuited: boolean): string {
  if (isPair) return 'Par na Mão';
  if (isSuited) return 'Naipadas (Suited)';
  return 'Desconectadas (Offsuit)';
}

export default function RangeMatrix({
  ipRp,
  oopRp,
  scenarioId: _scenarioId = 'mtt-final-table',
}: Readonly<RangeMatrixProps>) {
  const [perspective, setPerspective] = useState<Perspective>('ip');
  const [shoveProfile, setShoveProfile] = useState<ShoveProfile>('STANDARD_25');
  const [displayMode, setDisplayMode] = useState<CellDisplayMode>('MARGIN');
  const [selectedHand, setSelectedHand] = useState<string>('AKs');
  const [hoveredHand, setHoveredHand] = useState<string | null>(null);

  const activeRp = perspective === 'ip' ? ipRp : oopRp;

  const summary = useMemo(() => {
    return computeRangeMatrixSummary(shoveProfile, activeRp);
  }, [shoveProfile, activeRp]);

  const activeInspectorHand = hoveredHand || selectedHand;

  const inspectedDetail: HandEquityDetail = useMemo(() => {
    return evaluateHandDetail(activeInspectorHand, shoveProfile, activeRp);
  }, [activeInspectorHand, shoveProfile, activeRp]);

  const getCellColorAndBorder = (detail: HandEquityDetail, mode: CellDisplayMode = displayMode) => {
    if (mode === 'FE_REQ') {
      const feReq = calculateReverseRequiredFoldEquity(15, 20, detail.equity / 100, 15);
      if (feReq === 0) {
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-800/90 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      }
      if (feReq <= 0.3) {
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-800/90 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
      }
      if (feReq <= 0.5) {
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-800/90 hover:border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
      }
      return 'bg-slate-950/80 text-slate-500 border-white/5 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40';
    }

    switch (detail.verdict) {
      case 'CORE_CALL':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-800/90 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'MARGINAL_CALL':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-800/90 hover:border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
      case 'RISKY_FOLD':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/90 hover:border-indigo-300';
      case 'DEATH_FOLD':
      default:
        return 'bg-slate-950/80 text-slate-500 border-white/5 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40';
    }
  };

  const getVerdictBadge = (verdict: HandVerdict) => {
    switch (verdict) {
      case 'CORE_CALL':
        return {
          text: 'CALL LUCRATIVO (+EV)',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
        };
      case 'MARGINAL_CALL':
        return {
          text: 'CALL MARGINAL (Break-Even)',
          color: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
        };
      case 'RISKY_FOLD':
        return {
          text: 'FOLD POR ICM (Dano Estrutural)',
          color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
        };
      case 'DEATH_FOLD':
        return {
          text: 'FOLD CRÍTICO (Death Zone)',
          color: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
        };
    }
  };

  return (
    <div className="glass-panel relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
      <div className="bg-accent-emerald/5 pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-[120px]" />
      <div className="bg-accent-indigo/5 pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[120px]" />

      {/* ═══ CABEÇALHO PRINCIPAL E CONTROLES ═══ */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-accent-emerald h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_12px_var(--color-accent-emerald)]" />
            <h3 className="m-0 text-sm font-black tracking-[0.2em] text-white uppercase">
              Matriz de Defesa 13&times;13 (169 Mãos Hold&apos;em)
            </h3>
          </div>
          <p className="text-text-dim m-0 font-mono text-[0.62rem] tracking-wider uppercase">
            ReqEq = <span className="text-accent-amber font-bold">{summary.requiredEquity}%</span> &middot; Bubble
            Factor = <span className="text-accent-indigo font-bold">{summary.bubbleFactor}&times;</span> &middot; Risk
            Premium ={' '}
            <span className="font-bold text-white">
              {typeof activeRp === 'number' && Number.isFinite(activeRp) ? activeRp.toFixed(1) : '0.0'}%
            </span>
          </p>
        </div>

        {/* Alternadores de Perspectiva e Modo de Exibição */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Perspectiva IP / OOP */}
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-1 shadow-inner">
            {(['ip', 'oop'] as Perspective[]).map((p) => {
              const isActive = perspective === p;
              const val = p === 'ip' ? ipRp : oopRp;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPerspective(p)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-[0.58rem] font-black tracking-wider uppercase transition-colors duration-150 ${getPerspectiveButtonClass(
                    isActive,
                    p,
                  )}`}
                >
                  {p.toUpperCase()}: {typeof val === 'number' && Number.isFinite(val) ? val.toFixed(1) : '0.0'}%
                </button>
              );
            })}
          </div>

          {/* Modo de Exibição das Células */}
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-1 shadow-inner">
            {(['MARGIN', 'EQUITY', 'STATUS', 'FE_REQ'] as CellDisplayMode[]).map((mode) => {
              const isActive = displayMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDisplayMode(mode)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[0.56rem] font-black tracking-wider uppercase transition-colors duration-150 ${
                    isActive
                      ? 'border border-white/20 bg-white/10 text-white shadow-sm'
                      : 'text-text-dim hover:text-text-muted'
                  }`}
                >
                  {getCellDisplayModeLabel(mode)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ BARRA DE PERFIL DE SHOVE DO VILÃO ═══ */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 p-3 sm:flex-row sm:items-center">
        <span className="text-text-dim flex items-center gap-2 font-mono text-[0.6rem] font-black tracking-wider uppercase">
          <i className="fa-solid fa-crosshairs text-accent-amber" /> Range de Shove do Vilão:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SHOVE_PROFILES).map(([key, prof]) => {
            const isActive = shoveProfile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setShoveProfile(key as ShoveProfile)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[0.58rem] font-bold tracking-wider uppercase transition-colors duration-150 ${
                  isActive
                    ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/40 border shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'text-text-dim border border-transparent bg-white/5 hover:text-white'
                }`}
              >
                {prof.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ ESTATÍSTICAS SUMÁRIAS DE DEFESA (4 CARDS) ═══ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex min-h-14.5 flex-col justify-center rounded-2xl border border-emerald-500/20 bg-emerald-950/25 p-3">
          <span className="mb-0.5 font-mono text-[0.52rem] font-black tracking-wider text-emerald-400 uppercase">
            Defesa Total (Call)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base leading-none font-black text-white">{summary.callCombos}</span>
            <span className="font-mono text-[0.65rem] leading-none font-bold text-emerald-400">
              ({summary.callPercentage}%)
            </span>
          </div>
          <span className="mt-1 font-mono text-[0.46rem] leading-none text-slate-400">
            {summary.coreCallCombos} core + {summary.marginalCallCombos} marginais
          </span>
        </div>

        <div className="flex min-h-14.5 flex-col justify-center rounded-2xl border border-rose-500/20 bg-rose-950/25 p-3">
          <span className="mb-0.5 font-mono text-[0.52rem] font-black tracking-wider text-rose-400 uppercase">
            Descarte (Fold)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base leading-none font-black text-white">{summary.foldCombos}</span>
            <span className="font-mono text-[0.65rem] leading-none font-bold text-rose-400">
              ({summary.foldPercentage}%)
            </span>
          </div>
          <span className="mt-1 font-mono text-[0.46rem] leading-none text-slate-400">
            {summary.deathFoldCombos} death + {summary.riskyFoldCombos} risco ICM
          </span>
        </div>

        <div className="flex min-h-14.5 flex-col justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-3">
          <span className="text-text-dim mb-0.5 font-mono text-[0.52rem] font-black tracking-wider uppercase">
            Equidade Requerida
          </span>
          <span className="text-accent-amber font-mono text-base leading-none font-black">
            {summary.requiredEquity}%
          </span>
          <span className="text-text-dim mt-1 font-mono text-[0.46rem] leading-none">Threshold de Break-Even</span>
        </div>

        <div className="flex min-h-14.5 flex-col justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-3">
          <span className="text-text-dim mb-0.5 font-mono text-[0.52rem] font-black tracking-wider uppercase">
            Bubble Factor
          </span>
          <span className="text-accent-indigo font-mono text-base leading-none font-black">
            {summary.bubbleFactor}&times;
          </span>
          <span className="text-text-dim mt-1 font-mono text-[0.46rem] leading-none">Assimetria Ganho / Perda</span>
        </div>
      </div>

      {/* ═══ GRADE 13x13 COMPLETA, ANCORADA E 100% ESTÁVEL ═══ */}
      <div className="w-full overflow-hidden rounded-3xl border border-white/8 bg-slate-950/80 p-2.5 shadow-2xl backdrop-blur-3xl select-none sm:p-3.5">
        <div className="grid w-full grid-cols-13 gap-0.5 sm:gap-1">
          {RANKS.map((r1, i) => (
            <React.Fragment key={`row-${r1}`}>
              {RANKS.map((r2, j) => {
                const isPair = i === j;
                const isSuited = j > i;
                let hand: string;
                if (isPair) {
                  hand = `${r1}${r2}`;
                } else if (isSuited) {
                  hand = `${r1}${r2}s`;
                } else {
                  hand = `${r2}${r1}o`;
                }

                const detail = evaluateHandDetail(hand, shoveProfile, activeRp);
                const isPinned = selectedHand === hand;
                const isHovered = hoveredHand === hand;
                const cellStyle = getCellColorAndBorder(detail);
                const feReqCell = calculateReverseRequiredFoldEquity(15, 20, detail.equity / 100, 15);

                let stateRingStyle = 'hover:border-white/40';
                if (isPinned) {
                  stateRingStyle =
                    'ring-2 ring-accent-amber border-amber-300 brightness-125 z-10 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
                } else if (isHovered) {
                  stateRingStyle =
                    'ring-1.5 ring-white border-white brightness-125 z-10 shadow-[0_0_8px_rgba(255,255,255,0.3)]';
                }

                return (
                  <button
                    type="button"
                    key={hand}
                    onClick={() => {
                      setSelectedHand(hand);
                      setHoveredHand(null);
                    }}
                    onMouseEnter={() => setHoveredHand(hand)}
                    className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border font-mono font-black transition-colors duration-75 outline-none sm:rounded-lg ${cellStyle} ${stateRingStyle}`}
                    title={`${hand}: Eq ${detail.equity}% | Req ${detail.requiredEquity}% | FE_req ${typeof feReqCell === 'number' && Number.isFinite(feReqCell) ? (feReqCell * 100).toFixed(0) : '0'}%`}
                  >
                    <span className="text-[0.52rem] leading-none sm:text-[0.68rem] md:text-[0.74rem]">{hand}</span>
                    {displayMode === 'MARGIN' && (
                      <span
                        className={`mt-0.5 text-[0.38rem] leading-none font-bold sm:text-[0.48rem] md:text-[0.52rem] ${
                          typeof detail.margin === 'number' && Number.isFinite(detail.margin) && detail.margin >= 0
                            ? 'text-emerald-300'
                            : 'text-rose-400/80'
                        }`}
                      >
                        {typeof detail.margin === 'number' && Number.isFinite(detail.margin) && detail.margin >= 0
                          ? '+'
                          : ''}
                        {typeof detail.margin === 'number' && Number.isFinite(detail.margin)
                          ? detail.margin.toFixed(0)
                          : '0'}
                        %
                      </span>
                    )}
                    {displayMode === 'EQUITY' && (
                      <span className="mt-0.5 text-[0.38rem] leading-none font-bold text-slate-300 sm:text-[0.48rem] md:text-[0.52rem]">
                        {typeof detail.equity === 'number' && Number.isFinite(detail.equity)
                          ? detail.equity.toFixed(0)
                          : '0'}
                        %
                      </span>
                    )}
                    {displayMode === 'STATUS' && (
                      <span className="mt-0.5 text-[0.34rem] leading-none font-bold opacity-80 sm:text-[0.44rem] md:text-[0.48rem]">
                        {typeof detail.margin === 'number' && Number.isFinite(detail.margin) && detail.margin >= 0
                          ? 'CALL'
                          : 'FOLD'}
                      </span>
                    )}
                    {displayMode === 'FE_REQ' && (
                      <span
                        className={`mt-0.5 font-mono text-[0.34rem] leading-none font-bold sm:text-[0.44rem] md:text-[0.48rem] ${
                          typeof feReqCell === 'number' && Number.isFinite(feReqCell) && feReqCell === 0
                            ? 'text-emerald-300'
                            : 'text-cyan-300'
                        }`}
                      >
                        {typeof feReqCell === 'number' && Number.isFinite(feReqCell) && feReqCell === 0
                          ? '0%'
                          : `${typeof feReqCell === 'number' && Number.isFinite(feReqCell) ? (feReqCell * 100).toFixed(0) : '0'}%`}
                      </span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══ PAINEL INSPETOR DETALHADO DA MÃO SELECIONADA (ALTURA ESTRITAMENTE CONSTANTE) ═══ */}
      <div className="flex flex-col gap-3.5 rounded-3xl border border-white/8 bg-slate-950/60 p-4 shadow-inner sm:p-5">
        <div className="flex min-h-12.5 flex-col items-start justify-between gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-base font-black text-white shadow-inner">
              {inspectedDetail.hand}
            </div>
            <div className="flex h-9 flex-col justify-center">
              <div className="flex h-4 items-center gap-2">
                <span className="text-text-dim block font-mono text-[0.58rem] leading-none font-black tracking-wider uppercase">
                  {getHandTypeDescription(inspectedDetail.isPair, inspectedDetail.isSuited)}
                </span>
                <span
                  className={`text-text-muted rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.46rem] leading-none font-bold tracking-wider uppercase transition-opacity duration-75 ${
                    hoveredHand && hoveredHand !== selectedHand ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  Preview
                </span>
              </div>
              <span className="mt-1 font-mono text-[0.68rem] leading-none font-bold text-slate-300">
                {inspectedDetail.combos} combinações
              </span>
            </div>
          </div>

          {/* Badge do Veredito com Altura e Largura Estáveis */}
          <div
            className={`flex min-h-8 shrink-0 items-center justify-center rounded-xl border px-3.5 py-1.5 text-center font-mono text-[0.62rem] font-black tracking-wider whitespace-nowrap shadow-sm transition-colors ${
              getVerdictBadge(inspectedDetail.verdict).color
            }`}
          >
            {getVerdictBadge(inspectedDetail.verdict).text}
          </div>
        </div>

        {/* Grade de 4 Métricas Chave */}
        <div className="grid grid-cols-2 gap-2.5 font-mono lg:grid-cols-4">
          <div className="flex min-h-13 flex-col justify-center rounded-xl border border-white/5 bg-black/40 p-2.5">
            <span className="text-text-dim mb-0.5 text-[0.48rem] tracking-wider uppercase">Equidade vs Shove</span>
            <span className="text-xs leading-none font-black text-white">{inspectedDetail.equity}%</span>
          </div>

          <div className="flex min-h-13 flex-col justify-center rounded-xl border border-white/5 bg-black/40 p-2.5">
            <span className="text-text-dim mb-0.5 text-[0.48rem] tracking-wider uppercase">Equidade Requerida</span>
            <span className="text-accent-amber text-xs leading-none font-black">{inspectedDetail.requiredEquity}%</span>
          </div>

          <div className="flex min-h-13 flex-col justify-center rounded-xl border border-white/5 bg-black/40 p-2.5">
            <span className="text-text-dim mb-0.5 text-[0.48rem] tracking-wider uppercase">
              Margem de Lucro (&Delta;)
            </span>
            <span
              className={`text-xs leading-none font-black ${
                typeof inspectedDetail.margin === 'number' &&
                Number.isFinite(inspectedDetail.margin) &&
                inspectedDetail.margin >= 0
                  ? 'text-accent-emerald'
                  : 'text-accent-rose'
              }`}
            >
              {typeof inspectedDetail.margin === 'number' &&
              Number.isFinite(inspectedDetail.margin) &&
              inspectedDetail.margin >= 0
                ? '+'
                : ''}
              {typeof inspectedDetail.margin === 'number' && Number.isFinite(inspectedDetail.margin)
                ? inspectedDetail.margin.toFixed(1)
                : '0.0'}
              %
            </span>
          </div>

          <div className="flex min-h-13 flex-col justify-center rounded-xl border border-white/5 bg-black/40 p-2.5">
            <span className="text-text-dim mb-0.5 text-[0.48rem] tracking-wider uppercase">
              Fold Equity Reversa ($FE_{'{req}'}$)
            </span>
            <span className="text-accent-sky text-xs leading-none font-black">
              {(() => {
                const feReq = calculateReverseRequiredFoldEquity(
                  15,
                  20,
                  typeof inspectedDetail.equity === 'number' && Number.isFinite(inspectedDetail.equity)
                    ? inspectedDetail.equity / 100
                    : 0,
                  15,
                );
                return typeof feReq === 'number' && Number.isFinite(feReq) && feReq === 0
                  ? '0.0% (Valor Puro)'
                  : `${typeof feReq === 'number' && Number.isFinite(feReq) ? (feReq * 100).toFixed(1) : '0.0'}%`;
              })()}
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual de Equidade vs Limiar */}
        <div className="space-y-1 pt-0.5">
          <div className="text-text-dim flex justify-between font-mono text-[0.5rem] font-bold uppercase">
            <span>0% (Fold)</span>
            <span className="text-accent-amber">Threshold Requerido: {inspectedDetail.requiredEquity}%</span>
            <span>100% (Pure Value)</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900">
            {/* Indicador de Required Equity */}
            <div
              className="absolute top-0 bottom-0 z-10 w-0.5 bg-amber-400 shadow-[0_0_6px_#fbbf24]"
              style={{ left: `${inspectedDetail.requiredEquity}%` }}
            />
            {/* Barra de Equidade da Mão */}
            <div
              className={`h-full transition-[width] duration-150 ease-out ${
                inspectedDetail.margin >= 0
                  ? 'bg-linear-to-r from-emerald-600 to-emerald-400'
                  : 'bg-linear-to-r from-rose-600 to-rose-400'
              }`}
              style={{ width: `${inspectedDetail.equity}%` }}
            />
          </div>
        </div>

        <div className="flex h-13 min-h-13 items-center overflow-hidden rounded-xl border border-white/5 bg-black/20 px-3.5 py-2">
          <p className="text-text-muted m-0 line-clamp-2 font-sans text-[0.62rem] leading-tight italic">
            {inspectedDetail.margin >= 0
              ? `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) supera o limiar de sobrevivência ICM (${inspectedDetail.requiredEquity}%), gerando call de expectativa positiva.`
              : `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) é inferior à barreira de risco ICM (${inspectedDetail.requiredEquity}%). Dar call resulta em perda massiva de EV em dinheiro real.`}
          </p>
        </div>
      </div>
    </div>
  );
}
