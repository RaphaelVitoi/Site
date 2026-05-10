'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador SOTA v4.2 Gold)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * AESTHETIC: SOTA Gold Standard (Precision Alignment, Visual Hierarchy, Glassmorphism).
 */

import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from '@/components/simulator/SotaContext';
import { useMounted } from '../../hooks/useMounted';
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
// import { TerminalLog } from '@/components/ui/TerminalLog';
import { useLlamaEngine } from '../../hooks/useLlamaEngine';
import { downloadHRCJson, generateHRCJson } from '@/lib/hrcExport';
import { computeQuantumMetrics } from '@/lib/perspectiva';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import useSWR from 'swr';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// SOTA: Dynamic imports with ssr: false for WASM/Worker safety
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
const DashboardSOTA = dynamic( () => import( '@/components/simulator/DashboardSOTA' ), { ssr: false } );

const fetcher = (url: string) => fetch(url).then(res => res.json());

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop' | 'cfr';

function LoadingFallback ()
{
    return (
        <div className="flex items-center justify-center p-16 text-text-darker text-[0.65rem] font-black uppercase tracking-[0.3em] animate-pulse">
            Sincronizando Mente Coletiva...
        </div>
    );
}

export default function MasterSimulator ()
{
    const isMounted = useMounted();
    const { scenario, setScenario, scenarios } = useScenario();
    const [ isPending, startTransition ] = useTransition();

    const { data: predictiveData } = useSWR('/api/predictive-profile', fetcher, { revalidateOnFocus: false });

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

    const { handleStreetFreqChange } = useFrequencyPropagation(setStreetFreqs);
    useLlamaEngine();

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

    const safeCurrentPot = Math.max( 0.1, currentPot );
    const safeHeroInvested = Math.max( 0, heroInvested );
    const safeActivePlayers = Math.max( 2, activePlayers );

    const [ nativeRangeMetric, setNativeRangeMetric ] = useState<{ equity: number; isCalculating: boolean; }>( { equity: 50, isCalculating: false } );
    const equityWorkerRef = useRef<Worker | null>( null );

    useEffect( () =>
    {
        const worker = new Worker( new URL( './workers/equity.worker.ts', import.meta.url ) );
        worker.onmessage = ( e: MessageEvent ) => {
            if ( e.data.error ) {
                console.warn( "[SotaEcosystem] Entropia WASM:", e.data.error );
                setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
            } else {
                setNativeRangeMetric( { equity: e.data.equity, isCalculating: false } );
            }
        };
        equityWorkerRef.current = worker;
        return () => worker.terminate();
    }, [] );

    const quantumConfig = useMemo( () => ( {
        scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp: heroPosition === 'IP', heroPosition, anteSize, heroInvestedBb: safeHeroInvested, currentPotBb: safeCurrentPot, activePlayers: safeActivePlayers, isPredictive
    } ), [ scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroPosition, anteSize, safeHeroInvested, safeCurrentPot, safeActivePlayers, isPredictive ] );

    const deferredQuantumConfig = useDeferredValue( quantumConfig );

    const {
        effectiveIpRp, effectiveOopRp, rpSource,
        effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva,
        insolvencyMatrixData, isCalculatingInsolvency, nashResults,
        dispatchInsolvencyMatrix, dispatchIcmDistortion
    } = useQuantumEngine( deferredQuantumConfig );

    const apiQuantumMetrics = useMemo( () => (
        quantumPerspectiva ? computeQuantumMetrics( quantumPerspectiva, safeActivePlayers, safeHeroInvested, safeCurrentPot, scenario.stacks ) : null
    ), [ quantumPerspectiva, safeActivePlayers, safeHeroInvested, safeCurrentPot, scenario.stacks ] );

    const insolvencyRadarData = useMemo(() => {
        if (!apiQuantumMetrics) return [];
        return [
            { subject: 'Pressão RIO', Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.rioMw * 20)) },
            { subject: 'Piso Dinâmico', Ameaça: Math.min(100, Math.max(0, Math.abs(apiQuantumMetrics.adjustedEvFold) * 30)) },
            { subject: 'Risco FGS', Ameaça: Math.min(100, Math.max(0, 100 - (apiQuantumMetrics.expectativa * 50))) },
            { subject: 'Instabilidade', Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.marginInstability * 100)) },
            { subject: 'Insolvência', Ameaça: apiQuantumMetrics.isSolvent ? 10 : 90 },
            { subject: 'Colapso de EV', Ameaça: Math.min(100, Math.max(0, 100 - (apiQuantumMetrics.esperanca * 50))) }
        ];
    }, [apiQuantumMetrics]);

    const isBaseline = scenario.category === 'baseline' || !scenario.prizes || scenario.prizes.length <= 1;
    const isIp = heroPosition === 'IP';
    const finalIpRp = isBaseline ? 0 : effectiveIpRp;
    const finalOopRp = isBaseline ? 0 : effectiveOopRp;

    const rpForDash = isIp ? finalIpRp : finalOopRp;
    const bfForDash = rpForDash >= 100 ? 999 : 1 / ( 1 - ( rpForDash / 100 ) );

    const heroRawStack = scenario.stacks[ isIp ? 0 : 1 ] || 40;
    const villainRawStack = scenario.stacks[ isIp ? 1 : 0 ] || 55;
    const villainInvested = Math.max( 0, safeCurrentPot - safeHeroInvested );
    const heroUpdatedStack = Math.max( 0, heroRawStack - safeHeroInvested );
    const villainUpdatedStack = Math.max( 0, villainRawStack - villainInvested );

    const baseFgsErosion = useMemo(
        () => calculateBaseFgsErosion( quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition ),
        [ quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition ]
    );

    const spotData = useMemo( () => createSpotData( {
        heroUpdatedStack, villainUpdatedStack, isIp, currentPot: safeCurrentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics, street: 'PRE', board: '', heroRange: 'Any Two', villainRange: 'Any Two'
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

    const handleTourStep = useCallback( ( step: TourStep ) =>
    {
        if ( step.id === 's-0' ) handleScenarioSelect( 'tg-7' );
        if ( tourTimerRef.current ) clearTimeout( tourTimerRef.current );
        tourTimerRef.current = performTourScrollAndHighlight( step, setTourSpotlight );
    }, [ handleScenarioSelect ] );

    const handleExportHRC = useCallback( () =>
    {
        if ( !scenario?.stacks ) return;
        const players = scenario.stacks.map( ( stack: number, i: number ) => ( { id: String( i + 1 ), name: `Jogador ${ i + 1 }`, stack } ) );
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
            spotData: { id: scenario.id, name: scenario.name, pot: spotData.pot, street: spotData.street, board: spotData.board, heroRange: spotData.heroRange, villainRange: spotData.villainRange },
            actionMetrics, effectiveIpRp: finalIpRp, effectiveOopRp: finalOopRp, potOddsPct, activePlayers: safeActivePlayers, heroInvested: safeHeroInvested
        };
    }, [ spotData, actionMetrics, finalIpRp, finalOopRp, safeActivePlayers, safeHeroInvested, scenario.id, scenario.name ] );

    const metricsContextValue = useMemo( () => ( {
        quantumPerspectiva,
        apiQuantumMetrics: apiQuantumMetrics ? {
            rioMw: apiQuantumMetrics.rioMw, adjustedEvFold: apiQuantumMetrics.adjustedEvFold, esperanca: apiQuantumMetrics.esperanca, expectativa: apiQuantumMetrics.expectativa, perspectiva: apiQuantumMetrics.perspectiva, threshEq: apiQuantumMetrics.threshEq, ci: apiQuantumMetrics.ci, marginInstability: apiQuantumMetrics.marginInstability, isSolvent: apiQuantumMetrics.isSolvent, isActionable: apiQuantumMetrics.isActionable
        } : null,
        predictiveProfile: predictiveData?.profile || null
    } ), [ quantumPerspectiva, apiQuantumMetrics, predictiveData ] );

    const wasmContextValue = useMemo( () => ( {
        nativeRangeMetric, insolvencyMatrixData, isCalculatingInsolvency, dispatchInsolvencyMatrix, dispatchIcmDistortion, nashResults
    } ), [ nativeRangeMetric, insolvencyMatrixData, isCalculatingInsolvency, dispatchInsolvencyMatrix, dispatchIcmDistortion, nashResults ] );

    const activeToolContent = useMemo( () =>
    {
        const toolContents: Record<ActiveTool, React.ReactNode> = {
            scenario: (
                <Suspense fallback={ <LoadingFallback /> }>
                    <div className="flex flex-col gap-10">
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

                        <div className="glass-panel p-10 lg:p-14 animate-sota-in border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
                            <div className="bg-slate-950/40 border border-white/5 p-10 rounded-4xl shadow-inner mb-12 relative overflow-hidden group/insolvency">
                                <div className="absolute inset-0 bg-radial-[at_top_right] from-rose-500/5 to-transparent pointer-events-none" />
                                <div className="flex flex-col items-center text-center gap-4 mb-10 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-accent-rose shadow-lg">
                                        <i className="fa-solid fa-radar text-xl animate-pulse"></i>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] m-0">Diagnóstico de Insolvência</h3>
                                        <p className="text-[0.7rem] text-text-muted font-medium uppercase tracking-[0.2em]">Mapeamento vetorial de tensões sistêmicas e colapso de equidade.</p>
                                    </div>
                                </div>

                                <div className="h-112 w-full relative">
                                    {insolvencyRadarData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={insolvencyRadarData}>
                                                <defs>
                                                    <linearGradient id="gradInsolvency" x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-accent-rose)" stopOpacity={0.6}/>
                                                        <stop offset="95%" stopColor="var(--color-accent-rose)" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="Ameaça (%)" dataKey="Ameaça" stroke="var(--color-accent-rose)" strokeWidth={3} fill="url(#gradInsolvency)" fillOpacity={0.4} />
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', padding: '12px' }} itemStyle={{ color: '#fb7185', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }} />
                                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-text-darker text-[0.65rem] font-black uppercase tracking-[0.4em] animate-pulse">
                                            Processando Assinatura Bayesiana...
                                        </div>
                                    )}
                                </div>
                            </div>

                            { nashResults?.flop && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
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
                    </div>
                </Suspense>
            ),
            calculator: <Suspense fallback={ <LoadingFallback /> }><EquityCalculator key={`calc-${scenario.id}`} /></Suspense>,
            matchup: <Suspense fallback={ <LoadingFallback /> }><MatchupSelector key={`match-${scenario.id}`} /></Suspense>,
            comparar: <Suspense fallback={ <LoadingFallback /> }><div className="h-[750px] w-full relative"><ComparisonRadar key={`comp-${scenario.id}`} scenarios={ scenarios } currentId={ scenario.id } nashFlop={ nashFlop } /></div></Suspense>,            perspectiva: <Suspense fallback={ <LoadingFallback /> }><PerspectivePanel key={`persp-${scenario.id}`} initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } anteSize={ anteSize } heroInvestedBb={ safeHeroInvested } currentPotBb={ safeCurrentPot } initialActivePlayers={ safeActivePlayers } initialPkoValue={ pkoValue } initialIsNearPayjump={ isNearPayjump } initialBlindsRising={ blindsRisingSoon } /></Suspense>,
            posflop: <Suspense fallback={ <LoadingFallback /> }><PostFlopPanel key={`pf-${scenario.id}`} anteSize={ anteSize } scenarioId={ scenario.id } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } heroIsIp={ isIp } activePlayers={ safeActivePlayers } effectiveSprData={ effectiveSprData } pkoValue={ pkoValue } { ...( isIp ? { ipLabel: heroPosition } : { oopLabel: heroPosition } ) } /></Suspense>,
            cfr: <Suspense fallback={ <LoadingFallback /> }><div className="min-h-140 w-full relative"><CfrRegretPanel key={`cfr-${scenario.id}`} initialPot={safeCurrentPot} initialStack={Math.min(heroUpdatedStack, villainUpdatedStack)} initialEquity={nativeRangeMetric.equity} /></div></Suspense>
        };
        return toolContents[ activeTool ] || null;
    }, [ activeTool, scenario, heroPosition, handleHeroPositionChange, heroInvested, setHeroInvested, currentPot, setCurrentPot, activePlayers, setActivePlayers, isPredictive, setIsPredictive, nashFlop, nashTurn, nashRiver, streetRps, streetFreqs, aggressionFactor, pkoValue, isNearPayjump, blindsRisingSoon, isBaseline, handleStreetFreqChange, finalIpRp, finalOopRp, effectiveSprData, scenarios, anteSize, safeHeroInvested, safeCurrentPot, handleExportHRC, nashResults?.flop, nashResults?.turn, nashResults?.river, setAggressionFactor, setPkoValue, setIsNearPayjump, setBlindsRisingSoon, isIp, safeActivePlayers, heroUpdatedStack, villainUpdatedStack, nativeRangeMetric.equity, insolvencyRadarData ] );

    if (!isMounted) {
        return <LoadingFallback />;
    }

    return (
        <SotaSpotContext.Provider value={ spotContextValue }>
            <SotaMetricsContext.Provider value={ metricsContextValue }>
                <SotaWasmContext.Provider value={ wasmContextValue }>
                    <div className="min-h-screen bg-bg-base relative overflow-x-hidden">
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

                    <div className="flex flex-col gap-24 pt-20 pb-32">
                        <section className="sota-container animate-sota-in" aria-label="Dashboard Quântico">
                            <div className="max-w-4xl mx-auto mb-16 text-center space-y-6">
                                <SectionHeader step="00" label="Telemetria Sistêmica" title="Dashboard SOTA" description="A sua Assinatura Bayesiana. A Mente Preditiva monitora seus erros de EV e distorções de Nash em tempo real." />
                                <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                            </div>
                            <Suspense fallback={ <LoadingFallback /> }>
                                <DashboardSOTA />
                            </Suspense>
                        </section>

                        <section className="sota-container animate-sota-in" aria-label="Referencial Empírico">
                                <div className="max-w-4xl mx-auto mb-16 text-center space-y-8">
                                    <SectionHeader step="01" label="Referencial" title="Âncora Empírica (Aula 1.2)" description="Dados reais e fundamentos absolutos do motor de simulação." />
                                    <p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
                                        Esta camada estabelece a <strong className="text-text-light uppercase tracking-widest text-xs">Topologia do Torneio</strong>. O motor ingere a estrutura de premiação e os stacks reais da Mesa Final para erguer as fundações matemáticas do cálculo de <em className="text-accent-indigo-light not-italic font-black">Bubble Factor</em> e <em className="text-accent-indigo-light not-italic font-black">Risk Premium</em>. Sem o Referencial, não há perspectiva.
                                    </p>
                                    <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                                </div>
                                <Suspense fallback={ <LoadingFallback /> }>
                                    <ReferencialAula12 />
                                </Suspense>
                            </section>

                        <section className="sota-container" aria-label="Framework de Perspectiva Matemática">
                                <div className="max-w-4xl mx-auto mb-16 text-center space-y-8">
                                    <SectionHeader step="02" label="Framework" title="Lente de Perspectiva Matemática (PM)" description="A decomposição cirúrgica do spot através da lente do ecossistema SOTA." />
                                    <p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
                                        A <strong className="text-text-light uppercase tracking-widest text-xs">Métrica Soberana (PM)</strong> mede a verdadeira utilidade de uma ação, subtraindo o custo irrevogável (Sunk Cost) da expectativa purificada. A lente integra a Realização Posicional (R) e a punição gravitacional (FGS e RIO multiway).
                                    </p>
                                    <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                                </div>
                                <Suspense fallback={ <LoadingFallback /> }>
                                    <div className="space-y-12 px-4 sm:px-0">
                                        <PmLensPanel key={`pmlens-${scenario.id}`} anteSize={ anteSize } heroInvested={ safeHeroInvested } currentPot={ safeCurrentPot } activePlayers={ safeActivePlayers } heroPosition={ heroPosition } blindsRisingSoon={ blindsRisingSoon } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } pkoValue={ pkoValue } />
                                        <SimulatorQuizWidget simulatorState={ scenario } />
                                    </div>
                                </Suspense>
                            </section>

                        <section className="sota-container" aria-label="Laboratório ICM">
                                <div className="max-w-4xl mx-auto mb-20 text-center space-y-8">
                                    <SectionHeader step="03" label="Laboratório" title="Motor ICM de Distorções" description="Explore as refrações dinâmicas de equilíbrio GTO no multiverso de ranges." />
                                    <p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
                                        O orquestrador quântico (WebGPU/WASM) tritura a árvore de jogo em tempo real. Manipule os parâmetros de Agressão, Bounty (PKO) e o Modulador de Entropia (Fator Ψ) para observar como o <em className="text-accent-indigo-light not-italic font-black">Nash Equilibrium</em> se curva.
                                    </p>
                                    <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                                </div>

                                <div className={ `grid gap-12 items-start ${ sidebarOpen ? 'grid-cols-1 lg:grid-cols-[340px_1fr]' : 'grid-cols-1' }` }>
                                    { sidebarOpen && (
                                        <aside className="lg:sticky lg:top-28 z-20">
                                            <ScenarioSelector scenarios={ scenarios } activeId={ scenario.id } onSelect={ handleScenarioSelect } />
                                        </aside>
                                    ) }

                                <main className="flex flex-col gap-12 min-w-0 transition-all duration-500 overflow-visible" role="main" aria-label="Painel de Ferramentas do Simulador">
                                        <SimulatorNavigation activeTool={ activeTool } onSelectTool={ setActiveTool } />
                                        <div className={ `transition-all duration-500 overflow-visible ${ isPending ? 'opacity-40 blur-sm scale-[0.99]' : 'opacity-100 scale-100' }` }>
                                            { activeToolContent }
                                        </div>
                                    </main>
                                </div>
                            </section>
                        </div>

                        <footer className="border-t border-white/5 py-24 relative overflow-hidden bg-bg-deep/50">
                            <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />
                            <div className="sota-container px-6 flex flex-col items-center justify-center gap-10 relative z-10">
                                <div className="text-center space-y-4">
                                    <p className="text-[0.8rem] font-black text-white uppercase tracking-[0.6em] m-0 opacity-90 group-hover:tracking-[0.7em] transition-all duration-1000">Motor SOTA v4.2 Gold</p>
                                    <div className="h-px w-32 bg-linear-to-r from-transparent via-accent-indigo/40 to-transparent mx-auto" />
                                    <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.3em] m-0">Estado da Arte em Teoria de Jogo & Perspectiva Matemárica</p>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em] m-0">© 2026 Raphael Vitoi · Monolito Nexus</p>
                                    <div className="flex gap-6 opacity-30">
                                        <i className="fa-brands fa-instagram text-sm" />
                                        <i className="fa-brands fa-twitch text-sm" />
                                        <i className="fa-brands fa-youtube text-sm" />
                                    </div>
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
