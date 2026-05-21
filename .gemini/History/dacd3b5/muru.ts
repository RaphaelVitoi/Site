'use server';

import prisma from '@/lib/prisma';

/**
 * SYSTEM: Motor ICM V2 SOTA
 * ACTION: Busca e deserializa os cenários do laboratório diretamente do SQLite
 */
export async function getSotaScenarios () {
    // Cast bypass para garantir tipagem independente do atraso do TS Server
    const rawScenarios = await ( prisma as any ).icmScenario.findMany( {
        where: { isPublished: true },
        orderBy: { createdAt: 'asc' },
        include: { quizzes: true }
    } );

    // Parse O(N) para reidratar as tipagens do frontend
    return rawScenarios.map( ( s: any ) => ( {
        id: s.slug,
        name: s.name,
        category: s.category as 'clinical' | 'baseline' | 'toyGame',
        narrativeTitle: s.narrativeTitle,
        narrativeSubtitle: s.narrativeSubtitle,
        theory: s.theory,
        exploit: JSON.parse( s.exploit ) as string[],
        verdict: s.verdict,
        stacks: JSON.parse( s.stacks ) as number[],
        prizes: JSON.parse( s.prizes ) as number[],
        ipPos: s.ipPos,
        oopPos: s.oopPos,
        ipRp: s.ipRp,
        oopRp: s.oopRp,
        ipMorph: s.ipMorph,
        oopMorph: s.oopMorph,
        sprData: JSON.parse( s.sprData ),
        defaultStreetFreqs: JSON.parse( s.defaultStreetFreqs ),
        quizzes: s.quizzes ? s.quizzes.map( ( q: any ) => ( {
            id: q.id,
            question: q.question,
            explanation: q.explanation,
            options: JSON.parse( q.options )
        } ) ) : [],
    } ) );
}
