import { calculatePerspectivaVitoi } from '@/lib/perspectiva';
import { derivePostFlopRps, deriveRps } from '@/lib/rpDeriver';
import { logTelemetryEvent } from '@/lib/telemetry-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { solveIcmDistortion } from '../engine/nashSolver';
import type { ChipEvFreqs, IcmDistortionResult, NodelockConstraint, Scenario, SprStage, StreetChipEvFreqs } from '../engine/types';

export interface QuantumEngineParams
{
    scenario: Scenario;
    pkoValue: number;
    isNearPayjump: boolean;
    blindsRisingSoon: boolean;
    streetFreqs: StreetChipEvFreqs;
    aggressionFactor: number;
    heroIsIp?: boolean;
    heroPosition?: 'IP' | 'SB' | 'BB';
    anteSize?: number;
    heroInvestedBb?: number;
    currentPotBb?: number;
    activePlayers?: number;
    kappaValue?: number;
    activeNodelock?: NodelockConstraint | null;
    isPredictive?: boolean;
}

export interface DistortionPayload
{
    ipRpFlop: number; oopRpFlop: number; freqFlop: ChipEvFreqs;
    ipRpTurn: number; oopRpTurn: number; freqTurn: ChipEvFreqs;
    ipRpRiver: number; oopRpRiver: number; freqRiver: ChipEvFreqs;
    topologicAggression: number; activePlayers: number;
    pots: [number, number, number];
}

export interface NashDistortionResults
{
    flop?: IcmDistortionResult;
    turn?: IcmDistortionResult;
    river?: IcmDistortionResult;
}

export interface InsolvencyMetrics
{
    winRate: number;
    loseRate: number;
    tieRate: number;
    trueInsolvencyEv: number;
    riskIndex: number;
}

export function useQuantumEngine ( { scenario, pkoValue = 0, isNearPayjump = false, blindsRisingSoon = false, streetFreqs = { flop: {} as ChipEvFreqs, turn: {} as ChipEvFreqs, river: {} as ChipEvFreqs }, aggressionFactor = 1, heroIsIp = false, heroPosition = 'IP', anteSize = 12.5, heroInvestedBb, currentPotBb, activePlayers = 2, kappaValue = 1, activeNodelock = null, isPredictive = true }: QuantumEngineParams )
{
    const ipIndex = 0;
    const oopIndex = 1;
    const numPlayers = useMemo( () => scenario.stacks.length, [ scenario.stacks ] );
    const anteInBb = useMemo( () => anteSize / 100, [ anteSize ] );

    // SOTA: Fallback de Sobrevivência. Se o Lab omitir prêmios, injetamos a FT 9-max baseline para garantir a Perspectiva.
    const resolvedPrizes = useMemo( () =>
    {
        return ( scenario.prizes && scenario.prizes.length > 0 ) ? scenario.prizes : [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];
    }, [ scenario.prizes ] );

    // SOTA: Economia Generalizada (Cálculo único de baseline para o ciclo de renderização)
    const isBaseline = useMemo( () => scenario.category === 'baseline' || resolvedPrizes.length <= 1, [ scenario.category, resolvedPrizes.length ] );

    // SOTA: Estados e Refs do Web Worker de Insolvência
    const [ insolvencyMatrixData, setInsolvencyMatrixData ] = useState<InsolvencyMetrics | null>( null );
    const [ isCalculatingInsolvency, setIsCalculatingInsolvency ] = useState( false );
    const [ nashResults, setNashResults ] = useState<NashDistortionResults | null>( null );
    const insolvencyWorkerRef = useRef<Worker | null>( null );

    const lastRequestIdRef = useRef<number>(0);

    // Inicialização do Web Worker
    useEffect( () =>
    {
        const worker = new Worker( new URL( '../workers/insolvency.worker.ts', import.meta.url ), { type: 'module' } );
        insolvencyWorkerRef.current = worker;

        worker.onmessage = ( e: MessageEvent ) =>
        {
            // Validação de versão: Ignora resultados de requisições antigas
            if ( e.data.id !== lastRequestIdRef.current ) return;

            if ( e.data.error )
            {
                console.warn( "[SotaEcosystem] Entropia de Input (Insolvency WASM):", e.data.error );
                setIsCalculatingInsolvency( false );
            } else if ( e.data.type === 'DISTORTION' )
            {
                setNashResults( e.data.nashResults as NashDistortionResults );
            } else if ( e.data.type === 'MATRIX' )
            {
                const m = e.data.matrix as number[];
                if ( m && m.length >= 5 )
                {
                    setInsolvencyMatrixData( {
                        winRate: m[ 0 ], loseRate: m[ 1 ], tieRate: m[ 2 ],
                        trueInsolvencyEv: m[ 3 ], riskIndex: m[ 4 ]
                    } );
                } else
                {
                    setInsolvencyMatrixData( null );
                }
                setIsCalculatingInsolvency( false );
            }
        };

        worker.onerror = ( e ) =>
        {
            console.error( "[SotaEcosystem] Falha catastrófica no Worker:", e );
            setIsCalculatingInsolvency( false );
        };

        return () => {
            worker.terminate();
            insolvencyWorkerRef.current = null;
        };
    }, [] );

    // SOTA: Fricção Zero no Fator de Credibilidade (Axioma Lipe Piv).
    // O recálculo engatilha somente se a variação for superior a 0.05 para evitar inundação do Event Loop (debouncing quantizado).
    const effectiveKappa = useMemo( () =>
    {
        return Math.round( kappaValue * 20 ) / 20;
    }, [ kappaValue ] );

    const dispatchInsolvencyMatrix = useCallback( ( villainRange: string, board: string, rpFactor: number, heroInvested: number, currentPot: number, activePlayers: number, kappaOverride?: number ) =>
    {
        if ( !insolvencyWorkerRef.current ) return;
        setIsCalculatingInsolvency( true );
        const id = ++lastRequestIdRef.current;
        insolvencyWorkerRef.current.postMessage( {
            type: 'MATRIX', villainRange, board, rpFactor, heroInvested, currentPot, activePlayers, kappa: kappaOverride ?? effectiveKappa, id
        } );
    }, [ effectiveKappa ] );

    const dispatchIcmDistortion = useCallback( ( payload: DistortionPayload ) =>
    {
        if ( !insolvencyWorkerRef.current ) return;
        const id = ++lastRequestIdRef.current;
        insolvencyWorkerRef.current.postMessage( {
            type: 'DISTORTION', ...payload, id
        } );
    }, [] );

    // Incentivo intrinseco do pote pre-flop (dead money).
    // Quanto maior, menor a pressao relativa do ICM.
    const preflopDeadMoney = useMemo( () =>
    {
        if ( currentPotBb !== undefined && currentPotBb > 0 ) return currentPotBb;
        if ( numPlayers < 2 ) return 1.5; // Fallback para HU
        return 1.5 + ( numPlayers * anteInBb ); // SB (0.5) + BB (1.0) + Antes
    }, [ numPlayers, anteInBb, currentPotBb ] );

    // Custo Base de Desistência (EV_Fold)
    // OOP assume BB (1BB + Ante). IP assume BTN (0BB + Ante).
    const foldEvBb = useMemo( () =>
    {
        // SOTA: O Sunk Cost agora respeita o escalonamento (3bets, 4bets) e preserva a soma do Ante.
        let baseInvested: number;
        if ( heroInvestedBb === undefined )
        {
            baseInvested = heroIsIp ? 0 : 1;
        } else
        {
            baseInvested = Math.abs( heroInvestedBb );
        }
        return -( baseInvested + anteInBb );
    }, [ heroIsIp, anteInBb, heroInvestedBb ] );

    // Derivar Perspectiva Matemática Quantum (v4.0)
    const quantumPerspectiva = useMemo( () =>
    {

        // SOTA: Fator R (Realização) atenuado pelo Axioma Lipe Piv.
        // Se a credibilidade do vilão é baixa (kappa < 1), a penalidade posicional é diluída,
        // aproximando a realização OOP do Bluff-Catcher Puro.
        const baseRealization = heroIsIp ? 1 : 0.85;
        const realizationFactor = heroIsIp ? 1 : ( baseRealization + ( 0.15 * ( 1 - effectiveKappa ) ) );
        try
        {
            return calculatePerspectivaVitoi( {
                stacks: scenario.stacks,
                prizes: resolvedPrizes,
                heroIdx: ipIndex,
                villainIdx: oopIndex,
                potSize: preflopDeadMoney,
                heroCost: Math.abs( foldEvBb ),
                winProb: 0.5,
                realizationFactor: realizationFactor,
                edgeBase: 1,
                bountyValue: pkoValue * 100,
                isNearPayjump,
                blindsRisingSoon,
                heroPosition // SOTA: Injeção de Antevisão Posicional
            } );
        } catch ( e: unknown ) { console.error( "[QuantumEngine] Falha na PM Lens:", e instanceof Error ? e.message : String( e ) ); return null; }
    }, [ scenario.stacks, resolvedPrizes, pkoValue, isNearPayjump, blindsRisingSoon, preflopDeadMoney, foldEvBb, heroPosition, heroIsIp, effectiveKappa ] );

    // Derivar RP automaticamente via Malmuth-Harville (Base)
    const derivedRp = useMemo( () =>
    {
        if ( isBaseline ) return null;

        const t0 = performance.now();
        try
        {
            const res = deriveRps( scenario.stacks, resolvedPrizes, ipIndex, oopIndex, pkoValue * 100 );
            const t1 = performance.now();
            const latency = t1 - t0;

            if ( latency > 50 )
            {
                logTelemetryEvent( {
                    category: 'performance',
                    componentName: `MasterSimulator:${ scenario.id }:deriveRps`,
                    latency: Math.round( latency ),
                    metadata: { stacksCount: scenario.stacks.length, pko: pkoValue }
                } );
            }
            return res;
        } catch { return null; }
    }, [ scenario.id, scenario.stacks, resolvedPrizes, pkoValue ] );

    // RP Efetivo Quantum: O RP base é ajustado pela Perspectiva (Piso Dinâmico)
    const rpAdjustment = useMemo( () =>
    {
        if ( !quantumPerspectiva || isBaseline ) return 0;

        // SOTA: Erradicação do Magic Number (10).
        // O delta positivo entre o ganho de sobrevivência e a dor em ICM real do fold gera a pressão inflacionária.
        const survivalGain = quantumPerspectiva.dynamicEvFold || 0;
        // P1 FIX: costOfFold unificado em Perspectiva EV (% do pool), pareado semanticamente com survivalGain.
        const costOfFold = Math.abs( quantumPerspectiva.deltaFoldPct );

        // SOTA: O incentivo do dead money modula a pressao do ICM.
        // Um pote maior (mais dead money) reduz a aversao ao risco.
        const standardDeadMoney = 2.625; // Baseline: 9-handed com 12.5% ante (1.5 + 9*0.125)
        const deadMoneyFactor = preflopDeadMoney > 0 ? standardDeadMoney / preflopDeadMoney : 1;

        if ( survivalGain <= costOfFold ) return 0;

        const initialPotSize = scenario.sprData?.find( ( s: SprStage ) => s.name === 'FLOP' )?.potSize || 7.5;
        const baseAdjustment = ( survivalGain - costOfFold ) * ( initialPotSize / 2 );
        return baseAdjustment * deadMoneyFactor;
    }, [ quantumPerspectiva, scenario.sprData, preflopDeadMoney, isBaseline ] );

    const effectiveIpRp = Math.max( 0, ( ( derivedRp?.ipRp ?? Number( scenario.ipRp ) ) || 0 ) + rpAdjustment );
    const effectiveOopRp = Math.max( 0, ( ( derivedRp?.oopRp ?? Number( scenario.oopRp ) ) || 0 ) + rpAdjustment );

    let rpSource = 'manual';
    if ( derivedRp )
    {
        rpSource = scenario.category === 'baseline' ? 'ICMev Puro' : 'Quantum v4.1';
    }

    // --- MOTOR DE PROPAGAÇÃO REVERSA (ORGANISMO VITOI) ---
    const postFlopPots = useMemo<[number, number, number]>( () => // SOTA: Estado purificado e tipagem estrita
    {
        const sprFlop = scenario.sprData.find( ( s: SprStage ) => s.name === 'FLOP' );
        const sprTurn = scenario.sprData.find( ( s: SprStage ) => s.name === 'TURN' );
        const sprRiver = scenario.sprData.find( ( s: SprStage ) => s.name === 'RIVER' );

        // SOTA: O valuation do pot dissipa o RP por streets respeitando o preflopDeadMoney como piso (Pot Entrapment escalonado).
        let potFlop = Math.max( sprFlop?.potSize ?? 7.5, preflopDeadMoney );
        let potTurn = Math.max( sprTurn?.potSize ?? 22.5, preflopDeadMoney );
        let potRiver = Math.max( sprRiver?.potSize ?? 40, preflopDeadMoney );

        if ( activeNodelock?.type === 'block_bet' ) {
            const b20Turn = potFlop * activeNodelock.sizePct;
            potTurn = potFlop + ( b20Turn * 2 );
            const b20River = potTurn * activeNodelock.sizePct;
            potRiver = potTurn + ( b20River * 2 );
        }

        return [potFlop, potTurn, potRiver];
    }, [ scenario.sprData, preflopDeadMoney, activeNodelock ] );

    const potsDep = postFlopPots.join('|');

    const postFlopRps = useMemo( () =>
    {
        if ( isBaseline ) return null;

        const [potFlop, potTurn, potRiver] = postFlopPots;

        const river = derivePostFlopRps( scenario.stacks, resolvedPrizes, ipIndex, oopIndex, { street: 'river', potAcumuladoHero: potRiver / 2, potTotal: potRiver, heroIsIp, bountyValue: pkoValue * 100 } );

        const turnFutureRpInfluence = heroIsIp ? ( river?.ipRp ?? 0 ) : ( river?.oopRp ?? 0 );
        const turn = derivePostFlopRps( scenario.stacks, resolvedPrizes, ipIndex, oopIndex, { street: 'turn', potAcumuladoHero: potTurn / 2, potTotal: potTurn, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: turnFutureRpInfluence } );

        const flopFutureRpInfluence = heroIsIp ? ( turn?.ipRp ?? 0 ) : ( turn?.oopRp ?? 0 );
        const flop = derivePostFlopRps( scenario.stacks, resolvedPrizes, ipIndex, oopIndex, { street: 'flop', potAcumuladoHero: potFlop / 2, potTotal: potFlop, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: flopFutureRpInfluence } );

        return { flop, turn, river };
    }, [ scenario.stacks, resolvedPrizes, pkoValue, heroIsIp, isBaseline, potsDep ] );

    const ipRpFlop = postFlopRps?.flop?.ipRp ?? ( effectiveIpRp * 0.8 );
    const oopRpFlop = postFlopRps?.flop?.oopRp ?? ( effectiveOopRp * 0.8 );
    const ipRpTurn = postFlopRps?.turn?.ipRp ?? ( effectiveIpRp * 0.5 );
    const oopRpTurn = postFlopRps?.turn?.oopRp ?? ( effectiveOopRp * 0.5 );
    const ipRpRiver = postFlopRps?.river?.ipRp ?? ( effectiveIpRp * 0.2 );
    const oopRpRiver = postFlopRps?.river?.oopRp ?? ( effectiveOopRp * 0.2 );

    const effectiveSprData = useMemo( () =>
    {
        if ( !postFlopRps ) return scenario.sprData;
        const baseRp = heroIsIp ? effectiveIpRp : effectiveOopRp;
        return scenario.sprData?.map( ( stage: SprStage ) =>
        {
            if ( stage.name === 'PRE' ) return { ...stage, rpValue: baseRp };
            if ( stage.name === 'FLOP' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.flop?.ipRp ?? stage.rpValue ) : ( postFlopRps.flop?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'TURN' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.turn?.ipRp ?? stage.rpValue ) : ( postFlopRps.turn?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'RIVER' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.river?.ipRp ?? stage.rpValue ) : ( postFlopRps.river?.oopRp ?? stage.rpValue ) };
            return stage;
        } );
    }, [ scenario.sprData, postFlopRps, effectiveIpRp, effectiveOopRp, heroIsIp ] );

    // SOTA VITOI: Consciência Topológica Proporcional e Condicionante
    const topologicAggression = useMemo( () =>
    {
        let baseAggression = aggressionFactor;

        // SOTA v4.2: No modo preditivo, o fator de agressão é estabilizado pela "Gravidade do Pot"
        if ( isPredictive ) {
            const potGravity = Math.min( (currentPotBb || 1) / 50, 0.2 );
            baseAggression *= ( 1 - potGravity );
        }

        // Entrapment Ratio boost implícito: reduz a pressão mitigando o Downward Drift
        if ( activeNodelock?.type === 'block_bet' ) {
            baseAggression *= 0.8;
        }

        if ( isBaseline ) return baseAggression;

        // A pressão do ecossistema atua como um regulador contínuo.
        // Capamos em 30% de RP para normalizar o fator de 0 a 1 (0 = sem pressão, 1 = dor máxima).
        const maxRp = Math.max( effectiveIpRp, effectiveOopRp );
        const pressureIndex = Math.min( maxRp / 30, 1 );

        if ( isNearPayjump )
        {
            // Borda do Platô / Payjump: Supressão proporcional à diferença do Ganho Real.
            // Se o payjump é negligenciável (RP baixo), ignora. Se é abissal (RP alto), aversão máxima.
            const suppression = 1 - ( 0.3 * pressureIndex );
            return baseAggression * suppression;
        } else
        {
            // Vale de Pressão (Platô): Expansão proporcional.
            // Quanto menor a pressão estrutural residual, maior a alavancagem buscando a cravada.
            const expansion = 1.05 + ( 0.25 * ( 1 - pressureIndex ) );
            return baseAggression * expansion;
        }
    }, [ aggressionFactor, isNearPayjump, isBaseline, effectiveIpRp, effectiveOopRp, activeNodelock, isPredictive, currentPotBb ] );

    const effectiveStreetFreqs = useMemo(() => {
        if ( activeNodelock?.type === 'block_bet' ) {
            const override = activeNodelock.freqOverride * 100;
            return {
                flop: { ...streetFreqs.flop, ip_bet_small: heroIsIp ? override : streetFreqs.flop.ip_bet_small },
                turn: { ...streetFreqs.turn, ip_bet_small: heroIsIp ? override : streetFreqs.turn.ip_bet_small },
                river: { ...streetFreqs.river, ip_bet_small: heroIsIp ? override : streetFreqs.river.ip_bet_small }
            };
        }
        return streetFreqs;
    }, [ streetFreqs, activeNodelock, heroIsIp ]);

    // SOTA: Despacho assíncrono para a esteira WASM (Web Worker)
    useEffect( () =>
    {
        // SOTA: Payload purificado. Tipagem ChipEvFreqs estrita e validada.
        if ( dispatchIcmDistortion )
        {
            dispatchIcmDistortion( {
                ipRpFlop, oopRpFlop, freqFlop: effectiveStreetFreqs.flop,
                ipRpTurn, oopRpTurn, freqTurn: effectiveStreetFreqs.turn,
                ipRpRiver, oopRpRiver, freqRiver: effectiveStreetFreqs.river,
                topologicAggression, activePlayers,
                pots: postFlopPots
            } );
        }
    }, [ dispatchIcmDistortion, ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveStreetFreqs, topologicAggression, activePlayers, postFlopPots ] );

    // SOTA FIX: Interceptador adaptativo. Protege o primeiro frame do React forçando o
    // contrato antigo do solver síncrono no novo formato estrito IP/OOP antes da resposta do Worker.
    const formatSyncSolverResult = ( result: any, freqs: ChipEvFreqs ) => {
        if ( !result ) return null;
        if ( 'ip' in result && 'oop' in result && result.ip?.check?.center !== undefined ) return result;
        const formatMetric = (val: number) => ({ center: val, spread: 0, delta: 0 });
        return {
            ip: {
                check: formatMetric(freqs.ip_check || 0),
                bet_small: formatMetric(freqs.ip_bet_small || 0),
                bet_large: formatMetric(freqs.ip_bet_large || 0)
            },
            oop: {
                fold: formatMetric(result?.oop?.fold?.center ?? result?.fold ?? freqs.oop_fold ?? 0),
                call: formatMetric(result?.oop?.call?.center ?? result?.call ?? freqs.oop_call ?? 0),
                raise: formatMetric(result?.oop?.raise?.center ?? result?.raise ?? freqs.oop_raise ?? 0)
            }
        };
    };

    const { nashFlop, nashTurn, nashRiver } = useMemo( () => ( {
        nashFlop: nashResults?.flop ?? formatSyncSolverResult( solveIcmDistortion( ipRpFlop, oopRpFlop, effectiveStreetFreqs.flop, topologicAggression ), effectiveStreetFreqs.flop ),
        nashTurn: nashResults?.turn ?? formatSyncSolverResult( solveIcmDistortion( ipRpTurn, oopRpTurn, effectiveStreetFreqs.turn, topologicAggression ), effectiveStreetFreqs.turn ),
        nashRiver: nashResults?.river ?? formatSyncSolverResult( solveIcmDistortion( ipRpRiver, oopRpRiver, effectiveStreetFreqs.river, topologicAggression ), effectiveStreetFreqs.river ),
    } ), [ nashResults, ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveStreetFreqs, topologicAggression ] );

    // SOTA: Isolamento de referência para evitar GC Churn e quebra de memoização downstream
    const streetRps = useMemo( () => ( {
        flop: { ip: ipRpFlop, oop: oopRpFlop, deltaRp: ipRpFlop - oopRpFlop },
        turn: { ip: ipRpTurn, oop: oopRpTurn, deltaRp: ipRpTurn - oopRpTurn },
        river: { ip: ipRpRiver, oop: oopRpRiver, deltaRp: ipRpRiver - oopRpRiver },
    } ), [ ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver ] );

    return {
        effectiveIpRp, effectiveOopRp, rpSource, ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva,
        insolvencyMatrixData, isCalculatingInsolvency, nashResults,
        dispatchInsolvencyMatrix, dispatchIcmDistortion
    };
}
