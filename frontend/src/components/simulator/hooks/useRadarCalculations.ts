'use client';

import { useMemo } from 'react';
import { PrizesSchema, StacksSchema } from '@/lib/schemas';
import type { Scenario, IcmDistortionResult } from '@/components/simulator/engine/types';
import { solveIcmDistortion } from '@/components/simulator/engine/nashSolver';

interface RadarCalculationsParams {
    scenarios: Scenario[];
    currentId: string;
    compareId: string;
    nashFlop: IcmDistortionResult | undefined;
}

function buildRadarData(scenario: Scenario, nash?: IcmDistortionResult) {
    const resolvedNash = nash ?? solveIcmDistortion(
        scenario.ipRp,
        scenario.oopRp,
        scenario.defaultStreetFreqs.flop,
        1
    );
    const bluff = resolvedNash.ip.bet_small.center + resolvedNash.ip.bet_large.center;
    const defense = resolvedNash.oop.call.center;
    const isBaseline = scenario.category === 'toyGame' || scenario.prizes.length <= 1;

    return {
        rpIp: isBaseline ? 0 : scenario.ipRp,
        rpOop: isBaseline ? 0 : scenario.oopRp,
        bluff,
        defense,
        sprDecay: scenario.sprData.length > 0
            ? ((scenario.sprData[0].rpValue - (scenario.sprData.at(-1)?.rpValue ?? 0)) / Math.max(1, scenario.sprData[0].rpValue)) * 100
            : 0,
    };
}

export function useRadarCalculations({ scenarios, currentId, compareId, nashFlop }: RadarCalculationsParams) {
    const currentScenario = useMemo(() => scenarios.find(s => s.id === currentId), [scenarios, currentId]);

    const compareScenario = useMemo(() => {
        const s = scenarios.find(sc => sc.id === compareId);
        if (!s) return null;
        const validStacks = StacksSchema.safeParse(s.stacks);
        const validPrizes = PrizesSchema.safeParse(s.prizes);
        return (validStacks.success && validPrizes.success) ? s : null;
    }, [scenarios, compareId]);

    const radarData = useMemo(() => {
        if (!currentScenario) return [];
        const a = buildRadarData(currentScenario, nashFlop);
        const b = compareScenario ? buildRadarData(compareScenario) : null;

        return [
            { axis: 'RP IP', A: a.rpIp, B: b?.rpIp ?? 0 },
            { axis: 'RP OOP', A: a.rpOop, B: b?.rpOop ?? 0 },
            { axis: 'Bluff%', A: a.bluff, B: b?.bluff ?? 0 },
            { axis: 'Defesa%', A: a.defense, B: b?.defense ?? 0 },
            { axis: 'SPR Decay', A: a.sprDecay, B: b?.sprDecay ?? 0 },
        ];
    }, [currentScenario, compareScenario, nashFlop]);

    return { currentScenario, compareScenario, radarData };
}
