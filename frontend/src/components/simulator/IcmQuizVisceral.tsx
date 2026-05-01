'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * IDENTITY: Módulo de Teste Prático - Gamificação Visceral do ICM
 * PATH: src/components/simulator/IcmQuizVisceral.tsx
 * ROLE: Avaliar o entendimento do usuário sobre o Framework PM( Perspectiva Matemática ), Fator R e Axioma Lipe Piv, com UX animada e síntese final.
 */

type Choice = {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
    metricImpact: { expectativa: string; evFold: string; perspectiva: string; ci?: string };
};

export type Scenario = {
    id: number | string;
    title: string;
    context: string;
    trap: string;
    choices: Choice[];
};

// SOTA: Auto-Healing e Mock Local O(1) para contornar a ausência de 'quizActions'.
// Permite que o componente escale via DB no futuro sem quebrar o fluxo estático presente.
const fetchVisceralScenarios = async (): Promise<Scenario[]> => {
    return new Promise( resolve => setTimeout( () => resolve( FALLBACK_SCENARIOS ), 800 ) );
};

const FALLBACK_SCENARIOS: Scenario[] = [
    {
        id: 'tg-1',
        title: 'O Canto da Sereia das Pot Odds',
        context: 'Mesa Final (7 left). UTG (CL, 65bb) abre 2x. Você está no BB com 15bb. Pote: 4.5bb. Você com 97s.',
        trap: 'Pagar porque as pot odds (1:4.5) dizem que é lucrativo no vácuo.',
        choices: [
            {
                id: 'c1',
                label: 'Call. As odds justificam especular no Flop.',
                isCorrect: false,
                feedback: 'Insolvência (Cᵢ < 1). As pot odds mascaram as Reverse Implied Odds (RIO). Ao pagar OOP contra o CL, o Custo Afundado corrói sua sobrevivência sistêmica.',
                metricImpact: { expectativa: '-0.25bb', evFold: '-1.12bb', perspectiva: '-1.50%', ci: '0.75' }
            },
            {
                id: 'c2',
                label: 'Fold. O EV de fold estabelece um teto de segurança.',
                isCorrect: true,
                feedback: 'Rigor Cirúrgico. O investimento não compensa o Passivo Estrutural. Foldar preserva o capital sistêmico e repele a armadilha do Pot Entrapment.',
                metricImpact: { expectativa: '0.00bb', evFold: '-1.12bb', perspectiva: '+2.10%', ci: '1.20' }
            }
        ]
    },
    {
        id: 'tg-2',
        title: 'O Paradoxo do Leverage',
        context: 'Bolha do Torneio. O SB (20bb) entra de limp. Você está no BB (25bb) com KJo.',
        trap: 'Checkar passivamente para "ver o flop grátis" devido à Bolha.',
        choices: [
            {
                id: 'c3',
                label: 'Raise (Isolate). Aplicar a pressão da bolha sobre o SB.',
                isCorrect: true,
                feedback: 'Antevisão Aplicada. Você transfere o Risk Premium para o oponente, alavancando o Bubble Factor dele contra si mesmo e conquistando Fold Equity não-linear.',
                metricImpact: { expectativa: '+1.80bb', evFold: '-1.00bb', perspectiva: '+4.20%', ci: '1.50' }
            },
            {
                id: 'c4',
                label: 'Check. Evitar risco de eliminação e realizar equidade.',
                isCorrect: false,
                feedback: 'Erro de Omissão. Ao abdicar do Leverage, você permite que o SB realize a equidade gratuitamente, negligenciando a Amortização da Edge e a Saúde Estrutural (FGS).',
                metricImpact: { expectativa: '+0.15bb', evFold: '-1.00bb', perspectiva: '-0.80%', ci: '0.95' }
            }
        ]
    },
    {
        id: 'tg-3',
        title: 'O Colapso da Árvore (Amortização da Edge)',
        context: 'Bolha da Mesa Final. Você é o Chip Leader (100bb). O Short Stack (10bb) shova do BTN. Você segura A8o no BB.',
        trap: 'Pagar porque A8o tem 55% de equidade e você se considera um jogador muito superior (Edge Alta).',
        choices: [
            {
                id: 'c5',
                label: 'Call. A Edge garante lucro no longo prazo contra amadores.',
                isCorrect: false,
                feedback: 'Ilusão de Processamento. Com 10bb a árvore colapsa e a sua Edge é neutralizada pela variância (A Matemática de Colisão Pura). Dobrar o short devolve as "ferramentas de erro" a ele e quebra o ecossistema da mesa.',
                metricImpact: { expectativa: '+0.40bb', evFold: '0.00bb', perspectiva: '-3.20%', ci: '0.85' }
            },
            {
                id: 'c6',
                label: 'Fold. O EV do fold é soberano. Manter a inércia.',
                isCorrect: true,
                feedback: 'A Complexidade é a Arma do Forte. Você abdica de um EV marginal para preservar a sua Edge intacta em potes Deep. Manter o short agonizando sufocado tem valor estratégico infinitamente superior à colisão.',
                metricImpact: { expectativa: '0.00bb', evFold: '0.00bb', perspectiva: '+5.10%', ci: '2.50' }
            }
        ]
    },
    {
        id: 'tg-4',
        title: 'O Axioma Lipe Piv (Fator Ψ)',
        context: 'River. Pote gigante. RP = 25% (Predator Zone). Oponente OOP shova agressivamente representando o nuts absoluto.',
        trap: 'Foldar instantaneamente porque a MDF colapsa sob 24% de RP e a teoria manda respeitar a pressão do ICM.',
        choices: [
            {
                id: 'c7',
                label: 'Fold. O Teto do RP manda evitar colisões.',
                isCorrect: false,
                feedback: 'Conservadorismo Robótico. Você jogou GTO contra um humano. Ignorou a taxa de maluquice. Se o oponente não executa o GTO de forma perfeita, o overfold sistemático é abstenção pura de lucro.',
                metricImpact: { expectativa: '0.00bb', evFold: '-15.0bb', perspectiva: '-5.00%', ci: '0.90' }
            },
            {
                id: 'c8',
                label: 'Call. Integrar a Frequência de Bobagem Humana.',
                isCorrect: true,
                feedback: 'Regressão Bayesiana Aplicada. Se a probabilidade estatística dele errar emocionalmente (tilt/bluff) for de 10%, e a chance dele ter os 4 combos de nuts for 4%, a Perspectiva exige o call sobrepujando o ICM puro.',
                metricImpact: { expectativa: '+8.50bb', evFold: '-15.0bb', perspectiva: '+12.0%', ci: '1.80' }
            }
        ]
    }
];

function getChoiceBackground( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return 'rgba(30,41,59,0.5)';
    return isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
}

function getChoiceBorder( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return '1px solid rgba(255,255,255,0.05)';
    return isCorrect ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-danger)';
}

function getChoiceColor( isSelected: boolean, isCorrect: boolean ): string {
    if ( !isSelected ) return 'var(--text-light)';
    return isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)';
}

// Subcomponente para erradicar a Complexidade Ciclomatica SOTA (Lei de Shannon)
function QuizSynthesis( { onRestart }: { readonly onRestart: () => void } ) {
    return (
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
                <div style={ { background: 'rgba(30,41,59,0.4)', borderLeft: '3px solid var(--accent-pink)', padding: '1rem', borderRadius: '6px' } }>
                    <strong style={ { color: 'var(--accent-pink-light)', display: 'block', marginBottom: '0.25rem' } }>4. A Ilusão das Pot Odds (Coeficiente Cᵢ)</strong>
                    <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)' } }>O preço barato mascara o Passivo Estrutural das Reverse Implied Odds (RIO). Se o Cᵢ for menor que 1, as odds estão mentindo e a sua equity real será devorada pela entropia (Multiway).</span>
                </div>
            </div>
            <button onClick={ onRestart } style={ { padding: '0.75rem 2rem', background: 'var(--accent-indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' } }>
                Reiniciar Calibração
            </button>
        </motion.div>
    );
}

// Subcomponente para renderizar a etapa ativa (Erradicando Complexidade Ciclomatica SOTA)
function ActiveScenarioStep( {
    scenario,
    currentStep,
    selectedChoice,
    isAnswered,
    isRevealing,
    choiceData,
    onSelect
}: {
    readonly scenario: Scenario;
    readonly currentStep: number;
    readonly selectedChoice: string | null;
    readonly isAnswered: boolean;
    readonly isRevealing: boolean;
    readonly choiceData: Choice | undefined;
    readonly onSelect: ( choiceId: string ) => void;
} ) {
    return (
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
                            onClick={ () => onSelect( choice.id ) }
                            disabled={ isAnswered || isRevealing }
                            style={ {
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', cursor: ( isAnswered || isRevealing ) ? 'default' : 'pointer',
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
            { isRevealing && (
                <motion.div initial={ { opacity: 0 } } animate={ { opacity: 1 } } style={ { marginTop: '2rem', padding: '1.5rem', textAlign: 'center', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px dashed rgba(99,102,241,0.2)' } }>
                    <span style={ { fontSize: '0.75rem', color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 } }>
                        <i className="fa-solid fa-microchip fa-fade" style={ { marginRight: '8px' } } />
                        { ' ' }Processando Vetores de Perspectiva...
                    </span>
                </motion.div>
            ) }

            { isAnswered && !isRevealing && choiceData && (
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
                        { choiceData.metricImpact.ci !== undefined && (
                            <div>
                                <span style={ { display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' } }>Insolvência (Cᵢ)</span>
                                <span style={ { fontSize: '1rem', fontWeight: 800, color: Number( choiceData.metricImpact.ci ) < 1 ? 'var(--accent-danger)' : 'var(--accent-emerald)' } }>
                                    { choiceData.metricImpact.ci }x
                                </span>
                            </div>
                        ) }
                    </div>
                </motion.div>
            ) }
        </motion.div>
    );
}

export default function IcmQuizVisceral() {
    const [scenarios, setScenarios] = useState<Scenario[]>( [] );
    const [currentStep, setCurrentStep] = useState<number>( 0 );
    const [answers, setAnswers] = useState<Record<number, string>>( {} );
    const [isRevealing, setIsRevealing] = useState<boolean>( false );

    useEffect( () => {
        let isMounted = true;

        fetchVisceralScenarios()
            .then( ( data: Scenario[] ) => {
                if ( isMounted ) {
                    setScenarios( data.length > 0 ? data : FALLBACK_SCENARIOS );
                }
            } )
            .catch( ( error: unknown ) => {
                console.warn( "[Quiz] Falha ao sincronizar cenarios:", error instanceof Error ? error.message : String( error ) );
                if ( isMounted ) setScenarios( FALLBACK_SCENARIOS );
            } );

        return () => { isMounted = false; };
    }, [] );

    if ( scenarios.length === 0 ) {
        return (
            <div style={ { padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', letterSpacing: '0.05em' } }>
                <p style={ { textTransform: 'uppercase' } }>Sincronizando Módulo Visceral...</p>
                <div style={ { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' } }>
                    <div style={ { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'pulse 1.5s infinite' } } />
                    <div style={ { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'pulse 1.5s infinite 0.2s' } } />
                    <div style={ { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-indigo)', animation: 'pulse 1.5s infinite 0.4s' } } />
                </div>
            </div>
        );
    }

    const isFinished = currentStep === scenarios.length;
    const scenario = scenarios[currentStep];
    const selectedChoice = answers[currentStep] || null;
    const isAnswered = selectedChoice !== null;
    const choiceData = scenario?.choices.find( c => c.id === selectedChoice );

    const handleSelect = ( choiceId: string ) => {
        if ( isAnswered || isRevealing ) return;

        setIsRevealing( true );
        setAnswers( prev => ( { ...prev, [currentStep]: choiceId } ) );
        setTimeout( () => setIsRevealing( false ), 850 ); // Micro-delay SOTA
    };

    return (
        <div style={ { maxWidth: '800px', margin: '3rem auto', padding: '2rem', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' } }>
                <h2 style={ { margin: 0, fontSize: '1.25rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' } }>
                    Teste Prático: Lente de Perspectiva
                </h2>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' } }>
                    { isFinished ? 'Síntese Final' : `Cenário 0${currentStep + 1} de 0${scenarios.length}` }
                </span>
            </div>

            <AnimatePresence mode="wait">
                { isFinished ? (
                    <QuizSynthesis onRestart={ () => { setAnswers( {} ); setCurrentStep( 0 ); setIsRevealing( false ); } } />
                ) : (
                    <ActiveScenarioStep
                        scenario={ scenario }
                        currentStep={ currentStep }
                        selectedChoice={ selectedChoice }
                        isAnswered={ isAnswered }
                        isRevealing={ isRevealing }
                        choiceData={ choiceData }
                        onSelect={ handleSelect }
                    />
                ) }
            </AnimatePresence>

            {/* Navegação SOTA */ }
            { !isFinished && (
                <div style={ { display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' } }>
                    <button onClick={ () => setCurrentStep( prev => Math.max( 0, prev - 1 ) ) } disabled={ currentStep === 0 } style={ { padding: '0.5rem 1rem', background: 'transparent', color: currentStep === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-dim)', border: `1px solid ${currentStep === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '6px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s ease' } }>
                        &larr; Voltar
                    </button>
                    <button onClick={ () => setCurrentStep( prev => prev + 1 ) } disabled={ !isAnswered || isRevealing } style={ { padding: '0.5rem 1.5rem', background: ( isAnswered && !isRevealing ) ? 'var(--accent-indigo)' : 'rgba(99,102,241,0.1)', color: ( isAnswered && !isRevealing ) ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '6px', cursor: ( isAnswered && !isRevealing ) ? 'pointer' : 'not-allowed', fontWeight: 700, transition: 'all 0.2s ease' } }>
                        { currentStep === scenarios.length - 1 ? 'Ver Síntese' : 'Avançar \u2192' }
                    </button>
                </div>
            ) }
        </div>
    );
}
