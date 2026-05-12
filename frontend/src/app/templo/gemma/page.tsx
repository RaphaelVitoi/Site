/**
 * IDENTITY: Oráculo de Borda (Gemma 4 Portal)
 * PATH: src/app/templo/gemma/page.tsx
 * ROLE: Interface direta para comunicação com o agente local @gemma4.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SotaButton } from '@/components/ui/SotaButton';
import { useSotaSync } from '@/components/simulator/hooks/useSotaSync';

export default function GemmaPortal() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'offline' | 'online' | 'thinking'>('offline');
  
  const { isHydrated: isSyncHydrated } = useSotaSync();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local server health
    fetch('http://127.0.0.1:11434/')
      .then(res => res.ok ? setStatus('online') : setStatus('offline'))
      .catch(() => setStatus('offline'));
  }, []);

  async function handleConsult() {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatus('thinking');
    setResponse('');

    try {
      const res = await fetch('http://127.0.0.1:11434/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vitoi-Auth': 'sota-token-2026'
        },
        body: JSON.stringify({ prompt, max_tokens: 1024 })
      });

      if (!res.ok) throw new Error('Servidor Offline');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setResponse(prev => prev + chunk);
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }
      }
      setStatus('online');
    } catch (error) {
      setResponse('ERRO: O motor @gemma4 está em hibernação ou offline no seu PC. Inicie via `nexus-cli start-gemma`.');
      setStatus('offline');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-bright font-body pb-24">
      <ContentPageHeader
        title="Oráculo de Borda"
        subtitle="Conexão soberana com o motor Gemma 4 operando localmente no seu hardware."
        category="AGN - Local"
        icon="fa-brain"
      />

      <div className="sota-container -mt-12 relative z-10 max-w-4xl">
        <GlassPanel className="p-8 mb-8 border-accent-indigo/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'online' ? 'bg-accent-emerald' : status === 'thinking' ? 'bg-accent-indigo' : 'bg-rose-500'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Status do Motor: {status.toUpperCase()}</span>
              {isSyncHydrated && (
                <span className="text-[0.65rem] font-black text-accent-emerald-light bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20 animate-in fade-in zoom-in">
                  [● SYNC: OK]
                </span>
              )}
            </div>
            <div className="text-[0.65rem] text-text-muted font-mono">MODEL: google/gemma-2-2b-it | LATENCY: EDGE</div>
          </div>

          <div 
            ref={scrollRef}
            className="min-h-[300px] max-h-[500px] overflow-y-auto bg-black/40 rounded-xl p-6 mb-6 font-mono text-sm leading-relaxed border border-white/5 selection:bg-accent-indigo/30"
          >
            {response ? (
              <div className="whitespace-pre-wrap animate-in fade-in duration-500">{response}</div>
            ) : (
              <div className="text-text-muted italic flex items-center justify-center h-full">
                Aguardando pulso estratégico...
              </div>
            )}
            {loading && <span className="inline-block w-2 h-4 bg-accent-indigo ml-1 animate-pulse" />}
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleConsult())}
              placeholder="Descreva o cenário tático ou solicite uma prova de Nash..."
              className="w-full bg-black/60 border border-white/10 rounded-xl p-4 pr-32 focus:outline-none focus:border-accent-indigo/50 transition-all resize-none h-24 text-sm"
              disabled={loading}
            />
            <div className="absolute right-4 bottom-4">
              <SotaButton 
                onClick={handleConsult}
                disabled={loading || status === 'offline'}
                variant="primary"
                size="sm"
              >
                {loading ? 'PROCESSANDO...' : 'CONSULTAR'}
              </SotaButton>
            </div>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassPanel className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group" onClick={() => setPrompt("Analise a Amortização da Edge em um cenário de 15bb vs Open-Shove.")}>
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">PROMPT SUGERIDO</div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">Amortização de Edge (15bb)</div>
          </GlassPanel>
          <GlassPanel className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group" onClick={() => setPrompt("Calcule qualitativamente o Downward Drift em um pote Multiway (4 players).")}>
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">PROMPT SUGERIDO</div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">Downward Drift Multiway</div>
          </GlassPanel>
          <GlassPanel className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group" onClick={() => setPrompt("Gere uma síntese do Paradigma VITOI sobre a Insolvência das Pot Odds.")}>
            <div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">PROMPT SUGERIDO</div>
            <div className="text-xs text-text-muted group-hover:text-white transition-colors">Síntese de Insolvência</div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
