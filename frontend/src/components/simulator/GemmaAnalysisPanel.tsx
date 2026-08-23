'use client';

import { useState } from 'react';
import { useGemmaStream } from './useGemmaStream';
import type { PhysicsSnapshot } from '@/lib/schemas';

interface GemmaAnalysisProps {
	heroPos: string;
	villainPos: string;
	potSize: number;
	heroStack: number;
	villainStack: number;
	heroInvested?: number;
	riskAdvantage?: number;
	bountyPower?: number;
	icmContext?: {
		payjumpDist?: string;
		bubbleFactor?: number;
		riskPremium?: number;
		requiredEquity?: number;
		callPercentage?: number;
		activeHand?: string;
	};
}

export function GemmaAnalysisPanel({
	heroPos,
	villainPos,
	potSize,
	heroStack,
	villainStack,
	heroInvested = 0,
	riskAdvantage = 0,
	bountyPower = 0,
	icmContext,
}: Readonly<GemmaAnalysisProps>) {
	const [selectedModel, setSelectedModel] = useState<'auto' | 'gemma4:4b' | 'gemma4:31b'>('auto');
	const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

	const handleInjectAnalysis = () => {
		const bfStr = (icmContext?.bubbleFactor ?? 1).toFixed(2);
		const reqEqStr = (icmContext?.requiredEquity ?? 50).toFixed(1);
		const callRangeStr = (icmContext?.callPercentage ?? 25).toFixed(1);
		const activeHandStr = icmContext?.activeHand ?? 'AKs';

		const prompt = `
> SYSTEM: Atue como Motor de Inferência SOTA v7.0 GOLD. Raciocínio Termodinâmico e Teoria dos Jogos Ativos.
> DATA: Matchup: ${heroPos} vs ${villainPos} | Pot: ${potSize}bb | Stacks: ${heroStack}bb / ${villainStack}bb | RiskAdv: ${riskAdvantage.toFixed(1)}% | BF: ${bfStr}x | ReqEq: ${reqEqStr}% | Defesa Total: ${callRangeStr}% | Mão em Foco: ${activeHandStr}.
> TASK: Forneça uma análise de Antevisão Estratégica (máx 150 palavras) dividida em dois tópicos de alta densidade:
- TOPOLOGIA DO RANGE & BUBBLE FACTOR: [Impacto da assimetria do BF no estreitamento do range de defesa e limiar ReqEq]
- VEREDITO SOTA: [Ação soberana de ${activeHandStr} ponderando a margem de lucratividade contra o shove do vilão]
Direto ao ponto, com rigor axiomático e sem preâmbulos.
`;
		const targetModelOverride = selectedModel === 'auto' ? undefined : selectedModel;

		const snapshot: PhysicsSnapshot = {
			heroStack: heroStack,
			pot: potSize,
			heroInvested: heroInvested,
			position: heroPos as 'IP' | 'OOP' | 'BB' | 'SB',
			referenceStatus: (icmContext?.bubbleFactor || 1) > 1.2 ? 'bubble' : 'baseline',
			villain1Stack: villainStack,
			riskAdvantage,
			bountyPower,
		};

		generateAnalysis(prompt, 256, targetModelOverride, snapshot);
	};

	return (
		<div
			className={`glass-panel p-5 sm:p-6 flex flex-col gap-4.5 rounded-3xl bg-slate-950/60 border shadow-xl transition-all duration-500 backdrop-blur-2xl relative overflow-hidden group/gemma ${
				isStreaming ? 'border-accent-emerald/40 shadow-emerald-500/10' : 'border-white/8 hover:border-white/15'
			}`}
		>
			{/* Ambient Backlight */}
			<div className="pointer-events-none absolute inset-0 bg-radial-[at_top_right] from-emerald-500/5 via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover/gemma:opacity-100" />

			{/* ═══ CABEÇALHO & SELETOR DE MODELO ═══ */}
			<div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4 relative z-10">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div
							className={`w-2.5 h-2.5 rounded-full ${
								isStreaming
									? 'bg-accent-emerald animate-ping'
									: 'bg-accent-emerald/70 shadow-[0_0_10px_var(--color-accent-emerald)]'
							}`}
						/>
						<div className="absolute inset-0 bg-accent-emerald/20 blur-md rounded-full" />
					</div>
					<div>
						<h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] m-0">
							Oráculo <span className="text-accent-emerald font-extrabold">Gemma</span>
						</h3>
						<p className="text-text-dim text-[0.52rem] font-mono uppercase tracking-wider mt-0.5 m-0">
							Inteligência Preditiva · SOTA v8.0 GOLD
						</p>
					</div>
				</div>

				{/* Seletor de Modelo Compacto */}
				<div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/8 shadow-inner">
					<button
						type="button"
						onClick={() => setSelectedModel('auto')}
						disabled={isStreaming}
						className={`px-2.5 py-1 text-[0.56rem] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
							selectedModel === 'auto'
								? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 shadow-sm'
								: 'text-text-dim hover:text-text-muted border border-transparent'
						}`}
					>
						Auto
					</button>
					<button
						type="button"
						onClick={() => setSelectedModel('gemma4:4b')}
						disabled={isStreaming}
						className={`px-2.5 py-1 text-[0.56rem] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
							selectedModel === 'gemma4:4b'
								? 'bg-accent-sky/20 text-accent-sky border border-accent-sky/30 shadow-sm'
								: 'text-text-dim hover:text-text-muted border border-transparent'
						}`}
						title="Baixa Latência (4B Edge)"
					>
						4B
					</button>
					<button
						type="button"
						onClick={() => setSelectedModel('gemma4:31b')}
						disabled={isStreaming}
						className={`px-2.5 py-1 text-[0.56rem] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
							selectedModel === 'gemma4:31b'
								? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30 shadow-sm'
								: 'text-text-dim hover:text-text-muted border border-transparent'
						}`}
						title="Deep Thinking & RAG"
					>
						31B
					</button>
				</div>
			</div>

			{/* ═══ BOTÃO DE INJEÇÃO HARMONIZADO & RESPONSIVO ═══ */}
			<div className="relative z-10 w-full">
				<button
					type="button"
					onClick={handleInjectAnalysis}
					disabled={isStreaming}
					className="w-full py-2.5 px-4 text-[0.65rem] font-black tracking-[0.2em] uppercase text-white bg-accent-indigo/15 hover:bg-accent-indigo/25 rounded-xl border border-accent-indigo/35 disabled:opacity-40 transition-all duration-300 active:scale-98 shadow-md hover:shadow-indigo-500/20 group/btn flex items-center justify-center gap-2 cursor-pointer"
				>
					{isStreaming ? (
						<span className="flex items-center gap-2.5">
							<i className="fa-solid fa-atom animate-spin text-accent-indigo text-xs" />
							<span className="animate-pulse">Sintetizando Antevisão...</span>
						</span>
					) : (
						<span className="flex items-center gap-2.5">
							<i className="fa-solid fa-bolt-lightning text-accent-indigo group-hover/btn:scale-110 transition-transform text-xs" />
							<span>Injetar Antevisão</span>
						</span>
					)}
				</button>
			</div>

			{/* ═══ TERMINAL DE SAÍDA SOTA ═══ */}
			<div className="min-h-32 text-[0.75rem] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap relative bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner overflow-hidden">
				{error && (
					<div className="text-accent-rose p-3 bg-accent-rose/10 rounded-xl border border-accent-rose/20 text-[0.62rem] font-black tracking-wider flex items-center gap-3">
						<i className="fa-solid fa-triangle-exclamation text-base shrink-0" />
						<span>ERRO NA SINAPSE: {error}</span>
					</div>
				)}
				{!error && !streamedText && isStreaming && (
					<span className="text-accent-emerald/70 italic text-[0.7rem] animate-pulse flex items-center gap-2.5">
						<i className="fa-solid fa-wifi animate-pulse" />
						<span>Estabelecendo handshake com a Mente Local...</span>
					</span>
				)}
				{!error && !streamedText && !isStreaming && (
					<span className="text-text-dim italic text-[0.7rem] flex items-center gap-2.5">
						<i className="fa-solid fa-terminal opacity-40 text-xs" />
						<span>Aguardando gatilho de injeção SOTA v8.0 GOLD...</span>
					</span>
				)}
				<div className="relative z-10 text-slate-100 leading-relaxed font-mono">
					{streamedText}
					{isStreaming && streamedText && (
						<span className="inline-block w-2 h-4 ml-2 bg-accent-emerald animate-pulse align-baseline shadow-[0_0_10px_var(--color-accent-emerald)]" />
					)}
				</div>
				<div className="absolute top-2 right-2 p-3 opacity-5 pointer-events-none">
					<i className="fa-solid fa-brain text-5xl" />
				</div>
			</div>
		</div>
	);
}
