import { auth } from '@/auth';
import { encaminharAoNexus } from '@/lib/server/nexus-proxy';

/**
 * IDENTITY: SOTA PMev Range Heatmap Proxy API
 * PATH: src/app/api/sota/pmev-heatmap/route.ts
 * ROLE: Encaminha a matriz comparativa de range ao backend, só para visitantes com sessão.
 */

export const runtime = 'nodejs';

export async function POST(req: Request) {
	return encaminharAoNexus(req, '/api/v1/pmev/heatmap', { obterSessao: auth, rotulo: 'PMev Heatmap' });
}
