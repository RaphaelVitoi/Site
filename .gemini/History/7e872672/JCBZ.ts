import type { PrismaClient } from '@prisma/client';

export async function seedScenarios ( prisma: PrismaClient )
{
    console.log( '[SEED] Injetando Cenários de Simulação...' );

    const defaultFreqs = JSON.stringify( {
        flop: { ip_check: 40, ip_bet_small: 30, ip_bet_large: 30, oop_call: 40, oop_fold: 40, oop_raise: 20 },
        turn: { ip_check: 45, ip_bet_small: 35, ip_bet_large: 20, oop_call: 45, oop_fold: 40, oop_raise: 15 },
        river: { ip_check: 50, ip_bet_small: 20, ip_bet_large: 30, oop_call: 50, oop_fold: 40, oop_raise: 10 }
    } );

    const sprData = JSON.stringify( [
        { name: 'PRE', potSize: 2.5, rpValue: 0 },
        { name: 'FLOP', potSize: 7.5, rpValue: 0 },
        { name: 'TURN', potSize: 22.5, rpValue: 0 },
        { name: 'RIVER', potSize: 45, rpValue: 0 }
    ] );

    const tg7 = await prisma.icmScenario.upsert( {
        where: { slug: 'tg-7-baseline' },
        update: {},
        create: {
            slug: 'tg-7-baseline',
            name: 'Toy Game 7 (Baseline)',
            category: 'baseline',
            narrativeTitle: 'Colisão Simétrica SOTA',
            narrativeSubtitle: 'O Vácuo do ChipEV puro.',
            theory: '<p>Este cenário representa o equilíbrio em um ambiente sem pressão monetária (ChipEV). Ambos os jogadores possuem a mesma tolerância ao risco.</p>',
            stacks: JSON.stringify( [ 40, 40 ] ),
            prizes: JSON.stringify( [ 100 ] ),
            ipPos: 'BTN',
            oopPos: 'BB',
            ipRp: 0,
            oopRp: 0,
            sprData: sprData,
            defaultStreetFreqs: defaultFreqs,
            isPublished: true,
            exploit: JSON.stringify( [ "N/A (ChipEV Simétrico)" ] ),
            verdict: "Equilíbrio Puro",
            ipMorph: "Linear Padrão",
            oopMorph: "Linear Padrão"
        }
    } );
    console.log( `  [+] Cenário Base injetado: ${ tg7.name }` );

    const existingQuiz = await prisma.icmQuiz.findFirst( { where: { scenarioId: tg7.id } } );
    if ( !existingQuiz )
    {
        await prisma.icmQuiz.create( {
            data: {
                scenarioId: tg7.id,
                question: 'Em um cenário ChipEV puro, como a assimetria posicional afeta o EV do fold?',
                explanation: 'Sem pressão de ICM, o EV do fold é estritamente o sunk cost (fichas já investidas). A posição não inflaciona a dor monetária.',
                options: JSON.stringify( [
                    { id: '1', text: 'A posição não altera a métrica financeira, apenas a realização de equidade.', isCorrect: true },
                    { id: '2', text: 'OOP sempre tem um EV_fold mais negativo devido ao RIO.', isCorrect: false }
                ] )
            }
        } );
        console.log( `  [+] Quiz Visceral injetado para: ${ tg7.name }` );
    }
}
