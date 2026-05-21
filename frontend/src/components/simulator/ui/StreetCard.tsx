'use client';

import {
	formatDeltaRp,
	formatEvFold,
	formatPm,
	getCiStyle,
	getSprColorClass,
} from '@/components/simulator/engine/utils';
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
		return { heroRp: 0, villainRp: 0, deltaRp: 0, heroLabel, villainLabel };
	}
	return {
		heroRp: heroIsIp ? result.ipRp : result.oopRp,
		villainRp: heroIsIp ? result.oopRp : result.ipRp,
		deltaRp: result.deltaRp,
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
	const { heroRp, villainRp, deltaRp, heroLabel, villainLabel } = getCardData(
		result,
		heroIsIp,
		isBaseline,
		ipLabel,
		oopLabel,
	);

	const evFoldData = formatEvFold(result.evFoldStreet);
	const deltaRpData = formatDeltaRp(deltaRp);
	const pmData = formatPm(result.pmStreet);
	const ciData = getCiStyle(result.ciStreet);

	const sprColorClass = getSprColorClass(result.sprRemanescente);
	const entrapmentColorClass = getPotEntrapmentColorClass(result.potEntrapmentRatio);

	const valColorClass = result.valuationStreet < 1 ? 'text-accent-amber' : 'text-accent-emerald';
	const sprText = result.sprRemanescente === Infinity ? '∞' : result.sprRemanescente.toFixed(1);

	return (
		<div className="bg-bg-deep border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col gap-2.5 group/card hover:bg-bg-panel/40 hover:border-accent-indigo/30 transition-all duration-500 relative overflow-hidden">
			<div className="absolute top-0 right-0 w-24 h-24 bg-accent-indigo/5 blur-3xl -mr-8 -mt-8 rounded-full pointer-events-none transition-opacity opacity-0 group-hover/card:opacity-100"></div>

			<div className="flex justify-between items-center pb-2 border-b border-white/5">
				<h4 className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">
					{STREET_LABEL[street]}
				</h4>
				<div className="w-1 h-1 rounded-full bg-accent-indigo/40" />
			</div>

			<div className="space-y-1 font-mono tabular-nums">
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
					label="ΔRP"
					value={deltaRpData.text}
					colorClass={deltaRpData.colorClass}
				/>
			</div>

			<div className="mt-1 pt-2 border-t border-dashed border-white/10 space-y-1 font-mono tabular-nums">
				<MetricRow label="PM (Persp.)" value={pmData.text} colorClass={pmData.colorClass} />
				<MetricRow
					label="Ci (Solvên.)"
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
						colorClass="text-accent-danger"
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
