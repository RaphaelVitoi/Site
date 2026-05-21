'use client';

import { useState } from 'react';

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
    metricImpact: { rpIp: string; rpOop: string; solverOutput: string };
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
        title: 'O Esmagamento do Defensor (TG4)',
        context: 'Pote SRP. Você está OOP. O Risk Premium do Agressor (IP) contra você é mínimo (3%). O seu Risk Premium contra o IP é extremo (24%).',
        trap: 'Sua mão é decente. Você instintivamente tenta proteger seu range para não ser explorado, mirando no Minimum Defense Frequency (MDF).',
        choices: [
            {
                id: 'call',
                label: 'CALL (Defender próximo ao MDF)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. Com 24% de RP, tentar defender o MDF é insolvência matemática. A matemática linear do ChipEV não se aplica em extremos de ICM.',
                metricImpact: { rpIp: '3%', rpOop: '24%', solverOutput: 'Insolvência Sistêmica' }
            },
            {
                id: 'fold',
                label: 'FOLD (Aderir ao Teto do RP)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. A âncora empírica TG4 prova que, com 24% de RP, sua defesa é forçada a "congelar" em um fold sustentável (⊘ teto). Simultaneamente, o IP satura seus blefes ao limite máximo ditado pelo Bubble Factor (⊘ max).',
                metricImpact: { rpIp: '3%', rpOop: '24%', solverOutput: 'Bluff: ⊘ max | Defesa: ⊘ teto' }
            }
        ]
    },
    {
        id: 2,
        title: 'A Inversão do Risco (TG7 / KJT-2-3)',
        context: 'Você está OOP no board K♦J♣T♠2♦3♦. O IP possui 21% de RP (altíssimo risco para ele). O seu RP contra ele é de apenas 3% (baixo risco para você).',
        trap: 'O instinto reage: "Meu risco é quase zero (3%). A pressão de ICM está toda do lado dele, então posso pagar de forma bem ampla."',
        choices: [
            {
                id: 'call',
                label: 'CALL (Explorar o baixo RP próprio)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. O IP, esmagado por 21% de RP, despenca seus blefes drasticamente. Pagar de forma ampla contra um range que quase não contém blefes é suicídio matemático, independentemente do quão baixo seja o seu próprio risco.',
                metricImpact: { rpIp: '21%', rpOop: '3%', solverOutput: 'Overcall Destrutivo' }
            },
            {
                id: 'fold',
                label: 'FOLD (Respeitar a queda de bluff do IP)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. A âncora empírica TG7 prova que o IP reduz seus blefes para meros 13%. Consequentemente, a defesa ótima do OOP cai para apenas 20% (um fold massivo de 80%), provando que a estratégia defensiva é ditada pelo RP do agressor.',
                metricImpact: { rpIp: '21%', rpOop: '3%', solverOutput: 'Bluff: ↓ 13% | Defesa: ↓ 20%' }
            }
        ]
    },
    {
        id: 3,
        title: 'O Paradoxo do Early Game',
        context: 'Estamos na 3ª mão do torneio (Early Game). 126 entradas. Todos os jogadores da mesa possuem 80bb de stack inicial.',
        trap: 'A velha máxima da comunidade: "ICM só importa na bolha ou na Mesa Final. No início, o torneio é jogado puramente como Cash Game (ChipEV)."',
        choices: [
            {
                id: 'call',
                label: 'JOGAR CHIPEV (Ignorar ICM)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. Jogar puramente ChipEV no nível 1 ignora a natureza de eliminação do torneio e o valor financeiro da stack inicial.',
                metricImpact: { rpIp: '0%', rpOop: '0%', solverOutput: 'Erro Analítico' }
            },
            {
                id: 'fold',
                label: 'RESPEITAR ICM PRECOCE',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. A matriz empírica (EG_BF_MATRIX) prova a existência de um Bubble Factor médio de 1.09 e um Risk Premium residual de ~2.1% a 2.4% entre todas as posições com 80bb. O ICM existe desde a primeira mão e já altera frequências pré-flop.',
                metricImpact: { rpIp: '~2.1%', rpOop: '~2.1%', solverOutput: 'BF Base 1.09 | RP ~2.1%' }
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
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>RP Agressor (IP)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--accent-indigo-light)' } }>
                                { choiceData.metricImpact.rpIp }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>RP Defensor (OOP)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--accent-danger)' } }>
                                { choiceData.metricImpact.rpOop }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Referencial Solver</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: choiceData.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)' } }>
                                { choiceData.metricImpact.solverOutput }
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
