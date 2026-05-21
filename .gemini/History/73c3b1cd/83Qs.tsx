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

// === ONTOLOGIA VITOI SOTA v3.2 ===
// Componente de Renderizacao: Degadacao de Utilitade (Pot Odds vs Perspectiva)
// Strict Rule: Friccao Zero, Pure ASCII, Rigor Matematico.

interface DegradationChartProps {
    readonly sEff: number;
    readonly riskAversion: number;
    readonly fb: number;
}

export default function DegradationChart ( { sEff, riskAversion, fb }: DegradationChartProps ) {
    // Motor SOTA de Antevisao: Recalculo Dinamico de Insolvencia
    const data = useMemo( () => {
        return [ 2, 3, 4, 5, 6 ].map( ( players ) => {
            const potOdds = 0.5;

            // 1. Baseline Dinamico (EV Fold basico)
            const evFold = -0.125;

            // 2. Passivo Estrutural (RIO Exponencial em Multiway)
            const rio = players < 3 ? 0 : 0.5 * Math.pow( players, 1.5 ) * riskAversion;

            // 3. Amortizacao da Edge (Colapso da arvore mecanica)
            let edge = 0;
            if ( sEff >= 100 )
            {
                edge = 1;
            } else if ( sEff > 15 )
            {
                edge = Math.log( sEff - 14 ) / Math.log( 86 );
            }

            // 4. Utilidade Bruta e Perspectiva Matematica VITOI v3.2
            const rawUtility = 1 + evFold - rio;
            // Injetando f_b: Amortecedor de variancia comportamental
            const perspectiva = rawUtility * ( 0.5 + 0.5 * edge ) + fb;
            const ci = perspectiva / potOdds;

            return {
                players,
                potOdds,
                perspectiva: Number( perspectiva.toFixed( 2 ) ),
                ci: Number( ci.toFixed( 2 ) )
            };
        } );
    }, [ sEff, riskAversion, fb ] );

    return (
        <div className="w-full h-96 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 font-mono">
            <h2 className="text-xl text-cyan-400 mb-2 font-bold tracking-tighter uppercase">
                [SOTA] Insolvencia das Pot Odds (Multiway)
            </h2>
            <p className="text-xs text-gray-400 mb-4">
                Evidencia do Colapso da Heuristica de 1a Ordem sob Entropia (RIO x2).
                A zona vermelha representa o &quot;Cemiterio Estrategico&quot; (Coeficiente de Insolvencia Ci &lt; 1).
            </p>

            <ResponsiveContainer width="100%" height="80%" minWidth={ 1 } minHeight={ 1 } initialDimension={ { width: 1, height: 1 } }>
                <LineChart data={ data } margin={ { top: 20, right: 30, left: 20, bottom: 5 } }>
                    <defs>
                        <filter id="neonGlowRose" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="cemeteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity={ 0.4 } />
                            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={ 0 } />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="players" stroke="#888" label={ { value: 'Jogadores no Pote', position: 'insideBottomRight', offset: -10, fill: '#888' } } />
                    <YAxis stroke="#888" label={ { value: 'Utilidade (EV bb)', angle: -90, position: 'insideLeft', fill: '#888' } } />
                    <Tooltip
                        contentStyle={ { backgroundColor: '#111', borderColor: '#333', color: '#fff' } }
                        itemStyle={ { fontWeight: 'bold' } }
                    />
                    <Legend wrapperStyle={ { paddingTop: '20px' } } />

                    <ReferenceLine y={ 0 } stroke="#ff0000" strokeDasharray="3 3" label={ { position: 'insideTopLeft', value: 'Baseline Fold (0)', fill: '#ff4444', fontSize: 12 } } />

                    {/* Zona de Prejuizo (Cemiterio Estrategico) - Entre o atrativo das Odds e o EV negativo */ }
                    <ReferenceArea
                        x1={ 3 } x2={ 6 } y1={ 0 } y2={ 0.5 }
                        fill="url(#cemeteryGradient)"
                        strokeOpacity={ 0 }
                    />

                    <Line
                        type="monotone" dataKey="potOdds" name="Pot Odds (Heuristica)"
                        stroke="#00ff00" strokeWidth={ 2 } dot={ { r: 4 } }
                    />
                    <Line
                        type="monotone" dataKey="perspectiva" name="Perspectiva Matematica"
                        stroke="#eab308" strokeWidth={ 3 } dot={ { r: 6 } } activeDot={ { r: 8 } }
                        filter="url(#neonGlowRose)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
