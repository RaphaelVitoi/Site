'use client';

interface PlayerStats {
	roleLabel: string;
	position: string;
	stackBb: number;
	rp: number;
	morphology: string;
	isAggressor: boolean;
}

interface HeroVsVillainProps {
	aggressor: PlayerStats;
	defender: PlayerStats;
}

export function HeroVsVillain({ aggressor, defender }: Readonly<HeroVsVillainProps>) {
	// SOTA: O raio visual de 26% de Risk Premium equivale ao preenchimento total de 100% do SVG
	const getFill = (rp: number) => Math.min(100, (rp / 26) * 100);

	return (
		<div className="flex items-center justify-between px-2 md:px-12 relative z-10">
			{/* AGRESSOR (IP/HERO) */}
			<div className="flex flex-col items-center flex-1">
				<div className="text-center mb-4">
					<span className="text-[11px] font-black text-sky-400 uppercase tracking-widest block mb-2">
						{aggressor.roleLabel}
					</span>
					<span className="text-2xl font-black text-white block mb-1">
						{aggressor.position}
					</span>
					<span className="font-mono tabular-nums text-sm text-slate-400 font-medium bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
						{aggressor.stackBb.toFixed(1)} bb
					</span>
				</div>

				<div className="relative w-28 h-28 md:w-36 md:h-36">
					<svg viewBox="0 0 36 36" className="block mx-auto max-w-35 max-h-35">
						<path
							className="fill-none stroke-slate-800/80 stroke-[2.5]"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
						<path
							className="fill-none stroke-sky-500 stroke-[2.5] transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]"
							strokeLinecap="round"
							strokeDasharray={`${getFill(aggressor.rp)}, 100`}
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="font-mono text-2xl md:text-3xl font-black text-white tabular-nums">
							{aggressor.rp.toFixed(1)}%
						</span>
						<span className="text-[8px] md:text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-1">
							R. Premium
						</span>
					</div>
				</div>

				<div className="mt-6 text-center">
					<p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
						Morfologia de Range
					</p>
					<span className="text-xs font-bold text-sky-300 bg-sky-950/30 px-3 py-1.5 rounded-lg border border-sky-500/20 block">
						{aggressor.morphology}
					</span>
				</div>
			</div>

			{/* VS LOGO ESTILIZADO */}
			<div className="shrink-0 px-4 md:px-6 flex flex-col items-center">
				<div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 font-black italic text-lg md:text-xl shadow-lg">
					VS
				</div>
				<div className="w-px h-20 md:h-24 bg-linear-to-b from-slate-700 to-transparent mt-4" />
			</div>

			{/* DEFENSOR (OOP/VILLAIN) */}
			<div className="flex flex-col items-center flex-1">
				<div className="text-center mb-4">
					<span className="text-[11px] font-black text-rose-400 uppercase tracking-widest block mb-2">
						{defender.roleLabel}
					</span>
					<span className="text-2xl font-black text-white block mb-1">
						{defender.position}
					</span>
					<span className="font-mono tabular-nums text-sm text-slate-400 font-medium bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
						{defender.stackBb.toFixed(1)} bb
					</span>
				</div>

				<div className="relative w-28 h-28 md:w-36 md:h-36">
					<svg viewBox="0 0 36 36" className="block mx-auto max-w-35 max-h-35">
						<path
							className="fill-none stroke-slate-800/80 stroke-[2.5]"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
						<path
							className="fill-none stroke-rose-500 stroke-[2.5] transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]"
							strokeLinecap="round"
							strokeDasharray={`${getFill(defender.rp)}, 100`}
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="font-mono text-2xl md:text-3xl font-black text-white tabular-nums">
							{defender.rp.toFixed(1)}%
						</span>
						<span className="text-[8px] md:text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">
							R. Premium
						</span>
					</div>
				</div>

				<div className="mt-6 text-center">
					<p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
						Morfologia de Range
					</p>
					<span className="text-xs font-bold text-rose-300 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-500/20 block">
						{defender.morphology}
					</span>
				</div>
			</div>
		</div>
	);
}
