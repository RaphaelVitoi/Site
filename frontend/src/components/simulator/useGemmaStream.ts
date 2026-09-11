import { useState, useCallback, useRef, useEffect } from 'react';
import type { PhysicsSnapshot, InferenceRequest } from '@/lib/schemas';
import { logger } from '@/lib/logger';

async function processSSEStream(
	stream: ReadableStream<Uint8Array>,
	onChunk: (content: string) => void,
) {
	const reader = stream.getReader();
	const decoder = new TextDecoder('utf-8');

	try {
		let done = false;
		while (!done) {
			const { value, done: readerDone } = await reader.read();
			done = readerDone;

			if (value) {
				onChunk(decoder.decode(value, { stream: true }));
			}
		}
	} finally {
		await reader.cancel().catch((e) => {
			 
			console.warn('[ENTROPIA] Erro ao cancelar reader:', e);
		});
		reader.releaseLock();
	}
}

export interface StreamTelemetry {
	ttftMs: number | null;
	speedTokPerSec: number | null;
	elapsedMs: number | null;
	estimatedTokens: number;
}

export function useGemmaStream() {
	const [streamedText, setStreamedText] = useState<string>('');
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const [isCompleted, setIsCompleted] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [telemetry, setTelemetry] = useState<StreamTelemetry>({
		ttftMs: null,
		speedTokPerSec: null,
		elapsedMs: null,
		estimatedTokens: 0,
	});
	const abortControllerRef = useRef<AbortController | null>(null);

	// SOTA: Válvula de Renderização (RAF) - Evita o colapso de VDOM a 60 FPS
	const bufferRef = useRef<string>('');
	const isBufferingRef = useRef<boolean>(false);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const generateAnalysis = useCallback(
		async (
			prompt: string,
			maxTokens: number = 1024,
			targetModel?: string,
			physicsSnapshot?: PhysicsSnapshot,
			predictiveProfile?: Record<string, unknown>,
			images?: string[],
			think?: boolean,
		): Promise<string | void> => {
			setIsStreaming(true);

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			abortControllerRef.current = new AbortController();
			setIsCompleted(false);
			setStreamedText('');
			setError(null);
			setTelemetry({
				ttftMs: null,
				speedTokPerSec: null,
				elapsedMs: null,
				estimatedTokens: 0,
			});
			bufferRef.current = '';

			const t0 = performance.now();
			let firstTokenTime: number | null = null;

			// SOTA: Sanitização de Prompt - Remove tentativas de manipulação de instrução (jailbreak) com suporte a sufixos
			const sanitizedPrompt = prompt
				.replace(
					/(ignore|forget|override|previous|system|instruction|directive)(s)?/gi,
					'---',
				)
				.trim();

			try {
				const payload: InferenceRequest = {
					prompt: sanitizedPrompt,
					max_tokens: maxTokens,
					model: targetModel,
					physics_snapshot: physicsSnapshot,
					predictive_profile: predictiveProfile,
					images,
					think,
				};

				const response = await fetch('/api/v1/gemma', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					throw new Error(
						`[HTTP ${response.status}] Colapso na comunicação com o Proxy SOTA.`,
					);
				}

				if (!response.body) {
					throw new Error('ReadableStream não suportado pela engine de rede do browser.');
				}

				await processSSEStream(response.body, (content) => {
					if (firstTokenTime === null) {
						firstTokenTime = Math.round(performance.now() - t0);
					}
					bufferRef.current += content;

					if (!isBufferingRef.current) {
						isBufferingRef.current = true;
						rafRef.current = requestAnimationFrame(() => {
							setStreamedText(bufferRef.current);
							isBufferingRef.current = false;
						});
					}
				});
				if (rafRef.current) cancelAnimationFrame(rafRef.current);
				const finalContent = bufferRef.current;
				setStreamedText(finalContent);
				setIsCompleted(true);

				const elapsed = Math.round(performance.now() - t0);
				const estimatedTok = Math.round(finalContent.split(/\s+/).length * 1.3);
				const speed = elapsed > 0 ? Number(((estimatedTok / (elapsed / 1000))).toFixed(1)) : 0;

				setTelemetry({
					ttftMs: firstTokenTime,
					speedTokPerSec: speed,
					elapsedMs: elapsed,
					estimatedTokens: estimatedTok,
				});

				return finalContent;
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') {
					logger.info('Engine:GemmaStream', 'Stream abortado (Cleanup/Cancelamento).');
					return;
				}
				logger.error('Engine:GemmaStream', 'Falha no Stream', { error: err });
				const errorMessage = err instanceof Error ? err.message : '';
				// SOTA Fallback: Suavização heurística do erro TypeError de I/O em navegadores
				if (
					errorMessage.includes('Failed to fetch') ||
					errorMessage.includes('Load failed') ||
					errorMessage.includes('NetworkError')
				) {
					setError(
						'Proxy Inference SOTA offline. Verifique se gemma_server.py está rodando na porta 17043.',
					);
				} else {
					setError(errorMessage || 'Falha de conexão com o orquestrador neural.');
				}
			} finally {
				setIsStreaming(false);
				isBufferingRef.current = false;
			}
		},
		[],
	);

	const stopStream = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	}, []);

	return {
		streamedText,
		isStreaming,
		isCompleted,
		error,
		telemetry,
		generateAnalysis,
		stopStream,
	};
}
