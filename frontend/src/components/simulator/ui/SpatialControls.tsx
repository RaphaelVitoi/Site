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
		<div className="glass-panel p-5 sm:p-6 flex flex-col gap-5 relative animate-sota-in rounded-3xl bg-slate-950/70 border border-white/10 shadow-xl overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-white/5 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]" />
					<span className="text-[0.64rem] font-mono font-black text-text-muted uppercase tracking-[0.2em]">
						Física de Mesa & Parâmetros Espaciais
					</span>
				</div>
				<div className="flex items-center gap-2.5">
					<span
						id="label-antevisao"
						className="text-[0.58rem] font-mono text-text-dim uppercase tracking-wider transition-colors hover:text-text-muted"
					>
						Modo Antevisão
					</span>
					<button
						type="button"
						aria-labelledby="label-antevisao"
						aria-checked={isPredictive}
						role="switch"
						onClick={() => setIsPredictive(!isPredictive)}
						className={`w-9 h-4.5 rounded-full transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emerald shadow-inner cursor-pointer ${
							isPredictive
								? 'bg-accent-emerald shadow-emerald-500/20'
								: 'bg-slate-900 border border-white/10'
						}`}
					>
						<div
							className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-all duration-300 ${
								isPredictive ? 'left-4.5' : 'left-0.5'
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Grid Estruturada e Espaçosa: Linha 1 (Spot - 3 cols) e Linha 2 (Mesa & FGS - 2 cols) */}
			<div className="flex flex-col gap-3.5">
				{/* Linha 1: Dinâmica do Spot (3 Colunas Amplas e Legíveis) */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{/* 1. Posição (Ponto Zero) */}
					<div className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/8 hover:border-white/15 transition-all gap-2">
						<div className="h-7 flex items-center min-w-0">
							<SotaTooltip
								align="left"
								title="Ponto Zero"
								desc="Sua desvantagem estrutural inicial."
								fullWidth
							>
								<label
									id="label-hero-pos"
									htmlFor="sim-hero-pos"
									className="text-[0.68rem] font-mono font-bold uppercase tracking-wide text-text-muted cursor-help hover:text-accent-indigo transition-colors block"
								>
									Posição (Ponto Zero)
								</label>
							</SotaTooltip>
						</div>
						<div className="relative h-11 w-full">
							<select
								id="sim-hero-pos"
								value={heroPosition}
								onChange={handleHeroPositionChange}
								aria-labelledby="label-hero-pos"
								className="w-full h-11 bg-slate-950/90 border border-white/10 rounded-xl px-3.5 pr-8 text-[0.8rem] font-mono font-bold text-white focus:bg-slate-950 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none cursor-pointer appearance-none hover:border-white/20"
							>
								<option value="BB">BB · Big Blind (-1 BB)</option>
								<option value="SB">SB · Small Blind (-0.5 BB)</option>
								<option value="IP">IP · In Position (Agressor)</option>
								<option value="OOP">OOP · Out of Position (Defensor)</option>
							</select>
							<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-dim text-[0.65rem]">
								▼
							</div>
						</div>
					</div>

					{/* 2. Sunk Cost (Investido) */}
					<div className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/8 hover:border-white/15 transition-all gap-2">
						<div className="h-7 flex items-center min-w-0">
							<SotaTooltip
								align="center"
								title="Investimento"
								desc="O abismo do seu EV de Fold."
								fullWidth
							>
								<label
									htmlFor="sim-hero-invest"
									className="text-[0.68rem] font-mono font-bold uppercase tracking-wide text-text-muted cursor-help hover:text-accent-indigo transition-colors block"
								>
									Sunk Cost (Investido)
								</label>
							</SotaTooltip>
						</div>
						<div className="relative h-11 w-full">
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
								className="w-full h-11 bg-slate-950/90 border border-white/10 rounded-xl pl-3.5 pr-12 text-[0.92rem] font-mono tabular-nums font-bold text-white focus:bg-slate-950 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none hover:border-white/20"
							/>
							<span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.68rem] font-mono font-black text-text-dim tracking-wider uppercase pointer-events-none">
								BB
							</span>
						</div>
					</div>

					{/* 3. Pote Atual */}
					<div className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/8 hover:border-white/15 transition-all gap-2">
						<div className="h-7 flex items-center min-w-0">
							<SotaTooltip
								align="center"
								title="Dead Money"
								desc="O oxigênio do torneio."
								fullWidth
							>
								<label
									htmlFor="sim-current-pot"
									className="text-[0.68rem] font-mono font-bold uppercase tracking-wide text-text-muted cursor-help hover:text-accent-indigo transition-colors block"
								>
									Pote Atual
								</label>
							</SotaTooltip>
						</div>
						<div className="relative h-11 w-full">
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
								className="w-full h-11 bg-slate-950/90 border border-white/10 rounded-xl pl-3.5 pr-12 text-[0.92rem] font-mono tabular-nums font-bold text-white focus:bg-slate-950 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all shadow-inner outline-none hover:border-white/20"
							/>
							<span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.68rem] font-mono font-black text-text-dim tracking-wider uppercase pointer-events-none">
								BB
							</span>
						</div>
					</div>
				</div>

				{/* Linha 2: Estrutura da Mesa & Tempo (2 Colunas Amplas) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* 4. Jogadores Ativos */}
					<div className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/8 hover:border-white/15 transition-all gap-2">
						<div className="h-7 flex items-center min-w-0">
							<SotaTooltip
								align="left"
								title="Entropia Multiway"
								desc="Ações escalam quadraticamente o RIO."
								fullWidth
							>
								<label
									htmlFor="sim-active-players"
									className={`text-[0.68rem] font-mono font-bold uppercase tracking-wide cursor-help transition-colors block ${
										isMultiway
											? 'text-accent-danger hover:text-accent-rose'
											: 'text-text-muted hover:text-accent-indigo'
									}`}
								>
									Jogadores Ativos
								</label>
							</SotaTooltip>
						</div>
						<div className="relative h-11 w-full">
							<input
								id="sim-active-players"
								type="number"
								min="2"
								max="9"
								value={activePlayers}
								onChange={(e) => setActivePlayers(Number(e.target.value))}
								className={`w-full h-11 bg-slate-950/90 rounded-xl pl-3.5 pr-16 text-[0.92rem] font-mono tabular-nums font-bold focus:bg-slate-950 focus:ring-1 transition-all shadow-inner outline-none hover:border-white/20 ${
									isMultiway
										? 'border-accent-danger/40 text-accent-danger focus:border-accent-danger focus:ring-accent-danger/40 border'
										: 'border border-white/10 text-white focus:border-accent-indigo focus:ring-accent-indigo/40'
								}`}
							/>
							<span
								className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.62rem] font-mono font-black tracking-wider uppercase pointer-events-none px-1.5 py-0.5 rounded border ${
									isMultiway
										? 'text-accent-danger bg-accent-danger/10 border-accent-danger/30'
										: 'text-text-dim bg-white/5 border-white/10'
								}`}
							>
								{isMultiway ? 'MULTIWAY' : 'HEADS-UP'}
							</span>
						</div>
					</div>

					{/* 5. FGS / Erosão */}
					<div className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 border border-white/8 hover:border-white/15 transition-all gap-2">
						<div className="h-7 flex items-center min-w-0">
							<SotaTooltip
								align="right"
								title="FGS Control"
								desc={
									isPredictive
										? 'Cálculo Automático via Motor SOTA.'
										: 'Ajuste manual da erosão de stack.'
								}
								fullWidth
							>
								<label
									htmlFor="sim-fgs-control"
									className="text-[0.68rem] font-mono font-bold uppercase tracking-wide text-text-muted cursor-help hover:text-accent-indigo transition-colors block"
								>
									FGS / Erosão Temporal
								</label>
							</SotaTooltip>
						</div>
						<div className="flex gap-3 items-center h-11 w-full px-3.5 bg-slate-950/90 border border-white/10 rounded-xl hover:border-white/20 transition-all">
							<input
								id="sim-fgs-control"
								type="range"
								disabled={isPredictive}
								className={`flex-1 min-w-0 h-1.5 rounded-full appearance-none transition-opacity ${
									isPredictive
										? 'opacity-20 cursor-not-allowed bg-white/5'
										: 'bg-white/10 accent-accent-indigo cursor-pointer'
								}`}
							/>
							<span
								className={`text-[0.62rem] font-mono font-black shrink-0 px-2 py-0.5 rounded tracking-wider border ${
									isPredictive
										? 'text-accent-emerald bg-emerald-500/10 border-emerald-500/20'
										: 'text-text-dim bg-white/5 border-white/10'
								}`}
							>
								{isPredictive ? 'AUTO' : 'MANUAL'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
