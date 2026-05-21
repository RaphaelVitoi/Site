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
    metricImpact: { chipEv: string; icmEv: string; perspective: string };
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
        context: 'FT Bolha (6 left). Ante de 12.5%. Você está no BB com 25bb. UTG (40bb) abre min-raise. BTN (35bb) e SB (20bb) dão call. Pote tem 7bb. Você tem J♦ 8♦. As Pot Odds são irrecusáveis (aprox 5.5:1).',
        trap: 'As pot odds gritam que você só precisa de ~15% de equidade.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Aceitar as Pot Odds)',
                isCorrect: false,
                feedback: 'FALHA SISTÊMICA. Em Multiway, o Passivo Estrutural (RIO) explode quadraticamente. Acertar um valete ou um flush baixo frequentemente fará você sangrar fichas para ranges dominantes pós-flop. O custo de saída destrói sua Perspectiva.',
                metricImpact: { chipEv: '+0.12bb', icmEv: '-1.8% (Pressão Base)', perspective: '-8.5% FGS (Insolvência RIO)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Assumir o EV de Fold)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. O EV do fold NUNCA é zero (custa -1.125bb), mas evitar o RIO em um pote com 3 oponentes na bolha converte sua stack em um ativo de altíssimo rendimento passivo. A probabilidade de colisão entre eles gera um ganho brutal de FGS.',
                metricImpact: { chipEv: '-1.125bb', icmEv: '-0.9% (Custo Fixo)', perspective: '+4.2% (Espectador de Colisão)' }
            },
            {
                id: 'squeeze',
                label: 'SQUEEZE (Agressão Punitiva)',
                isCorrect: false,
                feedback: 'SUICÍDIO DE ICM. Seu Risk Premium contra o UTG e o BTN é elevado. Squeezar um pote multiway com uma mão de baixa retenção de equidade sem blockers fortes é incendiar seu valuation.',
                metricImpact: { chipEv: '-3.50bb', icmEv: '-5.0% (Alto Risco)', perspective: '-18.0% (Colapso Sistêmico)' }
            }
        ]
    },
    {
        id: 2,
        title: 'O Risco de Ressurreição (Ameaça Indireta)',
        context: 'Bolha da FT (10 left, estrutura Flat). Ante de 12.5%. Você é o Chip Leader absoluto com 60bb no BB. O 2º em fichas (35bb) está em outra mesa. Na sua mesa, os outros 4 oponentes têm entre 12bb e 18bb e jogam aterrorizados (alta pressão de ICM). O SB (10bb) finalmente vai all-in (shove). Você olha para A8o.',
        trap: 'O instinto de preservação cega você: o medo de dobrar o short esconde o perigo de quem vai absorvê-lo se você não o fizer.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Negação de Absorção)',
                isCorrect: true,
                feedback: 'ESTADO DA ARTE. O SB shova um range amplo e A8o é muito forte. Perder 10bbs não corrói sua soberania, mas a Perspectiva dita: se não for você a ganhar essas 10bbs, um stack médio (15-18bb) o fará. A ressurreição de uma stack média que absorve o short e cruza os 30bbs é uma ameaça infinitamente pior à sua coroa.',
                metricImpact: { chipEv: '+1.40bb', icmEv: '+0.5% (Payjump Implícito)', perspective: '+3.8% (Manutenção de Monopólio)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Aversão ao Risco Cega)',
                isCorrect: false,
                feedback: 'FALHA DE PERSPECTIVA. Você foca apenas no seu próprio risco e esquece o ecossistema macro. Ao foldar, você deixa as 10bbs do SB na mesa para serem absorvidas por um stack de 18bbs futuramente. O fold é um passe livre para a criação de um predador com ferramentas de edge.',
                metricImpact: { chipEv: '-1.125bb', icmEv: '-0.6% (Desconto + Ante)', perspective: '-8.5% FGS (Risco de Ressurreição)' }
            }
        ]
    },
    {
        id: 3,
        title: 'Downward Drift (Aprisionamento ao Pote)',
        context: 'Reta final (15 left, payjumps densos). Ante de 12.5%. Você defendeu o BB com 35bb (2º em fichas da mesa) contra um open do BTN (Chip Leader, 80bb). O board é dinâmico. Você paga apostas de continuation no Flop e no Turn segurando Top Pair. O River completa os draws mais óbvios. O pote tem 20bb, você tem 15bb para trás e o CL shova. As pot odds exigem apenas ~30% de equidade.',
        trap: 'Você sente que "já investiu demais" (sunk cost) e as pot odds exigem pouca equidade matemática.',
        choices: [
            {
                id: 'call',
                label: 'CALL (Pagar pelo Preço das Odds)',
                isCorrect: false,
                feedback: 'COLAPSO DO SISTEMA. Você ignorou a diluição do Risk Premium e as Reverse Implied Odds (RIO). O overcall no River é apenas o sintoma da armadilha de valuation. O foco nas odds cegou você para a destruição do seu FGS e de suas ferramentas de edge pós-flop.',
                metricImpact: { chipEv: '+0.50bb', icmEv: '-15.0% (Insolvência)', perspective: '-100% (Risco de Eliminação)' }
            },
            {
                id: 'fold',
                label: 'FOLD (Aceitar o Sunk Cost)',
                isCorrect: true,
                feedback: 'PRESERVAÇÃO DO SISTEMA. O EV do fold reflete a dor do Sunk Cost. Aceitar a perda estanca a sangria e salva 15bb, garantindo oxigênio para buscar uma colisão onde você detenha a Vantagem de Risco. Folds difíceis preservam FGS.',
                metricImpact: { chipEv: '-20.00bb', icmEv: '-18.0% (Sunk Cost)', perspective: '+1.5% (Sobrevivência Ativa)' }
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
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Impacto ChipEV</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' } }>
                                { choiceData.metricImpact.chipEv }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>ICMev (Estático)</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber)' } }>
                                { choiceData.metricImpact.icmEv }
                            </span>
                        </div>
                        <div>
                            <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Perspectiva Matemática</span>
                            <span style={ { fontSize: '1rem', fontWeight: 800, color: choiceData.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)' } }>
                                { choiceData.metricImpact.perspective }
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
