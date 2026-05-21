'use client';

import { useMemo } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

// === ONTOLOGIA VITOI SOTA v4.3 (SIMETRIA GLOBAL) ===
// Componente de Renderizacao: Degadacao de Utilitade (Pot Odds vs Perspectiva)
// Strict Rule: Consumo de Estado Global (SotaSync), Friccao Zero, Pure ASCII.

interface DegradationChartProps {
    readonly riskAversion?: number;
    readonly fb?: number;
    readonly perspectivaBase?: number;
    readonly potOddsPct?: number;
    readonly potSizePct?: number;
}

export default function DegradationChart( { riskAversion = 1.5, fb = 0, perspectivaBase = 35, potOddsPct = 33.3, potSizePct = 10 }: Readonly<DegradationChartProps> ) {
    // Motor SOTA de Antevisao: Degradar a partir do baseline do MasterSimulator
    const data = useMemo( () => {
        return [2, 3, 4, 5, 6].map( ( players ) => {
            const opponents = players - 1;
            const baseRio = potSizePct / 100;
            const rioPenalty = ( baseRio * Math.pow( opponents, 2 ) * riskAversion ) * 100;
            const baselineRio = ( baseRio * 1 * riskAversion ) * 100; // Offset para ancorar HU (players=2) no perspectivaBase

            // A Perspectiva Base (injetada) JA CONTEM a amortizacao de edge e EV_Fold.
            const pm = perspectivaBase - rioPenalty + baselineRio + ( fb * 100 );
            const ci = potOddsPct > 0 ? pm / potOddsPct : 0;

            return {
                players,
                potOdds: Number( potOddsPct.toFixed( 1 ) ),
                perspectiva: Number( pm.toFixed( 2 ) ),
                ci: Number( ci.toFixed( 2 ) )
            };
        } );
    }, [riskAversion, fb, perspectivaBase, potOddsPct, potSizePct] );

    return (
        <div className="w-full h-96 glass-panel p-6 flex flex-col font-mono">
            <h2 className="text-sm text-accent-indigo-light mb-1 font-black tracking-widest uppercase">
                [SOTA] Insolvência das Pot Odds (Multiway)
            </h2>
            <p className="text-[0.65rem] text-text-muted mb-6 leading-relaxed">
                Evidência do colapso da heurística de 1ª ordem sob entropia (RIO x²).
                A zona vermelha representa o &quot;Cemitério Estratégico&quot; (Cᵢ &lt; 1).
            </p>

            <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 } initialDimension={ { width: 1, height: 1 } }>
                <LineChart data={ data } margin={ { top: 10, right: 10, left: 0, bottom: 0 } }>
                    <defs>
                        <filter id="neonGlowRose" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="cemeteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-danger)" stopOpacity={ 0.15 } />
                            <stop offset="100%" stopColor="var(--accent-danger)" stopOpacity={ 0 } />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                    <XAxis dataKey="players" stroke="var(--text-darker)" tick={ { fontSize: 10 } } axisLine={ false } tickLine={ false } />
                    <YAxis stroke="var(--text-darker)" tick={ { fontSize: 10 } } axisLine={ false } tickLine={ false } />
                    <Tooltip contentStyle={ { backgroundColor: 'var(--bg-panel)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-bright)', borderRadius: '8px', fontSize: '0.75rem' } } />
                    <Legend wrapperStyle={ { paddingTop: '10px', fontSize: '0.7rem' } } />

                    <ReferenceLine y={ 0 } stroke="var(--accent-danger)" strokeDasharray="3 3" label={ { position: 'insideTopLeft', value: 'EV Fold', fill: 'var(--accent-danger)', fontSize: 10 } } />

                    {/* Zona de Prejuizo (Cemiterio Estrategico) - Entre o atrativo das Odds e o EV negativo */ }
                    <ReferenceArea
                        x1={ 3 } x2={ 6 } y1={ -50 } y2={ potOddsPct }
                        fill="url(#cemeteryGradient)"
                        strokeOpacity={ 0 }
                    />

                    <Line
                        type="monotone" dataKey="potOdds" name="Pot Odds (Heuristica)"
                        stroke="var(--accent-emerald)" strokeWidth={ 2 } dot={ { r: 3, fill: 'var(--bg-deep)' } }
                    />
                    <Line
                        type="monotone" dataKey="perspectiva" name="Perspectiva"
                        stroke="var(--accent-amber)" strokeWidth={ 3 } dot={ { r: 5, fill: 'var(--accent-amber)' } } activeDot={ { r: 7 } }
                        filter="url(#neonGlowRose)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
