import React from 'react';

export default function EquityCalculator ()
{
    return (
        <div style={ {
            padding: '2rem',
            backgroundColor: 'rgba(15,23,42,0.6)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            color: '#e2e8f0'
        } }>
            <header style={ { marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' } }>
                <h2 style={ { margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                    <i className="fa-solid fa-calculator" /> Calculadora de Equidade (ICM EV)
                </h2>
                <p style={ { margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#94a3b8' } }>
                    Calcule o valor real das suas mãos pós-flop considerando o Risk Premium e o Bubble Factor do cenário ativo.
                </p>
            </header>

            <div style={ { display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '200px' } }>
                <div style={ { fontSize: '3rem', color: 'rgba(255,255,255,0.05)' } }>
                    <i className="fa-solid fa-microchip" />
                </div>
                <p style={ { fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 } }>
                    O painel está pronto para receber os inputs de equidade e calcular a transição de Tiers.
                </p>
            </div>
        </div>
    );
}
