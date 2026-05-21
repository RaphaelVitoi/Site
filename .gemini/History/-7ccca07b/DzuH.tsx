"use client";

interface RadarTooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface RadarTooltipProps {
  active?: boolean;
  payload?: RadarTooltipPayload[];
  label?: string;
}

export const RadarTooltip = ({ active, payload, label }: RadarTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const valA = payload[0]?.value ?? 0;
    const valB = payload.length > 1 ? payload[1]?.value : undefined;
    const delta = valB === undefined ? 0 : valB - valA;

    let deltaColorClass = "text-text-muted";
    if (Math.abs(delta) > 0.1) {
      deltaColorClass = delta > 0 ? "text-accent-rose" : "text-accent-emerald";
    }

    return (
      <div className="p-4 rounded-xl border border-white/10 bg-slate-950/95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl z-50 min-w-56 font-sans">
        <p className="mb-3 text-[0.65rem] font-black text-text-muted uppercase tracking-widest border-b border-white/5 pb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: RadarTooltipPayload) => (
            <div
              key={`${entry.name}-${entry.color}`}
              className="flex justify-between items-center gap-4"
            >
              <span
                className="text-[0.65rem] font-bold uppercase tracking-wider"
                {...{ style: { color: entry.color } }}
              >
                {entry.name}
              </span>
              <span className="text-[0.75rem] font-black text-white font-mono tabular-nums">
                {Number(entry.value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        {valB !== undefined && (
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center gap-4">
            <span className="text-[0.6rem] text-text-dim font-black uppercase tracking-widest">
              Δ Relativo
            </span>
            <span
              className={`text-[0.75rem] font-black font-mono tabular-nums ${deltaColorClass}`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} p.p.
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};
