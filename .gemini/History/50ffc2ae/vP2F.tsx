'use client';

import React from 'react';
import { useGemmaStream } from '@/hooks/useGemmaStream';

interface GemmaAnalysisProps {
    heroPos: string;
    villainPos: string;
    potSize: number;
    heroStack: number;
    villainStack: number;
    icmContext?: {
        payjumpDist?: string;
        bubbleFactor?: number;
    };
}

export function GemmaAnalysisPanel({
    heroPos,
    villainPos,
    potSize,
    heroStack,
    villainStack,
    icmContext
}: Readonly<GemmaAnalysisProps>) {
    const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

    const handleInjectAnalysis = () => {
        const prompt = `
[DIRETRIZ DO SISTEMA]
Você é o Analista Matemático de Elite focado no Paradigma VITOI (Perspectiva Matemática).
Sua análise deve ser rigorosa, cirúrgica e ignorar a falácia das Pot Odds, priorizando EV do Fold, Reverse Implied Odds (RIO) e Controle de Risco (FGS).

[CENÁRIO DA COLISÃO]
- Posições: Hero (${heroPos}) vs Villain (${villainPos})
- Pote Atual: ${potSize} bbs
- Stack Hero: ${heroStack} bbs
- Stack Villain: ${villainStack} bbs
- Fator ICM: ${icmContext?.bubbleFactor || 'ChipEV Puro'}

Comporte-se de maneira técnica. Escreva em 2 parágrafos densos:
1. O Risco Estrutural (Avalie o Pot Entrapment e o impacto das RIO caso o board conecte as partes marginais do range).
2. Veredito de Perspectiva (A utilidade real da ação no fluxo do torneio versus o incentivo isolado).
`;
        generateAnalysis(prompt, 512); // Token limit ajustado para a densidade máxima
    };

    return (
        <div className="flex flex-col gap-4 mt-6 p-5 rounded-lg bg-[#0c0f12]/80 backdrop-blur-lg border border-[#1e252d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-[13px] font-mono font-bold tracking-widest uppercase text-emerald-400/90">
                        Oráculo Gemma (Local)
                    </h3>
                </div>
                <button
                    onClick={handleInjectAnalysis}
                    disabled={isStreaming}
                    className="px-4 py-1.5 text-[11px] font-mono font-bold tracking-wider text-white bg-blue-600/50 hover:bg-blue-500/70 rounded border border-blue-500/30 disabled:opacity-40 transition-all duration-200"
                >
                    {isStreaming ? 'SINTETIZANDO...' : 'INJETAR PERSPECTIVA'}
                </button>
            </div>

            <div className="min-h-25 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                {error && (
                    <div className="text-red-400 p-3 bg-red-950/30 rounded border border-red-500/20 text-xs">
                        {error}
                    </div>
                )}
                {!error && !streamedText && !isStreaming && (
                    <span className="text-gray-600 italic text-xs">Aguardando gatilho de injeção SOTA...</span>
                )}
                {streamedText}
            </div>
        </div>
    );
}
