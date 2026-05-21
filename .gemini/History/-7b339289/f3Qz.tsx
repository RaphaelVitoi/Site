"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import
    {
        calculateICM,
        calculateBubbleFactor,
        calculateRiskPremium,
        calculateRequiredEquity,
        calculateCallEV,
    } from "@/lib/icm";
import
    {
        LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
    } from 'recharts';
import { FaTrash, FaPlus, FaCalculator, FaInfoCircle } from 'react-icons/fa';

// SOTA: Debounce hook to prevent O(N!) calculations on every keystroke
function useDebounce<T> ( value: T, delay: number ): T
{
    const [ debouncedValue, setDebouncedValue ] = useState<T>( value );
    useEffect( () =>
    {
        const handler = setTimeout( () =>
        {
            setDebouncedValue( value );
        }, delay );
        return () =>
        {
            clearTimeout( handler );
        };
    }, [ value, delay ] );
    return debouncedValue;
}

const initialPlayers = [
    { id: 1, name: 'Hero', stack: 25000 },
    { id: 2, name: 'Villain', stack: 50000 },
    { id: 3, name: 'Player 3', stack: 15000 },
    { id: 4, name: 'Player 4', stack: 10000 },
];

const initialPrizes = [ 1000, 600, 400 ];

export function IcmUniversalLab ()
{
    // === STATE MANAGEMENT ===
    const [ players, setPlayers ] = useState( initialPlayers );
    const [ prizes, setPrizes ] = useState( initialPrizes );
    const [ heroId, setHeroId ] = useState( 1 );
    const [ villainId, setVillainId ] = useState( 2 );
    const [ potSize, setPotSize ] = useState( 5000 );
    const [ betSize, setBetSize ] = useState( 20000 ); // Hero's remaining stack
    const [ handEquity, setHandEquity ] = useState( 0.45 );

    // === DEBOUNCING FOR HEAVY CALCULATIONS ===
    const debouncedPlayers = useDebounce( players, 400 );
    const debouncedPrizes = useDebounce( prizes, 400 );

    // === CORE CALCULATION ENGINE (MEMOIZED) ===
    const results = useMemo( () =>
    {
        try
        {
            const stacks = debouncedPlayers.map( p => p.stack );
            const heroIdx = debouncedPlayers.findIndex( p => p.id === heroId );
            const villainIdx = debouncedPlayers.findIndex( p => p.id === villainId );

            if ( heroIdx === -1 || villainIdx === -1 || stacks.some( s => s < 0 ) || debouncedPrizes.some( p => p < 0 ) )
            {
                throw new Error( "Invalid input data" );
            }

            // 1. Initial State Equity
            const initialResult = calculateICM( stacks, debouncedPrizes );
            const initialEquityEV = initialResult.find( r => r.id === `Jogador ${ heroIdx + 1 }` )?.equity ?? 0;

            // 2. Win State Equity
            const winStacks = stacks.map( ( s, i ) =>
            {
                if ( i === heroIdx ) return s + betSize; // Hero wins villain's bet
                if ( i === villainIdx ) return s - betSize; // Villain loses bet
                return s;
            } );
            const winResult = calculateICM( winStacks.map( s => Math.max( 0, s ) ), debouncedPrizes );
            const winEquityEV = winResult.find( r => r.id === `Jogador ${ heroIdx + 1 }` )?.equity ?? 0;

            // 3. Lose State Equity
            const loseStacks = stacks.map( ( s, i ) =>
            {
                if ( i === heroIdx ) return s - betSize; // Hero loses bet
                if ( i === villainIdx ) return s + betSize; // Villain wins hero's bet
                return s;
            } );
            const loseResult = calculateICM( loseStacks.map( s => Math.max( 0, s ) ), debouncedPrizes );
            const loseEquityEV = loseResult.find( r => r.id === `Jogador ${ heroIdx + 1 }` )?.equity ?? 0;

            // 4. Calculate BF and RP
            const bubbleFactor = calculateBubbleFactor( initialEquityEV, winEquityEV, loseEquityEV );
            const riskPremium = calculateRiskPremium( bubbleFactor );

            // 5. Calculate Final Decision Metrics
            const requiredEquity = calculateRequiredEquity( potSize, betSize, bubbleFactor );
            const chipEV = ( handEquity * ( potSize + betSize ) ) - ( ( 1 - handEquity ) * betSize );
            const icmEV = calculateCallEV( potSize, betSize, bubbleFactor, handEquity );

            return { bubbleFactor, riskPremium, requiredEquity, chipEV, icmEV, error: null };

        } catch ( e )
        {
            return { error: e instanceof Error ? e.message : "Calculation Error" };
        }
    }, [ debouncedPlayers, debouncedPrizes, heroId, villainId, potSize, betSize, handEquity ] );

    // === CHART DATA GENERATION ===
    const chartData = useMemo( () =>
    {
        if ( results.error ) return [];
        const data = [];
        for ( let bf = 1.0; bf <= 2.5; bf += 0.05 )
        {
            const rp = calculateRiskPremium( bf );
            const icmEV = calculateCallEV( potSize, betSize, bf, handEquity );
            const chipEV = ( handEquity * ( potSize + betSize ) ) - ( ( 1 - handEquity ) * betSize );
            data.push( {
                rp: Number( ( rp * 100 ).toFixed( 1 ) ),
                bfValue: bf.toFixed( 2 ),
                icmEV: Number( icmEV.toFixed( 2 ) ),
                chipEV: Number( chipEV.toFixed( 2 ) )
            } );
        }
        return data;
    }, [ potSize, betSize, handEquity, results.error ] );

    // === HANDLERS ===
    const handlePlayerChange = ( id: number, field: 'name' | 'stack', value: string | number ) =>
    {
        setPlayers( prev => prev.map( p => p.id === id ? { ...p, [ field ]: field === 'stack' ? Number( value ) : value } : p ) );
    };
    const addPlayer = () => setPlayers( prev => [ ...prev, { id: Date.now(), name: `Player ${ prev.length + 1 }`, stack: 10000 } ] );
    const removePlayer = ( id: number ) => setPlayers( prev => prev.filter( p => p.id !== id ) );

    const handlePrizeChange = ( index: number, value: string ) =>
    {
        setPrizes( prev => prev.map( ( p, i ) => i === index ? Number( value ) : p ) );
    };
    const addPrize = () => setPrizes( prev => [ ...prev, 0 ] );
    const removePrize = ( index: number ) => setPrizes( prev => prev.filter( ( _, i ) => i !== index ) );

    // === RENDER LOGIC ===
    const formatPercent = ( value: number ) => `${ ( value * 100 ).toFixed( 2 ) }%`;

    const CustomTooltip = ( { active, payload, label }: any ) =>
    {
        if ( active && payload && payload.length )
        {
            const dataPoint = chartData.find( d => d.rp === label );
            return (
                <div className="p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                    <p className="mb-2 font-bold text-white">Risk Premium (RP): { label }%</p>
                    { dataPoint && <p className="text-sm text-orange-400">Bubble Factor (BF): { dataPoint.bfValue }</p> }
                    <p className="text-sm text-cyan-400">ChipEV: { payload[ 1 ]?.value } fichas</p>
                    <p className="text-sm font-semibold text-red-400">ICM EV: { payload[ 0 ]?.value } fichas</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full max-w-7xl p-8 mx-auto space-y-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            {/* ... UI for Inputs (Prizes, Stacks, etc.) ... */ }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Prizes */ }
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Prêmios</h3>
                    { prizes.map( ( prize, i ) => (
                        <div key={ i } className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400 w-8">{ i + 1 }º:</span>
                            <input type="number" value={ prize } onChange={ e => handlePrizeChange( i, e.target.value ) } className="w-full p-2 bg-gray-800 border border-gray-700 rounded" />
                            <button onClick={ () => removePrize( i ) } className="text-red-500 hover:text-red-400"><FaTrash /></button>
                        </div>
                    ) ) }
                    <button onClick={ addPrize } className="w-full mt-2 p-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded flex items-center justify-center gap-2"><FaPlus /> Adicionar Prêmio</button>
                </div>

                {/* Players */ }
                <div className="space-y-2 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white">Jogadores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        { players.map( player => (
                            <div key={ player.id } className="flex items-center gap-2">
                                <input type="text" value={ player.name } onChange={ e => handlePlayerChange( player.id, 'name', e.target.value ) } className="w-1/2 p-2 bg-gray-800 border border-gray-700 rounded" />
                                <input type="number" value={ player.stack } onChange={ e => handlePlayerChange( player.id, 'stack', e.target.value ) } className="w-1/2 p-2 bg-gray-800 border border-gray-700 rounded" />
                                <button onClick={ () => removePlayer( player.id ) } className="text-red-500 hover:text-red-400"><FaTrash /></button>
                            </div>
                        ) ) }
                    </div>
                    <button onClick={ addPlayer } className="w-full mt-2 p-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded flex items-center justify-center gap-2"><FaPlus /> Adicionar Jogador</button>
                </div>
            </div>

            {/* ... UI for Action Variables ... */ }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Herói</label>
                    <select value={ heroId } onChange={ e => setHeroId( Number( e.target.value ) ) } className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                        { players.map( p => <option key={ p.id } value={ p.id }>{ p.name }</option> ) }
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Vilão</label>
                    <select value={ villainId } onChange={ e => setVillainId( Number( e.target.value ) ) } className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                        { players.map( p => <option key={ p.id } value={ p.id }>{ p.name }</option> ) }
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Equidade da Mão: <span className="font-bold text-white">{ formatPercent( handEquity ) }</span></label>
                    <input type="range" min="0" max="1" step="0.01" value={ handEquity } onChange={ e => setHandEquity( Number( e.target.value ) ) } className="w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Pote</label>
                    <input type="number" value={ potSize } onChange={ e => setPotSize( Number( e.target.value ) ) } className="w-full p-2 bg-gray-800 border border-gray-700 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Aposta (All-in)</label>
                    <input type="number" value={ betSize } onChange={ e => setBetSize( Number( e.target.value ) ) } className="w-full p-2 bg-gray-800 border border-gray-700 rounded" />
                </div>
            </div>

            {/* ... UI for Results ... */ }
            { results.error ? (
                <div className="p-6 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-red-400 font-bold">Erro no Cálculo: { results.error }</p>
                    <p className="text-sm text-gray-400 mt-2">Verifique se os stacks e prêmios são válidos e se há jogadores suficientes para os prêmios definidos.</p>
                </div>
            ) : (
                <>
                    <div className="p-6 text-center bg-gray-800 border border-gray-600 rounded-lg">
                        <h3 className="mb-4 text-xl font-semibold text-white">Veredito Matemático</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Bubble Factor</p>
                                <p className="text-2xl font-bold text-orange-400">{ results.bubbleFactor?.toFixed( 2 ) }</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Risk Premium</p>
                                <p className="text-2xl font-bold text-orange-400">{ formatPercent( results.riskPremium ?? 0 ) }</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">ChipEV (Ilusão)</p>
                                <p className={ `text-2xl font-bold ${ results.chipEV >= 0 ? 'text-green-400' : 'text-red-500' }` }>{ results.chipEV?.toFixed( 2 ) }</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">ICM EV (Realidade)</p>
                                <p className={ `text-2xl font-bold ${ results.icmEV >= 0 ? 'text-green-400' : 'text-red-500' }` }>{ results.icmEV?.toFixed( 2 ) }</p>
                            </div>
                        </div>
                    </div>

                    {/* ... UI for Graph ... */ }
                    <div className="pt-6 border-t border-gray-700">
                        <h3 className="mb-6 text-xl font-semibold text-center text-white">Curva de Queda da Equidade (Downward Drift)</h3>
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ chartData } margin={ { top: 5, right: 20, bottom: 5, left: 0 } }>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={ false } />
                                    <XAxis dataKey="rp" stroke="#9ca3af" tick={ { fill: '#9ca3af' } } name="Risk Premium (%)" unit="%" />
                                    <YAxis stroke="#9ca3af" tick={ { fill: '#9ca3af' } } />
                                    <Tooltip content={ <CustomTooltip /> } />
                                    <Legend wrapperStyle={ { paddingTop: '20px' } } />
                                    <ReferenceLine y={ 0 } stroke="#4b5563" strokeWidth={ 2 } />
                                    <ReferenceLine x={ Number( ( results.riskPremium * 100 ).toFixed( 1 ) ) } stroke="#f97316" strokeDasharray="3 3" label={ { position: 'top', value: 'Seu RP Atual', fill: '#f97316', fontSize: 12 } } />
                                    <Line type="monotone" dataKey="icmEV" name="EV com ICM (Real)" stroke="#ef4444" strokeWidth={ 3 } dot={ false } activeDot={ { r: 6 } } />
                                    <Line type="monotone" dataKey="chipEV" name="ChipEV (Ilusão)" stroke="#06b6d4" strokeWidth={ 2 } strokeDasharray="5 5" dot={ false } />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) }
        </div>
    );
}
