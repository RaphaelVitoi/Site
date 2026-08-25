"""
Motor de Leitura Bayesiana de Ranges (SOTA).
Calcula a contracao dos ranges oponentes aplicando o Teorema de Bayes a cada acao observada.
"""

from typing import Any
import math  # Refresh IDE
import csv
import json
from pathlib import Path

RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]


def update_posterior(prior_matrix: list[list[float]], likelihood_matrix: list[list[float]]) -> list[list[float]]:
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


def _categorize_hand(r: int, c: int, board_ranks: list[str]) -> str:
    rank1, rank2 = RANKS[r], RANKS[c]
    is_pair = r == c

    if not board_ranks:
        return "air_or_draw"  # Pre-flop simplificado

    top_board = board_ranks[0]

    if rank1 in board_ranks or rank2 in board_ranks:
        if top_board in (rank1, rank2):
            return "top_pair_plus"
        return "mid_bottom_pair"

    if is_pair:
        if r < RANKS.index(top_board):
            return "overpair"
        return "weak_pocket_pair"

    return "air_or_draw"


def _apply_profile_drift(p_action: float, action: str, cat: str, profile: str) -> float:
    if action in ("bet", "raise") and cat == "air_or_draw":
        if profile == "nit":
            return p_action * 0.2
        if profile == "aggro":
            return min(1.0, p_action * 1.8)
    elif action == "call" and cat == "mid_bottom_pair" and profile == "station":
        return min(1.0, p_action * 1.5)
    return p_action


def build_likelihood_matrix(action: str, board: list[str], profile: str = "reg") -> list[list[float]]:
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

    for r in range(13):
        for c in range(13):
            cat = _categorize_hand(r, c, board_ranks)
            p_action = heuristics.get(cat, {}).get(action, 0.5)
            likelihood[r][c] = _apply_profile_drift(p_action, action, cat, profile)

    return likelihood


# ==============================================================================
# SOTA: Integracao do Motor de Perspectiva Matematica (PMev) & Range Generation
# ==============================================================================


def calculate_pmev_call_threshold(
    pot: float,
    call_amount: float,
    bubble_factor: float,
    stack_bb: float,
    position: str = "UTG",
    time_to_blind: float = 5.0,
    edge_base: float = 0.08,
    aggression: float = 0.7,
    loss_aversion_lambda: float = 2.25,
    ante_bb: float = 1.0,
    players_behind: int | None = None,
    structure_speed: str = "REGULAR",
) -> dict[str, Any]:
    """
    Calcula os limiares de equidade comparativos (Pot Odds, ICMev e PMev).
    Aplica a correcao dinamica de orbita, players behind e o coeficiente de aversao a perda lambda.
    """
    # Mapeamento de jogadores restantes atras se nao especificado
    pos_upper = position.upper()
    pos_players_behind_map = {
        "UTG": 8,
        "UTG1": 7,
        "UTG+1": 7,
        "MP": 6,
        "LJ": 6,
        "HJ": 5,
        "CO": 4,
        "BTN": 2,
        "SB": 1,
        "BB": 0,
    }
    actual_players_behind = players_behind if players_behind is not None else pos_players_behind_map.get(pos_upper, 4)

    total_dead_money = max(pot, 1.5 + ante_bb)
    if total_dead_money + call_amount <= 0:
        return {"pot_odds": 0.0, "icm_req": 0.0, "pmev_req": 0.0, "delta_eq": 0.0}

    pot_odds = call_amount / (total_dead_money + call_amount)
    icm_denom = total_dead_money + (call_amount * bubble_factor)
    icm_req = (call_amount * bubble_factor) / icm_denom if icm_denom > 0 else pot_odds

    # Penalidade dinamica de tempo por velocidade de estrutura
    if structure_speed == "TURBO":
        speed_factor = 1.4
    elif structure_speed == "HYPER":
        speed_factor = 1.8
    elif structure_speed == "DEEP":
        speed_factor = 0.8
    else:
        speed_factor = 1.0
    time_penalty = max(0.0, (4.0 - time_to_blind) * 0.25 * speed_factor) if time_to_blind <= 4.0 else 0.0

    # Multiplicador posicional e custo de orbita
    if pos_upper == "UTG":
        pos_multiplier = 1.4
    elif pos_upper in ("UTG1", "UTG+1", "MP", "SB"):
        pos_multiplier = 1.2
    elif pos_upper == "CO":
        pos_multiplier = 0.9
    else:
        pos_multiplier = 0.75
    ev_fold_bb = -(1.5 + ante_bb) / max(actual_players_behind + 1, 2) * (1.0 + time_penalty) * pos_multiplier

    # Fator de aversao a perda lambda de Kahneman (Kahneman & Tversky 1979/1992)
    lambda_weight = (
        math.pow(max(bubble_factor, 0.01), 0.88) / max(bubble_factor, 0.01) * (2.25 / max(loss_aversion_lambda, 1.0))
    )

    # Amortizacao de Edge e Pressao de Orbita
    edge_eff = edge_base * math.log10(max(stack_bb, 1.0)) + 0.15 * aggression * 0.1
    orbit_pressure_adj = abs(ev_fold_bb) * (0.045 if stack_bb <= 20.0 else 0.020)
    edge_discount = edge_eff * (0.35 if stack_bb >= 40.0 else -0.25)

    pmev_req = (icm_req * lambda_weight) - orbit_pressure_adj + edge_discount
    pmev_req = max(0.01, min(0.99, pmev_req))
    delta_eq = pmev_req - icm_req

    return {
        "pot_odds": round(pot_odds, 4),
        "icm_req": round(icm_req, 4),
        "pmev_req": round(pmev_req, 4),
        "delta_eq": round(delta_eq, 4),
        "ev_fold_bb": round(ev_fold_bb, 4),
        "players_behind": actual_players_behind,
    }


def get_preflop_hand_strength_matrix() -> list[list[float]]:
    """
    Gera a matriz 13x13 normalizada de forca/equidade pre-flop baseline.
    Pares na diagonal (AA=0.85 a 22=0.50), suited no triangulo superior, offsuit no inferior.
    """
    matrix = [[0.0 for _ in range(13)] for _ in range(13)]
    for r in range(13):
        for c in range(13):
            high_rank = min(r, c)
            low_rank = max(r, c)
            base_val = 0.85 - (high_rank * 0.035) - (low_rank * 0.020)
            if r == c:  # Par
                val = 0.85 - (r * 0.028)
            elif r < c:  # Suited
                val = base_val + 0.04
            else:  # Offsuit
                val = base_val - 0.02
            matrix[r][c] = max(0.15, min(0.95, round(val, 4)))
    return matrix


def apply_pmev_range_filter(
    range_matrix: list[list[float]],
    pmev_threshold: float,
    hand_strength_matrix: list[list[float]] | None = None,
) -> list[list[float]]:
    """
    Filtra e modula a matriz de range de acordo com a equidade requerida pelo PMev.
    Maos com forca >= threshold sao preservadas; maos marginais sao amortizadas.
    """
    if hand_strength_matrix is None:
        hand_strength_matrix = get_preflop_hand_strength_matrix()

    filtered = [[0.0 for _ in range(13)] for _ in range(13)]
    for r in range(13):
        for c in range(13):
            strength = hand_strength_matrix[r][c]
            prior_weight = range_matrix[r][c]
            if strength >= pmev_threshold:
                if prior_weight > 0.0:
                    filtered[r][c] = round(prior_weight, 4)
                else:
                    # Resgate de mao com equidade lucrativa em PMev
                    boost = min(1.0, (strength - pmev_threshold) / 0.08)
                    filtered[r][c] = round(boost, 4)
            elif strength >= (pmev_threshold - 0.06):
                # Amortizacao linear na borda de indiferenca
                ratio = (strength - (pmev_threshold - 0.06)) / 0.06
                filtered[r][c] = round(prior_weight * ratio, 4)
            else:
                filtered[r][c] = 0.0
    return filtered


def generate_pmev_sensitivity_dataset(
    stacks: list[float] | None = None,
    bfs: list[float] | None = None,
    pot: float = 2.5,
    call_amount: float = 1.0,
) -> list[dict[str, Any]]:
    """
    Compila o dataset completo de sensibilidade PMev vs. ICMev.
    """
    if stacks is None:
        stacks = [15.0, 25.0, 40.0, 60.0]
    if bfs is None:
        bfs = [1.2, 1.5, 1.8, 2.2, 2.6, 3.2]

    results: list[dict[str, Any]] = []
    positions = [("UTG", 2.0), ("BTN", 10.0)]

    for s in stacks:
        for bf in bfs:
            for pos, time_to_blind in positions:
                calc = calculate_pmev_call_threshold(
                    pot=pot,
                    call_amount=call_amount,
                    bubble_factor=bf,
                    stack_bb=s,
                    position=pos,
                    time_to_blind=time_to_blind,
                )
                results.append(
                    {
                        "stack_bb": s,
                        "bubble_factor": bf,
                        "position": pos,
                        "time_to_blind_minutes": time_to_blind,
                        "pot_odds": calc["pot_odds"],
                        "icm_req_equity": calc["icm_req"],
                        "pmev_req_equity": calc["pmev_req"],
                        "delta_equity": calc["delta_eq"],
                        "regime": "short_orbit_pressure" if s <= 25 else "deep_edge_capitalization",
                    }
                )
    return results


def export_pmev_benchmark(
    output_path_json: str,
    output_path_csv: str,
    stacks: list[float] | None = None,
    bfs: list[float] | None = None,
) -> tuple[str, str]:
    """
    Exporta a matriz de sensibilidade PMev em JSON e CSV para validacao em solvers.
    """
    dataset = generate_pmev_sensitivity_dataset(stacks=stacks, bfs=bfs)

    # Export JSON
    p_json = Path(output_path_json)
    p_json.parent.mkdir(parents=True, exist_ok=True)
    with open(p_json, "w", encoding="utf-8") as f:
        json.dump({"benchmark_version": "PMev_3.2_SOTA", "rows": dataset}, f, indent=2)

    # Export CSV
    p_csv = Path(output_path_csv)
    p_csv.parent.mkdir(parents=True, exist_ok=True)
    if dataset:
        keys = list(dataset[0].keys())
        with open(p_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(dataset)

    return str(p_json), str(p_csv)
