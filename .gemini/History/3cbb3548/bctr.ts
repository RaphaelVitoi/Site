/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

// Instancia o Prisma Client SOTA
const prisma = new PrismaClient();

async function main() {
    console.log( '=== [SISTEMA] INICIANDO INJEÇÃO SOTA (Fase 3) ===' );

    // 1. Injeção do Baseline (Vácuo Matemático do ChipEV)
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
            exploit: JSON.stringify( ["Se o vilão desvia do GTO pagando demais, o exploit é polarizar o range de apostas."] ),
            verdict: 'CHIP EV PURO',
            stacks: JSON.stringify( [40, 40] ),
            prizes: JSON.stringify( [100] ),
            ipPos: 'BTN',
            oopPos: 'BB',
            ipRp: 0,
            oopRp: 0,
            ipMorph: 'Especulativo',
            oopMorph: 'Defesa Base',
            sprData: sprData,
            defaultStreetFreqs: defaultFreqs,
            isPublished: true
        }
    } );

    console.log( `[+] Cenário Base injetado: ${tg7.name}` );

    // 2. Injeção de Quiz Visceral
    const existingQuiz = await prisma.icmQuiz.findFirst( { where: { scenarioId: tg7.id } } );
    if ( !existingQuiz ) {
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
        console.log( `[+] Quiz Visceral injetado para: ${tg7.name}` );
    }

    // 3. Injeção de Lição Didática (Substitui a antiga 'Content')
    const lesson = await prisma.lesson.upsert( {
        where: { slug: 'aula-1-2-referencial' },
        update: {},
        create: {
            slug: 'aula-1-2-referencial',
            title: 'Referencial Aula 1.2',
            markdown_body: '# A Matemática do Viés\nA base empírica da Fricção Zero em ICM.',
            type: 'Article',
            tags: 'icm, referencial'
        }
    } );
    console.log( `[+] Lição SOTA injetada: ${lesson.title}` );

    // 4. Injeção de Conteúdo Órfão (Biblioteca e Perspectiva)
    const contentId = crypto.randomUUID ? crypto.randomUUID() : 'c' + Math.random().toString( 36 ).substring( 2, 15 );
    const contentFalacia = await ( prisma as any ).content.upsert( {
        where: { slug: 'falacia-das-pot-odds-e-perspectiva' },
        update: {},
        create: {
            id: contentId,
            slug: 'falacia-das-pot-odds-e-perspectiva',
            category: 'biblioteca',
            title: 'A Falácia das Pot Odds e a Perspectiva Matemática',
            description: 'O abismo entre o EV do Fold, a armadilha das Reverse Implied Odds e a Amortização da Edge.',
            body: '# A Falácia das Pot Odds e a Matemática da Perspectiva\n\nA falha fundamental dos solvers comerciais ao exibir o EV do fold como 0 é uma simplificação pedagógica que oculta o custo de oportunidade. Matematicamente, o fold é uma transação de capital onde você aceita uma perda garantida para evitar uma perda incerta e potencialmente maior.\n\n## O Piso de Comparação no Pré-Flop\nO EV do fold nunca é 0, exceto em cash games. Em torneios com antes, o seu baseline é o custo de existência na órbita. O EV do fold em chipEV é `-antes`. A mão não precisa ter EV positivo para ser um open lucrativo, basta ser superior ao EV do fold.\n\n## Extensão para o Pós-Flop\nA mesma lógica se aplica em todas as streets pós-flop. Quando há fichas já investidas, o EV do fold é igual a quanto equity você perde ao ceder o pot.\n\n## Reverse Implied Odds (RIO) e Multiway\nAs Reverse Implied Odds são o custo de "acertar e continuar perdendo". As pot odds mascaram a vulnerabilidade estrutural das RIO, sugerindo que o preço é justo para ver a próxima carta, quando na verdade o pot entrapment corrói a sua Perspectiva.\n\n## A Amortização da Edge\nCom 100bb, a árvore de decisão é complexa e a Edge é soberana. Com 10bb, a árvore é podada para Push/Fold, e a vantagem de habilidade é amortizada pela simplicidade binária do jogo. Dar overcalls na bolha devolve ao short stack as ferramentas de erro que ele havia perdido.',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    } ).catch( () => {
        console.warn( '[AVISO] Tabela Content ausente no Prisma Client local ou falha de tipagem estrita.' );
    } );
    if ( contentFalacia ) console.log( `[+] Artigo da Biblioteca SOTA injetado: ${contentFalacia.title}` );

    console.log( '=== [VITORIA] BANCO DE DADOS SOTA POPULADO ===' );
}

main()
    .catch( ( e ) => {
        console.error( '[ENTROPIA CRITICA] Erro durante o Seed:', e );
        // @ts-ignore - Ignorando a ausencia de tipagem do Node.js no frontend
        process.exit( 1 );
    } )
    .finally( async () => {
        await prisma.$disconnect();
    } );
