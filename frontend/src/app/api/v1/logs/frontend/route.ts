import { auth } from '@/auth';
import { encaminharAoNexus } from '@/lib/server/nexus-proxy';

/**
 * IDENTITY: Gateway autenticado da telemetria de UI
 * PATH: src/app/api/v1/logs/frontend/route.ts
 * ROLE: Recebe os eventos do logger do navegador e os encaminha ao backend com a credencial de serviço.
 *
 * Até 2026-09-17 o navegador chamava o backend Python direto, sem `Authorization`: com
 * `API_SECRET_TOKEN` configurado, toda a telemetria de UI recebia 401 e era descartada. O navegador
 * não pode portar a credencial de serviço, então o caminho passa pelo mesmo gateway das rotas SOTA:
 * mesma origem, sessão exigida, visitante identificado por hash para o rate limit do backend.
 */

export const runtime = 'nodejs';

export async function POST(req: Request) {
	return encaminharAoNexus(req, '/api/logs/frontend', { obterSessao: auth, rotulo: 'Telemetria de UI' });
}
