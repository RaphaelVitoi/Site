'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';

export interface ObservatoryPoolSummary {
  pool: string;
  total_vars: number;
  synced: number;
  invalid_fmt: number;
  role: string;
  policy: string;
  health_label: string;
  avg_latency_ms: number | null;
}

export interface ObservatoryEntry {
  pool: string;
  variable: string;
  mask: string;
  sha8: string;
  sync: string;
  process: string;
  format_valid: boolean | null;
  health_label: string;
  health_ok: boolean | null;
  latency_ms: number | null;
  role_hint: string;
}

export interface ObservatoryAnomaly {
  severity: string;
  variable: string;
  pool: string;
  issue: string;
}

export interface ObservatorySnapshot {
  timestamp: string;
  mode: 'offline' | 'live';
  total_vars: number;
  total_synced: number;
  anomalies_count: number;
  fails_count: number;
  warns_count: number;
  p95_latency_ms: number | null;
  openrouter_runtime_keys: number;
  summaries: ObservatoryPoolSummary[];
  entries: ObservatoryEntry[];
  anomalies: ObservatoryAnomaly[];
}

const POOL_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'OpenRouter', value: 'OpenRouter' },
  { label: 'Gemini', value: 'Gemini' },
  { label: 'Decision', value: 'Decision' },
  { label: 'Multimodal', value: 'Multimodal' },
  { label: 'Ollama', value: 'Ollama' },
  { label: 'Ecossistema', value: 'Ecossistema' },
] as const;

function latencyTone(ms: number | null): string {
  if (ms === null) return 'text-text-muted';
  if (ms < 350) return 'text-emerald-300';
  if (ms < 1000) return 'text-amber-300';
  return 'text-rose-300';
}

function buildKeyPoolsRequest(live: boolean, filter: string): { url: string; init: RequestInit } {
  if (live) {
    return {
      url: '/api/sota/key-pools',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ live: true, pool: filter }),
        cache: 'no-store',
      },
    };
  }
  const url = filter ? `/api/sota/key-pools?pool=${encodeURIComponent(filter)}` : '/api/sota/key-pools';
  return { url, init: { cache: 'no-store' } };
}

function formatHygieneSummary(data: ObservatorySnapshot | null, hygieneOk: boolean): string {
  if (!data) return '—';
  if (hygieneOk) return 'OK';
  return `${data.fails_count}F / ${data.warns_count}W`;
}

function formatP95Latency(p95: number | null | undefined): string {
  if (p95 === null || p95 === undefined) return '—';
  return `${p95} ms`;
}

function KeyPoolsGuideCard() {
  return (
    <div className="text-text-muted mt-4 space-y-1.5 rounded-xl border border-cyan-500/20 bg-slate-900/80 p-4 text-xs">
      <div className="text-sm font-bold text-cyan-300">Arquitetura de Pools &amp; Otimização Ida/Volta</div>
      <p className="m-0">
        • <strong>Isolamento por Tier:</strong> <code>@chico</code> usa Tier 1 (5 chaves, sem degradação);{' '}
        <code>@maverick</code> usa Tier 2 (10 chaves → T4/T1); batch/compressão usa Tier 3 (5 chaves → Ollama local);
        subagentes usam Tier 4 (5 chaves → T3).
      </p>
      <p className="m-0">
        • <strong>Ponte Legada Segura:</strong> <code>OPENROUTER_API_KEY</code> espelha{' '}
        <code>OPENROUTER_TIER4_KEY_1</code> (protege Tier 1); <code>OLLAMA_CLOUD_KEY</code> atua como backup de{' '}
        <code>OLLAMA_API_KEY</code> em <code>OLLAMA_KEYS</code>.
      </p>
      <p className="m-0">
        • <strong>Cotas AI Studio vs OpenRouter:</strong> Chaves <code>GEMINI_*</code> e <code>DECISION_API_*</code>{' '}
        dividem cota no projeto GCP <code>913870412920</code> (rotação = resiliência); OpenRouter isola cota por chave e
        recebe feedback bidirecional (HTTP 200/401/402/429/5xx + latência) em tempo real.
      </p>
    </div>
  );
}

function PoolTopologyGrid({ summaries }: Readonly<{ summaries: readonly ObservatoryPoolSummary[] }>) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
      {summaries.map((s) => {
        const badgeTone =
          s.synced === s.total_vars && s.invalid_fmt === 0
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300';
        const latLabel = s.avg_latency_ms !== null ? `${s.avg_latency_ms} ms` : '—';
        return (
          <div key={s.pool} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">{s.pool}</span>
              <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${badgeTone}`}>
                {s.synced}/{s.total_vars} sync
              </span>
            </div>
            <p className="text-text-muted mt-1 mb-2 text-xs">{s.role}</p>
            <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px]">
              <span className="text-cyan-300">{s.health_label}</span>
              <span className={latencyTone(s.avg_latency_ms)}>{latLabel}</span>
            </div>
            <div className="text-text-muted mt-1 text-[11px]">{s.policy}</div>
          </div>
        );
      })}
    </div>
  );
}

function MaskedInventoryTable({ entries }: Readonly<{ entries: readonly ObservatoryEntry[] }>) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/30">
      <table className="w-full text-left text-xs">
        <thead className="text-text-muted bg-white/5 text-[10px] uppercase">
          <tr>
            <th className="px-3 py-2.5">Pool</th>
            <th className="px-3 py-2.5">Variável</th>
            <th className="px-3 py-2.5">Chave (Mask)</th>
            <th className="px-3 py-2.5">sha8</th>
            <th className="px-3 py-2.5">Sync</th>
            <th className="px-3 py-2.5">Saúde</th>
            <th className="px-3 py-2.5 text-right">Latência</th>
            <th className="px-3 py-2.5">Papel</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {entries.map((entry) => {
            const syncTone = entry.sync === 'SYNCED' ? 'text-emerald-300' : 'text-amber-300';
            const healthTone = entry.health_ok === false ? 'text-rose-300' : 'text-emerald-300';
            const latLabel = entry.latency_ms !== null ? `${entry.latency_ms} ms` : '—';
            return (
              <tr key={entry.variable} className="hover:bg-white/5">
                <td className="px-3 py-2 whitespace-nowrap text-cyan-300">{entry.pool}</td>
                <td className="px-3 py-2 font-mono font-semibold whitespace-nowrap text-white">{entry.variable}</td>
                <td className="text-text-muted px-3 py-2 font-mono whitespace-nowrap">{entry.mask}</td>
                <td className="px-3 py-2 font-mono whitespace-nowrap text-fuchsia-300">{entry.sha8}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={syncTone}>{entry.sync}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={healthTone}>{entry.health_label}</span>
                </td>
                <td className={`px-3 py-2 text-right font-mono whitespace-nowrap ${latencyTone(entry.latency_ms)}`}>
                  {latLabel}
                </td>
                <td className="text-text-muted px-3 py-2">{entry.role_hint}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnomaliesAlertBox({ anomalies }: Readonly<{ anomalies: readonly ObservatoryAnomaly[] }>) {
  if (anomalies.length === 0) return null;
  return (
    <div className="mt-4 space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-100">
      <div className="font-bold text-amber-300">Anomalias detectadas ({anomalies.length})</div>
      {anomalies.map((a) => (
        <div key={`${a.severity}-${a.variable}-${a.issue}`}>
          <span className="font-mono font-bold">[{a.severity}]</span> <strong>{a.variable}</strong> ({a.pool}):{' '}
          {a.issue}
        </div>
      ))}
    </div>
  );
}

interface KeyPoolsKpiStripProps {
  syncAllOk: boolean;
  syncLabel: string;
  healthPoolLabel: string;
  p95Ms: number | null;
  p95Label: string;
  hygieneOk: boolean;
  hygieneLabel: string;
}

function KeyPoolsKpiStrip({
  syncAllOk,
  syncLabel,
  healthPoolLabel,
  p95Ms,
  p95Label,
  hygieneOk,
  hygieneLabel,
}: Readonly<KeyPoolsKpiStripProps>) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-text-muted text-[11px] font-bold tracking-wider uppercase">Sync HKCU/HKLM</div>
        <div className={`mt-1 text-2xl font-black ${syncAllOk ? 'text-emerald-300' : 'text-amber-300'}`}>
          {syncLabel}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-text-muted text-[11px] font-bold tracking-wider uppercase">Saúde do Pool</div>
        <div className="mt-1 text-2xl font-black text-white">{healthPoolLabel}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-text-muted text-[11px] font-bold tracking-wider uppercase">Latência P95</div>
        <div className={`mt-1 text-2xl font-black ${latencyTone(p95Ms)}`}>{p95Label}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-text-muted text-[11px] font-bold tracking-wider uppercase">Higiene &amp; Alertas</div>
        <div className={`mt-1 text-2xl font-black ${hygieneOk ? 'text-emerald-300' : 'text-amber-300'}`}>
          {hygieneLabel}
        </div>
      </div>
    </div>
  );
}

interface KeyPoolsFilterBarProps {
  poolFilter: string;
  onSelectPool: (value: string) => void;
  inventoryButtonLabel: string;
  onToggleInventory: () => void;
}

function KeyPoolsFilterBar({
  poolFilter,
  onSelectPool,
  inventoryButtonLabel,
  onToggleInventory,
}: Readonly<KeyPoolsFilterBarProps>) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {POOL_FILTERS.map((f) => {
          const active = poolFilter === f.value;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onSelectPool(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                active
                  ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200'
                  : 'text-text-muted border-white/10 bg-white/5 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onToggleInventory}
        className="rounded-lg border border-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/5"
      >
        {inventoryButtonLabel}
      </button>
    </div>
  );
}

export function NexusKeyPoolsPanel() {
  const [data, setData] = useState<ObservatorySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [probingLive, setProbingLive] = useState(false);
  const [poolFilter, setPoolFilter] = useState<string>('');
  const [showInventory, setShowInventory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState('');

  const fetchSnapshot = useCallback(async (live = false, filter = '') => {
    if (live) setProbingLive(true);
    else setLoading(true);
    setError('');
    try {
      const { url, init } = buildKeyPoolsRequest(live, filter);
      const res = await fetch(url, init);
      const json = (await res.json()) as ObservatorySnapshot & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || 'Falha ao consultar observatorio de pools');
      }
      setData(json);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao consultar observatorio de chaves');
    } finally {
      setLoading(false);
      setProbingLive(false);
    }
  }, []);

  useEffect(() => {
    void fetchSnapshot(false, poolFilter);
  }, [fetchSnapshot, poolFilter]);

  const liveOnlineCount = useMemo(() => {
    if (!data) return { ok: 0, total: 0 };
    const checked = data.entries.filter((e) => e.health_ok !== null);
    const ok = checked.filter((e) => e.health_ok === true).length;
    return { ok, total: checked.length };
  }, [data]);

  const syncAllOk = data?.total_synced === data?.total_vars && (data?.total_vars ?? 0) > 0;
  const hygieneOk = data?.fails_count === 0 && data?.warns_count === 0;
  const p95Label = formatP95Latency(data?.p95_latency_ms);
  const hygieneLabel = formatHygieneSummary(data, hygieneOk);
  const syncLabel = data ? `${data.total_synced}/${data.total_vars}` : '—';
  const healthPoolLabel = data ? `${liveOnlineCount.ok}/${liveOnlineCount.total}` : '—';
  const isBusy = loading || probingLive;
  const auditButtonLabel = loading && !probingLive ? 'Auditando...' : 'Auditar HKCU/HKLM';
  const probeButtonLabel = probingLive ? 'Sondando HTTP...' : 'Sondar Live (0 tokens)';
  const inventoryButtonLabel = showInventory
    ? 'Ocultar inventário mascarado'
    : `Ver inventário mascarado (${data?.entries.length ?? 0})`;

  return (
    <GlassPanel className="relative mb-8 overflow-hidden border-cyan-500/30 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black tracking-widest text-emerald-300 uppercase">
              {data?.mode === 'live' ? 'Sonda HTTP Live (0 tokens)' : 'HKCU / HKLM + Telemetria DB'}
            </span>
            <span className="text-text-muted text-xs">
              Zero texto claro · Fingerprints sha8 · {data?.total_vars ?? 0} credenciais monitoradas
            </span>
          </div>
          <h2 className="m-0 flex items-center gap-2 text-xl font-black tracking-tight text-white md:text-2xl">
            <i className="fa-solid fa-key text-lg text-emerald-400" aria-hidden="true" />
            <span>Observatório de Pools, Keys &amp; Roteamento</span>
          </h2>
          <p className="text-text-muted mt-1 mb-0 text-xs md:text-sm">
            Isolamento Multi-Tier OpenRouter, Gemini/Decision/Multimodal AI Studio, Ollama Cloud e feedback bidirecional
            de latência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="text-text-muted rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition-all hover:border-white/25 hover:text-white"
          >
            {showGuide ? 'Ocultar Guia' : 'Guia de Cotas'}
          </button>
          <button
            type="button"
            onClick={() => void fetchSnapshot(false, poolFilter)}
            disabled={isBusy}
            className="rounded-lg border border-cyan-500/30 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-slate-700"
          >
            {auditButtonLabel}
          </button>
          <button
            type="button"
            onClick={() => void fetchSnapshot(true, poolFilter)}
            disabled={isBusy}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-500/30"
          >
            {probeButtonLabel}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
          {error}
        </div>
      ) : null}

      {showGuide ? <KeyPoolsGuideCard /> : null}

      {/* KPI Strip */}
      <KeyPoolsKpiStrip
        syncAllOk={syncAllOk}
        syncLabel={syncLabel}
        healthPoolLabel={healthPoolLabel}
        p95Ms={data?.p95_latency_ms ?? null}
        p95Label={p95Label}
        hygieneOk={hygieneOk}
        hygieneLabel={hygieneLabel}
      />

      {/* Filter Pills */}
      <KeyPoolsFilterBar
        poolFilter={poolFilter}
        onSelectPool={setPoolFilter}
        inventoryButtonLabel={inventoryButtonLabel}
        onToggleInventory={() => setShowInventory((v) => !v)}
      />

      {/* Pool Topology Cards */}
      <PoolTopologyGrid summaries={data?.summaries || []} />

      {/* Collapsible Masked Inventory */}
      {showInventory && data ? <MaskedInventoryTable entries={data.entries} /> : null}

      {/* Anomalies */}
      <AnomaliesAlertBox anomalies={data?.anomalies || []} />
    </GlassPanel>
  );
}
