"use client";

interface MetricRowProps {
  label: string;
  value: string;
  colorClass: string;
  loading?: boolean;
  tooltipDesc?: string;
}

export const MetricRow = ({
  label,
  value,
  colorClass,
  loading,
  tooltipDesc,
}: MetricRowProps) => {
  return (
    <div className="flex flex-col py-1.5 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-center gap-4">
        <span className="text-[0.6rem] font-black uppercase tracking-widest text-text-dim cursor-default">
          {label}
        </span>
        <span
          className={`text-[0.7rem] font-black font-mono text-right wrap-break-word ${loading ? "text-text-darker" : colorClass}`}
        >
          {loading ? "..." : value}
        </span>
      </div>
      {tooltipDesc && (
        <p className="text-[0.45rem] text-text-darker leading-tight m-0 mt-0.5 uppercase tracking-widest">
          {tooltipDesc}
        </p>
      )}
    </div>
  );
};
