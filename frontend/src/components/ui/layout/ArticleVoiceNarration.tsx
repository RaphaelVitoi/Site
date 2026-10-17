'use client';

/**
 * IDENTITY: Barra de Narração Neural SOTA para Artigos (ArticleVoiceNarration)
 * PATH: src/components/ui/layout/ArticleVoiceNarration.tsx
 * ROLE: Player compacto, responsivo e esteticamente sublime para audição de artigos e ensaios
 *       com calibração fonética para Poker/PMev e despacho híbrido (Voice Nexus / SAPI).
 */

import { useCallback } from 'react';
import { useSotaSpeech } from '@/components/simulator/hooks/useSotaSpeech';

export interface ArticleVoiceNarrationProps {
	readonly title: string;
	readonly content: string;
}

export function ArticleVoiceNarration({ title, content }: ArticleVoiceNarrationProps) {
	const {
		isPlaying,
		isPaused,
		rate,
		audioSource,
		isNexusActive,
		toggle,
		stop,
		cycleRate,
	} = useSotaSpeech();

	const handleToggle = useCallback(() => {
		const fullNarrationText = `${title}. ${content}`;
		toggle(`article-${title.slice(0, 20)}`, fullNarrationText);
	}, [title, content, toggle]);

	return (
		<div className="w-full mb-8 rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:border-accent-indigo/30">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={handleToggle}
					aria-label={isPlaying ? 'Pausar narração' : 'Ouvir artigo'}
					className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm transition-all shadow-lg active:scale-95 ${
						isPlaying
							? 'bg-accent-amber text-black hover:bg-amber-400'
							: 'bg-accent-indigo text-white hover:bg-indigo-500 shadow-accent-indigo/25'
					}`}
				>
					<i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
				</button>

				<div>
					<div className="flex items-center gap-2">
						<span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white">
							{isPlaying ? 'Transmitindo Narração' : isPaused ? 'Narração Pausada' : 'Ouvir Artigo Completo'}
						</span>
						<span
							className={`px-2 py-0.5 rounded-full text-[0.55rem] font-mono font-bold border transition-colors ${
								isNexusActive || audioSource === 'nexus'
									? 'bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo-light'
									: 'bg-white/5 border-white/10 text-text-muted'
							}`}
						>
							{isNexusActive || audioSource === 'nexus' ? '✨ Gemini Studio' : '🔊 SAPI Neural'}
						</span>
					</div>
					<p className="m-0 text-[0.55rem] text-text-dim font-medium uppercase tracking-wider mt-0.5">
						Síntese Neural Calibrada • MTTs & Teoria dos Jogos
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0">
				{isPlaying && (
					<div className="flex items-center gap-1 h-4 px-2" aria-hidden="true">
						{[0.5, 0.9, 1.3, 0.7, 1.1, 0.6, 1.4, 0.8].map((h, i) => (
							<span
								key={`audio-eq-${h}-${i}`}
								className="w-0.5 bg-accent-indigo-light rounded-full animate-pulse"
								style={{
									height: `${Math.min(100, h * 100)}%`,
									animationDelay: `${i * 0.09}s`,
									animationDuration: '0.55s',
								}}
							/>
						))}
					</div>
				)}

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={cycleRate}
						title="Alterar velocidade de reprodução"
						className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[0.6rem] font-bold transition-colors"
					>
						{rate.toFixed(2)}x
					</button>

					{(isPlaying || isPaused) && (
						<button
							type="button"
							onClick={stop}
							aria-label="Parar narração"
							className="px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 text-text-muted hover:text-white text-[0.6rem] font-bold uppercase transition-colors"
						>
							<i className="fa-solid fa-stop text-xs" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default ArticleVoiceNarration;
