# engine/icm_matrix.py
"""SOTA Independent Chip Model (ICM) & Bubble Factor Matrix Engine.

Portado e calibrado sob governanca de Raphael Vitoi para calculo exato de
equidade em torneios (Malmuth-Harville) e matrizes de Bubble Factor / Risk Premium.

Formalismo:
1. Malmuth-Harville: P(i em k-esimo | j_1..j_{k-1}) = s_i / (Total - sum(s_{j_1..j_{k-1}}))
2. $EV_i = sum_{k=1}^M Payout_k * P(i termina em k)
3. Delta $EV_i(Win) = $EV_i(s_i + s_eff, s_j - s_eff) - $EV_i(Base)
4. Delta $EV_i(Lose) = $EV_i(Base) - $EV_i(s_i - s_eff, s_j + s_eff)
5. BF_{i,j} = Delta $EV_i(Lose) / Delta $EV_i(Win)
6. Para um all-in binario simetrico, RP_{i,j} = (BF_{i,j} - 1) / (BF_{i,j} + 1) * 100%.

Limite: esta matriz nao calcula pot odds, bounties, rake, ranges, arvores
pos-flop nem transicoes futuras. Portanto, a RP produzida e uma baseline
pairwise de all-in, nao uma recomendacao universal de call ou sizing.
"""

from __future__ import annotations

from math import isfinite
from typing import Any


def calculate_malmuth_harville_icm(
    stacks: list[float],
    payouts: list[float],
) -> list[float]:
    """Malmuth-Harville exato, agregando ordens pelo conjunto ja premiado.

    Stacks zero ocupam as ultimas posicoes. Sem ordem de eliminacao informada,
    dividem igualmente os premios dessas posicoes (convencao de empate).
    O vetor totalmente zerado continua sendo um cenario vazio, sem resultado.
    Esta convencao pertence ao baseline ICM, nao define a teoria PMev.
    """
    n = len(stacks)
    if any(not isfinite(value) or value < 0 for value in [*stacks, *payouts]):
        raise ValueError("Stacks e payouts devem ser finitos e nao negativos")
    ev = [0.0] * n
    if not n or not payouts or sum(stacks) <= 0:
        return ev
    active = [i for i, stack in enumerate(stacks) if stack > 0]
    zeros = n - len(active)
    prizes = payouts[:n]
    if zeros:
        terminal_prize = sum(prizes[len(active):]) / zeros
        for i, stack in enumerate(stacks):
            if stack == 0:
                ev[i] = terminal_prize

    # Cada estado agrega todas as permutacoes do mesmo conjunto de vencedores.
    states = {0: 1.0}
    for prize in prizes[:len(active)]:
        next_states: dict[int, float] = {}
        for mask, probability in states.items():
            remaining = [i for i in active if not mask & (1 << i)]
            chips = sum(stacks[i] for i in remaining)
            for i in remaining:
                branch = probability * stacks[i] / chips
                ev[i] += branch * prize
                next_mask = mask | (1 << i)
                next_states[next_mask] = next_states.get(next_mask, 0.0) + branch
        states = next_states
    return ev


def compute_bubble_factor_matrix(
    stacks: list[float],
    payouts: list[float],
    player_names: list[str] | None = None,
) -> dict[str, Any]:
    """Calcula uma baseline pairwise de all-in para BF, RP e equity requerida.

    Args:
        stacks: Stacks dos jogadores em fichas.
        payouts: Estrutura de premiacao.
        player_names: Nomes/labels opcionais dos jogadores.

    Returns:
        Dicionario contendo matrizes estruturadas. A conversao RP/equity requerida
        assume confronto binario simetrico; nao substitui uma arvore de decisao.
    """
    n = len(stacks)
    if player_names is None:
        player_names = [f"P{i + 1}" for i in range(n)]

    base_ev = calculate_malmuth_harville_icm(stacks, payouts)

    bf_matrix: list[list[float]] = [[1.0 for _ in range(n)] for _ in range(n)]
    rp_matrix: list[list[float]] = [[0.0 for _ in range(n)] for _ in range(n)]
    req_equity_matrix: list[list[float]] = [[50.0 for _ in range(n)] for _ in range(n)]
    delta_win_matrix: list[list[float]] = [[0.0 for _ in range(n)] for _ in range(n)]
    delta_lose_matrix: list[list[float]] = [[0.0 for _ in range(n)] for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i == j or stacks[i] <= 0 or stacks[j] <= 0:
                continue

            eff_stack = min(stacks[i], stacks[j])

            # Cenario 1: Jogador i ganha de j (+eff_stack)
            win_stacks = list(stacks)
            win_stacks[i] += eff_stack
            win_stacks[j] -= eff_stack
            ev_win = calculate_malmuth_harville_icm(win_stacks, payouts)[i]
            delta_win = max(1e-6, ev_win - base_ev[i])
            delta_win_matrix[i][j] = round(delta_win, 2)

            # Cenario 2: Jogador i perde para j (-eff_stack)
            lose_stacks = list(stacks)
            lose_stacks[i] -= eff_stack
            lose_stacks[j] += eff_stack
            ev_lose = calculate_malmuth_harville_icm(lose_stacks, payouts)[i]
            delta_lose = max(1e-6, base_ev[i] - ev_lose)
            delta_lose_matrix[i][j] = round(delta_lose, 2)

            # Bubble Factor = Delta Lose / Delta Win
            bf = delta_lose / delta_win
            bf_matrix[i][j] = round(bf, 3)

            # Risk Premium = (BF - 1) / (BF + 1) * 100%
            rp = ((bf - 1.0) / (bf + 1.0)) * 100.0
            rp_matrix[i][j] = round(max(0.0, rp), 2)

            # Required Equity = BF / (BF + 1) * 100%
            req_eq = (bf / (bf + 1.0)) * 100.0
            req_equity_matrix[i][j] = round(req_eq, 2)

    return {
        "n_players": n,
        "player_names": player_names,
        "stacks": stacks,
        "payouts": payouts,
        "base_ev": [round(ev, 2) for ev in base_ev],
        "bf_matrix": bf_matrix,
        "rp_matrix": rp_matrix,
        "req_equity_matrix": req_equity_matrix,
        "delta_win_matrix": delta_win_matrix,
        "delta_lose_matrix": delta_lose_matrix,
    }
