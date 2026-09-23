'use client';

import type { ChipEvFreqs } from '@/components/simulator/solver/types';

interface FreqInputProps {
	value: number;
	field: keyof ChipEvFreqs;
	freqs: ChipEvFreqs;
	onChange: (freqs: ChipEvFreqs) => void;
}

export const FreqInput = ({ value, field, freqs, onChange }: Readonly<FreqInputProps>) => {
	return (
		<div className="flex items-center gap-1 shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-0.5 shadow-inner hover:border-white/20 focus-within:border-accent-indigo/60 transition-all">
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
				onWheel={(e) => e.currentTarget.blur()}
				onChange={(e) =>
					onChange({
						...freqs,
						[field]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
					})
				}
				className="w-9 bg-transparent border-none text-white text-sm font-bold font-mono tabular-nums text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			/>
			<span className="text-xs text-text-muted font-mono font-bold select-none">%</span>
		</div>
	);
};
