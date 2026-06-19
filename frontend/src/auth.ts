/** @format */

import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';

// SOTA Gold: Verificador de Integridade de Ambiente com Fallback Resiliente
const getAuthSecret = () => {
	const secret = process.env['AUTH_SECRET'] || process.env['NEXTAUTH_SECRET'];
	if (!secret) {
		console.warn(
			'[AVISO SOTA] AUTH_SECRET não configurado. Utilizando fallback temporário para compilação.',
		);
		return 'sota-default-secret-key-for-development-only-replace-in-prod-32-chars';
	}
	return secret;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	secret: getAuthSecret(),
	providers: [
		Google({
			clientId: process.env['AUTH_GOOGLE_ID'] || '',
			clientSecret: process.env['AUTH_GOOGLE_SECRET'] || '',
		}),
		Discord,
	],
	pages: { signIn: '/login' },
	trustHost: process.env['AUTH_TRUST_HOST'] === 'true',
});
