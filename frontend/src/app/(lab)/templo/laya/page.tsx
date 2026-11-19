/**
 * IDENTITY: Painel Visual SOTA Laya Multilingual S1 (Solver Bridge & GPU Telemetria)
 * PATH: frontend/src/app/(lab)/templo/laya/page.tsx
 * ROLE: Interface visual para administradores e desenvolvedores inspecionarem,
 *       modularem e homologarem o modelo System-1 Laya Multilingual (322M) conectado
 *       aos solvers analíticos (CFR+, Monte Carlo, TimesFM 2.5/3.0, Dream-RSI, Pluribus).
 * VERSION: v8.0 GOLD
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientFetchError, fetchJson } from '@/lib/client-fetch';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaButton } from '@/components/ui/layout/SotaButton';
import { CANONICAL_LAYA_MODEL, CANONICAL_LAYA_REPO, type LayaSolverBridgePayload } from '@/lib/laya';

type LayaTab = 'workbench' | 'telemetria' | 'deploy';

interface SolverConfig {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly color: string;
  readonly description: string;
  readonly defaultParams: Record<string, number | string>;
}

interface ServiceStatus {
  readonly status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  readonly weights_loaded: boolean;
  readonly model?: string;
  readonly cuda_available?: boolean;
  readonly cpu_override_active?: boolean;
  readonly latency_ms?: number;
  readonly reason?: string;
}

const SOLVERS_CONFIG: SolverConfig[] = [
  {
    id: 'cfr-plus',
    name: 'CFR+ (Regret Matching+)',
    badge: 'Game Theory',
    color: 'from-blue-500/20 to-cyan-500/20 border-cyan-400/40 text-cyan-300',
    description: 'Modulação de iterações, Regret Discounting (alpha) e convergência para Equilíbrio de Nash.',
    defaultParams: { iterations: 2000, discount_alpha: 0.8 },
  },
  {
    id: 'monte-carlo',
    name: 'Monte Carlo Insolvency (WASM)',
    badge: 'Risk & Equity',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-emerald-300',
    description: 'Expansão dinâmica de amostragem (1.5x) e injeção do Teorema de Ruína sob alta complexidade.',
    defaultParams: { simulations_count: 10000, confidence_level: 0.95 },
  },
  {
    id: 'timesfm',
    name: 'Google TimesFM 2.5 / 3.0',
    badge: 'Time Series Foundation',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-400/40 text-purple-300',
    description: 'Expansão de horizonte preditivo de EV e focalização em quantil de cauda (q90 vs q50).',
    defaultParams: { horizon: 15, mode: 'commercial' },
  },
  {
    id: 'dream-rsi',
    name: 'Google Dream-RSI (Recursive Self-Improvement)',
    badge: 'Autonomous Discovery',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-300',
    description: 'Poda preditiva antecipada de ramos da árvore e calibração de barreira termodinâmica.',
    defaultParams: { pruning_margin: 0.05, s1_pruning_threshold: 0.25 },
  },
  {
    id: 'pluribus',
    name: 'Pluribus (Depth-Limited)',
    badge: 'Multiway Solver',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-400/40 text-rose-300',
    description: 'Multiplicador de profundidade de busca e calibração do coeficiente lambda de adversários.',
    defaultParams: { iterations: 1000, lambda_factor: 1.2 },
  },
];

const PRESET_SCENARIOS = [
  {
    label: 'Bolha de FT (88 no SB vs Shove do Chip Leader)',
    state:
      'Final table bubble. Hero has 12bb in SB with 8c8d. Chip leader pushes all-in from cutoff. Risk of immediate bustout before payjump.',
    solver: 'cfr-plus',
  },
  {
    label: 'Flop Seco em Posição (AhKd em 2c 7d Jh)',
    state:
      'Hero is in BB with AhKd. Flop is 2c 7d Jh. Pot 100, villain bets 50. High showdown equity but polarized turn pressure.',
    solver: 'monte-carlo',
  },
  {
    label: 'Série Temporal de Bankroll & Decaimento de EV',
    state: 'Multi-session MTT variance telemetry showing downward drift after bubble bursts with high ICM risk.',
    solver: 'timesfm',
  },
  {
    label: 'Simulação Evolving World & Poda Preditiva',
    state: 'Exploration of deep game tree branches with severe ICM penalty. Candidate branch evaluated for pruning.',
    solver: 'dream-rsi',
  },
];

interface LayaStatusStripProps {
  readonly serviceStatus: ServiceStatus;
  readonly onRefreshStatus: () => void;
}

function LayaStatusStrip({ serviceStatus, onRefreshStatus }: Readonly<LayaStatusStripProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <GlassPanel className="border-cyan-500/30 bg-cyan-950/20 p-4">
        <div className="text-text-muted mb-1 flex items-center justify-between font-mono text-xs tracking-wider uppercase">
          <span>Modelo Canônico</span>
          <i className="fa-solid fa-cube text-cyan-400" />
        </div>
        <div className="truncate text-sm font-black text-cyan-200" title={CANONICAL_LAYA_REPO}>
          {CANONICAL_LAYA_MODEL} (322M)
        </div>
        <div className="text-text-muted mt-1 font-mono text-xs">mmBERT-base · RLCD Calibrated</div>
      </GlassPanel>

      <GlassPanel
        className={`border p-4 transition-all ${
          serviceStatus.status === 'ONLINE'
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : 'border-amber-500/40 bg-amber-950/20'
        }`}
      >
        <div className="text-text-muted mb-1 flex items-center justify-between font-mono text-xs tracking-wider uppercase">
          <span>Pesos Neurais</span>
          <button
            type="button"
            onClick={onRefreshStatus}
            title="Atualizar status dos pesos"
            className="text-white/60 hover:text-white"
          >
            <i className="fa-solid fa-arrows-rotate text-xs" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              serviceStatus.status === 'ONLINE' ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <div
            className={`truncate text-base font-black ${
              serviceStatus.status === 'ONLINE' ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {serviceStatus.status === 'ONLINE' ? 'Pesos 322M Ativos' : 'Simulação Heurística'}
          </div>
        </div>
        <div className="text-text-muted mt-1 flex items-center justify-between font-mono text-xs">
          <span>{serviceStatus.status === 'ONLINE' ? 'Porta 8192 (FastAPI)' : 'Fallback TS Ativo'}</span>
          <span className="text-[10px] opacity-75">
            {serviceStatus.latency_ms ? `${serviceStatus.latency_ms}ms` : ''}
          </span>
        </div>
      </GlassPanel>

      <GlassPanel className="border-purple-500/30 bg-purple-950/20 p-4">
        <div className="text-text-muted mb-1 flex items-center justify-between font-mono text-xs tracking-wider uppercase">
          <span>Router Cache</span>
          <i className="fa-solid fa-memory text-purple-400" />
        </div>
        <div className="text-xl font-black text-purple-300">Memória Ativa</div>
        <div className="text-text-muted mt-1 font-mono text-xs">Speedup de 100x vs recarga</div>
      </GlassPanel>

      <GlassPanel className="border-amber-500/30 bg-amber-950/20 p-4">
        <div className="text-text-muted mb-1 flex items-center justify-between font-mono text-xs tracking-wider uppercase">
          <span>Solvers Acoplados</span>
          <i className="fa-solid fa-network-wired text-amber-400" />
        </div>
        <div className="text-xl font-black text-amber-300">4 Pilares + 2 SOTA</div>
        <div className="text-text-muted mt-1 font-mono text-xs">CFR+, MC, TimesFM, Dream-RSI</div>
      </GlassPanel>
    </div>
  );
}

interface LayaNavTabsProps {
  readonly activeTab: LayaTab;
  readonly onSelectTab: (tab: LayaTab) => void;
}

function LayaNavTabs({ activeTab, onSelectTab }: Readonly<LayaNavTabsProps>) {
  return (
    <div className="flex space-x-2 border-b border-white/10 pb-2">
      <button
        type="button"
        onClick={() => onSelectTab('workbench')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
          activeTab === 'workbench'
            ? 'bg-accent-indigo-surface text-white shadow-lg shadow-indigo-500/20'
            : 'text-text-muted hover:bg-white/5 hover:text-white'
        }`}
      >
        <i className="fa-solid fa-sliders" /> Workbench Interativo
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('telemetria')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
          activeTab === 'telemetria'
            ? 'bg-accent-indigo-surface text-white shadow-lg shadow-indigo-500/20'
            : 'text-text-muted hover:bg-white/5 hover:text-white'
        }`}
      >
        <i className="fa-solid fa-chart-column" /> Telemetria de Homologação
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('deploy')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
          activeTab === 'deploy'
            ? 'bg-accent-indigo-surface text-white shadow-lg shadow-indigo-500/20'
            : 'text-text-muted hover:bg-white/5 hover:text-white'
        }`}
      >
        <i className="fa-solid fa-server" /> Deploy & Microserviço GPU
      </button>
    </div>
  );
}

interface LayaWeightsCalloutProps {
  readonly weightsLoaded: boolean;
  readonly serviceStatus: ServiceStatus;
  readonly onExecuteBridge: () => void;
  readonly loading: boolean;
  readonly onRefreshStatus: () => void;
  readonly copyToClipboard: (text: string, key: string) => void;
  readonly copiedKey: string | null;
}

function LayaWeightsCallout({
  weightsLoaded,
  serviceStatus,
  onExecuteBridge,
  loading,
  onRefreshStatus,
  copyToClipboard,
  copiedKey,
}: Readonly<LayaWeightsCalloutProps>) {
  if (weightsLoaded) {
    return (
      <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
          <i className="fa-solid fa-circle-check" /> Checkpoint Canônico 322M Ativo
        </div>
        <p className="text-text-muted mt-1 leading-tight">
          Inferência não-autorregressiva real. Os sinais RLCD e a barreira de ruína foram calculados a partir dos
          tensores neurais reais.
        </p>
      </div>
    );
  }

  if (serviceStatus.status === 'ONLINE') {
    return (
      <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-2.5 text-[11px]">
        <div className="mb-1 flex items-center justify-between gap-1.5 font-bold text-cyan-300">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info" /> Microserviço 322M Online na Porta 8192
          </span>
          <span className="rounded border border-cyan-500/30 bg-cyan-950/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400">
            {serviceStatus.latency_ms ? `${serviceStatus.latency_ms}ms` : 'Ativo'}
          </span>
        </div>
        <p className="text-text-muted mb-2 leading-tight">
          O microserviço está ativo no host. Esta execução anterior utilizou a simulação Edge. Clique abaixo para
          executar diretamente com os tensores neurais reais.
        </p>
        <button
          type="button"
          onClick={onExecuteBridge}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1.5 text-xs font-bold text-cyan-200 transition-all hover:bg-white/10 hover:text-white"
        >
          <i className="fa-solid fa-bolt" /> Re-executar com Pesos Reais (322M)
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/30 p-2.5 text-[11px]">
      <div className="mb-1 flex items-center justify-between gap-1.5 font-bold text-amber-300">
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-lightbulb" /> Para ativar Pesos Carregados = true:
        </span>
        <button
          type="button"
          onClick={onRefreshStatus}
          title="Verificar status agora"
          className="text-[10px] text-amber-300/80 underline hover:text-white"
        >
          Verificar Status
        </button>
      </div>
      <p className="text-text-muted mb-2 leading-tight">
        O microserviço de pesos reais (322M) opera na porta 8192. Para iniciá-lo no host:
      </p>
      <div className="flex items-center justify-between rounded border border-white/5 bg-black/60 px-2 py-1 font-mono text-[10px] text-cyan-300">
        <span className="truncate">pwsh scripts/ops/Start-LayaService.ps1</span>
        <button
          type="button"
          onClick={() => copyToClipboard('pwsh scripts/ops/Start-LayaService.ps1', 'start-service')}
          className="ml-2 shrink-0 text-white/60 hover:text-white"
          title="Copiar comando"
        >
          <i className={`fa-solid ${copiedKey === 'start-service' ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
        </button>
      </div>
    </div>
  );
}

interface LayaWorkbenchTabProps {
  readonly selectedSolverId: string;
  readonly onSelectSolver: (id: string) => void;
  readonly stateInput: string;
  readonly onChangeStateInput: (val: string) => void;
  readonly loading: boolean;
  readonly error: string | null;
  readonly activeSolver: SolverConfig;
  readonly bridgeResult: LayaSolverBridgePayload | null;
  readonly serviceStatus: ServiceStatus;
  readonly onExecuteBridge: () => void;
  readonly onRefreshStatus: () => void;
  readonly copyToClipboard: (text: string, key: string) => void;
  readonly copiedKey: string | null;
}

function LayaWorkbenchTab({
  selectedSolverId,
  onSelectSolver,
  stateInput,
  onChangeStateInput,
  loading,
  error,
  activeSolver,
  bridgeResult,
  serviceStatus,
  onExecuteBridge,
  onRefreshStatus,
  copyToClipboard,
  copiedKey,
}: Readonly<LayaWorkbenchTabProps>) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Configuration & Controls */}
      <div className="space-y-6 lg:col-span-5">
        <GlassPanel className="border-white/10 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <i className="fa-solid fa-bullseye text-cyan-400" /> 1. Selecione o Solver Analítico
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {SOLVERS_CONFIG.map((solver) => {
              const isSelected = solver.id === selectedSolverId;
              return (
                <button
                  key={solver.id}
                  type="button"
                  onClick={() => onSelectSolver(solver.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? `bg-white/10 ${solver.color} shadow-md`
                      : 'text-text-muted border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{solver.name}</span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 font-mono text-[10px]">
                      {solver.badge}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 text-xs leading-relaxed">{solver.description}</p>
                </button>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="border-white/10 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <i className="fa-solid fa-file-lines text-amber-400" /> 2. Estado / Hand History
            </h2>
            <span className="text-text-muted font-mono text-xs">{stateInput.length} caracteres</span>
          </div>

          {/* Presets */}
          <div className="mb-3">
            <label htmlFor="preset-select" className="text-text-muted mb-1 block font-mono text-xs">
              Cenários Prontos:
            </label>
            <select
              id="preset-select"
              aria-label="Cenários Prontos"
              className="text-text-bright w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs focus:border-cyan-400 focus:outline-none"
              onChange={(e) => {
                const preset = PRESET_SCENARIOS[Number(e.target.value)];
                if (preset) {
                  onChangeStateInput(preset.state);
                  onSelectSolver(preset.solver);
                }
              }}
            >
              {PRESET_SCENARIOS.map((p, idx) => (
                <option key={p.label} value={idx} className="bg-bg-elevated text-text-bright">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={stateInput}
            onChange={(e) => onChangeStateInput(e.target.value)}
            rows={4}
            placeholder="Descreva o estado do jogo, spot, ação ou parâmetros para o Laya System-1..."
            className="text-text-bright w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm leading-relaxed focus:border-cyan-400 focus:outline-none"
          />

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-text-muted font-mono text-xs">
              Endpoint: <code className="text-cyan-300">/api/sota/laya/solve</code>
            </div>
            <SotaButton onClick={onExecuteBridge} disabled={loading || !stateInput.trim()} className="px-6 py-2">
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2" /> Modulando S1...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play mr-2" /> Executar Modulação
                </>
              )}
            </SotaButton>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
              <i className="fa-solid fa-triangle-exclamation mr-1.5" />
              {error}
            </div>
          )}
        </GlassPanel>
      </div>

      {/* Right Column: Visual Feedback & Modulation Diff */}
      <div className="space-y-6 lg:col-span-7">
        {bridgeResult ? (
          <>
            {/* Top Gauges: RLCD Signals */}
            <GlassPanel className="border-cyan-500/30 bg-cyan-950/10 p-6">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <i className="fa-solid fa-wave-square text-cyan-400" /> Sinais Neurais System-1 (RLCD Calibrated)
                  </h3>
                  <p className="text-text-muted text-xs">
                    Sinais derivados do forward pass direto no checkpoint mmBERT-base de 322M.
                  </p>
                </div>
                <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
                  {bridgeResult.target_solver.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Noul Gauge */}
                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-center">
                  <div className="text-text-muted mb-1 font-mono text-[11px] uppercase">Prob. Noul</div>
                  <div className="text-2xl font-black text-cyan-300">
                    {bridgeResult.s1_prediction.noul?.toFixed(4) ?? 'N/A'}
                  </div>
                  <div className="text-text-muted mt-0.5 text-[10px]">
                    {bridgeResult.s1_prediction.noul && bridgeResult.s1_prediction.noul > 0.6
                      ? 'Baixo Risco'
                      : 'Incerteza / Risco'}
                  </div>
                </div>

                {/* Choice Badge */}
                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-center">
                  <div className="text-text-muted mb-1 font-mono text-[11px] uppercase">Decisão (Choice)</div>
                  <div className="truncate text-lg font-black text-amber-300 capitalize">
                    {bridgeResult.s1_prediction.choice ?? 'N/A'}
                  </div>
                  <div className="text-text-muted mt-0.5 text-[10px]">Triagem Categórica</div>
                </div>

                {/* Score */}
                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-center">
                  <div className="text-text-muted mb-1 font-mono text-[11px] uppercase">Score Contínuo</div>
                  <div className="text-2xl font-black text-emerald-300">
                    {bridgeResult.s1_prediction.score?.toFixed(3) ?? 'N/A'}
                  </div>
                  <div className="text-text-muted mt-0.5 text-[10px]">Intensidade S1</div>
                </div>

                {/* Ruin Priority (Vitoi) */}
                <div className="rounded-lg border border-white/5 bg-black/40 p-3 text-center">
                  <div className="text-text-muted mb-1 font-mono text-[11px] uppercase">Prior de Ruína</div>
                  <div className="text-2xl font-black text-rose-300">{bridgeResult.ruin_priority.toFixed(3)}x</div>
                  <div className="text-text-muted mt-0.5 text-[10px]">Barreira de Ruína</div>
                </div>
              </div>
            </GlassPanel>

            {/* Comparison Diff Matrix */}
            <GlassPanel className="border-white/10 p-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
                <i className="fa-solid fa-code-compare text-emerald-400" /> Modulação de Parâmetros (Antes vs Adaptado
                pelo S1)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-text-muted border-b border-white/10 tracking-wider uppercase">
                      <th className="px-3 py-2">Parâmetro</th>
                      <th className="px-3 py-2">Valor Base</th>
                      <th className="px-3 py-2">Modulado Laya S1</th>
                      <th className="px-3 py-2">Efeito Analítico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Object.entries(bridgeResult.adapted_parameters).map(([key, val]) => {
                      const baseVal = activeSolver.defaultParams[key];
                      const isModified = baseVal !== undefined && baseVal !== val;
                      return (
                        <tr key={key} className={isModified ? 'bg-emerald-950/20' : ''}>
                          <td className="px-3 py-2.5 font-bold text-cyan-200">{key}</td>
                          <td className="text-text-muted px-3 py-2.5">{String(baseVal ?? '—')}</td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded px-2 py-0.5 ${
                                isModified
                                  ? 'border border-emerald-500/30 bg-emerald-500/20 font-bold text-emerald-300'
                                  : 'text-text-bright'
                              }`}
                            >
                              {String(val)}
                            </span>
                          </td>
                          <td className="text-text-muted px-3 py-2.5">
                            {isModified ? (
                              <span className="text-emerald-400">
                                <i className="fa-solid fa-arrow-trend-up mr-1" /> Ajustado por S1
                              </span>
                            ) : (
                              'Preservado'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassPanel>

            {/* Framework Signals & Provenance Accordion */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GlassPanel className="border-white/10 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-white uppercase">
                  <i className="fa-solid fa-tower-broadcast text-purple-400" /> Sinais Emitidos para o Solver
                </h4>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(bridgeResult.framework_signals).map(([sigKey, sigVal]) => (
                    <div
                      key={sigKey}
                      className="flex items-center justify-between rounded border border-white/5 bg-black/40 p-2"
                    >
                      <span className="text-text-muted">{sigKey}</span>
                      <span className="font-bold text-purple-300">{String(sigVal)}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="border-white/10 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-white uppercase">
                  <i className="fa-solid fa-stamp text-amber-400" /> Contrato de Proveniência §4
                </h4>
                <div className="text-text-muted space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-white/60">Engine ID:</span>{' '}
                    <span className="text-amber-200">{bridgeResult.provenia.engine_id}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Runtime:</span>{' '}
                    <span className="text-white">{bridgeResult.provenia.runtime_used}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Pesos Carregados:</span>{' '}
                    <span
                      className={
                        bridgeResult.provenia.weights_loaded ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'
                      }
                    >
                      {bridgeResult.provenia.weights_loaded ? (
                        <>
                          <i className="fa-solid fa-circle-check mr-1" /> true (mmBERT 322M)
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-triangle-exclamation mr-1" /> false (Fallback Heurístico S1)
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Fallback Ativo:</span>{' '}
                    <span
                      className={bridgeResult.provenia.fallback_used ? 'text-amber-300' : 'font-bold text-emerald-400'}
                    >
                      {bridgeResult.provenia.fallback_used
                        ? 'true (Simulação Edge TS)'
                        : 'false (Inferência Neural Direta)'}
                    </span>
                  </div>
                  {bridgeResult.s1_prediction?.latency_ms !== undefined && (
                    <div>
                      <span className="text-white/60">Latência Neural:</span>{' '}
                      <span className="font-bold text-cyan-300">
                        {bridgeResult.s1_prediction.latency_ms.toFixed(1)} ms
                      </span>
                    </div>
                  )}
                  <div className="text-text-muted truncate pt-1 text-[10px]">
                    Assunções: {bridgeResult.provenia.assumptions.join(', ')}
                  </div>
                </div>

                {/* Callout de Mitigação / Status dos Pesos */}
                <LayaWeightsCallout
                  weightsLoaded={bridgeResult.provenia.weights_loaded}
                  serviceStatus={serviceStatus}
                  onExecuteBridge={onExecuteBridge}
                  loading={loading}
                  onRefreshStatus={onRefreshStatus}
                  copyToClipboard={copyToClipboard}
                  copiedKey={copiedKey}
                />
              </GlassPanel>
            </div>
          </>
        ) : (
          <GlassPanel className="flex min-h-90 flex-col items-center justify-center border-dashed border-white/10 p-12 text-center">
            <i className="fa-solid fa-microchip mb-4 text-4xl text-white/20" />
            <h3 className="mb-2 text-base font-bold text-white">Pronto para Modulação S1</h3>
            <p className="text-text-muted mb-6 max-w-md text-xs leading-relaxed">
              Escolha um dos 4 pilares analíticos (CFR+, Monte Carlo, TimesFM, Dream-RSI) e clique em{' '}
              <strong>Executar Modulação</strong> para inspecionar os parâmetros adaptados em tempo real.
            </p>
            <SotaButton onClick={onExecuteBridge} className="px-6 py-2">
              <i className="fa-solid fa-play mr-2" /> Testar com Cenário Padrão
            </SotaButton>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}

function LayaTelemetryTab() {
  return (
    <div className="space-y-6">
      <GlassPanel className="border-white/10 p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
          <i className="fa-solid fa-chart-line text-emerald-400" /> Benchmarks Medidos de Homologação (Local vs GPU
          Target)
        </h3>
        <p className="text-text-muted mb-6 text-xs leading-relaxed">
          Resultados obtidos via execução de{' '}
          <code className="text-cyan-300">scripts/ops/homologar_laya_gpu.py --allow-cpu</code> contra o checkpoint
          canônico 322M.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="text-text-muted font-mono text-xs uppercase">Tempo de Warmup</div>
            <div className="mt-1 text-2xl font-black text-white">28.74 s</div>
            <div className="text-text-muted mt-1 text-[11px]">Download & carga do modelo de 322M (feita 1x)</div>
          </div>

          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="text-text-muted font-mono text-xs uppercase">Latência Média ($p_{'{50}'}$)</div>
            <div className="mt-1 text-2xl font-black text-emerald-300">234.84 ms</div>
            <div className="text-text-muted mt-1 text-[11px]">CPU de validação (100x mais rápido que sem cache)</div>
          </div>

          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="text-text-muted font-mono text-xs uppercase">Vazão Concorrente (Batch 9)</div>
            <div className="mt-1 text-2xl font-black text-cyan-300">4.35 req/s</div>
            <div className="text-text-muted mt-1 text-[11px]">Meta em GPU (L4 / A10G): &gt; 45.0 req/s</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-text-muted border-b border-white/10 tracking-wider uppercase">
                <th className="px-3 py-2.5">Lote (Batch)</th>
                <th className="px-3 py-2.5">Requisições</th>
                <th className="px-3 py-2.5">Tempo Total (ms)</th>
                <th className="px-3 py-2.5">Latência Média</th>
                <th className="px-3 py-2.5">Vazão (req/s)</th>
                <th className="px-3 py-2.5">VRAM Alocada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-3 py-2.5 font-bold text-white">Batch 1</td>
                <td className="text-text-muted px-3 py-2.5">1</td>
                <td className="px-3 py-2.5 text-white">242.0 ms</td>
                <td className="px-3 py-2.5 text-emerald-400">242.0 ms</td>
                <td className="px-3 py-2.5 text-cyan-300">4.13 req/s</td>
                <td className="text-text-muted px-3 py-2.5">0.0 MB (CPU)</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-white">Batch 4</td>
                <td className="text-text-muted px-3 py-2.5">4</td>
                <td className="px-3 py-2.5 text-white">931.2 ms</td>
                <td className="px-3 py-2.5 text-emerald-400">232.8 ms</td>
                <td className="px-3 py-2.5 text-cyan-300">4.30 req/s</td>
                <td className="text-text-muted px-3 py-2.5">0.0 MB (CPU)</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-white">Batch 9</td>
                <td className="text-text-muted px-3 py-2.5">9</td>
                <td className="px-3 py-2.5 text-white">2071.0 ms</td>
                <td className="px-3 py-2.5 text-emerald-400">230.1 ms</td>
                <td className="px-3 py-2.5 text-cyan-300">4.35 req/s</td>
                <td className="text-text-muted px-3 py-2.5">0.0 MB (CPU)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

interface LayaDeployTabProps {
  readonly copyToClipboard: (text: string, key: string) => void;
  readonly copiedKey: string | null;
}

function LayaDeployTab({ copyToClipboard, copiedKey }: Readonly<LayaDeployTabProps>) {
  return (
    <div className="space-y-6">
      <GlassPanel className="border-white/10 p-6">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
          <i className="fa-solid fa-server text-cyan-400" /> Comandos de Deploy e Microserviço GPU
        </h3>
        <p className="text-text-muted mb-6 text-xs leading-relaxed">
          Receitas canônicas para subir o motor de inferência Laya Multilingual com aceleração por hardware NVIDIA CUDA.
        </p>

        <div className="space-y-4">
          {/* Local Host Execution */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300">
                <i className="fa-solid fa-terminal" /> Execução Local no Host (PowerShell — CPU Override / GPU):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('pwsh scripts/ops/Start-LayaService.ps1', 'local-ps')}
                className="font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'local-ps' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="text-text-muted overflow-x-auto rounded bg-black/60 p-2 font-mono text-xs">
              pwsh scripts/ops/Start-LayaService.ps1
            </pre>
            <p className="text-text-muted mt-2 text-[11px]">
              Inicia o microserviço FastAPI na porta 8192 com pesos de 322M carregados, detecção automática de CUDA e
              fallback para CPU cacheado em memória.
            </p>
          </div>

          {/* Docker Run */}
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">Docker Run com Passthrough NVIDIA:</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'docker run --gpus all -d -p 8192:8192 --name laya-gpu nexus-sota/laya-multilingual-gpu:latest',
                    'docker',
                  )
                }
                className="font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'docker' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="text-text-muted overflow-x-auto rounded bg-black/60 p-2 font-mono text-xs">
              docker run --gpus all -d -p 8192:8192 --name laya-gpu nexus-sota/laya-multilingual-gpu:latest
            </pre>
          </div>

          {/* Docker Compose */}
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">
                Docker Compose (tools/laya_service/docker-compose.gpu.yml):
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard('docker compose -f tools/laya_service/docker-compose.gpu.yml up -d', 'compose')
                }
                className="font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'compose' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="text-text-muted overflow-x-auto rounded bg-black/60 p-2 font-mono text-xs">
              docker compose -f tools/laya_service/docker-compose.gpu.yml up -d
            </pre>
          </div>

          {/* GCP GCE */}
          <div className="rounded-lg border border-white/5 bg-black/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">
                Provisionamento GCP Compute Engine (NVIDIA L4 / T4):
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'gcloud compute instances create sota-laya-inference-node --zone=us-central1-a --machine-type=g2-standard-4 --accelerator=type=nvidia-l4,count=1',
                    'gcp',
                  )
                }
                className="font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'gcp' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="text-text-muted overflow-x-auto rounded bg-black/60 p-2 font-mono text-xs">
              gcloud compute instances create sota-laya-inference-node --zone=us-central1-a --machine-type=g2-standard-4
              --accelerator=type=nvidia-l4,count=1
            </pre>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

export default function LayaSolverBridgePage() {
  const [selectedSolverId, setSelectedSolverId] = useState<string>('cfr-plus');
  const [stateInput, setStateInput] = useState<string>(PRESET_SCENARIOS[0]?.state || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [bridgeResult, setBridgeResult] = useState<LayaSolverBridgePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LayaTab>('workbench');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({ status: 'CHECKING', weights_loaded: false });

  const refreshServiceStatus = useCallback(async () => {
    try {
      const json = await fetchJson<ServiceStatus>('/api/sota/laya/status', {
        timeoutMs: 6_000,
      });
      if (json) {
        setServiceStatus(json);
      } else {
        setServiceStatus({ status: 'OFFLINE', weights_loaded: false, reason: 'Resposta vazia' });
      }
    } catch (err: unknown) {
      if (err instanceof ClientFetchError) {
        setServiceStatus({ status: 'OFFLINE', weights_loaded: false, reason: `HTTP ${err.status}` });
        return;
      }
      setServiceStatus({ status: 'OFFLINE', weights_loaded: false, reason: 'Microserviço inacessível' });
    }
  }, []);

  useEffect(() => {
    void refreshServiceStatus();
  }, [refreshServiceStatus]);

  const activeSolver: SolverConfig =
    SOLVERS_CONFIG.find((s) => s.id === selectedSolverId) ?? (SOLVERS_CONFIG[0] as SolverConfig);

  const handleExecuteBridge = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchJson<{
        status?: string;
        error?: string;
        bridge_result?: LayaSolverBridgePayload;
      }>('/api/sota/laya/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solver_name: selectedSolverId,
          state: stateInput,
          base_parameters: activeSolver.defaultParams,
        }),
        timeoutMs: 20_000,
      });

      if (!json || json.status === 'ERROR' || !json.bridge_result) {
        throw new Error(json?.error || 'Resposta inválida do gateway Laya.');
      }
      setBridgeResult(json.bridge_result);
      // Atualiza o indicador de status em tempo real após a modulação
      void refreshServiceStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na requisição da rota /api/sota/laya/solve';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen overflow-x-hidden pb-24">
      <ContentPageHeader
        title="Laya Multilingual S1 — Solver Bridge"
        subtitle="Painel de Modulação Analítica System-1 & Telemetria GPU (Checkpoint Canônico 322M)"
        category="Área Restrita Dev / Admin"
        icon="fa-microchip"
      />

      <div className="sota-container relative z-10 -mt-8 space-y-8">
        <LayaStatusStrip serviceStatus={serviceStatus} onRefreshStatus={refreshServiceStatus} />

        <LayaNavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {activeTab === 'workbench' && (
          <LayaWorkbenchTab
            selectedSolverId={selectedSolverId}
            onSelectSolver={setSelectedSolverId}
            stateInput={stateInput}
            onChangeStateInput={setStateInput}
            loading={loading}
            error={error}
            activeSolver={activeSolver}
            bridgeResult={bridgeResult}
            serviceStatus={serviceStatus}
            onExecuteBridge={handleExecuteBridge}
            onRefreshStatus={refreshServiceStatus}
            copyToClipboard={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}

        {activeTab === 'telemetria' && <LayaTelemetryTab />}

        {activeTab === 'deploy' && <LayaDeployTab copyToClipboard={copyToClipboard} copiedKey={copiedKey} />}
      </div>
    </div>
  );
}
