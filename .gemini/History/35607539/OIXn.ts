import { NextResponse } from 'next/server';

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();
        const { invested, opponents, bubbleProximity, metrics } = body;

        // SOTA: O schema.prisma do NashSolver possui modelos como Spot e TournamentScenario.
        // Descomente e ajuste a chamada abaixo para corresponder exatamente à nomenclatura do seu schema.prisma.

        /*
        const savedSimulation = await prisma.spot.create({
            data: {
                // Mapeamento de exemplo. Ajuste os campos conforme seu Prisma Schema.
                invested,
                opponents,
                bubbleProximity,
                evFold: metrics.evFold,
                riskPremium: metrics.riskPremium,
                bubbleFactor: metrics.bubbleFactor,
                insolvencyCoefficient: metrics.insolvencyCoefficient,
            }
        });
        */

        return NextResponse.json( { status: 'SUCCESS', message: 'Simulação recebida (Aguardando mapeamento Prisma)', data: body }, { status: 201 } );
    } catch ( error )
    {
        return NextResponse.json( { status: 'ERROR', error: String( error ) }, { status: 500 } );
    }
}
