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
			className={`glass-panel mt-12 p-8! lg:p-12! flex flex-col gap-10 transition-all duration-700 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border-white/10 ${isStreaming ? 'border-accent-emerald/40 shadow-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 gap-8 relative z-10">
				<div className="flex items-center gap-5 group/title">
					<div className="relative">
						<div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-accent-emerald animate-ping' : 'bg-accent-emerald/40 shadow-[0_0_15px_var(--accent-emerald)]'}`} />
						<div className="absolute inset-0 bg-accent-emerald/20 blur-xl rounded-full" />
					</div>
					<div>
						<h3 className="text-white font-black text-xl tracking-[0.3em] uppercase m-0 group-hover/title:text-glow-emerald transition-all duration-500">
							Oráculo <span className="text-text-darker ml-1">Gemma</span>
						</h3>
						<p className="text-text-darker text-[0.6rem] font-black tracking-[0.4em] uppercase mt-1.5 m-0">
							Inteligência Preditiva SOTA v7.0 GOLD
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-6">
					<div className="flex bg-slate-950/80 p-2 rounded-2xl border border-white/10 shadow-inner backdrop-blur-xl">
						<button
							type="button"
							onClick={() => setSelectedModel('auto')}
							disabled={isStreaming}
							className={`px-5 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 active:scale-95 ${
								selectedModel === 'auto'
									? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 shadow-xl'
									: 'text-text-darker hover:text-text-muted border border-transparent'
							}`}
						>
							Auto
						</button>
						<button
							type="button"
							onClick={() => setSelectedModel('gemma4:4b')}
							disabled={isStreaming}
							className={`px-5 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 active:scale-95 ${
								selectedModel === 'gemma4:4b'
									? 'bg-accent-sky/15 text-accent-sky border border-accent-sky/30 shadow-xl'
									: 'text-text-darker hover:text-text-muted border border-transparent'
							}`}
							title="Baixa Latência (4B Edge)"
						>
							4B
						</button>
						<button
							type="button"
							onClick={() => setSelectedModel('gemma4:31b')}
							disabled={isStreaming}
							className={`px-5 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 active:scale-95 ${
								selectedModel === 'gemma4:31b'
									? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/30 shadow-xl'
									: 'text-text-darker hover:text-text-muted border border-transparent'
							}`}
							title="Deep Thinking & RAG"
						>
							31B
						</button>
					</div>
					<button
						type="button"
						onClick={handleInjectAnalysis}
						disabled={isStreaming}
						className="px-10 py-4 text-[0.7rem] font-black tracking-[0.3em] text-white bg-accent-indigo/15 hover:bg-accent-indigo/25 rounded-2xl border border-accent-indigo/40 disabled:opacity-40 transition-all duration-500 active:scale-90 shadow-2xl hover:shadow-indigo-500/20 group/btn whitespace-nowrap"
					>
						{isStreaming ? (
							<span className="flex items-center gap-4">
								<i className="fa-solid fa-atom animate-spin text-accent-indigo" />
								<span className="animate-pulse">SINTETIZANDO...</span>
							</span>
						) : (
							<span className="flex items-center gap-4">
								<i className="fa-solid fa-bolt-lightning text-accent-indigo group-hover/btn:scale-110 transition-transform" />
								<span>INJETAR ANTEVISÃO</span>
							</span>
						)}
					</button>
				</div>
			</div>

			<div className="min-h-40 text-[1rem] text-text-muted font-mono leading-relaxed whitespace-pre-wrap relative bg-black/50 rounded-4xl p-10 border border-white/5 shadow-inner">
				{error && (
					<div className="text-accent-rose p-8 bg-accent-rose/10 rounded-3xl border border-accent-rose/20 text-[0.7rem] font-black tracking-widest flex items-center gap-5">
						<i className="fa-solid fa-triangle-exclamation text-xl" />
						<span>ERRO NA SINAPSE: {error}</span>
					</div>
				)}
				{!error && !streamedText && isStreaming && (
					<span className="text-accent-emerald/60 italic text-[0.9rem] animate-pulse flex items-center gap-4">
						<i className="fa-solid fa-wifi animate-pulse" />
						<span>Estabelecendo handshake com a Mente Local...</span>
					</span>
				)}
				{!error && !streamedText && !isStreaming && (
					<span className="text-text-darker italic text-[0.9rem] flex items-center gap-4">
						<i className="fa-solid fa-terminal opacity-50" />
						<span>Aguardando gatilho de injeção SOTA v7.0 GOLD...</span>
					</span>
				)}
				<div className="relative z-10 text-white/90 leading-loose">
					{streamedText}
					{isStreaming && streamedText && (
						<span className="inline-block w-2.5 h-5 ml-3 bg-accent-emerald animate-pulse align-baseline shadow-[0_0_15px_var(--accent-emerald)]" />
					)}
				</div>
				<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
					<i className="fa-solid fa-brain text-9xl" />
				</div>
			</div>
		</div>
	);
}
