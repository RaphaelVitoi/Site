'use client';

import { useContext, useState } from 'react';
import { SotaEcosystemContext } from './MasterSimulator';

/**
 * IDENTITY: Módulo de Teste Prático - Gamificação Visceral do ICM
 * PATH: src/components/simulator/IcmQuizVisceral.tsx
 * ROLE: Avaliar o entendimento do usuário sobre RIO Quadrático, EV de Fold e Amortização da Edge.
 */

type Choice = {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
    metricImpact: { chipEv: string; perspective: string };
};

type Scenario = {
    id: number;
    title: string;
    context: string;
    trap: string;
    choices: Choice[];
};

const QUIZ_SCENARIOS: Scenario[] = [
    {
        id: 1,
        title: 'A Armadilha Multiway (Entropia x²)',
        context: 'FT Bolha (6 left). Você está no BB com 25bb. UTG (40bb) abre min-raise. BTN (35bb) e SB (20bb) dão call. Pote tem 7bb. Você tem J♦ 8♦. As Pot Odds são irrecusáveis (aprox 5.5:1).',
        trap: 'As pot odds gritam que você só precisa de ~15% de equidade.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Aceitar as Pot Odds)',
                isCorrect: false,
                feedback: 'FALHA SISTÊMICA. Em Multiway, o Passivo Estrutural (RIO) explode quadraticamente. Acertar um valete ou um flush baixo frequentemente fará você sangrar fichas para ranges dominantes pós-flop. O custo de saída destrói sua Perspectiva.',
                metricImpact: { chipEv: '+0.12bb', perspective: '-4.8% FGS (Catastrófico)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Assumir o EV de Fold)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. O EV do fold NUNCA é zero (aqui é -1bb), mas evitar o cenário de RIO extremo preserva seu FGS. Você reconheceu a pseudo-densidade das pot odds. Sobrevivência e evasão de armadilhas geram o lucro real.',
                metricImpact: { chipEv: '-1.00bb', perspective: '+0.5% (Preservação)' }
            },
            {
                id: 'squeeze',
                label: 'SQUEEZE (Agressão Punitiva)',
                isCorrect: false,
                feedback: 'SUICÍDIO DE ICM. Seu Risk Premium contra o UTG e o BTN é elevado. Squeezar um pote multiway com uma mão de baixa retenção de equidade sem blockers fortes é incendiar seu valuation.',
                metricImpact: { chipEv: '-3.50bb', perspective: '-12.0% (Risco de Eliminação)' }
            }
        ]
    },
    {
        id: 2,
        title: 'O Risco de Ressurreição (Amortização da Edge)',
        context: 'Bolha de FT. Você é o Chip Leader com 60bb no BB. Um Short Stack (10bb) no SB vai all-in (shove). Você tem A8o.',
        trap: 'Em ChipEV puro (e na matemática básica de GTO), A8o é um call lucrativo contra o range de 10bb.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Aderir ao GTO/ChipEV)',
                isCorrect: false,
                feedback: 'FALHA DE PERSPECTIVA. Dobrar o SS para 20bb devolve a ele a "complexidade da árvore de decisões". O verdadeiro erro na bolha não é o call matemático marginal, mas devolver as ferramentas e a profundidade ao oponente que estava confinado à simplicidade binária.',
                metricImpact: { chipEv: '+0.05bb', perspective: '-8.5% FGS (Risco de Ressurreição)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Silêncio Estratégico)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. O silêncio estratégico. Foldar A8o protege seu valuation contra a variância amortizadora e mantém a vantagem sistêmica de ter um "morto-vivo" na mesa. Você reconheceu a poda da árvore de decisão.',
                metricImpact: { chipEv: '-1.00bb', perspective: '+2.1% (Manutenção de Pressão)' }
            }
        ]
    },
    {
        id: 3,
        title: 'Downward Drift (Aprisionamento ao Pote)',
        context: 'Você defendeu o BB com 35bb e pagou Flop e Turn. No River, o pote tem 20bb, e você tem 15bb para trás. O agressor shova. As pot odds são irrecusáveis.',
        trap: 'Você sente que "já investiu demais" (sunk cost) e as pot odds exigem pouca equidade matemática.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Pagar pelo Preço das Odds)',
                isCorrect: false,
                feedback: 'COLAPSO DO SISTEMA. Você ignorou a diluição do Risk Premium e as Reverse Implied Odds (RIO). O overcall no River é apenas o sintoma da armadilha de valuation. O foco nas odds cegou você para a destruição do seu FGS e de suas ferramentas de edge pós-flop.',
                metricImpact: { chipEv: '+0.50bb', perspective: '-100% FGS (Risco de Eliminação Direta)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Aceitar o Sunk Cost)',
                isCorrect: true,
                feedback: 'PRESERVAÇÃO DO SISTEMA. O EV do fold NUNCA é zero (aqui é exatamente a dor do seu Sunk Cost). Aceitar a perda estanca a sangria e salva os 15bb restantes (suas ferramentas de Edge futuras). Pot odds em potes grandes são frequentemente armadilhas lineares.',
                metricImpact: { chipEv: '-20.00bb', perspective: '+0.0% (Sobrevivência Pura)' }
            }
        ]
    }
];

function getChoiceBackground ( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return 'rgba(30,41,59,0.5)';
    return isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
}

function getChoiceBorder ( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return '1px solid rgba(255,255,255,0.05)';
    return isCorrect ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-danger)';
}

function getChoiceColor ( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return 'var(--text-light)';
    return isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)';
}

export default function IcmQuizVisceral () {
    // SOTA: Escuta silenciosa do motor quântico. Se não houver provider, o hook retorna null graciosamente.
    const ecosystem = useContext( SotaEcosystemContext );

    const [ currentStep, setCurrentStep ] = useState<number>( 0 );
    const [ selectedChoice, setSelectedChoice ] = useState<string | null>( null );

    const scenario = QUIZ_SCENARIOS[ currentStep ];
    const isAnswered = selectedChoice !== null;
    const choiceData = scenario.choices.find( c => c.id === selectedChoice );

    const handleNext = () => {
        if ( currentStep < QUIZ_SCENARIOS.length - 1 )
        {
            setCurrentStep( prev => prev + 1 );
            setSelectedChoice( null );
        }
    };

    // SOTA: Resolução Híbrida. Se o Quiz estiver acoplado ao MasterSimulator, extraímos o FGS e ChipEV reais do motor.
    const resolveMetric = ( type: 'chipEv' | 'perspective', choiceId: string, staticValue: string ) => {
        if ( !ecosystem?.actionMetrics ) return staticValue;

        if ( type === 'chipEv' )
        {
            return ecosystem.actionMetrics[ choiceId ] ? `${ecosystem.actionMetrics[ choiceId ].chipEv.toFixed( 2 )}bb (Engine)` : staticValue;
        }

        return ecosystem.actionMetrics[ choiceId ]?.fgsImpact
            ? `${ecosystem.actionMetrics[ choiceId ].fgsImpact.toFixed( 2 )}% (Engine)` : staticValue;
    };

}
