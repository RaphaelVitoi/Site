import { encaminharGetDeOperador } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const parametros: Record<string, string> = {};
	for (const chave of ['q', 'mode', 'limit'] as const) {
		const valor = searchParams.get(chave)?.trim();
		if (valor) parametros[chave] = valor;
	}
	return encaminharGetDeOperador('/api/files/list', parametros);
}
