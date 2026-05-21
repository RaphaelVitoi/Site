/**
 * IDENTITY: Motor de Métricas Quânticas (SOTA)
 * PATH: src/components/simulator/engine/quantumMetrics.ts
 * ROLE: Centralizar os cálculos de Perspectiva Matemática, Valuation, RIO e FGS.
 * BINDING: [src/components/simulator/MasterSimulator.tsx]
 */

import type { PerspectivaResult } from '@/lib/perspectiva';
import { calculateRioTension } from '@/lib/perspectiva';
import type { HeroPosition } from '../MasterSimulator';

/**
 * Calcula métricas profundas baseadas na Perspectiva Matemática.
 */
export function computeQuantumMetrics(
    quantumPerspectiva: PerspectivaResult,
    activePlayers: number,
    heroInvested: number,
    currentPot: number,
    stacks: number[],
    heroRawStack: number,
    totalTableChips: number,
    handEquity: number = 50,
    kappa: number = 0.5
) {
    // SOTA: Axioma Lipe Piv (Regressão Bayesiana)
    // Cura da Esquizofrenia: A Equidade base é puramente ditada pelas Pot Odds. O Fator Ψ regula a fé na matemática ideal.
    const winProb = handEquity / 100;
    const baselineEquity = (currentPot + heroInvested) > 0 ? heroInvested / (currentPot + heroInvested) : 0;
    const bayesianWinProb = baselineEquity + kappa * (winProb - baselineEquity);

    const deltaWinPct = quantumPerspectiva.deltaWinPct ?? 0;
    const deltaLosePct = quantumPerspectiva.deltaLosePct ?? 0;
    const evFoldPct = quantumPerspectiva.dynamicEvFold ?? 0;
    const rFactor = 1; // SOTA: A realização (R) já foi sintetizada no núcleo do Motor
    const fgsHealth = quantumPerspectiva.fgsHealth ?? 1;

    // SOTA: Amortização de Edge baseada em log(S)
    // A árvore de decisão colapsa em stacks curtos, neutralizando a Edge e aumentando a variância.
    const sEff = Math.max( 2, Math.min( stacks[0] ?? 40, stacks[1] ?? 40 ) );
    const varianceSigma = 0.8; // Variância base de colisão
    const deltaHabilidade = 1.2; // Superioridade técnica do Hero
    // Er(S) = (Sigma / DeltaHabilidade) * log10(S) -> Escalado para fator multiplicador
    let amortizedEdgeMultiplier = ( varianceSigma / deltaHabilidade ) * Math.log10( sEff ) * 1.5;
    amortizedEdgeMultiplier = Math.max( 0.2, Math.min( 2.5, amortizedEdgeMultiplier ) ); // Limites de amortização

    const adjustedDeltaWin = deltaWinPct * amortizedEdgeMultiplier;

    const opponents = Math.max( 1, activePlayers - 1 );
    // SOTA: Escalonamento Quadrático (x^2) para Multiway (Morte do Anti-Smoothing)
    const mwFactor = Math.pow( opponents, 2 );
    const baseRioPct = 0.15;
    const baseRio = heroInvested * baseRioPct;
    let rioMw = baseRio * mwFactor;

    // SOTA: Vetor de Manutenção de Monopólio
    const monopolyFactor = totalTableChips > 0 ? ( heroRawStack / totalTableChips ) : 0;
    let monopolyMaintenanceTax = 0;
    if ( monopolyFactor >= 0.35 ) {
        // Decaimento abrupto (80%) do RIO para o monopolista (Imunidade à catástrofe silenciosa)
        rioMw *= 0.2;
        // Taxa de Manutenção de Monopólio: O custo sistêmico de foldar e permitir que um stack médio devore um short stack
        monopolyMaintenanceTax = ( totalTableChips * 0.05 ) * ( evFoldPct > 0 ? 1 : -1 );
    }

    // SOTA: O Fold não sofre RIO. O RIO é o passivo estrutural de continuar na mão.
    const adjustedEvFold = evFoldPct + monopolyMaintenanceTax;

    const esperanca = ( bayesianWinProb * adjustedDeltaWin ) + ( ( 1 - bayesianWinProb ) * deltaLosePct );
    const expectativa = ( bayesianWinProb * adjustedDeltaWin * rFactor * fgsHealth ) + ( ( 1 - bayesianWinProb ) * deltaLosePct );

    // SOTA: Instabilidade de EVs (Mutação da Margem)
    // Evidencia a fragilidade do EV marginal, adicionando incerteza baseada no SPR e agressão
    const marginInstability = Math.max( 0.01, 1 / sEff ) * 100; // Incerteza %

    // SOTA: Equação de Perspectiva Matemática (Diferencial de Abismo)
    // PM = (Expectativa - RIO) - EV_Fold
    const perspectiva = expectativa - rioMw - adjustedEvFold;

    const denom = ( adjustedDeltaWin * rFactor * fgsHealth ) - deltaLosePct;
    let threshEq = null;
    // SOTA: A Equidade Limite (Teto) DEVE subir para compensar o passivo do RIO.
    if ( Math.abs( denom ) > 1e-6 ) threshEq = Math.max( 0, Math.min( 1, ( adjustedEvFold + rioMw - deltaLosePct ) / denom ) );

    let ci = null;
    const potOdds = ( currentPot + heroInvested ) > 0 ? heroInvested / ( currentPot + heroInvested ) : 0;
    if ( threshEq !== null && threshEq > 0 ) ci = potOdds / threshEq;

    return {
        amortizedEdgeMultiplier, rioMw, adjustedEvFold, esperanca, expectativa, perspectiva, threshEq, ci, marginInstability,
        isSolvent: ci !== null && ci >= 1,
        isActionable: perspectiva > 0
    };
}

/**
 * Gera as métricas para as ações (Fold, Call, Raise) no painel.
 */
export function calculateActionMetrics( params: {
    heroInvested: number;
    currentPot: number;
    bfForDash: number;
    rpForDash: number;
    quantumPerspectiva: PerspectivaResult | null;
    heroRawStack: number;
    heroPosition: HeroPosition;
    baseFgsErosion: number;
    apiQuantumMetrics?: {
        adjustedEvFold: number;
        perspectiva: number;
        ci: number | null;
    } | null;
    activePlayers: number;
    totalTableChips: number;
} ) {
    const { heroInvested, currentPot, bfForDash, rpForDash, quantumPerspectiva, heroRawStack, heroPosition, baseFgsErosion, apiQuantumMetrics, activePlayers, totalTableChips } = params;
    const fallbackFold = quantumPerspectiva ? (quantumPerspectiva.dynamicEvFold ?? 0) : -heroInvested * ( 1 + ( rpForDash / 200 ) );
    const foldPerspectiva = apiQuantumMetrics?.adjustedEvFold ?? fallbackFold;
    const fallbackCall = quantumPerspectiva ? (quantumPerspectiva.perspectivaPct ?? 0) : ( currentPot * 0.3 );
    const callPerspectiva = apiQuantumMetrics?.perspectiva ?? fallbackCall;
    const callChipEv = quantumPerspectiva ? ( ( quantumPerspectiva.deltaWinPct ?? 0 ) * 0.5 + ( quantumPerspectiva.deltaLosePct ?? 0 ) * 0.5 ) : currentPot * 0.3;
    const opponents = Math.max( 1, activePlayers - 1 );
    const multiwayMultiplier = Math.pow( opponents, 2 );
    let baseRioLiability = ( quantumPerspectiva ? ( quantumPerspectiva.rioLiability ?? 0 ) : rpForDash ) * multiwayMultiplier;

    // SOTA: Vetor de Manutenção de Monopólio amortece a tensão global
    const isMonopolist = totalTableChips > 0 && ( heroRawStack / totalTableChips ) >= 0.35;
    if ( isMonopolist ) {
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
export function calculateBaseFgsErosion(
    quantumPerspectiva: PerspectivaResult | null,
    blindsRisingSoon: boolean,
    anteSize: number,
    heroPosition: HeroPosition,
    heroRawStack: number,
    totalTableChips: number
): number {
    if ( quantumPerspectiva ) return ( quantumPerspectiva.dynamicEvFold ?? 0 ) - ( quantumPerspectiva.deltaFoldPct ?? 0 );
    if ( blindsRisingSoon ) {
        const timeErosion = -( anteSize / 100 ) * 3;

        // SOTA: Vetor de Manutenção de Monopólio
        const isMonopolist = totalTableChips > 0 && ( heroRawStack / totalTableChips ) >= 0.35;
        if ( isMonopolist ) {
            // Inversão Gravitacional (FGS Positivo): O Monopolista lucra passivamente com a morte térmica dos adversários
            return Math.abs( timeErosion ) * 1.5;
        }

        // SOTA: Inversão Gravitacional de Órbita (FGS t-3)
        const penaltyMap: Record<HeroPosition, number> = { IP: -1.5, BB: -0.5, SB: 0 };
        return timeErosion + ( penaltyMap[heroPosition] ?? 0 );
    }
    return 0;
}
