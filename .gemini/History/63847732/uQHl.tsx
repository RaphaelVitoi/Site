import React from 'react';
import { QuizQuestion as QuizQuestionType } from './types';

interface QuizQuestionProps {
    question: QuizQuestionType;
    selectedOptionId?: string;
    onSelectOption: (optionId: string) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, selectedOptionId, onSelectOption }) => {
    const isAnswered = selectedOptionId !== undefined;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ color: 'var(--sim-text)', marginBottom: '1.5rem', fontSize: '1.25rem', lineHeight: 1.5 }}>
                {question.text}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {question.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrect = option.id === question.correctOptionId;

                    let borderColor = 'var(--sim-border)';
                    let bgColor = 'var(--sim-surface)';
                    let textColor = 'var(--sim-text)';

                    if (isAnswered) {
                        if (isCorrect) {
                            borderColor = 'var(--sim-success)';
                            textColor = 'var(--sim-success)';
                        } else if (isSelected && !isCorrect) {
                            borderColor = 'var(--sim-error)';
                            textColor = 'var(--sim-error)';
                        }
                    }

                    return (
                        <button
                            key={option.id}
                            onClick={() => !isAnswered && onSelectOption(option.id)}
                            disabled={isAnswered}
                            style={{ padding: '1rem', border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, borderRadius: '8px', textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s ease', outline: 'none' }}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {/* Feedback Gamificado / Explicação */}
            {isAnswered && question.explanation && (
                <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: 'var(--sim-surface)', borderRadius: '8px', borderLeft: `4px solid ${selectedOptionId === question.correctOptionId ? 'var(--sim-success)' : 'var(--sim-error)'}` }}>
                    <strong style={{ color: 'var(--sim-text)', display: 'block', marginBottom: '0.5rem' }}>Análise:</strong>
                    <p style={{ color: 'var(--sim-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{question.explanation}</p>
                </div>
            )}
        </div>
    );
};