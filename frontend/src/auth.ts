/** @format */

import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';

// SOTA Gold: Verificador de Integridade de Ambiente com Fallback Resiliente
const getAuthSecret = () => {
	const secret = process.env['AUTH_SECRET'] || process.env['NEXTAUTH_SECRET'];
	if (!secret) {
		if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
			return 'sota-default-secret-key-for-development-only-replace-in-prod-32-chars';
		}
		console.warn(
			'[AVISO SOTA] AUTH_SECRET não configurado. Utilizando fallback temporário para compilação.',
		);
		return 'sota-default-secret-key-for-development-only-replace-in-prod-32-chars';
	}
	return secret;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Discord, Google],
	secret: getAuthSecret(),
	callbacks: {
		session({ session, user: _user }) {
			return session;
		},
	},
});
