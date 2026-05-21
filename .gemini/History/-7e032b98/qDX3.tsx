'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * BINDING: [hooks/*, panels/*, ui/*, engine/*, simulator.module.css]
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { calculateFreqDeltas, propagateFrequencies } from './engine/propagation';
import { calculateActionMetrics, calculateBaseFgsErosion, computeQuantumMetrics } from './engine/quantumMetrics';
import type { ChipEvFreqs, StreetChipEvFreqs } from './engine/types';
import { useQuantumEngine } from './hooks/useQuantumEngine';
import { useScenario } from './hooks/useScenario';
import styles from './simulator.module.css';
import { SotaEcosystemProvider } from './SotaContext';
import ScenarioSelector from './ui/ScenarioSelector';
import SimulatorHeader from './ui/SimulatorHeader';
import SimulatorNavigation from './ui/SimulatorNavigation';
import SimulatorTour, { type Step as TourStep } from './ui/SimulatorTour';

// Lazy load para paineis secundarios (performance)
const EquityCalculator = lazy( () => import( './panels/EquityCalculator' ) );
const ComparisonRadar = lazy( () => import( './panels/ComparisonRadar' ) );
const PerspectivePanel = lazy( () => import( './panels/PerspectivePanel' ) );
const PostFlopPanel = lazy( () => import( './panels/PostFlopPanel' ) );
const PmLensPanel = lazy( () => import( './panels/PmLensPanel' ) );
const ReferencialAula12 = lazy( () => import( './ReferencialAula12' ) );
const IcmQuizVisceral = lazy( () => import( './IcmQuizVisceral' ) );
const NashPanel = lazy( () => import( './panels/NashPanel' ) );
const TheoryPanel = lazy( () => import( './panels/TheoryPanel' ) );
const ScenarioStage = lazy( () => import( './panels/ScenarioStage' ) );
const MatchupSelector = lazy( () => import( './panels/MatchupSelector' ) );

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop';
export type HeroPosition = 'IP' | 'SB' | 'BB';

// SOTA: Tooltip Semântico para os Controles Espaciais (Antevisão)
const SimControlTooltip = ( { title, desc, align = 'center', children }: { title: string, desc: string, align?: 'left' | 'center' | 'right', children: React.ReactNode } ) => {
    const alignClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0'
    };
    return (
        <div className="relative group inline-flex items-center">
            { children }
            <div className={ `absolute bottom-full ${alignClasses[ align ]} mb-2 w-64 sm:w-72 max-w-[85vw] p-3 bg-[#0a0f1c] border border-indigo-500/30 rounded-lg shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-100 pointer-events-none` }>
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">{ title }</p>
                <p className="text-neutral-300 text-[10px] leading-relaxed font-sans">{ desc }</p>
            </div>
        </div>
    );
};

const GuideToolbar = () => (
    <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 border border-white/5 rounded-xl p-3 sm:px-6 shadow-inner mb-6">
        <span style={ { fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-darker)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '0.5rem' } }>Guia do Laboratório:</span>
        <SimControlTooltip align="left" title="Delta (Δ)" desc="Diferença matemática absoluta entre dois estados. Ex: um ΔRP de +8% significa que o agressor sofre 8% a mais de pressão do que o defensor.">
            <span className="cursor-help hover:text-indigo-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-triangle-exclamation text-[0.6rem] opacity-70"></i> Δ Delta</span>
        </SimControlTooltip>
        <SimControlTooltip align="center" title="Pontos Percentuais (p.p.)" desc="Diferença aritmética real entre porcentagens. Se a defesa cai de 50% para 30%, a diferença é de -20 p.p. (queda absoluta), e não de -20%.">
            <span className="cursor-help hover:text-indigo-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-percent text-[0.6rem] opacity-70"></i> p.p.</span>
        </SimControlTooltip>
        <div style={ { width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 0.5rem' } }></div>
        <SimControlTooltip align="center" title="Dashboard Visceral" desc="Painel de Tensão e FGS. Mostra como o 'Dead Money' amortece a pressão estrutural e como o Tempo (Blinds) devora a sua stack.">
            <span className="cursor-help hover:text-teal-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-gauge-high text-[0.6rem] opacity-70"></i> Dashboard Visceral</span>
        </SimControlTooltip>
        <SimControlTooltip align="right" title="Action Panel" desc="Materializa a matemática em botões de Fold/Call/Raise. O Fold não é zero, é o piso dinâmico (Sunk Cost).">
            <span className="cursor-help hover:text-amber-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-gamepad text-[0.6rem] opacity-70"></i> Action Panel</span>
        </SimControlTooltip>
        <SimControlTooltip align="right" title="Painel Nash" desc="O motor GTO distorcido. Exibe as frequências ótimas teóricas para cada rua (Flop/Turn/River) deformadas pela pressão da bolha.">
            <span className="cursor-help hover:text-emerald-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-network-wired text-[0.6rem] opacity-70"></i> Painel Nash</span>
        </SimControlTooltip>
        <SimControlTooltip align="right" title="Painel Teórico" desc="A fundação analítica do Spot. Revela a diluição do SPR, a Matriz de Colisão de Ranges e os vetores de exploração contra os oponentes.">
            <span className="cursor-help hover:text-rose-400 transition-colors" style={ { fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' } }><i className="fa-solid fa-book-journal-whills text-[0.6rem] opacity-70"></i> Painel Teórico</span>
        </SimControlTooltip>
    </div>
);

interface SpatialControlsProps {
    heroPosition: HeroPosition;
    handleHeroPositionChange: ( e: React.ChangeEvent<HTMLSelectElement> ) => void;
    anteSize: number;
    setAnteSize: ( val: number ) => void;
    heroInvested: number;
    setHeroInvested: ( val: number ) => void;
    currentPot: number;
    setCurrentPot: ( val: number ) => void;
    activePlayers: number;
    setActivePlayers: ( val: number ) => void;
}

const SpatialControls = ( {
    heroPosition,
    handleHeroPositionChange,
    anteSize,
    setAnteSize,
    heroInvested,
    setHeroInvested,
    currentPot,
    setCurrentPot,
    activePlayers,
    setActivePlayers
}: SpatialControlsProps ) => {
    const isMultiway = activePlayers > 2;
    const activePlayersLabelColor = isMultiway ? 'var(--accent-danger)' : 'var(--text-darker)';
    const activePlayersColor = isMultiway ? 'var(--accent-danger)' : 'var(--text-bright)';
    const activePlayersBorder = isMultiway ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)';
    const activePlayersWeight = isMultiway ? 700 : 400;

    return (
        <div className="flex flex-wrap items-center gap-6 bg-slate-900/40 border border-white/5 rounded-xl p-4 sm:px-6 shadow-inner mb-6">
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.35rem' } }>
                <SimControlTooltip align="left" title="Ponto Zero (Posição)" desc="Sua desvantagem estrutural inicial. O Big Blind, por exemplo, entra com 1bb de investimento obrigatório, o que afunda violentamente o seu baseline de EV de Fold.">
                    <label htmlFor="ponto-zero" style={ { fontSize: '0.7rem', color: 'var(--text-darker)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Ponto Zero (Perspectiva)</label>
                </SimControlTooltip>
                <select id="ponto-zero" value={ heroPosition } onChange={ handleHeroPositionChange } style={ { background: 'var(--bg-base)', color: 'var(--text-bright)', border: '1px solid var(--border-color)', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' } }>
                    <option value="BB">Big Blind (OOP) [-1 BB]</option>
                    <option value="SB">Small Blind (OOP) [-0.5 BB]</option>
                    <option value="IP">Outras Posições (IP) [0 BB]</option>
                </select>
            </div>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.35rem' } }>
                <SimControlTooltip align="left" title="Custo do Ante" desc="A 'taxa de respiração' da mesa. Um ante alto acelera a erosão do FGS, forçando o alargamento dos ranges de ação para evitar a morte térmica da stack.">
                    <label htmlFor="custo-ante" style={ { fontSize: '0.7rem', color: 'var(--text-darker)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Custo do Ante (% BB)</label>
                </SimControlTooltip>
                <input id="custo-ante" type="number" step="0.5" value={ anteSize } onChange={ e => setAnteSize( Number( e.target.value ) ) } style={ { width: '90px', background: 'var(--bg-base)', color: 'var(--text-bright)', border: '1px solid var(--border-color)', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' } } />
            </div>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.35rem' } }>
                <SimControlTooltip align="right" title="Sunk Cost" desc="Fichas investidas não são mais suas. Elas representam a profundidade do abismo do seu EV de Fold. A dor matemática de desistir da mão é exatamente este valor.">
                    <label htmlFor="sunk-cost" style={ { fontSize: '0.7rem', color: 'var(--text-darker)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Sunk Cost (Investido BB)</label>
                </SimControlTooltip>
                <input id="sunk-cost" type="number" step="0.5" min="0" value={ heroInvested } onChange={ e => setHeroInvested( Number( e.target.value ) ) } style={ { width: '130px', background: 'var(--bg-base)', color: 'var(--text-bright)', border: '1px solid var(--border-color)', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' } } />
            </div>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.35rem' } }>
                <SimControlTooltip align="right" title="Dead Money" desc="A recompensa pela agressão. O oxigênio do torneio. Potes inchados amortecem o Risk Premium e incentivam combates marginais.">
                    <label htmlFor="dead-money" style={ { fontSize: '0.7rem', color: 'var(--text-darker)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Dead Money (Pote Atual)</label>
                </SimControlTooltip>
                <input id="dead-money" type="number" step="0.5" min="0" value={ currentPot } onChange={ e => setCurrentPot( Number( e.target.value ) ) } style={ { width: '130px', background: 'var(--bg-base)', color: 'var(--text-bright)', border: '1px solid var(--border-color)', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' } } />
            </div>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.35rem', justifyContent: 'center' } }>
                <SimControlTooltip align="right" title="Active Players (Entropia x²)" desc="Número de jogadores ativos no pote. Mais de 2 multiplica quadraticamente as Reverse Implied Odds (RIO), destruindo a utilidade das Pot Odds.">
                    <label htmlFor="active-players" style={ { fontSize: '0.7rem', color: activePlayersLabelColor, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, cursor: 'help', transition: 'colors 0.3s' } }>Jogadores Ativos</label>
                </SimControlTooltip>
                <input id="active-players" type="number" step="1" min="2" max="9" value={ activePlayers } onChange={ e => setActivePlayers( Number( e.target.value ) ) } style={ { width: '130px', background: 'var(--bg-base)', color: activePlayersColor, border: activePlayersBorder, padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: activePlayersWeight } } />
            </div>
        </div>
    );
};

function LoadingFallback () {
    return (
        <div style={ {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: 'var(--text-darker)',
            fontSize: '0.75rem',
        } }>
            Carregando...
        </div>
    );
}

function _performTourScrollAndHighlight ( step: TourStep, setTourSpotlight: ( rect: DOMRect | null ) => void ) {
    if ( step.openDetails )
    {
        const detailsEl = document.querySelector( '#anchor-aula12 details' ) as HTMLDetailsElement;
        if ( detailsEl ) detailsEl.open = true;
    }
    setTimeout( () => {
        const el = document.getElementById( step.targetId );
        if ( el )
        {
            setTourSpotlight( el.getBoundingClientRect() );
            el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
            el.classList.add( 'pulse-border' );
        }
    }, 150 );
}

function _createSpotData ( {
    heroUpdatedStack,
    villainUpdatedStack,
    isIp,
    currentPot,
    bfForDash,
    rpForDash,
    quantumPerspectiva,
    isBaseline,
    baseFgsErosion,
    apiQuantumMetrics
}: {
    heroUpdatedStack: number;
    villainUpdatedStack: number;
    isIp: boolean;
    currentPot: number;
    bfForDash: number;
    rpForDash: number;
    quantumPerspectiva: any;
    isBaseline: boolean;
    baseFgsErosion: number;
    apiQuantumMetrics: any;
} ) {
    return {
        heroStack: heroUpdatedStack,
        villainStack: villainUpdatedStack,
        heroRole: isIp ? 'Agressor (IP)' : 'Defensor (OOP)',
        villainRole: isIp ? 'Defensor (OOP)' : 'Agressor (IP)',
        pot: currentPot,
        betSize: currentPot * 0.5,
        bubbleFactor: bfForDash,
        riskPremium: rpForDash,
        chipEv: quantumPerspectiva ? quantumPerspectiva.currentEquityPct : 0,
        fgsProjection: baseFgsErosion,
        fgsHealth: quantumPerspectiva ? quantumPerspectiva.fgsHealth : 1,
        isBaseline,
        apiQuantumMetrics
    };
}

export default function MasterSimulator () {
    const { scenario, setScenario, scenarios } = useScenario();
    const [ isPending, startTransition ] = useTransition();
    const [ aggressionFactor, setAggressionFactor ] = useState( 1 );
    const [ pkoValue, setPkoValue ] = useState( 0 );
    const [ isNearPayjump, setIsNearPayjump ] = useState( false );
    const [ blindsRisingSoon, setBlindsRisingSoon ] = useState( false );
    const [ streetFreqs, setStreetFreqs ] = useState<StreetChipEvFreqs>( scenario.defaultStreetFreqs );
    const [ activeTool, setActiveTool ] = useState<ActiveTool>( 'scenario' );
    const [ sidebarOpen, setSidebarOpen ] = useState( true );
    const [ anteSize, setAnteSize ] = useState<number>( 12.5 );
    const [ heroPosition, setHeroPosition ] = useState<HeroPosition>( 'BB' );
    const [ heroInvested, setHeroInvested ] = useState<number>( 1.125 );
    const [ currentPot, setCurrentPot ] = useState<number>( 2.5 );
    const [ activePlayers, setActivePlayers ] = useState<number>( 2 );
    const [ tourSpotlight, setTourSpotlight ] = useState<DOMRect | null>( null );

    // SOTA: Web Worker gerido pelo ecossistema para Range Nativo (FFI Rust)
    const [ nativeRangeMetric, setNativeRangeMetric ] = useState<{ equity: number; isCalculating: boolean }>( { equity: 50, isCalculating: false } );
    const [ insolvencyMatrixData, setInsolvencyMatrixData ] = useState<any[] | null>( null );
    const [ isCalculatingInsolvency, setIsCalculatingInsolvency ] = useState( false );

    // SOTA: Web Workers persistentes para Erradicar Overhead Térmico
    const equityWorkerRef = useRef<Worker | null>( null );
    const insolvencyWorkerRef = useRef<Worker | null>( null );
    const icmWorkerRef = useRef<Worker | null>( null );
    const icmCallbacks = useRef<Map<string, ( res: any ) => void>>( new Map() );

    // SOTA: Controle de Sincronia Quântica (Nonce)
    const lastInsolvencyIdRef = useRef<number>( 0 );
    const lastEquityIdRef = useRef<number>( 0 );

    useEffect( () => {
        // Inicialização SOTA: Orquestração de Workers Persistentes
        equityWorkerRef.current = new Worker( new URL( './workers/equity.worker.ts', import.meta.url ) );
        insolvencyWorkerRef.current = new Worker( new URL( './workers/insolvency.worker.ts', import.meta.url ) );
        icmWorkerRef.current = new Worker( new URL( './workers/icm.worker.ts', import.meta.url ) );

        equityWorkerRef.current.onmessage = ( e ) => {
            const { equity, error, id } = e.data;
            // SOTA: Descarte de mensagens obsoletas
            if ( id !== undefined && id < lastEquityIdRef.current ) return;

            if ( error )
            {
                console.warn( "[SotaEcosystem] Entropia de Input (WASM):", error );
                setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
            } else
            {
                setNativeRangeMetric( { equity, isCalculating: false } );
            }
        };

        insolvencyWorkerRef.current.onmessage = ( e ) => {
            const { matrix, error, id } = e.data;
            // SOTA: Descarte de mensagens obsoletas (Proteção contra condições de corrida)
            if ( id !== undefined && id < lastInsolvencyIdRef.current )
            {
                return;
            }

            if ( !error && Array.isArray( matrix ) )
            {
                // SOTA: Blindagem contra entropia de serialização (snake_case vs camelCase)
                // O motor Rust/WASM pode retornar snake_case. A UI espera camelCase.
                const transformedMatrix = matrix.map( cell => ( {
                    combo: cell.combo,
                    pureEv: cell.pure_ev ?? cell.pureEv, // Fallback para ambos os casos
                    insolvencyDelta: cell.insolvency_delta ?? cell.insolvencyDelta,
                    isPair: cell.is_pair ?? cell.isPair,
                    isSuited: cell.is_suited ?? cell.isSuited,
                } ) );
                setInsolvencyMatrixData( transformedMatrix );
            }
            setIsCalculatingInsolvency( false );
        };

        icmWorkerRef.current.onmessage = ( e: MessageEvent ) => {
            const { result, id, error } = e.data;
            const cb = icmCallbacks.current.get( id );
            if ( cb )
            {
                cb( result || { error } );
                icmCallbacks.current.delete( id );
            }
        };

        return () => {
            equityWorkerRef.current?.terminate();
            insolvencyWorkerRef.current?.terminate();
            icmWorkerRef.current?.terminate();
        };
    }, [] );

    const dispatchNativeEquity = useCallback( ( heroRange: string, villainRange: string, board: string ) => {
        if ( !equityWorkerRef.current ) return;
        const id = ++lastEquityIdRef.current;
        setNativeRangeMetric( prev => ( { ...prev, isCalculating: true } ) );
        equityWorkerRef.current.postMessage( { heroRange, villainRange, board, id } );
    }, [] );

    const setManualEquity = useCallback( ( val: number ) => {
        setNativeRangeMetric( prev => ( { ...prev, equity: val } ) );
    }, [] );

    const dispatchInsolvencyMatrix = useCallback( ( villainRange: string, board: string, rpFactor: number, heroInvested: number, currentPot: number, activePlayers: number ) => {
        if ( !insolvencyWorkerRef.current ) return;
        const id = ++lastInsolvencyIdRef.current;
        setIsCalculatingInsolvency( true );
        insolvencyWorkerRef.current.postMessage( { villainRange, board, rpFactor, heroInvested, currentPot, activePlayers, id } );
    }, [] );

    const dispatchIcmPerspectiva = useCallback( ( input: any, onResult: ( res: any ) => void ) => {
        if ( !icmWorkerRef.current ) return;
        const id = Math.random().toString( 36 ).substring( 7 );
        icmCallbacks.current.set( id, onResult );
        icmWorkerRef.current.postMessage( { input, id } );
    }, [] );

    // SOTA: Render Shield para Injeção de Dependências.
    // Impede o recálculo catastrófico do Motor Quântico durante mutações de UI (ex: sidebarOpen).
    const quantumConfig = useMemo( () => ( {
        scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp: heroPosition === 'IP', anteSize, heroInvestedBb: heroInvested, currentPotBb: currentPot, activePlayers
    } ), [ scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroPosition, anteSize, heroInvested, currentPot, activePlayers ] );

    // --- MOTOR DE PROPAGACAO MATEMATICA E DISTORCAO ICM SOTA ---
    const {
        effectiveIpRp, effectiveOopRp, rpSource,
        effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva
    } = useQuantumEngine( quantumConfig );


    // SOTA: Isolamento de Cenarios Base (ChipEV / Vácuo)
    const isBaseline = scenario.category === 'baseline' || scenario.prizes.length <= 1;

    const isIp = heroPosition === 'IP';
    // SOTA: Fricção Zero (Erradicação de Entropia RP). Zera o RP matematicamente se for baseline.
    const finalIpRp = isBaseline ? 0 : effectiveIpRp;
    const finalOopRp = isBaseline ? 0 : effectiveOopRp;

    // --- DADOS SOTA V2 PARA O DASHBOARD VISCERAL ---
    // O Motor Auditado gera o RP. Revertemos a equacao (RP = (BF-1)/BF) para obter o Bubble Factor exato.
    const rpForDash = isIp ? finalIpRp : finalOopRp;
    const bfForDash = rpForDash >= 100 ? 999 : 1 / ( 1 - ( rpForDash / 100 ) );

    // SOTA: Calculo do Estado Real Pós-Investimento (Antevisão Espacial)
    const totalTableChips = useMemo( () => scenario.stacks.reduce( ( acc, val ) => acc + val, 0 ), [ scenario.stacks ] );
    const heroRawStack = scenario.stacks[ isIp ? 0 : 1 ] || 40;
    const villainRawStack = scenario.stacks[ isIp ? 1 : 0 ] || 55;
    const villainInvested = Math.max( 0, currentPot - heroInvested );
    const heroUpdatedStack = Math.max( 0, heroRawStack - heroInvested );
    const villainUpdatedStack = Math.max( 0, villainRawStack - villainInvested );

    // SOTA: Matemática Quântica nativa no cliente (Fricção Zero Absoluta).
    // Erradica a dependência do backend Python e resolve o ERR_CONNECTION_REFUSED instantaneamente.
    const apiQuantumMetrics = useMemo( () => (
        quantumPerspectiva ? computeQuantumMetrics( quantumPerspectiva, activePlayers, heroInvested, currentPot, scenario.stacks, heroRawStack, totalTableChips ) : null
    ), [ quantumPerspectiva, activePlayers, heroInvested, currentPot, scenario.stacks, heroRawStack, totalTableChips ] );

    // SOTA: Centralização termodinâmica para erradicar complexidade ciclomática (Lei de Shannon)
    const baseFgsErosion = useMemo(
        () => calculateBaseFgsErosion( quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition, heroRawStack, totalTableChips ),
        [ quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition, heroRawStack, totalTableChips ]
    );

    const spotData = useMemo( () => _createSpotData( { heroUpdatedStack, villainUpdatedStack, isIp, currentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics } ),
        [ heroUpdatedStack, villainUpdatedStack, isIp, currentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics ] );

    const actionMetrics = useMemo( () => {
        return calculateActionMetrics( { heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers, totalTableChips } );
    }, [ heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers, totalTableChips ] );

    const handleScenarioSelect = useCallback( ( id: string ) => {
        startTransition( () => {
            setScenario( id );
            setActiveTool( 'scenario' );
            setAggressionFactor( 1 );
            setPkoValue( 0 );
            setIsNearPayjump( false );
            setBlindsRisingSoon( false );
            const next = scenarios.find( s => s.id === id );
            if ( next ) setStreetFreqs( next.defaultStreetFreqs );
        } );
    }, [ setScenario, scenarios ] );

    const handleStreetFreqChange = useCallback( ( street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs ) => {
        setStreetFreqs( ( prev: StreetChipEvFreqs ) => {
            const { deltas, hasChange } = calculateFreqDeltas( prev[ street ], freqs );
            if ( !hasChange ) return { ...prev, [ street ]: freqs };
            const next = propagateFrequencies( prev, street, deltas );
            next[ street ] = { ...freqs };

            return next;
        } );
    }, [] );


    const handleTourStep = useCallback( ( step: TourStep ) => {
        if ( step.id === 's-0' ) handleScenarioSelect( 'tg-7' );
        _performTourScrollAndHighlight( step, setTourSpotlight );
    }, [ handleScenarioSelect ] );

    const handleHeroPositionChange = useCallback( ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        const pos = e.target.value as HeroPosition;
        setHeroPosition( pos );
        const anteBb = anteSize / 100;
        let newInvested = anteBb;
        if ( pos === 'BB' ) newInvested += 1;
        else if ( pos === 'SB' ) newInvested += 0.5;
        setHeroInvested( newInvested );
    }, [ anteSize ] );

    const closeTour = useCallback( () => {
        setTourSpotlight( null );
        document.querySelectorAll( '.pulse-border' ).forEach( el => el.classList.remove( 'pulse-border' ) );
    }, [] );

    const spotContextValue = useMemo( () => {
        const pot = spotData.pot;
        const sunkCost = Math.abs( actionMetrics.fold.chipEv );
        const potOddsPct = ( pot + sunkCost ) > 0 ? ( pot / ( pot + sunkCost ) ) * 100 : 33;
        return {
            spotData,
            actionMetrics,
            effectiveIpRp: finalIpRp,
            effectiveOopRp: finalOopRp,
            potOddsPct,
            activePlayers,
            heroInvested
        };
    }, [ spotData, actionMetrics, finalIpRp, finalOopRp, activePlayers, heroInvested ] );

    const metricsContextValue = useMemo( () => ( {
        quantumPerspectiva,
        apiQuantumMetrics
    } ), [ quantumPerspectiva, apiQuantumMetrics ] );

    // SOTA: Divisão de Contextos para Estabilidade Termodinâmica
    const wasmActionsValue = useMemo( () => ( {
        dispatchNativeEquity,
        setManualEquity,
        dispatchIcmPerspectiva,
        dispatchInsolvencyMatrix
    } ), [ dispatchNativeEquity, setManualEquity, dispatchIcmPerspectiva, dispatchInsolvencyMatrix ] );

    const wasmStateValue = useMemo( () => ( {
        nativeRangeMetric,
        insolvencyMatrixData,
        isCalculatingInsolvency,
    } ), [ nativeRangeMetric, insolvencyMatrixData, isCalculatingInsolvency ] );

    const toolContents: Record<ActiveTool, React.ReactNode> = {
        scenario: (
            <Suspense fallback={ <LoadingFallback /> }>
                <ScenarioStage scenario={ scenario } />
                <GuideToolbar />
                <SpatialControls
                    heroPosition={ heroPosition } handleHeroPositionChange={ handleHeroPositionChange }
                    anteSize={ anteSize } setAnteSize={ setAnteSize }
                    heroInvested={ heroInvested } setHeroInvested={ setHeroInvested }
                    currentPot={ currentPot } setCurrentPot={ setCurrentPot }
                    activePlayers={ activePlayers } setActivePlayers={ setActivePlayers }
                />
                { nashFlop && nashTurn && nashRiver && streetRps && (
                    <NashPanel
                        nashFlop={ nashFlop } nashTurn={ nashTurn } nashRiver={ nashRiver }
                        streetFreqs={ streetFreqs } streetRps={ streetRps }
                        aggressionFactor={ aggressionFactor } pkoValue={ pkoValue }
                        isNearPayjump={ isNearPayjump } blindsRisingSoon={ blindsRisingSoon }
                        isBaseline={ isBaseline }
                        onStreetFreqChange={ handleStreetFreqChange }
                        onAggressionChange={ setAggressionFactor }
                        onPkoChange={ setPkoValue }
                        onPayjumpToggle={ setIsNearPayjump }
                        onBlindsToggle={ setBlindsRisingSoon }
                    />
                ) }
                <TheoryPanel
                    scenario={ scenario }
                    effectiveSprData={ effectiveSprData }
                    effectiveIpRp={ finalIpRp }
                    effectiveOopRp={ finalOopRp }
                />
            </Suspense>
        ),
        calculator: <Suspense fallback={ <LoadingFallback /> }><EquityCalculator /></Suspense>,
        matchup: <Suspense fallback={ <LoadingFallback /> }><MatchupSelector /></Suspense>,
        comparar: <Suspense fallback={ <LoadingFallback /> }><ComparisonRadar scenarios={ scenarios } currentId={ scenario.id } nashFlop={ nashFlop } /></Suspense>,
        perspectiva: <Suspense fallback={ <LoadingFallback /> }><PerspectivePanel initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } anteSize={ anteSize } heroInvestedBb={ heroInvested } currentPotBb={ currentPot } /></Suspense>,
        posflop: <Suspense fallback={ <LoadingFallback /> }><PostFlopPanel anteSize={ anteSize } /></Suspense>
    };

    const activeToolContent = toolContents[ activeTool ] || null;

    return (
        <SotaEcosystemProvider
            spotContextValue={ spotContextValue }
            metricsContextValue={ metricsContextValue }
            wasmActionsValue={ wasmActionsValue }
            wasmStateValue={ wasmStateValue }
        >
            <div className={ styles.simRoot }>
                { tourSpotlight && (
                    <div className="tour-spotlight" style={ {
                        top: tourSpotlight.top - 8,
                        left: tourSpotlight.left - 8,
                        width: tourSpotlight.width + 16,
                        height: tourSpotlight.height + 16,
                    } } />
                ) }

                <SimulatorHeader
                    scenarioName={ ( scenario.name?.includes( 'B20' ) || scenario.id?.includes( 'b20' ) ) ? 'Ancoragem Forçada: Block Bet (20%)' : scenario.name }
                    stacks={ scenario.stacks }
                    effectiveIpRp={ finalIpRp }
                    effectiveOopRp={ finalOopRp }
                    rpSource={ rpSource }
                    sidebarOpen={ sidebarOpen }
                    onToggleSidebar={ () => setSidebarOpen( !sidebarOpen ) }
                />

                <SectionHeader step="01" label="Referencial" title="Âncora Empírica (Aula 1.2)" description="Dados que fundamentam o motor." />
                <Suspense fallback={ <LoadingFallback /> }>
                    <ReferencialAula12 />
                </Suspense>

                <SectionHeader step="02" label="Framework" title="Lente de Perspectiva Matemática" description="A decomposição do spot através do ecossistema da mesa." />
                <Suspense fallback={ <LoadingFallback /> }>
                    <div style={ { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' } }>
                        <PmLensPanel anteSize={ anteSize } heroInvested={ heroInvested } currentPot={ currentPot } activePlayers={ activePlayers } heroPosition={ heroPosition } blindsRisingSoon={ blindsRisingSoon } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } />
                        <IcmQuizVisceral />
                    </div>
                </Suspense>

                <SectionHeader step="03" label="Laboratório" title="Motor ICM de Distorções" description="Explore as refrações dinâmicas de equilíbrio GTO." />

                <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem', display: 'grid', gridTemplateColumns: sidebarOpen ? 'minmax(280px, 320px) 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' } }>
                    { sidebarOpen && (
                        <aside style={ { position: 'sticky', top: '1rem' } }>
                            <ScenarioSelector scenarios={ scenarios } activeId={ scenario.id } onSelect={ handleScenarioSelect } />
                        </aside>
                    ) }

                    <main style={ { display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, opacity: isPending ? 0.6 : 1, pointerEvents: isPending ? 'none' : 'auto', transition: 'opacity 0.2s ease-in-out' } }>
                        {/* MENU DE NAVEGACAO SOTA DESACOPLADO */ }
                        <SimulatorNavigation activeTool={ activeTool } onSelectTool={ setActiveTool } />

                        { activeToolContent }
                    </main>
                </div>

                <footer className={ styles.footer }>
                    <div className={ styles.headerWrapper } style={ { padding: '2rem 1.5rem' } }>
                        <p style={ { fontSize: '0.65rem', color: 'var(--text-darker)', fontWeight: 700, textTransform: 'uppercase', margin: 0 } }>Motor SOTA v4.1 · Raphael Vitoi</p>
                    </div>
                </footer>

                <SimulatorTour onStepAction={ handleTourStep } onClose={ closeTour } />
            </div>
        </SotaEcosystemProvider>
    );
}
