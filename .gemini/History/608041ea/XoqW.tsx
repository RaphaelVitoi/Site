import React from 'react';
import { InsolvencyMatrix } from './InsolvencyMatrix';
// SOTA: Importando o Profiler FFI (ajuste o caminho se o componente foi movido)
import { NashMatrixProfiler } from '../../../../../wasm-equity/NashMatrixProfiler';

export default function DashboardSOTA ()
{
    return (
        <div className="min-h-screen bg-black p-8 font-mono">
            <header className="mb-10 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#ff3366] uppercase tracking-tighter">
                    Nexus Orchestrator (SOTA View)
                </h1>
                <p className="text-gray-500 mt-2">Distorção Quântica ICM & Motor Termodinâmico O(1)</p>
            </header>

            <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Lado Esquerdo: Motor Monte Carlo de Risco Constante */ }
                <InsolvencyMatrix />
                {/* Lado Direito: Profiler de Stress da FFI do Nash */ }
                <NashMatrixProfiler />
            </main>
        </div>
    );
}
