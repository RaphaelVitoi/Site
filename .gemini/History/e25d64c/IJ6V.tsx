import React from 'react';

interface QuizResultsProps {
    score: number;
    total: number;
    onRestart: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ score, total, onRestart }) => {
    const percentage = Math.round((score / total) * 100);
    const isSuccess = percentage >= 70;
    const colorVar = isSuccess ? '#10b981' : '#f43f5e';
    const title = isSuccess ? 'Sincronia Alcançada' : 'Entropia Residual';
    const icon = isSuccess ? 'fa-bolt' : 'fa-triangle-exclamation';

    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <i className={`fa-solid ${icon}`} style={{ fontSize: '3rem', color: colorVar, marginBottom: '1.5rem', opacity: 0.8 }} />
            <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>{title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                O seu modelo cognitivo foi testado contra a topologia deste cenário.
            </p>

            <div style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: '180px', height: '180px', borderRadius: '50%',
                background: `radial-gradient(circle, rgba(15,23,42,1) 50%, ${isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'} 100%)`,
                border: `2px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                marginBottom: '2.5rem', boxShadow: `0 0 30px ${isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`
            }}>
                <div style={{ fontSize: '3.5rem', fontVariantNumeric: 'tabular-nums', color: colorVar, fontWeight: 900, lineHeight: 1 }}>
                    {percentage}%
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', fontWeight: 700 }}>
                    Precisão
                </div>
            </div>

            <div style={{ marginBottom: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Acertos</span>
                    <span style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Erros</span>
                    <span style={{ fontSize: '1.5rem', color: '#f43f5e', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{total - score}</span>
                </div>
            </div>

            <button
                onClick={onRestart}
                style={{
                    padding: '0.875rem 2.5rem', backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                    transition: 'all 0.2s', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
                <i className="fa-solid fa-rotate-right" /> Calibrar Novamente
            </button>
        </div>
    );
};