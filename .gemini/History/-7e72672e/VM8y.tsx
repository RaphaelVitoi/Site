"use client";

import type {
  ChipEvFreqs,
  FreqResult,
} from "@/components/simulator/engine/types";
import {
  formatDelta,
  getDeltaColor,
} from "@/components/simulator/engine/utils";
import { InfoTooltip } from "./InfoTooltip";
import { FreqInput } from "./FreqInput";
import AnimatedNumber from "../ui/AnimatedNumber";

interface ActionRowProps {
  label: string;
  labelTooltip?: string;
  chipEv: number;
  result: FreqResult;
  field: keyof ChipEvFreqs;
  accent: string;
  freqs: ChipEvFreqs;
  onChange: (freqs: ChipEvFreqs) => void;
}

export const ActionRow = ({
  label,
  labelTooltip,
  chipEv,
  result,
  field,
  accent,
  freqs,
  onChange,
}: ActionRowProps) => {
  const labelProps = { style: { color: accent } };
  const deltaColorValue = getDeltaColor(result.delta);
  const deltaProps = { style: { color: deltaColorValue } };

  // SOTA: Fill proportional to absolute delta
  const fillPercentage = Math.min(100, Math.abs(result.delta));

  return (
    <div className="grid grid-cols-[65px_75px_20px_1fr_65px] items-center gap-2 py-1.5 border-b border-white/5 last:border-none">
      <span
        className="text-[0.6rem] font-black uppercase tracking-tighter flex items-center gap-1"
        {...labelProps}
      >
        {label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
      </span>
      <FreqInput
        value={chipEv}
        field={field}
        freqs={freqs}
        onChange={onChange}
      />
      <span className="text-[0.6rem] text-text-darker text-center">→</span>
      <div className="flex items-baseline gap-1.5 overflow-hidden">
        <span className="text-[0.9rem] font-black font-mono tabular-nums text-text-main shrink-0">
          <AnimatedNumber value={result.center} suffix="%" />
        </span>
        <span className="text-[0.55rem] text-text-darker font-mono tabular-nums">
          ±{result.spread.toFixed(0)}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0 w-full">
        <span
          className="text-[0.65rem] font-black font-mono tabular-nums"
          {...deltaProps}
        >
          {formatDelta(result.delta)}
        </span>
        <div className="w-full h-1.5 bg-black/40 rounded-full relative overflow-hidden border border-white/5">
          <div
            className="absolute left-0 top-0 bottom-0 bg-accent-danger transition-all duration-500 ease-out shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            {...{ style: { width: `${fillPercentage}%` } }}
          />
        </div>
      </div>
    </div>
  );
};
