/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VISCERAL_SCENARIOS = [
    {
        id: "visceral_1",
        title: 'Fator R: A Ilusão da Equidade Bruta OOP',
        context: 'Você está no Flop, Fora de Posição (OOP). A matemática nua diz que sua mão tem 45% de chance de vencer no Showdown (Raw Equity). Na fórmula da Perspectiva Matemática, a sua Expectativa de Lucro (P) precisa ser ajustada pelo Fator de Realização (R).',
        trap: 'A mente preguiçosa aceita a equidade bruta como verdade absoluta (R = 1.0), ignorando que estar OOP dificulta extrair valor e facilita ser blefado.',
        choices: [
            { id: 'fold', label: 'APLICAR DESCONTO OOP (R = 0.85)', isCorrect: true, feedback: 'ESTADO DA ARTE. O Fator R dilui a equidade bruta. Com R=0.85, a equação de Expectativa cai para a realidade posicional. O que parecia um investimento lucrativo pode, na verdade, ser inferior ao próprio EV do Fold.', metricImpact: { expectativa: 'Diluída (Realista)', evFold: 'Constante', perspectiva: 'Corrigida para Baixo' } },
            { id: 'call', label: 'CONFIRMAR 45% (R = 1.0)', isCorrect: false, feedback: 'FALHA ESTRUTURAL. Jogar Fora de Posição é uma desvantagem reativa severa. Tratar a Raw Equity de 45% como poder de fogo real infla artificialmente a sua Expectativa (P).', metricImpact: { expectativa: 'Superestimada', evFold: 'Constante', perspectiva: 'Falsamente Positiva' } }
        ]
    },
    {
        id: "visceral_2",
        title: 'Axioma Lipe Piv: Regressão de Credibilidade',
        context: 'Você sofre uma agressão forte que polariza o oponente. O Solver aponta que você tem 50% de equity teórica contra o range estimado dele. Mas a situação é extrema, o oponente é humano e as informações são escassas. A Credibilidade (κ) dessa análise é baixa (0.2).',
        trap: 'Você projeta sua Expectativa confiando cegamente no output de 50% do solver (κ = 1.0), ignorando a enorme névoa de incerteza no spot.',
        choices: [
            { id: 'call', label: 'CONFIANÇA CEGA NO SOLVER (κ = 1.0)', isCorrect: false, feedback: 'FALHA ESTRUTURAL. Assumir 100% de realização teórica contra ranges humanos instáveis é insolvência analítica. O modelo da Perspectiva Matemática não perdoa a crença cega.', metricImpact: { expectativa: 'Mantida em 50%', evFold: 'Constante', perspectiva: 'Risco de Ruína (Irrealista)' } },
            { id: 'fold', label: 'REGRESSÃO BAYESIANA (κ = 0.2)', isCorrect: true, feedback: 'ESTADO DA ARTE. Com baixa credibilidade (κ), o Axioma puxa sua equidade real em direção à âncora do baseline passivo (heroCost / potSize). A equidade colapsa, forçando a Perspectiva a exigir o Fold defensivo.', metricImpact: { expectativa: 'Colapsada p/ Baseline', evFold: 'Constante', perspectiva: 'Proteção Ativada (Fold)' } }
        ]
    },
    {
        id: "visceral_3",
        title: 'Sunk Cost: O Piso Inegociável',
        context: 'Você já investiu 5bb no pote. Este é o seu "Custo Afundado". Ao calcular a Expectativa (P) de dar call em uma aposta, o resultado matemático é de -3bb.',
        trap: 'Ao ver uma Expectativa negativa (-3bb), o instinto de preservação grita que a ação é perdedora e que o Fold é a única saída segura.',
        choices: [
            { id: 'fold', label: 'COMPARAR COM O EV DE FOLD', isCorrect: true, feedback: 'ESTADO DA ARTE. A Perspectiva Matemática (PM) é relativa: PM = P - EV_fold. Se P é -3bb e o Fold custa -5bb, a sua PM é POSITIVA (+2bb). Agredir/Pagar (-3bb) é estritamente superior a desistir do Sunk Cost (-5bb).', metricImpact: { expectativa: '-3bb', evFold: '-5bb', perspectiva: 'PM = +2bb (Call > Fold)' } },
            { id: 'call', label: 'FOLDAR PARA EVITAR O -3bb', isCorrect: false, feedback: 'FALHA ESTRUTURAL. A Expectativa (P) de -3bb não existe no vácuo. O EV do Fold não é zero; ele é exatamente a dor do seu investimento anterior, ou seja, -5bb. Você está escolhendo perder 5bb para não perder 3bb.', metricImpact: { expectativa: '-3bb', evFold: 'Ignorado (Assumido 0)', perspectiva: 'Matematicamente Insolvente' } }
        ]
    }
];

async function main () {
    console.log( 'Injetando Conhecimento Visceral SOTA no Cortex (Prisma)...' );

    // SOTA: Expurgar registros viscerais antigos para garantir idempotência e evitar duplicação
    await ( prisma as any ).quizQuestion.deleteMany( { where: { type: 'visceral' } } );

    for ( const scenario of VISCERAL_SCENARIOS )
    {
        await ( prisma as any ).quizQuestion.create( { data: { type: 'visceral', payload: JSON.stringify( scenario ) } } );
    }
    console.log( 'Conhecimento SOTA injetado com sucesso.' );
}

main()
    .catch( ( e ) => { console.error( e ); process.exit( 1 ); } )
    .finally( async () => { await prisma.$disconnect(); } );
