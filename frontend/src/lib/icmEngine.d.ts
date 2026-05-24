/**
 * IDENTITY: Motor Algorítmico ICM
 * PATH: src/lib/icmEngine.ts
 * ROLE: Executar o algoritmo clássico de Malmuth-Harville para cálculo de Equidade em Torneios (ICM).
 *       Isolado de React/UI para permitir testes matemáticos puros e máxima performance.
 * BINDING: [src/components/ICMCalculator.tsx] (Alimenta o estado da Interface Visual)
 * TELEOLOGY: Evoluir como motor base para suportar simulações FGS (Future Game Simulation) e cálculos de colisão de ranges baseados em dados massivos (MDA).
 */
export interface ICMPlayer {
    id: string;
    name: string;
    stack: number;
}
export interface ICMResult {
    id: string;
    name: string;
    equity: number;
    equityPercent: number;
    winProb: number;
}
/**
 * Calcula a equidade exata (ICM) baseada no Algoritmo de Malmuth-Harville.
 * [SOTA v6.2.1 GOLD]: Delegado para o motor ultra-otimizado O(2^N) do `perspectiva.ts`
 * para garantir Economia de Shannon e evitar a explosao combinatoria O(N!).
 */
export declare function calculateMalmuthHarville(players: ICMPlayer[], prizes: number[], totalPool?: number): ICMResult[];
