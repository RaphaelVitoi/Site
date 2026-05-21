import React, { useState, useMemo } from 'react';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import { generateDynamicICMQuiz, SimulatorState } from '@/components/quiz/icmQuizGenerator';

interface SimulatorQuizWidgetProps {
    simulatorState: SimulatorState;
}

export const SimulatorQuizWidget: React.FC<SimulatorQuizWidgetProps> = ({ simulatorState }) => {
    const [keySeed, setKeySeed] = useState(0);

    // Memoiza as questões para impedir re-renderizações desnecessárias durante a digitação
    const questions = useMemo(() => {
        return generateDynamicICMQuiz(simulatorState);
    }, [simulatorState]);

    const handleRestart = () => {
        setKeySeed(prev => prev + 1);
    };

    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-16 border-t border-white/5 pt-12">
            <div className="mb-10">
                <h3 className="text-text-bright text-[1.75rem] font-black mb-3 m-0">
                    Desafio de Antevisão (Dinâmico)
                </h3>
                <p className="text-text-muted text-[1.05rem] leading-relaxed m-0">
                    O sistema leu as variáveis da sua simulação atual. Baseado nessa topologia de mesa, teste seu raciocínio SOTA:
                </p>
            </div>

            {/* Injeta a keySeed para forçar a remontagem reativa do estado O(1) quando necessário */}
            <QuizEngine
                key={`quiz-widget-${keySeed}`}
                questions={questions}
                onQuizRestart={handleRestart}
            />
        </div>
    );
};
