import DashboardSOTA from '@/components/simulator/DashboardSOTA';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

export const metadata = {
  title: 'Assinatura Cognitiva | Relatórios SOTA',
  description: 'Análise de vulnerabilidades, distorção quântica e histórico de telemetria preditiva.',
};

export default function RelatoriosPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="Relatórios Analíticos"
        subtitle="O Cronista do Ecossistema (@historian): Avaliação de Assinatura Cognitiva, distorções de ICM e telemetria."
        category="Inteligência Analítica"
        icon="fa-chart-pie"
      />

      <div className="sota-container -mt-12 relative z-10">
        <GlassPanel className="p-8 md:p-12 border-accent-indigo/10 shadow-2xl">
           <DashboardSOTA />
        </GlassPanel>
      </div>
    </div>
  );
}
