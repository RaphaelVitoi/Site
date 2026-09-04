/**
 * IDENTITY: Controles Espaciais SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/SpatialControls.tsx
 * ROLE: Orquestrador de parâmetros de física de mesa (Pot, Stacks, Players).
 */

'use client';

import type { HeroPosition } from '@/components/simulator/solver/types';
import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import React from 'react';
import type { SotaPhysicsState } from '../hooks/useSotaSync';

interface SpatialControlsProps {
	heroPosition: HeroPosition;
	handleHeroPositionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	heroInvested: number;
	setHeroInvested?: (v: number) => void;
	currentPot: number;
	setCurrentPot?: (v: number) => void;
	activePlayers: number;
	isPredictive: boolean;
	onUpdatePhysics?: (partial: Partial<SotaPhysicsState>) => void;
	setActivePlayers: (v: number) => void;
	setIsPredictive: (v: boolean) => void;
}

export const SpatialControls = ({
	heroPosition,
	handleHeroPositionChange,
	heroInvested,
	setHeroInvested,
	currentPot,
	setCurrentPot,
	activePlayers,
	isPredictive,
	onUpdatePhysics,
	setActivePlayers,
	setIsPredictive,
}: Readonly<SpatialControlsProps>) => {
	const isMultiway = activePlayers > 2;

	return (
		<div className="glass-panel p-5 sm:p-7 flex flex-col gap-6 relative animate-sota-in rounded-3xl bg-slate-950/60 border border-white/10 shadow-xl">
			<div className="flex items-center justify-between border-b border-white/5 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]" />
					<span className="text-[0.62rem] font-mono font-black text-text-muted uppercase tracking-[0.25em]">
						Física de Mesa & Parâmetros Espaciais
					</span>
				</div>
				<div className="flex items-center gap-2.5">
					<span
						id="label-antevisao"
						className="text-[0.58rem] font-mono text-text-dim uppercase tracking-wider transition-colors group-hover:text-text-muted"
					>
						Modo Antevisão
					</span>
					<button
						type="button"
						aria-labelledby="label-antevisao"
						aria-checked={isPredictive}
						role="switch"
						onClick={() => setIsPredictive(!isPredictive)}
						className={`w-9 h-4.5 rounded-full transition-all relative focus-visible:ring-2 focus-visible:ring-accent-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base shadow-inner cursor-pointer ${isPredictive ? 'bg-accent-emerald shadow-emerald-500/20' : 'bg-slate-900 border border-white/10'}`}
					>
						<div
							className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-all duration-300 ${isPredictive ? 'left-4.5' : 'left-0.5'}`}
						/>
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 items-end">

			<div className="space-y-2.5">
				<SotaTooltip
					align="left"
					title="Ponto Zero"
					desc="Sua desvantagem estrutural inicial."
				>
					<label
						id="label-hero-pos"
						htmlFor="sim-hero-pos"
						className="text-[0.62rem] font-mono font-black uppercase tracking-wider text-text-muted cursor-help hover:text-accent-indigo transition-colors block ml-0.5"
					>
						Posição (Ponto Zero)
					</label>
				</SotaTooltip>
				<select
					id="sim-hero-pos"
					value={heroPosition}
					onChange={handleHeroPositionChange}
					aria-labelledby="label-hero-pos"
					className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[0.72rem] font-bold text-white focus:bg-slate-950 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none cursor-pointer appearance-none hover:border-white/20"
				>
					<option value="BB">Big Blind (-1 BB)</option>
					<option value="SB">Small Blind (-0.5 BB)</option>
					<option value="IP">In Position (IP)</option>
					<option value="OOP">Out of Position (OOP)</option>
				</select>
			</div>

			<div className="space-y-4">
				<SotaTooltip align="center" title="Investimento" desc="O abismo do seu EV de Fold.">
					<label
						htmlFor="sim-hero-invest"
						className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-text-muted cursor-help hover:text-accent-indigo transition-colors block ml-1"
					>
						Sunk Cost (Investido)
					</label>
				</SotaTooltip>
				<div className="relative group">
					<input
						id="sim-hero-invest"
						type="number"
						step="0.5"
						value={heroInvested}
						onChange={(e) => {
							const val = Number(e.target.value);
							setHeroInvested?.(val);
							onUpdatePhysics?.({ heroInvested: val });
						}}
						className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-5 py-3.5 text-[0.9rem] font-mono tabular-nums font-black text-white focus:bg-slate-950/80 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none hover:border-white/20"
					/>
					<span className="absolute right-4 top-3.5 text-[0.65rem] text-text-darker font-black tracking-widest uppercase pointer-events-none">
						BB
					</span>
				</div>
			</div>

			<div className="space-y-4">
				<SotaTooltip align="center" title="Dead Money" desc="O oxigênio do torneio.">
					<label
						htmlFor="sim-current-pot"
						className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-text-muted cursor-help hover:text-accent-indigo transition-colors block ml-1"
					>
						Pote Atual
					</label>
				</SotaTooltip>
				<div className="relative">
					<input
						id="sim-current-pot"
						type="number"
						step="0.5"
						value={currentPot}
						onChange={(e) => {
							const val = Number(e.target.value);
							setCurrentPot?.(val);
							onUpdatePhysics?.({ pot: val });
						}}
						className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-5 py-3.5 text-[0.9rem] font-mono tabular-nums font-black text-white focus:bg-slate-950/80 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none hover:border-white/20"
					/>
					<span className="absolute right-4 top-3.5 text-[0.65rem] text-text-darker font-black tracking-widest uppercase pointer-events-none">
						BB
					</span>
				</div>
			</div>

			<div className="space-y-4">
				<SotaTooltip
					align="right"
					title="Entropia Multiway"
					desc="Ações escalam quadraticamente o RIO."
				>
					<label
						htmlFor="sim-active-players"
						className={`text-[0.7rem] font-black uppercase tracking-[0.3em] cursor-help transition-colors block ml-1 ${isMultiway ? 'text-accent-danger hover:text-accent-rose' : 'text-text-muted hover:text-accent-indigo'}`}
					>
						Jogadores
					</label>
				</SotaTooltip>
				<input
					id="sim-active-players"
					type="number"
					min="2"
					max="9"
					value={activePlayers}
					onChange={(e) => setActivePlayers(Number(e.target.value))}
					className={`w-full bg-slate-950/60 rounded-xl px-5 py-3.5 text-[0.9rem] font-black focus:bg-slate-950/80 focus:ring-1 transition-all shadow-inner outline-none hover:border-white/20 ${isMultiway ? 'border-accent-danger/40 text-accent-danger focus:border-accent-danger focus:ring-accent-danger/40 border' : 'border border-white/10 text-white focus:border-accent-indigo focus:ring-accent-indigo/40'}`}
				/>
			</div>

			<div className="space-y-4">
				<SotaTooltip
					align="right"
					title="FGS Control"
					desc={
						isPredictive
							? 'Cálculo Automático via Motor SOTA.'
							: 'Ajuste manual da erosão de stack.'
					}
				>
					<label
						htmlFor="sim-fgs-control"
						className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-text-muted cursor-help hover:text-accent-indigo transition-colors block ml-1"
					>
						FGS / Erosão
					</label>
				</SotaTooltip>
				<div className="flex gap-4 items-center h-11.5">
					<input
						id="sim-fgs-control"
						type="range"
						disabled={isPredictive}
						className={`flex-1 h-1.5 rounded-full appearance-none transition-opacity ${isPredictive ? 'opacity-20 cursor-not-allowed bg-white/5' : 'bg-white/10 accent-accent-indigo cursor-pointer'}`}
					/>
					<span
						className={`text-[0.7rem] font-mono font-black w-12 text-center tracking-tighter ${isPredictive ? 'text-accent-emerald' : 'text-text-darker'}`}
					>
						{isPredictive ? 'AUTO' : 'MAN'}
					</span>
				</div>
			</div>
		</div>
		</div>
	);
};
