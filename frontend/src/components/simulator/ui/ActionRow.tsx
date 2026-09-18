/**
 * IDENTITY: Linha de Ação GTO SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/ActionRow.tsx
 * ROLE: Exibe a frequência de uma ação específica e sua distorção de Nash.
 */

'use client';

import { motion } from 'framer-motion';
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

	// SOTA: Fill proportional to absolute delta (escala sensivel: 0% desvio = 0%; 25%+ desvio = 100% da barra)
	const absDelta = Math.abs(result.delta);
	const fillPercentage = Math.min(100, Math.round(absDelta * 4));

	const isEquilibrium = absDelta <= 1;
	const deltaLabel = isEquilibrium ? 'Equilíbrio' : result.delta < 0 ? 'Excesso' : 'Déficit';
	const deltaBadgeColor = isEquilibrium ? 'var(--accent-emerald)' : deltaColorValue;

	return (
		<div className="flex flex-col gap-2 p-3 rounded-2xl border border-white/[0.06] bg-slate-950/40 hover:bg-slate-950/70 hover:border-white/12 transition-all duration-300 group/row overflow-hidden">
			{/* Linha 1: Dados Quantitativos (Ação + Input + Conector + GTO + Badge Delta) */}
			<div className="flex items-center justify-between gap-1.5 sm:gap-2">
				{/* Ação e Input de Frequência do Usuário */}
				<div className="flex items-center gap-1.5 shrink-0">
					<span
						className="w-11 sm:w-12 text-[0.68rem] sm:text-[0.72rem] font-black uppercase tracking-wider shrink-0"
						style={{ color: accent }}
					>
						{label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
					</span>
					<FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
				</div>

				{/* Conector Visual Minimalista */}
				<span className="text-[0.65rem] text-text-darker opacity-30 group-hover/row:opacity-75 transition-opacity select-none">
					→
				</span>

				{/* Equilíbrio de Nash GTO (Centro ± Spread) */}
				<div className="flex items-baseline gap-1 shrink-0">
					<span className="text-[0.55rem] font-black uppercase tracking-wider text-text-darker select-none">
						GTO
					</span>
					<span className="text-[0.84rem] sm:text-[0.88rem] font-black font-mono tabular-nums text-white tracking-tight">
						<AnimatedNumber value={result.center} suffix="%" />
					</span>
					<span className="text-[0.55rem] text-text-darker font-mono tabular-nums font-bold opacity-60">
						±{result.spread.toFixed(1)}
					</span>
				</div>

				{/* Badge Didático do Delta (Divergência) */}
				<div
					className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[0.68rem] font-mono font-black tabular-nums tracking-tighter shrink-0 transition-colors"
					style={{
						color: deltaBadgeColor,
						borderColor: `${deltaBadgeColor}44`,
						backgroundColor: `${deltaBadgeColor}15`,
					}}
					title={`Divergência da ação ${label}: ${formatDelta(result.delta)}% em relação ao equilíbrio Nash GTO`}
				>
					<span className="text-[0.55rem] opacity-70">Δ</span>
					<span>{formatDelta(result.delta)}%</span>
				</div>
			</div>

			{/* Linha 2: Barra de Desvio Linkada Organicamente ao Dado */}
			<div className="flex items-center gap-2 pt-0.5">
				<div className="relative flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${fillPercentage}%` }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
						className="h-full rounded-full"
						style={{
							backgroundColor: deltaBadgeColor,
							boxShadow: `0 0 8px ${deltaBadgeColor}66`,
						}}
					/>
				</div>
				<span
					className="text-[0.55rem] font-mono uppercase tracking-wider shrink-0 select-none font-bold"
					style={{ color: deltaBadgeColor }}
				>
					{deltaLabel}
				</span>
			</div>
		</div>
	);
};
