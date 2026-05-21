import { useState, useCallback, useRef, useEffect } from "react";

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
    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      try {
        const data = JSON.parse(line.slice(6));
        const content = data.choices[0]?.delta?.content || "";
        onChunk(content);
      } catch (e) {
        console.warn("[ENTROPIA] Falha de parse JSON no stream:", e);
      }
    }
  }
}

async function processSSEStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (content: string) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");

  try {
    let done = false;
    let buffer = "";
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        parseSSELines(lines, onChunk);
      }
    }
  } finally {
    // SOTA: Força o descarte do buffer TCP retido na VRAM/RAM e libera a thread
    await reader
      .cancel()
      .catch((e) => console.warn("[ENTROPIA] Erro ao cancelar reader:", e));
    reader.releaseLock();
  }
}

export function useGemmaStream() {
  const [streamedText, setStreamedText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // SOTA: Buffer Quântico (Memória mutável isolada do ciclo do React)
  const bufferRef = useRef<string>("");
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
    async (prompt: string, maxTokens: number = 1024) => {
      setIsStreaming(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setIsCompleted(false);
      setStreamedText("");
      setError(null);
      bufferRef.current = "";

      // SOTA: Extração para variável de ambiente garantindo sobrevivência em contêineres Docker.
      const baseUrl =
        process.env.NEXT_PUBLIC_OLLAMA_URL || "http://127.0.0.1:11434";

      // SOTA Guard: Validação estrita de protocolo prevenindo anomalias de .env
      if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
        setError(
          "Bloqueio de Segurança SOTA: OLLAMA_URL deve utilizar estritamente HTTP ou HTTPS.",
        );
        setIsStreaming(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || "gemma",
              messages: [
                { role: "system", content: VITOI_SYSTEM_PROMPT },
                { role: "user", content: prompt },
              ],
              max_tokens: maxTokens,
              stream: true,
            }),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `[HTTP ${response.status}] Colapso na comunicação com a Engine Gemma.`,
          );
        }

        if (!response.body) {
          throw new Error(
            "ReadableStream não suportado pela engine de rede do browser.",
          );
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
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("[ENTROPIA] Stream abortado (Cleanup/Cancelamento).");
          return;
        }
        console.error("[ENTROPIA] Falha no Stream:", err);
        const errorMessage = err.message || "";
        // SOTA Fallback: Suavização heurística do erro TypeError de I/O em navegadores
        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("Load failed") ||
          errorMessage.includes("NetworkError")
        ) {
          setError(
            "Motor Neural Local (Ollama/llama.cpp) offline ou bloqueado por CORS. Verifique se o host está rodando em 0.0.0.0 e a porta (11434/1234) responde.",
          );
        } else {
          setError(
            errorMessage || "Falha de conexão com o orquestrador neural.",
          );
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
