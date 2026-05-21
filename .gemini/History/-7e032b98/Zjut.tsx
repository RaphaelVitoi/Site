'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * BINDING: [hooks/*, panels/*, ui/*, engine/*, simulator.module.css]
 */

import { lazy, Suspense, useCallback, useMemo, useState, useTransition } from 'react';
import { calculateRioTension } from '../../lib/perspectiva';
import { SectionHeader } from '../ui/SectionHeader';
import type { ChipEvFreqs, StreetChipEvFreqs } from './engine/types';
import { useQuantumEngine } from './hooks/useQuantumEngine';
import { useScenario } from './hooks/useScenario';
import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from './SotaContext';
import ScenarioSelector from './ui/ScenarioSelector';
import SimulatorHeader from './ui/SimulatorHeader';
import SimulatorNavigation from './ui/SimulatorNavigation';
import SimulatorTour, { type Step as TourStep } from './ui/SimulatorTour';
import { SotaTooltip } from './ui/SotaTooltip';

// Lazy load para paineis secundarios (performance)
const EquityCalculator = lazy( () => import( './panels/EquityCalculator' ) );
const ComparisonRadar = lazy( () => import( './panels/ComparisonRadar' ) );
const PerspectivePanel = lazy( () => import( './panels/PerspectivePanel' ) );
const PostFlopPanel = lazy( () => import( './panels/PostFlopPanel' ) );
const PmLensPanel = lazy( () => import( './panels/PmLensPanel' ) );
const ReferencialAula12 = lazy( () => import( './ReferencialAula12' ) );
const SimulatorQuizWidget = lazy( () => import( '@/components/quiz/SimulatorQuizWidget' ).then( m => ( { default: m.SimulatorQuizWidget } ) ) );
const NashPanel = lazy( () => import( './panels/NashPanel' ) );
const TheoryPanel = lazy( () => import( './panels/TheoryPanel' ) );
const ScenarioStage = lazy( () => import( './panels/ScenarioStage' ) );
const MatchupSelector = lazy( () => import( './panels/MatchupSelector' ) );

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop';
export type HeroPosition = 'IP' | 'SB' | 'BB';

const GuideToolbar = () => (
    <div className="flex flex-wrap items-center gap-4 bg-bg-panel/40 border border-white/5 rounded-2xl p-4 shadow-inner mb-8 animate-sota-in">
        <span className="text-label mr-2 opacity-50">Guia SOTA:</span>
        <SotaTooltip align="left" title="Delta (Δ)" desc="Diferença matemática absoluta entre dois estados.">
            <span className="text-[0.7rem] font-bold text-text-muted cursor-help hover:text-accent-indigo flex items-center gap-1.5 transition-colors">
                <i className="fa-solid fa-triangle-exclamation text-[0.6rem]"></i> Δ Delta
            </span>
        </SotaTooltip>
        <SotaTooltip align="center" title="Pontos Percentuais (p.p.)" desc="Diferença aritmética real entre porcentagens.">
            <span className="text-[0.7rem] font-bold text-text-muted cursor-help hover:text-accent-indigo flex items-center gap-1.5 transition-colors">
                <i className="fa-solid fa-percent text-[0.6rem]"></i> p.p.
            </span>
        </SotaTooltip>
        <div className="w-px h-4 bg-white/10 mx-2"></div>
        <SotaTooltip align="right" title="Física Sincronizada" desc="A mesa respira em tempo real. Cada ajuste de stack altera a gravidade de todos os simuladores.">
            <span className="text-[0.7rem] font-bold text-accent-emerald flex items-center gap-1.5 uppercase tracking-tighter">
                <span className="animate-pulse">●</span> Quantum Sync Active
            </span>
        </SotaTooltip>
    </div>
);

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
    setActivePlayers,
    isPredictive,
    setIsPredictive
}: Record<string, any> & { activePlayers: number } & { isPredictive: boolean, setIsPredictive: ( v: boolean ) => void } ) => {
    const isMultiway = activePlayers > 2;

    return (
        <div className="glass-panel p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end relative">
            <div className="absolute top-4 right-6 flex items-center gap-2">
                <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">Modo Antevisão</span>
                <button
                    onClick={ () => setIsPredictive( !isPredictive ) }
                    className={ `w-8 h-4 rounded-full transition-all relative ${isPredictive ? 'bg-accent-emerald' : 'bg-bg-deep border border-white/10'}` }
                >
                    <div className={ `absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isPredictive ? 'left-4.5' : 'left-0.5'}` } />
                </button>
            </div>

            <div className="space-y-2">
                <SotaTooltip align="left" title="Ponto Zero" desc="Sua desvantagem estrutural inicial.">
                    <label htmlFor="sim-hero-pos" className="text-label cursor-help hover:text-accent-indigo">Posição (Ponto Zero)</label>
                </SotaTooltip>
                <select
                    id="sim-hero-pos"
                    value={ heroPosition }
                    onChange={ handleHeroPositionChange }
                    className="w-full bg-bg-deep border border-white/5 rounded-lg p-2.5 text-xs font-bold text-text-bright focus:ring-1 focus:ring-accent-indigo"
                >
                    <option value="BB">Big Blind [-1 BB]</option>
                    <option value="SB">Small Blind [-0.5 BB]</option>
                    <option value="IP">Outras Posições [0 BB]</option>
                </select>
            </div>

            <div className="space-y-2">
                <SotaTooltip align="center" title="Investimento" desc="O abismo do seu EV de Fold.">
                    <label htmlFor="sim-hero-invest" className="text-label cursor-help hover:text-accent-indigo">Sunk Cost (Investido)</label>
                </SotaTooltip>
                <div className="relative group">
                    <input
                        id="sim-hero-invest"
                        type="number" step="0.5" value={ heroInvested }
                        onChange={ e => setHeroInvested( Number( e.target.value ) ) }
                        className="w-full bg-bg-deep border border-white/5 rounded-lg p-2.5 text-xs font-mono text-text-bright"
                    />
                    <span className="absolute right-3 top-2.5 text-[0.6rem] text-text-darker font-bold">BB</span>
                </div>
            </div>

            <div className="space-y-2">
                <SotaTooltip align="center" title="Dead Money" desc="O oxigênio do torneio.">
                    <label htmlFor="sim-current-pot" className="text-label cursor-help hover:text-accent-indigo">Pote Atual</label>
                </SotaTooltip>
                <div className="relative">
                    <input
                        id="sim-current-pot"
                        type="number" step="0.5" value={ currentPot }
                        onChange={ e => setCurrentPot( Number( e.target.value ) ) }
                        className="w-full bg-bg-deep border border-white/5 rounded-lg p-2.5 text-xs font-mono text-text-bright"
                    />
                    <span className="absolute right-3 top-2.5 text-[0.6rem] text-text-darker font-bold">BB</span>
                </div>
            </div>

            <div className="space-y-2">
                <SotaTooltip align="right" title="Entropia Multiway" desc="Ações escalam quadraticamente o RIO.">
                    <label htmlFor="sim-active-players" className={ `text-label ${isMultiway ? 'text-accent-danger' : ''}` }>Jogadores</label>
                </SotaTooltip>
                <input
                    id="sim-active-players"
                    type="number" min="2" max="9" value={ activePlayers }
                    onChange={ e => setActivePlayers( Number( e.target.value ) ) }
                    className={ `w-full bg-bg-deep rounded-lg p-2.5 text-xs font-black ${isMultiway ? 'border-accent-danger/40 text-accent-danger' : 'border-white/5 text-text-bright'}` }
                />
            </div>

            <div className="space-y-2">
                <SotaTooltip align="right" title="FGS Control" desc={ isPredictive ? "Cálculo Automático via Motor SOTA." : "Ajuste manual da erosão de stack." }>
                    <label htmlFor="sim-fgs-control" className="text-label">FGS / Erosão</label>
                </SotaTooltip>
                <div className="flex gap-2">
                    <input
                        id="sim-fgs-control"
                        type="range" disabled={ isPredictive }
                        className={ `flex-1 h-1.5 mt-4 rounded-full appearance-none transition-opacity ${isPredictive ? 'opacity-20 cursor-not-allowed' : 'bg-white/10 accent-accent-indigo cursor-pointer'}` }
                    />
                    <span className={ `text-[0.65rem] font-mono font-bold w-10 text-center ${isPredictive ? 'text-accent-emerald' : 'text-text-muted'}` }>
                        { isPredictive ? 'AUTO' : 'MAN' }
                    </span>
                </div>
            </div>
        </div>
    );
};

function LoadingFallback() {
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

// SOTA: Desacoplamento da termodinâmica para erradicar complexidade ciclomática na renderização
function computeQuantumMetrics( quantumPerspectiva: Record<string, any>, activePlayers: number, heroInvested: number, currentPot: number, stacks: number[] ) {
    const eq = quantumPerspectiva.currentEquityPct ?? 0.5;
    const deltaWinPct = quantumPerspectiva.deltaWinPct ?? 0;
    const deltaLosePct = quantumPerspectiva.deltaLosePct ?? 0;
    const evFoldPct = quantumPerspectiva.dynamicEvFold ?? 0;
    const rFactor = quantumPerspectiva.realizationFactor ?? 1;
    const fgsHealth = quantumPerspectiva.fgsHealth ?? 1;
    const deltaHabilidade = 50;
    const sEff = Math.min( stacks[0] ?? 40, stacks[1] ?? 40 ); // SOTA: Auto-healing na inferência de stacks locais
    const k = 0.05;
    const baseRioPct = 0.15;

    const amortizedEdgeMultiplier = 1 + ( ( deltaHabilidade / 100 ) * ( 1 - Math.exp( -k * sEff ) ) );
    const adjustedDeltaWin = deltaWinPct * amortizedEdgeMultiplier;

    const opponents = Math.max( 1, activePlayers - 1 );
    // SOTA: Escalonamento Quadrático (x^2) para Multiway (Morte do Anti-Smoothing)
    const mwFactor = Math.pow( opponents, 2 );
    const baseRio = heroInvested * baseRioPct;
    const rioMw = baseRio * mwFactor;

    // SOTA: O Fold não sofre RIO. O RIO é o passivo estrutural de continuar na mão.
    // Aplicar RIO ao fold invertia a gravidade, mascarando o Pot Entrapment.
    const adjustedEvFold = evFoldPct;

    const esperanca = ( eq * adjustedDeltaWin ) + ( ( 1 - eq ) * deltaLosePct );
    const expectativa = ( eq * adjustedDeltaWin * rFactor * fgsHealth ) + ( ( 1 - eq ) * deltaLosePct );

    // SOTA: Equação de Perspectiva Matemática (Diferencial de Abismo)
    // PM = (Expectativa - RIO) - EV_Fold
    const perspectiva = expectativa - rioMw - evFoldPct;

    const denom = ( adjustedDeltaWin * rFactor * fgsHealth ) - deltaLosePct;
    let threshEq = null;
    // SOTA: A Equidade Limite (Teto) DEVE subir para compensar o passivo do RIO.
    if ( Math.abs( denom ) > 1e-6 ) threshEq = Math.max( 0, Math.min( 1, ( evFoldPct + rioMw - deltaLosePct ) / denom ) );

    let ci = null;
    const potOdds = ( currentPot + heroInvested ) > 0 ? heroInvested / ( currentPot + heroInvested ) : 0;
    if ( threshEq !== null && threshEq > 0 ) ci = potOdds / threshEq;

    return {
        amortizedEdgeMultiplier, rioMw, adjustedEvFold, esperanca, expectativa, perspectiva, threshEq, ci,
        isSolvent: ci !== null && ci >= 1,
        isActionable: perspectiva > 0
    };
}

// SOTA: Entanglement Quântico Verdadeiro (A Árvore Viva) extraído para Fricção Zero
function _applyFrequencyPropagation( sourceDeltas: Partial<ChipEvFreqs>, targetFreqs: ChipEvFreqs, attenuation: number ): ChipEvFreqs {
    const target = { ...targetFreqs };

    // Reação do OOP: Foldar mais no Flop = Range mais FORTE no Turn (Menos Fold, Mais Raise)
    if ( sourceDeltas.oop_fold ) {
        target.oop_fold = Math.max( 0, target.oop_fold - ( sourceDeltas.oop_fold * attenuation * 0.8 ) );
        target.oop_raise = Math.max( 0, target.oop_raise + ( sourceDeltas.oop_fold * attenuation * 0.4 ) );
        target.ip_check = Math.max( 0, target.ip_check + ( sourceDeltas.oop_fold * attenuation * 0.5 ) );
        target.ip_bet_large = Math.max( 0, target.ip_bet_large - ( sourceDeltas.oop_fold * attenuation * 0.5 ) );
    }
    if ( sourceDeltas.oop_raise ) {
        target.oop_raise = Math.max( 0, target.oop_raise - ( sourceDeltas.oop_raise * attenuation * 0.5 ) );
        target.oop_fold = Math.max( 0, target.oop_fold + ( sourceDeltas.oop_raise * attenuation * 0.3 ) );
        target.ip_check = Math.max( 0, target.ip_check + ( sourceDeltas.oop_raise * attenuation * 0.6 ) );
    }

    // Reação do IP: Apostar grande significa polarizar o range (Mais passividade no Turn)
    if ( sourceDeltas.ip_bet_large ) {
        target.ip_bet_large = Math.max( 0, target.ip_bet_large - ( sourceDeltas.ip_bet_large * attenuation * 0.6 ) );
        target.ip_check = Math.max( 0, target.ip_check + ( sourceDeltas.ip_bet_large * attenuation * 0.6 ) );
        target.oop_fold = Math.max( 0, target.oop_fold + ( sourceDeltas.ip_bet_large * attenuation * 0.4 ) );
    }
    if ( sourceDeltas.ip_check ) {
        target.ip_bet_small = Math.max( 0, target.ip_bet_small + ( sourceDeltas.ip_check * attenuation * 0.5 ) );
        target.oop_raise = Math.max( 0, target.oop_raise + ( sourceDeltas.ip_check * attenuation * 0.3 ) );
    }

    // Normalização para preservar o tecido da realidade (100%)
    const ipSum = target.ip_check + target.ip_bet_small + target.ip_bet_large;
    if ( ipSum > 0 ) {
        target.ip_check = ( target.ip_check / ipSum ) * 100;
        target.ip_bet_small = ( target.ip_bet_small / ipSum ) * 100;
        target.ip_bet_large = ( target.ip_bet_large / ipSum ) * 100;
    }

    const oopSum = target.oop_call + target.oop_fold + target.oop_raise;
    if ( oopSum > 0 ) {
        target.oop_call = ( target.oop_call / oopSum ) * 100;
        target.oop_fold = ( target.oop_fold / oopSum ) * 100;
        target.oop_raise = ( target.oop_raise / oopSum ) * 100;
    }

    return target;
}

// SOTA: Isolamento de Funções Puras para Erradicar Complexidade Ciclomática
function _calculateFreqDeltas( oldFreqs: ChipEvFreqs, newFreqs: ChipEvFreqs ): { deltas: Partial<ChipEvFreqs>, hasChange: boolean } {
    const deltas: Partial<ChipEvFreqs> = {};
    let hasChange = false;
    for ( const key of Object.keys( newFreqs ) as Array<keyof ChipEvFreqs> ) {
        const d = newFreqs[key] - oldFreqs[key];
        deltas[key] = d;
        if ( Math.abs( d ) > 0.1 ) hasChange = true;
    }
    return { deltas, hasChange };
}

function _propagateFrequencies( prev: StreetChipEvFreqs, street: keyof StreetChipEvFreqs, deltas: Partial<ChipEvFreqs> ): StreetChipEvFreqs {
    const next = {
        flop: { ...prev.flop },
        turn: { ...prev.turn },
        river: { ...prev.river }
    };

    const propagate = ( targetStreet: keyof StreetChipEvFreqs, attenuation: number ) => {
        next[targetStreet] = _applyFrequencyPropagation( deltas, next[targetStreet], attenuation );
    };

    if ( street === 'flop' ) {
        propagate( 'turn', 0.4 ); // Preditiva Forte
        propagate( 'river', 0.15 ); // Preditiva Difusa
    } else if ( street === 'turn' ) {
        propagate( 'flop', 0.3 ); // Retroativa Forte
        propagate( 'river', 0.35 ); // Preditiva Forte
    } else if ( street === 'river' ) {
        propagate( 'turn', 0.4 ); // Retroativa Forte
        propagate( 'flop', 0.15 ); // Retroativa Difusa
    }
    return next;
}

interface ActionMetricsParams {
    heroInvested: number;
    currentPot: number;
    bfForDash: number;
    rpForDash: number;
    quantumPerspectiva: Record<string, any> | null;
    heroRawStack: number;
    heroPosition: HeroPosition;
    baseFgsErosion: number;
    apiQuantumMetrics?: Record<string, any> | null;
    activePlayers: number;
}

function _calculateActionMetrics( params: ActionMetricsParams ) {
    const { heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers } = params;
    const fallbackFold = quantumPerspectiva ? quantumPerspectiva.dynamicEvFold : -heroInvested * ( 1 + ( rpForDash / 200 ) );
    const foldPerspectiva = apiQuantumMetrics?.adjustedEvFold ?? fallbackFold;
    const fallbackCall = quantumPerspectiva ? quantumPerspectiva.perspectivaPct : ( currentPot * 0.3 );
    const callPerspectiva = apiQuantumMetrics?.perspectiva ?? fallbackCall;
    const callChipEv = quantumPerspectiva ? ( quantumPerspectiva.deltaWinPct * 0.5 + quantumPerspectiva.deltaLosePct * 0.5 ) : currentPot * 0.3;
    const opponents = Math.max( 1, activePlayers - 1 );
    const multiwayMultiplier = Math.pow( opponents, 2 );
    const baseRioLiability = ( quantumPerspectiva ? quantumPerspectiva.rioLiability : rpForDash ) * multiwayMultiplier;
    const posType = heroPosition === 'IP' ? 'IP' : 'OOP';
    let rioTension = 1;
    if ( apiQuantumMetrics?.ci == null || apiQuantumMetrics.ci >= 1 ) rioTension = calculateRioTension( heroInvested, currentPot, heroRawStack, posType, baseRioLiability );
    const raiseTension = calculateRioTension( heroInvested, currentPot, heroRawStack, posType, rpForDash, 0.6 );
    return {
        fold: { chipEv: -heroInvested, perspectiva: foldPerspectiva, fgsImpact: baseFgsErosion, tension: 0 },
        call: { chipEv: callChipEv, perspectiva: callPerspectiva, fgsImpact: baseFgsErosion * 0.5, tension: rioTension },
        raise: { chipEv: currentPot * 0.8, perspectiva: callPerspectiva * bfForDash, fgsImpact: Math.abs( baseFgsErosion ), tension: raiseTension }
    };
}

function _performTourScrollAndHighlight( step: TourStep, setTourSpotlight: ( rect: DOMRect | null ) => void ) {
    if ( step.openDetails ) {
        const detailsEl = document.querySelector( '#anchor-aula12 details' ) as HTMLDetailsElement;
        if ( detailsEl ) detailsEl.open = true;
    }
    setTimeout( () => {
        const el = document.getElementById( step.targetId );
        if ( el ) {
            setTourSpotlight( el.getBoundingClientRect() );
            el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
            el.classList.add( 'pulse-border' );
        }
    }, 150 );
}

function _calculateBaseFgsErosion( quantumPerspectiva: Record<string, any> | null, blindsRisingSoon: boolean, anteSize: number, heroPosition: HeroPosition ): number {
    if ( quantumPerspectiva ) return quantumPerspectiva.dynamicEvFold - quantumPerspectiva.deltaFoldPct;
    if ( blindsRisingSoon ) {
        const timeErosion = -( anteSize / 100 ) * 3;
        // SOTA: Inversão Gravitacional de Órbita (FGS t-3)
        // O IP (UTG) caminha para a guilhotina (BB na próxima mão). Punição Máxima.
        // O SB caminha para a segurança absoluta (BTN na próxima mão). Punição Zero.
        const penaltyMap: Record<string, number> = { IP: -1.5, BB: -0.5, SB: 0 };
        return timeErosion + ( penaltyMap[heroPosition] ?? 0 );
    }
    return 0;
}

function _createSpotData( {
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

export default function MasterSimulator() {
    const { scenario, setScenario, scenarios } = useScenario();
    const [isPending, startTransition] = useTransition();
    const [aggressionFactor, setAggressionFactor] = useState( 1 );
    const [pkoValue, setPkoValue] = useState( 0 );
    const [isNearPayjump, setIsNearPayjump] = useState( false );
    const [blindsRisingSoon, setBlindsRisingSoon] = useState( false );
    const [streetFreqs, setStreetFreqs] = useState<StreetChipEvFreqs>( scenario.defaultStreetFreqs );
    const [activeTool, setActiveTool] = useState<ActiveTool>( 'scenario' );
    const [sidebarOpen, setSidebarOpen] = useState( true );
    const [anteSize, setAnteSize] = useState<number>( 12.5 );
    const [heroPosition, setHeroPosition] = useState<HeroPosition>( 'BB' );
    const [heroInvested, setHeroInvested] = useState<number>( 1.125 );
    const [currentPot, setCurrentPot] = useState<number>( 2.5 );
    const [activePlayers, setActivePlayers] = useState<number>( 2 );
    const [tourSpotlight, setTourSpotlight] = useState<DOMRect | null>( null );
    const [isPredictive, setIsPredictive] = useState<boolean>( true );

    // SOTA: Web Worker gerido pelo ecossistema para Range Nativo (FFI Rust)
    const [nativeRangeMetric, setNativeRangeMetric] = useState<{ equity: number; isCalculating: boolean }>( { equity: 50, isCalculating: false } );
    const [insolvencyMatrixData, setInsolvencyMatrixData] = useState<any[] | null>( null );
    const [isCalculatingInsolvency] = useState( false );

    const dispatchNativeEquity = useCallback( ( heroRange: string, villainRange: string, board: string ) => {
        setNativeRangeMetric( prev => ( { ...prev, isCalculating: true } ) );
        const worker = new Worker( new URL( './workers/equity.worker.ts', import.meta.url ) );

        worker.onmessage = ( e ) => {
            if ( e.data.error ) {
                // SOTA: Bypass no Error Overlay do Next.js.
                // Usamos warn para alertar sobre sintaxe errada sem congelar a Fricção Zero da interface.
                console.warn( "[SotaEcosystem] Entropia de Input (WASM):", e.data.error );
                alert( `[Falha Quântica] ${e.data.error}` );
                setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
            } else {
                // Objeto NativeRangeMetric puro devolvido pelo Rust
                setNativeRangeMetric( { equity: e.data.equity, isCalculating: false } );
            }
            worker.terminate(); // SOTA: Aniquilação termodinâmica
        };

        worker.onerror = ( error ) => {
            console.error( "[SotaEcosystem] Falha catastrófica no motor WASM (Rust):", error );
            setNativeRangeMetric( prev => ( { ...prev, isCalculating: false } ) );
            worker.terminate();
        };

        worker.postMessage( { heroRange, villainRange, board } );
    }, [] );

    const setManualEquity = useCallback( ( val: number ) => {
        setNativeRangeMetric( prev => ( { ...prev, equity: val } ) );
    }, [] );

    const dispatchInsolvencyMatrix = useCallback( ( villainRange: string, board: string, rpFactor: number, heroInvested: number, currentPot: number, activePlayers: number ) => {
        // WASM Nativo SOTA - Erradicação do Web Worker assíncrono para matrizes brutas
        // setIsCalculatingInsolvency( true );
        setInsolvencyMatrixData( [] ); // Fallback visual até integração final

    }, [] );

    // SOTA: Render Shield para Injeção de Dependências.
    // Impede o recálculo catastrófico do Motor Quântico durante mutações de UI (ex: sidebarOpen).
    const quantumConfig = useMemo( () => ( {
        scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp: heroPosition === 'IP', anteSize, heroInvestedBb: heroInvested, currentPotBb: currentPot, activePlayers
    } ), [scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroPosition, anteSize, heroInvested, currentPot, activePlayers] );

    // --- MOTOR DE PROPAGACAO MATEMATICA E DISTORCAO ICM SOTA ---
    const {
        effectiveIpRp, effectiveOopRp, rpSource,
        effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva
    } = useQuantumEngine( quantumConfig );

    // SOTA: Matemática Quântica nativa no cliente (Fricção Zero Absoluta).
    // Erradica a dependência do backend Python e resolve o ERR_CONNECTION_REFUSED instantaneamente.
    const apiQuantumMetrics = useMemo( () => (
        quantumPerspectiva ? computeQuantumMetrics( quantumPerspectiva, activePlayers, heroInvested, currentPot, scenario.stacks ) : null
    ), [quantumPerspectiva, activePlayers, heroInvested, currentPot, scenario.stacks] );

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
    const heroRawStack = scenario.stacks[isIp ? 0 : 1] || 40;
    const villainRawStack = scenario.stacks[isIp ? 1 : 0] || 55;
    const villainInvested = Math.max( 0, currentPot - heroInvested );
    const heroUpdatedStack = Math.max( 0, heroRawStack - heroInvested );
    const villainUpdatedStack = Math.max( 0, villainRawStack - villainInvested );

    // SOTA: Centralização termodinâmica para erradicar complexidade ciclomática (Lei de Shannon)
    const baseFgsErosion = useMemo(
        () => _calculateBaseFgsErosion( quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition ),
        [quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition]
    );

    const spotData = useMemo( () => _createSpotData( { heroUpdatedStack, villainUpdatedStack, isIp, currentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics } ),
        [heroUpdatedStack, villainUpdatedStack, isIp, currentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, baseFgsErosion, apiQuantumMetrics] );

    const actionMetrics = useMemo( () => {
        return _calculateActionMetrics( { heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers } );
    }, [heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, isBaseline, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers] );

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
    }, [setScenario, scenarios] );

    const handleStreetFreqChange = useCallback( ( street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs ) => {
        setStreetFreqs( ( prev: StreetChipEvFreqs ) => {
            const { deltas, hasChange } = _calculateFreqDeltas( prev[street], freqs );
            if ( !hasChange ) return { ...prev, [street]: freqs };
            const next = _propagateFrequencies( prev, street, deltas );
            next[street] = { ...freqs };

            return next;
        } );
    }, [] );


    const handleTourStep = useCallback( ( step: TourStep ) => {
        if ( step.id === 's-0' ) handleScenarioSelect( 'tg-7' );
        _performTourScrollAndHighlight( step, setTourSpotlight );
    }, [handleScenarioSelect] );

    const handleHeroPositionChange = useCallback( ( e: React.ChangeEvent<HTMLSelectElement> ) => {
        const pos = e.target.value as HeroPosition;
        setHeroPosition( pos );
        const anteBb = anteSize / 100;
        let newInvested = anteBb;
        if ( pos === 'BB' ) newInvested += 1;
        else if ( pos === 'SB' ) newInvested += 0.5;
        setHeroInvested( newInvested );
    }, [anteSize] );

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
    }, [spotData, actionMetrics, finalIpRp, finalOopRp] );

    const metricsContextValue = useMemo( () => ( {
        quantumPerspectiva,
        apiQuantumMetrics
    } ), [quantumPerspectiva, apiQuantumMetrics] );

    const dispatchIcmPerspectiva = useCallback( ( input: any, onResult: ( res: any ) => void ) => {
        // Erradicação do Web Worker - WASM síncrono O(1) executa diretamente via useQuantumEngine
    }, [] );

    const wasmContextValue = useMemo( () => ( {
        nativeRangeMetric,
        dispatchNativeEquity,
        setManualEquity,
        dispatchIcmPerspectiva,
        insolvencyMatrixData,
        isCalculatingInsolvency,
        dispatchInsolvencyMatrix
    } ), [nativeRangeMetric, dispatchNativeEquity, setManualEquity, dispatchIcmPerspectiva, insolvencyMatrixData, isCalculatingInsolvency, dispatchInsolvencyMatrix] );

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

    const activeToolContent = toolContents[activeTool] || null;

    return (
        <SotaSpotContext.Provider value={ spotContextValue }>
            <SotaMetricsContext.Provider value={ metricsContextValue }>
                <SotaWasmContext.Provider value={ wasmContextValue }>
                    <div className="min-h-screen bg-bg-base relative overflow-x-hidden">
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
                                    <PmLensPanel anteSize={ anteSize } heroInvested={ heroInvested } currentPot={ currentPot } activePlayers={ activePlayers } heroPosition={ heroPosition } blindsRisingSoon={ blindsRisingSoon } initialStacks={ scenario.stacks } initialPrizes={ scenario.prizes } />
                                    <SimulatorQuizWidget simulatorState={ quantumConfig as any } />
                                </div>
                            </Suspense>
                        </section>

                        <section className="sota-container mb-24">
                            <SectionHeader step="03" label="Laboratório" title="Motor ICM de Distorções" description="Explore as refrações dinâmicas de equilíbrio GTO." />

                            <div className={ `grid gap-8 items-start ${sidebarOpen ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1'}` }>
                                { sidebarOpen && (
                                    <aside className="lg:sticky lg:top-24">
                                        <ScenarioSelector scenarios={ scenarios } activeId={ scenario.id } onSelect={ handleScenarioSelect } />
                                    </aside>
                                ) }

                                <main className="flex flex-col gap-8 min-w-0 transition-all duration-300">
                                    <SimulatorNavigation activeTool={ activeTool } onSelectTool={ setActiveTool } />
                                    <div className={ `transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}` }>
                                        { activeToolContent }
                                    </div>
                                </main>
                            </div>
                        </section>

                        <footer className="border-t border-white/5 bg-bg-panel/20">
                            <div className="sota-container py-12 px-6">
                                <p className="text-label opacity-30">Motor SOTA v4.1 · Raphael Vitoi</p>
                            </div>
                        </footer>

                        <SimulatorTour onStepAction={ handleTourStep } onClose={ closeTour } />
                    </div>
                </SotaWasmContext.Provider>
            </SotaMetricsContext.Provider>
        </SotaSpotContext.Provider>
    );
}
