'use client';

interface PlayerRowDisplay {
	borderColor: string;
	bg: string;
	badgeBg: string;
	badgeText: string;
	nameColor: string;
	stackColor: string;
}

const NEUTRAL_CONFIG: PlayerRowDisplay = {
	borderColor: 'border-white/5',
	bg: 'bg-slate-800/25',
	badgeBg: 'bg-slate-900/80',
	badgeText: '',
	nameColor: 'text-text-muted',
	stackColor: 'text-text-dim',
};

function buildPlayerRowDisplay(isA: boolean, isD: boolean, playerId: string): PlayerRowDisplay {
	let role = 'neutral';
	if (isA) role = 'aggressor';
	else if (isD) role = 'defender';

	const configs: Record<string, PlayerRowDisplay> = {
		aggressor: {
			borderColor: 'border-indigo-500/45',
			bg: 'bg-indigo-500/15',
			badgeBg: 'bg-indigo-900',
			badgeText: 'A',
			nameColor: 'text-indigo-400',
			stackColor: 'text-indigo-500',
		},
		defender: {
			borderColor: 'border-rose-500/45',
			bg: 'bg-rose-500/15',
			badgeBg: 'bg-rose-900',
			badgeText: 'D',
			nameColor: 'text-rose-400',
			stackColor: 'text-rose-500',
		},
		neutral: {
			...NEUTRAL_CONFIG,
			badgeText: playerId.replace('p', ''),
		},
	};

	return configs[role] ?? NEUTRAL_CONFIG;
}

interface StackPlayer {
	id: string;
	pos: string;
	bb: number;
}

interface PlayerSelectButtonProps {
	player: StackPlayer;
	isA: boolean;
	isD: boolean;
	onClick: () => void;
}

export const PlayerSelectButton = ({
	player,
	isA,
	isD,
	onClick,
}: Readonly<PlayerSelectButtonProps>) => {
	const display = buildPlayerRowDisplay(isA, isD, player.id);
	const badgeFg = isA || isD ? 'text-white' : 'text-slate-400';

	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all w-full border ${display.bg} ${display.borderColor}`}
		>
			<div className="flex items-center gap-2">
				<div
					className={`w-5 h-5 rounded flex items-center justify-center text-[0.58rem] font-black shrink-0 font-mono border ${display.badgeBg} ${display.borderColor} ${badgeFg}`}
				>
					{display.badgeText}
				</div>
				<span className={`text-[0.75rem] font-bold leading-tight ${display.nameColor}`}>
					{player.pos}
				</span>
			</div>
			<span
				className={`font-mono tabular-nums text-[0.82rem] font-black ${display.stackColor}`}
			>
				{player.bb.toFixed(1)}
				<span className="text-[0.58rem] font-semibold ml-0.5 opacity-50">bb</span>
			</span>
		</button>
	);
};
