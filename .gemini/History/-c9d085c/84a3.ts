import { PrismaClient } from '@prisma/client';

// SOTA: Previne a exaustão de conexões no modo de desenvolvimento (Fast Refresh do Next.js)
// Garantindo uma única instância global do PrismaClient no servidor.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient( {
    log: process.env.NODE_ENV === 'development' ? [ 'query', 'error', 'warn' ] : [ 'error' ],
  } );

if ( process.env.NODE_ENV !== 'production' ) globalForPrisma.prisma = prisma;
