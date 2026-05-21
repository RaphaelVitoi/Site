import React, { useContext, useDeferredValue, useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { SotaSpotContext, SotaWasmContext } from './SotaContext';

export const InsolvencyMatrix: React.FC = () =>
{
    const spotCtx = useContext( SotaSpotContext );
    const wasmCtx = useContext( SotaWasmContext );

    // Extração segura antes do early return para respeitar a Lei dos Hooks do React
    const rawResult = wasmCtx?.insolvencyMatrixData;
    const result = useDeferredValue( rawResult );
    const isRenderingDeferred = rawResult !== result;

    const radarColor = useMemo( () =>
    {
        if ( result?.riskIndex === undefined )
        {
            return '#ff3366'; // Cor de risco alto padrão
        }

        // Limiares para a interpolação de cor
        const lowRiskThreshold = 0.02; // Abaixo disso é amarelo
        const highRiskThreshold = 0.2; // Acima disso é vermelho

        // Normaliza o riskIndex para uma escala de 0 a 1 entre os limiares
        const factor = Math.min( 1, Math.max( 0, ( result.riskIndex - lowRiskThreshold ) / ( highRiskThreshold - lowRiskThreshold ) ) );

        // Interpolação de Hue (HSL): Amarelo (H=60) para Vermelho (H=0)
        const hue = 60 * ( 1 - factor );
        return `hsl(${ hue }, 100%, 50%)`;
    }, [ result ] );

    if ( !spotCtx || !wasmCtx ) return null;

    const { spotData } = spotCtx;
    const { isCalculatingInsolvency: isCalculating } = wasmCtx;

    const chartData = result ? [
        { metric: 'Win Rate (%)', value: Number( ( result.winRate * 100 ).toFixed( 2 ) ) },
        { metric: 'True EV', value: Number( Math.max( 0, result.trueInsolvencyEv ).toFixed( 2 ) ) },
        { metric: 'Risk (x1000)', value: Number( ( result.riskIndex * 1000 ).toFixed( 2 ) ) }
    ] : [];

    return (
        <div className="bg-[#121212] border border-[#00ffcc]/30 p-6 rounded-lg font-mono text-white shadow-[0_0_15px_rgba(0,255,204,0.1)]">
            <h2 className="text-xl font-bold text-[#00ffcc] mb-4 tracking-tighter uppercase">MATRIZ DE INSOLVÊNCIA (WASM O(1))</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="flex flex-col text-xs text-gray-400">
                    <span>Vilão Range</span>
                    <div className="bg-black/40 border border-gray-800 p-2 mt-1 text-accent-indigo-light rounded truncate">{ spotData.villainRange || 'Any Two' }</div>
                </label>
                <label className="flex flex-col text-xs text-gray-400">
                    <span>Board Text</span>
                    <div className="bg-black/40 border border-gray-800 p-2 mt-1 text-accent-emerald-light rounded truncate">{ spotData.board || 'Pre-Flop' }</div>
                </label>
            </div>

            <div className="bg-black/50 p-4 border-l-4 border-[#00ffcc] relative overflow-hidden">
                { ( isCalculating || isRenderingDeferred ) && <div className="absolute top-0 right-0 p-2 text-[0.65rem] font-bold tracking-widest text-[#00ffcc] uppercase animate-pulse">Calculando Termodinâmica...</div> }

                <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-2">Resultados Termodinâmicos</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-lg items-center">
                    <div>
                        <div><span className="text-gray-500 text-sm block">Win Rate</span> { ( ( result?.winRate ?? 0 ) * 100 ).toFixed( 2 ) }%</div>
                        <div className="mt-2"><span className="text-gray-500 text-sm block">True EV</span> { result?.trueInsolvencyEv?.toFixed( 2 ) ?? '0.00' } chips</div>
                        <div className="mt-4 pt-2 border-t border-gray-800 text-2xl font-bold" style={ { color: radarColor } }>
                            <span className="text-gray-500 text-sm block">Risk Index (Insolvência)</span>
                            { result?.riskIndex?.toFixed( 4 ) ?? '0.0000' }
                        </div>
                    </div>

                    { result && (
                        <motion.div
                            initial={ { opacity: 0, scale: 0.95 } }
                            animate={ { opacity: 1, scale: 1 } }
                            transition={ { duration: 0.6, ease: "easeOut" } }
                            className="h-48 w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ chartData }>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="metric" tick={ { fill: '#00ffcc', fontSize: 11 } } />
                                    <PolarRadiusAxis angle={ 30 } domain={ [ 0, 'auto' ] } tick={ false } axisLine={ false } stroke={ radarColor } />
                                    <Tooltip
                                        contentStyle={ { backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(4px)' } }
                                        itemStyle={ { color: radarColor, fontWeight: 'bold' } }
                                        formatter={ ( value ) => typeof value === 'number' ? [ `${ value.toFixed( 2 ) }`, 'Valor' ] : [ 'N/A', 'Valor' ] }
                                    />
                                    <Radar name="Métricas" dataKey="value" stroke={ radarColor } fill={ radarColor } fillOpacity={ 0.4 } />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    ) }
                </div>
            </div>
        </div>
    );
};
