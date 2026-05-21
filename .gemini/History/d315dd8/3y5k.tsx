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
    perspectivaBase: number;
    potOddsPct: number;
    potSizePct: number;
}

export default function DegradationChart ( { perspectivaBase, potOddsPct, potSizePct }: Readonly<DegradationChartProps> ) {
    // Motor SOTA de Antevisao: Recalculo Dinamico de Insolvencia
    const data = useMemo( () => {
        return [ 2, 3, 4, 5, 6 ].map( ( players ) => {
            // SOTA: Substituicao de Mocks pela equacao exata do Motor de Perspectiva
            // RIO(N) = (N-1)^2 * (potSizePct / 10)
            const currentRio = Math.pow( players - 1, 2 ) * ( potSizePct / 10 );

            // O baseline foi calculado para N=2. Descontamos a punicao incremental.
            const baseRio = Math.pow( 2 - 1, 2 ) * ( potSizePct / 10 );
            const degradedPerspectiva = perspectivaBase - ( currentRio - baseRio );

            const ci = degradedPerspectiva / ( potOddsPct || 1 );

            return {
                players,
                potOdds: Number( potOddsPct.toFixed( 1 ) ),
                perspectiva: Number( degradedPerspectiva.toFixed( 2 ) ),
                ci: Number( ci.toFixed( 2 ) )
            };
        } );
    }, [ perspectivaBase, potOddsPct, potSizePct ] );

    return (
        <div className="w-full h-80 bg-neutral-950 p-4 rounded-lg shadow-lg border border-neutral-800 font-mono mt-4">
            <h2 className="text-[0.65rem] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <i className="fa-solid fa-chart-line"></i> Colapso de Utilidade (Multiway)
            </h2>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Evidência do Colapso da Heurística de 1ª Ordem sob Entropia.
                A Perspectiva Matemática despenca à medida que o RIO cresce quadraticamente <code className="text-rose-400 bg-rose-900/30 px-1">(N-1)²</code>.
                A zona avermelhada representa o <strong>Cemitério Estratégico</strong> (Coeficiente de Insolvência Ci &lt; 1).
            </p>

            <ResponsiveContainer width="100%" height="70%" minWidth={ 0 } minHeight={ 0 } initialDimension={ { width: 1, height: 1 } }>
                <LineChart data={ data } margin={ { top: 20, right: 30, left: 20, bottom: 5 } }>
                    <defs>
                        <linearGradient id="cemeteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-danger)" stopOpacity={ 0.4 } />
                            <stop offset="100%" stopColor="var(--accent-danger)" stopOpacity={ 0 } />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="players" stroke="#64748b" fontSize={ 10 } label={ { value: 'Jogadores no Pote', position: 'insideBottomRight', offset: -10, fill: '#64748b', fontSize: 10 } } />
                    <YAxis stroke="#64748b" fontSize={ 10 } />
                    <Tooltip contentStyle={ { backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' } } />
                    <Legend wrapperStyle={ { fontSize: '10px', paddingTop: '10px' } } />

                    <ReferenceLine y={ 0 } stroke="rgba(244,63,94,0.5)" strokeDasharray="3 3" label={ { position: 'insideTopLeft', value: 'Baseline', fill: 'rgba(244,63,94,0.8)', fontSize: 10 } } />

                    {/* Cemitério Estratégico: Quando a Perspectiva fica abaixo das Pot Odds */ }
                    <ReferenceArea y1={ 0 } y2={ potOddsPct } fill="url(#cemeteryGradient)" strokeOpacity={ 0 } />

                    <Line type="stepAfter" dataKey="potOdds" name="Pot Odds (%)" stroke="#10b981" strokeWidth={ 2 } dot={ false } strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="perspectiva" name="Perspectiva (PM%)" stroke="#818cf8" strokeWidth={ 3 } dot={ { r: 4, fill: '#818cf8' } } activeDot={ { r: 6 } } />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
