"use client";

import React, { useState, useMemo } from "react";
import { calculateICM } from "../../lib/icm";

interface Player {
    id: string;
    name: string;
    stack: number;
}

export default function MasterSimulator() {
    // Estado Inicial Padrão (Um cenário de 4 jogadores para ilustrar)
    const [players, setPlayers] = useState<Player[]>([
        { id: "p1", name: "Alice", stack: 10000 },
        { id: "p2", name: "Bob", stack: 7500 },
        { id: "p3", name: "Charlie", stack: 5000 },
        { id: "p4", name: "Diana", stack: 2500 },
    ]);

    // Premiações Iniciais (Top 3)
    const [payouts, setPayouts] = useState<number[]>([500, 300, 200]);

    // Otimização SOTA: Recalcula o ICM apenas se stacks ou payouts mudarem
    const equities = useMemo(() => {
        const stacks = players.map((p) => p.stack);
        return calculateICM(stacks, payouts);
    }, [players, payouts]);

    // Formatadores de UI
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat("en-US").format(val);

    // Handlers para Jogadores
    const updatePlayerStack = (id: string, newStack: number) => {
        setPlayers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, stack: Math.max(0, newStack) } : p))
        );
    };

    const addPlayer = () => {
        const newId = `p${Date.now()}`;
        setPlayers([...players, { id: newId, name: `Jogador ${players.length + 1}`, stack: 1000 }]);
    };

    const removePlayer = (id: string) => {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
    };

    // Handlers para Payouts
    const updatePayout = (index: number, newPayout: number) => {
        const newPayouts = [...payouts];
        newPayouts[index] = Math.max(0, newPayout);
        setPayouts(newPayouts);
    };

    const addPayout = () => setPayouts([...payouts, 100]);
    const removePayout = (index: number) => {
        const newPayouts = [...payouts];
        newPayouts.splice(index, 1);
        setPayouts(newPayouts);
    };

    const totalPrizePool = payouts.reduce((acc, curr) => acc + curr, 0);
    const totalChips = players.reduce((acc, curr) => acc + curr.stack, 0);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 text-slate-200">

            {/* Header do Simulador */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500">
                    Simulador ICM Universal
                </h2>
                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                    Motor de Risco & Equidade em Tempo Real
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUNA ESQUERDA: Payouts */}
                <div className="col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-indigo-400">#</span> Payouts
                        </h3>
                        <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">
                            Total: {formatCurrency(totalPrizePool)}
                        </span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {payouts.map((payout, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm font-mono text-slate-500 w-6">{index + 1}º</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        value={payout}
                                        onChange={(e) => updatePayout(index, Number(e.target.value))}
                                    />
                                </div>
                                <button
                                    onClick={() => removePayout(index)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addPayout}
                        className="w-full py-2 text-sm font-semibold text-indigo-400 border border-indigo-500/30 border-dashed rounded-lg hover:bg-indigo-500/10 transition-colors"
                    >
                        + Adicionar Premiação
                    </button>
                </div>

                {/* COLUNAS DIREITA: Jogadores e Resultados (CapTable) */}
                <div className="col-span-1 lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-emerald-400">»</span> Cap Table (Stacks & EV)
                        </h3>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                            Fichas em Jogo: {formatNumber(totalChips)}
                        </span>
                    </div>

                    {/* Tabela */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-mono">
                                    <th className="pb-3 pl-2 font-medium">Jogador</th>
                                    <th className="pb-3 font-medium text-right pr-4">Stack (Fichas)</th>
                                    <th className="pb-3 font-medium text-right pr-4">Chip %</th>
                                    <th className="pb-3 font-medium text-right text-emerald-400 pr-2">ICM EV ($)</th>
                                    <th className="pb-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {players.map((player, index) => {
                                    const ev = equities[index] || 0;
                                    const chipPercent = totalChips > 0 ? (player.stack / totalChips) * 100 : 0;

                                    return (
                                        <tr key={player.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="py-3 pl-2">
                                                <input
                                                    type="text"
                                                    value={player.name}
                                                    onChange={(e) => {
                                                        const newName = e.target.value;
                                                        setPlayers(players.map(p => p.id === player.id ? { ...p, name: newName } : p));
                                                    }}
                                                    className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none w-24 sm:w-32 text-sm font-medium text-slate-200 transition-colors"
                                                />
                                            </td>
                                            <td className="py-3 text-right pr-4">
                                                <input
                                                    type="number"
                                                    className="w-24 text-right bg-slate-950 border border-slate-700 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                    value={player.stack}
                                                    onChange={(e) => updatePlayerStack(player.id, Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="py-3 text-right pr-4 text-sm font-mono text-slate-400">
                                                {chipPercent.toFixed(1)}%
                                            </td>
                                            <td className="py-3 text-right pr-2">
                                                <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-sm px-2 py-1 rounded">
                                                    {formatCurrency(ev)}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => removePlayer(player.id)}
                                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                    title="Remover Jogador"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <button
                            onClick={addPlayer}
                            className="py-2 px-4 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                        >
                            + Adicionar Jogador
                        </button>
                    </div>

                </div>
            </div>

            {/* Disclaimer / Info */}
            <div className="text-center p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
                <p className="text-xs text-slate-500 font-mono">
                    O cálculo acima usa a matemática SOTA de Independent Chip Model (ICM). <br />
                    O valor Monetário Esperado (EV) real pode variar se considerado fatores pós-flop (Risk Premium avançado).
                </p>
            </div>

        </div>
    );
}