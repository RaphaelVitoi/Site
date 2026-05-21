/**
 * IDENTITY: Motor de Métricas Quânticas (SOTA)
 * PATH: src/components/simulator/engine/quantumMetrics.ts
 * ROLE: Centralizar os cálculos de Perspectiva Matemática, Valuation, RIO e FGS.
 * BINDING: [src/components/simulator/MasterSimulator.tsx]
 */

import { calculateRioTension } from '@/lib/perspectiva';
import type { HeroPosition } from '../MasterSimulator';

/**
 * Calcula métricas profundas baseadas na Perspectiva Matemática.
 */
export function computeQuantumMetrics (
    quantumPerspectiva: Record<string, any>,
    activePlayers: number,
    heroInvested: number,
    currentPot: number,
    stacks: number[],
    heroRawStack: number,
    totalTableChips: number
) {
    const eq = quantumPerspectiva.currentEquityPct ?? 0.5;
    const deltaWinPct = quantumPerspectiva.deltaWinPct ?? 0;
    const deltaLosePct = quantumPerspectiva.deltaLosePct ?? 0;
    const evFoldPct = quantumPerspectiva.dynamicEvFold ?? 0;
    const rFactor = quantumPerspectiva.realizationFactor ?? 1;
    const fgsHealth = quantumPerspectiva.fgsHealth ?? 1;
    const deltaHabilidade = 50;
    const sEff = Math.min( stacks[ 0 ] ?? 40, stacks[ 1 ] ?? 40 ); // SOTA: Auto-healing na inferência de stacks locais
    const k = 0.05;
    const baseRioPct = 0.15;

    const amortizedEdgeMultiplier = 1 + ( ( deltaHabilidade / 100 ) * ( 1 - Math.exp( -k * sEff ) ) );
    const adjustedDeltaWin = deltaWinPct * amortizedEdgeMultiplier;

    const opponents = Math.max( 1, activePlayers - 1 );
    // SOTA: Escalonamento Quadrático (x^2) para Multiway (Morte do Anti-Smoothing)
    const mwFactor = Math.pow( opponents, 2 );
    const baseRio = heroInvested * baseRioPct;
    let rioMw = baseRio * mwFactor;

    // SOTA: Vetor de Manutenção de Monopólio
    const monopolyFactor = totalTableChips > 0 ? ( heroRawStack / totalTableChips ) : 0;
    if ( monopolyFactor >= 0.35 )
    {
        // Decaimento abrupto (80%) do RIO para o monopolista (Imunidade à catástrofe silenciosa)
        rioMw *= 0.2;
    }

    // SOTA: O Fold não sofre RIO. O RIO é o passivo estrutural de continuar na mão.
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

/**
 * Gera as métricas para as ações (Fold, Call, Raise) no painel.
 */
export function calculateActionMetrics ( params: {
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
    totalTableChips: number;
} ) {
    const { heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers, totalTableChips } = params;
    const fallbackFold = quantumPerspectiva ? quantumPerspectiva.dynamicEvFold : -heroInvested * ( 1 + ( rpForDash / 200 ) );
    const foldPerspectiva = apiQuantumMetrics?.adjustedEvFold ?? fallbackFold;
    const fallbackCall = quantumPerspectiva ? quantumPerspectiva.perspectivaPct : ( currentPot * 0.3 );
    const callPerspectiva = apiQuantumMetrics?.perspectiva ?? fallbackCall;
    const callChipEv = quantumPerspectiva ? ( quantumPerspectiva.deltaWinPct * 0.5 + quantumPerspectiva.deltaLosePct * 0.5 ) : currentPot * 0.3;
    const opponents = Math.max( 1, activePlayers - 1 );
    const multiwayMultiplier = Math.pow( opponents, 2 );
    let baseRioLiability = ( quantumPerspectiva ? quantumPerspectiva.rioLiability : rpForDash ) * multiwayMultiplier;

    // SOTA: Vetor de Manutenção de Monopólio amortece a tensão global
    const isMonopolist = totalTableChips > 0 && ( heroRawStack / totalTableChips ) >= 0.35;
    if ( isMonopolist )
    {
        baseRioLiability *= 0.2;
    }

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

/**
 * Calcula a erosão base do FGS (Future Game Simulations).
 */
export function calculateBaseFgsErosion (
    quantumPerspectiva: Record<string, any> | null,
    blindsRisingSoon: boolean,
    anteSize: number,
    heroPosition: HeroPosition,
    heroRawStack: number,
    totalTableChips: number
): number {
    if ( quantumPerspectiva ) return quantumPerspectiva.dynamicEvFold - quantumPerspectiva.deltaFoldPct;
    if ( blindsRisingSoon )
    {
        const timeErosion = -( anteSize / 100 ) * 3;

        // SOTA: Vetor de Manutenção de Monopólio
        const isMonopolist = totalTableChips > 0 && ( heroRawStack / totalTableChips ) >= 0.35;
        if ( isMonopolist )
        {
            // Inversão Gravitacional (FGS Positivo): O Monopolista lucra passivamente com a morte térmica dos adversários
            return Math.abs( timeErosion ) * 1.5;
        }

        // SOTA: Inversão Gravitacional de Órbita (FGS t-3)
        const penaltyMap: Record<HeroPosition, number> = { IP: -1.5, BB: -0.5, SB: 0 };
        return timeErosion + ( penaltyMap[ heroPosition ] ?? 0 );
    }
    return 0;
}
