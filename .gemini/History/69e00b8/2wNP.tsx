import React from 'react';
import { EsperancaResult, TIER_LABELS, TIER_COLORS, StackTier } from '@/lib/perspectiva';

interface PerspectivePanelProps
{
    data: EsperancaResult | null;
}

const formatPct = ( val: number ) => `${ val > 0 ? '+' : '' }${ val.toFixed( 2 ) }%`;

export default function PerspectivePanel ( { data }: PerspectivePanelProps )
{
    if ( !data )
    {
        return (
            <div style={ {
                padding: '2rem',
                textAlign: 'center',
                border: '1px dashed var(--glass-border)',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.1)'
            } }>
                <p style={ { color: 'var(--text-muted)', fontSize: '0.85rem' } }>
                    <span className="fa-solid fa-chart-network" style={ { marginRight: '8px' } }></span>
                    Aguardando input para calcular a matriz de Perspectiva.
                </p>
            </div>
        );
    }

    const {
        currentEquityPct, currentTier,
        winEquityPct, deltaWinPct, winTier,
        loseEquityPct, deltaLosePct, loseTier,
        esperancaPct, potIcmEvPct, externalityPct,
        tierShift, tierDirection,
        heroName, villainName
    } = data;

    const renderTierBadge = ( tier: StackTier ) => (
        <span style={ {
            backgroundColor: `${ TIER_COLORS[ tier ] }20`,
            color: TIER_COLORS[ tier ],
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.70rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: `1px solid ${ TIER_COLORS[ tier ] }40`
        } }>
            { TIER_LABELS[ tier ] }
        </span>
    );

    return (
        <div style={ {
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '12px', border: '1px solid var(--glass-border)'
        } }>

            <header style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
                <div>
                    <h3 style={ { margin: 0, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-primary)' } }>
                        Motor de Perspectiva SOTA
                    </h3>
                    <p style={ { margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' } }>
                        Esperança Matemática e Externalidades: <strong>{ heroName }</strong> vs <strong>{ villainName }</strong>
                    </p>
                </div>
                <div style={ { textAlign: 'right' } }>
                    <div style={ { fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' } }>Equidade Base</div>
                    <div style={ { fontSize: '1.2rem', fontWeight: 'bold' } }>{ currentEquityPct.toFixed( 2 ) }%</div>
                    <div style={ { marginTop: '0.35rem' } }>{ renderTierBadge( currentTier ) }</div>
                </div>
            </header>

            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' } }>
                <div style={ { backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem' } }>
                    <h4 style={ { margin: '0 0 0.5rem 0', fontSize: '0.70rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' } }>Se Ganhar</h4>
                    <div style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' } }>
                        { winEquityPct.toFixed( 2 ) }% <span style={ { fontSize: '0.85rem', opacity: 0.8 } }>({ formatPct( deltaWinPct ) })</span>
                    </div>
                    <div style={ { marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                        { renderTierBadge( winTier ) }
                        { tierShift && tierDirection === 'up' && <span style={ { color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' } }>↑ Upgrade</span> }
                    </div>
                </div>

                <div style={ { backgroundColor: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', padding: '1rem' } }>
                    <h4 style={ { margin: '0 0 0.5rem 0', fontSize: '0.70rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' } }>Se Perder</h4>
                    <div style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#f43f5e' } }>
                        { loseEquityPct.toFixed( 2 ) }% <span style={ { fontSize: '0.85rem', opacity: 0.8 } }>({ formatPct( deltaLosePct ) })</span>
                    </div>
                    <div style={ { marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                        { renderTierBadge( loseTier ) }
                        { tierShift && tierDirection === 'down' && <span style={ { color: '#f43f5e', fontSize: '0.75rem', fontWeight: 'bold' } }>↓ Downgrade</span> }
                    </div>
                </div>
            </div>

            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' } }>
                <div>
                    <div style={ { fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' } }>
                        EV Puro do Pote
                        <i className="fa-solid fa-circle-info" title="Valor linear das fichas em jogo, ignorando a pressão de sobrevivência e os saltos de premiação. (Equivalente ao ChipEV)" style={ { cursor: 'help', opacity: 0.7 } }></i>
                    </div>
                    <div style={ { fontSize: '1.1rem', fontWeight: 'bold' } }>{ formatPct( potIcmEvPct ) }</div>
                    <div style={ { fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' } }>Valor bruto das fichas</div>
                </div>

                <div>
                    <div style={ { fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' } }>
                        Externalidade
                        <i className="fa-solid fa-circle-info" title="Impacto invisível da sua jogada na mesa. Mede como ganhar/perder redistribui a equidade dos OUTROS jogadores (sobrevivência sistêmica)." style={ { cursor: 'help', opacity: 0.7 } }></i>
                    </div>
                    <div style={ { fontSize: '1.1rem', fontWeight: 'bold', color: externalityPct > 0 ? '#10b981' : ( externalityPct < 0 ? '#f43f5e' : 'inherit' ) } }>
                        { formatPct( externalityPct ) }
                    </div>
                    <div style={ { fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' } }>Impacto sistêmico da ação</div>
                </div>

                <div style={ { backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)' } }>
                    <div style={ { fontSize: '0.70rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' } }>
                        Esperança Real
                        <i className="fa-solid fa-circle-info" title="O ganho/perda de equidade definitivo. É a soma do EV bruto com a Externalidade sistêmica gerada pelo seu movimento." style={ { cursor: 'help', opacity: 0.8 } }></i>
                    </div>
                    <div style={ { fontSize: '1.2rem', fontWeight: 'bold', color: esperancaPct > 0 ? '#10b981' : ( esperancaPct < 0 ? '#f43f5e' : 'inherit' ) } }>
                        { formatPct( esperancaPct ) }
                    </div>
                    <div style={ { fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' } }>P(win) × ΔW + P(lose) × ΔL</div>
                </div>
            </div>
        </div>
    );
}
