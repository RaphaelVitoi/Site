"use client";

import { useEffect, useRef } from "react";

const getLogColor = (logText: string) => {
  if (logText.includes("[ERRO]")) return "text-rose-400";
  if (logText.includes("[MATH]") || logText.includes("[SOLVER]"))
    return "text-sky-300";
  return "text-slate-300";
};

interface WasmTelemetryWidgetProps {
  wasmLogs: string[];
  resultCi: number;
}

export function WasmTelemetryWidget({
  wasmLogs,
  resultCi,
}: Readonly<WasmTelemetryWidgetProps>) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [wasmLogs]);

  return (
    <div className="p-8 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-4xl shadow-2xl relative overflow-hidden group/telemetry">
      <div className="absolute inset-0 bg-radial-[at_top_right] from-emerald-500/5 to-transparent pointer-events-none opacity-50" />

      <div className="flex justify-between items-center mb-8 border-b border-emerald-500/10 pb-5 relative z-10">
        <h3 className="text-white font-bold text-lg md:text-xl tracking-tight flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_15px_var(--accent-emerald)] animate-pulse" />
          Motor de Observabilidade WASM
        </h3>
        <span className="text-[0.65rem] bg-emerald-500/10 text-accent-emerald px-3 py-1.5 rounded-lg font-mono uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Metrics</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
          <div className="text-[0.55rem] text-text-muted font-black uppercase tracking-[0.25em] mb-2">
            Compute Latency
          </div>
          <div className="font-mono text-accent-emerald text-2xl md:text-3xl font-black">
            <span>1.18</span>
            <span className="text-sm text-emerald-600 ml-1">ms</span>
          </div>
        </div>
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-colors">
          <div className="text-[0.55rem] text-text-muted font-black uppercase tracking-[0.25em] mb-2">
            Nodes Evaluated
          </div>
          <div className="font-mono text-accent-sky text-2xl md:text-3xl font-black">
            14,392
          </div>
        </div>
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-fuchsia-500/30 transition-colors">
          <div className="text-[0.55rem] text-text-muted font-black uppercase tracking-[0.25em] mb-2">
            Nash Convergence
          </div>
          <div className="font-mono text-fuchsia-400 text-2xl md:text-3xl font-black">
            <span>99.9</span>
            <span className="text-sm text-fuchsia-600 ml-1">%</span>
          </div>
        </div>
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-colors">
          <div className="text-[0.55rem] text-text-muted font-black uppercase tracking-[0.25em] mb-2">
            RP Delta (Δ)
          </div>
          <div className="font-mono text-accent-rose text-2xl md:text-3xl font-black">
            <span>{(resultCi * 0.4).toFixed(1)}</span>
            <span className="text-sm text-rose-600 ml-1">ev</span>
          </div>
        </div>
      </div>

      <div className="bg-black/80 rounded-2xl border border-white/5 p-6 font-mono text-[0.7rem] text-slate-400 h-56 overflow-y-auto leading-relaxed shadow-inner relative z-10 scrollbar-hide">
        <div className="space-y-2">
          {wasmLogs.map((log) => (
            <div
              key={log}
              className="flex gap-3 items-start hover:bg-white/5 px-2 py-1 rounded transition-colors"
            >
              <span className="text-emerald-500/50 font-black shrink-0 mt-0.5">
                ~
              </span>
              <span className={getLogColor(log)}>{log}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
