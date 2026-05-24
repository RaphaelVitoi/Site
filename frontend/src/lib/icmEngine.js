import { calculateMapaICM } from './perspectiva';
import { logger } from '@/lib/logger';
/**
 * Calcula a equidade exata (ICM) baseada no Algoritmo de Malmuth-Harville.
 * [SOTA v6.2.1 GOLD]: Delegado para o motor ultra-otimizado O(2^N) do `perspectiva.ts`
 * para garantir Economia de Shannon e evitar a explosao combinatoria O(N!).
 */
export function calculateMalmuthHarville(players, prizes, totalPool) {
    const totalPrizePool = prizes.reduce((sum, p) => sum + p, 0);
    const denominatorForPercent = totalPool != null && totalPool > 0 ? totalPool : totalPrizePool;
    // Edge case: Sem fichas ou sem premios
    if (players.length === 0 || totalPrizePool === 0) {
        return players.map((p) => ({
            id: p.id,
            name: p.name,
            equity: 0,
            equityPercent: 0,
            winProb: 0,
        }));
    }
    // SOTA: Barreira Termodinâmica (Fail-Fast) contra Starvation de CPU e OOM.
    // Para N > 10, o motor reverte graciosamente para ChipEV, garantindo Fricção Zero na UI.
    if (players.length > 10) {
        // Nota: O valor de N (players.length) deve representar o número de jogadores na mesa.
        // Se N for inesperadamente alto (ex: 3013 como visto em logs), isso pode indicar um problema
        // na fonte de dados que popula o array 'players' ou um uso indevido da função para cenários
        // que não sejam de mesa final de torneio. A função deliberadamente reverte para ChipEV neste caso.
        logger.warn('ICM_ENGINE', `N=${players.length} excede o limite termodinâmico seguro. Revertendo para ChipEV.`);
        const totalChips = players.reduce((sum, p) => sum + p.stack, 0);
        return players.map((p) => {
            const chipPct = totalChips > 0 ? p.stack / totalChips : 0;
            const eq = chipPct * totalPrizePool;
            return {
                id: p.id,
                name: p.name,
                equity: eq,
                equityPercent: denominatorForPercent > 0 ? (eq / denominatorForPercent) * 100 : 0,
                winProb: chipPct, // Em ChipEV, a probabilidade de cravada é estritamente proporcional ao stack
            };
        });
    }
    // SOTA: Extrai os stacks e repassa para a engine ultra-rapida c/ memoizacao
    const stacks = players.map((p) => p.stack);
    const mapaResult = calculateMapaICM(stacks, prizes);
    // Formata o resultado de saida com as equities calculadas via memoizacao
    return players.map((p, i) => {
        const eq = mapaResult.equities[i] || 0;
        const winP = mapaResult.positionProbs[i]?.[0] ?? 0;
        return {
            id: p.id,
            name: p.name,
            equity: eq,
            equityPercent: denominatorForPercent > 0 ? (eq / denominatorForPercent) * 100 : 0,
            winProb: winP,
        };
    });
}
