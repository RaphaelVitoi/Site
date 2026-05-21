'use client';

import React, { useState } from 'react';
import { calculateCallEV } from '@/lib/icm';

export default function EquityCalculator ()
{
    const [ pot, setPot ] = useState<number>( 10 );
    const [ bet, setBet ] = useState<number>( 5 );
    const [ bf, setBf ] = useState<number>( 1.6 );
    const [ equity, setEquity ] = useState<number>( 45 );

    const equityDecimal = Math.max( 0, Math.min( 100, equity ) ) / 100;
    const chipEv = ( equityDecimal * ( pot + bet ) ) - ( ( 1 - equityDecimal ) * bet );
    const icmEv = calculateCallEV( pot, bet, bf, equityDecimal );

    const isChipEvPositive = chipEv > 0;
    const isIcmEvPositive = icmEv > 0;

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

            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' } }>
                {/* Inputs */ }
                <div style={ { display: 'flex', flexDirection: 'column', gap: '1.25rem' } }>
                    <div style={ { display: 'flex', flexDirection: 'column', gap: '0.4rem' } }>
                        <label style={ { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' } }>Pot Atual (Dead Money)</label>
                        <input type="number" value={ pot } onChange={ e => setPot( Number( e.target.value ) ) }
                            style={ { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '1rem' } } />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '0.4rem' } }>
                        <label style={ { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' } }>Aposta Enfrentada (Risk)</label>
                        <input type="number" value={ bet } onChange={ e => setBet( Number( e.target.value ) ) }
                            style={ { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '1rem' } } />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '0.4rem' } }>
                        <label style={ { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' } }>Sua Equidade da Mão (%)</label>
                        <input type="number" value={ equity } onChange={ e => setEquity( Number( e.target.value ) ) } max="100" min="0"
                            style={ { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '1rem' } } />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '0.4rem' } }>
                        <label style={ { fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' } }>Bubble Factor (Pressão)</label>
                        <input type="number" step="0.1" value={ bf } onChange={ e => setBf( Number( e.target.value ) ) }
                            style={ { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '1rem' } } />
                    </div>
                </div>

                {/* Outputs */ }
                <div style={ { display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' } }>

                    {/* Chip EV */ }
                    <div style={ { opacity: 0.6 } }>
                        <div style={ { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                            <i className="fa-solid fa-coins" /> Chip EV (S/ Pressão)
                        </div>
                        <div style={ { fontSize: '2rem', fontWeight: 800, color: isChipEvPositive ? '#10b981' : '#f43f5e' } }>
                            { chipEv > 0 ? '+' : '' }{ chipEv.toFixed( 2 ) } <span style={ { fontSize: '1rem', fontWeight: 500 } }>fichas</span>
                        </div>
                        <p style={ { margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#64748b' } }>
                            Decisão lucrativa em Cash Game ou fases iniciais.
                        </p>
                    </div>

                    <hr style={ { border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '0' } } />

                    {/* ICM EV */ }
                    <div>
                        <div style={ { fontSize: '0.85rem', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                            <i className="fa-solid fa-scale-balanced" /> ICM EV (Real)
                        </div>
                        <div style={ { fontSize: '2.5rem', fontWeight: 900, color: isIcmEvPositive ? '#10b981' : '#f43f5e' } }>
                            { icmEv > 0 ? '+' : '' }{ icmEv.toFixed( 2 ) } <span style={ { fontSize: '1rem', fontWeight: 500 } }>valor real</span>
                        </div>

                        <div style={ { marginTop: '0.75rem', padding: '0.75rem', background: isIcmEvPositive ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', borderLeft: `3px solid ${ isIcmEvPositive ? '#10b981' : '#f43f5e' }`, borderRadius: '4px' } }>
                            <p style={ { margin: 0, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 } }>
                                { isChipEvPositive && !isIcmEvPositive ? (
                                    <>
                                        <strong style={ { color: '#f43f5e' } }>Fold Obrigatório.</strong> A pressão do torneio (BF { bf }) anula a equidade da sua mão. Pagar custa ROI.
                                    </>
                                ) : !isChipEvPositive && !isIcmEvPositive ? (
                                    <>
                                        <strong style={ { color: '#f43f5e' } }>Fold.</strong> Mão perdedora em fichas e perdedora em dinheiro.
                                    </>
                                ) : (
                                    <>
                                        <strong style={ { color: '#10b981' } }>Call Lucrativo.</strong> A mão é tão forte que supera até o multiplicador de dor do ICM.
                                    </>
                                ) }
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
