/**
 * IDENTITY: Linha de Ação GTO SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/ActionRow.tsx
 * ROLE: Exibe a frequência de uma ação específica e sua distorção de Nash.
 */

'use client';

import { motion } from 'framer-motion';
import type { ChipEvFreqs, FreqResult } from '@/components/simulator/solver/types';
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
	// Frequência de Entrada e Alvo Nash GTO
	const userFreq = Number(chipEv) || 0;
	const userFreqPct = Math.max(0, Math.min(100, userFreq));
	const gtoTarget = result.center;
	const gtoTargetPct = Math.max(0, Math.min(100, gtoTarget));

	// Desvio real do usuário em relação ao GTO:
	// Aumentar acima do GTO = Excesso (+ com ▲)
	// Diminuir abaixo do GTO = Déficit (- com ▼)
	// Na margem de ±1% = Equilíbrio (0% com ●)
	const deviation = userFreq - gtoTarget;
	const absDeviation = Math.abs(deviation);
	const isEquilibrium = absDeviation <= 1.0;
	const isExcesso = deviation > 1.0;
	const isDeficit = deviation < -1.0;

	const deltaLabel = isEquilibrium ? 'Equilíbrio' : isExcesso ? 'Excesso' : 'Déficit';
	const deltaBadgeColor = isEquilibrium ? '#10b981' : isExcesso ? '#f43f5e' : '#f59e0b';
	const deltaSign = isEquilibrium ? '' : deviation > 0 ? '+' : '';
	const formattedDelta = isEquilibrium ? '0%' : `${deltaSign}${deviation.toFixed(0)}%`;
	const deltaIcon = isEquilibrium ? '●' : isExcesso ? '▲' : '▼';

	return (
		<div className="group/row flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-slate-950/45 p-3 hover:border-white/15 hover:bg-slate-950/75 transition-all duration-300">
			{/* Andar 1: Identificação da Ação e Diagnóstico de Divergência com Status */}
			<div className="flex items-center justify-between gap-2">
				<span
					className="text-[0.72rem] sm:text-[0.76rem] font-black uppercase tracking-wider flex items-center gap-1.5"
					style={{ color: accent }}
				>
					{label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
				</span>

				{/* Badge Didático do Delta (Divergência) + Status */}
				<div
					className="flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[0.66rem] sm:text-[0.7rem] font-mono font-black tabular-nums tracking-tight shadow-sm shrink-0"
					style={{
						color: deltaBadgeColor,
						borderColor: `${deltaBadgeColor}44`,
						backgroundColor: `${deltaBadgeColor}15`,
					}}
					title={`Divergência da ação ${label}: ${formattedDelta} em relação ao equilíbrio Nash GTO`}
				>
					<span className="text-[0.58rem] opacity-80">{deltaIcon}</span>
					<span>{formattedDelta}</span>
					<span className="text-[0.55rem] font-sans uppercase font-bold tracking-wider opacity-85 ml-0.5">
						&middot; {deltaLabel}
					</span>
				</div>
			</div>

			{/* Andar 2: Comparativo Direto (Frequência -> Alvo GTO) - SEM "SUA:" */}
			<div className="flex items-center justify-between gap-2 rounded-xl bg-black/35 px-2.5 py-1.5 border border-white/[0.03]">
				{/* Frequência de Entrada */}
				<div className="flex items-center gap-1">
					<FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
				</div>

				{/* Divisor Visual Minimalista */}
				<span className="text-[0.65rem] text-text-darker opacity-35 select-none font-mono">
					→
				</span>

				{/* Alvo Nash GTO */}
				<div className="flex items-baseline gap-1">
					<span className="text-[0.58rem] font-black uppercase tracking-wider text-text-darker select-none">
						GTO:
					</span>
					<span className="text-[0.84rem] sm:text-[0.88rem] font-black font-mono tabular-nums text-white tracking-tight">
						<AnimatedNumber value={result.center} suffix="%" />
					</span>
					<span className="text-[0.55rem] text-text-darker font-mono tabular-nums font-bold opacity-60">
						±{result.spread.toFixed(1)}
					</span>
				</div>
			</div>

			{/* Andar 3: Barra de Frequência Inferior (Preenche ao aumentar, esvazia ao diminuir) */}
			<div
				className="relative w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-inner mt-0.5 cursor-default"
				title={`Frequência: ${userFreq}% | Alvo GTO: ${gtoTarget.toFixed(1)}% | Desvio: ${formattedDelta} (${deltaLabel})`}
			>
				{/* Zona de Déficit (sombra sutil até o alvo GTO) */}
				{isDeficit && (
					<div
						className="absolute top-0 bottom-0 bg-amber-500/20"
						style={{
							left: `${userFreqPct}%`,
							width: `${Math.max(0, gtoTargetPct - userFreqPct)}%`,
						}}
					/>
				)}

				{/* Preenchimento da Frequência do Jogador */}
				<motion.div
					initial={false}
					animate={{ width: `${userFreqPct}%` }}
					transition={{ duration: 0.25, ease: 'easeOut' }}
					className="h-full rounded-full relative z-10"
					style={{
						backgroundColor: accent,
						boxShadow: `0 0 10px ${accent}`,
					}}
				/>

				{/* Zona de Excesso (destaque rose de ultrapassagem além do alvo GTO) */}
				{isExcesso && (
					<motion.div
						initial={false}
						animate={{
							left: `${gtoTargetPct}%`,
							width: `${Math.max(0, userFreqPct - gtoTargetPct)}%`,
						}}
						transition={{ duration: 0.25, ease: 'easeOut' }}
						className="absolute top-0 bottom-0 bg-rose-500/80 rounded-r-full z-15 shadow-[0_0_10px_#f43f5e]"
					/>
				)}

				{/* Marcador Vertical do Alvo Nash GTO (Sempre visível sobre a barra) */}
				<div
					className="absolute top-0 bottom-0 w-1 bg-white rounded-full z-20 shadow-[0_0_8px_rgba(255,255,255,0.95)] pointer-events-none"
					style={{ left: `calc(${gtoTargetPct}% - 2px)` }}
					title={`Alvo Nash GTO: ${gtoTarget.toFixed(1)}% ±${result.spread.toFixed(1)}%`}
				/>
			</div>
		</div>
	);
};
