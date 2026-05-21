import math


def calculate_geometric_sizing(
    current_pot: float, target_pot: float, remaining_streets: int
) -> float:
    """
    Calcula a fracao do pote (f) necessaria para apostar nas streets restantes
    e atingir o target_pot (geralmente All-in no river).
    Formula: (1 + 2f)^n = target_pot / current_pot
    """
    if current_pot <= 0 or target_pot <= current_pot or remaining_streets <= 0:
        return 0.0

    growth_factor = target_pot / current_pot
    one_plus_two_f = math.pow(growth_factor, 1.0 / remaining_streets)
    f = (one_plus_two_f - 1.0) / 2.0
    return f


def cfr_mock_strategy(regrets: dict[str, float]) -> dict[str, float]:
    """
    Simula uma iteracao de Regret Matching.
    Converte regrets acumulados em uma mixed strategy baseada em pesos positivos.
    """
    if not regrets:
        return {}

    positive_regrets = {action: max(0.0, r) for action, r in regrets.items()}
    total_positive_regret = sum(positive_regrets.values())

    if total_positive_regret > 0:
        return {
            action: r / total_positive_regret for action, r in positive_regrets.items()
        }

    n = len(regrets)
    return {action: 1.0 / n for action in regrets}


# =========================================================================
# FÍSICA DA PERSPECTIVA MATEMÁTICA (SOTA v4.0 - QUANTUM)
# Paridade Absoluta com src/lib/perspectiva.ts
# =========================================================================


def calculate_rio_tension(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    base_rio_liability: float,
    active_players: int = 2,
    human_noise_factor: float = 0.0,
    mitigation_factor: float = 1.0,
) -> float:
    """Física Base do Poker: Aprisionamento ao Pote, Downward Drift e Multiway Noise SOTA."""
    bet_to_call = current_pot * 0.5
    pot_entrapment = (hero_invested + bet_to_call) / max(0.1, hero_raw_stack)
    downward_drift = 1.25 if hero_position == "OOP" else 0.85

    # SOTA: Assimetria multiplicadora MW ancorada no Table Draw (humanNoiseFactor)
    opponents = max(1, active_players - 1)
    mw_noise_multiplier = math.pow(opponents, 1.0 + human_noise_factor)

    return min(
        1.0,
        ((base_rio_liability * mw_noise_multiplier) / 100.0)
        + (pot_entrapment * downward_drift * mitigation_factor),
    )


def calculate_utility_ev(
    raw_ev: float,
    stack_eff: float = 100.0,
    status: str = "baseline",
    loss_aversion_base: float = 2.25,
) -> float:
    """
    SOTA: Curva de Utilidade da Teoria do Prospecto ancorada ao logaritmo do stack efetivo.
    A aversão à perda escala dinamicamente, refletindo a gravidade da sobrevivência (FGS).
    """
    # Normaliza o escalar de Kahneman (2.25) para a zona de conforto (100bb).
    # Stacks críticos (ex: 10bb, ln(10)~2.3) sofrem o dobro da aversão à perda base.
    safe_stack = max(2.718, stack_eff)
    stack_modifier = math.log(100.0) / math.log(safe_stack)

    lambda_val = loss_aversion_base * stack_modifier
    alpha = 0.88
    beta = 0.88

    if status == "tilt":
        lambda_val, beta = lambda_val * 0.66, 0.95
    elif status == "protecting":
        lambda_val, alpha = lambda_val * 1.33, 0.75
    elif status == "bubble":
        lambda_val = lambda_val * 2.0

    return (
        math.pow(raw_ev, alpha)
        if raw_ev >= 0
        else -lambda_val * math.pow(abs(raw_ev), beta)
    )


def compute_quantum_metrics(
    current_equity_pct: float,
    delta_win_pct: float,
    delta_lose_pct: float,
    dynamic_ev_fold: float,
    realization_factor: float,
    fgs_health: float,
    active_players: int,
    hero_invested: float,
    current_pot: float,
    stack_eff: float,
    human_noise_factor: float = 0.0,
) -> dict[str, float | bool | None]:
    """SOTA: A Equação Unificada. Calcula PM, Esperança, Expectativa e Coeficiente de Insolvência (Ci)."""
    eq = current_equity_pct / 100.0 if current_equity_pct > 1.0 else current_equity_pct

    amortized_edge = 1.0 + ((50.0 / 100.0) * (1.0 - math.exp(-0.05 * stack_eff)))
    adjusted_delta_win = delta_win_pct * amortized_edge

    # Escalonamento SOTA: Multiway (x²) injetado com o Table Draw Noise
    rio_mw = (hero_invested * 0.15) * math.pow(
        max(1, active_players - 1), 2.0 + human_noise_factor
    )

    esperanca = (eq * adjusted_delta_win) + ((1.0 - eq) * delta_lose_pct)

    # SOTA: O passivo da derrota sofre dilatação no ICM e aversão dinâmica via Teoria do Prospecto.
    base_delta_lose = delta_lose_pct * (1.0 / max(0.1, fgs_health))
    prospect_delta_lose = calculate_utility_ev(base_delta_lose, stack_eff=stack_eff)

    expectativa = (eq * adjusted_delta_win * realization_factor * fgs_health) + (
        (1.0 - eq) * prospect_delta_lose
    )
    perspectiva = expectativa - rio_mw - dynamic_ev_fold

    denom = (adjusted_delta_win * realization_factor * fgs_health) - prospect_delta_lose
    thresh_eq = (
        # SOTA: Limite de 41% removido. Teto do RP em bolhas extremas pode exigir até 99% de equity.
        max(0.0, min(0.99, (dynamic_ev_fold + rio_mw - prospect_delta_lose) / denom))
        if abs(denom) > 1e-6
        else None
    )

    pot_odds = (
        hero_invested / (current_pot + hero_invested)
        if (current_pot + hero_invested) > 0
        else 0.0
    )
    ci = (pot_odds / thresh_eq) if thresh_eq else None

    return {
        "esperanca": esperanca,
        "expectativa": expectativa,
        "perspectiva": perspectiva,
        "rio_mw": rio_mw,
        "thresh_eq": thresh_eq,
        "ci": ci,
        "is_solvent": ci is not None and ci >= 1.0,
        "is_actionable": perspectiva > 0,
    }
