'use client';

import { useState } from 'react';
import DegradationChart from './DegradationChart';
import ParametricPanel from './ParametricPanel';

// === ONTOLOGIA VITOI SOTA v3.2 ===
// Rota: /laboratorio-icm
// View de Integracao Holistica (Inputs Parametricos + Renderizacao Visual)

export default function LaboratorioICM () {
    // Baseline State
    const [ sEff, setSEff ] = useState<number>( 25 );
    const [ riskAversion, setRiskAversion ] = useState<number>( 1.5 );

    return (
        <div className="min-h-screen bg-black text-gray-200 p-8 font-mono">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="border-b border-gray-800 pb-6">
                    <h1 className="text-3xl font-bold text-cyan-500 tracking-tighter uppercase">
                        [LABORATORIO SOTA] Perspectiva Matematica V2
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Motor de visualizacao da erosao de equidade.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Esquerda: Sensores e Parametros */ }
                    <div className="lg:col-span-1">
                        <ParametricPanel
                            sEff={ sEff } setSEff={ setSEff }
                            riskAversion={ riskAversion } setRiskAversion={ setRiskAversion }
                        />
                    </div>

                    {/* Coluna Direita: Malha de Visualizacao */ }
                    <div className="lg:col-span-2 space-y-6">
                        <DegradationChart sEff={ sEff } riskAversion={ riskAversion } />

                        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                            <h3 className="text-cyan-400 font-bold mb-2 uppercase text-sm">[Sintese Holistica]</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                A interseccao entre o colapso da Edge (S_eff critico) e a pressao do ICM. Quando as variaveis forcadas no painel cruzam o "Cemiterio Estrategico", a heuristica de pot odds se prova insolvente. Toda acao especulativa deve ser expurgada.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
