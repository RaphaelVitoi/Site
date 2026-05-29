/**
 * IDENTITY: Motor AlgorÃ­tmico ICM
 * PATH: src/lib/icmEngine.ts
 * ROLE: Executar o algoritmo clÃ¡ssico de Malmuth-Harville para cÃ¡lculo de Equidade em Torneios (ICM).
 *       Isolado de React/UI para permitir testes matemÃ¡ticos puros e mÃ¡xima performance.
 * BINDING: [src/components/ICMCalculator.tsx] (Alimenta o estado da Interface Visual)
 * TELEOLOGY: Evoluir como motor base para suportar simulaÃ§Ãµes FGS (Future Game Simulation) e cÃ¡lculos de colisÃ£o de ranges baseados em dados massivos (MDA).
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
 * [SOTA v7.0 GOLD]: Delegado para o motor ultra-otimizado O(2^N) do `perspectiva.ts`
 * para garantir Economia de Shannon e evitar a explosao combinatoria O(N!).
 */
export declare function calculateMalmuthHarville(players: ICMPlayer[], prizes: number[], totalPool?: number): ICMResult[];
