'use client';

/**
 * IDENTITY: Hook de Síntese de Voz Neural SOTA (useSotaSpeech)
 * PATH: src/components/simulator/hooks/useSotaSpeech.ts
 * ROLE: Controlador de fala em tempo real com calibração acústica SAPI/Google,
 *       aceleração in-flight, divisão de sentenças e sanitização KaTeX/Markdown.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SotaSpeechState {
	isPlaying: boolean;
	isPaused: boolean;
	rate: number;
	activeMessageId: string | null;
	selectedVoiceName: string;
	availableVoices: SpeechSynthesisVoice[];
}

function cleanTextForSpeech(raw: string): string {
	if (!raw) return '';
	return raw
		.replace(/```[\s\S]*?```/g, ' [bloco de código omitido] ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\$\$[\s\S]*?\$\$/g, ' [expressão matemática omitida] ')
		.replace(/\$([^\$]+)\$/g, '$1')
		.replace(/^#{1,6}\s+(.*)$/gm, '$1. ')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*\*/g, '$1')
		.replace(/^[*\-+]\s+/gm, '')
		.replace(/^>\s+/gm, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\|[-:\s|]+\|/g, '')
		.replace(/\|/g, ', ')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function splitIntoSentences(text: string): string[] {
	if (!text) return [];
	const matches = text.match(/[^.!?\n]+[.!?\n]*/g);
	if (!matches || !matches.length) return [text];
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
	const [rate, setRateState] = useState<number>(1.5);
	const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

	const sentencesRef = useRef<string[]>([]);
	const sentenceIndexRef = useRef<number>(0);
	const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const activeIdRef = useRef<string | null>(null);
	const isPausedRef = useRef<boolean>(false);
	const rateRef = useRef<number>(1.5);
	const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

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
			const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
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
				window.speechSynthesis.cancel();
			}
		};
	}, [updateVoices]);

	const stop = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel();
		}
		setIsPlaying(false);
		setIsPaused(false);
		setActiveMessageId(null);
		sentencesRef.current = [];
		sentenceIndexRef.current = 0;
		currentUtteranceRef.current = null;
		(window as unknown as { _sotaUtterance?: unknown })._sotaUtterance = null;
	}, []);

	const speakSentence = useCallback((index: number) => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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
		};

		utterance.onend = () => {
			if (currentUtteranceRef.current !== utterance) return;
			if (isPausedRef.current) return;
			sentenceIndexRef.current++;
			speakSentence(sentenceIndexRef.current);
		};

		utterance.onerror = (err) => {
			if (currentUtteranceRef.current !== utterance) return;
			if (err.error === 'interrupted' || err.error === 'canceled') return;
			console.warn('[useSotaSpeech] Erro na síntese:', err);
			setIsPlaying(false);
			setIsPaused(false);
			setActiveMessageId(null);
		};

		synth.speak(utterance);
	}, []);

	const setRate = useCallback((newRate: number) => {
		setRateState(newRate);
		rateRef.current = newRate;

		// Aceleração Instantânea em Tempo Real (In-Flight Acceleration)
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
	}, [speakSentence]);

	const cycleRate = useCallback(() => {
		const rates = [1.0, 1.25, 1.5, 1.75, 2.0];
		const current = rateRef.current;
		const idx = rates.findIndex((r) => Math.abs(r - current) < 0.01);
		const nextIdx = idx >= 0 && idx < rates.length - 1 ? idx + 1 : 0;
		setRate(rates[nextIdx] ?? 1.5);
	}, [setRate]);

	const toggle = useCallback(
		(messageId: string, text: string) => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
			const synth = window.speechSynthesis;

			// Pausar ou Retomar a mesma mensagem
			if (activeIdRef.current === messageId) {
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
					return;
				}
			}

			// Parar reprodução anterior
			synth.cancel();

			const clean = cleanTextForSpeech(text);
			if (!clean) return;

			sentencesRef.current = splitIntoSentences(clean);
			sentenceIndexRef.current = 0;
			setActiveMessageId(messageId);
			setIsPaused(false);

			speakSentence(0);
		},
		[speakSentence],
	);

	return {
		isPlaying,
		isPaused,
		rate,
		activeMessageId,
		selectedVoice,
		voices,
		toggle,
		stop,
		setRate,
		cycleRate,
		setSelectedVoice,
	};
}
