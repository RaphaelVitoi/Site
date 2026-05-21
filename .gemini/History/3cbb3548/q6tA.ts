import { PrismaClient } from '@prisma/client';
import { seedContent } from './seed-content';
import { seedScenarios } from './seed-scenarios';

const prisma = new PrismaClient();

async function main() {
    console.log( '=== [SISTEMA] INICIANDO INJEÇÃO SOTA (Fase 3) ===' );

    await seedScenarios( prisma );
    await seedContent( prisma );

    console.log( '=== [VITORIA] BANCO DE DADOS SOTA POPULADO ===' );
}

main()
    .catch( ( e ) => {
        console.error( '[ENTROPIA CRITICA] Erro durante o Seed:', e );
        process.exit( 1 );
    } )
    .finally( async () => {
        await prisma.$disconnect();
    } );
