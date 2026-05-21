import { SniperAdvisor } from '@/components/analytics/SniperAdvisor';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

export const metadata = {
  title: 'Telemetria AGN | Dashboard SOTA',
  description: 'Orquestrador híbrido, monitoramento de agentes e fila termodinâmica.',
};

export default async function DashboardPage() {
  // SOTA Guard: Em produção, isto será substituído pelo fetch SSR no orquestrador Python/SQLite.
  // Mock provisório para garantir Simetria de Tipagem no tsc e renderizar a UI sem fricção.
  const mockTelemetry = {
    topVazamento: 'Pós-Flop',
    evLoss: 14.5,
    activeTasks: 12,
    dailyBudget: 5000,
    consumedBudget: 1240,
    agentsOnline: 8,
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="Telemetria AGN"
        subtitle="Painel quântico de monitoramento do ecossistema de agentes SOTA e telemetria financeira."
        category="Orquestrador"
        icon="fa-satellite-dish"
      />

      <div className="sota-container -mt-12 relative z-10">
        <SniperAdvisor
          topVazamento={mockTelemetry.topVazamento}
          evLoss={mockTelemetry.evLoss}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassPanel className="p-6 border-accent-indigo/20">
            <div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">Tarefas Ativas</div>
            <div className="text-3xl font-black text-white">{mockTelemetry.activeTasks}</div>
          </GlassPanel>

          <GlassPanel className="p-6 border-accent-emerald/20">
            <div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">Custo Diário (Tokens)</div>
            <div className="text-3xl font-black text-accent-emerald-light">
              {mockTelemetry.consumedBudget} <span className="text-sm text-text-muted font-medium">/ {mockTelemetry.dailyBudget}</span>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 border-accent-indigo/20">
            <div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">Agentes Vivos</div>
            <div className="text-3xl font-black text-white">{mockTelemetry.agentsOnline}</div>
          </GlassPanel>

          <GlassPanel className="p-6 border-rose-500/20">
            <div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">Vazamento Principal</div>
            <div className="text-3xl font-black text-rose-400">{mockTelemetry.topVazamento}</div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
