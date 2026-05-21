'use client';

import { useState } from 'react';

/**
 * IDENTITY: Módulo de Teste Prático - Gamificação Visceral do ICM
 * PATH: src/components/simulator/IcmQuizVisceral.tsx
 * ROLE: Avaliar o entendimento do usuário sobre o Framework PM (Perspectiva Matemática), Fator R e Axioma Lipe Piv.
 */

type Choice = {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
    metricImpact: { expectativa: string; evFold: string; perspectiva: string };
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
        title: 'A Desvantagem Informacional (Fator R)',
        context: 'Flop. Você está OOP. Equity bruta (Raw Equity) de 45%. A fórmula de Perspectiva Matemática exige a aplicação da Realização Posicional (R).',
        trap: 'Você assume que sua equity bruta de 45% é o seu poder de fogo real, baseando sua Expectativa (P) em R = 1.0.',
        choices: [
            {
                id: 'call',
                label: 'IGNORAR POSIÇÃO (R = 1.0)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. O PM Lens dita que OOP (exceto River) sofre desvantagem reativa severa. Tratar a Raw Equity sem desconto infla artificialmente sua Expectativa (P).',
                metricImpact: { expectativa: 'Superestimada (R=1)', evFold: 'Constante', perspectiva: 'Falsamente Positiva' }
            },
            {
                id: 'fold',
                label: 'APLICAR DESCONTO (R = 0.85)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. Ao aplicar o Fator R de 0.85, a equação P = (eq * win * R * fgs) dilui sua equidade real. A desvantagem posicional corrói o EV, revelando que a ação pode não superar o EV_fold.',
                metricImpact: { expectativa: 'Diluída (R=0.85)', evFold: 'Constante', perspectiva: 'Corrigida para Baixo' }
            }
        ]
    },
    {
        id: 2,
        title: 'O Axioma Lipe Piv (Credibilidade)',
        context: 'Você enfrenta agressão que polariza o oponente. Raw Equity de 50%. Nível de Credibilidade (κ) é baixo (0.2) devido à pressão e ausência de informações.',
        trap: 'O solver indica 50% de equity no vácuo, e você projeta sua Expectativa com base nesse dado absoluto, ignorando a regressão bayesiana.',
        choices: [
            {
                id: 'call',
                label: 'CONFIANÇA CEGA (κ = 1.0)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. Assumir 100% de realização da equity teórica contra ranges não-lineares humanos é insolvência analítica. O modelo não suporta crença cega.',
                metricImpact: { expectativa: 'P baseada em eq=50%', evFold: 'Constante', perspectiva: 'Irrealista' }
            },
            {
                id: 'fold',
                label: 'REGRESSÃO BAYESIANA (κ = 0.2)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. Com κ baixo, o Axioma (eq = base + κ*(raw-base)) força a equidade a desabar rumo ao baseline passivo (heroCost/potSize). A expectativa teórica cai, e a Perspectiva Mathematical (PM) exige o fold.',
                metricImpact: { expectativa: 'P baseada em eq colapsada', evFold: 'Constante', perspectiva: 'Corrigida via Axioma' }
            }
        ]
    },
    {
        id: 3,
        title: 'Sunk Cost (1ª Ordem Dominante)',
        context: 'Você já investiu 5bb no pote (heroCost). A Expectativa (P) calculada de uma ação agressiva é de -3bb.',
        trap: 'Você calcula que -3bb é um resultado ruim e considera instintivamente a ação pior que o fold, ignorando o valor do próprio EV_fold.',
        choices: [
            {
                id: 'call',
                label: 'AVALIAR EXPECTATIVA ISOLADA',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. A Expectativa (P) negativa não significa que o fold seja melhor. O EV_fold não é zero; ele é exatamente a dor do Sunk Cost (-heroCost).',
                metricImpact: { expectativa: '-3bb', evFold: 'Ignorado (0bb)', perspectiva: 'Insolvente' }
            },
            {
                id: 'fold',
                label: 'SÍNTESE DA PERSPECTIVA (PM)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. PM = P - EV_fold. Se P é -3bb e EV_fold é -5bb, PM = -3 - (-5) = +2bb. A Perspectiva é POSITIVA (> 0). A ação (-3bb) é estritamente preferível a aceitar a destruição linear do seu Sunk Cost (-5bb).',
                metricImpact: { expectativa: '-3bb', evFold: '-5bb', perspectiva: 'PM = +2bb (Ação > Fold)' }
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

    return (
        <div style={ { maxWidth: '800px', margin: '3rem auto', padding: '2rem', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' } }>
                <h2 style={ { margin: 0, fontSize: '1.25rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' } }>
                    Teste Prático: Lente de Perspectiva
                </h2>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' } }>
                    Cenário { currentStep + 1 } de { QUIZ_SCENARIOS.length }
                </span>
            </div>

            {/* Área do Cenário */ }
            <div style={ { marginBottom: '2rem' } }>
                <h3 style={ { fontSize: '1.1rem', color: 'var(--accent-indigo-light)', marginBottom: '0.75rem', fontWeight: 700 } }>
                    { scenario.title }
                </h3>
                <p style={ { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' } }>
                    { scenario.context }
                </p>
                <div style={ { background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid var(--accent-danger)', padding: '0.75rem 1rem', borderRadius: '4px' } }>
                    <span style={ { fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-danger-light)', textTransform: 'uppercase' } }>⚠ Distorção Percebida: </span>
                    <span style={ { fontSize: '0.85rem', color: 'var(--text-light)' } }>{ scenario.trap }</span>
                </div>
            </div>

            {/* Opções de Decisão */ }
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.75rem' } }>
                { scenario.choices.map( choice => {
                    const isSelected = selectedChoice === choice.id;
                    return (
                        <button
                            key={ choice.id }
                            onClick={ () => !isAnswered && setSelectedChoice( choice.id ) }
                            disabled={ isAnswered }
                            style={ {
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', cursor: isAnswered ? 'default' : 'pointer',
                                background: getChoiceBackground( isSelected, choice.isCorrect ),
                                border: getChoiceBorder( isSelected, choice.isCorrect ),
                                transition: 'all 0.2s ease',
                                opacity: isAnswered && !isSelected ? 0.4 : 1
                            } }
                        >
                            <span style={ { fontWeight: 700, color: getChoiceColor( isSelected, choice.isCorrect ), fontSize: '0.95rem' } }>
                                { choice.label }
                            </span>
                        </button>
                    );
                } ) }
            </div>

            {/* Painel de Resolução (Impacto Visceral) */ }
            { isAnswered && choiceData && (
                <div style={ {
                    marginTop: '2rem', padding: '1.5rem', borderRadius: '8px',
                    background: choiceData.isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                    borderTop: `3px solid ${choiceData.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)'}`
                } }>
                    <p style={ { margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: 1.6 } }>
                        { choiceData.feedback }
                    </p>
                    <div style={ { display: 'flex', gap: '2rem', fontFamily: 'monospace' } }>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Expectativa (P)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--accent-indigo-light)' } }>
                                { choiceData.metricImpact.expectativa }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>EV_Fold (1ª Ordem)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--accent-danger)' } }>
                                { choiceData.metricImpact.evFold }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Perspectiva (PM)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: choiceData.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)' } }>
                                { choiceData.metricImpact.perspectiva }
                            </span>
                        </div>
                    </div>

                    { currentStep < QUIZ_SCENARIOS.length - 1 && (
                        <button onClick={ handleNext } style={ {
                            marginTop: '1.5rem', padding: '0.6rem 1.2rem', background: 'var(--accent-indigo)', color: '#fff',
                            border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                        } }>
                            Próximo Cenário &rarr;
                        </button>
                    ) }
                </div>
            ) }
        </div>
    );
}
