/**
 * IDENTITY: Prisma Client Singleton
 * PATH: src/lib/prisma.ts
 * ROLE: Instanciar e exportar o cliente do banco de dados (Prisma) de forma resiliente.
 * BINDING: [src/app/page.tsx, src/app/psicologia-hs/page.tsx]
 * TELEOLOGY: Atuar como a única porta de entrada estruturada para o banco de dados, evoluindo futuramente para suportar proxies de conexão (Prisma Accelerate) em borda.
 */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;