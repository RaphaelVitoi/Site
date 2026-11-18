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
      const res = live
        ? await fetch('/api/sota/key-pools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ live: true, pool: filter }),
            cache: 'no-store',
          })
        : await fetch(
            filter ? `/api/sota/key-pools?pool=${encodeURIComponent(filter)}` : '/api/sota/key-pools',
            { cache: 'no-store' },
          );
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

  const syncAllOk = Boolean(data && data.total_synced === data.total_vars && data.total_vars > 0);
  const hygieneOk = Boolean(data && data.fails_count === 0 && data.warns_count === 0);

  return (
    <GlassPanel className="p-6 md:p-8 border-cyan-500/30 mb-8 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {data?.mode === 'live' ? 'Sonda HTTP Live (0 tokens)' : 'HKCU / HKLM + Telemetria DB'}
            </span>
            <span className="text-xs text-text-muted">
              Zero texto claro · Fingerprints sha8 · {data?.total_vars ?? 0} credenciais monitoradas
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight m-0 flex items-center gap-2">
            <i className="fa-solid fa-key text-emerald-400 text-lg" aria-hidden="true" />
            <span>Observatório de Pools, Keys &amp; Roteamento</span>
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 mb-0">
            Isolamento Multi-Tier OpenRouter, Gemini/Decision/Multimodal AI Studio, Ollama Cloud e feedback bidirecional de latência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 bg-white/5 text-xs font-medium text-text-muted hover:text-white transition-all"
          >
            {showGuide ? 'Ocultar Guia' : 'Guia de Cotas'}
          </button>
          <button
            type="button"
            onClick={() => void fetchSnapshot(false, poolFilter)}
            disabled={loading || probingLive}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-xs font-semibold text-cyan-200 transition-all"
          >
            {loading && !probingLive ? 'Auditando...' : 'Auditar HKCU/HKLM'}
          </button>
          <button
            type="button"
            onClick={() => void fetchSnapshot(true, poolFilter)}
            disabled={loading || probingLive}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-semibold text-emerald-200 transition-all"
          >
            {probingLive ? 'Sondando HTTP...' : 'Sondar Live (0 tokens)'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-200">
          {error}
        </div>
      ) : null}

      {showGuide ? (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs text-text-muted space-y-1.5">
          <div className="font-bold text-cyan-300 text-sm">Arquitetura de Pools &amp; Otimização Ida/Volta</div>
          <p className="m-0">
            • <strong>Isolamento por Tier:</strong> <code>@chico</code> usa Tier 1 (5 chaves, sem degradação); <code>@maverick</code> usa Tier 2 (10 chaves → T4/T1); batch/compressão usa Tier 3 (5 chaves → Ollama local); subagentes usam Tier 4 (5 chaves → T3).
          </p>
          <p className="m-0">
            • <strong>Ponte Legada Segura:</strong> <code>OPENROUTER_API_KEY</code> espelha <code>OPENROUTER_TIER4_KEY_1</code> (protege Tier 1); <code>OLLAMA_CLOUD_KEY</code> atua como backup de <code>OLLAMA_API_KEY</code> em <code>OLLAMA_KEYS</code>.
          </p>
          <p className="m-0">
            • <strong>Cotas AI Studio vs OpenRouter:</strong> Chaves <code>GEMINI_*</code> e <code>DECISION_API_*</code> dividem cota no projeto GCP <code>913870412920</code> (rotação = resiliência); OpenRouter isola cota por chave e recebe feedback bidirecional (HTTP 200/401/402/429/5xx + latência) em tempo real.
          </p>
        </div>
      ) : null}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Sync HKCU/HKLM</div>
          <div className={`text-2xl font-black mt-1 ${syncAllOk ? 'text-emerald-300' : 'text-amber-300'}`}>
            {data ? `${data.total_synced}/${data.total_vars}` : '—'}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Saúde do Pool</div>
          <div className="text-2xl font-black text-white mt-1">
            {data ? `${liveOnlineCount.ok}/${liveOnlineCount.total}` : '—'}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Latência P95</div>
          <div className={`text-2xl font-black mt-1 ${latencyTone(data?.p95_latency_ms ?? null)}`}>
            {data?.p95_latency_ms !== null && data?.p95_latency_ms !== undefined ? `${data.p95_latency_ms} ms` : '—'}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Higiene &amp; Alertas</div>
          <div className={`text-2xl font-black mt-1 ${hygieneOk ? 'text-emerald-300' : 'text-amber-300'}`}>
            {data ? (hygieneOk ? 'OK' : `${data.fails_count}F / ${data.warns_count}W`) : '—'}
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="flex flex-wrap items-center gap-2">
          {POOL_FILTERS.map((f) => {
            const active = poolFilter === f.value;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => setPoolFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                    : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowInventory((v) => !v)}
          className="px-3 py-1 rounded-lg border border-white/15 text-xs font-semibold text-white hover:bg-white/5"
        >
          {showInventory ? 'Ocultar inventário mascarado' : `Ver inventário mascarado (${data?.entries.length ?? 0})`}
        </button>
      </div>

      {/* Pool Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {(data?.summaries || []).map((s) => (
          <div key={s.pool} className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">{s.pool}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  s.synced === s.total_vars && s.invalid_fmt === 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {s.synced}/{s.total_vars} sync
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 mb-2">{s.role}</p>
            <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
              <span className="text-cyan-300">{s.health_label}</span>
              <span className={latencyTone(s.avg_latency_ms)}>
                {s.avg_latency_ms !== null ? `${s.avg_latency_ms} ms` : '—'}
              </span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">{s.policy}</div>
          </div>
        ))}
      </div>

      {/* Collapsible Masked Inventory */}
      {showInventory && data ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-text-muted uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Pool</th>
                <th className="py-2.5 px-3">Variável</th>
                <th className="py-2.5 px-3">Chave (Mask)</th>
                <th className="py-2.5 px-3">sha8</th>
                <th className="py-2.5 px-3">Sync</th>
                <th className="py-2.5 px-3">Saúde</th>
                <th className="py-2.5 px-3 text-right">Latência</th>
                <th className="py-2.5 px-3">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.entries.map((entry) => (
                <tr key={entry.variable} className="hover:bg-white/5">
                  <td className="py-2 px-3 text-cyan-300 whitespace-nowrap">{entry.pool}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-white whitespace-nowrap">{entry.variable}</td>
                  <td className="py-2 px-3 font-mono text-text-muted whitespace-nowrap">{entry.mask}</td>
                  <td className="py-2 px-3 font-mono text-fuchsia-300 whitespace-nowrap">{entry.sha8}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={entry.sync === 'SYNCED' ? 'text-emerald-300' : 'text-amber-300'}>
                      {entry.sync}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={entry.health_ok === false ? 'text-rose-300' : 'text-emerald-300'}>
                      {entry.health_label}
                    </span>
                  </td>
                  <td className={`py-2 px-3 text-right font-mono whitespace-nowrap ${latencyTone(entry.latency_ms)}`}>
                    {entry.latency_ms !== null ? `${entry.latency_ms} ms` : '—'}
                  </td>
                  <td className="py-2 px-3 text-text-muted">{entry.role_hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Anomalies */}
      {data && data.anomalies.length > 0 ? (
        <div className="mt-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-100 space-y-1">
          <div className="font-bold text-amber-300">Anomalias detectadas ({data.anomalies.length})</div>
          {data.anomalies.map((a) => (
            <div key={`${a.severity}-${a.variable}-${a.issue}`}>
              <span className="font-mono font-bold">[{a.severity}]</span> <strong>{a.variable}</strong> ({a.pool}): {a.issue}
            </div>
          ))}
        </div>
      ) : null}
    </GlassPanel>
  );
}
