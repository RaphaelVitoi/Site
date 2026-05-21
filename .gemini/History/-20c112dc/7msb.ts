'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SOTA v4.1: Seed Visceral Nativo (Fricção Zero).
// Injeta a Matemática Quântica (Cᵢ e Amortização da Edge) diretamente em memória
// caso o banco de dados não possua registros, garantindo o funcionamento imediato do frontend.
const VISCERAL_SOTA_SEED = [
    {
        id: "vitoi_q1",
        title: "A Ilusão das Pot Odds (Cᵢ vs RIO)",
        context: "Bolha da FT. O Chip Leader abre do BTN. O Pote tem 4.5bb. Você está no BB com 15bb e segura uma mão marginal. As pot odds gritam 3.5:1 (precisa de ~22% de equity bruta).",
        trap: "Pagar porque 'o preço está barato', ignorando o Passivo Estrutural (RIO) de jogar fora de posição contra o CL.",
        choices: [
            {
                id: "c1_fold",
                label: "Foldar e absorver o Sunk Cost",
                isCorrect: true,
                feedback: "Decisão SOTA. O Piso Dinâmico (-1bb) dói, mas a Perspectiva supera a ilusão matemática. Você preserva Valuation e evita a insolvência pós-flop.",
                metricImpact: { expectativa: "+0.15bb", evFold: "-1.00bb", perspectiva: "+1.25", ci: "1.30" }
            },
            {
                id: "c1_call",
                label: "Pagar as Pot Odds de 3.5:1",
                isCorrect: false,
                feedback: "Insolvência Sistêmica. O Cᵢ abaixo de 1 (0.82x) denuncia a armadilha. Sua equity bruta será devorada pela realização (R) negativa e pelas Reverse Implied Odds.",
                metricImpact: { expectativa: "-0.85bb", evFold: "-1.00bb", perspectiva: "-1.45", ci: "0.82" }
            }
        ]
    },
    {
        id: "vitoi_q2",
        title: "O Colapso da Árvore (Amortização da Edge)",
        context: "Reta final (3 left). Você no SB (12bb) contra um amador no BB (15bb). Sua vantagem técnica (Edge) no jogo pós-flop é massiva.",
        trap: "Dar Limp/Call pré-flop com o objetivo de 'explorar a edge técnica' pós-flop.",
        choices: [
            {
                id: "c2_limp",
                label: "Limp para outplay pós-flop",
                isCorrect: false,
                feedback: "Erro de Amortização. Com 12bb, a árvore de decisão sofre poda (h→0). A variância protege o amador, colapsando sua Edge Relativa em direção à Invariância de Nash.",
                metricImpact: { expectativa: "-0.30bb", evFold: "-0.50bb", perspectiva: "-0.90", ci: "0.95" }
            },
            {
                id: "c2_shove",
                label: "Push/Fold Matemático (Shove Direto)",
                isCorrect: true,
                feedback: "Poda SOTA. Ao shovar, você oblitera a Oportunidade de Erro (Oe) pós-flop e impõe a força bruta da Fold Equity, materializando sua Edge na única métrica viável.",
                metricImpact: { expectativa: "+0.60bb", evFold: "-0.50bb", perspectiva: "+1.15", ci: "1.45" }
            }
        ]
    }
];

export async function fetchVisceralScenarios () {
    try
    {
        const quizzes = await prisma.quizQuestion.findMany( {
            where: { type: 'visceral' },
            orderBy: { createdAt: 'asc' }
        } );

        if ( !quizzes || quizzes.length === 0 ) return VISCERAL_SOTA_SEED;

        // SOTA: Reidratação de quizzes legados para garantir a presença do Cᵢ e blindar a UI
        return quizzes.map( ( q ) => {
            const data = JSON.parse( q.payload );
            if ( data.choices )
            {
                data.choices = data.choices.map( ( c: Record<string, unknown> ) => {
                    if ( !c.metricImpact.ci )
                    {
                        c.metricImpact.ci = c.isCorrect ? "1.25" : "0.82";
                    }
                    return c;
                } );
            }
            return data;
        } );

    } catch ( error )
    {
        console.error( '[Prisma] Falha ao recuperar módulos viscerais:', error );
        return VISCERAL_SOTA_SEED;
    }
}

export async function fetchEngineQuizzes ( scenarioId?: string ) {
    try
    {
        const quizzes = await prisma.quizQuestion.findMany( {
            where: { type: 'engine', ...( scenarioId && { scenarioId } ) },
            orderBy: { createdAt: 'asc' }
        } );
        return quizzes.map( ( q ) => JSON.parse( q.payload ) );
    } catch ( error )
    {
        console.error( '[Prisma] Falha ao recuperar quizzes:', error );
        return [];
    }
}
