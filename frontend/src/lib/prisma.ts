import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

// SOTA: Previne a exaustão de conexões no modo de desenvolvimento (Fast Refresh do Next.js)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
	const rawUrl = process.env['DATABASE_URL'];
	if (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== '') {
		return rawUrl;
	}
	const dbPath = path.resolve(process.cwd(), 'prisma/dev.db').replaceAll('\\', '/');
	return `file:${dbPath}`;
}

function getPrismaClient(): PrismaClient {
	if (globalForPrisma.prisma) return globalForPrisma.prisma;

	const url = getDatabaseUrl();
	const adapter = new PrismaLibSql({ url });

	const client = new PrismaClient({
		adapter,
		log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
	});

	if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = client;
	return client;
}

const prisma = getPrismaClient();

export default prisma;
