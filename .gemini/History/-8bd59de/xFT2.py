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


def solve_icm_distortion_v2(
    ip_rp: float,
    oop_rp: float,
    topologic_aggression: float,
    active_players: int,
    pot_size: float,
    street_idx: int,
    fold: float,
    call: float,
    raise_val: float,
) -> dict[str, float]:
    """
    SOTA v4.2: Topologic Aggression 2.0 (Gravidade do Pote).
    Implementa a inércia estratégica e o Downward Drift dinâmico no núcleo Python.
    Paridade absoluta com wasm-equity/src/lib.rs.
    """
    # Cálculo de Gravidade (G): ln(pot/7.5). 7.5bb é o baseline de SRP.
    gravity = math.log(max(1.0, pot_size / 7.5)) if pot_size > 0 else 0.0
    gravity = max(0.0, gravity)

    # Amortecimento (Damping): Reduz a sensibilidade da agressão em potes gigantes
    damping = 1.0 / (1.0 + gravity * 0.12)
    effective_aggression = 1.0 + (topologic_aggression - 1.0) * damping

    pressure = (oop_rp + ip_rp) / 2.0

    # Downward Drift: Pressão RP converte Raise em Small Bet ou Check/Call
    # Escala com a street (0=Flop, 1=Turn, 2=River) e com a gravidade
    drift_base = 0.004 * (float(street_idx) + 1.0)
    drift_penalty = raise_val * (pressure * drift_base * (1.0 + gravity * 0.5))

    raise_shift = (
        raise_val * (effective_aggression - 1.0)
        - drift_penalty
        - (pressure * 0.003 * float(active_players))
    )

    new_raise = max(0.0, raise_val + raise_shift)

    # Fold Shift: Limitado pelo Teto de RP (D5/D6)
    max_fold_allowed = 0.88 - min(0.3, gravity * 0.05)
    fold_shift = fold * (pressure * 0.012) + max(0.0, raise_val - new_raise)
    new_fold = max(0.0, min(max_fold_allowed, fold + fold_shift))

    new_call = max(0.0, 1.0 - new_fold - new_raise)
    total = new_fold + new_call + new_raise

    if total > 0.0:
        return {
            "fold": new_fold / total,
            "call": new_call / total,
            "raise": new_raise / total,
        }

    return {"fold": 1.0, "call": 0.0, "raise": 0.0}


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
    """Física Base do Poker: Gravidade do Pote, Downward Drift e Multiway Noise SOTA v4.2."""
    # SOTA v4.2: Gravidade baseada em ln(pot/7.5) para paridade com Rust
    gravity = math.log(max(1.0, current_pot / 7.5)) if current_pot > 0 else 0.0

    bet_to_call = current_pot * 0.5
    # O aprisionamento escala com o custo relativo do call e a gravidade acumulada
    pot_entrapment = ((hero_invested + bet_to_call) / max(0.1, hero_raw_stack)) * (
        1.0 + gravity * 0.1
    )

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
    edge_base: float = 1.0,
    bounty_value: float = 0.0,
) -> dict[str, float | bool | None]:
    """SOTA v4.3 Gold: A Equação Unificada. Calcula PM, Esperança, Expectativa e Coeficiente de Insolvência (Ci)."""
    eq = current_equity_pct / 100.0 if current_equity_pct > 1.0 else current_equity_pct

    # SOTA: Amortização da Edge (Colapso Mecânico)
    safe_stack_edge = max(2.718, stack_eff)
    edge_scale = math.log(safe_stack_edge) / math.log(60.0)
    amortized_edge = edge_base * edge_scale

    # Axioma Lipe Piv: Regressão Bayesiana (Aqui assumimos win_prob ~ eq para o baseline)
    # Em implementações reais, win_prob vem do range. Aqui simulamos a paridade.
    bayesian_win_prob = eq  # Simplificação para o motor de métricas base

    # SOTA: Dívida RIO com Ponderação Quadrática e Volatilidade
    if active_players <= 2:
        rio_mw = 0.0
    else:
        opponents = max(1, active_players - 1)
        rio_penalty_factor = math.pow(opponents, 2.0 + human_noise_factor)
        volatility_multiplier = math.pow(
            active_players / (max(1.0, stack_eff / 5.0)), 2.0
        )
        rio_mw = (
            current_pot
            * rio_penalty_factor
            * (0.15 + (volatility_multiplier * 0.05))
            * 0.05
        )

    # SOTA: O passivo da derrota sofre dilatação no ICM e aversão dinâmica
    base_delta_lose = delta_lose_pct * (1.0 / max(0.1, fgs_health))
    prospect_delta_lose = calculate_utility_ev(base_delta_lose, stack_eff=stack_eff)

    # A EQUAÇÃO UNIFICADA SOTA (Blindagem Dimensional)
    # Skill (Amortized Edge) escala apenas o vetor de ganho.
    chip_win_expectativa = (
        bayesian_win_prob * delta_win_pct * realization_factor * fgs_health
    ) * amortized_edge
    chip_lose_expectativa = (1.0 - bayesian_win_prob) * prospect_delta_lose
    bounty_expectativa = bayesian_win_prob * bounty_value * realization_factor

    expectativa = chip_win_expectativa + chip_lose_expectativa + bounty_expectativa
    perspectiva = expectativa - (rio_mw + dynamic_ev_fold)

    # SOTA: Cálculo do Teto do RP (Equidade de Indiferença)
    denom = (
        (delta_win_pct * realization_factor * fgs_health) * amortized_edge
        - prospect_delta_lose
        + (bounty_value * realization_factor)
    )
    thresh_eq = (
        max(0.0, min(0.99, (dynamic_ev_fold + rio_mw - prospect_delta_lose) / denom))
        if abs(denom) > 1e-6
        else None
    )

    pot_odds = (
        hero_invested / (current_pot + hero_invested)
        if (current_pot + hero_invested) > 0
        else 0.0
    )

    if thresh_eq and thresh_eq > 0:
        ci = bayesian_win_prob / thresh_eq
    elif perspectiva > 0:
        ci = 1.5
    else:
        ci = 0.5

    return {
        "esperanca": perspectiva,  # Alinhado com o frontend: Esperança ~ PM
        "expectativa": expectativa,
        "perspectiva": perspectiva,
        "rio_mw": rio_mw,
        "thresh_eq": thresh_eq,
        "pot_odds": pot_odds,
        "ci": ci,
        "is_solvent": ci >= 1.0,
        "is_actionable": perspectiva > 0,
    }
