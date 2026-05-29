/** @format */

import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';

// SOTA Gold: Verificador de Integridade de Ambiente
const getAuthSecret = () => {
	const secret = process.env['AUTH_SECRET'];
	if (!secret) {
		throw new Error(
			'[FATAL] AUTH_SECRET não configurado. Abortando (Insolvência de Ambiente).',
		);
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
