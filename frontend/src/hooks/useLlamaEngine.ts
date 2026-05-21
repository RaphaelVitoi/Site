import { useGemmaStream } from '@/components/simulator/useGemmaStream';
import { useMemo, useCallback } from 'react';

/**
 * IDENTITY: Bridge Hook useLlamaEngine (Legacy Compatibility)
 * PATH: src/hooks/useLlamaEngine.ts
 * ROLE: Restaura a interface do motor Llama utilizando a infraestrutura Gemma.
 *       Mapeia streamedText para lines[] para compatibilidade com TerminalLog.
 */
export function useLlamaEngine() {
	const { streamedText, isStreaming, error, generateAnalysis, stopStream } = useGemmaStream();

	// Mapeia o texto corrido para um array de linhas para o TerminalLog
	const lines = useMemo(() => {
		if (!streamedText) return [];
		return streamedText.split('\n').filter((line) => line.length > 0);
	}, [streamedText]);

	const execute = useCallback(
		(prompt: string) => {
			generateAnalysis(prompt);
		},
		[generateAnalysis],
	);

	return {
		lines,
		isProcessing: isStreaming,
		execute,
		stop: stopStream,
		error,
	};
}
