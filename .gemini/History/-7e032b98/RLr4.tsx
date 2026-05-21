'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * BINDING: [hooks/*, panels/*, ui/*, engine/*, simulator.module.css]
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { calculateFreqDeltas, propagateFrequencies } from './engine/propagation';
import { calculateActionMetrics, calculateBaseFgsErosion, computeQuantumMetrics } from './engine/quantumMetrics';
import type { ChipEvFreqs, StreetChipEvFreqs } from './engine/types';
import { useQuantumEngine } from './hooks/useQuantumEngine';
import { useScenario } from './hooks/useScenario';
import { useSotaWorkers } from './hooks/useSotaWorkers';
import styles from './simulator.module.css';
import { SotaEcosystemProvider } from './SotaContext';
import { GuideToolbar } from './ui/GuideToolbar';
import ScenarioSelector from './ui/ScenarioSelector';
import SimulatorHeader from './ui/SimulatorHeader';
import SimulatorNavigation from './ui/SimulatorNavigation';
import SimulatorTour, { type Step as TourStep } from './ui/SimulatorTour';
import { SpatialControls } from './ui/SpatialControls';

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

    // SOTA: Consumo do Core Neural via Contexto Global (Fricção Zero)
    const {
        dispatchNativeEquity,
        setManualEquity,
        dispatchIcmPerspectiva,
        dispatchInsolvencyMatrix,
        nativeRangeMetric,
        insolvencyMatrixData,
        isCalculatingInsolvency,
        resetInsolvency
    } = useSotaWorkers();

    // SOTA: Limpeza de Cache de Matriz.
    useEffect( () => {
        resetInsolvency();
    }, [ scenario.id, heroPosition, activePlayers, resetInsolvency ] );

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
        const costToCall = Math.abs( actionMetrics.fold.chipEv ); // Sunk Cost é o custo para pagar
        const potOddsPct = ( pot + costToCall ) > 0 ? ( costToCall / ( pot + costToCall ) ) * 100 : 33;
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
