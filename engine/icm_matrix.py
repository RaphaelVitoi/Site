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
6. RP_{i,j} = (BF_{i,j} - 1) / (BF_{i,j} + 1) * 100%
"""

from __future__ import annotations

from typing import Any


def _compute_branch(
    current_pos: int,
    used_players: list[int],
    current_prob: float,
    remaining_chips: float,
    stacks: list[float],
    n_payouts: int,
    prob_matrix: list[list[float]],
) -> None:
    if current_pos >= n_payouts or remaining_chips <= 0:
        return

    for p_idx, stack in enumerate(stacks):
        if p_idx in used_players or stack <= 0:
            continue

        prob_this_pos = stack / remaining_chips
        branch_prob = current_prob * prob_this_pos
        prob_matrix[p_idx][current_pos] += branch_prob

        if current_pos + 1 < n_payouts and remaining_chips - stack > 0:
            _compute_branch(
                current_pos + 1,
                used_players + [p_idx],
                branch_prob,
                remaining_chips - stack,
                stacks,
                n_payouts,
                prob_matrix,
            )


def calculate_malmuth_harville_icm(
    stacks: list[float],
    payouts: list[float],
) -> list[float]:
    """Calcula a equidade financeira ($EV) de cada jogador pelo modelo Malmuth-Harville.

    Args:
        stacks: Lista com o stack de cada jogador em fichas.
        payouts: Lista com os payouts ordenados do 1o ao M-esimo colocado.

    Returns:
        Lista com o $EV esperado de cada jogador no torneio.
    """
    n_players = len(stacks)
    if n_players == 0:
        return []

    total_chips = sum(stacks)
    if total_chips <= 0:
        return [0.0] * n_players

    # Ajusta payouts caso haja mais premios que jogadores
    n_payouts = min(len(payouts), n_players)
    active_payouts = payouts[:n_payouts]

    # Probabilidades de cada jogador i terminar na posicao pos (0-indexed)
    prob_matrix = [[0.0 for _ in range(n_payouts)] for _ in range(n_players)]

    # 1o Lugar: probabilidade proporcional direta do stack
    for i in range(n_players):
        prob_matrix[i][0] = stacks[i] / total_chips

    # 2o ao M-esimo lugar via permutacao recursiva exata
    if n_payouts > 1:
        for first_player, stack in enumerate(stacks):
            if stack > 0:
                rem_chips = total_chips - stack
                if rem_chips > 0:
                    _compute_branch(
                        1,
                        [first_player],
                        prob_matrix[first_player][0],
                        rem_chips,
                        stacks,
                        n_payouts,
                        prob_matrix,
                    )

    # Multiplica pela estrutura de payouts
    return [sum(prob_matrix[i][k] * active_payouts[k] for k in range(n_payouts)) for i in range(n_players)]


def compute_bubble_factor_matrix(
    stacks: list[float],
    payouts: list[float],
    player_names: list[str] | None = None,
) -> dict[str, Any]:
    """Calcula a matriz completa de Bubble Factors (BF), Risk Premiums (RP) e Equidade Requerida entre todos os pares (i, j).

    Args:
        stacks: Stacks dos jogadores em fichas.
        payouts: Estrutura de premiacao.
        player_names: Nomes/labels opcionais dos jogadores.

    Returns:
        Dicionario contendo as matrizes estruturadas e metricas taticas.
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
