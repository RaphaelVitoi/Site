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

export function useGemmaStream() {
	const [streamedText, setStreamedText] = useState<string>('');
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const [isCompleted, setIsCompleted] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
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
		): Promise<string | void> => {
			setIsStreaming(true);

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			abortControllerRef.current = new AbortController();
			setIsCompleted(false);
			setStreamedText('');
			setError(null);
			bufferRef.current = '';

			// SOTA: Roteamento centralizado para o Proxy Python SOTA (onde o RAG e System Prompt são injetados)
			const proxyUrl = process.env['NEXT_PUBLIC_SOTA_PROXY_URL'] || 'http://127.0.0.1:17043';

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
				};

				const token = process.env['NEXT_PUBLIC_SOTA_API_TOKEN'];
				if (!token && process.env['NODE_ENV'] !== 'development') {
					throw new Error(
						'NEXT_PUBLIC_SOTA_API_TOKEN não configurado no ambiente de produção.',
					);
				}
				const authHeader = token || 'sota-token-2026';

				const response = await fetch(`${proxyUrl}/generate`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Vitoi-Auth': authHeader,
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
				setStreamedText(bufferRef.current);
				setIsCompleted(true);
				return bufferRef.current;
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
		generateAnalysis,
		stopStream,
	};
}
