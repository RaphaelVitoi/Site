import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface InsolvencyPayload
{
    villainRange: string;
    board: string;
    rpFactor: number;
    heroInvested: number;
    currentPot: number;
    activePlayers: number;
    kappa: number;
}

interface InsolvencyResult
{
    winRate: number;
    loseRate: number;
    tieRate: number;
    trueEv: number;
    riskIndex: number;
}

export const InsolvencyMatrix: React.FC = () =>
{
    const workerRef = useRef<Worker | null>( null );
    const [ result, setResult ] = useState<InsolvencyResult | null>( null );
    const [ isCalculating, setIsCalculating ] = useState( false );

    // Estado local para Inputs (Controlled Components)
    const [ params, setParams ] = useState<InsolvencyPayload>( {
        villainRange: 'QQ+, AKs, AKo',
        board: 'AhKd2s',
        rpFactor: 1.5,
        heroInvested: 50,
        currentPot: 200,
        activePlayers: 3,
        kappa: 0.85
    } );

    // Inicialização Blindada do Worker
    useEffect( () =>
    {
        workerRef.current = new Worker(
            new URL( './workers/insolvency.worker.ts', import.meta.url ),
            { type: 'module' }
        );

        workerRef.current.onmessage = ( e: MessageEvent ) =>
        {
            const { type, matrix, error } = e.data;
            setIsCalculating( false );

            if ( error )
            {
                console.error( "[SOTA UI] Falha no motor WASM:", error );
                return;
            }

            if ( type === 'MATRIX' && matrix )
            {
                setResult( {
                    winRate: matrix[ 0 ],
                    loseRate: matrix[ 1 ],
                    tieRate: matrix[ 2 ],
                    trueEv: matrix[ 3 ],
                    riskIndex: matrix[ 4 ]
                } );
            }
        };

        return () => workerRef.current?.terminate();
    }, [] );

    // Despacho Quantizado (Auto-Debounce)
    useEffect( () =>
    {
        setIsCalculating( true );
        const timer = setTimeout( () =>
        {
            if ( workerRef.current )
            {
                workerRef.current.postMessage( {
                    type: 'MATRIX',
                    ...params,
                    id: crypto.randomUUID()
                } );
            }
        }, 300 ); // 300ms de debounce para evitar I/O Spam durante a digitação

        return () => clearTimeout( timer );
    }, [ params ] );

    const handleParamChange = ( field: keyof InsolvencyPayload, value: string | number ) =>
    {
        setParams( prev => ( { ...prev, [ field ]: value } ) );
    };

    const chartData = result ? [
        { metric: 'Win Rate (%)', value: Number( ( result.winRate * 100 ).toFixed( 2 ) ) },
        { metric: 'True EV', value: Number( Math.max( 0, result.trueEv ).toFixed( 2 ) ) },
        { metric: 'Risk (x1000)', value: Number( ( result.riskIndex * 1000 ).toFixed( 2 ) ) }
    ] : [];

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

    return (
        <div className="bg-[#121212] border border-[#00ffcc]/30 p-6 rounded-lg font-mono text-white shadow-[0_0_15px_rgba(0,255,204,0.1)]">
            <h2 className="text-xl font-bold text-[#00ffcc] mb-4 tracking-tighter uppercase">MATRIZ DE INSOLVÊNCIA (WASM O(1))</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="flex flex-col text-xs text-gray-400">
                    <span>Vilão Range</span>
                    <input type="text" value={ params.villainRange } onChange={ e => handleParamChange( 'villainRange', e.target.value ) } className="bg-black border border-gray-700 p-2 mt-1 text-[#00ffcc] focus:border-[#00ffcc] outline-none transition-colors" />
                </label>
                <label className="flex flex-col text-xs text-gray-400">
                    <span>Board Text</span>
                    <input type="text" value={ params.board } onChange={ e => handleParamChange( 'board', e.target.value ) } className="bg-black border border-gray-700 p-2 mt-1 text-[#00ffcc] focus:border-[#00ffcc] outline-none transition-colors" />
                </label>
            </div>

            <div className="bg-black/50 p-4 border-l-4 border-[#00ffcc] relative overflow-hidden">
                { isCalculating && <div className="absolute top-0 right-0 p-2 text-xs text-[#00ffcc] animate-pulse">Calculando...</div> }

                <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-2">Resultados Termodinâmicos</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-lg items-center">
                    <div>
                        <div><span className="text-gray-500 text-sm block">Win Rate</span> { ( ( result?.winRate ?? 0 ) * 100 ).toFixed( 2 ) }%</div>
                        <div className="mt-2"><span className="text-gray-500 text-sm block">True EV</span> { result?.trueEv.toFixed( 2 ) } chips</div>
                        <div className="mt-4 pt-2 border-t border-gray-800 text-2xl font-bold" style={ { color: radarColor } }>
                            <span className="text-gray-500 text-sm block">Risk Index (Insolvência)</span>
                            { result?.riskIndex.toFixed( 4 ) }
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
