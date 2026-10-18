'use client';

/**
 * IDENTITY: Hook de Síntese de Voz Neural SOTA (useSotaSpeech)
 * PATH: src/components/simulator/hooks/useSotaSpeech.ts
 * ROLE: Controlador de fala híbrido SOTA (Voice Nexus Google Neural Studio :9333 + SAPI Local),
 *       com normalização fonética para Poker/PMev/ICM/GTO, aceleração in-flight e divisão de sentenças.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SotaSpeechState {
	isPlaying: boolean;
	isPaused: boolean;
	rate: number;
	activeMessageId: string | null;
	selectedVoiceName: string;
	availableVoices: SpeechSynthesisVoice[];
	audioSource: 'nexus' | 'sapi';
	isNexusActive: boolean;
}

export function cleanTextForSpeech(raw: string): string {
	if (!raw) return '';
	return raw
		.replace(/```[\s\S]*?```/g, ' [bloco de código omitido] ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\$\$[\s\S]*?\$\$/g, ' [expressão matemática omitida] ')
		.replace(/\$([^$]+)\$/g, '$1')
		.replace(/^#{1,6}\s+(\S[^\r\n]*)$/gm, '$1. ')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*\*/g, '$1')
		.replace(/^[*\-+]\s+/gm, '')
		.replace(/^>\s+/gm, '')
		.replace(/\[([^\][]+)\]\(([^()]+)\)/g, '$1')
		.replace(/\|[-:\s|]+\|/g, '')
		.replaceAll('|', ', ')
		// Calibração Acústica de Poesia e Versos
		.replace(/\s\/\s/g, ', ')
		.replace(/\(Linhas\s+(\d+)[–-](\d+)\)/gi, 'Linhas $1 a $2')
		.replace(/\b(\d+)#\s*/g, 'Ponto $1: ')
		.replaceAll('->', ' para ')
		.replaceAll('=>', ' implica ')
		.replaceAll('<=', ' menor ou igual a ')
		.replaceAll('>=', ' maior ou igual a ')
		// Calibração Acústica de Poker, Teoria dos Jogos & PMev
		.replace(/\bc-bet\b|\bcbet\b/gi, 'continuation bet')
		.replace(/\bICM\b/g, 'I C M')
		.replace(/\bchipEV\b/g, 'chip E V')
		.replace(/\bPMev\b/g, 'P M E V')
		.replace(/\bEV\b/g, 'E V')
		.replace(/\bvPIP\b/gi, 'V P I P')
		.replace(/\bPKO\b/g, 'P K O')
		.replace(/\bNash\b/g, 'Nésh')
		.replace(/\bGTO\b/g, 'G T O')
		.replace(/\br\/c\b/gi, 'raise call')
		.replace(/\bb\/f\b/gi, 'bet fold')
		.replace(/\b3-bet\b|\b3bet\b/gi, 'three bet')
		.replace(/\b4-bet\b|\b4bet\b/gi, 'four bet')
		.replace(/\bshove\b/gi, 'chove')
		.replace(/\ball-in\b|\ballin\b/gi, 'ol-in')
		.replace(/\bBB\b/g, 'big blinds')
		.replace(/\bSB\b/g, 'small blind')
		.replace(/\bBTN\b/g, 'button')
		.replace(/\bCO\b/g, 'cut-off')
		.replace(/\bHJ\b/g, 'hijack')
		.replace(/\bUTG\b/g, 'under the gun')
		.replace(/\bpot odds\b/gi, 'pót odds')
		.replace(/\bfold equity\b/gi, 'fôuld équiti')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function splitIntoSentences(text: string): string[] {
	if (!text) return [];
	const matches = text.match(/[^.!?\n]+[.!?\n]*/g);
	if (!matches?.length) return [text];
	return matches.map((s) => s.trim()).filter((s) => s.length > 1 || /[a-zA-Z0-9]/.test(s));
}

function getEffectiveRate(targetRate: number, voice: SpeechSynthesisVoice | null): number {
	const target = targetRate || 1.0;
	const name = voice?.name || '';
	const isMs = name.includes('Microsoft') || (voice && !voice.localService && !name.includes('Google'));

	if (isMs) {
		let sapiK = 0;
		if (target >= 1.0) {
			if (target <= 1.25) sapiK = ((target - 1.0) / 0.25) * 2.0;
			else if (target <= 1.5) sapiK = 2.0 + ((target - 1.25) / 0.25) * 2.0;
			else if (target <= 1.75) sapiK = 4.0 + ((target - 1.5) / 0.25) * 1.3;
			else if (target <= 2.0) sapiK = 5.3 + ((target - 1.75) / 0.25) * 1.3;
			else sapiK = Math.min(10.0, 6.6 + (target - 2.0) * 1.7);
		} else {
			sapiK = (target - 1.0) * 8.0;
		}
		return Math.min(10.0, Math.max(0.1, 10 ** (sapiK / 10) + 0.05));
	}

	if (name.includes('Google')) {
		if (target >= 1.0) {
			return 1.0 + (target - 1.0) * 0.6;
		}
		return target;
	}

	return target;
}

export function useSotaSpeech() {
	const [rate, setRate] = useState<number>(1.25);
	const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
	const [audioSource, setAudioSource] = useState<'nexus' | 'sapi'>('sapi');
	const [isNexusActive, setIsNexusActive] = useState<boolean>(false);

	const sentencesRef = useRef<string[]>([]);
	const sentenceIndexRef = useRef<number>(0);
	const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const activeIdRef = useRef<string | null>(null);
	const isPausedRef = useRef<boolean>(false);
	const rateRef = useRef<number>(1.25);
	const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
	const speakSentenceRef = useRef<(index: number) => void>(() => {});

	rateRef.current = rate;
	voiceRef.current = selectedVoice;
	activeIdRef.current = activeMessageId;
	isPausedRef.current = isPaused;

	// Carregar e filtrar vozes: apenas PT-BR e EN
	const updateVoices = useCallback(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		const all = window.speechSynthesis.getVoices();
		if (!all.length) return;

		const allowed = all.filter((v) => {
			const lang = (v.lang || '').toLowerCase().replaceAll('_', '-');
			return lang.startsWith('pt') || lang.startsWith('en');
		});

		const filtered = allowed.length > 0 ? allowed : all;
		setVoices(filtered);

		const ptVoice =
			filtered.find((v) => (v.lang || '').toLowerCase().startsWith('pt') && v.name.includes('Google')) ||
			filtered.find((v) => (v.lang || '').toLowerCase().startsWith('pt') && v.name.includes('Francisca')) ||
			filtered.find((v) => (v.lang || '').toLowerCase().startsWith('pt') && v.name.includes('Maria')) ||
			filtered.find((v) => (v.lang || '').toLowerCase().startsWith('pt') && v.name.includes('Daniel')) ||
			filtered.find((v) => (v.lang || '').toLowerCase().startsWith('pt')) ||
			filtered[0] ||
			null;

		setSelectedVoice(ptVoice);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		updateVoices();
		window.speechSynthesis.onvoiceschanged = updateVoices;

		return () => {
			if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
				window.speechSynthesis.onvoiceschanged = null;
				window.speechSynthesis.cancel();
			}
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
			}
		};
	}, [updateVoices]);

	const stop = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel();
		}
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
		}
		setIsPlaying(false);
		setIsPaused(false);
		setActiveMessageId(null);
		sentencesRef.current = [];
		sentenceIndexRef.current = 0;
		currentUtteranceRef.current = null;
		(window as unknown as { _sotaUtterance?: unknown })._sotaUtterance = null;
	}, []);

	const speakSentenceWithSapi = useCallback((index: number) => {
		if (
			typeof window === 'undefined' ||
			window.SpeechSynthesisUtterance === undefined ||
			!('speechSynthesis' in window)
		) {
			setIsPlaying(false);
			setIsPaused(false);
			setActiveMessageId(null);
			return;
		}
		const synth = window.speechSynthesis;

		if (index >= sentencesRef.current.length) {
			setIsPlaying(false);
			setIsPaused(false);
			setActiveMessageId(null);
			return;
		}

		const sentence = sentencesRef.current[index];
		const utterance = new SpeechSynthesisUtterance(sentence);
		(window as unknown as { _sotaUtterance?: SpeechSynthesisUtterance })._sotaUtterance = utterance;

		const currentVoice = voiceRef.current;
		if (currentVoice) {
			utterance.voice = currentVoice;
			utterance.lang = currentVoice.lang || 'pt-BR';
		} else {
			utterance.lang = 'pt-BR';
		}

		utterance.rate = getEffectiveRate(rateRef.current, currentVoice);
		utterance.pitch = 1.0;
		currentUtteranceRef.current = utterance;

		utterance.onstart = () => {
			setIsPlaying(true);
			setIsPaused(false);
			setAudioSource('sapi');
		};

		utterance.onend = () => {
			if (currentUtteranceRef.current !== utterance) return;
			if (isPausedRef.current) return;
			sentenceIndexRef.current++;
			speakSentenceRef.current(sentenceIndexRef.current);
		};

		utterance.onerror = (err) => {
			if (currentUtteranceRef.current !== utterance) return;
			if (err.error === 'interrupted' || err.error === 'canceled') return;
			console.warn('[useSotaSpeech] Erro na síntese SAPI:', err);
			setIsPlaying(false);
			setIsPaused(false);
			setActiveMessageId(null);
		};

		synth.speak(utterance);
	}, []);

	const speakSentenceWithNexus = useCallback(async (index: number) => {
		if (index >= sentencesRef.current.length) {
			setIsPlaying(false);
			setIsPaused(false);
			setActiveMessageId(null);
			return;
		}

		const sentence = sentencesRef.current[index];
		if (!sentence) return;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3500);

			const res = await fetch('http://127.0.0.1:9333/api/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: sentence,
					voice: 'Kore',
					rate: rateRef.current,
					style_prompt: 'Explicação técnica e didática de teoria dos jogos, poker de alta performance e cálculo de equidade com fluência natural.',
				}),
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (!data.ok || !data.audioBase64) throw new Error(data.error || 'Audio vazio');

			if (typeof window !== 'undefined' && window.Audio !== undefined) {
				audioRef.current ??= new Audio();
				const audio = audioRef.current;
				const format = data.format || 'wav';
				audio.src = `data:audio/${format};base64,${data.audioBase64}`;
				audio.playbackRate = Math.min(2.0, Math.max(0.5, rateRef.current));

				audio.onplay = () => {
					setIsPlaying(true);
					setIsPaused(false);
					setAudioSource('nexus');
					setIsNexusActive(true);
				};

				audio.onended = () => {
					if (isPausedRef.current) return;
					sentenceIndexRef.current++;
					speakSentenceRef.current(sentenceIndexRef.current);
				};

				audio.onerror = () => {
					speakSentenceWithSapi(index);
				};

				await audio.play();
				return;
			}
		} catch {
			// Fallback Voice Nexus: se falhar ou estiver indisponível, chaveia para SAPI nativo
			setIsNexusActive(false);
			speakSentenceWithSapi(index);
		}
	}, [speakSentenceWithSapi]);

	const speakSentence = useCallback((index: number) => {
		void speakSentenceWithNexus(index);
	}, [speakSentenceWithNexus]);

	speakSentenceRef.current = speakSentence;

	const applyRate = useCallback((newRate: number) => {
		setRate(newRate);
		rateRef.current = newRate;

		if (audioRef.current && isPlaying) {
			audioRef.current.playbackRate = Math.min(2.0, Math.max(0.5, newRate));
		}

		// Aceleração Instantânea em Tempo Real (In-Flight Acceleration SAPI)
		if (
			typeof window !== 'undefined' &&
			'speechSynthesis' in window &&
			window.speechSynthesis.speaking &&
			!isPausedRef.current &&
			sentencesRef.current.length > 0
		) {
			window.speechSynthesis.cancel();
			speakSentence(sentenceIndexRef.current);
		}
	}, [isPlaying, speakSentence]);

	const cycleRate = useCallback(() => {
		const rates = [1.0, 1.25, 1.5, 1.75, 2.0];
		const current = rateRef.current;
		const idx = rates.findIndex((r) => Math.abs(r - current) < 0.01);
		const nextIdx = idx >= 0 && idx < rates.length - 1 ? idx + 1 : 0;
		applyRate(rates[nextIdx] ?? 1.25);
	}, [applyRate]);

	const toggleActivePlayback = useCallback(() => {
		if (audioRef.current) {
			if (!audioRef.current.paused) {
				audioRef.current.pause();
				setIsPaused(true);
				setIsPlaying(false);
				return;
			}
			if (isPausedRef.current) {
				void audioRef.current.play().catch(() => {});
				setIsPaused(false);
				setIsPlaying(true);
				return;
			}
		}

		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			const synth = window.speechSynthesis;
			if (synth.speaking && !isPausedRef.current) {
				synth.pause();
				setIsPaused(true);
				setIsPlaying(false);
				return;
			}
			if (isPausedRef.current) {
				synth.resume();
				setIsPaused(false);
				setIsPlaying(true);
			}
		}
	}, []);

	const toggle = useCallback(
		(messageId: string, text: string) => {
			if (typeof window === 'undefined') return;

			// Pausar ou Retomar a mesma mensagem
			if (activeIdRef.current === messageId) {
				toggleActivePlayback();
				return;
			}

			// Parar reprodução anterior
			stop();

			const clean = cleanTextForSpeech(text);
			if (!clean) return;

			sentencesRef.current = splitIntoSentences(clean);
			sentenceIndexRef.current = 0;
			setActiveMessageId(messageId);
			setIsPaused(false);

			speakSentence(0);
		},
		[speakSentence, stop, toggleActivePlayback],
	);

	return {
		isPlaying,
		isPaused,
		rate,
		activeMessageId,
		selectedVoice,
		voices,
		audioSource,
		isNexusActive,
		toggle,
		stop,
		setRate: applyRate,
		cycleRate,
		setSelectedVoice,
	};
}
