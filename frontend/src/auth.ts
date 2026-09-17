/** @format */

import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';
import { resolveAuthSecret } from '@/lib/server/auth-secret';
import { emailVerificadoPeloProvedor } from '@/lib/server/verified-email';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Discord, Google],
	secret: resolveAuthSecret(),
	callbacks: {
		// E-mail não verificado não abre sessão: o portão do operador confia no e-mail.
		signIn({ account, profile }) {
			return emailVerificadoPeloProvedor(account?.provider, profile);
		},
		session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
});
