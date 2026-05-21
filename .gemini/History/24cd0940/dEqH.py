"""
Motor de Leitura Bayesiana de Ranges (SOTA).
Calcula a contracao dos ranges oponentes aplicando o Teorema de Bayes a cada acao observada.
"""

from typing import List

RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]


def update_posterior(
    prior_matrix: List[List[float]], likelihood_matrix: List[List[float]]
) -> List[List[float]]:
    """
    Contracao Bayesiana pura.
    Multiplica o Prior (frequencia previa) pelo Likelihood (probabilidade da acao dada a mao)
    e normaliza (Marginal Likelihood) para obter o Posterior.
    """
    posterior = [[0.0 for _ in range(13)] for _ in range(13)]
    marginal = 0.0

    for r in range(13):
        for c in range(13):
            # Numerador: P(Acao|Mao) * P(Mao)
            posterior[r][c] = likelihood_matrix[r][c] * prior_matrix[r][c]
            marginal += posterior[r][c]

    # Normalizacao para garantir que a soma das probabilidades seja 1.0 (ou 100%)
    if marginal > 0:
        for r in range(13):
            for c in range(13):
                posterior[r][c] /= marginal

    return posterior


def build_likelihood_matrix(
    action: str, board: List[str], profile: str = "reg"
) -> List[List[float]]:
    """
    Constroi a matriz de Likelihood baseada na acao e na textura do board.
    Aqui serao injetadas as heuristicas taticas do motor (ex: Smart Sniper, RIO).
    """
    likelihood = [[0.0 for _ in range(13)] for _ in range(13)]
    board_ranks = [card[0].upper() for card in board if card]

    # Dicionario base de frequencias populacionais P(Acao | Categoria)
    heuristics = {
        "top_pair_plus": {
            "bet": 0.75,
            "check": 0.25,
            "raise": 0.60,
            "fold": 0.05,
            "call": 0.80,
        },
        "overpair": {
            "bet": 0.85,
            "check": 0.15,
            "raise": 0.75,
            "fold": 0.02,
            "call": 0.90,
        },
        "mid_bottom_pair": {
            "bet": 0.30,
            "check": 0.70,
            "raise": 0.10,
            "fold": 0.65,
            "call": 0.50,
        },
        "weak_pocket_pair": {
            "bet": 0.20,
            "check": 0.80,
            "raise": 0.05,
            "fold": 0.85,
            "call": 0.30,
        },
        "air_or_draw": {
            "bet": 0.35,
            "check": 0.65,
            "raise": 0.25,
            "fold": 0.95,
            "call": 0.20,
        },
    }

    def _categorize_hand(r: int, c: int) -> str:
        rank1, rank2 = RANKS[r], RANKS[c]
        is_pair = r == c

        if not board_ranks:
            return "air_or_draw"  # Pre-flop simplificado

        top_board = board_ranks[0]

        if rank1 in board_ranks or rank2 in board_ranks:
            if rank1 == top_board or rank2 == top_board:
                return "top_pair_plus"
            return "mid_bottom_pair"

        if is_pair:
            if r < RANKS.index(top_board):
                return "overpair"
            return "weak_pocket_pair"

        return "air_or_draw"

    for r in range(13):
        for c in range(13):
            cat = _categorize_hand(r, c)
            p_action = heuristics.get(cat, {}).get(action, 0.5)

            # Aplicacao de Distorcao Psicologica (MDA Profile)
            if action in ("bet", "raise") and cat == "air_or_draw":
                if profile == "nit":
                    p_action *= 0.2
                elif profile == "aggro":
                    p_action = min(1.0, p_action * 1.8)
            elif action == "call" and cat == "mid_bottom_pair" and profile == "station":
                p_action = min(1.0, p_action * 1.5)

            likelihood[r][c] = p_action

    return likelihood
