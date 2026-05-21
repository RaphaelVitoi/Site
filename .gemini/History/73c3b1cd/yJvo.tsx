import { useState } from 'react';
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

const degradationData = [
    { players: 2, potOdds: 0.5, perspectiva: 0.8, ci: 1.6 },
    { players: 3, potOdds: 0.5, perspectiva: -0.2, ci: -0.4 }, // Threshold Multiway (Insolvencia)
    { players: 4, potOdds: 0.5, perspectiva: -1.5, ci: -3.0 },
    { players: 5, potOdds: 0.5, perspectiva: -3.5, ci: -7.0 },
    { players: 6, potOdds: 0.5, perspectiva: -6.0, ci: -12.0 },
];

export default function DegradationChart () {
    const [ data ] = useState( degradationData );

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
