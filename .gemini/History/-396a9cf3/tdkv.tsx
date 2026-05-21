"use client";

import { useState, useMemo } from "react";
import { calculateRequiredEquity, calculateRiskPremium, calculateCallEV } from "@/lib/icm";
import
    {
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ResponsiveContainer,
        ReferenceLine
    } from 'recharts';

export function DownwardDriftSimulator ()
{
    const [ pot, setPot ] = useState( 100 );
    const [ bet, setBet ] = useState( 100 );
    const [ bubbleFactor, setBubbleFactor ] = useState( 1.2 );
    const [ handEquity, setHandEquity ] = useState( 0.40 );

    const { requiredEquity, riskPremium } = useMemo( () =>
    {
        const equity = calculateRequiredEquity( pot, bet, bubbleFactor );
        const rp = calculateRiskPremium( bubbleFactor );

        // ChipEV Puro (Risco sem punição de Bubble Factor)
        const pureChipEV = ( handEquity * ( pot + bet ) ) - ( ( 1 - handEquity ) * bet );
        // ICM EV (Risco letal multiplicado pelo Bubble Factor)
        const icmCallEV = calculateCallEV( pot, bet, bubbleFactor, handEquity );

        return {
            requiredEquity: equity,
            riskPremium: rp,
            callEV: icmCallEV,
            chipEV: pureChipEV
        };
    }, [ pot, bet, bubbleFactor, handEquity ] );

    // SOTA: Projecao preditiva para o Grafico Recharts
    const chartData = useMemo( () =>
    {
        const data = [];
        // Simulamos a curva de pressao variando o BF de 1.0 (ChipEV) ate 2.5 (Extrema Pressao)
        // E calculamos o RP correspondente para o eixo X
        for ( let bf = 1.0; bf <= 2.5; bf += 0.05 )
        { // Passo menor para curva mais suave
            const rp = calculateRiskPremium( bf );
            const icmEV = calculateCallEV( pot, bet, bf, handEquity );
            const pureChipEV = ( handEquity * ( pot + bet ) ) - ( ( 1 - handEquity ) * bet );

            data.push( {
                rp: Number( ( rp * 100 ).toFixed( 1 ) ), // RP como porcentagem para o eixo X
                bfValue: bf.toFixed( 2 ), // Mantem BF para tooltip
                icmEV: Number( icmEV.toFixed( 2 ) ),
                chipEV: Number( pureChipEV.toFixed( 2 ) )
            } );
        }
        return data;
    }, [ pot, bet, handEquity ] );

    const formatPercent = ( value: number ) =>
    {
        return `${ ( value * 100 ).toFixed( 2 ) }%`;
    };

    // Custom Tooltip para o Recharts (Estetica SOTA)
    const CustomTooltip = ( { active, payload, label }: any ) =>
    {
        if ( active && payload && payload.length )
        {
            const currentDataPoint = chartData.find( d => Number( ( d.rp ).toFixed( 1 ) ) === Number( label ) ); // Encontra o ponto de dados por RP
            return (
                <div className="p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                    <p className="mb-2 font-bold text-white">Risk Premium (RP): { label }%</p>
                    { currentDataPoint && <p className="text-sm text-orange-400">Bubble Factor (BF): { currentDataPoint.bfValue }</p> }
                    <p className="text-sm text-cyan-400">ChipEV: { payload[ 1 ].value } fichas</p>
                    <p className="text-sm font-semibold text-red-400">ICM EV: { payload[ 0 ].value } fichas</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full max-w-4xl p-8 mx-auto space-y-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-cyan-400">
                Simulador de Downward Drift (ICM)
            </h2>

            {/* Controles */ }
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="pot" className="block mb-2 text-sm font-medium text-gray-300">
                            Tamanho do Pote: <span className="font-bold text-white">{ pot }</span>
                        </label>
                        <input
                            id="pot"
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={ pot }
                            onChange={ ( e ) => setPot( Number( e.target.value ) ) }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="bet" className="block mb-2 text-sm font-medium text-gray-300">
                            Tamanho da Aposta: <span className="font-bold text-white">{ bet }</span>
                        </label>
                        <input
                            id="bet"
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={ bet }
                            onChange={ ( e ) => setBet( Number( e.target.value ) ) }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="bf" className="block mb-2 text-sm font-medium text-gray-300">
                        Bubble Factor (BF): <span className="font-bold text-white">{ bubbleFactor.toFixed( 2 ) }</span>
                    </label>
                    <input
                        id="bf"
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.01"
                        value={ bubbleFactor }
                        onChange={ ( e ) => setBubbleFactor( Number( e.target.value ) ) }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Resultados */ }
            <div className="p-6 text-center bg-gray-800 border border-gray-600 rounded-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Resultados da Decisão (Call)</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">EV em ChipEV (Ilusão)</p>
                        <p className={ `text-3xl font-bold ${ chipEV >= 0 ? 'text-green-400' : 'text-red-500' }` }>{ chipEV > 0 ? '+' : '' }{ chipEV.toFixed( 2 ) }</p>
                    </div>
                    <div className="p-4 bg-gray-900 border border-orange-900/50 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.1)]">
                        <p className="text-sm text-orange-400/80">EV com ICM (Realidade)</p>
                        <p className={ `text-3xl font-bold ${ callEV >= 0 ? 'text-green-400' : 'text-red-500' }` }>{ callEV > 0 ? '+' : '' }{ callEV.toFixed( 2 ) }</p>
                    </div>
                </div>

                <div className="flex justify-around pt-4 border-t border-gray-700">
                    <div>
                        <p className="text-sm text-gray-400">Risk Premium (RP)</p>
                        <p className="text-xl font-bold text-orange-400">{ formatPercent( riskPremium ) }</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Equidade Mínima Exigida</p>
                        <p className="text-xl font-bold text-red-500">{ formatPercent( requiredEquity ) }</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    Observe como uma mão lucrativa em ChipEV pode se tornar um desastre de utilidade (EV negativo) quando submetida à pressão do Bubble Factor. O ICM penaliza assimetricamente o risco.
                </p>
            </div>

            {/* Grafico Recharts (Geometria do Risco SOTA) */ }
            <div className="pt-6 border-t border-gray-700">
                <h3 className="mb-6 text-xl font-semibold text-center text-white">Curva de Interseccao (Downward Drift)</h3>
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ chartData } margin={ { top: 5, right: 20, bottom: 5, left: 0 } }>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={ false } />
                            <XAxis dataKey="rp" stroke="#9ca3af" tick={ { fill: '#9ca3af' } } name="Risk Premium (%)" unit="%" />
                            <YAxis stroke="#9ca3af" tick={ { fill: '#9ca3af' } } />
                            <Tooltip content={ <CustomTooltip /> } />
                            <Legend wrapperStyle={ { paddingTop: '20px' } } />

                            {/* Linha Zero (Break-even absoluto) */ }
                            <ReferenceLine y={ 0 } stroke="#4b5563" strokeWidth={ 2 } />

                            {/* Linha Guia do RP Atual do usuario */ }
                            <ReferenceLine x={ Number( ( riskPremium * 100 ).toFixed( 1 ) ) } stroke="#f97316" strokeDasharray="3 3" label={ { position: 'top', value: 'Seu RP Atual', fill: '#f97316', fontSize: 12 } } />

                            <Line type="monotone" dataKey="icmEV" name="EV com ICM (Real)" stroke="#ef4444" strokeWidth={ 3 } dot={ false } activeDot={ { r: 6 } } />
                            <Line type="monotone" dataKey="chipEV" name="ChipEV (Ilusao)" stroke="#06b6d4" strokeWidth={ 2 } strokeDasharray="5 5" dot={ false } />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="mt-6 text-xs text-center text-gray-500">
                    O eixo horizontal representa a dor financeira (Risk Premium). Observe como a linha vermelha cruza o eixo zero e mergulha no negativo, mostrando o exato momento em que o <strong>Risk Premium</strong> torna o call matematicamente proibido, mesmo a mao possuindo uma equidade viavel.
                </p>
            </div>
        </div>
    );
}
