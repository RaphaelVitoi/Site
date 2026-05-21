import { NextResponse } from 'next/server';

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();

        // SOTA: Utilizando a entidade TelemetryEvent nativa do schema.prisma
        // para gravar os snapshots interativos sem ferir as constraints de Foreign Keys
        // que entidades mais densas como Spot e TournamentScenario exigem.
        const telemetryRecord = await prisma.telemetryEvent.create( {
            data: {
                category: 'ICM_Lab_V2_Snapshot',
                componentName: 'IcmLab',
                scenarioContext: `Opponents: ${body.opponents} | Bubble: ${body.bubbleProximity}% | Invested: ${body.invested}%`,
                metadata: JSON.stringify( body.metrics ),
                userId: 'anonymous'
            }
        } );

        return NextResponse.json( { status: 'SUCCESS', message: 'Snapshot gravado com sucesso na Telemetria', data: telemetryRecord }, { status: 201 } );
    } catch ( error )
    {
        console.error( '[API] Falha ao persistir simulação:', error );
        return NextResponse.json( { status: 'ERROR', error: String( error ) }, { status: 500 } );
    }
}
