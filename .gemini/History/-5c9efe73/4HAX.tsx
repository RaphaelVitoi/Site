import React from 'react';

interface QuizProgressProps {
    current: number;
    total: number;
    score: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total, score }) => {
    const progressPercent = Math.round((current / total) * 100);

    return (
        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Questão</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 900, color: '#e2e8f0', fontSize: '1.1rem' }}>
                    {String(current + 1).padStart(2, '0')} <span style={{ color: '#475569', fontSize: '0.9rem' }}>/ {String(total).padStart(2, '0')}</span>
                </span>
            </div>
            <div style={{ flex: 1, margin: '0 2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, backgroundColor: '#818cf8', height: '100%', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(129, 140, 248, 0.5)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Acertos</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 900, color: '#10b981', fontSize: '1.1rem' }}>
                    {String(score).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
};