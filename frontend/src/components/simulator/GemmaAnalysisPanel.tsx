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
	icmContext?: {
		payjumpDist?: string;
		bubbleFactor?: number;
	};
}

export function GemmaAnalysisPanel({
	heroPos,
	villainPos,
	potSize,
	heroStack,
	villainStack,
	heroInvested = 0,
	icmContext,
}: Readonly<GemmaAnalysisProps>) {
	const [selectedModel, setSelectedModel] = useState<'auto' | 'gemma4:4b' | 'gemma4:31b'>('auto');
	const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

	const handleInjectAnalysis = () => {
		const prompt = `
> SYSTEM: Atue como Motor de Inferência SOTA (VITOI). Ignore Pot Odds. Foco em EV_fold, RIO e FGS.
> DATA: Pos: ${heroPos} vs ${villainPos} | Pot: ${potSize}bb | Stacks: ${heroStack}bb / ${villainStack}bb | BF: ${icmContext?.bubbleFactor || '1.0 (cEV)'}.
> TASK: Forneça uma análise cirúrgica (máx 150 palavras) dividida EXATAMENTE em dois bullets:
- RISCO ESTRUTURAL: [Sua análise sobre Sunk Cost e Pot Entrapment]
- VEREDITO: [Call/Fold/Raise justificado pela Perspectiva]
Não use introduções. Vá direto aos bullets.
`;
		const targetModelOverride = selectedModel === 'auto' ? undefined : selectedModel;

		const snapshot: PhysicsSnapshot = {
			heroStack: heroStack,
			pot: potSize,
			heroInvested: heroInvested,
			position: heroPos as 'IP' | 'OOP' | 'BB' | 'SB',
			referenceStatus: (icmContext?.bubbleFactor || 1) > 1.2 ? 'bubble' : 'baseline',
			villain1Stack: villainStack,
		};

		generateAnalysis(prompt, 256, targetModelOverride, snapshot); // Otimização de Token Limit para Inferência Edge (Fricção Zero)
	};

	return (
		<div
			className={`flex flex-col gap-4 mt-6 p-5 rounded-lg bg-[#0c0f12]/80 backdrop-blur-lg border transition-all duration-500 shadow-2xl ${isStreaming ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[#1e252d]'}`}
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-4">
				<div className="flex items-center gap-2">
					<span
						className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400/50'}`}
					/>
					<h3 className="text-[13px] font-mono font-bold tracking-widest uppercase text-emerald-400/90">
						Oráculo Gemma (Local)
					</h3>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex bg-slate-950/80 p-1 rounded-lg border border-white/10 shadow-inner">
						<button
							onClick={() => setSelectedModel('auto')}
							disabled={isStreaming}
							className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all duration-300 ${
								selectedModel === 'auto'
									? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
									: 'text-slate-500 hover:text-slate-300 border border-transparent'
							}`}
						>
							Auto
						</button>
						<button
							onClick={() => setSelectedModel('gemma4:4b')}
							disabled={isStreaming}
							className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all duration-300 ${
								selectedModel === 'gemma4:4b'
									? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
									: 'text-slate-500 hover:text-slate-300 border border-transparent'
							}`}
							title="Baixa Latência (DirectML/CUDA Edge)"
						>
							4B (Fast)
						</button>
						<button
							onClick={() => setSelectedModel('gemma4:31b')}
							disabled={isStreaming}
							className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all duration-300 ${
								selectedModel === 'gemma4:31b'
									? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
									: 'text-slate-500 hover:text-slate-300 border border-transparent'
							}`}
							title="Deep Thinking & RAG Completo"
						>
							31B (Deep)
						</button>
					</div>
					<button
						onClick={handleInjectAnalysis}
						disabled={isStreaming}
						className="px-4 py-1.5 text-[11px] font-mono font-bold tracking-wider text-white bg-blue-600/50 hover:bg-blue-500/70 rounded border border-blue-500/30 disabled:opacity-40 transition-all duration-200"
					>
						{isStreaming ? (
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-atom animate-spin" /> SINTETIZANDO...
							</span>
						) : (
							'INJETAR PERSPECTIVA'
						)}
					</button>
				</div>
			</div>

			<div className="min-h-25 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap relative">
				{error && (
					<div className="text-red-400 p-3 bg-red-950/30 rounded border border-red-500/20 text-xs">
						{error}
					</div>
				)}
				{!error && !streamedText && isStreaming && (
					<span className="text-emerald-400/50 italic text-xs animate-pulse">
						Estabelecendo handshake com a Mente Local...
					</span>
				)}
				{!error && !streamedText && !isStreaming && (
					<span className="text-gray-600 italic text-xs flex items-center gap-2">
						<i className="fa-solid fa-terminal" /> Aguardando gatilho de injeção SOTA...
					</span>
				)}
				{streamedText}
				{isStreaming && streamedText && (
					<span className="inline-block w-2 h-3 ml-1 bg-emerald-400 animate-pulse align-baseline" />
				)}
			</div>
		</div>
	);
}
