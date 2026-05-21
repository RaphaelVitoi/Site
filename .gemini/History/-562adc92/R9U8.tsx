import { PrismaClient } from "@prisma/client"
import React from "react"
import Link from "next/link"

// Instância SOTA Blindada (Lazy Load para evitar crash top-level)
const getPrisma = () => {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
};

export const dynamic = "force-dynamic" // Next.js SOTA: Força renderização em tempo real

// Dicionário de Cura SOTA: Mapeia a entropia para o antídoto
const categoryRoutes: Record<string, string> = {
    "Risk Premium": "/leitura-icm",
    "Bolha": "/aula-icm",
    "Fundamentos SOTA": "/conceitos-icm",
    "Pós-Flop": "/artigos/smart-sniper"
}

export default async function AnalyticsPage() {
    // 1. Busca SOTA O(1) (Neste esqueleto, puxamos os últimos 1000 eventos)
    let events: any[] = [];
    try {
        const prisma = getPrisma();
        events = await prisma.telemetryEvent.findMany({
            where: { userId: "anonymous" }, // Evoluir para session.user.id com NextAuth
            orderBy: { createdAt: "desc" },
            take: 1000,
        })
    } catch (error) {
        console.error("[PANOPTICO] Banco de dados vazio ou dessincronizado:", error);
    }

    // 2. Agregação Termodinâmica de Dados
    const totalQuestions = events.length
    const mistakes = events.filter((e) => !e.isCorrect)
    const winrate = totalQuestions > 0 ? ((totalQuestions - mistakes.length) / totalQuestions) * 100 : 0

    const totalEvLoss = mistakes.reduce((acc, curr) => acc + curr.evLoss, 0)

    // Agrupar sangria de EV por Categoria (ex: Bolha, Pós-Flop, Risk Premium)
    const lossByCategory = mistakes.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.evLoss
        return acc
    }, {} as Record<string, number>)

    // Ordenar categorias pelo maior vazamento
    const sortedCategories = Object.entries(lossByCategory).sort((a, b) => b[1] - a[1])

    return (
        <div className="min-h-screen p-8 text-white flex flex-col items-center">

            {/* HEADER SOTA */}
            <header className="w-full max-w-5xl mb-12 text-center">
                <h1 className="text-4xl font-light tracking-tight mb-2">
                    Panóptico de <span className="font-bold text-red-500">EV</span>
                </h1>
                <p className="text-white/60 tracking-widest uppercase text-sm">
                    Mapeamento Cirúrgico de Entropia Cognitiva
                </p>
            </header>

            <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* KPI: WINRATE */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
                    <span className="text-white/50 text-sm uppercase tracking-widest mb-2">Precisão Neural</span>
                    <span className="text-5xl font-light">{winrate.toFixed(1)}%</span>
                    <span className="text-white/30 text-xs mt-2">{totalQuestions} decisões mapeadas</span>
                </div>

                {/* KPI: SANGRAMENTO TOTAL DE EV */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-red-900/10 border border-red-500/20 backdrop-blur-md shadow-2xl transition-all hover:bg-red-900/20">
                    <span className="text-red-400/80 text-sm uppercase tracking-widest mb-2">Sangria Total (EV Loss)</span>
                    <span className="text-5xl font-bold text-red-500">-{totalEvLoss.toFixed(2)}</span>
                    <span className="text-white/30 text-xs mt-2">Fichas / ROI dissipado</span>
                </div>

                {/* KPI: ZONA CRÍTICA (Maior Furo) */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
                    <span className="text-white/50 text-sm uppercase tracking-widest mb-2">Ponto de Ruptura</span>
                    <span className="text-2xl font-light text-center">
                        {sortedCategories.length > 0 ? sortedCategories[0][0] : "Estável"}
                    </span>
                    <span className="text-white/30 text-xs mt-2">Principal foco de estudo exigido</span>
                </div>

                {/* GRÁFICO SOTA (CSS Puro / Fricção Zero) */}
                <div className="col-span-1 md:col-span-3 mt-8 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
                    <h2 className="text-lg font-medium text-white/80 tracking-wide mb-6 uppercase">
                        Vazamento por Domínio Teórico
                    </h2>

                    {sortedCategories.length === 0 ? (
                        <div className="text-center text-white/40 py-10 font-light">
                            Nenhuma entropia detectada ainda. Vá para o Templo de Aprendizado.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedCategories.map(([category, loss]) => {
                                // Cálculo SOTA para largura da barra baseada no maior erro
                                const maxLoss = sortedCategories[0][1]
                                const barWidth = Math.max((loss / maxLoss) * 100, 2) // Mínimo de 2% para ser visível
                                const targetRoute = categoryRoutes[category] || "/biblioteca"

                                return (
                                    < <Link
                                        href={targetRoute}
                                        key={category}
                                        className="w-full block group transition-all duration-300 hover:scale-[1.01]"
                                    >
                                        <div className="flex justify-between items-end mb-2 text-white/70 group-hover:text-white">
                                            <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
                                                {category} <i className="fa-solid fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                                            </span>
                                            <span className="text-red-400 font-mono font-bold">-{loss.toFixed(2)} EV</span>
                                            dwhite/5">
                                            <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                00 ease-out"
                                                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                                                style={{ width: `${barWidth}%` }}
                                                        />
                                            </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

            </main>
        </div>
    )
}