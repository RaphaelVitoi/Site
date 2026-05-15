import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

// SOTA Gold: Verificador de Integridade de Ambiente
const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[SOTA ALERT] AUTH_SECRET ausente. Injetando Mock Secret para Desenvolvimento Local.",
      );
      return "sota-gold-dev-mock-secret-2026-128bit-alpha-v6";
    }
    throw new Error(
      "[FATAL] AUTH_SECRET não configurado. Abortando em modo Produção (Insolvência de Ambiente).",
    );
  }
  return secret;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: getAuthSecret(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    Discord,
  ],
  pages: { signIn: "/login" },
  trustHost: true,
});
