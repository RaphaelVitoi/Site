import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { resolveAuthSecret } from '@/lib/server/auth-secret';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(req: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: req.headers,
		},
	});

	// SOTA: Sincroniza sessão do Supabase SSR mantendo cookies e refresh ativo
	if (process.env['NEXT_PUBLIC_SUPABASE_URL'] && process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
		try {
			response = await updateSession(req);
		} catch {
			// Resiliência de borda: continua caso o relay do Supabase esteja indisponível
		}
	}

	// SOTA: Extrai o JWT nativamente na Edge Network (Sem latência de banco)
	const token = await getToken({ req, secret: resolveAuthSecret() });
	const { pathname } = req.nextUrl;

	// Mapeamento Vetorial de Rotas Protegidas (Isolamento de Domínio)
	const isProtectedRoute =
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/api/vitoi');

	if (isProtectedRoute && !token) {
		const url = req.nextUrl.clone();
		url.pathname = '/login';
		url.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: ['/dashboard/:path*', '/api/vitoi/:path*'],
};
