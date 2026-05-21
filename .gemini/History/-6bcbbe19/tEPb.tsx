import type { TelemetryEvent } from "@prisma/client";
import { SniperAdvisor } from "@/components/analytics/SniperAdvisor";
import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Next.js SOTA: Força renderização em tempo real

// Dicionário de Cura SOTA: Mapeia a entropia para o antídoto
const categoryRoutes: Record<string, string> = {
  "Risk Premium": "/aulas/leitura-icm",
  Bolha: "/aulas/icm-masterclass",
  "Fundamentos SOTA": "/aulas/conceitos-icm",
  "Pós-Flop": "/artigos/smart-sniper",
};

export default async function AnalyticsPage() {
  // 1. Busca SOTA O(1) (Neste esqueleto, puxamos os últimos 1000 eventos)
  let events: TelemetryEvent[] = [];
  let dbError = false;
  try {
    events = await prisma.telemetryEvent.findMany({
      where: { userId: "anonymous" }, // Evoluir para session.user.id com NextAuth
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
  } catch (error) {
    dbError = true;
    console.error(
      "[PANOPTICO] Banco de dados vazio ou dessincronizado:",
      error,
    );
  }

  // 2. Agregação Termodinâmica de Dados
  const totalQuestions = events.length;
  const mistakes = events.filter((e) => !e.isCorrect);
  const winrate =
    totalQuestions > 0
      ? ((totalQuestions - mistakes.length) / totalQuestions) * 100
      : 0;

  const totalEvLoss = mistakes.reduce((acc, curr) => acc + curr.evLoss, 0);

  // Agrupar sangria de EV por Categoria (ex: Bolha, Pós-Flop, Risk Premium)
  const lossByCategory = mistakes.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.evLoss;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Ordenar categorias pelo maior vazamento
  const sortedCategories = (
    Object.entries(lossByCategory) as [string, number][]
  ).sort((a, b) => b[1] - a[1]);
  const topVazamento =
    sortedCategories.length > 0 ? sortedCategories[0][0] : null;
  const topLoss = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="Panóptico de EV"
        subtitle="Mapeamento cirúrgico de Entropia Cognitiva. Identifique sangramentos de Edge e isole vazamentos através da lente SOTA."
        category="Telemetria SOTA"
        icon="fa-chart-pie"
      />

      <div className="sota-container mt-8">
        {dbError ? (
          <GlassPanel className="flex flex-col items-center justify-center p-12 bg-accent-danger/5 border-accent-danger/20 text-center">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-accent-danger mb-4" />
            <h2 className="text-accent-danger text-xl font-black mb-2 uppercase tracking-widest font-heading">
              Falha Termodinâmica
            </h2>
            <p className="text-text-muted max-w-lg leading-relaxed">
              O núcleo de telemetria local encontra-se inacessível. O Panóptico
              SOTA não pode processar o Sangramento de EV no momento.
            </p>
          </GlassPanel>
        ) : (
          <>
            <SniperAdvisor topVazamento={topVazamento} evLoss={topLoss} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KPI: WINRATE */}
              <GlassPanel className="flex flex-col items-center justify-center p-8 text-center hover:-translate-y-1 transition-transform">
                <span className="text-accent-indigo text-xs font-black uppercase tracking-[0.2em] mb-4">
                  Precisão Neural
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white mb-2">
                  {winrate.toFixed(1)}
                  <span className="text-3xl text-text-muted">%</span>
                </span>
                <span className="text-text-dim text-xs font-medium uppercase tracking-widest">
                  {totalQuestions} decisões mapeadas
                </span>
              </GlassPanel>

              {/* KPI: SANGRAMENTO TOTAL DE EV */}
              <GlassPanel className="flex flex-col items-center justify-center p-8 text-center bg-accent-danger/5 border-accent-danger/20 hover:bg-accent-danger/10 hover:-translate-y-1 transition-all">
                <span className="text-accent-danger text-xs font-black uppercase tracking-[0.2em] mb-4">
                  Sangria Total (EV Loss)
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-tighter text-accent-danger mb-2">
                  -{totalEvLoss.toFixed(2)}
                </span>
                <span className="text-text-dim text-xs font-medium uppercase tracking-widest">
                  Fichas / ROI dissipado
                </span>
              </GlassPanel>

              {/* KPI: ZONA CRÍTICA (Maior Furo) */}
              <GlassPanel className="flex flex-col items-center justify-center p-8 text-center hover:-translate-y-1 transition-transform">
                <span className="text-accent-amber text-xs font-black uppercase tracking-[0.2em] mb-4">
                  Ponto de Ruptura
                </span>
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-2">
                  {sortedCategories.length > 0
                    ? sortedCategories[0][0]
                    : "Estável"}
                </span>
                <span className="text-text-dim text-xs font-medium uppercase tracking-widest">
                  Principal foco de estudo exigido
                </span>
              </GlassPanel>

              {/* GRÁFICO SOTA */}
              <GlassPanel className="lg:col-span-3 p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                  <i className="fa-solid fa-chart-simple text-accent-indigo text-xl" />
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase font-heading">
                    Vazamento por Domínio Teórico
                  </h2>
                </div>

                {sortedCategories.length === 0 ? (
                  <div className="text-center text-text-muted py-16 flex flex-col items-center">
                    <i className="fa-solid fa-shield-halved text-4xl mb-4 opacity-50" />
                    <p className="font-medium text-lg">
                      Nenhuma entropia detectada.
                    </p>
                    <p className="text-sm">
                      Seu jogo permanece perfeitamente selado. Continue no
                      laboratório.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sortedCategories.map(([category, loss]) => {
                      // Cálculo SOTA para largura da barra baseada no maior erro
                      const maxLoss = sortedCategories[0][1];
                      const barWidth = Math.max((loss / maxLoss) * 100, 2); // Mínimo de 2% para ser visível
                      const targetRoute =
                        categoryRoutes[category] || "/biblioteca";

                      return (
                        <Link
                          href={targetRoute}
                          key={category}
                          className="block group"
                        >
                          <div className="flex justify-between items-end mb-3 text-text-muted group-hover:text-white transition-colors">
                            <span className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                              {category}
                              <i className="fa-solid fa-arrow-right text-[10px] text-accent-danger opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </span>
                            <span className="text-accent-danger font-mono font-black tracking-tighter">
                              -{loss.toFixed(2)} EV
                            </span>
                          </div>
                          <div className="w-full h-3 bg-bg-deep rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div
                              className="h-full bg-linear-to-r from-accent-danger to-rose-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-125 relative overflow-hidden"
                              {...{ style: { width: `${barWidth}%` } }}
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </GlassPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
