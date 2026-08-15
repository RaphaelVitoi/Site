import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

// SOTA: Previne a exaustão de conexões no modo de desenvolvimento (Fast Refresh do Next.js)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
	if (globalForPrisma.prisma) return globalForPrisma.prisma;

	try {
		const rawUrl = process.env['DATABASE_URL'];
		const url =
			rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== ''
				? rawUrl
				: 'file:./dev.db';

		const libsql = createClient({ url });
		// @ts-expect-error - Prisma 7 adapter interface might have changed
		const adapter = new PrismaLibSql(libsql);

		const client = new PrismaClient({
			adapter,
			log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
		});

		if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = client;
		return client;
	} catch (error) {
		console.warn('[Prisma SOTA] Fallback para PrismaClient padrão (LibSQL adapter bypass):', error);
		const fallbackClient = new PrismaClient({
			log: ['error'],
		});
		if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = fallbackClient;
		return fallbackClient;
	}
}

const prisma = getPrismaClient();

export default prisma;
