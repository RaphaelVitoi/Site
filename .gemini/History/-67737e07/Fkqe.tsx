import React from 'react';

interface QuizProgressProps {
    current: number;
    total: number;
    score: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total, score }) => {
    const progressPercent = Math.round((current / total) * 100);

    return (
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--sim-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--sim-text-muted)', fontSize: '0.875rem' }}>Questão</span>
                {/* Tipografia SOTA tabular-nums para evitar pulos visuais */}
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'bold', color: 'var(--sim-text)' }}>
                    {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
            </div>
            <div style={{ flex: 1, margin: '0 2rem', backgroundColor: 'var(--sim-surface)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, backgroundColor: 'var(--sim-text)', height: '100%', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--sim-text-muted)', fontSize: '0.875rem' }}>Placar</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'bold', color: 'var(--sim-success)' }}>
                    {score}
                </span>
            </div>
        </div>
    );
};