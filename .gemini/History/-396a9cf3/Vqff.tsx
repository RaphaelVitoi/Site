"use client";

import { useState, useMemo } from "react";
import
    {
        calculateRequiredEquity,
        calculateRiskPremium,
    } from "@/lib/icm";

export function DownwardDriftSimulator ()
{
    const [ pot, setPot ] = useState( 100 );
    const [ bet, setBet ] = useState( 100 );
    const [ bubbleFactor, setBubbleFactor ] = useState( 1.2 );

    const { requiredEquity, riskPremium } = useMemo( () =>
    {
        const equity = calculateRequiredEquity( pot, bet, bubbleFactor );
        const rp = calculateRiskPremium( bubbleFactor );
        return {
            requiredEquity: equity,
            riskPremium: rp,
        };
    }, [ pot, bet, bubbleFactor ] );

    const formatPercent = ( value: number ) =>
    {
        return `${ ( value * 100 ).toFixed( 2 ) }%`;
    };

    return (
        <div className="w-full max-w-2xl p-8 mx-auto space-y-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-cyan-400">
                Simulador de Downward Drift (ICM)
            </h2>

            {/* Controles */ }
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <h3 className="mb-4 text-xl font-semibold text-white">Resultados (GTO)</h3>
                <div className="flex justify-around">
                    <div>
                        <p className="text-sm text-gray-400">Risk Premium (RP)</p>
                        <p className="text-2xl font-bold text-orange-400">{ formatPercent( riskPremium ) }</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Equidade Mínima Exigida</p>
                        <p className="text-2xl font-bold text-red-500">{ formatPercent( requiredEquity ) }</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    A "Equidade Mínima Exigida" representa o "Downward Drift": a queda no range de mãos que você pode jogar lucrativamente à medida que a pressão do ICM (BF) aumenta.
                </p>
            </div>
        </div>
    );
}
