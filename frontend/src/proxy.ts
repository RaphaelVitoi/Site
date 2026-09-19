import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { resolveAuthSecret } from '@/lib/server/auth-secret';
import { isOperatorEmail } from '@/lib/server/operator';

/**
 * Até 2026-09-17 este proxy também chamava `updateSession` do Supabase, que faz `getUser()` de rede
 * em toda requisição protegida. A autenticação do app é NextAuth e nenhuma parte consome sessão
 * Supabase: era latência sem consumidor (FE-16).
 */
export async function proxy(req: NextRequest) {
	// SOTA: Extrai o JWT nativamente na Edge Network (Sem latência de banco)
	const token = await getToken({ req, secret: resolveAuthSecret() });
	const { pathname } = req.nextUrl;

	const isOperatorRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/vitoi');

	if (isOperatorRoute && !token) {
		// API responde com status, não com redirect: um `fetch` não segue para a página de login.
		if (pathname.startsWith('/api/')) {
			return NextResponse.json({ error: 'Sessão exigida.' }, { status: 401 });
		}
		const url = req.nextUrl.clone();
		url.pathname = '/login';
		url.search = '';
		url.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(url);
	}

	// Sessão prova quem a pessoa é, não o que ela pode ver. A área do operador exige a identidade
	// declarada em NEXUS_OPERATOR_EMAILS, e lista vazia não libera ninguém (FE-04).
	if (isOperatorRoute && !isOperatorEmail(token?.email)) {
		if (pathname.startsWith('/api/')) {
			return NextResponse.json({ error: 'Área restrita ao operador.' }, { status: 403 });
		}
		const url = req.nextUrl.clone();
		url.pathname = '/login';
		url.search = '';
		url.searchParams.set('motivo', 'restrito');
		return NextResponse.redirect(url);
	}

	const response = NextResponse.next();
	if (pathname === '/dashboard/files' || pathname === '/api/vitoi/files/view') {
		// O visualizador nativo do Chromium usa uma extensao interna chrome-extension://.
		// COEP require-corp bloqueia esse frame; CSP, SAMEORIGIN e autenticacao permanecem ativos.
		response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
	}
	return response;
}

export const config = {
	matcher: ['/dashboard/:path*', '/api/vitoi/:path*'],
};
