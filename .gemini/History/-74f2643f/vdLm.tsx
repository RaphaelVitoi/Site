import React, { useState, useMemo, useContext, useCallback } from 'react';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import { generateDynamicICMQuiz, type SimulatorState } from '@/components/quiz/icmQuizGenerator';
import { SotaMetricsContext, SotaWasmContext } from '@/components/simulator/SotaContext';

interface SimulatorQuizWidgetProps {
    simulatorState: SimulatorState;
}

export const SimulatorQuizWidget: React.FC<SimulatorQuizWidgetProps> = ({ simulatorState }) => {
    const [keySeed, setKeySeed] = useState(0);
    const [ghostMode, setGhostMode] = useState(false);

    const metricsCtx = useContext(SotaMetricsContext);
    const wasmCtx = useContext(SotaWasmContext);

    // Memoiza as questões para impedir re-renderizações desnecessárias durante a digitação
    const questions = useMemo(() => {
        const generated = generateDynamicICMQuiz({
            ...simulatorState,
            predictiveProfile: metricsCtx?.predictiveProfile ?? {}
        });

        if (metricsCtx?.apiQuantumMetrics) {
            const { perspectiva, adjustedEvFold } = metricsCtx.apiQuantumMetrics;
            return generated.map(q => ({
                ...q,
                explanation: `${q.explanation}\n\n[SOTA Telemetry]: Perspectiva Matemática (PM): ${perspectiva > 0 ? '+' : ''}${perspectiva.toFixed(2)}%. O Custo Real de Desistência (EV_Fold) é de ${adjustedEvFold.toFixed(2)}%.`
            }));
        }

        return generated;
    }, [simulatorState, metricsCtx?.apiQuantumMetrics, metricsCtx?.predictiveProfile]);

    const handleRestart = () => {
        setKeySeed(prev => prev + 1);
    };

    const handleAnswer = useCallback((isCorrect: boolean, evLoss: number, category: string = 'Perspectiva Matemática') => {
        try {
            // SOTA: Fricção zero. Telemetria fire-and-forget acoplada ao Daemon O(1) do backend.
            fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    is_correct: isCorrect,
                    ev_loss: evLoss,
                    timestamp: new Date().toISOString()
                })
            }).catch(() => {});
        } catch (e) {
            // Blindagem térmica: Falhas na telemetria não afetam a UX visceral.
        }
    }, []);

    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-16 border-t border-white/5 pt-12 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-text-bright text-[1.75rem] font-black mb-3 m-0">
                        Desafio de Antevisão (Dinâmico)
                    </h2>
                    <p className="text-text-muted text-[1.05rem] leading-relaxed m-0 max-w-3xl">
                        O sistema leu as variáveis da sua simulação atual. Baseado nessa topologia de mesa, teste seu raciocínio SOTA:
                    </p>
                </div>
                <button
                    onClick={() => setGhostMode(!ghostMode)}
                    aria-pressed={ghostMode}
                    className={`px-4 py-2.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 ${ghostMode ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-black/40 text-text-muted border border-white/10 hover:text-white hover:bg-white/5'}`}
                >
                    <i className="fa-solid fa-ghost" aria-hidden="true" /> {ghostMode ? 'Ocultar Solver' : 'Ghost Solver'}
                </button>
            </div>

            {ghostMode && wasmCtx?.nashResults?.flop && (
                <div className="absolute inset-0 z-50 bg-bg-base/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 border border-accent-indigo/30 animate-sota-in">
                    <div className="bg-bg-deep p-8 rounded-xl border border-accent-indigo/20 max-w-2xl w-full text-center shadow-2xl">
                        <i className="fa-solid fa-eye text-4xl text-accent-indigo mb-4 animate-pulse" />
                        <h4 className="text-xl font-black text-white uppercase tracking-widest mb-6">Ghost Solver Ativo</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-[0.65rem] text-text-muted uppercase mb-2 font-bold tracking-widest">Agressão Média (IP)</div>
                                <div className="text-accent-indigo font-mono font-black text-2xl">{ ((wasmCtx.nashResults.flop.ip.bet_small.center + wasmCtx.nashResults.flop.ip.bet_large.center) / 2).toFixed(1) }%</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-[0.65rem] text-text-muted uppercase mb-2 font-bold tracking-widest">Defesa (OOP Call)</div>
                                <div className="text-accent-emerald font-mono font-black text-2xl">{ (wasmCtx.nashResults.flop.oop.call.center).toFixed(1) }%</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-[0.65rem] text-text-muted uppercase mb-2 font-bold tracking-widest">Fold Estrutural</div>
                                <div className="text-accent-danger font-mono font-black text-2xl">{ (wasmCtx.nashResults.flop.oop.fold.center).toFixed(1) }%</div>
                            </div>
                        </div>
                        <p className="text-[0.8rem] text-text-dim leading-relaxed mb-8">
                            A lente térmica GTO revela a estrutura profunda deste Spot. A agressão ou passividade é extraída da Matriz de Nash subjacente (Flop). Use essa intuição antes de responder.
                        </p>
                        <button onClick={() => setGhostMode(false)} className="px-6 py-2.5 bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-accent-indigo/30 transition-colors">
                            Retornar ao Desafio
                        </button>
                    </div>
                </div>
            )}

            {/* Injeta a keySeed para forçar a remontagem reativa do estado O(1) quando necessário */}
            <QuizEngine
                key={`quiz-widget-${keySeed}`}
                questions={questions}
                onQuizRestart={handleRestart}
                onAnswer={handleAnswer}
            />
        </div>
    );
};
