import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "sota-quantum-nexus-secret-key-2026",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Discord,
  ],
  pages: { signIn: '/login' },
  trustHost: true
})
