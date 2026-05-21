import React, { useState, useMemo } from 'react';
import { QuizQuestion as QuizQuestionType } from './types';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';

interface QuizEngineProps {
    questions: QuizQuestionType[];
    onQuizRestart?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ questions, onQuizRestart }) => {
    // O(1) State Complexity: Usamos um Dicionário de Respostas em vez de Arrays mapeados
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const isFinished = currentIndex >= questions.length;

    // Avaliação em tempo real O(N) apenas no total de respostas preenchidas
    const score = useMemo(() => {
        return questions.reduce((acc, q) => {
            return acc + (answers[q.id] === q.correctOptionId ? 1 : 0);
        }, 0);
    }, [answers, questions]);

    const handleSelectOption = (optionId: string) => {
        const currentQ = questions[currentIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
    };

    const handleNext = () => setCurrentIndex(prev => prev + 1);
    const handleRestart = () => {
        setAnswers({});
        setCurrentIndex(0);
        if (onQuizRestart) onQuizRestart();
    };

    if (!questions || questions.length === 0) return null;

    return (
        <div style={{ backgroundColor: 'var(--sim-bg)', border: '1px solid var(--sim-border)', borderRadius: '12px', overflow: 'hidden', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 24px -8px rgba(0,0,0,0.1)' }}>
            {isFinished ? (
                <QuizResults score={score} total={questions.length} onRestart={handleRestart} />
            ) : (
                <>
                    <QuizProgress current={currentIndex} total={questions.length} score={score} />

                    <QuizQuestion
                        question={questions[currentIndex]}
                        selectedOptionId={answers[questions[currentIndex].id]}
                        onSelectOption={handleSelectOption}
                    />

                    <div style={{ padding: '0 2rem 2rem', display: 'flex', justifyContent: 'flex-end', minHeight: '80px' }}>
                        {answers[questions[currentIndex].id] && (
                            <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--sim-text)', color: 'var(--sim-bg)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.2s' }}>
                                Avançar
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};