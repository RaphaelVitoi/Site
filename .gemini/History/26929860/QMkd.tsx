import React from 'react';

interface QuizResultsProps {
    score: number;
    total: number;
    onRestart: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ score, total, onRestart }) => {
    const percentage = Math.round((score / total) * 100);
    const isSuccess = percentage >= 70;
    const colorVar = isSuccess ? 'var(--sim-success)' : 'var(--sim-error)';

    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--sim-text)', marginBottom: '1rem', fontSize: '1.5rem' }}>Impacto de Aprendizado</h2>
            <div style={{ fontSize: '4rem', fontVariantNumeric: 'tabular-nums', color: colorVar, margin: '2rem 0', fontWeight: 'bold' }}>
                {percentage}%
            </div>
            <p style={{ color: 'var(--sim-text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Sua retenção: <strong style={{ color: 'var(--sim-text)', fontVariantNumeric: 'tabular-nums' }}>{score}</strong> de <strong style={{ color: 'var(--sim-text)', fontVariantNumeric: 'tabular-nums' }}>{total}</strong> matrizes corretas.
            </p>
            <button
                onClick={onRestart}
                style={{ padding: '0.875rem 2rem', backgroundColor: 'var(--sim-surface)', color: 'var(--sim-text)', border: '1px solid var(--sim-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            >
                Reiniciar Ciclo
            </button>
        </div>
    );
};