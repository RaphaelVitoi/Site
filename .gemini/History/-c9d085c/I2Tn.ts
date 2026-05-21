import { PrismaClient } from '@prisma/client';

// This declaration extends the global Node.js namespace.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * This prevents multiple instances of Prisma Client in development.
 * Due to Next.js hot-reloading, a new instance would be created on every reload
 * without this check, which can exhaust the database connection limit.
 */
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // Conditionally log queries in development for easier debugging.
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;