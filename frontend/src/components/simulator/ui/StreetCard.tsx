'use client';

import {
	calculateRiskAdvantageDelta,
	formatDeltaRp,
	formatEvFold,
	formatPm,
	getCiStyle,
	getSprColorClass,
} from '@/components/simulator/solver/utils';
import type { PostFlopResult, Street } from '@/lib/rpDeriver';
import { MetricRow } from './MetricRow';

const STREET_LABEL: Record<Street, string> = {
	flop: 'FLOP',
	turn: 'TURN',
	river: 'RIVER',
};

function getPotEntrapmentColorClass(ratio: number): string {
	if (ratio > 0.5) return 'text-accent-danger';
	if (ratio > 0.25) return 'text-accent-amber';
	return 'text-text-muted';
}

function getCardData(
	result: PostFlopResult,
	heroIsIp: boolean,
	isBaseline: boolean,
	ipLabel: string,
	oopLabel: string,
) {
	const heroLabel = heroIsIp ? ipLabel : oopLabel;
	const villainLabel = heroIsIp ? oopLabel : ipLabel;

	if (isBaseline) {
		return { heroRp: 0, villainRp: 0, riskAdvantageDelta: 0, heroLabel, villainLabel };
	}
	const heroRp = heroIsIp ? result.ipRp : result.oopRp;
	const villainRp = heroIsIp ? result.oopRp : result.ipRp;
	return {
		heroRp,
		villainRp,
		riskAdvantageDelta: calculateRiskAdvantageDelta(heroRp, villainRp),
		heroLabel,
		villainLabel,
	};
}

interface StreetCardProps {
	street: Street;
	result: PostFlopResult;
	ipLabel: string;
	oopLabel: string;
	heroIsIp: boolean;
	isBaseline?: boolean;
}

export const StreetCard = ({
	street,
	result,
	ipLabel,
	oopLabel,
	heroIsIp,
	isBaseline = false,
}: Readonly<StreetCardProps>) => {
	const { heroRp, villainRp, riskAdvantageDelta, heroLabel, villainLabel } = getCardData(
		result,
		heroIsIp,
		isBaseline,
		ipLabel,
		oopLabel,
	);

	const evFoldData = formatEvFold(result.evFoldStreet);
	const riskAdvantageData = formatDeltaRp(riskAdvantageDelta);
	const pmData = formatPm(result.pmStreet);
	const ciData = getCiStyle(result.ciStreet);

	const sprColorClass = getSprColorClass(result.sprRemanescente);
	const entrapmentColorClass = getPotEntrapmentColorClass(result.potEntrapmentRatio);

	const valColorClass = result.valuationStreet < 1 ? 'text-accent-amber' : 'text-accent-emerald';
	const sprText = result.sprRemanescente === Infinity ? '∞' : result.sprRemanescente.toFixed(1);

	return (
		<div className="glass-panel group/card relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 p-8 shadow-3xl backdrop-blur-3xl transition-all duration-700 hover:-translate-y-2 hover:bg-black/60">
			<div className="bg-accent-indigo/10 pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl transition-opacity opacity-0 group-hover/card:opacity-100" />

			<div className="flex items-center justify-between border-b border-white/10 pb-4">
				<h4 className="text-accent-indigo-light m-0 text-[0.8rem] font-black tracking-[0.4em] uppercase group-hover/card:text-glow-indigo transition-all duration-500">
					{STREET_LABEL[street]}
				</h4>
				<div className="bg-accent-indigo h-2 w-2 rounded-full shadow-[0_0_12px_var(--accent-indigo)] animate-pulse" />
			</div>

			<div className="space-y-2.5 font-mono text-[0.85rem] tabular-nums">
				<MetricRow
					label="EV_fold"
					value={evFoldData.text}
					colorClass={evFoldData.colorClass}
				/>
				<MetricRow label="SPR rem" value={sprText} colorClass={sprColorClass} />
				<MetricRow
					label="Realiz. (R)"
					value={`${(result.rStreet * 100).toFixed(0)}%`}
					colorClass="text-text-muted"
				/>
				<MetricRow
					label={`RP ${heroLabel}`}
					value={`${heroRp.toFixed(1)}%`}
					colorClass="text-accent-indigo-light"
				/>
				<MetricRow
					label={`RP ${villainLabel}`}
					value={`${villainRp.toFixed(1)}%`}
					colorClass="text-accent-indigo/60"
				/>
				<MetricRow
					label={`ΔRP ${heroLabel}→${villainLabel}`}
					value={riskAdvantageData.text}
					colorClass={riskAdvantageData.colorClass}
				/>
			</div>

			<div className="mt-2 space-y-2.5 border-t border-dashed border-white/15 pt-6 font-mono text-[0.85rem] tabular-nums">
				<MetricRow label="PM (Persp.)" value={pmData.text} colorClass={pmData.colorClass} />
				<MetricRow
					label="Insolvência Cᵢ"
					value={result.ciStreet.toFixed(3)}
					colorClass={ciData.colorClass}
				/>
				<MetricRow
					label="Teto Nash"
					value={`${(result.threshEqStreet * 100).toFixed(1)}%`}
					colorClass="text-accent-sky"
				/>
				<MetricRow
					label="Valuation"
					value={result.valuationStreet.toFixed(3)}
					colorClass={valColorClass}
				/>
				{result.rioMwStreet > 0 && (
					<MetricRow
						label="RIO MW"
						value={result.rioMwStreet.toFixed(2)}
						colorClass="text-accent-rose text-glow-rose"
					/>
				)}
				<MetricRow
					label="Entrapment"
					value={`${(result.potEntrapmentRatio * 100).toFixed(0)}%`}
					colorClass={entrapmentColorClass}
				/>
			</div>
		</div>
	);
};
