import { auth } from '@/auth';
import { encaminharAoNexus } from '@/lib/server/nexus-proxy';

/**
 * IDENTITY: SOTA Pluribus Multiway Solver Proxy API
 * PATH: src/app/api/sota/pluribus/route.ts
 * ROLE: Encaminha subjogos multiway ao backend Python sem expor credenciais no browser.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
	return encaminharAoNexus(req, '/api/v1/game-theory/pluribus/solve', {
		obterSessao: auth,
		rotulo: 'Pluribus Multiway',
	});
}
