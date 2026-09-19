/**
 * IDENTITY: Widget do Corredor Estocástico e Âncoras Canônicas (SOTA v8.0 GOLD)
 * PATH: src/components/simulator/ui/ProspectRiskCorridorWidget.tsx
 * ROLE: Exibe elementos específicos (âncoras ativáveis) com critérios lógicos explícitos
 *       e a visualização da tendência central (μ) e bandas de desvio-padrão (±1σ, ±2σ).
 *
 * @format
 */

'use client';

import { useMemo } from 'react';
import {
  CANONICAL_ANCHORS,
  calculateStochasticCorridor,
  type CanonicalAnchor,
  type StochasticCorridorInput,
} from '@/lib/prospectCorridor';

interface ProspectRiskCorridorWidgetProps {
  rawEquity: number;
  realizationFactor: number;
  psiFactor: number;
  potOdds?: number;
  spr?: number;
  numPlayers?: number;
  lossAversionLambda?: number;
  isNearPayjump?: boolean;
  activeAnchorId: string;
  onSelectAnchor: (anchor: CanonicalAnchor) => void;
}

export function ProspectRiskCorridorWidget({
  rawEquity,
  realizationFactor,
  psiFactor,
  potOdds = 0.33,
  spr = 2.0,
  numPlayers = 2,
  lossAversionLambda = 2.25,
  isNearPayjump = false,
  activeAnchorId,
  onSelectAnchor,
}: Readonly<ProspectRiskCorridorWidgetProps>) {
  const corridorInput: StochasticCorridorInput = useMemo(
    () => ({
      rawEquity,
      realizationFactor,
      psiFactor,
      potOdds,
      spr,
      numPlayers,
      lossAversionLambda,
      isNearPayjump,
    }),
    [
      rawEquity,
      realizationFactor,
      psiFactor,
      potOdds,
      spr,
      numPlayers,
      lossAversionLambda,
      isNearPayjump,
    ],
  );

  const corridor = useMemo(
    () => calculateStochasticCorridor(corridorInput),
    [corridorInput],
  );

  const currentAnchor = useMemo(() => {
    return (
      CANONICAL_ANCHORS.find((a) => a.id === activeAnchorId) ||
      CANONICAL_ANCHORS.find((a) => a.id === corridor.matchedAnchorId) ||
      CANONICAL_ANCHORS[0]
    );
  }, [activeAnchorId, corridor.matchedAnchorId]);

  // Escala SVG para o corredor (-50% a +50%)
  const minRange = -40;
  const maxRange = 50;
  const rangeSpan = maxRange - minRange;
  const toSvgX = (val: number) => {
    const clamped = Math.max(minRange, Math.min(maxRange, val));
    return ((clamped - minRange) / rangeSpan) * 100;
  };

  const xZero = toSvgX(0);
  const xMu = toSvgX(corridor.mu);
  const x1Lower = toSvgX(corridor.band1sLower);
  const x1Upper = toSvgX(corridor.band1sUpper);
  const x2Lower = toSvgX(corridor.band2sLower);
  const x2Upper = toSvgX(corridor.band2sUpper);

  const statusTheme = useMemo(() => {
    switch (corridor.decisionStatus) {
      case 'soberana':
        return {
          badgeClass: 'text-accent-emerald border-emerald-500/30 bg-emerald-500/10',
          dotClass: 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]',
          label: 'AÇÃO SOBERANA (ROBUSTA SOB 1σ)',
          band1sFill: 'rgba(16, 185, 129, 0.25)',
          band2sFill: 'rgba(16, 185, 129, 0.10)',
          strokeColor: '#10b981',
        };
      case 'marginal':
        return {
          badgeClass: 'text-accent-amber border-amber-500/30 bg-amber-500/10',
          dotClass: 'bg-accent-amber shadow-[0_0_8px_var(--accent-amber)] animate-pulse',
          label: 'ZONA MARGINAL (SENSIÍVEL À VARIÂNCIA)',
          band1sFill: 'rgba(245, 158, 11, 0.25)',
          band2sFill: 'rgba(245, 158, 11, 0.10)',
          strokeColor: '#f59e0b',
        };
      case 'insolvente':
      default:
        return {
          badgeClass: 'text-accent-rose border-rose-500/30 bg-rose-500/10',
          dotClass: 'bg-accent-rose shadow-[0_0_8px_var(--accent-rose)] animate-pulse',
          label: 'INSOLVÊNCIA DE PERSPECTIVA (OVERFOLD)',
          band1sFill: 'rgba(244, 63, 94, 0.25)',
          band2sFill: 'rgba(244, 63, 94, 0.10)',
          strokeColor: '#f43f5e',
        };
    }
  }, [corridor.decisionStatus]);

  return (
    <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 md:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-accent-indigo/10 blur-3xl" />

      {/* HEADER DO MOTOR EXPERIMENTAL */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)] animate-pulse" />
            <span className="text-[0.65rem] font-black tracking-[0.3em] text-accent-indigo-light uppercase">
              Motor Experimental · Corredor Estocástico
            </span>
            <span className="rounded-md border border-accent-indigo/30 bg-accent-indigo/15 px-2 py-0.5 font-mono text-[0.55rem] font-bold text-accent-indigo-light uppercase">
              Ψ × R ± σ
            </span>
          </div>
          <p className="m-0 mt-1 text-[0.65rem] font-medium tracking-wide text-text-dim">
            Modelagem contínua de tendência central e dispersão por desvio-padrão ancorada no Tratado PMev.
          </p>
        </div>

        {/* STATUS DA DECISÃO */}
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-2 font-mono text-[0.6rem] font-black tracking-widest uppercase shadow-lg transition-all ${statusTheme.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusTheme.dotClass}`} />
          {statusTheme.label}
        </div>
      </div>

      {/* SELETOR DE ÂNCORAS CANÔNICAS ATIVÁVEIS */}
      <div className="my-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[0.6rem] font-black tracking-[0.25em] text-text-muted uppercase">
            Âncoras Canônicas Ativáveis (Pontos de Referência)
          </span>
          <span className="text-[0.55rem] font-bold text-text-darker tracking-wider uppercase">
            Selecione para Ativar &middot; Calibração Instantânea
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {CANONICAL_ANCHORS.map((anchor) => {
            const isSelected = activeAnchorId === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => onSelectAnchor(anchor)}
                aria-pressed={isSelected}
                className={`group relative flex flex-col items-start justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-indigo/50 bg-accent-indigo/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'border-white/5 bg-black/40 hover:border-white/15 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[0.55rem] font-black uppercase text-white">
                    {anchor.tag}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1.5 font-mono text-[0.55rem] font-black tracking-widest text-accent-indigo-light uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                      <span>ATIVA</span>
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <strong className="block text-[0.68rem] font-black tracking-wide text-white">
                    {anchor.name}
                  </strong>
                  <span className="block text-[0.58rem] font-medium text-text-dim">
                    {anchor.subtitle}
                  </span>
                </div>

                <div className="mt-3 flex w-full items-center justify-between border-t border-white/5 pt-2 font-mono text-[0.55rem] text-text-muted">
                  <span>Ψ {anchor.defaults.psiFactor.toFixed(2)}x</span>
                  <span>R {anchor.defaults.realizationFactor.toFixed(2)}x</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PAINEL DE CRITÉRIOS LÓGICOS EXPLÍCITOS */}
      {currentAnchor && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-inner">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-black tracking-[0.25em] text-accent-indigo-light uppercase">
                  Critério Lógico Explícito:
                </span>
                <span className="text-[0.55rem] font-mono font-bold text-text-darker uppercase">
                  {currentAnchor.teoremaRef}
                </span>
              </div>
              <p className="m-0 text-[0.72rem] leading-relaxed font-medium text-indigo-100/90">
                {currentAnchor.criterioLogico}
              </p>
              <div className="pt-1 text-[0.68rem] leading-relaxed text-text-dim italic">
                &ldquo;{currentAnchor.diretrizEstrategica}&rdquo;
              </div>
            </div>

            {/* SINTESE PARAMETRICA */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2.5 font-mono text-[0.6rem]">
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">Ψ Fator</span>
                <span className="font-black text-accent-rose-light">
                  {psiFactor.toFixed(2)}x
                </span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">R Realiz.</span>
                <span className="font-black text-accent-emerald">
                  {realizationFactor.toFixed(2)}x
                </span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">λ Aversão</span>
                <span className="font-black text-accent-amber">
                  {lossAversionLambda.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO DO CORREDOR ESTOCÁSTICO (SVG RESPONSIVO) */}
      <div className="rounded-3xl border border-white/5 bg-black/50 p-5 shadow-2xl">
        <div className="mb-2 flex items-center justify-between text-[0.6rem] font-black tracking-widest text-text-muted uppercase">
          <span>Corredor Estocástico: Tendência (μ) & Dispersão (±1σ, ±2σ)</span>
          <span className="font-mono text-white">
            μ = {corridor.mu > 0 ? `+${corridor.mu.toFixed(1)}%` : `${corridor.mu.toFixed(1)}%`}{' '}
            &middot; σ = ±{corridor.sigma.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-slate-950/80 p-2">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-label="Gráfico do Corredor Estocástico"
          >
            {/* Grade de fundo */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            
            {/* Linha de Breakeven (Zero) */}
            <line
              x1={xZero}
              y1="4"
              x2={xZero}
              y2="36"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.75"
              strokeDasharray="1.5, 1.5"
            />

            {/* Banda 2σ (Dispersão Total 95.4%) */}
            <rect
              x={Math.min(x2Lower, x2Upper)}
              y="10"
              width={Math.max(0.5, Math.abs(x2Upper - x2Lower))}
              height="20"
              fill={statusTheme.band2sFill}
              rx="3"
            />

            {/* Banda 1σ (Intervalo de Confiança 68.3%) */}
            <rect
              x={Math.min(x1Lower, x1Upper)}
              y="13"
              width={Math.max(0.5, Math.abs(x1Upper - x1Lower))}
              height="14"
              fill={statusTheme.band1sFill}
              rx="2"
            />

            {/* Marcadores de extremos 2σ */}
            <line
              x1={x2Lower}
              y1="8"
              x2={x2Lower}
              y2="32"
              stroke={statusTheme.strokeColor}
              strokeWidth="0.75"
              opacity="0.6"
            />
            <line
              x1={x2Upper}
              y1="8"
              x2={x2Upper}
              y2="32"
              stroke={statusTheme.strokeColor}
              strokeWidth="0.75"
              opacity="0.6"
            />

            {/* Linha Central de Tendência (μ) */}
            <line
              x1={xMu}
              y1="5"
              x2={xMu}
              y2="35"
              stroke={statusTheme.strokeColor}
              strokeWidth="1.5"
            />
            <circle
              cx={xMu}
              cy="20"
              r="2.5"
              fill="#ffffff"
              stroke={statusTheme.strokeColor}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* RÉGUA DE LEGENDA DO CORREDOR */}
        <div className="mt-3 flex items-center justify-between font-mono text-[0.55rem] text-text-darker">
          <span>Worst-Case (VaR -2σ): {corridor.band2sLower}%</span>
          <span className="text-text-muted">Piso Breakeven: 0.0%</span>
          <span>Upside (+2σ): +{corridor.band2sUpper}%</span>
        </div>
      </div>

      {/* METRICAS CHAVE CONSOLIDADAS */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Tendência Central (μ)
          </span>
          <strong
            className={`mt-1 block font-mono text-xl font-black tabular-nums ${
              corridor.mu >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
            }`}
          >
            {corridor.mu >= 0 ? `+${corridor.mu.toFixed(1)}%` : `${corridor.mu.toFixed(1)}%`}
          </strong>
          <span className="text-[0.55rem] text-text-dim">Margem sobre equilíbrio</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Dispersão (σ)
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-white tabular-nums">
            ±{corridor.sigma.toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">Volatilidade estocástica</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Prob. de Solvência
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-accent-indigo-light tabular-nums">
            {(corridor.solvencyProbability * 100).toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">P(PMev &gt; Baseline)</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Equidade Efetiva (E × R)
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-accent-amber tabular-nums">
            {corridor.effectiveEquityPct.toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">
            Necessária: {corridor.requiredEquityPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
