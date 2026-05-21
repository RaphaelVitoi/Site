import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RETENTION_DAYS = 15;

async function main() {
	console.log(
		`[SOTA-CLEANUP] Iniciando expurgo de telemetria com mais de ${RETENTION_DAYS} dias...`,
	);

	const dateThreshold = new Date();
	dateThreshold.setDate(dateThreshold.getDate() - RETENTION_DAYS);

	const result = await prisma.telemetryEvent.deleteMany({
		where: {
			createdAt: {
				lt: dateThreshold,
			},
		},
	});

	console.log(
		`[VITORIA] Expurgo concluído. ${result.count} registros de telemetria antigos foram aniquilados.`,
	);
}

main()
	.catch((e) => {
		console.error('[ENTROPIA CRITICA] Falha no script de limpeza de telemetria:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
