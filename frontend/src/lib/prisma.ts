import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

// SOTA: Previne a exaustão de conexões no modo de desenvolvimento (Fast Refresh do Next.js)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const url = process.env['DATABASE_URL'] || 'file:./dev.db';
const libsql = createClient({ url });
// @ts-expect-error - Prisma 7 adapter interface might have changed
const adapter = new PrismaLibSql(libsql);

const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
		log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
	});

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
