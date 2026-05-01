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
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--sim-border)', paddingTop: '3rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ color: 'var(--sim-text)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                    Desafio de Antevisão (Dinâmico)
                </h3>
                <p style={{ color: 'var(--sim-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
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