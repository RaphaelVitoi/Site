'use client';

/**
 * IDENTITY: Painel de FrequÃªncias ICM Quantum v4.6 GOLD
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorÃ§Ã£o GTO atravÃ©s do Organismo SOTA com estÃ©tica high-fidelity.
 * BINDING: [engine/types.ts, components/simulator/ui/*]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { motion } from 'framer-motion';
import { use, useState } from 'react';
import { SotaMetricsContext } from '../SotaContext';
import type { ChipEvFreqs, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
import { ActionRow } from '../ui/ActionRow';
import { SotaTooltip } from '../ui/SotaTooltip';
import { useGemmaStream } from '../useGemmaStream';

interface NashPanelProps {
	nashFlop: IcmDistortionResult;
	nashTurn: IcmDistortionResult;
	nashRiver: IcmDistortionResult;
	streetFreqs: StreetChipEvFreqs;
	streetRps: {
		flop: { ip: number; oop: number };
		turn: { ip: number; oop: number };
		river: { ip: number; oop: number };
	};
	aggressionFactor: number;
	pkoValue: number;
	isNearPayjump: boolean;
	blindsRisingSoon: boolean;
	isBaseline?: boolean;
	onStreetFreqChange: (street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs) => void;
	onAggressionChange: (value: number) => void;
	onPkoChange: (value: number) => void;
	onPayjumpToggle: (value: boolean) => void;
	onBlindsToggle: (value: boolean) => void;
}

interface StreetInfo {
	nash: IcmDistortionResult;
	freqs: ChipEvFreqs;
	rps: { ip: number; oop: number };
	label: string;
	color: string;
	bgClass: string;
	shadowClass: string;
	textShadowClass: string;
}

const StreetDashboards = ({
	ipRp,
	oopRp,
	current,
}: {
	ipRp: number;
	oopRp: number;
	current: StreetInfo;
}) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
		<div className="flex flex-col gap-3 p-6 bg-slate-900/40 rounded-4xl border border-white/5 shadow-inner hover:border-accent-indigo/30 hover:bg-slate-900/60 transition-all duration-500 group/ip">
			<div className="flex justify-between items-center px-1">
				<span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.4em] group-hover/ip:text-accent-indigo-light transition-colors">
					PressÃ£o Agressor (IP)
				</span>
				<i className="fa-solid fa-bolt text-accent-indigo/20 group-hover/ip:text-accent-indigo/60 transition-colors text-[0.6rem]" />
			</div>
			<div className="flex items-baseline gap-2">
				<span
					className={`text-3xl font-black font-mono tabular-nums tracking-tighter text-white ${current.textShadowClass}`}
				>
					{ipRp.toFixed(1)}
				</span>
				<span className="text-[0.65rem] font-black text-text-darker uppercase tracking-widest">
					RP %
				</span>
			</div>
			<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${Math.min(100, ipRp * 2.5)}%` }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="h-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]"
				/>
			</div>
		</div>

		<div className="flex flex-col gap-3 p-6 bg-slate-900/40 rounded-4xl border border-white/5 shadow-inner hover:border-accent-amber/30 hover:bg-slate-900/60 transition-all duration-500 group/oop md:items-end md:text-right">
			<div className="flex flex-row-reverse md:flex-row justify-between items-center px-1 w-full">
				<i className="fa-solid fa-shield-halved text-accent-amber/20 group-hover/oop:text-accent-amber/60 transition-colors text-[0.6rem]" />
				<span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.4em] group-hover/oop:text-accent-amber transition-colors">
					PressÃ£o Defensor (OOP)
				</span>
			</div>
			<div className="flex items-baseline gap-2">
				<span className="text-3xl font-black font-mono tabular-nums tracking-tighter text-accent-amber [text-shadow:0_0_20px_rgba(245,158,11,0.2)]">
					{oopRp.toFixed(1)}
				</span>
				<span className="text-[0.65rem] font-black text-text-darker uppercase tracking-widest">
					RP %
				</span>
			</div>
			<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1 flex justify-end">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${Math.min(100, oopRp * 2.5)}%` }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="h-full bg-accent-amber shadow-[0_0_10px_var(--accent-amber)]"
				/>
			</div>
		</div>
	</div>
);

const ActionStrategies = ({
	current,
	activeStreet,
	onStreetFreqChange,
}: {
	current: StreetInfo;
	activeStreet: keyof StreetChipEvFreqs;
	onStreetFreqChange: (s: keyof StreetChipEvFreqs, f: ChipEvFreqs) => void;
}) => (
	<div className="grid grid-cols-1 xl:grid-cols-2 gap-16 relative z-10">
		<div className="w-full space-y-6">
			<div className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.4em] px-2 pb-5 border-b border-accent-indigo/20 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="w-3 h-3 rounded-full bg-accent-indigo shadow-[0_0_12px_var(--accent-indigo)]" />
					IP &middot; EstratÃ©gia de AgressÃ£o
				</div>
				<i className="fa-solid fa-crosshairs text-[0.65rem] opacity-30" />
			</div>
			<div className="space-y-4 px-1">
				<ActionRow
					label="Check"
					chipEv={current.freqs.ip_check}
					result={current.nash.ip.check}
					field="ip_check"
					accent="var(--color-accent-indigo-light)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
				<ActionRow
					label="Bet S"
					chipEv={current.freqs.ip_bet_small}
					result={current.nash.ip.bet_small}
					field="ip_bet_small"
					accent="var(--color-accent-indigo-light)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
				<ActionRow
					label="Bet L"
					chipEv={current.freqs.ip_bet_large}
					result={current.nash.ip.bet_large}
					field="ip_bet_large"
					accent="var(--color-accent-indigo-light)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
			</div>
		</div>
		<div className="w-full space-y-6">
			<div className="text-[0.75rem] font-black text-accent-rose uppercase tracking-[0.4em] px-2 pb-5 border-b border-accent-rose/20 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="w-3 h-3 rounded-full bg-accent-rose shadow-[0_0_12px_var(--accent-rose)]" />
					OOP &middot; EstratÃ©gia de Defesa
				</div>
				<i className="fa-solid fa-shield text-[0.65rem] opacity-30" />
			</div>
			<div className="space-y-4 px-1">
				<ActionRow
					label="Call"
					chipEv={current.freqs.oop_call}
					result={current.nash.oop.call}
					field="oop_call"
					accent="var(--color-accent-rose)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
				<ActionRow
					label="Fold"
					chipEv={current.freqs.oop_fold}
					result={current.nash.oop.fold}
					field="oop_fold"
					accent="var(--color-accent-rose)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
				<ActionRow
					label="Raise"
					chipEv={current.freqs.oop_raise}
					result={current.nash.oop.raise}
					field="oop_raise"
					accent="var(--color-accent-rose)"
					freqs={current.freqs}
					onChange={(f) => onStreetFreqChange(activeStreet, f)}
				/>
			</div>
		</div>
	</div>
);

const EntropyModulators = ({
	aggressionFactor,
	pkoValue,
	onAggressionChange,
	onPkoChange,
}: {
	aggressionFactor: number;
	pkoValue: number;
	onAggressionChange: (v: number) => void;
	onPkoChange: (v: number) => void;
}) => (
	<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 relative z-10">
		<SotaTooltip
			align="left"
			title="Agressividade Humana (Fator Î¨)"
			content="Modulador bayesiano SOTA. Se o oponente real desvia do equilÃ­brio (ex: paga demais ou blefa de menos), a distribuiÃ§Ã£o de Nash Ã© forÃ§ada a se contrair ou expandir."
			theme="indigo"
		>
			<div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 transition-all hover:bg-slate-900/60 hover:border-accent-indigo/30 group/Î¨ shadow-inner relative overflow-hidden">
				<div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/5 to-transparent pointer-events-none" />
				<div className="flex justify-between items-center mb-8 px-1 relative z-10">
					<div className="space-y-1">
						<span className="text-[0.7rem] font-black text-text-muted uppercase tracking-[0.3em] group-hover/Î¨:text-white transition-colors">
							Modulador Î¨
						</span>
						<p className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest m-0">
							Agressividade Relativa
						</p>
					</div>
					<div className="px-5 py-2 rounded-2xl bg-black/60 border border-white/10 shadow-2xl flex items-center gap-3">
						<span className="font-mono tabular-nums text-[1rem] font-black text-accent-emerald">
							{aggressionFactor.toFixed(1)}
							<span className="text-[0.6rem] ml-1 opacity-50">Ã—</span>
						</span>
					</div>
				</div>
				<input
					id="nash-aggression"
					name="nash-aggression"
					type="range"
					min="0.5"
					max="1.5"
					step="0.1"
					value={aggressionFactor}
					onChange={(e) => onAggressionChange(Number.parseFloat(e.target.value))}
					className="w-full accent-accent-indigo h-2 bg-white/5 rounded-full appearance-none cursor-pointer mb-2 relative z-10"
					aria-label="Fator de AgressÃ£o Humana"
				/>
			</div>
		</SotaTooltip>

		<SotaTooltip
			align="right"
			title="Bounty Power"
			content="Diluidor de Risk Premium. A recompensa imediata (bounty) infla a utilidade do Call, destruindo o Teto de Risco do ICM tradicional."
			theme="indigo"
		>
			<div
				className={`bg-slate-900/40 border rounded-[2.5rem] p-8 transition-all hover:bg-slate-900/60 hover:border-accent-amber/30 group/pko shadow-inner relative overflow-hidden ${pkoValue > 0 ? 'border-accent-amber/30 shadow-emerald-500/5' : 'border-white/5'}`}
			>
				<div className="absolute inset-0 bg-radial-[at_top_left] from-accent-amber/5 to-transparent pointer-events-none" />
				<div className="flex justify-between items-center mb-8 px-1 relative z-10">
					<div className="space-y-1">
						<span className="text-[0.7rem] font-black text-text-muted uppercase tracking-[0.3em] group-hover/pko:text-white transition-colors">
							Bounty Influx
						</span>
						<p className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest m-0">
							PressÃ£o Progressiva
						</p>
					</div>
					<div className="px-5 py-2 rounded-2xl bg-black/60 border border-white/10 shadow-2xl flex items-center gap-3">
						<span className="font-mono tabular-nums text-[1rem] font-black text-accent-gold">
							{pkoValue === 0 ? '0.0' : `${Math.round(pkoValue * 100)}`}
							<span className="text-[0.6rem] ml-1 opacity-50">%</span>
						</span>
					</div>
				</div>
				<input
					id="nash-pko"
					name="nash-pko"
					type="range"
					min="0"
					max="0.8"
					step="0.05"
					value={pkoValue}
					onChange={(e) => onPkoChange(Number.parseFloat(e.target.value))}
					className="w-full accent-accent-amber h-2 bg-white/5 rounded-full appearance-none cursor-pointer mb-2 relative z-10"
					aria-label="ForÃ§a do PKO Bounty"
				/>
			</div>
		</SotaTooltip>
	</div>
);

export default function NashPanel({
	nashFlop,
	nashTurn,
	nashRiver,
	streetFreqs,
	streetRps,
	aggressionFactor,
	pkoValue,
	isNearPayjump,
	blindsRisingSoon,
	isBaseline = false,
	onStreetFreqChange,
	onAggressionChange,
	onPkoChange,
	onPayjumpToggle,
	onBlindsToggle,
}: Readonly<NashPanelProps>) {
	const [activeStreet, setActiveStreet] = useState<'flop' | 'turn' | 'river'>('flop');

	const streetData = {
		flop: {
			nash: nashFlop,
			freqs: streetFreqs.flop,
			rps: streetRps.flop,
			label: 'FLOP',
			color: 'var(--color-accent-indigo-light)',
			bgClass: 'bg-accent-indigo-light',
			shadowClass: 'shadow-[0_15px_30px_-10px_rgba(99,102,241,0.2)]',
			textShadowClass: '[text-shadow:0_0_20px_rgba(99,102,241,0.4)]',
		},
		turn: {
			nash: nashTurn,
			freqs: streetFreqs.turn,
			rps: streetRps.turn,
			label: 'TURN',
			color: 'var(--color-accent-emerald)',
			bgClass: 'bg-accent-emerald',
			shadowClass: 'shadow-[0_15px_30px_-10px_rgba(16,185,129,0.2)]',
			textShadowClass: '[text-shadow:0_0_20px_rgba(16,185,129,0.4)]',
		},
		river: {
			nash: nashRiver,
			freqs: streetFreqs.river,
			rps: streetRps.river,
			label: 'RIVER',
			color: 'var(--color-accent-danger)',
			bgClass: 'bg-accent-danger',
			shadowClass: 'shadow-[0_15px_30px_-10px_rgba(244,63,94,0.2)]',
			textShadowClass: '[text-shadow:0_0_20px_rgba(244,63,94,0.4)]',
		},
	};

	const current = streetData[activeStreet];

	const deltaRp = isBaseline ? 0 : current.nash.deltaRp;
	const ipRp = isBaseline ? 0 : current.rps.ip;
	const oopRp = isBaseline ? 0 : current.rps.oop;

	const metricsContext = use(SotaMetricsContext);
	const predictiveProfile = metricsContext?.predictiveProfile;

	const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

	const handleConsultGemma = () => {
		const prompt = `> SYSTEM: Atue como Arquiteto de Teoria dos Jogos SOTA. Foco na DistorÃ§Ã£o de Nash.
> DATA: Street: ${current.label} | IP RP: ${ipRp.toFixed(1)}% | OOP RP: ${oopRp.toFixed(1)}% | AgressÃ£o (Fator Î¨): ${aggressionFactor} | PKO Bounty: ${pkoValue}
> PROFILE: ${JSON.stringify(predictiveProfile || {})}
> TASK: ForneÃ§a uma anÃ¡lise visceral (mÃ¡x 200 palavras) explicando o desvio da estratÃ©gia GTO pura. Como as pressÃµes assimÃ©tricas do ICM e a telemetria do jogador justificam essa topologia de frequÃªncias (Check/Bet/Fold)? Use formataÃ§Ã£o avanÃ§ada.`;
		generateAnalysis(prompt, 512, 'auto', undefined, predictiveProfile ?? undefined);
	};

	const displayContent =
		streamedText ||
		'Aguardando pulso neural. Inicie a varredura para extrair o raciocÃ­nio GTO subjacente Ã  distorÃ§Ã£o.';

	return (
		<div className="glass-panel flex flex-col gap-10 p-8 sm:p-10 lg:p-14 transition-all duration-700 rounded-4xl bg-bg-panel/80 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative overflow-hidden group/nash">
			<div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none group-hover/nash:bg-accent-indigo/15 transition-all duration-1000" />
			<div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-rose/5 blur-[120px] rounded-full pointer-events-none" />

			{/* Header com Status do Motor */}
			<div className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-8 gap-6 relative z-10">
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_15px_var(--color-accent-indigo)] animate-pulse" />
						<h3 className="m-0 text-[0.75rem] font-black text-white uppercase tracking-[0.4em] group-hover/nash:text-glow-indigo transition-all duration-500">
							FrequÃªncias ICM Quantum
						</h3>
					</div>
					<p className="m-0 text-[0.6rem] text-text-dim font-medium uppercase tracking-[0.2em] flex items-center gap-2 leading-none">
						<span className="text-accent-indigo-light font-black group-hover/nash:text-glow-indigo transition-all duration-500">
							Motor SOTA v6.2.1
						</span>
						<span className="opacity-20 text-white">|</span>
						<span>Organismo de Valuation</span>
					</p>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-[0.3em]">
						Instabilidade Î´
					</span>
					<div
						className={`px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-[0.8rem] font-black font-mono tabular-nums whitespace-nowrap shadow-2xl flex items-center gap-2 transition-colors ${deltaRp > 0 ? 'text-accent-amber' : 'text-accent-emerald'}`}
					>
						<div
							className={`w-1 h-1 rounded-full ${deltaRp > 0 ? 'bg-accent-amber animate-pulse' : 'bg-accent-emerald'}`}
						/>
						{deltaRp >= 0 ? '+' : ''}
						{deltaRp.toFixed(1)}%
					</div>
				</div>
			</div>

			{/* Toggles TÃ¡ticos */}
			<div
				id="quantum-controls"
				className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10"
			>
				{isNearPayjump ? (
					<button
						aria-pressed="true"
						onClick={() => onPayjumpToggle(false)}
						className="py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.25em] transition-all duration-500 cursor-pointer border flex items-center justify-center gap-3 group/btn active:scale-95 shadow-2xl bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald shadow-emerald-500/10"
					>
						<div className="w-1.5 h-1.5 rounded-full transition-all duration-500 bg-accent-emerald shadow-[0_0_12px_var(--accent-emerald)] scale-110" />
						Payjump Iminente
					</button>
				) : (
					<button
						aria-pressed="false"
						onClick={() => onPayjumpToggle(true)}
						className="py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.25em] transition-all duration-500 cursor-pointer border flex items-center justify-center gap-3 group/btn active:scale-95 shadow-2xl bg-slate-900/40 border-white/5 text-text-muted hover:bg-slate-900/60 hover:border-white/20"
					>
						<div className="w-1.5 h-1.5 rounded-full transition-all duration-500 bg-text-darker group-hover/btn:bg-text-muted" />
						Salto de PrÃªmios
					</button>
				)}

				{blindsRisingSoon ? (
					<button
						aria-pressed="true"
						onClick={() => onBlindsToggle(false)}
						className="py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.25em] transition-all duration-500 cursor-pointer border flex items-center justify-center gap-3 group/btn active:scale-95 shadow-2xl bg-accent-danger/10 border-accent-danger/40 text-accent-danger shadow-rose-500/10"
					>
						<div className="w-1.5 h-1.5 rounded-full transition-all duration-500 bg-accent-danger shadow-[0_0_12px_var(--accent-danger)] animate-pulse scale-110" />
						Blinds Subindo
					</button>
				) : (
					<button
						aria-pressed="false"
						onClick={() => onBlindsToggle(true)}
						className="py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.25em] transition-all duration-500 cursor-pointer border flex items-center justify-center gap-3 group/btn active:scale-95 shadow-2xl bg-slate-900/40 border-white/5 text-text-muted hover:bg-slate-900/60 hover:border-white/20"
					>
						<div className="w-1.5 h-1.5 rounded-full transition-all duration-500 bg-text-darker group-hover/btn:bg-text-muted" />
						Custo de Ã“rbita
					</button>
				)}
			</div>

			{/* Street Selector - EstÃ©tica High-End */}
			<div className="flex gap-3 p-1.5 bg-slate-950/60 rounded-3xl border border-white/5 shadow-inner relative z-10 overflow-x-auto scrollbar-hide">
				{(['flop', 'turn', 'river'] as const).map((s) => {
					const d = streetData[s];
					const isActive = s === activeStreet;
					const avgRp = isBaseline ? 0 : (d.rps.ip + d.rps.oop) / 2;
					const activeClasses = `bg-slate-900/90 border-white/10 -translate-y-1 scale-[1.02] ${d.shadowClass}`;
					const inactiveClasses =
						'bg-transparent border-transparent text-text-darker opacity-40 hover:opacity-100 hover:text-text-muted';

					return (
						<button
							key={s}
							type="button"
							onClick={() => setActiveStreet(s)}
							className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border transition-all duration-700 ease-out cursor-pointer min-w-28 ${isActive ? activeClasses : inactiveClasses}`}
						>
							<span
								className={`text-[0.7rem] font-black uppercase tracking-[0.25em] ${isActive ? 'text-white' : 'text-text-darker'}`}
							>
								{d.label}
							</span>
							<div className="flex items-center gap-1.5">
								<div className={`w-1 h-1 rounded-full ${d.bgClass}`} />
								<span
									className={`text-[0.55rem] font-mono font-black tabular-nums tracking-tighter ${isActive ? 'text-text-muted' : 'text-text-darker'}`}
								>
									RP {avgRp.toFixed(1)}%
								</span>
							</div>
						</button>
					);
				})}
			</div>

			<StreetDashboards ipRp={ipRp} oopRp={oopRp} current={current} />
			<ActionStrategies
				current={current}
				activeStreet={activeStreet}
				onStreetFreqChange={onStreetFreqChange}
			/>
			<EntropyModulators
				aggressionFactor={aggressionFactor}
				pkoValue={pkoValue}
				onAggressionChange={onAggressionChange}
				onPkoChange={onPkoChange}
			/>

			{/* ORÃCULO DE BORDA (GEMMA 4) - ANÃLISE DE DISTORÃ‡ÃƒO */}
			<div className="mt-6 pt-10 border-t border-white/5 relative z-10">
				<div className="flex items-center justify-between mb-8">
					<h4 className="text-[0.8rem] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
						<i className="fa-solid fa-microchip text-accent-indigo" />
						<span>AnÃ¡lise Preditiva (Gemma Edge)</span>
					</h4>
					<button
						onClick={handleConsultGemma}
						disabled={isStreaming}
						className="px-5 py-2.5 bg-accent-indigo/10 hover:bg-accent-indigo/20 text-accent-indigo-light text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-xl border border-accent-indigo/30 transition-all disabled:opacity-50 flex items-center gap-2"
					>
						{isStreaming ? (
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-atom animate-spin" />
								<span>Processando...</span>
							</span>
						) : (
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-radar" />
								<span>Injetar Telemetria</span>
							</span>
						)}
					</button>
				</div>

				<div className="p-8 bg-black/40 border border-white/5 rounded-3xl shadow-inner relative overflow-hidden">
					<div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 blur-[50px] rounded-full pointer-events-none" />
					{error && (
						<div className="text-accent-danger text-xs mb-4 bg-accent-danger/10 border border-accent-danger/20 p-3 rounded-lg">
							{error}
						</div>
					)}
					<div className="relative z-10">
						<SotaMarkdown content={displayContent} />
					</div>
				</div>
			</div>
		</div>
	);
}
