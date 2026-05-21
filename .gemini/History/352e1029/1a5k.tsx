'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

/**
 * IDENTITY: Módulo de Teste Prático - Gamificação Visceral do ICM
 * PATH: src/components/simulator/IcmQuizVisceral.tsx
 * ROLE: Avaliar o entendimento do usuário sobre o Framework PM (Perspectiva Matemática), Fator R e Axioma Lipe Piv, com UX animada e síntese final.
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
        title: 'Fator R: A Ilusão da Equidade Bruta OOP',
        context: 'Você está no Flop, Fora de Posição (OOP). A matemática nua diz que sua mão tem 45% de chance de vencer no Showdown (Raw Equity). Na fórmula da Perspectiva Matemática, a sua Expectativa de Lucro (P) precisa ser ajustada pelo Fator de Realização (R).',
        trap: 'A mente preguiçosa aceita a equidade bruta como verdade absoluta (R = 1.0), ignorando que estar OOP dificulta extrair valor e facilita ser blefado.',
        choices: [
            {
                id: 'fold',
                label: 'APLICAR DESCONTO OOP (R = 0.85)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. O Fator R dilui a equidade bruta. Com R=0.85, a equação de Expectativa cai para a realidade posicional. O que parecia um investimento lucrativo pode, na verdade, ser inferior ao próprio EV do Fold.',
                metricImpact: { expectativa: 'Diluída (Realista)', evFold: 'Constante', perspectiva: 'Corrigida para Baixo' }
            },
            {
                id: 'call',
                label: 'CONFIRMAR 45% (R = 1.0)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. Jogar Fora de Posição é uma desvantagem reativa severa. Tratar a Raw Equity de 45% como poder de fogo real infla artificialmente a sua Expectativa (P).',
                metricImpact: { expectativa: 'Superestimada', evFold: 'Constante', perspectiva: 'Falsamente Positiva' }
            }
        ]
    },
    {
        id: 2,
        title: 'Axioma Lipe Piv: Regressão de Credibilidade',
        context: 'Você sofre uma agressão forte que polariza o oponente. O Solver aponta que você tem 50% de equity teórica contra o range estimado dele. Mas a situação é extrema, o oponente é humano e as informações são escassas. A Credibilidade (κ) dessa análise é baixa (0.2).',
        trap: 'Você projeta sua Expectativa confiando cegamente no output de 50% do solver (κ = 1.0), ignorando a enorme névoa de incerteza no spot.',
        choices: [
            {
                id: 'call',
                label: 'CONFIANÇA CEGA NO SOLVER (κ = 1.0)',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. Assumir 100% de realização teórica contra ranges humanos instáveis é insolvência analítica. O modelo da Perspectiva Matemática não perdoa a crença cega.',
                metricImpact: { expectativa: 'Mantida em 50%', evFold: 'Constante', perspectiva: 'Risco de Ruína (Irrealista)' }
            },
            {
                id: 'fold',
                label: 'REGRESSÃO BAYESIANA (κ = 0.2)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. Com baixa credibilidade (κ), o Axioma puxa sua equidade real em direção à âncora do baseline passivo (heroCost / potSize). A equidade colapsa, forçando a Perspectiva a exigir o Fold defensivo.',
                metricImpact: { expectativa: 'Colapsada p/ Baseline', evFold: 'Constante', perspectiva: 'Proteção Ativada (Fold)' }
            }
        ]
    },
    {
        id: 3,
        title: 'Sunk Cost: O Piso Inegociável',
        context: 'Você já investiu 5bb no pote. Este é o seu "Custo Afundado". Ao calcular a Expectativa (P) de dar call em uma aposta, o resultado matemático é de -3bb.',
        trap: 'Ao ver uma Expectativa negativa (-3bb), o instinto de preservação grita que a ação é perdedora e que o Fold é a única saída segura.',
        choices: [
            {
                id: 'fold',
                label: 'COMPARAR COM O EV DE FOLD',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. A Perspectiva Matemática (PM) é relativa: PM = P - EV_fold. Se P é -3bb e o Fold custa -5bb, a sua PM é POSITIVA (+2bb). Agredir/Pagar (-3bb) é estritamente superior a desistir do Sunk Cost (-5bb).',
                metricImpact: { expectativa: '-3bb', evFold: '-5bb', perspectiva: 'PM = +2bb (Call > Fold)' }
            },
            {
                id: 'call',
                label: 'FOLDAR PARA EVITAR O -3bb',
                isCorrect: false,
                feedback: 'FALHA ESTRUTURAL. A Expectativa (P) de -3bb não existe no vácuo. O EV do Fold não é zero; ele é exatamente a dor do seu investimento anterior, ou seja, -5bb. Você está escolhendo perder 5bb para não perder 3bb.',
                metricImpact: { expectativa: '-3bb', evFold: 'Ignorado (Assumido 0)', perspectiva: 'Matematicamente Insolvente' }
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
    const [ answers, setAnswers ] = useState<Record<number, string>>( {} );

    const isFinished = currentStep === QUIZ_SCENARIOS.length;
    const scenario = QUIZ_SCENARIOS[ currentStep ];
    const selectedChoice = answers[ currentStep ] || null;
    const isAnswered = selectedChoice !== null;
    const choiceData = scenario?.choices.find( c => c.id === selectedChoice );

    return (
        <div style={ { maxWidth: '800px', margin: '3rem auto', padding: '2rem', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' } }>
                <h2 style={ { margin: 0, fontSize: '1.25rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' } }>
                    Teste Prático: Lente de Perspectiva
                </h2>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' } }>
                    { isFinished ? 'Síntese Final' : `Cenário ${currentStep + 1} de ${QUIZ_SCENARIOS.length}` }
                </span>
            </div>

            <AnimatePresence mode="wait">
                { isFinished ? (
                    /* Tela de Síntese Final (Theory Core) */
                    <motion.div
                        key="synthesis"
                        initial={ { opacity: 0, scale: 0.98 } }
                        animate={ { opacity: 1, scale: 1 } }
                        transition={ { duration: 0.4, ease: "easeOut" } }
                        style={ { textAlign: 'center', padding: '1rem 0' } }
                    >
                        <h3 style={ { fontSize: '1.4rem', color: 'var(--accent-emerald-light)', marginBottom: '1rem', fontWeight: 800 } }>
                            O Córtex da Perspectiva Matemática
                        </h3>
                        <p style={ { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' } }>
                            As leis da PM Lens destroem a ilusão linear do ChipEV e ancoram suas decisões no chão da realidade:
                        </p>

                        <div style={ { display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem' } }>
                            <div style={ { background: 'rgba(30,41,59,0.4)', borderLeft: '3px solid var(--accent-indigo)', padding: '1rem', borderRadius: '6px' } }>
                                <strong style={ { color: 'var(--accent-indigo-light)', display: 'block', marginBottom: '0.25rem' } }>1. Equidade não é Destino (Fator R)</strong>
                                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)' } }>Estar Fora de Posição dilui estruturalmente o seu poder de fogo. O Fator R revela que mãos que parecem lucrativas no vácuo tornam-se insustentáveis no mundo real.</span>
                            </div>
                            <div style={ { background: 'rgba(30,41,59,0.4)', borderLeft: '3px solid var(--accent-pink)', padding: '1rem', borderRadius: '6px' } }>
                                <strong style={ { color: 'var(--accent-pink-light)', display: 'block', marginBottom: '0.25rem' } }>2. Solvers preveem perfeição; humanos entregam entropia (Axioma)</strong>
                                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)' } }>O Axioma Lipe Piv utiliza a Regressão Bayesiana para forçar a equidade teórica de volta ao baseline passivo sempre que a Credibilidade (κ) for baixa. Não confie cegamente no vácuo.</span>
                            </div>
                            <div style={ { background: 'rgba(30,41,59,0.4)', borderLeft: '3px solid var(--accent-amber)', padding: '1rem', borderRadius: '6px' } }>
                                <strong style={ { color: 'var(--accent-amber-light)', display: 'block', marginBottom: '0.25rem' } }>3. O Zero Não Existe (Sunk Cost)</strong>
                                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)' } }>Qualquer decisão agressiva negativa (-3bb) será lucrativa pela Lente da Perspectiva se o Custo Afundado da desistência for ainda pior (-5bb). O EV do Fold é o seu piso inegociável.</span>
                            </div>
                        </div>

                        <button onClick={ () => { setAnswers( {} ); setCurrentStep( 0 ); } } style={ { padding: '0.75rem 2rem', background: 'var(--accent-indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' } }>
                            Reiniciar Calibração
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={ currentStep }
                        initial={ { opacity: 0, x: 15 } }
                        animate={ { opacity: 1, x: 0 } }
                        exit={ { opacity: 0, x: -15 } }
                        transition={ { duration: 0.25, ease: "easeInOut" } }
                    >
                        {/* Área do Cenário */ }
                        <div style={ { marginBottom: '2rem' } }>
                            <h3 style={ { fontSize: '1.1rem', color: 'var(--accent-indigo-light)', marginBottom: '0.75rem', fontWeight: 700 } }>
                                { scenario.title }
                            </h3>
                            <p style={ { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' } }>
                                { scenario.context }
                            </p>
                            <div style={ { background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid var(--accent-danger)', padding: '0.75rem 1rem', borderRadius: '4px' } }>
                                <span style={ { fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-danger-light)', textTransform: 'uppercase' } }>⚠ Armadilha Cognitiva: </span>
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
                                        onClick={ () => !isAnswered && setAnswers( prev => ( { ...prev, [ currentStep ]: choice.id } ) ) }
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
                            <motion.div
                                initial={ { opacity: 0, y: 10 } } animate={ { opacity: 1, y: 0 } } transition={ { duration: 0.3 } }
                                style={ {
                                    marginTop: '2rem', padding: '1.5rem', borderRadius: '8px',
                                    background: choiceData.isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                                    borderTop: `3px solid ${choiceData.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)'}`
                                } }
                            >
                                <p style={ { margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-light)', lineHeight: 1.6 } }>
                                    { choiceData.feedback }
                                </p>
                                <div style={ { display: 'flex', gap: '2rem', fontFamily: 'monospace', flexWrap: 'wrap' } }>
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
                            </motion.div>
                        ) }
                    </motion.div>
                ) }
            </AnimatePresence>

            {/* Navegação SOTA */ }
            { !isFinished && (
                <div style={ { display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' } }>
                    <button onClick={ () => setCurrentStep( prev => Math.max( 0, prev - 1 ) ) } disabled={ currentStep === 0 } style={ { padding: '0.5rem 1rem', background: 'transparent', color: currentStep === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-dim)', border: `1px solid ${currentStep === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '6px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s ease' } }>
                        &larr; Voltar
                    </button>
                    <button onClick={ () => setCurrentStep( prev => prev + 1 ) } disabled={ !isAnswered } style={ { padding: '0.5rem 1.5rem', background: isAnswered ? 'var(--accent-indigo)' : 'rgba(99,102,241,0.1)', color: isAnswered ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '6px', cursor: isAnswered ? 'pointer' : 'not-allowed', fontWeight: 700, transition: 'all 0.2s ease' } }>
                        { currentStep === QUIZ_SCENARIOS.length - 1 ? 'Ver Síntese' : 'Avançar \u2192' }
                    </button>
                </div>
            ) }
        </div>
    );
}
