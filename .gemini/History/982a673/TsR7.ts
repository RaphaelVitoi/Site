import { useState, useCallback, useRef, useEffect } from 'react';

export function useGemmaStream() {
    const [streamedText, setStreamedText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const generateAnalysis = useCallback(async (prompt: string, maxTokens: number = 1024) => {
        setIsStreaming(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        setIsCompleted(false);
        setStreamedText('');
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:11434/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, max_tokens: maxTokens }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`[HTTP ${response.status}] Colapso na comunicação com a Engine Gemma.`);
            }

            if (!response.body) {
                throw new Error('ReadableStream não suportado pela engine de rede do browser.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            try {
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        // A opção { stream: true } previne a quebra abrupta de caracteres multi-byte.
                        setStreamedText((prev) => prev + decoder.decode(value, { stream: true }));
                    }
                }
                setIsCompleted(true);
            } finally {
                // SOTA: Força o descarte do buffer TCP retido na VRAM/RAM e libera a thread
                await reader.cancel().catch(() => {});
                reader.releaseLock();
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('[ENTROPIA] Stream abortado (Cleanup/Cancelamento).');
                return;
            }
            console.error('[ENTROPIA] Falha no Stream:', err);
            setError(err.message || 'Falha de conexão com a porta 11434.');
        } finally {
            setIsStreaming(false);
        }
    }, []);

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return { streamedText, isStreaming, isCompleted, error, generateAnalysis, stopStream };
}
