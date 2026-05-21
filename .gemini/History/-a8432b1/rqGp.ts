import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();

        // SOTA: O schema.prisma exige que uma Simulation esteja atrelada a um Scenario.
        // Como o IcmLab é um toy-game interativo, forjamos um "Cenário Base" via upsert
        // para garantir a integridade referencial (FK) sem duplicar dados desnecessariamente.
        const baseScenario = await prisma.scenario.upsert( {
            where: { name: 'IcmLab_Interactive_Base' },
            update: {},
            create: {
                name: 'IcmLab_Interactive_Base',
                description: 'Cenário base para simulações interativas do Laboratório de ICM V2',
                payouts: [ 50, 30, 20 ], // Array genérico exigido pelo schema
                stacks: [ 100, 100, 100 ], // Array genérico exigido pelo schema
            }
        } );

        // Cria a Simulação e já injeta o Snapshot na mesma transação (Economia Generalizada)
        const simulation = await prisma.simulation.create( {
            data: {
                name: `IcmLab Snapshot - ${new Date().toISOString()}`,
                status: 'COMPLETED',
                scenarioId: baseScenario.id,
                snapshots: {
                    create: {
                        name: 'Interação de Perspectiva Matemática',
                        resultData: body
                    }
                }
            }
        } );

        return NextResponse.json( { status: 'SUCCESS', data: simulation }, { status: 201 } );
    } catch ( error )
    {
        console.error( '[API] Falha ao persistir simulação:', error );
        return NextResponse.json( { status: 'ERROR', error: String( error ) }, { status: 500 } );
    }
}
