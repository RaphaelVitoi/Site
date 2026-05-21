import DashboardSOTA from '@/components/simulator/DashboardSOTA';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export const metadata = {
  title: 'Assinatura Cognitiva | Relatórios SOTA',
  description: 'Análise de vulnerabilidades, distorção quântica e histórico de telemetria preditiva.',
};

async function getHistorianReports() {
  try {
    const pythonExe = path.resolve(process.cwd(), '../.venv/Scripts/python.exe');
    const scriptPath = path.resolve(process.cwd(), '../task_executor.py');
    const { stdout } = await execAsync(`"${pythonExe}" "${scriptPath}" historian-reports`);
    return JSON.parse(stdout.trim());
  } catch (error) {
    console.error('[Historian SOTA] Falha na agregação via IPC:', error);
    return null;
  }
}

export default async function RelatoriosPage() {
  const historianData = await getHistorianReports();

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
           <DashboardSOTA initialData={historianData} />
        </GlassPanel>
      </div>
    </div>
  );
}
