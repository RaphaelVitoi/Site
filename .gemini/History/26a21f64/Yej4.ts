/**
 * CORE MATEMÁTICO: ICM ENGINE (Malmuth-Weitzman Model)
 * Diretriz: Pureza, Velocidade e Isolamento (Sem dependências do DOM).
 */

export interface PlayerState {
    id: string;
    name: string;
    chips: number;
}

export interface IcmResult {
    playerId: string;
    ev: number;       // Expected Value em $
    evPercent: number; // Porcentagem do Prize Pool
}

/**
 * Calcula o Expected Value (ICM) para cada jogador na mesa.
 * @param players Lista de jogadores com seus respectivos stacks.
 * @param payouts Lista de premiações (ex: [500, 300, 200]).
 * @returns Record com o ID do jogador e seu EV financeiro.
 */
export function calculateICM(players: PlayerState[], payouts: number[]): Record<string, IcmResult> {
    const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
    const results: Record<string, IcmResult> = {};

    // Validação Anti-Entropia: Sem fichas ou sem prêmios? EV = 0
    if (totalChips === 0 || payouts.length === 0 || players.length === 0) {
        players.forEach(p => {
            results[p.id] = { playerId: p.id, ev: 0, evPercent: 0 };
        });
        return results;
    }

    const totalPrizePool = payouts.reduce((sum, prize) => sum + prize, 0);

    // =====================================================================
    // ESQUELETO DO ALGORITMO RECURSIVO (Malmuth-Weitzman SOTA)
    // A ser expandido no próximo passo para suportar N-Jogadores via Memoization.
    // Abaixo, implementamos uma aproximação proporcional direta inicial (Chip EV)
    // para validar o fluxo de dados da interface antes da carga pesada.
    // =====================================================================

    players.forEach(p => {
        const chipPercentage = p.chips / totalChips;
        results[p.id] = {
            playerId: p.id,
            ev: chipPercentage * totalPrizePool, // Mock Inicial (Chip EV) -> Será evoluído para ICM
            evPercent: chipPercentage * 100
        };
    });

    return results;
}