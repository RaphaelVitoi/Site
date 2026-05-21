/**
 * IDENTITY: Oráculo de Borda (Gemma 4 Portal)
 * PATH: src/app/templo/gemma/page.tsx
 * ROLE: Interface direta para comunicação com o agente local @gemma4.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaButton } from "@/components/ui/SotaButton";
import { useSotaSync } from "@/components/simulator/hooks/useSotaSync";
import { useGemmaStream } from "@/components/simulator/useGemmaStream";

interface Message {
  id: string;
  role: "user" | "assistant" | "telemetry";
  content: string;
  snapshot?: any;
}

function TelemetryCard({ snapshot }: Readonly<{ snapshot: any }>) {
  return (
    <div className="my-4 p-4 bg-slate-900/60 border border-accent-indigo/20 rounded-xl font-mono text-[0.7rem] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-accent-indigo" />
      <div className="flex justify-between items-center mb-2">
        <span className="text-accent-indigo-light font-black uppercase tracking-tighter">
          Telemetria de Oráculo
        </span>
        <span className="text-[0.6rem] text-text-muted">ACTIVE SNAPSHOT</span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        <div>
          STACK: <span className="text-white">{snapshot.heroStack}bb</span>
        </div>
        <div>
          POT: <span className="text-white">{snapshot.pot}bb</span>
        </div>
        <div>
          POS: <span className="text-white">{snapshot.position}</span>
        </div>
        <div>
          STATUS: <span className="text-white">{snapshot.referenceStatus}</span>
        </div>
      </div>
    </div>
  );
}

export default function GemmaPortal() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [serverOnline, setServerOnline] = useState(false);

  const { physics, isHydrated: isSyncHydrated } = useSotaSync();
  const { streamedText, isStreaming, error, generateAnalysis } =
    useGemmaStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  let status: "offline" | "online" | "thinking" = "offline";
  if (isStreaming) {
    status = "thinking";
  } else if (serverOnline) {
    status = "online";
  }

  const getStatusColor = (s: "offline" | "online" | "thinking") => {
    if (s === "online") return "bg-accent-emerald";
    if (s === "thinking") return "bg-accent-indigo";
    return "bg-rose-500";
  };

  useEffect(() => {
    // Check local server health
    fetch("http://127.0.0.1:17043/")
      .then((res) => setServerOnline(res.ok))
      .catch(() => setServerOnline(false));
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, messages, isStreaming]);

  async function handleConsult() {
    if (!prompt.trim()) return;

    const userMsg = prompt.trim();
    const currentPhysics = { ...physics };

    // 1. Append user message
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userMsg },
    ]);
    setPrompt("");

    // 2. Append Telemetry Snapshot (if hydrated)
    if (isSyncHydrated) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "telemetry",
          content: "SNAPSHOT_TRIGGERED",
          snapshot: currentPhysics,
        },
      ]);
    }

    // 3. Dispatch to Gemma via Hook SOTA (RAF 60FPS)
    const finalResponse = await generateAnalysis(
      userMsg,
      1024,
      undefined, // auto-model
      isSyncHydrated ? currentPhysics : undefined,
    );

    if (finalResponse) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: finalResponse },
      ]);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-bright font-body pb-24 sota-grain">
      <ContentPageHeader
        title="Oráculo de Borda"
        subtitle="Conexão soberana com o motor Gemma 4 operando localmente no seu hardware."
        category="AGN - Local"
        icon="fa-brain"
      />

      <div className="sota-container -mt-12 relative z-10 max-w-4xl">
        <GlassPanel
          className={`p-8 mb-8 border-accent-indigo/30 transition-all duration-700 ${(() => {
            if (status === "online")
              return "shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]";
            if (status === "thinking")
              return "shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]";
            return "shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)]";
          })()}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(status)}`}
              />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Status do Motor: {status.toUpperCase()}
              </span>
              {isSyncHydrated && (
                <span className="text-[0.65rem] font-black text-accent-emerald-light bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20 animate-in fade-in zoom-in">
                  [● SYNC: OK]
                </span>
              )}
            </div>
            <div className="text-[0.65rem] text-text-muted font-mono">
              MODEL: google/gemma-2-2b-it | LATENCY: EDGE
            </div>
          </div>

          <div
            ref={scrollRef}
            className="min-h-100 max-h-150 overflow-y-auto bg-black/40 rounded-xl p-6 mb-6 font-mono text-sm leading-relaxed border border-white/5 selection:bg-accent-indigo/30 scroll-smooth"
          >
            {messages.length === 0 && !streamedText && !isStreaming ? (
              <div className="text-text-muted italic flex items-center justify-center h-full">
                Aguardando pulso estratégico...
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`animate-in fade-in duration-300 ${msg.role === "user" ? "opacity-80" : ""}`}
                  >
                    {msg.role === "user" && (
                      <div className="text-accent-indigo-light text-[0.6rem] font-black uppercase mb-1 tracking-widest">
                        VOCÊ
                      </div>
                    )}
                    {msg.role === "assistant" && (
                      <div className="text-accent-emerald-light text-[0.6rem] font-black uppercase mb-1 tracking-widest">
                        ORÁCULO
                      </div>
                    )}

                    {msg.role === "telemetry" ? (
                      <TelemetryCard snapshot={msg.snapshot} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                ))}

                {isStreaming && streamedText && (
                  <div className="animate-in fade-in duration-300">
                    <div className="text-accent-emerald-light text-[0.6rem] font-black uppercase mb-1 tracking-widest">
                      ORÁCULO
                    </div>
                    <div className="whitespace-pre-wrap">{streamedText}</div>
                  </div>
                )}

                {isStreaming && !streamedText && (
                  <div className="flex items-center gap-2 text-text-muted animate-pulse">
                    <div className="w-1.5 h-1.5 bg-accent-indigo rounded-full" />
                    <span className="text-[0.6rem] font-black uppercase">
                      Sincronizando Probabilidades...
                    </span>
                  </div>
                )}

                {error && !isStreaming && (
                  <div className="text-rose-400 p-3 bg-rose-950/30 rounded border border-rose-500/20 text-xs mt-4">
                    {error}
                  </div>
                )}

                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-accent-indigo ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleConsult())
              }
              placeholder="Descreva o cenário tático ou solicite uma prova de Nash..."
              className="w-full bg-black/60 border border-white/10 rounded-xl p-4 pr-32 focus:outline-none focus:border-accent-indigo/50 transition-all resize-none h-24 text-sm"
              disabled={isStreaming}
            />
            <div className="absolute right-4 bottom-4">
              <SotaButton
                onClick={handleConsult}
                disabled={isStreaming || status === "offline"}
                variant="primary"
                size="sm"
              >
                {isStreaming ? "PROCESSANDO..." : "CONSULTAR"}
              </SotaButton>
            </div>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassPanel
            className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
            onClick={() =>
              setPrompt(
                "Analise a Amortização da Edge em um cenário de 15bb vs Open-Shove.",
              )
            }
          >
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
              PROMPT SUGERIDO
            </div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">
              Amortização de Edge (15bb)
            </div>
          </GlassPanel>
          <GlassPanel
            className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
            onClick={() =>
              setPrompt(
                "Calcule qualitativamente o Downward Drift em um pote Multiway (4 players).",
              )
            }
          >
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
              PROMPT SUGERIDO
            </div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">
              Downward Drift Multiway
            </div>
          </GlassPanel>
          <GlassPanel
            className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
            onClick={() =>
              setPrompt(
                "Gere uma síntese do Paradigma VITOI sobre a Insolvência das Pot Odds.",
              )
            }
          >
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
              PROMPT SUGERIDO
            </div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">
              Síntese de Insolvência
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
