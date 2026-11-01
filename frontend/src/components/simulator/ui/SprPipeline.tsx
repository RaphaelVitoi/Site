'use client';

/**
 * IDENTITY: Pipeline Visual de Dissipação do Risk Premium
 * PATH: src/components/simulator/ui/SprPipeline.tsx
 * ROLE: Renderizar 4 nós (PRE -> FLOP -> TURN -> RIVER) com o RP residual por street.
 *       rpValue = oopRp × (remaining_stack / eff_stack) — RP que resta se colidir aqui.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import { useState } from 'react';
import type { SprStage } from '../solver/types';
import AnimatedNumber from './AnimatedNumber';
import { useSotaSync } from '../hooks/useSotaSync';

interface SprPipelineProps {
	/** Estágios do pipeline de dissipação de RP */
	stages: SprStage[];
	/** Índice do estágio ativo (padrão 0 = PRE) */
	activeStage?: number;
	/** Callback opcional de seleção de estágio */
	onSelectStage?: (idx: number) => void;
}

const OPACITY_CLASSES = ['opacity-100', 'opacity-70', 'opacity-50', 'opacity-30'];

function getStageTacticalNote(_stageName: string, rpValue: number): { status: string; advice: string; color: string } {
	if (rpValue >= 20) {
		return {
			status: 'Zona de Alta Pressão ICM',
			advice: 'Máxima cautela. Colisões de stack produzem dano severo de payjump. Prefira linhas de controle e pot control.',
			color: 'text-accent-gold',
		};
	}
	if (rpValue >= 10) {
		return {
			status: 'Transição & Erosão de Sunk Cost',
			advice: 'O pote já atingiu massa crítica. Os sizings sofrem downward drift (25-33% pot) para evitar alavancagem suicida.',
			color: 'text-accent-amber',
		};
	}
	return {
		status: 'Aprisionamento ao Pote (Commitment)',
		advice: 'O custo de fold supera o valor residual do stack. O pot odds impõe defesa matemática incondicional.',
		color: 'text-accent-danger',
	};
}

export default function SprPipeline({ stages, activeStage = 0, onSelectStage }: Readonly<SprPipelineProps>) {
	const { physics, isHydrated } = useSotaSync();
	const [selectedIdx, setSelectedIdx] = useState<number>(activeStage);

	if (!isHydrated) return null;

	const currentIdx = Math.min(Math.max(0, selectedIdx), stages.length - 1);
	const activeStageData = stages[currentIdx] ?? stages[0];
	const tactical = activeStageData ? getStageTacticalNote(activeStageData.name, activeStageData.rpValue) : null;
	const progressPct = stages.length > 1 ? (currentIdx / (stages.length - 1)) * 100 : 0;

	const handleStageClick = (idx: number) => {
		setSelectedIdx(idx);
		onSelectStage?.(idx);
	};

	return (
		<div className="glass-panel p-6 border-white/5 relative overflow-hidden group rounded-3xl bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
			{/* Ambient Gradient Glow */}
			<div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-accent-sky/10 blur-3xl rounded-full" />

			<div className="flex flex-wrap justify-between items-center gap-3 mb-8 pb-3 border-b border-white/5">
				<div>
					<h4 className="text-sm font-black text-text-bright uppercase tracking-widest flex items-center gap-2 m-0">
						<i className="fa-solid fa-water text-accent-sky text-xs animate-pulse" />
						<span>Dissipação Estrutural (Pot Entrapment)</span>
					</h4>
					<p className="m-0 mt-1 text-[0.55rem] font-mono text-text-dim uppercase tracking-wider">
						Erosão de Risk Premium Street a Street • Transição de Frequências
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[0.55rem] font-mono text-accent-sky uppercase tracking-widest bg-accent-sky/10 px-2.5 py-1 rounded-lg border border-accent-sky/20 shadow-inner">
						Sync: {physics.referenceStatus}
					</span>
				</div>
			</div>

			<div className="relative flex justify-between items-center py-6 px-4">
				{/* Linha conectora de fundo */}
				<div className="absolute top-1/2 left-8 right-8 h-1 bg-white/5 -translate-y-1/2 z-0 rounded-full" />

				{/* Linha conectora de progresso ativo */}
				<div
					className="absolute top-1/2 left-8 h-1 bg-linear-to-r from-accent-indigo via-accent-violet to-accent-emerald -translate-y-1/2 z-0 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
					style={{ width: `calc(${progressPct}% * 0.85)` }}
				/>

				{stages.map((stage, idx) => {
					const isActive = idx === currentIdx;
					const isDeathZone = stage.rpValue >= 35;
					const isGold = stage.rpValue >= 20 && !isDeathZone;

					let valueColor = 'text-accent-emerald';
					let ringColor = 'ring-accent-emerald/30';
					let bgActive = 'bg-accent-emerald/10';
					if (isDeathZone) {
						valueColor = 'text-accent-danger';
						ringColor = 'ring-accent-danger/30';
						bgActive = 'bg-accent-danger/10';
					} else if (isGold) {
						valueColor = 'text-accent-gold';
						ringColor = 'ring-accent-gold/30';
						bgActive = 'bg-accent-gold/10';
					}

					const opacityClass = isActive
						? 'opacity-100'
						: (OPACITY_CLASSES.at(idx) ?? 'opacity-40');
					const activeClasses = isActive
						? `border-white/30 ring-4 ${ringColor} ${bgActive} shadow-[0_0_20px_rgba(99,102,241,0.3)]`
						: 'border-white/10 hover:border-white/20';

					return (
						<button
							key={stage.name}
							type="button"
							onClick={() => handleStageClick(idx)}
							className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-500 cursor-pointer focus:outline-none ${
								isActive ? 'scale-110' : 'scale-100 hover:scale-105'
							} ${opacityClass}`}
						>
							<div
								className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 bg-slate-950 backdrop-blur-md transition-all duration-300 ${activeClasses}`}
							>
								<span className="text-[0.55rem] text-text-dim font-black uppercase tracking-tighter leading-none mb-0.5">
									{stage.name}
								</span>
								<span
									className={`text-sm sm:text-base font-black font-mono tracking-tighter ${valueColor}`}
								>
									<AnimatedNumber value={stage.rpValue} suffix="%" decimals={1} />
								</span>
							</div>
							<span className="text-[0.6rem] font-black text-text-muted uppercase tracking-wider mt-1 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
								Pot: {stage.potSize.toFixed(1)}bb
							</span>
						</button>
					);
				})}
			</div>

			{/* Cápsula de Diagnóstico da Street Selecionada */}
			{activeStageData && tactical && (
				<div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="text-[0.6rem] font-black font-mono uppercase tracking-widest text-white">
								Street: {activeStageData.name}
							</span>
							<span className="text-text-darker">·</span>
							<span className={`text-[0.58rem] font-black uppercase tracking-wider ${tactical.color}`}>
								{tactical.status}
							</span>
						</div>
						<p className="text-xs text-text-muted m-0 font-normal leading-relaxed">
							{tactical.advice}
						</p>
					</div>

					<div className="shrink-0 flex items-center gap-3">
						<div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right">
							<span className="text-[0.5rem] font-mono text-text-dim uppercase tracking-wider block">
								Pote da Street
							</span>
							<span className="text-sm font-mono font-black text-white tabular-nums">
								{activeStageData.potSize.toFixed(1)} BB
							</span>
						</div>
						<div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right">
							<span className="text-[0.5rem] font-mono text-text-dim uppercase tracking-wider block">
								RP Residual
							</span>
							<span className="text-sm font-mono font-black text-accent-sky tabular-nums">
								{activeStageData.rpValue.toFixed(1)}%
							</span>
						</div>
					</div>
				</div>
			)}

			<div className="mt-6 pt-4 border-t border-white/5 text-[0.7rem] text-text-muted leading-relaxed font-medium">
				<strong className="text-text-bright">Axioma do Aprisionamento ao Pote:</strong> O RP
				residual indica o custo da colisão <em>nesta</em> street. Conforme o pote cresce
				(Multiway ou Action), a stack perde valuation e a dor do fold (Sunk Cost) supera o
				risco de eliminação. A agressão pós-flop deve antever essa dissipação — o Teto do RP
				cai.
			</div>
		</div>
	);
}
