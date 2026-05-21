import { TelemetryCharts } from '@/components/analytics/TelemetryCharts';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import prisma from '@/lib/prisma';
import type { TelemetryEvent } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage ()
{
    const events = await prisma.telemetryEvent.findMany( {
        orderBy: { createdAt: 'asc' }
    } );

    const totalEvents = events.length;

    const quizEvents = events.filter( ( e: TelemetryEvent ) => e.category === 'quiz' || e.category === 'Fundamentos SOTA' || e.category === 'Bolha' || e.category === 'Risk Premium' || e.category === 'Pós-Flop' );
    const quizAccuracy = quizEvents.length > 0
        ? ( quizEvents.filter( ( e: TelemetryEvent ) => e.isCorrect ).length / quizEvents.length ) * 100
        : 0;

    const simEvents = events.filter( ( e: TelemetryEvent ) => e.category === 'simulator' || e.evLoss > 0 );
    const avgEvLoss = simEvents.length > 0
        ? simEvents.reduce( ( acc: number, e: TelemetryEvent ) => acc + e.evLoss, 0 ) / simEvents.length
        : 0;

    const totalLatencyMs = events.reduce( ( acc: number, e: TelemetryEvent ) => acc + ( e.latency || 0 ), 0 );
    const studyTimeMinutes = ( totalLatencyMs / 60000 ).toFixed( 1 );

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <ContentPageHeader title="Templo Analítico" subtitle="Telemetria Quântica e Desempenho SOTA." category="Dashboard" icon="fa-chart-line" />

            <div className="sota-container mt-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-sota-in">
                    <GlassPanel className="p-6 border-accent-indigo/20 flex flex-col justify-center items-center text-center">
                        <i className="fa-solid fa-microchip text-accent-indigo text-2xl mb-3" />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-1">Eventos Processados</span>
                        <span className="text-3xl font-black font-mono text-white">{ totalEvents }</span>
                    </GlassPanel>
                    <GlassPanel className="p-6 border-accent-emerald/20 flex flex-col justify-center items-center text-center">
                        <i className="fa-solid fa-check-double text-accent-emerald text-2xl mb-3" />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-1">Precisão Analítica</span>
                        <span className="text-3xl font-black font-mono text-accent-emerald">{ quizAccuracy.toFixed( 1 ) }%</span>
                    </GlassPanel>
                    <GlassPanel className="p-6 border-accent-rose/20 flex flex-col justify-center items-center text-center">
                        <i className="fa-solid fa-droplet text-accent-rose text-2xl mb-3" />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-1">EV Loss Médio</span>
                        <span className="text-3xl font-black font-mono text-accent-rose">-{ avgEvLoss.toFixed( 2 ) }bb</span>
                    </GlassPanel>
                    <GlassPanel className="p-6 border-accent-amber/20 flex flex-col justify-center items-center text-center">
                        <i className="fa-solid fa-hourglass-half text-accent-amber text-2xl mb-3" />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-1">Estudo Focado</span>
                        <span className="text-3xl font-black font-mono text-accent-amber">{ studyTimeMinutes }m</span>
                    </GlassPanel>
                </div>
                <TelemetryCharts data={ events } />
            </div>
        </div>
    );
}
