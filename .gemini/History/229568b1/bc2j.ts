import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main () {
    console.log( '🌱 Iniciando o Povoamento (Seed) do Laboratório ICM V2 SOTA...' );

    // Cenário 1: Baseline GTO (Vácuo)
    await prisma.icmScenario.upsert( {
        where: { slug: 'baseline-gto' },
        update: {},
        create: {
            slug: 'baseline-gto',
            name: 'Baseline GTO (ChipEV)',
            category: 'baseline',
            narrativeTitle: 'Equilíbrio Puro no Vácuo',
            narrativeSubtitle: 'A fundação algorítmica sem distorções de ICM',
            theory: '<p>Este é o cenário de referência (ChipEV). Não há assimetria de prêmios, portanto, 1 ficha ganha tem o exato mesmo valor que 1 ficha perdida. Serve como o "Piso de Controle" para observarmos as refrações nos cenários seguintes.</p>',
            exploit: JSON.stringify( [
                "Utilize a agressão para maximizar a realização de equidade.",
                "Não super-folde. O EV_fold é o limite natural."
            ] ),
            verdict: 'CHIP EV PURO',
            stacks: JSON.stringify( [ 50, 50 ] ),
            prizes: JSON.stringify( [] ), // Vácuo
            ipPos: 'BTN',
            oopPos: 'BB',
            ipRp: 0,
            oopRp: 0,
            ipMorph: 'Linear',
            oopMorph: 'Condensado',
            sprData: JSON.stringify( [
                { name: 'PRE', potSize: 2.5, rpValue: 0 },
                { name: 'FLOP', potSize: 7.5, rpValue: 0 },
                { name: 'TURN', potSize: 22.5, rpValue: 0 },
                { name: 'RIVER', potSize: 40.0, rpValue: 0 }
            ] ),
            defaultStreetFreqs: JSON.stringify( {
                flop: { ip_check: 40, ip_bet: 60, oop_check: 100, oop_bet: 0 },
                turn: { ip_check: 45, ip_bet: 55, oop_check: 100, oop_bet: 0 },
                river: { ip_check: 50, ip_bet: 50, oop_check: 100, oop_bet: 0 }
            } ),
            isPublished: true,
            quizzes: {
                create: [
                    {
                        question: 'Em um cenário puramente ChipEV, qual o fator principal de defesa do BB?',
                        explanation: 'Em ChipEV puro, as pot odds e a realização de equidade são as métricas soberanas, sem a punição das Reverse Implied Odds sob o viés do ICM.',
                        options: JSON.stringify( [
                            { id: 'A', text: 'Pot Odds e MDF', isCorrect: true },
                            { id: 'B', text: 'Sobrevivência da Stack', isCorrect: false },
                            { id: 'C', text: 'Distância do Payjump', isCorrect: false }
                        ] )
                    }
                ]
            }
        }
    } );

    // Cenário 2: Bolha da FT (Paradoxo de ICM)
    await prisma.icmScenario.upsert( {
        where: { slug: 'paradoxo-bolha-ft' },
        update: {},
        create: {
            slug: 'paradoxo-bolha-ft',
            name: 'Paradoxo (HU @ FT)',
            category: 'clinical',
            narrativeTitle: 'A Amortização da Edge',
            narrativeSubtitle: 'Colisão assimétrica na Bolha da Mesa Final',
            theory: '<p>Neste cenário clínico, a pressão do ICM (Risk Premium) força o Chip Leader a atuar com hiper-agressão, enquanto as stacks médias e curtas são empurradas para uma "Zona de Paralisia". As Reverse Implied Odds (RIO) desestruturam as Pot Odds tradicionais.</p>',
            exploit: JSON.stringify( [
                "Ataque a zona de paralisia das stacks médias.",
                "Seja resiliente à variação emocional de ser 3-betado pelas curtas."
            ] ),
            verdict: 'FOLD ESTRUTURAL',
            stacks: JSON.stringify( [ 40, 55, 9.4, 52.4, 22.2, 7, 44.3, 24.3, 13.4 ] ),
            prizes: JSON.stringify( [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ] ),
            ipPos: 'BTN',
            oopPos: 'BB',
            ipRp: 8.5,
            oopRp: 14.2,
            ipMorph: 'Polar Máximo',
            oopMorph: 'Zona de Paralisia',
            sprData: JSON.stringify( [
                { name: 'PRE', potSize: 2.5, rpValue: 14.2 },
                { name: 'FLOP', potSize: 7.5, rpValue: 11.5 },
                { name: 'TURN', potSize: 22.5, rpValue: 8.0 },
                { name: 'RIVER', potSize: 40.0, rpValue: 3.5 }
            ] ),
            defaultStreetFreqs: JSON.stringify( {
                flop: { ip_check: 20, ip_bet: 80, oop_check: 100, oop_bet: 0 },
                turn: { ip_check: 30, ip_bet: 70, oop_check: 100, oop_bet: 0 },
                river: { ip_check: 40, ip_bet: 60, oop_check: 100, oop_bet: 0 }
            } ),
            isPublished: true,
            quizzes: {
                create: [
                    {
                        question: 'Por que o EV de fold pode ser positivo (ou "desejável") na bolha para o stack médio?',
                        explanation: 'A sobrevivência passiva aumenta a probabilidade do salto na tabela de premiação devido à colisão marginal entre as outras stacks.',
                        options: JSON.stringify( [
                            { id: 'A', text: 'Para focar em ganhar potes gigantes depois', isCorrect: false },
                            { id: 'B', text: 'Porque a sobrevivência assegura a Perspectiva e o Payjump passivo', isCorrect: true },
                            { id: 'C', text: 'O EV de fold nunca é positivo', isCorrect: false }
                        ] )
                    }
                ]
            }
        }
    } );

    console.log( '✅ Povoamento SOTA V2 concluído com sucesso!' );
}

main()
    .catch( ( e ) => {
        console.error( e );
        process.exit( 1 );
    } )
    .finally( async () => {
        await prisma.$disconnect();
    } );
