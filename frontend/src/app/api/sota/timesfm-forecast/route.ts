import { auth } from '@/auth';
import { encaminharAoNexus } from '@/lib/server/nexus-proxy';

/**
 * IDENTITY: SOTA TimesFM Time-Series Forecasting Proxy API
 * PATH: src/app/api/sota/timesfm-forecast/route.ts
 * ROLE: Encaminha previsões de séries temporais ao backend, só para visitantes com sessão.
 */

export const runtime = 'nodejs';

export async function POST(req: Request) {
	return encaminharAoNexus(req, '/api/v1/timesfm/forecast', { obterSessao: auth, rotulo: 'TimesFM' });
}
