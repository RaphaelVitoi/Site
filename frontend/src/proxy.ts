import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
	// SOTA: Extrai o JWT nativamente na Edge Network (Sem latência de banco)
	const token = await getToken({ req, secret: process.env['NEXTAUTH_SECRET'] ?? '' });
	const { pathname } = req.nextUrl;

	// Mapeamento Vetorial de Rotas Protegidas (Isolamento de Domínio)
	const isProtectedRoute =
		pathname.startsWith('/simulator') ||
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/api/vitoi');

	if (isProtectedRoute && !token) {
		const url = req.nextUrl.clone();
		url.pathname = '/login'; // Endpoint da sua página de login
		url.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/simulator/:path*', '/dashboard/:path*', '/api/vitoi/:path*'],
};
