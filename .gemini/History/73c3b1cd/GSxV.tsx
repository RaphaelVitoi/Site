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
}

export default function DegradationChart ( { sEff, riskAversion }: DegradationChartProps ) {
    // Motor SOTA de Antevisao: Recalculo Dinamico de Insolvencia
    const data = useMemo( () => {
        const baselines = [ 0.8, -0.2, -1.5, -3.5, -6 ];
        return [ 2, 3, 4, 5, 6 ].map( ( players, index ) => {
            const potOdds = 0.5;
            // Amortizacao da Edge: Colapso do stack reduz o piso base de realizacao
            const edgePenalty = ( 25 - sEff ) * 0.03;
            // Pressao de ICM: Risco pune exponencialmente o passivo estrutural multiway
            const icmPenalty = ( riskAversion - 1.5 ) * ( players * 0.7 );

            const perspectiva = baselines[ index ] - edgePenalty - icmPenalty;
            const ci = perspectiva / potOdds;

            return {
                players,
                potOdds,
                perspectiva: Number( perspectiva.toFixed( 2 ) ),
                ci: Number( ci.toFixed( 2 ) )
            };
        } );
    }, [ sEff, riskAversion ] );

    return (
        <div className="w-full h-96 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 font-mono">
            <h2 className="text-xl text-cyan-400 mb-2 font-bold tracking-tighter uppercase">
                [SOTA] Insolvencia das Pot Odds (Multiway)
            </h2>
            <p className="text-xs text-gray-400 mb-4">
                Evidencia do Colapso da Heuristica de 1a Ordem sob Entropia (RIO x2).
                A zona vermelha representa o "Cemiterio Estrategico" (Coeficiente de Insolvencia Ci &lt; 1).
            </p>

            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={ data } margin={ { top: 20, right: 30, left: 20, bottom: 5 } }>
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
                        fill="#ff0000" fillOpacity={ 0.2 }
                        strokeOpacity={ 0 }
                    />

                    <Line
                        type="monotone" dataKey="potOdds" name="Pot Odds (Heuristica)"
                        stroke="#00ff00" strokeWidth={ 2 } dot={ { r: 4 } }
                    />
                    <Line
                        type="monotone" dataKey="perspectiva" name="Perspectiva Matematica"
                        stroke="#eab308" strokeWidth={ 3 } dot={ { r: 6 } } activeDot={ { r: 8 } }
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
