/**
 * IDENTITY: Motor de Perspectiva Matemática SOTA v6.2.1 GOLD (VITOI - GOLD)
 * PATH: src/lib/perspectiva.ts
 * ROLE: Core algorítmico da Equação Unificada SOTA (Purificada).
 *       PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]
 *
 * @format
 */
export interface MapaICMResult {
    positionProbs: number[][];
    equities: number[];
    totalChips: number;
}
export type StackTier = 'micro' | 'short' | 'mid' | 'big' | 'chipleader';
export interface PerspectivaResult {
    handEquity: number;
    currentEquityPct: number;
    deltaWinPct: number;
    deltaLosePct: number;
    deltaFoldPct: number;
    valuation: number;
    rioLiability: number;
    fgsHealth: number;
    survivalPressure: number;
    dynamicEvFold: number;
    perspectivaPct: number;
    amortizedEdge: number;
    ci: number;
    marginInstability: number;
    threshEq: number;
    realizationFactor: number;
    isActionBetterThanFold: boolean;
    diagnostico: string;
    bountyPower: number;
    currentMapaICM: number[];
    winMapaICM: number[];
    loseMapaICM: number[];
}
export interface PerspectivaInput {
    stacks: number[];
    prizes: number[];
    heroIdx: number;
    villainIdx: number;
    potSize: number;
    heroCost: number;
    winProb: number;
    realizationFactor: number;
    edgeBase: number;
    bountyValue?: number;
    kappa?: number;
    numPlayersInPot?: number;
    humanNoiseFactor?: number;
    isNearPayjump?: boolean;
    blindsRisingSoon?: boolean;
    currentEquityPct?: number;
    heroPosition?: string;
    spr?: number;
    investidoAcumulado?: number;
    blindCost?: number;
}
export declare function calculateMapaICM(stacks: number[], prizes: number[]): MapaICMResult;
export declare function classifyTier(stack: number, stacks: number[]): StackTier;
export declare function calculateAmortizedEdge(edgeBase: number, stackHero: number, stackVillain: number, isVacuum?: boolean, spr?: number): {
    edgePenalty: number;
    amortizedEdge: number;
};
export declare function calculatePerspectivaVitoi(input: PerspectivaInput): PerspectivaResult;
/**
 * Calcula a Gravidade Estratégica (G) baseada no tamanho do pote.
 * G = ln(pot / 7.5). 7.5bb é o baseline de SRP.
 */
export declare function calculateGravity(potSize: number): number;
export declare function calculateRioTension(// NOSONAR
heroInvested: number, currentPot: number, heroRawStack: number, heroPosition: 'IP' | 'OOP', baseRioLiability: number, activePlayers?: number, humanNoiseFactor?: number, mitigationFactor?: number): number;
export type ReferencePointStatus = 'baseline' | 'tilt' | 'protecting' | 'bubble';
/**
 * Aplica a Curva de Utilidade (Value Function) da Teoria do Prospecto.
 * Ganhos são côncavos (retorno marginal decrescente).
 * Perdas são convexas e mais inclinadas (Loss Aversion).
 */
export declare function calculateUtilityEV(rawEv: number, status?: ReferencePointStatus, lossAversionBase?: number, stackEff?: number, fgsHealth?: number): number;
export declare function computeQuantumMetrics(quantumPerspectiva: PerspectivaResult | null): {
    amortizedEdgeMultiplier: number;
    rioMw: number;
    adjustedEvFold: number;
    esperanca: number;
    expectativa: number;
    perspectiva: number;
    threshEq: null;
    ci: null;
    marginInstability: number;
    isSolvent: boolean;
    isActionable: boolean;
} | {
    amortizedEdgeMultiplier: number;
    rioMw: number;
    adjustedEvFold: number;
    esperanca: number;
    expectativa: number;
    perspectiva: number;
    threshEq: number;
    ci: number;
    marginInstability: number;
    isSolvent: boolean;
    isActionable: boolean;
};
