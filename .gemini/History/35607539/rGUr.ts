import { NextResponse } from 'next/server';

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();

        // SOTA: O schema.prisma do NashSolver possui modelos como Spot e TournamentScenario.

        return NextResponse.json( { status: 'SUCCESS', message: 'Simulação recebida (Aguardando mapeamento Prisma)', data: body }, { status: 201 } );
    } catch ( error )
    {
        return NextResponse.json( { status: 'ERROR', error: String( error ) }, { status: 500 } );
    }
}
