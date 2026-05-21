"use client";

import type { ChipEvFreqs } from "@/components/simulator/engine/types";

interface FreqInputProps {
  value: number;
  field: keyof ChipEvFreqs;
  freqs: ChipEvFreqs;
  onChange: (freqs: ChipEvFreqs) => void;
}

export const FreqInput = ({
  value,
  field,
  freqs,
  onChange,
}: Readonly<FreqInputProps>) => {
  return (
    <div className="flex items-center gap-1">
      <input
        id={`nash-freq-${String(field)}`}
        name={`nash-freq-${String(field)}`}
        type="number"
        min="0"
        max="100"
        step="1"
        aria-label={`Frequência de ${String(field)}`}
        title={`Frequência de ${String(field)}`}
        placeholder="0"
        value={value}
        onChange={(e) =>
          onChange({
            ...freqs,
            [field]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
          })
        }
        className="w-14 py-1 px-1.5 rounded bg-white/5 border border-white/10 text-text-muted text-[0.7rem] font-bold font-mono tabular-nums text-right outline-none focus:border-accent-indigo/50 transition-colors"
      />
      <span className="text-[0.6rem] text-text-darker">%</span>
    </div>
  );
};
