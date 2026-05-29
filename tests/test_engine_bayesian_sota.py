"""
Testes de cobertura SOTA para engine/bayesian_range.py.
Cobre todos os ramos de _categorize_hand, _apply_profile_drift e build_likelihood_matrix.
"""

import math

import pytest

from engine.bayesian_range import (
    RANKS,
    _apply_profile_drift,
    _categorize_hand,
    build_likelihood_matrix,
    update_posterior,
)

# ==============================================================================
# _categorize_hand — todos os ramos
# ==============================================================================


@pytest.mark.unit
def test_categorize_hand_preflop_returns_air_or_draw() -> None:
    """Board vazio (pre-flop) deve retornar 'air_or_draw' para qualquer mao."""
    result = _categorize_hand(0, 1, [])  # AK offsuit
    assert result == "air_or_draw"


@pytest.mark.unit
def test_categorize_hand_top_pair_plus() -> None:
    """Hero com A no board de A-K-2 deve ser classificado como top_pair_plus."""
    board = ["Ah", "Kd", "2s"]
    board_ranks = [c[0].upper() for c in board]
    r = RANKS.index("A")  # rank=0
    c = RANKS.index("K")  # rank=1
    result = _categorize_hand(r, c, board_ranks)
    assert result == "top_pair_plus"


@pytest.mark.unit
def test_categorize_hand_mid_bottom_pair() -> None:
    """Hero com K no board de A-K-2 (sem top card) deve ser mid_bottom_pair."""
    board = ["Ah", "Kd", "2s"]
    board_ranks = [c[0].upper() for c in board]
    r = RANKS.index("K")  # rank=1
    c_idx = RANKS.index("3")  # nao esta no board
    result = _categorize_hand(r, c_idx, board_ranks)
    assert result == "mid_bottom_pair"


@pytest.mark.unit
def test_categorize_hand_overpair() -> None:
    """Par de bolso acima da carta mais alta do board deve ser classificado como overpair."""
    board = ["Qh", "7d", "2s"]
    board_ranks = [c[0].upper() for c in board]
    # KK = rank 1 (K), par
    r = RANKS.index("K")
    result = _categorize_hand(r, r, board_ranks)  # KK
    assert result == "overpair"


@pytest.mark.unit
def test_categorize_hand_weak_pocket_pair() -> None:
    """Par de bolso abaixo da carta mais alta do board deve ser weak_pocket_pair."""
    board = ["Ah", "Kd", "2s"]
    board_ranks = [c[0].upper() for c in board]
    # 33 = rank 10 (3), par, abaixo do A do board
    r = RANKS.index("3")
    result = _categorize_hand(r, r, board_ranks)  # 33
    assert result == "weak_pocket_pair"


@pytest.mark.unit
def test_categorize_hand_air_or_draw_postflop() -> None:
    """Mao sem contato com o board deve ser air_or_draw."""
    board = ["Ah", "Kd", "2s"]
    board_ranks = [c[0].upper() for c in board]
    r = RANKS.index("7")
    c_idx = RANKS.index("6")
    result = _categorize_hand(r, c_idx, board_ranks)
    assert result == "air_or_draw"


# ==============================================================================
# _apply_profile_drift — perfis nit, aggro, station
# ==============================================================================


@pytest.mark.unit
@pytest.mark.parametrize(
    ("action", "cat", "profile", "base_p", "check"),
    [
        ("bet", "air_or_draw", "nit", 0.5, "reduced"),  # nit bluffa menos
        ("bet", "air_or_draw", "aggro", 0.5, "increased"),  # aggro bluffa mais
        ("call", "mid_bottom_pair", "station", 0.5, "increased"),  # station chama mais
        ("bet", "top_pair_plus", "nit", 0.5, "unchanged"),  # nit nao afeta bet em valor
        ("check", "air_or_draw", "nit", 0.5, "unchanged"),  # check nao e afetado
    ],
)
def test_apply_profile_drift_directions(action: str, cat: str, profile: str, base_p: float, check: str) -> None:
    """_apply_profile_drift deve ajustar probabilidades de acordo com o perfil."""
    result = _apply_profile_drift(base_p, action, cat, profile)
    if check == "reduced":
        assert result < base_p, f"Nit deve reduzir bluff (obteve {result})"
    elif check == "increased":
        assert result > base_p, f"Perfil deve aumentar p_action (obteve {result})"
    elif check == "unchanged":
        assert result == base_p, f"Nenhum drift esperado (obteve {result})"


@pytest.mark.unit
def test_apply_profile_drift_caps_at_one() -> None:
    """Drift de aggro nao deve ultrapassar 1.0."""
    result = _apply_profile_drift(0.9, "bet", "air_or_draw", "aggro")
    assert result <= 1.0


# ==============================================================================
# build_likelihood_matrix — acoes e perfis
# ==============================================================================


@pytest.mark.unit
@pytest.mark.parametrize("action", ["bet", "check", "raise", "fold", "call"])
def test_build_likelihood_matrix_all_actions_valid_range(action: str) -> None:
    """Toda matriz de likelihood deve ter valores em [0, 1] para qualquer acao."""
    matrix = build_likelihood_matrix(action, ["Ah", "Kd", "2s"])
    for row in matrix:
        for val in row:
            assert 0.0 <= val <= 1.0, f"[{action}] Valor fora do intervalo: {val}"
    assert len(matrix) == 13
    assert all(len(row) == 13 for row in matrix)


@pytest.mark.unit
@pytest.mark.parametrize("profile", ["reg", "nit", "aggro", "station"])
def test_build_likelihood_matrix_profiles_produce_valid_matrices(profile: str) -> None:
    """Todos os perfis populacionais devem produzir matrizes 13x13 validas."""
    matrix = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"], profile=profile)
    for row in matrix:
        for val in row:
            assert 0.0 <= val <= 1.0, f"[{profile}] Valor invalido: {val}"


@pytest.mark.unit
def test_build_likelihood_matrix_nit_bets_air_less_than_aggro() -> None:
    """Nit deve ter likelihood de bet em air/draw menor que aggro."""
    # Pegar uma celula de air_or_draw: 7-6 offsuit no board A-K-2
    board = ["Ah", "Kd", "2s"]
    nit_m = build_likelihood_matrix("bet", board, profile="nit")
    aggro_m = build_likelihood_matrix("bet", board, profile="aggro")
    r = RANKS.index("7")
    c = RANKS.index("6")
    assert nit_m[r][c] < aggro_m[r][c], "Nit deve ter menor likelihood de bluff que aggro"


@pytest.mark.unit
def test_build_likelihood_matrix_preflop_all_air_or_draw() -> None:
    """Pre-flop (board vazio) deve categorizar todas as celulas como air_or_draw."""
    matrix = build_likelihood_matrix("fold", [])
    # No pre-flop, todos sao air_or_draw => fold prob = 0.95 (sem drift de reg)
    for row in matrix:
        for val in row:
            assert val == pytest.approx(0.95, abs=1e-9)


# ==============================================================================
# update_posterior — propriedades matematicas
# ==============================================================================


@pytest.mark.unit
def test_update_posterior_is_normalized() -> None:
    """O posterior deve sempre somar 1.0 apos normalizacao."""
    prior = [[1.0 / 169.0] * 13 for _ in range(13)]
    likelihood = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"])
    posterior = update_posterior(prior, likelihood)
    total = sum(posterior[r][c] for r in range(13) for c in range(13))
    assert math.isclose(total, 1.0, rel_tol=1e-9)


@pytest.mark.unit
def test_update_posterior_zero_marginal_returns_zeros() -> None:
    """Marginal zero (prior todo zero) deve retornar matriz de zeros sem erro."""
    prior = [[0.0] * 13 for _ in range(13)]
    likelihood = [[0.5] * 13 for _ in range(13)]
    posterior = update_posterior(prior, likelihood)
    total = sum(posterior[r][c] for r in range(13) for c in range(13))
    assert total == pytest.approx(0.0)


@pytest.mark.unit
def test_update_posterior_contracts_low_likelihood_hands() -> None:
    """Apos bet, maos do tipo air_or_draw devem ter peso menor que top_pair_plus."""
    prior = [[1.0 / 169.0] * 13 for _ in range(13)]
    likelihood = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"])
    posterior = update_posterior(prior, likelihood)

    # AA = top_pair_plus (rank 0, rank 0)
    aa_prob = posterior[0][0]
    # 76 = air_or_draw (rank 6, rank 7)
    bluff_prob = posterior[RANKS.index("7")][RANKS.index("6")]

    assert aa_prob > bluff_prob, "Posterior: AA deve superar bluffs apos bet"
