import { calculatePerspectivaVitoi } from '@/lib/perspectiva';
import { derivePostFlopRps, deriveRps } from '@/lib/rpDeriver';
import { useMemo } from 'react';
import { logTelemetryEvent } from '../../telemetry';
import { solveIcmDistortion } from '../engine/nashSolver';
import type { SprStage, StreetChipEvFreqs } from '../engine/types';

export interface QuantumEngineParams {
    scenario: any;
    pkoValue: number;
    isNearPayjump: boolean;
    blindsRisingSoon: boolean;
    streetFreqs: StreetChipEvFreqs;
    aggressionFactor: number;
    heroIsIp?: boolean;
    anteSize?: number;
    heroInvestedBb?: number;
    currentPotBb?: number;
    activePlayers?: number;
}

export function useQuantumEngine ( { scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp = false, anteSize = 12.5, heroInvestedBb, currentPotBb, activePlayers = 2 }: QuantumEngineParams ) {

    const numPlayers = useMemo( () => scenario.stacks.length, [ scenario.stacks ] );
    const anteInBb = useMemo( () => anteSize / 100, [ anteSize ] );

    // SOTA: Economia Generalizada (Cálculo único de baseline para o ciclo de renderização)
    const isBaseline = useMemo( () => scenario.category === 'baseline' || scenario.prizes.length <= 1, [ scenario.category, scenario.prizes.length ] );

    // Incentivo intrinseco do pote pre-flop (dead money).
    // Quanto maior, menor a pressao relativa do ICM.
    const preflopDeadMoney = useMemo( () => {
        if ( currentPotBb !== undefined && currentPotBb > 0 ) return currentPotBb;
        if ( numPlayers < 2 ) return 1.5; // Fallback para HU
        return 1.5 + ( numPlayers * anteInBb ); // SB (0.5) + BB (1.0) + Antes
    }, [ numPlayers, anteInBb, currentPotBb ] );

    // Custo Base de Desistência (EV_Fold)
    // OOP assume BB (1BB + Ante). IP assume BTN (0BB + Ante).
    const foldEvBb = useMemo( () => {
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
    const quantumPerspectiva = useMemo( () => {
        if ( scenario.prizes.length === 0 ) return null;
        try
        {
            return calculatePerspectivaVitoi( {
                stacks: scenario.stacks,
                prizes: scenario.prizes,
                heroIdx: 0,
                villainIdx: 1,
                potSize: preflopDeadMoney,
                heroCost: Math.abs( foldEvBb ),
                winProb: 0.5,
                realizationFactor: 1,
                edgeBase: 1,
                bountyValue: pkoValue * 100,
                isNearPayjump,
                blindsRisingSoon
            } );
        } catch { return null; }
    }, [ scenario.stacks, scenario.prizes, pkoValue, isNearPayjump, blindsRisingSoon, preflopDeadMoney, foldEvBb ] );

    // Derivar RP automaticamente via Malmuth-Harville (Base)
    const derivedRp = useMemo( () => {
        if ( scenario.prizes.length === 0 ) return null;
        const t0 = performance.now();
        try
        {
            const res = deriveRps( scenario.stacks, scenario.prizes, 0, 1, pkoValue * 100 );
            const t1 = performance.now();
            const latency = t1 - t0;

            if ( latency > 50 )
            {
                logTelemetryEvent( {
                    category: 'performance',
                    componentName: `MasterSimulator:${scenario.id}:deriveRps`,
                    latency: Math.round( latency ),
                    metadata: { stacksCount: scenario.stacks.length, pko: pkoValue }
                } );
            }
            return res;
        } catch { return null; }
    }, [ scenario.id, scenario.stacks, scenario.prizes, pkoValue ] );

    // RP Efetivo Quantum: O RP base é ajustado pela Perspectiva (Piso Dinâmico)
    const rpAdjustment = useMemo( () => {
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

        const initialSpr = scenario.sprData.find( ( s: SprStage ) => s.name === 'FLOP' )?.potSize || 7.5;
        const baseAdjustment = ( survivalGain - costOfFold ) * ( initialSpr / 2 );
        return baseAdjustment * deadMoneyFactor;
    }, [ quantumPerspectiva, scenario.category, scenario.prizes.length, scenario.sprData, preflopDeadMoney ] );

    const effectiveIpRp = Math.max( 0, ( ( derivedRp?.ipRp ?? Number( scenario.ipRp ) ) || 0 ) + rpAdjustment );
    const effectiveOopRp = Math.max( 0, ( ( derivedRp?.oopRp ?? Number( scenario.oopRp ) ) || 0 ) + rpAdjustment );

    let rpSource = 'manual';
    if ( derivedRp )
    {
        rpSource = scenario.category === 'baseline' ? 'ICMev Puro' : 'Quantum v4.1';
    }

    // --- MOTOR DE PROPAGAÇÃO REVERSA (ORGANISMO VITOI) ---
    const postFlopRps = useMemo( () => {
        if ( scenario.prizes.length === 0 ) return null;
        const sprFlop = scenario.sprData.find( ( s: SprStage ) => s.name === 'FLOP' );
        const sprTurn = scenario.sprData.find( ( s: SprStage ) => s.name === 'TURN' );
        const sprRiver = scenario.sprData.find( ( s: SprStage ) => s.name === 'RIVER' );

        // SOTA: O valuation do pot dissipa o RP por streets respeitando o preflopDeadMoney como piso (Pot Entrapment escalonado).
        const potRiver = Math.max( sprRiver?.potSize ?? 40, preflopDeadMoney );
        const potTurn = Math.max( sprTurn?.potSize ?? 22.5, preflopDeadMoney );
        const potFlop = Math.max( sprFlop?.potSize ?? 7.5, preflopDeadMoney );

        const river = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'river', potAcumuladoHero: potRiver / 2, potTotal: potRiver, heroIsIp, bountyValue: pkoValue * 100 } );

        let turnFutureRpInfluence = 0;
        if ( !isBaseline )
        {
            turnFutureRpInfluence = heroIsIp ? ( river?.ipRp ?? 0 ) : ( river?.oopRp ?? 0 );
        }
        const turn = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'turn', potAcumuladoHero: potTurn / 2, potTotal: potTurn, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: turnFutureRpInfluence } );

        let flopFutureRpInfluence = 0;
        if ( !isBaseline )
        {
            flopFutureRpInfluence = heroIsIp ? ( turn?.ipRp ?? 0 ) : ( turn?.oopRp ?? 0 );
        }
        const flop = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'flop', potAcumuladoHero: potFlop / 2, potTotal: potFlop, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: flopFutureRpInfluence } );

        return { flop, turn, river };
    }, [ scenario.stacks, scenario.prizes, scenario.sprData, pkoValue, scenario.category, heroIsIp, preflopDeadMoney ] );

    const ipRpFlop = postFlopRps?.flop?.ipRp ?? ( effectiveIpRp * 0.8 );
    const oopRpFlop = postFlopRps?.flop?.oopRp ?? ( effectiveOopRp * 0.8 );
    const ipRpTurn = postFlopRps?.turn?.ipRp ?? ( effectiveIpRp * 0.5 );
    const oopRpTurn = postFlopRps?.turn?.oopRp ?? ( effectiveOopRp * 0.5 );
    const ipRpRiver = postFlopRps?.river?.ipRp ?? ( effectiveIpRp * 0.2 );
    const oopRpRiver = postFlopRps?.river?.oopRp ?? ( effectiveOopRp * 0.2 );

    const effectiveSprData = useMemo( () => {
        if ( !postFlopRps ) return scenario.sprData;
        const baseRp = heroIsIp ? effectiveIpRp : effectiveOopRp;
        return scenario.sprData.map( ( stage: SprStage ) => {
            if ( stage.name === 'PRE' ) return { ...stage, rpValue: baseRp };
            if ( stage.name === 'FLOP' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.flop?.ipRp ?? stage.rpValue ) : ( postFlopRps.flop?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'TURN' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.turn?.ipRp ?? stage.rpValue ) : ( postFlopRps.turn?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'RIVER' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.river?.ipRp ?? stage.rpValue ) : ( postFlopRps.river?.oopRp ?? stage.rpValue ) };
            return stage;
        } );
    }, [ scenario.sprData, postFlopRps, effectiveIpRp, effectiveOopRp, heroIsIp ] );

    // SOTA VITOI: Consciência Topológica Proporcional e Condicionante
    const topologicAggression = useMemo( () => {
        if ( isBaseline ) return aggressionFactor;

        // A pressão do ecossistema atua como um regulador contínuo.
        // Capamos em 30% de RP para normalizar o fator de 0 a 1 (0 = sem pressão, 1 = dor máxima).
        const maxRp = Math.max( effectiveIpRp, effectiveOopRp );
        const pressureIndex = Math.min( maxRp / 30, 1 );

        if ( isNearPayjump )
        {
            // Borda do Platô / Payjump: Supressão proporcional à diferença do Ganho Real.
            // Se o payjump é negligenciável (RP baixo), ignora. Se é abissal (RP alto), aversão máxima.
            const suppression = 1 - ( 0.3 * pressureIndex );
            return aggressionFactor * suppression;
        } else
        {
            // Vale de Pressão (Platô): Expansão proporcional.
            // Quanto menor a pressão estrutural residual, maior a alavancagem buscando a cravada.
            const expansion = 1.05 + ( 0.25 * ( 1 - pressureIndex ) );
            return aggressionFactor * expansion;
        }
    }, [ aggressionFactor, isNearPayjump, isBaseline, effectiveIpRp, effectiveOopRp ] );

    const { nashFlop, nashTurn, nashRiver } = useMemo( () => ( {
        nashFlop: solveIcmDistortion( ipRpFlop, oopRpFlop, streetFreqs.flop, topologicAggression, activePlayers ),
        nashTurn: solveIcmDistortion( ipRpTurn, oopRpTurn, streetFreqs.turn, topologicAggression, activePlayers ),
        nashRiver: solveIcmDistortion( ipRpRiver, oopRpRiver, streetFreqs.river, topologicAggression, activePlayers ),
    } ), [ ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, streetFreqs, topologicAggression, activePlayers ] );

    // SOTA: Isolamento de referência para evitar GC Churn e quebra de memoização downstream
    const streetRps = useMemo( () => ( {
        flop: { ip: ipRpFlop, oop: oopRpFlop },
        turn: { ip: ipRpTurn, oop: oopRpTurn },
        river: { ip: ipRpRiver, oop: oopRpRiver },
    } ), [ ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver ] );

    return { effectiveIpRp, effectiveOopRp, rpSource, ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps, quantumPerspectiva };
}
