import { calculatePerspectivaVitoi } from '@/lib/perspectiva';
import { derivePostFlopRps, deriveRps } from '@/lib/rpDeriver';
import { useMemo } from 'react';
import { logTelemetryEvent } from '../../telemetry';
import { solveIcmDistortion } from '../engine/nashSolver';
import type { StreetChipEvFreqs } from '../engine/types';

export interface QuantumEngineParams {
    scenario: any;
    pkoValue: number;
    isNearPayjump: boolean;
    blindsRisingSoon: boolean;
    streetFreqs: StreetChipEvFreqs;
    aggressionFactor: number;
    heroIsIp?: boolean;
    anteSize?: number;
}

export function useQuantumEngine ( { scenario, pkoValue, isNearPayjump, blindsRisingSoon, streetFreqs, aggressionFactor, heroIsIp = false, anteSize = 12.5 }: QuantumEngineParams ) {

    // Custo Base de Desistência (EV_Fold)
    // OOP assume BB (1BB + Ante). IP assume BTN (0BB + Ante).
    const foldEvBb = useMemo( () => {
        const baseInvested = heroIsIp ? 0 : 1;
        return -( baseInvested + ( anteSize / 100 ) );
    }, [ heroIsIp, anteSize ] );

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
                potSize: 7.5,
                heroCost: 3.75,
                winProb: 0.5,
                realizationFactor: 1,
                edgeBase: 1,
                bountyValue: pkoValue * 100,
                isNearPayjump,
                blindsRisingSoon
            } );
        } catch { return null; }
    }, [ scenario.stacks, scenario.prizes, pkoValue, isNearPayjump, blindsRisingSoon ] );

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
        const isBaseline = scenario.category === 'baseline' || scenario.prizes.length <= 1;
        if ( !quantumPerspectiva || isBaseline ) return 0;

        // SOTA: Erradicação do Magic Number (10).
        // O delta positivo entre o ganho de sobrevivência e a dor financeira real do fold (foldEvBb) gera a pressão inflacionária.
        const survivalGain = quantumPerspectiva.dynamicEvFold || 0;
        const costOfFold = Math.abs( foldEvBb );

        if ( survivalGain > costOfFold )
        {
            const initialSpr = scenario.sprData.find( ( s: any ) => s.name === 'FLOP' )?.potSize || 7.5;
            return ( survivalGain - costOfFold ) * ( initialSpr / 2 );
        }
        return 0;
    }, [ quantumPerspectiva, scenario.category, scenario.prizes.length, foldEvBb, scenario.sprData ] );

    const effectiveIpRp = Math.max( 0, ( derivedRp?.ipRp ?? scenario.ipRp ) + rpAdjustment );
    const effectiveOopRp = Math.max( 0, ( derivedRp?.oopRp ?? scenario.oopRp ) + rpAdjustment );

    let rpSource = 'manual';
    if ( derivedRp )
    {
        rpSource = scenario.category === 'baseline' ? 'ICMev Puro' : 'Quantum v4.1';
    }

    // --- MOTOR DE PROPAGAÇÃO REVERSA (ORGANISMO VITOI) ---
    const postFlopRps = useMemo( () => {
        if ( scenario.prizes.length === 0 ) return null;
        const isBaseline = scenario.category === 'baseline';
        const sprFlop = scenario.sprData.find( ( s: any ) => s.name === 'FLOP' );
        const sprTurn = scenario.sprData.find( ( s: any ) => s.name === 'TURN' );
        const sprRiver = scenario.sprData.find( ( s: any ) => s.name === 'RIVER' );
        const potRiver = sprRiver?.potSize ?? 40;
        const potTurn = sprTurn?.potSize ?? 22.5;
        const potFlop = sprFlop?.potSize ?? 7.5;

        const river = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'river', potAcumuladoHero: potRiver / 2, potTotal: potRiver, heroIsIp, bountyValue: pkoValue * 100 } );
        const turn = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'turn', potAcumuladoHero: potTurn / 2, potTotal: potTurn, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: isBaseline ? 0 : ( heroIsIp ? ( river?.ipRp ?? 0 ) : ( river?.oopRp ?? 0 ) ) } );
        const flop = derivePostFlopRps( scenario.stacks, scenario.prizes, 0, 1, { street: 'flop', potAcumuladoHero: potFlop / 2, potTotal: potFlop, heroIsIp, bountyValue: pkoValue * 100, futureRpInfluence: isBaseline ? 0 : ( heroIsIp ? ( turn?.ipRp ?? 0 ) : ( turn?.oopRp ?? 0 ) ) } );
        return { flop, turn, river };
    }, [ scenario.stacks, scenario.prizes, scenario.sprData, pkoValue, scenario.category, heroIsIp ] );

    const ipRpFlop = postFlopRps?.flop?.ipRp ?? ( effectiveIpRp * 0.8 );
    const oopRpFlop = postFlopRps?.flop?.oopRp ?? ( effectiveOopRp * 0.8 );
    const ipRpTurn = postFlopRps?.turn?.ipRp ?? ( effectiveIpRp * 0.5 );
    const oopRpTurn = postFlopRps?.turn?.oopRp ?? ( effectiveOopRp * 0.5 );
    const ipRpRiver = postFlopRps?.river?.ipRp ?? ( effectiveIpRp * 0.2 );
    const oopRpRiver = postFlopRps?.river?.oopRp ?? ( effectiveOopRp * 0.2 );

    const effectiveSprData = useMemo( () => {
        if ( !postFlopRps ) return scenario.sprData;
        const baseRp = heroIsIp ? effectiveIpRp : effectiveOopRp;
        return scenario.sprData.map( ( stage: any ) => {
            if ( stage.name === 'PRE' ) return { ...stage, rpValue: baseRp };
            if ( stage.name === 'FLOP' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.flop?.ipRp ?? stage.rpValue ) : ( postFlopRps.flop?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'TURN' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.turn?.ipRp ?? stage.rpValue ) : ( postFlopRps.turn?.oopRp ?? stage.rpValue ) };
            if ( stage.name === 'RIVER' ) return { ...stage, rpValue: heroIsIp ? ( postFlopRps.river?.ipRp ?? stage.rpValue ) : ( postFlopRps.river?.oopRp ?? stage.rpValue ) };
            return stage;
        } );
    }, [ scenario.sprData, postFlopRps, effectiveIpRp, effectiveOopRp, heroIsIp ] );

    const { nashFlop, nashTurn, nashRiver } = useMemo( () => ( {
        nashFlop: solveIcmDistortion( ipRpFlop, oopRpFlop, streetFreqs.flop, aggressionFactor ),
        nashTurn: solveIcmDistortion( ipRpTurn, oopRpTurn, streetFreqs.turn, aggressionFactor ),
        nashRiver: solveIcmDistortion( ipRpRiver, oopRpRiver, streetFreqs.river, aggressionFactor ),
    } ), [ ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, streetFreqs, aggressionFactor ] );

    const streetRps = {
        flop: { ip: ipRpFlop, oop: oopRpFlop },
        turn: { ip: ipRpTurn, oop: oopRpTurn },
        river: { ip: ipRpRiver, oop: oopRpRiver },
    };

    return { effectiveIpRp, effectiveOopRp, rpSource, ipRpFlop, oopRpFlop, ipRpTurn, oopRpTurn, ipRpRiver, oopRpRiver, effectiveSprData, nashFlop, nashTurn, nashRiver, streetRps };
}
