'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchVisceralScenarios () {
    try
    {
        const quizzes = await prisma.quizQuestion.findMany( {
            where: { type: 'visceral' },
            orderBy: { createdAt: 'asc' }
        } );
        return quizzes.map( ( q: { payload: string } ) => JSON.parse( q.payload ) );
    } catch ( error )
    {
        console.error( '[Prisma] Falha ao recuperar módulos viscerais:', error );
        return [];
    }
}

export async function fetchEngineQuizzes ( scenarioId?: string ) {
    try
    {
        const quizzes = await prisma.quizQuestion.findMany( {
            where: { type: 'engine', ...( scenarioId && { scenarioId } ) },
            orderBy: { createdAt: 'asc' }
        } );
        return quizzes.map( ( q: { payload: string } ) => JSON.parse( q.payload ) );
    } catch ( error )
    {
        console.error( '[Prisma] Falha ao recuperar quizzes:', error );
        return [];
    }
}
