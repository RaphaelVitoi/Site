/**
 * IDENTITY: Linha de Ação GTO SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/ActionRow.tsx
 * ROLE: Exibe a frequência de uma ação específica e sua distorção de Nash.
 */

'use client';

import type { ChipEvFreqs, FreqResult } from '@/components/simulator/engine/types';
import { formatDelta, getDeltaColor } from '@/components/simulator/engine/utils';
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
	const labelProps = { style: { color: accent } };
	const deltaColorValue = getDeltaColor(result.delta);
	const deltaProps = { style: { color: deltaColorValue } };

	// SOTA: Fill proportional to absolute delta
	const fillPercentage = Math.min(100, Math.abs(result.delta));

	return (
		<div className="grid grid-cols-[80px_90px_25px_1fr_80px] items-center gap-4 py-3 border-b border-white/5 last:border-none group/row transition-colors hover:bg-white/2">
			<span
				className="text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2 group-hover/row:scale-105 transition-transform"
				{...labelProps}
			>
				{label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
			</span>
			<FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
			<span className="text-[0.7rem] text-text-darker text-center opacity-40 group-hover/row:opacity-100 transition-opacity">→</span>
			<div className="flex items-baseline gap-2 overflow-hidden">
				<span className="text-[1rem] font-black font-mono tabular-nums text-white shrink-0 tracking-tighter">
					<AnimatedNumber value={result.center} suffix="%" />
				</span>
				<span className="text-[0.6rem] text-text-darker font-mono tabular-nums font-black opacity-60">
					±{result.spread.toFixed(1)}
				</span>
			</div>
			<div className="flex flex-col items-end gap-2 shrink-0 w-full">
				<span className="text-[0.75rem] font-black font-mono tabular-nums tracking-tighter" {...deltaProps}>
					{formatDelta(result.delta)}
				</span>
				<div className="w-full h-1.5 bg-black/60 rounded-full relative overflow-hidden border border-white/5 shadow-inner">
					<div
						className="absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(244,63,94,0.4)]"
						{...{ style: { width: `${fillPercentage}%`, backgroundColor: deltaColorValue } }}
					/>
				</div>
			</div>
		</div>
	);
};
