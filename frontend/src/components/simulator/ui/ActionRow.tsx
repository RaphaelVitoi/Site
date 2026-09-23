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

	let deltaLabel = 'Déficit';
	let deltaBadgeColor = '#f59e0b';
	let deltaIcon = '▼';
	let deltaSign = '';

	if (isEquilibrium) {
		deltaLabel = 'Equilíbrio';
		deltaBadgeColor = '#10b981';
		deltaIcon = '●';
	} else if (isExcesso) {
		deltaLabel = 'Excesso';
		deltaBadgeColor = '#f43f5e';
		deltaIcon = '▲';
		deltaSign = '+';
	}

	const formattedDelta = isEquilibrium ? '0%' : `${deltaSign}${deviation.toFixed(0)}%`;

	return (
		<div className="group/row flex flex-col gap-2 rounded-2xl border border-white/6 bg-slate-950/45 p-3 hover:border-white/15 hover:bg-slate-950/75 transition-all duration-300">
			{/* Andar 1: Identificação da Ação e Diagnóstico de Divergência com Status */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span
					className="text-sm font-bold uppercase tracking-wide flex items-center gap-1.5"
					style={{ color: accent }}
				>
					{label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
				</span>

				{/* Badge Didático do Delta (Divergência) + Status */}
				<div
					className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-mono font-bold tabular-nums shadow-sm shrink-0"
					style={{
						color: deltaBadgeColor,
						borderColor: `${deltaBadgeColor}44`,
						backgroundColor: `${deltaBadgeColor}15`,
					}}
					title={`Divergência da ação ${label}: ${formattedDelta} em relação ao equilíbrio Nash GTO`}
				>
					<span className="text-xs opacity-80">{deltaIcon}</span>
					<span>{formattedDelta}</span>
					<span className="text-xs uppercase font-bold tracking-normal opacity-85 ml-0.5">
						&middot; {deltaLabel}
					</span>
				</div>
			</div>

			{/* Andar 2: Comparativo Direto (Frequência -> Alvo GTO) - SEM "SUA:" */}
			<div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl bg-black/35 px-2.5 py-2 border border-white/3">
				{/* Frequência de Entrada */}
				<div className="flex flex-col items-start gap-1">
					<span className="text-xs font-semibold text-text-muted">Sua freq.</span>
					<FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
				</div>

				{/* Alvo Nash GTO */}
				<div className="min-w-0 text-right">
					<span className="block text-xs font-semibold text-text-muted">
						Alvo GTO
					</span>
					<div className="flex flex-col items-end leading-tight">
						<span className="text-base font-bold font-mono tabular-nums text-white tracking-tight whitespace-nowrap">
							<AnimatedNumber value={result.center} suffix="%" />
						</span>
						<span className="text-xs text-text-muted font-mono tabular-nums whitespace-nowrap">
							±{result.spread.toFixed(1)}%
						</span>
					</div>
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
