import React, { useState, useMemo } from 'react';
import { calculateICM, PlayerState, IcmResult } from '../../core/icmEngine';

/**
 * COMPONENTE: MasterSimulator SOTA
 * Interface tática com Colorimetria Semântica (Cyberpunk Clean).
 */
export const MasterSimulator: React.FC = () => {
    // 1. Estado SOTA (Mesa e Premiação)
    const [payouts, setPayouts] = useState<number[]>([500, 300, 200]);
    const [players, setPlayers] = useState<PlayerState[]>([
        { id: 'p1', name: 'Hero (Nós)', chips: 50000 },
        { id: 'p2', name: 'Vilão A (Reg)', chips: 30000 },
        { id: 'p3', name: 'Vilão B (Fish)', chips: 20000 },
    ]);

    // 2. Ignição do Motor Lógico (Memoized para evitar re-renders fúteis)
    const icmResults = useMemo(() => {
        return calculateICM(players, payouts);
    }, [players, payouts]);

    const totalPrize = payouts.reduce((a, b) => a + b, 0);

    // 3. Funções de Mutação de Estado (Fricção Zero)
    const handleUpdateChips = (id: string, newChips: number) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, chips: newChips } : p));
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
            {/* CABEÇALHO SOTA */}
            <header className="mb-8 border-b border-cyan-800 pb-4">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">
                    Módulo ICM: <span className="text-white">Master Simulator</span>
                </h1>
                <p className="text-gray-400 mt-2">Visão Holística do Expected Value Financeiro</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* PAINEL ESQUERDO: Configuração da Mesa */}
                <div className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-magenta-400 mb-6 flex items-center">
                        <span className="bg-magenta-500 w-2 h-6 mr-3 block"></span> Dinâmica da Mesa
                    </h2>

                    <div className="space-y-4">
                        {players.map((p, index) => (
                            <div key={p.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-md border border-gray-700 hover:border-cyan-600 transition-colors">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Jogador {index + 1}</label>
                                    <input
                                        type="text"
                                        value={p.name}
                                        className="block w-full bg-transparent text-white font-medium focus:outline-none"
                                        readOnly
                                    />
                                </div>
                                <div className="flex-1 px-4">
                                    <label className="text-xs text-cyan-500 uppercase tracking-wider">Stack (Fichas)</label>
                                    <input
                                        type="number"
                                        value={p.chips}
                                        onChange={(e) => handleUpdateChips(p.id, parseInt(e.target.value) || 0)}
                                        className="block w-full bg-gray-800 text-cyan-300 font-mono text-lg rounded px-3 py-1 focus:ring-1 focus:ring-cyan-500 border border-transparent focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div className="w-1/4 text-right">
                                    <div className="text-xs text-green-500 uppercase tracking-wider">Valor ICM</div>
                                    <div className="text-xl font-bold text-green-400 font-mono">
                                        ${icmResults[p.id]?.ev.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAINEL DIREITO: Telemetria e Payouts */}
                <div className="col-span-1 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl flex flex-col">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-6 flex items-center">
                        <span className="bg-yellow-500 w-2 h-6 mr-3 block"></span> Estrutura de Payout
                    </h2>

                    <div className="flex-1 space-y-3">
                        {payouts.map((prize, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Posição {idx + 1}º</span>
                                <span className="font-mono text-white">${prize.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
