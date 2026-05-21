"use client";

import { useState, useMemo } from "react";
import
{
    calculateRequiredEquity,
    calculateRiskPremium,
    calculateCallEV,
} from "@/lib/icm";

export function DownwardDriftSimulator ()
{
    const [ pot, setPot ] = useState( 100 );
    const [ bet, setBet ] = useState( 100 );
    const [ bubbleFactor, setBubbleFactor ] = useState( 1.2 );
    const [ handEquity, setHandEquity ] = useState( 0.4 ); // Nova variável para a equidade da mão

    const { requiredEquity, riskPremium, callEV, chipEV } = useMemo( () =>
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

    const formatPercent = ( value: number, isEV?: boolean ) =>
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
                {/* Novo Slider para Equidade da Mão */ }
                <div>
                    <label htmlFor="handEquity" className="block mb-2 text-sm font-medium text-gray-300">
                        Equidade da Mão (E): <span className="font-bold text-white">{ formatPercent( handEquity ) }</span>
                    </label>
                    <input
                        id="handEquity"
                        type="range"
                        min="0.05"
                        max="0.95"
                        step="0.01"
                        value={ handEquity }
                        onChange={ ( e ) => setHandEquity( Number( e.target.value ) ) }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div>
                    <label htmlFor="bubbleFactor" className="block mb-2 text-sm font-medium text-gray-300">
                        Bubble Factor (BF): <span className="font-bold text-white">{ bubbleFactor.toFixed( 2 ) }</span>
                    </label>
                    <input
                        id="bubbleFactor"
                        type="range"
                        min="1.00"
                        max="2.00"
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
        </div>
    );
}
