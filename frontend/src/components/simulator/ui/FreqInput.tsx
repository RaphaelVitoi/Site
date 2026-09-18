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
		<div className="flex items-center gap-1 shrink-0">
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
				className="w-11 sm:w-12 py-0.5 px-1 rounded-lg bg-black/50 border border-white/10 text-white text-[0.72rem] font-bold font-mono tabular-nums text-center outline-none focus:border-accent-indigo/60 focus:bg-black/80 transition-all shadow-inner hover:border-white/20"
			/>
			<span className="text-[0.62rem] text-text-darker font-mono font-bold select-none">%</span>
		</div>
	);
};
