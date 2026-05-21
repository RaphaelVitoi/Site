'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * BINDING: [hooks/*, panels/*, ui/*, engine/*, simulator.module.css]
 */

import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from '@/components/simulator/SotaContext';
import { calculateActionMetrics, calculateBaseFgsErosion, createSpotData, performTourScrollAndHighlight } from '@/components/simulator/engine/utils';
import { useFrequencyPropagation } from '@/components/simulator/hooks/useFrequencyPropagation';
import { useQuantumEngine } from '@/components/simulator/hooks/useQuantumEngine';
import { useScenario } from '@/components/simulator/hooks/useScenario';
import { useSimulatorState } from '@/components/simulator/hooks/useSimulatorState';
import { GuideToolbar } from '@/components/simulator/ui/GuideToolbar';
import { NashDistortionViz } from '@/components/simulator/ui/NashDistortionViz';
import ScenarioSelector from '@/components/simulator/ui/ScenarioSelector';
import { SpatialControls } from '@/components/simulator/ui/SpatialControls';
import type { HeroPosition } from '@/components/simulator/engine/types';
import SimulatorHeader from '@/components/simulator/ui/SimulatorHeader';
import SimulatorNavigation from '@/components/simulator/ui/SimulatorNavigation';
import SimulatorTour, { type Step as TourStep } from '@/components/simulator/ui/SimulatorTour';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { downloadHRCJson, generateHRCJson } from '@/lib/hrcExport';
import { computeQuantumMetrics } from '@/lib/perspectiva';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import useSWR from 'swr';
import { InsolvencyMatrix } from './InsolvencyMatrix';

// SOTA: next/dynamic com ssr: false blinda o ecossistema. Erradica o loop de recompilação do Turbopack
// na troca de rotas e previne Hydration Mismatch em componentes baseados em Workers/WASM.
const EquityCalculator = dynamic( () => import( '@/components/simulator/panels/EquityCalculator' ), { ssr: false } );
const ComparisonRadar = dynamic( () => import( '@/components/simulator/panels/ComparisonRadar' ), { ssr: false } );
const PerspectivePanel = dynamic( () => import( '@/components/simulator/panels/PerspectivePanel' ), { ssr: false } );
const PostFlopPanel = dynamic( () => import( '@/components/simulator/panels/PostFlopPanel' ), { ssr: false } );
const PmLensPanel = dynamic( () => import( '@/components/simulator/panels/PmLensPanel' ), { ssr: false } );
const ReferencialAula12 = dynamic( () => import( '@/components/simulator/ReferencialAula12' ), { ssr: false } );
const SimulatorQuizWidget = dynamic( () => import( '@/components/quiz/SimulatorQuizWidget' ).then( m => m.SimulatorQuizWidget ), { ssr: false } );
const NashPanel = dynamic( () => import( '@/components/simulator/panels/NashPanel' ), { ssr: false } );
const TheoryPanel = dynamic( () => import( '@/components/simulator/panels/TheoryPanel' ), { ssr: false } );
const ScenarioStage = dynamic( () => import( '@/components/simulator/panels/ScenarioStage' ), { ssr: false } );
const MatchupSelector = dynamic( () => import( '@/components/simulator/panels/MatchupSelector' ), { ssr: false } );
const RangeMatrix = dynamic( () => import( '@/components/simulator/panels/RangeMatrix' ), { ssr: false } );
const CfrRegretPanel = dynamic( () => import( '@/components/simulator/panels/CfrRegretPanel' ), { ssr: false } );

const fetcher = (url: string) => fetch(url).then(res => res.json());

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop' | 'cfr';

function LoadingFallback ()
{
    return (
        <div className="flex items-center justify-center p-12 text-text-darker text-xs font-bold uppercase tracking-widest animate-pulse">
            Carregando...
        </div>
    );
}

export default function MasterSimulator ()
{
    const { scenario, setScenario, scenarios } = useScenario();
    const [ isPending, startTransition ] = useTransition();

    // SOTA: Ingestão passiva e assíncrona do Perfil Preditivo CFR
    const { data: predictiveData } = useSWR('/api/predictive-profile', fetcher, { revalidateOnFocus: false });

    // SOTA v4.2: Estado Modularizado
    const {
        aggressionFactor, setAggressionFactor,
        pkoValue, setPkoValue,
        isNearPayjump, setIsNearPayjump,
        blindsRisingSoon, setBlindsRisingSoon,
        streetFreqs, setStreetFreqs,
        activeTool, setActiveTool,
        sidebarOpen, setSidebarOpen,
        anteSize,
        heroPosition, setHeroPosition,
        heroInvested, setHeroInvested,
        currentPot, setCurrentPot,
        activePlayers, setActivePlayers,
        isPredictive, setIsPredictive,
        resetState
    } = useSimulatorState(scenario);

    // SOTA v4.2: Lógica de Propagação Extraída
    const { handleStreetFreqChange } = useFrequencyPropagation(setStreetFreqs);

    const [ tourSpotlight, setTourSpotlight ] = useState<DOMRect | null>( null );
    const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>( null );

    const tourSpotlightProps = useMemo( () => {
        if ( !tourSpotlight ) return { style: {} };
        return {
            style: {
                top: tourSpotlight.top - 8,
                left: tourSpotlight.left - 8,
                width: tourSpotlight.width + 16,
                height: tourSpotlight.height + 16,
            }
        };
    }, [ tourSpotlight ] );

    // SOTA: Travas matemáticas estritas contra divisão por zero e colapso de estado
    const safeCurrentPot = Math.max( 0.1, currentPot );
    const safeHeroInvested = Math.max( 0, heroInvested );
    const safeActivePlayers = Math.max( 2, activePlayers );

    // SOTA: Web Worker gerido pelo ecossistema para Range Nativo (FFI Rust)
    const [ nativeRangeMetric, setNativeRangeMetric ] = useState<{ equity: number; isCalculating: boolean; }>( { equity: 50, isCalculating: false } );

    const equityWorkerRef = useRef<Worker | null>( null );

    useEffect( () =>
    {
        const worker = new Worker( new URL( './workers/equity.worker.ts', import.meta.url ) );

        worker.onmessage = ( e: MessageEvent ) =>
        {
            if ( e.data.error )
            {
                console.warn( "[SotaEcosystem] Entropia de Input (WASM):", e.data.error );
                alert( `[Falha Quântica] ${ e.data.error }` );
                setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
            } else
            {
                setNativeRangeMetric( { equity: e.data.equity, isCalculating: false } );
            }
        };

        worker.onerror = ( error: ErrorEvent ) =>
        {
            console.error( "[SotaEcosystem] Falha catastrófica no motor WASM (Rust):", error );
            setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
        };

        equityWorkerRef.current = worker;
        return () => worker.terminate();
    }, [] );

    // SOTA: Render Shield para Injeção de Dependências.
    // Impede o recálculo catastrófico do Motor Quântico durante mutações de UI (ex: sidebarOpen).
    const quantumConfig = useMemo( () => ( {
        scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp: heroPosition === 'IP', heroPosition, anteSize, heroInvestedBb: safeHeroInvested, currentPotBb: safeCurrentPot, activePlayers: safeActivePlayers, isPredictive
    } ), [ scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroPosition, anteSize, safeHeroInvested, safeCurrentPot, safeActivePlayers, isPredictive ] );

    const deferredQuantumConfig = useDeferredValue( quantumConfig );

    // --- MOTOR DE PROPAGACAO MATEMATICA E DISTORCAO ICM SOTA ---
    const {
        effectiveIpRp, effectiveOopRp, rpSource,
        effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva,
        insolvencyMatrixData, isCalculatingInsolvency, nashResults,
        dispatchInsolvencyMatrix, dispatchIcmDistortion
    } = useQuantumEngine( deferredQuantumConfig );

    // SOTA: Matemática Quântica nativa no cliente (Fricção Zero Absoluta).
    // Erradica a dependência do backend Python e resolve o ERR_CONNECTION_REFUSED instantaneamente.
    const apiQuantumMetrics = useMemo( () => (
        quantumPerspectiva ? computeQuantumMetrics( quantumPerspectiva, safeActivePlayers, safeHeroInvested, safeCurrentPot, scenario.stacks ) : null
    ), [ quantumPerspectiva, safeActivePlayers, safeHeroInvested, safeCurrentPot, scenario.stacks ] );

    // SOTA: Isolamento de Cenarios Base (ChipEV / Vácuo)
    const isBaseline = scenario.category === 'baseline' || !scenario.prizes || scenario.prizes.length <= 1;

    const isIp = heroPosition === 'IP';
    // SOTA: Fricção Zero (Erradicação de Entropia RP). Zera o RP matematicamente se for baseline.
    const finalIpRp = isBaseline ? 0 : effectiveIpRp;
    const finalOopRp = isBaseline ? 0 : effectiveOopRp;

    // --- DADOS SOTA V2 PARA O DASHBOARD VISCERAL ---
    // O Motor Auditado gera o RP. Revertemos a equacao (RP = (BF-1)/BF) para obter o Bubble Factor exato.
    const rpForDash = isIp ? finalIpRp : finalOopRp;
    const bfForDash = rpForDash >= 100 ? 999 : 1 / ( 1 - ( rpForDash / 100 ) );

    // SOTA: Calculo do Estado Real Pós-Investimento (Antevisão Espacial)
    const heroRawStack = scenario.stacks[ isIp ? 0 : 1 ] || 40;
    const villainRawStack = scenario.stacks[ isIp ? 1 : 0 ] || 55;
    const villainInvested = Math.max( 0, safeCurrentPot - safeHeroInvested );
    const heroUpdatedStack = Math.max( 0, heroRawStack - safeHeroInvested );
    const villainUpdatedStack = Math.max( 0, villainRawStack - villainInvested );

    // SOTA: Centralização termodinâmica para erradicar complexidade ciclomática (Lei de Shannon)
    const baseFgsErosion = useMemo(
        () => calculateBaseFgsErosion( quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition ),
        [ quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition ]
    );

    const spotData = useMemo( () => createSpotData( {
        heroUpdatedStack,
        villainUpdatedStack,
        isIp,
        currentPot: safeCurrentPot,
        bfForDash,
        rpForDash,
        quantumPerspectiva,
        isBaseline,
        baseFgsErosion,
        apiQuantumMetrics,
        street: 'PRE',
        board: '',
        heroRange: 'Any Two',
        villainRange: 'Any Two'
    } ), [ heroUpdatedStack, villainUpdatedStack, isIp, safeCurrentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics ] );

    const actionMetrics = useMemo( () =>
    {
        return calculateActionMetrics( { heroInvested: safeHeroInvested, currentPot: safeCurrentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers: safeActivePlayers } );
    }, [ safeHeroInvested, safeCurrentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, safeActivePlayers ] );

    const handleScenarioSelect = useCallback( ( id: string ) =>
    {
        startTransition( () =>
        {
            setScenario( id );
            const next = scenarios.find( ( s: any ) => s.id === id );
            if ( next ) resetState(next);
        } );
    }, [ setScenario, scenarios, resetState ] );


    useEffect( () => {
        return () => { if ( tourTimerRef.current ) clearTimeout( tourTimerRef.current ); };
    }, [] );

    const handleTourStep = useCallback( ( step: TourStep ) =>
    {
        if ( step.id === 's-0' ) handleScenarioSelect( 'tg-7' );

        if ( tourTimerRef.current ) clearTimeout( tourTimerRef.current );
        tourTimerRef.current = performTourScrollAndHighlight( step, setTourSpotlight );
    }, [ handleScenarioSelect ] );

    const handleExportHRC = useCallback( () =>
    {
        if ( !scenario?.stacks ) return;
        const players = scenario.stacks.map( ( stack: number, i: number ) => ( {
            id: String( i + 1 ),
            name: `Jogador ${ i + 1 }`,
            stack
        } ) );
        // SOTA: Preserva fallback da baseline de premiações 9-handed se não houver ICM estrito.
        const prizes = ( scenario.prizes?.length > 0 ) ? scenario.prizes : [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];
        const json = generateHRCJson( players, prizes, pkoValue );
        downloadHRCJson( json, `sota_${ scenario.id }_${ players.length }p.json` );
    }, [ scenario, pkoValue ] );

    const handleHeroPositionChange = useCallback( ( e: React.ChangeEvent<HTMLSelectElement> ) =>
    {
        const pos = e.target.value as HeroPosition;
        setHeroPosition( pos );
        const anteBb = anteSize / 100;
        let newInvested = anteBb;
        if ( pos === 'BB' ) newInvested += 1;
        else if ( pos === 'SB' ) newInvested += 0.5;
        setHeroInvested( newInvested );
    }, [ anteSize, setHeroPosition, setHeroInvested ] );

    const closeTour = useCallback( () =>
    {
        if ( tourTimerRef.current ) clearTimeout( tourTimerRef.current );
        setTourSpotlight( null );
        document.querySelectorAll( '.pulse-border' ).forEach( el => el.classList.remove( 'pulse-border' ) );
    }, [] );

    const spotContextValue = useMemo( () =>
    {
        const pot = spotData.pot;
        const sunkCost = Math.abs( actionMetrics.fold.chipEv );
        const potOddsPct = ( pot + sunkCost ) > 0 ? ( sunkCost / ( pot + sunkCost ) ) * 100 : 33;
        return {
            spotData: {
                id: scenario.id,
                name: scenario.name,
                pot: spotData.pot,
                street: spotData.street,
                board: spotData.board,
                heroRange: spotData.heroRange,
                villainRange: spotData.villainRange
            },
            actionMetrics,
            effectiveIpRp: finalIpRp,
            effectiveOopRp: finalOopRp,
            potOddsPct,
            activePlayers: safeActivePlayers,
            heroInvested: safeHeroInvested
        };
    }, [ spotData, actionMetrics, finalIpRp, finalOopRp, safeActivePlayers, safeHeroInvested, scenario.id, scenario.name ] );

    const metricsContextValue = useMemo( () => ( {
        quantumPerspectiva,
        apiQuantumMetrics: apiQuantumMetrics ? {
            rioMw: apiQuantumMetrics.rioMw,
            adjustedEvFold: apiQuantumMetrics.adjustedEvFold,
            esperanca: apiQuantumMetrics.esperanca,
            expectativa: apiQuantumMetrics.expectativa,
            perspectiva: apiQuantumMetrics.perspectiva,
            threshEq: apiQuantumMetrics.threshEq,
            ci: apiQuantumMetrics.ci,
            marginInstability: apiQuantumMetrics.marginInstability,
            isSolvent: apiQuantumMetrics.isSolvent,
            isActionable: apiQuantumMetrics.isActionable
        } : null,
        predictiveProfile: predictiveData?.profile || null
    } ), [ quantumPerspectiva, apiQuantumMetrics, predictiveData ] );

    const wasmContextValue = useMemo( () => ( {
        nativeRangeMetric,
        insolvencyMatrixData,
        isCalculatingInsolvency,
        dispatchInsolvencyMatrix,
        dispatchIcmDistortion,
        nashResults
    } ), [ nativeRangeMetric, insolvencyMatrixData, isCalculatingInsolvency, dispatchInsolvencyMatrix, dispatchIcmDistortion, nashResults ] );

    const activeToolContent = useMemo( () =>
    {
        const toolContents: Record<ActiveTool, React.ReactNode> = {
            scenario: (
                <Suspense fallback={ <LoadingFallback /> }>
                    <ScenarioStage scenario={ scenario } effectiveIpRp={ finalIpRp } effectiveOopRp={ finalOopRp } />
                    <GuideToolbar onExport={ handleExportHRC } />
                    <SpatialControls
                        heroPosition={ heroPosition } handleHeroPositionChange={ handleHeroPositionChange }
                        heroInvested={ heroInvested } setHeroInvested={ setHeroInvested }
                        currentPot={ currentPot } setCurrentPot={ setCurrentPot }
                        activePlayers={ activePlayers } setActivePlayers={ setActivePlayers }
                        isPredictive={ isPredictive } setIsPredictive={ setIsPredictive }
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
                    <div className="mb-12 glass-panel animate-sota-in">
                        <InsolvencyMatrix />
                        { nashResults?.flop && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                <NashDistortionViz streetName="Flop" nashData={ nashResults.flop } />
                                <NashDistortionViz streetName="Turn" nashData={ nashResults.turn } />
                                <NashDistortionViz streetName="River" nashData={ nashResults.river } />
                            </div>
                        ) }
                        <RangeMatrix ipRp={ finalIpRp } oopRp={ finalOopRp } scenarioId={ scenario.id } />
                    </div>
                    <TheoryPanel
                        scenario={ scenario }
                        effectiveSprData={ effectiveSprData }
                        effectiveIpRp={ finalIpRp }
                        effectiveOopRp={ finalOopRp }
                    />
                </Suspense>
            ),
            calculator: <Suspense fallback={ <LoadingFallback /> }><EquityCalculator key={`calc-${scenario.id}`} /></Suspense>,
            matchup: <Suspense fallback={ <LoadingFallback /> }><MatchupSelector key={`match-${scenario.id}`} /></Suspense>,
            comparar: <Suspense fallback={ <LoadingFallback /> }><ComparisonRadar key={`comp-${scenario.id}`} scenarios={ scenarios } currentId={ scenario.id } nashFlop={ nashFlop } /></Suspense>,
            perspectiva: <Suspense fallback={ <LoadingFallback /> }><PerspectivePanel key={`persp-${scenario.id}`} initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } anteSize={ anteSize } heroInvestedBb={ safeHeroInvested } currentPotBb={ safeCurrentPot } initialActivePlayers={ safeActivePlayers } initialPkoValue={ pkoValue } initialIsNearPayjump={ isNearPayjump } initialBlindsRising={ blindsRisingSoon } /></Suspense>,
            posflop: <Suspense fallback={ <LoadingFallback /> }><PostFlopPanel key={`pf-${scenario.id}`} anteSize={ anteSize } scenarioId={ scenario.id } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } heroIsIp={ isIp } activePlayers={ safeActivePlayers } effectiveSprData={ effectiveSprData } pkoValue={ pkoValue } { ...( isIp ? { ipLabel: heroPosition } : { oopLabel: heroPosition } ) } /></Suspense>,
            cfr: <Suspense fallback={ <LoadingFallback /> }><CfrRegretPanel key={`cfr-${scenario.id}`} initialPot={safeCurrentPot} initialStack={Math.min(heroUpdatedStack, villainUpdatedStack)} initialEquity={nativeRangeMetric.equity} /></Suspense>
        };
        return toolContents[ activeTool ] || null;
    }, [ activeTool, scenario, heroPosition, handleHeroPositionChange, heroInvested, setHeroInvested, currentPot, setCurrentPot, activePlayers, setActivePlayers, isPredictive, setIsPredictive, nashFlop, nashTurn, nashRiver, streetRps, streetFreqs, aggressionFactor, pkoValue, isNearPayjump, blindsRisingSoon, isBaseline, handleStreetFreqChange, finalIpRp, finalOopRp, effectiveSprData, scenarios, anteSize, safeHeroInvested, safeCurrentPot, handleExportHRC, nashResults?.flop, nashResults?.turn, nashResults?.river, setAggressionFactor, setPkoValue, setIsNearPayjump, setBlindsRisingSoon, isIp, safeActivePlayers, heroUpdatedStack, villainUpdatedStack, nativeRangeMetric.equity ] );

    return (
        <SotaSpotContext.Provider value={ spotContextValue }>
            <SotaMetricsContext.Provider value={ metricsContextValue }>
                <SotaWasmContext.Provider value={ wasmContextValue }>
                    <div className="min-h-screen bg-bg-base relative">
                        { tourSpotlight && (
                            <div className="tour-spotlight" {...tourSpotlightProps} />
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

                        <section className="sota-container mt-12 mb-16 animate-sota-in">
                            <SectionHeader step="01" label="Referencial" title="Âncora Empírica (Aula 1.2)" description="Dados que fundamentam o motor." />
                            <Suspense fallback={ <LoadingFallback /> }>
                                <ReferencialAula12 />
                            </Suspense>
                        </section>

                        <section className="sota-container mb-16">
                            <SectionHeader step="02" label="Framework" title="Lente de Perspectiva Matemática" description="A decomposição do spot através do ecossistema da mesa." />
                            <Suspense fallback={ <LoadingFallback /> }>
                                <div className="space-y-8 px-4 sm:px-0">
                                    <PmLensPanel key={`pmlens-${scenario.id}`} anteSize={ anteSize } heroInvested={ safeHeroInvested } currentPot={ safeCurrentPot } activePlayers={ safeActivePlayers } heroPosition={ heroPosition } blindsRisingSoon={ blindsRisingSoon } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } pkoValue={ pkoValue } />
                                    <SimulatorQuizWidget simulatorState={ scenario } />
                                </div>
                            </Suspense>
                        </section>

                        <section className="sota-container mb-24">
                            <SectionHeader step="03" label="Laboratório" title="Motor ICM de Distorções" description="Explore as refrações dinâmicas de equilíbrio GTO." />

                            <div className={ `grid gap-8 items-start ${ sidebarOpen ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1' }` }>
                                { sidebarOpen && (
                                    <aside className="lg:sticky lg:top-24">
                                        <ScenarioSelector scenarios={ scenarios } activeId={ scenario.id } onSelect={ handleScenarioSelect } />
                                    </aside>
                                ) }

                                <main className="flex flex-col gap-8 min-w-0 transition-all duration-300">
                                    <SimulatorNavigation activeTool={ activeTool } onSelectTool={ setActiveTool } />
                                    <div className={ `transition-opacity duration-200 ${ isPending ? 'opacity-50' : 'opacity-100' }` }>
                                        { activeToolContent }
                                    </div>
                                </main>
                            </div>
                        </section>

                        <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md relative overflow-hidden mt-12">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-accent-indigo/30 to-transparent" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-accent-indigo/10 blur-[100px] rounded-full pointer-events-none" />

                            <div className="sota-container py-16 px-6 flex flex-col items-center justify-center gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)] group hover:scale-110 hover:border-accent-indigo/40 transition-all duration-500 cursor-default">
                                    <i className="fa-solid fa-microchip text-accent-indigo-light text-xl group-hover:animate-pulse" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[0.7rem] font-black text-white uppercase tracking-[0.3em] m-0">Motor SOTA v4.2</p>
                                    <p className="text-[0.6rem] font-bold text-text-dim uppercase tracking-widest m-0">Desenvolvido por Raphael Vitoi &copy; 2026</p>
                                </div>
                            </div>
                        </footer>

                        <SimulatorTour onStepAction={ handleTourStep } onClose={ closeTour } />
                    </div>
                </SotaWasmContext.Provider>
            </SotaMetricsContext.Provider>
        </SotaSpotContext.Provider>
    );
}
