"use client";

import { calculateRioTension, calculateUtilityEV } from "@/lib/perspectiva";
import { useMemo, useState } from "react";
import {
    CartesianGrid,
    Label,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { SotaTooltip } from '../ui/SotaTooltip';
import { useSotaSync } from './hooks/useSotaSync';

export function DownwardDriftSimulator () {
    const { physics, updatePhysics, isHydrated } = useSotaSync();

    const heroRawStack = physics.heroStack;
    const setHeroRawStack = ( val: number ) => updatePhysics( { heroStack: val } );
    const heroInvested = physics.heroInvested;
    const setHeroInvested = ( val: number ) => updatePhysics( { heroInvested: val } );
    const currentPot = physics.pot;
    const setCurrentPot = ( val: number ) => updatePhysics( { pot: val } );
    const isOop = physics.position === 'OOP';
    const setIsOop = ( val: boolean ) => updatePhysics( { position: val ? 'OOP' : 'IP' } );
    const referenceStatus = physics.referenceStatus;

    const [ baseRioLiability, setBaseRioLiability ] = useState( 15 ); // Base % de RIO

    const { potEntrapment, trueRioTensionIp, trueRioTensionOop, chartData, crossoverPoint } = useMemo( () => {
        const betToCall = currentPot * 0.5;
        const entrapment = ( heroInvested + betToCall ) / Math.max( 0.1, heroRawStack );

        const ipTension = calculateRioTension( heroInvested, currentPot, heroRawStack, 'IP', baseRioLiability );
        const oopTension = calculateRioTension( heroInvested, currentPot, heroRawStack, 'OOP', baseRioLiability );

        // Projeção preditiva simulando o aumento do investimento do Hero (Aprisionamento) e Prospect Theory
        const data = [];
        let firstCrossover = null;

        for ( let invested = 0; invested <= heroRawStack; invested += 2 )
        {
            const simIpTension = calculateRioTension( invested, currentPot, heroRawStack, 'IP', baseRioLiability );
            const simOopTension = calculateRioTension( invested, currentPot, heroRawStack, 'OOP', baseRioLiability );

            const pctInvested = ( invested / heroRawStack ) * 100;

            if ( firstCrossover === null && simOopTension >= 1 )
            {
                firstCrossover = pctInvested;
            }

            // Exemplo de EV puramente ilustrativo para o gráfico de Prospect Theory
            // Vamos simular a utilidade caindo conforme a tensão aumenta
            const fakeChipEv = 50 - ( invested * 1.5 );
            const fakeUtilityEv = calculateUtilityEV( fakeChipEv, referenceStatus );

            data.push( {
                investedPct: Number( pctInvested.toFixed( 0 ) ),
                ipTension: Number( ( simIpTension * 100 ).toFixed( 1 ) ),
                oopTension: Number( ( simOopTension * 100 ).toFixed( 1 ) ),
                chipEv: Number( fakeChipEv.toFixed( 1 ) ),
                utilityEv: Number( fakeUtilityEv.toFixed( 1 ) )
            } );
        }

        return {
            potEntrapment: entrapment,
            trueRioTensionIp: ipTension,
            trueRioTensionOop: oopTension,
            chartData: data,
            crossoverPoint: firstCrossover
        };
    }, [ heroInvested, currentPot, heroRawStack, baseRioLiability, referenceStatus ] );

    const formatPercent = ( value: number ) => {
        return `${( value * 100 ).toFixed( 1 )}%`;
    };

    const activeTension = isOop ? trueRioTensionOop : trueRioTensionIp;

    return (
        <div className="w-full max-w-4xl p-8 mx-auto space-y-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-cyan-400">
                Simulador de Downward Drift & Pot Entrapment
            </h2>

            {/* Controles */ }
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="heroRawStack" className="block mb-2 text-sm font-medium text-gray-300">
                            Stack do Hero (bb): <span className="font-bold text-white">{ heroRawStack }</span>
                            <SotaTooltip title="Raw Stack" content="Seu stack total antes da mão começar." theme="zinc" />
                        </label>
                        <input
                            id="heroRawStack"
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={ heroRawStack }
                            onChange={ ( e ) => setHeroRawStack( Number( e.target.value ) ) }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="heroInvested" className="block mb-2 text-sm font-medium text-gray-300">
                            Fichas Investidas: <span className="font-bold text-white">{ heroInvested }</span>
                            <SotaTooltip title="Hero Invested" content="Quanto do seu stack já está no pote (Sunk Cost)." theme="entropy" />
                        </label>
                        <input
                            id="heroInvested"
                            type="range"
                            min="0"
                            max={ heroRawStack }
                            step="1"
                            value={ heroInvested }
                            onChange={ ( e ) => setHeroInvested( Number( e.target.value ) ) }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="currentPot" className="block mb-2 text-sm font-medium text-gray-300">
                            Tamanho do Pote: <span className="font-bold text-white">{ currentPot }</span>
                            <SotaTooltip title="Pote" content="Total de fichas no pote. Define a isca matemática e a proporção da aposta (Bet to Call = 50% do pote no modelo)." theme="zinc" />
                        </label>
                        <input
                            id="currentPot"
                            type="range"
                            min="5"
                            max="200"
                            step="5"
                            value={ currentPot }
                            onChange={ ( e ) => setCurrentPot( Number( e.target.value ) ) }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Posição Relativa:
                            <SotaTooltip title="Downward Drift" content="OOP sofre drift de 1.25x na tensão de RIO. IP amortece para 0.85x. Controle espacial altera a matemática da sobrevivência." theme="machine" />
                        </label>
                        <div className="flex gap-4">
                            <button onClick={ () => setIsOop( true ) } className={ `px-4 py-2 text-sm font-bold rounded-lg ${isOop ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}` }>
                                OOP (Desvantagem)
                            </button>
                            <button onClick={ () => setIsOop( false ) } className={ `px-4 py-2 text-sm font-bold rounded-lg ${!isOop ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}` }>
                                IP (Vantagem)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultados */ }
            <div className="p-6 text-center bg-gray-800 border border-gray-600 rounded-lg">
                <h3 className="mb-4 text-xl font-semibold text-white">Análise de Tensão RIO</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">Pot Entrapment Ratio</p>
                        <p className="text-3xl font-bold text-orange-400">{ formatPercent( potEntrapment ) }</p>
                    </div>
                    <div className="p-4 bg-gray-900 border border-red-900/50 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                        <p className="text-sm text-red-400/80">Tensão RIO Real ({ isOop ? 'OOP' : 'IP' })</p>
                        <p className={ `text-3xl font-bold ${activeTension >= 1 ? 'text-red-600' : 'text-red-400'}` }>{ formatPercent( activeTension ) }</p>
                    </div>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                    O <strong>Downward Drift</strong> demonstra como a desvantagem de posição acelera a tensão irrecuperável do RIO. Jogar OOP exige uma proteção severa do range para evitar o colapso estrutural da equidade em stacks medianos.
                </p>
            </div>

            {/* Grafico Recharts */ }
            <div className="pt-6 border-t border-gray-700">
                <h3 className="mb-6 text-xl font-semibold text-center text-white">Curva de Aprisionamento (% Stack Investido)</h3>
                <ResponsiveContainer width="100%" height={ 300 } minWidth={ 0 } minHeight={ 0 }>
                    <LineChart
                        data={ chartData }
                        margin={ { top: 5, right: 20, left: -10, bottom: 15 } }
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="investedPct" unit="%" tick={ { fontSize: 12 } } label={ { value: '% do Stack Investido', position: 'insideBottom', offset: -10 } } />
                        <YAxis domain={ [ 0, 100 ] } tick={ { fontSize: 12 } } />
                        <Tooltip
                            contentStyle={ { backgroundColor: '#222', border: '1px solid #444' } }
                            labelStyle={ { color: '#eee', fontWeight: 'bold' } }
                            formatter={ ( ( value: unknown, name: unknown ) => [ ( value as number ).toFixed( 1 ) + '%', name ] ) as never }
                            labelFormatter={ ( label ) => `${label}% Investido` }
                        />
                        <Legend wrapperStyle={ { fontSize: '14px' } } />
                        { crossoverPoint !== null && (
                            <ReferenceLine x={ crossoverPoint } stroke="var(--accent-danger)" strokeDasharray="4 4" yAxisId="left">
                                <Label value={ `Colapso OOP (${crossoverPoint}%)` } position="insideTopLeft" fill="var(--accent-danger)" fontSize={ 12 } />
                            </ReferenceLine>
                        ) }
                        <ReferenceLine y={ 100 } stroke="#ff0000" strokeWidth={ 1 } strokeDasharray="3 3" yAxisId="left" />
                        <Line yAxisId="left" type="monotone" name="Tensão IP (Drift 0.85x)" dataKey="ipTension" stroke="#10b981" strokeWidth={ 2 } dot={ false } />
                        <Line yAxisId="left" type="monotone" name="Tensão OOP (Drift 1.25x)" dataKey="oopTension" stroke="#ef4444" strokeWidth={ 2 } dot={ false } activeDot={ { r: 6 } } />
                        <Line yAxisId="left" type="monotone" name="ChipEV (Matemático)" dataKey="chipEv" stroke="#0ea5e9" strokeWidth={ 1 } strokeDasharray="5 5" dot={ false } />
                        <Line yAxisId="left" type="monotone" name="EV Utilidade (Prospect Theory)" dataKey="utilityEv" stroke="#f59e0b" strokeWidth={ 2 } dot={ false } />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
