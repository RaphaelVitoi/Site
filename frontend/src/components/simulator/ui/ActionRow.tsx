/**
 * IDENTITY: Linha de Ação GTO SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/ActionRow.tsx
 * ROLE: Exibe a frequência de uma ação específica e sua distorção de Nash.
 */

'use client';

import type { ChipEvFreqs, FreqResult } from '@/components/simulator/solver/types';
import { formatDelta, getDeltaColor } from '@/components/simulator/solver/utils';
import AnimatedNumber from '../ui/AnimatedNumber';
import { FreqInput } from './FreqInput';
import { InfoTooltip } from './InfoTooltip';

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
}: Readonly<ActionRowProps>) => {
	const deltaColorValue = getDeltaColor(result.delta);

	// SOTA: Fill proportional to absolute delta
	const fillPercentage = Math.min(100, Math.abs(result.delta));

	return (
		<div className="flex items-center justify-between gap-2.5 sm:gap-3 py-2.5 px-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group/row">
			{/* Bloco 1: Ação e Input de Frequência do Usuário */}
			<div className="flex items-center gap-2 shrink-0">
				<span
					className="w-12 sm:w-14 text-[0.66rem] sm:text-[0.72rem] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0"
					style={{ color: accent }}
				>
					{label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
				</span>
				<FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
			</div>

			{/* Conector Visual Minimalista */}
			<span className="text-[0.68rem] text-text-darker opacity-30 shrink-0 group-hover/row:opacity-75 transition-opacity">
				→
			</span>

			{/* Bloco 2: Equilíbrio de Nash GTO (Centro ± Spread) */}
			<div className="flex items-baseline gap-1 shrink-0">
				<span className="text-[0.88rem] sm:text-[0.95rem] font-black font-mono tabular-nums text-white tracking-tight">
					<AnimatedNumber value={result.center} suffix="%" />
				</span>
				<span className="text-[0.56rem] sm:text-[0.62rem] text-text-darker font-mono tabular-nums font-bold opacity-60">
					±{result.spread.toFixed(1)}
				</span>
			</div>

			{/* Bloco 3: Delta de Divergência e Indicador de Desvio */}
			<div className="flex items-center gap-2 shrink-0 justify-end min-w-[70px] sm:min-w-[82px]">
				<span
					className="text-[0.7rem] sm:text-[0.76rem] font-black font-mono tabular-nums tracking-tighter"
					style={{ color: deltaColorValue }}
				>
					{formatDelta(result.delta)}
				</span>
				<div className="w-10 sm:w-12 h-1.5 bg-black/60 rounded-full relative overflow-hidden border border-white/10 shadow-inner shrink-0">
					<div
						className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out"
						style={{
							width: `${fillPercentage}%`,
							backgroundColor: deltaColorValue,
							boxShadow: `0 0 8px ${deltaColorValue}66`,
						}}
					/>
				</div>
			</div>
		</div>
	);
};
