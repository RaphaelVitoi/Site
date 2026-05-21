import { useState, useCallback } from 'react';

const VITOI_SYSTEM_PROMPT = `**GOVERNANÇA SOTA (AXIOMAS VITOI - IRREVOGÁVEL):**
Você é um motor de análise de poker SOTA (State-of-the-Art). Sua resposta DEVE seguir estritamente o formato e os princípios abaixo.

**PRINCÍPIOS:**
1.  **PERSPECTIVA > ICM:** A "Perspectiva Matemática" é a métrica soberana, integrando ICMev, RIO, e o EV do Fold dinâmico.
2.  **SOBREVIVÊNCIA > EV:** A preservação do valuation ($EV) e a mitigação do Risco de Ruína são mais importantes que o ganho de fichas (ChipEV).
3.  **INSOLVÊNCIA:** Se o Coeficiente de Insolvência (Ci) < 1, a linha é de contenção. Se Ci >= 1 e Perspectiva > 0, a linha é de agressão.

**FORMATO DA RESPOSTA (OBRIGATÓRIO):**
1.  **Diagnóstico Tático:** Análise concisa.
2.  **Linha de Ação:** A jogada (ex: Fold, Call, Raise X).
3.  **Justificativa SOTA:** 3 pontos conectando a ação à Perspectiva, RIO e EV do Fold.

---

**TAREFA:**
`;

function parseSSELines(lines: string[], onChunk: (content: string) => void) {
    for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || '';
                onChunk(content);
            } catch (e) {
                console.warn('[ENTROPIA] Falha de parse JSON no stream:', e);
            }
        }
    }
}

async function processSSEStream(
    stream: ReadableStream<Uint8Array>,
    onChunk: (content: string) => void
) {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
        let done = false;
        let buffer = '';
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                parseSSELines(lines, onChunk);
            }
        }
    } finally {
        // SOTA: Força o descarte do buffer TCP retido na VRAM/RAM e libera a thread
        await reader.cancel().catch((e) => console.warn('[ENTROPIA] Erro ao cancelar reader:', e));
        reader.releaseLock();
    }
}

export function useGemmaStream() {
    const [streamedText, setStreamedText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateAnalysis = useCallback(async (prompt: string, maxTokens: number = 1024) => {
        setIsStreaming(true);
        setIsCompleted(false);
        setStreamedText('');
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: VITOI_SYSTEM_PROMPT },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: maxTokens,
                    stream: true
                }),
            });

            if (!response.ok) {
                throw new Error(`[HTTP ${response.status}] Colapso na comunicação com a Engine Gemma.`);
            }

            if (!response.body) {
                throw new Error('ReadableStream não suportado pela engine de rede do browser.');
            }

            await processSSEStream(response.body, (content) => {
                setStreamedText((prev) => prev + content);
            });
            setIsCompleted(true);
        } catch (err: any) {
            console.error('[ENTROPIA] Falha no Stream:', err);
            setError(err.message || 'Falha de conexão com a porta 11434.');
        } finally {
            setIsStreaming(false);
        }
    }, []);

    return { streamedText, isStreaming, isCompleted, error, generateAnalysis };
}
