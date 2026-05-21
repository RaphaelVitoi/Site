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

// === ONTOLOGIA VITOI SOTA v4.1 ===
// Componente de Renderizacao: Degadacao de Utilitade (Pot Odds vs Perspectiva)
// Strict Rule: Friccao Zero, Pure ASCII, Rigor Matematico SOTA Aesthetics.

interface DegradationChartProps {
    readonly sEff?: number;
    readonly riskAversion?: number;
    readonly fb?: number;
    readonly perspectivaBase?: number;
    readonly potOddsPct?: number;
    readonly potSizePct?: number;
}

export default function DegradationChart( { sEff = 40, riskAversion = 1.5, fb = 0, perspectivaBase, potOddsPct: legacyPotOdds, potSizePct }: Readonly<DegradationChartProps> ) {
    // Motor SOTA de Antevisao: Recalculo Dinamico de Insolvencia
    const data = useMemo( () => {
        return [2, 3, 4, 5, 6].map( ( players ) => {
            const potOdds = 0.5;
            const evFold = -0.125;
            const rio = players < 3 ? 0 : 0.5 * Math.pow( players, 1.5 ) * riskAversion;

            let edge = Math.log( sEff - 14 ) / Math.log( 86 );
            if ( sEff <= 15 ) edge = 0;
            else if ( sEff >= 100 ) edge = 1;

            const rawUtility = 1 + evFold - rio;
            const perspectiva = rawUtility * ( 0.5 + 0.5 * edge ) + fb;
            const ci = perspectiva / potOdds;

            return {
                players,
                potOdds,
                perspectiva: Number( perspectiva.toFixed( 2 ) ),
                ci: Number( ci.toFixed( 2 ) )
            };
        } );
    }, [sEff, riskAversion, fb] );

    return (
        <div className="w-full h-96 glass-panel p-6 flex flex-col font-mono">
            <h2 className="text-sm text-accent-indigo-light mb-1 font-black tracking-widest uppercase">
                [SOTA] Insolvência das Pot Odds (Multiway)
            </h2>
            <p className="text-[0.65rem] text-text-muted mb-6 leading-relaxed">
                Evidência do colapso da heurística de 1ª ordem sob entropia (RIO x²).
                A zona vermelha representa o "Cemitério Estratégico" (Cᵢ &lt; 1).
            </p>

            <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 } initialDimension={ { width: 1, height: 1 } }>
                <LineChart data={ data } margin={ { top: 10, right: 10, left: 0, bottom: 0 } }>
                    <defs>
                        <linearGradient id="cemeteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-danger)" stopOpacity={ 0.15 } />
                            <stop offset="100%" stopColor="var(--accent-danger)" stopOpacity={ 0.0 } />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                    <XAxis dataKey="players" stroke="var(--text-darker)" tick={ { fontSize: 10 } } axisLine={ false } tickLine={ false } />
                    <YAxis stroke="var(--text-darker)" tick={ { fontSize: 10 } } axisLine={ false } tickLine={ false } />
                    <Tooltip contentStyle={ { backgroundColor: 'var(--bg-panel)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-bright)', borderRadius: '8px', fontSize: '0.75rem' } } />
                    <Legend wrapperStyle={ { paddingTop: '10px', fontSize: '0.7rem' } } />
                    <ReferenceLine y={ 0 } stroke="var(--accent-danger)" strokeDasharray="3 3" label={ { position: 'insideTopLeft', value: 'EV Fold', fill: 'var(--accent-danger)', fontSize: 10 } } />
                    <ReferenceArea x1={ 3 } x2={ 6 } y1={ 0 } y2={ 0.5 } fill="url(#cemeteryGradient)" strokeOpacity={ 0 } />
                    <Line type="monotone" dataKey="potOdds" name="Pot Odds (Heurística)" stroke="var(--accent-emerald)" strokeWidth={ 2 } dot={ { r: 3, fill: 'var(--bg-deep)' } } />
                    <Line type="monotone" dataKey="perspectiva" name="Perspectiva" stroke="var(--accent-amber)" strokeWidth={ 3 } dot={ { r: 5, fill: 'var(--accent-amber)' } } activeDot={ { r: 7 } } />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
