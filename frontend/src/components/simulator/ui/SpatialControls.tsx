/**
 * IDENTITY: Controles Espaciais SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/SpatialControls.tsx
 * ROLE: Orquestrador de parâmetros de física de mesa (Pot, Stacks, Players).
 */

'use client';

import type { HeroPosition } from '@/components/simulator/engine/types';
import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import React from 'react';
import type { SotaPhysicsState } from '../hooks/useSotaSync';

interface SpatialControlsProps {
	heroPosition: HeroPosition;
	handleHeroPositionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	heroInvested: number;
	currentPot: number;
	activePlayers: number;
	isPredictive: boolean;
	onUpdatePhysics: (partial: Partial<SotaPhysicsState>) => void;
	setActivePlayers: (v: number) => void;
	setIsPredictive: (v: boolean) => void;
}

export const SpatialControls = ({
	heroPosition,
	handleHeroPositionChange,
	heroInvested,
	currentPot,
	activePlayers,
	isPredictive,
	onUpdatePhysics,
	setActivePlayers,
	setIsPredictive,
}: Readonly<SpatialControlsProps>) => {
	const isMultiway = activePlayers > 2;

	return (
		<div className="glass-panel p-8 lg:p-10 mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 items-end relative animate-sota-in overflow-hidden rounded-4xl">
			<div className="absolute top-6 right-8 flex items-center gap-3">
				<span
					id="label-antevisao"
					className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.3em] transition-colors group-hover:text-text-muted"
				>
					Modo Antevisão
				</span>
				<button
					aria-labelledby="label-antevisao"
					aria-checked={isPredictive}
					role="switch"
					onClick={() => setIsPredictive(!isPredictive)}
					className={`w-10 h-5 rounded-full transition-all relative focus-visible:ring-2 focus-visible:ring-accent-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base shadow-inner ${isPredictive ? 'bg-accent-emerald shadow-emerald-500/20' : 'bg-slate-900 border border-white/10'}`}
				>
					<div
						className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-300 ${isPredictive ? 'left-5.5' : 'left-0.5'}`}
					/>
				</button>
			</div>

			<div className="space-y-4">
				<SotaTooltip
					align="left"
					title="Ponto Zero"
					desc="Sua desvantagem estrutural inicial."
				>
					<label
						id="label-hero-pos"
						htmlFor="sim-hero-pos"
						className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-text-muted cursor-help hover:text-accent-indigo transition-colors block ml-1"
					>
						Posição (Ponto Zero)
					</label>
				</SotaTooltip>
				<select
					id="sim-hero-pos"
					value={heroPosition}
					onChange={handleHeroPositionChange}
					aria-labelledby="label-hero-pos"
					className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-5 py-3.5 text-[0.8rem] font-black text-white focus:bg-slate-950/80 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none cursor-pointer appearance-none hover:border-white/20"
				>
					<option value="BB">Big Blind [-1 BB]</option>
					<option value="SB">Small Blind [-0.5 BB]</option>
					<option value="IP">Outras Posições [0 BB]</option>
					<option value="OOP">Out of Position [0 BB]</option>
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
						onChange={(e) => onUpdatePhysics({ heroInvested: Number(e.target.value) })}
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
						onChange={(e) => onUpdatePhysics({ pot: Number(e.target.value) })}
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
				<div className="flex gap-4 items-center h-[46px]">
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
	);
};
