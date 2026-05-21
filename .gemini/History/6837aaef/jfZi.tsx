import fs from 'fs';
import path from 'path';
import PerformanceChart from '@/components/dashboard/PerformanceChart'; // Ajuste o caminho conforme sua estrutura

interface DailyStat {
    day: string;
    count: number;
}

// Revalida os dados a cada 60 segundos (ou conforme sua necessidade)
export const revalidate = 60;

export default async function PerformanceDashboardPage() {
    const statsPath = path.join(process.cwd(), '..', '.claude', 'stats', 'performance_history.json');
    let performanceData: DailyStat[] = [];

    try {
        // Verifica se o arquivo existe antes de tentar ler
        if (fs.existsSync(statsPath)) {
            const fileContent = fs.readFileSync(statsPath, 'utf8');
            performanceData = JSON.parse(fileContent);
        } else {
            console.warn(`[DASHBOARD] Arquivo de histórico de performance não encontrado em: ${statsPath}`);
        }
    } catch (error) {
        console.error("[DASHBOARD] Falha ao ler histórico de performance:", error);
    }

    return (
        <div className="p-8 bg-black text-green-500 font-mono min-h-screen">
            <h1 className="text-2xl mb-6 border-b border-green-900 pb-2">
                █ HISTÓRICO DE AUTOPOIESE █
            </h1>

            <div className="max-w-4xl mx-auto">
                <PerformanceChart data={performanceData} />
            </div>

            {/* Você pode adicionar outros componentes ou informações aqui */}
        </div>
    );
}