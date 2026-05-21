import React, { useState, useMemo } from 'react';
import { QuizQuestion as QuizQuestionType } from './types';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { logTelemetryEvent } from '@/components/telemetry';

interface QuizEngineProps {
    questions: QuizQuestionType[];
    onQuizRestart?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ questions, onQuizRestart }) => {
    // Blindagem SOTA: Garante que questions sempre será iterável e lida com dados corrompidos.
    const safeQuestions = Array.isArray(questions) ? questions : [];

    // O(1) State Complexity: Usamos um Dicionário de Respostas em vez de Arrays mapeados
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const isFinished = currentIndex >= safeQuestions.length;

    // Avaliação em tempo real O(N) apenas no total de respostas preenchidas
    const score = useMemo(() => {
        return safeQuestions.reduce((acc, q) => {
            return acc + (answers[q.id] === q.correctOptionId ? 1 : 0);
        }, 0);
    }, [answers, safeQuestions]);

    const handleSelectOption = (optionId: string) => {
        const currentQ = safeQuestions[currentIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));

        // ==========================================
        // TELEMETRIA SOTA: Disparo em Fricção Zero
        // ==========================================
        const isCorrect = optionId === currentQ.correctOptionId;
        logTelemetryEvent({
            category: currentQ.id.includes('icm') ? "Risk Premium" : "Fundamentos SOTA",
            scenarioContext: { questionId: currentQ.id, questionText: currentQ.text },
            userAction: optionId,
            optimalAction: currentQ.correctOptionId,
            evLoss: isCorrect ? 0 : 0.5, // Sangria fixa didática de 0.5% por erro
            isCorrect: isCorrect
        }).catch(err => console.error("[Telemetria] Falha silenciosa:", err));
    };

    const handleNext = () => setCurrentIndex(prev => prev + 1);
    const handleRestart = () => {
        setAnswers({});
        setCurrentIndex(0);
        if (onQuizRestart) onQuizRestart();
    };

    if (safeQuestions.length === 0) return null;

    return (
        <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)'
        }}>
            {isFinished ? (
                <QuizResults score={score} total={safeQuestions.length} onRestart={handleRestart} />
            ) : (
                <>
                    <QuizProgress current={currentIndex} total={safeQuestions.length} score={score} />

                    <QuizQuestion
                        question={safeQuestions[currentIndex]}
                        selectedOptionId={answers[safeQuestions[currentIndex].id]}
                        onSelectOption={handleSelectOption}
                    />

                    <div style={{ padding: '0 2rem 2rem', display: 'flex', justifyContent: 'flex-end', minHeight: '80px' }}>
                        {answers[safeQuestions[currentIndex].id] && (
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '0.65rem 1.5rem',
                                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                    color: '#818cf8',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.25)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'}
                            >
                                {currentIndex === safeQuestions.length - 1 ? 'Ver Impacto' : 'Avançar'} <i className="fa-solid fa-arrow-right" />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};