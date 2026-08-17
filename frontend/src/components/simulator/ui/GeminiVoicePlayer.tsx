'use client';

/**
 * IDENTITY: SOTA Gemini Voice Player PT-BR Feminina (v7.0 GOLD)
 * PATH: src/components/simulator/ui/GeminiVoicePlayer.tsx
 * ROLE: Player de síntese de voz neural padrão ouro (PT-BR Feminina)
 *       com animação de espectro sonoro, controle de prosódia e leitura de insights ICM.
 */

import { useCallback, useEffect, useState } from 'react';

export interface GeminiVoicePlayerProps {
	defaultText?: string;
	title?: string;
	onPlaybackStart?: () => void;
	onPlaybackEnd?: () => void;
}

export function GeminiVoicePlayer({
	defaultText = 'Sistema SOTA v7.0 GOLD operando com síntese de voz padrão ouro sob governança de Raphael Vitoi.',
	title = 'Assistente de Voz Gemini (PT-BR)',
	onPlaybackStart,
	onPlaybackEnd,
}: Readonly<GeminiVoicePlayerProps>) {
	const [text, setText] = useState(defaultText);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
	const [rate, setRate] = useState<number>(1.05); // Ritmo ideal
	const [pitch] = useState<number>(1.0);
	const [isSupported, setIsSupported] = useState<boolean>(true);

	// Carrega e filtra vozes femininas em Português do Brasil
	useEffect(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			setIsSupported(false);
			return;
		}

		const updateVoices = () => {
			const allVoices = window.speechSynthesis.getVoices();
			const ptBrVoices = allVoices.filter(
				(v) => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt')
			);

			setVoices(ptBrVoices.length > 0 ? ptBrVoices : allVoices);

			// Prioridade para vozes femininas neurais em PT-BR
			const femalePtBr = ptBrVoices.find(
				(v) =>
					v.name.includes('Francisca') ||
					v.name.includes('Maria') ||
					v.name.includes('Luciana') ||
					v.name.includes('Yara') ||
					v.name.includes('Google português do Brasil') ||
					v.name.includes('Female')
			);

			setSelectedVoice(femalePtBr || ptBrVoices[0] || allVoices[0] || null);
		};

		updateVoices();
		window.speechSynthesis.onvoiceschanged = updateVoices;

		return () => {
			if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	const handlePlay = useCallback(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

		if (isPaused) {
			window.speechSynthesis.resume();
			setIsPaused(false);
			setIsPlaying(true);
			return;
		}

		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		if (selectedVoice) {
			utterance.voice = selectedVoice;
			utterance.lang = selectedVoice.lang || 'pt-BR';
		}
		utterance.rate = rate;
		utterance.pitch = pitch;

		utterance.onstart = () => {
			setIsPlaying(true);
			setIsPaused(false);
			onPlaybackStart?.();
		};

		utterance.onend = () => {
			setIsPlaying(false);
			setIsPaused(false);
			onPlaybackEnd?.();
		};

		utterance.onerror = (e) => {
			console.warn('[GeminiVoicePlayer] Erro na síntese:', e);
			setIsPlaying(false);
			setIsPaused(false);
			onPlaybackEnd?.();
		};

		window.speechSynthesis.speak(utterance);
	}, [text, selectedVoice, rate, pitch, isPaused, onPlaybackStart, onPlaybackEnd]);

	const handlePause = useCallback(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		window.speechSynthesis.pause();
		setIsPaused(true);
		setIsPlaying(false);
	}, []);

	const handleStop = useCallback(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		setIsPlaying(false);
		setIsPaused(false);
	}, []);

	if (!isSupported) {
		return null;
	}

	return (
		<div className="bg-black/50 border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-accent-indigo/10 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo-light">
						<i className="fa-solid fa-volume-high text-xs" />
					</div>
					<div>
						<h4 className="text-[0.7rem] font-black text-white uppercase tracking-[0.2em] m-0">
							{title}
						</h4>
						<p className="m-0 text-[0.55rem] text-text-dim font-medium uppercase tracking-wider">
							Voz Neural PT-BR Feminina • Síntese em Tempo Real
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isPlaying && (
						<div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[0.55rem] font-mono font-bold">
							<span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
							<span>Transmitindo</span>
						</div>
					)}
					{selectedVoice && (
						<span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-text-muted text-[0.55rem] font-mono truncate max-w-40">
							{selectedVoice.name}
						</span>
					)}
				</div>
			</div>

			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				rows={2}
				placeholder="Digite ou selecione o texto para narração..."
				className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[0.7rem] font-mono text-text-light placeholder:text-text-darker focus:outline-none focus:border-accent-indigo transition-all shadow-inner resize-none"
			/>

			{/* Animação Waveform quando ativo */}
			{isPlaying && (
				<div className="flex items-center justify-center gap-1 h-5 py-1">
					{[0.4, 0.8, 1.2, 0.6, 1.0, 0.7, 1.4, 0.9, 0.5, 1.1, 0.8, 1.3].map((h, i) => (
						<div
							key={i}
							className="w-1 bg-accent-indigo-light rounded-full animate-pulse"
							style={{
								height: `${Math.min(100, h * 100)}%`,
								animationDelay: `${i * 0.08}s`,
								animationDuration: '0.6s',
							}}
						/>
					))}
				</div>
			)}

			<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
				<div className="flex items-center gap-2">
					<button
						onClick={isPlaying ? handlePause : handlePlay}
						className={`px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
							isPlaying
								? 'bg-accent-amber text-black hover:bg-amber-400'
								: 'bg-accent-indigo text-white hover:bg-indigo-500 shadow-lg shadow-accent-indigo/20 active:scale-95'
						}`}
					>
						<i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`} />
						<span>{isPlaying ? 'Pausar' : isPaused ? 'Retomar' : 'Ouvir Insight'}</span>
					</button>

					{(isPlaying || isPaused) && (
						<button
							onClick={handleStop}
							className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-text-muted hover:text-white text-[0.65rem] font-black uppercase tracking-wider transition-all"
						>
							<i className="fa-solid fa-stop text-xs mr-1" />
							<span>Parar</span>
						</button>
					)}
				</div>

				<div className="flex items-center gap-4 text-[0.55rem] font-mono text-text-dim">
					<div className="flex items-center gap-1.5">
						<span>Velocidade:</span>
						<select
							aria-label="Velocidade de Reprodução"
							value={rate}
							onChange={(e) => setRate(Number.parseFloat(e.target.value))}
							className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-white font-bold focus:outline-none"
						>
							<option value="0.85">0.85x</option>
							<option value="1.0">1.0x</option>
							<option value="1.05">1.05x (SOTA)</option>
							<option value="1.2">1.2x</option>
						</select>
					</div>

					{voices.length > 1 && (
						<div className="flex items-center gap-1.5">
							<span>Voz:</span>
							<select
								aria-label="Seleção de Voz"
								value={selectedVoice?.name || ''}
								onChange={(e) => {
									const v = voices.find((item) => item.name === e.target.value);
									if (v) setSelectedVoice(v);
								}}
								className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-white font-bold focus:outline-none max-w-32 truncate"
							>
								{voices.map((v) => (
									<option key={v.name} value={v.name}>
										{v.name}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
