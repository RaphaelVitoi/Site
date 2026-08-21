/** @format */

import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';
import { resolveAuthSecret } from '@/lib/server/auth-secret';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Discord, Google],
	secret: resolveAuthSecret(),
	callbacks: {
		session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
});
