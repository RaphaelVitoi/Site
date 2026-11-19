/** @format */

import NextAuth, { type NextAuthResult } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';
import { resolveAuthSecret } from '@/lib/server/auth-secret';
import { DEV_OPERATOR_EMAIL } from '@/lib/server/operator';
import { emailVerificadoPeloProvedor } from '@/lib/server/verified-email';

const nextAuth = NextAuth({
  providers: [
    Discord,
    Google,
    ...(process.env.NODE_ENV === 'development'
      ? [
          Credentials({
            id: 'dev-operator',
            name: 'Operador Local (Dev)',
            credentials: {},
            authorize() {
              return {
                id: 'dev-operator-sota',
                name: 'Operador Local',
                email: DEV_OPERATOR_EMAIL,
              };
            },
          }),
        ]
      : []),
  ],
  secret: resolveAuthSecret(),
  callbacks: {
    // E-mail não verificado não abre sessão: o portão do operador confia no e-mail.
    signIn({ account, profile }) {
      if (account?.provider === 'dev-operator') {
        return process.env.NODE_ENV === 'development';
      }
      return emailVerificadoPeloProvedor(account?.provider, profile);
    },
    jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
});

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
