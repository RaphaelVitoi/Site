# engine/math_sota.py
# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long, unused-argument

import math


# SOTA v7.0 GOLD: Precomputed Mathematical Constants for O(1) Latency Optimization
LN_100 = 4.605170185988092
LN_60 = 4.0943445622221
INV_LN_60 = 0.24423939986381665
INV_7_5 = 0.13333333333333333
INV_15 = 0.06666666666666667
INV_100 = 0.01


def calculate_geometric_sizing(current_pot: float, target_pot: float, remaining_streets: int) -> float:
    """
    Calcula a fracao do pote (f) necessaria para apostar nas streets restantes
    e atingir o target_pot (geralmente All-in no river).
    Formula: (1 + 2f)^n = target_pot / current_pot
    """
    if current_pot <= 0 or target_pot <= current_pot or remaining_streets <= 0:
        return 0.0

    growth_factor = target_pot / current_pot
    one_plus_two_f = math.pow(growth_factor, 1.0 / remaining_streets)
    return (one_plus_two_f - 1.0) * 0.5


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
        return {action: r / total_positive_regret for action, r in positive_regrets.items()}

    n = len(regrets)
    return dict.fromkeys(regrets, 1.0 / n)


def solve_icm_distortion_v2(
    ip_rp: float,
    oop_rp: float,
    topologic_aggression: float,
    active_players: int,
    pot_size: float,
    street_idx: int,
    fold: float,
    call: float,  # noqa: ARG001
    raise_val: float,
) -> dict[str, float]:
    """
    SOTA v4.6 GOLD: Topologic Aggression 2.0 (Gravidade do Pote).
    Implementa a inercia estrategica e o Downward Drift dinamico no nucleo Python.
    Paridade absoluta com wasm-equity/src/lib.rs.
    """
    # Calculo de Gravidade (G): ln(pot/7.5). 7.5bb e o baseline de SRP.
    gravity = math.log(max(1.0, pot_size * INV_7_5)) if pot_size > 0 else 0.0
    gravity = max(0.0, gravity)

    # Amortecimento (Damping): Reduz a sensibilidade da agressao em potes gigantes
    damping = 1.0 / (1.0 + gravity * 0.12)
    effective_aggression = 1.0 + (topologic_aggression - 1.0) * damping

    pressure = (oop_rp + ip_rp) * 0.5

    # Downward Drift: Pressao RP converte Raise em Small Bet ou Check/Call
    # Escala com a street (0=Flop, 1=Turn, 2=River) e com a gravidade
    drift_base = 0.004 * (float(street_idx) + 1.0)
    drift_penalty = raise_val * (pressure * drift_base * (1.0 + gravity * 0.5))

    raise_shift = raise_val * (effective_aggression - 1.0) - drift_penalty - (pressure * 0.003 * float(active_players))

    new_raise = max(0.0, raise_val + raise_shift)

    # Fold Shift: Limitado pelo Teto de RP (D5/D6)
    max_fold_allowed = 0.88 - min(0.3, gravity * 0.05)
    fold_shift = fold * (pressure * 0.012) + max(0.0, raise_val - new_raise)
    new_fold = max(0.0, min(max_fold_allowed, fold + fold_shift))

    new_call = max(0.0, 1.0 - new_fold - new_raise)
    total = new_fold + new_call + new_raise

    if total > 0.0:
        inv_total = 1.0 / total
        return {
            "fold": new_fold * inv_total,
            "call": new_call * inv_total,
            "raise": new_raise * inv_total,
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
    """Fisica Base do Poker: Gravidade do Pote, Downward Drift e Multiway Noise SOTA v4.6 GOLD."""
    # SOTA v4.6: Gravidade baseada em ln(pot/7.5) para paridade com Rust
    gravity = math.log(max(1.0, current_pot * INV_7_5)) if current_pot > 0 else 0.0

    bet_to_call = current_pot * 0.5
    # O aprisionamento escala com o custo relativo do call e a gravidade acumulada
    pot_entrapment = ((hero_invested + bet_to_call) / max(0.1, hero_raw_stack)) * (1.0 + gravity * 0.1)

    downward_drift = 1.25 if hero_position == "OOP" else 0.85

    # SOTA FIX: Dissonancia Dimensional corrigida. RIO Multiway cresce em O(N^2)
    # Assimetria multiplicadora MW ancorada no Table Draw (human_noise_factor)
    opponents = max(1, active_players - 1)
    mw_noise_multiplier = math.pow(opponents, 2.0 + human_noise_factor)

    return min(
        1.0,
        ((base_rio_liability * mw_noise_multiplier) * INV_100) + (pot_entrapment * downward_drift * mitigation_factor),
    )


def calculate_utility_ev(
    raw_ev: float,
    stack_eff: float = 100.0,
    status: str = "baseline",
    loss_aversion_base: float = 2.25,
    fgs_health: float = 1.0,
) -> float:
    """
    SOTA v4.6 GOLD: Curva de Utilidade da Teoria do Prospecto (VITOI-Kahneman).
    A aversao a perda escala dinamicamente com o stack e o FGS (Future Game Simulation).
    """
    # NaN/Inf safety guards
    if math.isnan(raw_ev) or math.isinf(raw_ev):
        return 0.0
    if math.isnan(stack_eff) or math.isinf(stack_eff):
        stack_eff = 100.0
    if math.isnan(fgs_health) or math.isinf(fgs_health) or fgs_health <= 0:
        fgs_health = 1.0

    safe_stack = max(2.718, stack_eff)
    stack_modifier = LN_100 / math.log(safe_stack)

    # SOTA: Lambda impulsionado inversamente pela saude do FGS (Axioma de Sobrevivencia)
    fgs_modifier = 1.0 / max(0.1, fgs_health * fgs_health)
    lambda_val = loss_aversion_base * stack_modifier * fgs_modifier

    alpha = 0.88
    beta = 0.88

    if status == "tilt":
        lambda_val, beta = lambda_val * 0.66, 0.95
    elif status == "protecting":
        lambda_val, alpha = lambda_val * 1.33, 0.75
    elif status == "bubble":
        lambda_val = lambda_val * 2.0

    return math.pow(raw_ev, alpha) if raw_ev >= 0 else -lambda_val * math.pow(abs(raw_ev), beta)


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
    **kwargs: float,
) -> dict[str, float | bool | None]:
    """SOTA v7.0 GOLD: A Equacao Unificada. Calcula PM, Esperanca, Expectativa e Risk Advantage."""
    human_noise_factor: float = kwargs.get("human_noise_factor", 0.0)
    edge_base: float = kwargs.get("edge_base", 1.0)
    bounty_value: float = kwargs.get("bounty_value", 0.0)
    valuation: float = kwargs.get("valuation", 1.0)
    icm_per_chip: float = kwargs.get("icm_per_chip", 0.05)
    hero_rp: float = kwargs.get("hero_rp", 15.0)
    villain_rp: float = kwargs.get("villain_rp", 15.0)

    # SOTA: Bounty Offset (PKO) - O bounty atua como um 'Seguro de Colisao'
    # Conforme Manifesto v7: Subtrai do RP do Hero.
    bounty_rp_offset = (bounty_value / max(1.0, current_pot)) * 10.0
    effective_hero_rp = max(0.01, hero_rp - bounty_rp_offset)

    # SOTA: Risk Advantage (BTN vs BB Study)
    # Conforme Aula 1.2: Delta RP = VillainRP - HeroRP_effective
    risk_advantage = villain_rp - effective_hero_rp
    advantage_multiplier = 1.0 + (risk_advantage / 100.0)

    eq = current_equity_pct / 100.0 if current_equity_pct > 1.0 else current_equity_pct

    # SOTA: Amortizacao da Edge escalada pelo Risk Advantage
    # A arvore de decisao e podada em S=10bb. Er(S) e proporcional a log(S).
    safe_stack_edge = max(2.718, stack_eff)
    edge_scale = math.log(safe_stack_edge) * INV_LN_60 * advantage_multiplier
    amortized_edge = edge_base * edge_scale

    bayesian_win_prob = calculate_bayesian_win_prob(eq, action_strength=0.5, range_density=0.5)

    # SOTA: Divida RIO recalibrada pelo Fator Psi (Entropia) e Effective Hero RP
    if active_players <= 2:
        rio_mw = 0.0
    else:
        opponents = max(1, active_players - 1)
        # SOTA GOLD: Passivo Estrutural cresce em taxa quadratica (x^(2+f))
        rio_penalty_factor = math.pow(opponents, 2.0 + human_noise_factor)

        vol_term = active_players / (max(1.0, stack_eff * 0.2))
        volatility_multiplier = vol_term * vol_term

        # Damping sintonizado com TS
        damping = 0.15 + (human_noise_factor * 0.05)
        rio_penalty_chips = (
            current_pot * rio_penalty_factor * (damping + (volatility_multiplier * 0.05)) * (effective_hero_rp * INV_15)
        )
        rio_mw = rio_penalty_chips * icm_per_chip

    # SOTA: O passivo da derrota sofre dilatacao no ICM e aversao dinamica
    base_delta_lose = delta_lose_pct * (1.0 / max(0.1, fgs_health))
    prospect_delta_lose = calculate_utility_ev(base_delta_lose, stack_eff=stack_eff, fgs_health=fgs_health)

    # A EQUACAO UNIFICADA SOTA (Blindagem Dimensional)
    # Skill (Amortized Edge) e Valuation escalam cirurgicamente o vetor de ganho.
    chip_win_expectativa = (
        bayesian_win_prob * delta_win_pct * realization_factor * valuation * fgs_health
    ) * amortized_edge
    chip_lose_expectativa = (1.0 - bayesian_win_prob) * prospect_delta_lose
    bounty_expectativa = bayesian_win_prob * bounty_value * realization_factor

    expectativa = chip_win_expectativa + chip_lose_expectativa + bounty_expectativa
    perspectiva = expectativa - (rio_mw + dynamic_ev_fold)

    # SOTA: Calculo do Teto do RP (Equidade de Indiferenca)
    denom = (
        (delta_win_pct * realization_factor * valuation * fgs_health) * amortized_edge
        - prospect_delta_lose
        + (bounty_value * realization_factor)
    )
    thresh_eq = (
        max(0.0, min(0.99, (dynamic_ev_fold + rio_mw - prospect_delta_lose) / denom)) if abs(denom) > 1e-6 else None
    )

    pot_odds = hero_invested / (current_pot + hero_invested) if (current_pot + hero_invested) > 0 else 0.0

    if thresh_eq is not None and thresh_eq > 1e-6:
        ci = bayesian_win_prob / thresh_eq
    elif thresh_eq is not None and thresh_eq <= 1e-6:
        ci = 99.0 if bayesian_win_prob > 0 else 1.0
    elif perspectiva > 0:
        ci = 1.5
    else:
        ci = 0.5

    return {
        "esperanca": perspectiva,  # Alinhado com o frontend: Esperanca ~ PM
        "expectativa": expectativa,
        "perspectiva": perspectiva,
        "risk_advantage": risk_advantage,
        "advantage_multiplier": advantage_multiplier,
        "rio_mw": rio_mw,
        "thresh_eq": thresh_eq,
        "pot_odds": pot_odds,
        "ci": ci,
        "is_solvent": ci >= 1.0,
        "is_actionable": perspectiva > 0,
    }


def calculate_rio_risk_v2(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    active_players: int,
    human_noise_factor: float = 0.0,
) -> dict[str, float | str]:
    """
    SOTA v4.6 GOLD: Versao unificada do calculo de RIO.
    Encapsula a fisica do RIO Tension e fornece uma decisao estrategica baseada em Ci.
    """
    # SOTA: Normalizacao de posicao para a fisica de drift
    pos = "OOP" if hero_position in ("BB", "SB", "OOP") else "IP"

    # 1. Calcula a Tensao de RIO (Fisica do Passivo Estrutural)
    # Baseline SOTA para indiferenca: 0.6% de liability base
    rio_tension = calculate_rio_tension(
        hero_invested=hero_invested,
        current_pot=current_pot,
        hero_raw_stack=hero_raw_stack,
        hero_position=pos,
        base_rio_liability=0.6,
        active_players=active_players,
        human_noise_factor=human_noise_factor,
    )

    # 2. Reutiliza o motor Quantum para a decisao estrategica (Ci)
    metrics = compute_quantum_metrics(
        current_equity_pct=60.0,  # SOTA: Baseline de 'Marginal Advantage' para decisao de risco
        delta_win_pct=current_pot * 0.5,  # Simula um ganho proporcional ao pote
        delta_lose_pct=-hero_invested,  # Simula uma perda do investimento
        dynamic_ev_fold=0.0,
        realization_factor=1.0,
        fgs_health=1.0,
        active_players=active_players,
        hero_invested=hero_invested,
        current_pot=current_pot,
        stack_eff=hero_raw_stack,
        human_noise_factor=human_noise_factor,
    )

    ci = float(metrics["ci"] if metrics["ci"] is not None else 1.0)
    # SOTA: Ajuste de Ci para o wrapper de risco (Friccao Zero)
    # Se a tensao for baixa, o Ci tende a ser mais amigavel ao Call.
    adjusted_ci = ci * (1.5 / (1.0 + rio_tension))

    decision = "CALL" if adjusted_ci >= 1.0 else "FOLD"
    gravity = math.log(max(1.0, current_pot * INV_7_5))

    return {
        "rio_risk_score": round(rio_tension, 3),
        "rio_factor": round(rio_tension * hero_invested, 3),
        "ci": round(adjusted_ci, 3),
        "gravity": round(gravity, 3),
        "decision": decision,
        "rationale": f"Risco SOTA: Ci {adjusted_ci:.2f} | Tensao {rio_tension:.3f} | G:{gravity:.2f} | MW:{active_players}p.",
    }


def calculate_bayesian_win_prob(
    prior_equity: float,
    action_strength: float,
    range_density: float = 0.5,
    pot_odd_pressure: float = 0.0,
) -> float:
    """
    SOTA v6: Bayesian Range Reading.
    Atualiza a equidade base (prior) com a forca da acao observada (likelihood).
    """
    # Likelihood: Probabilidade daquela acao ser tomada dada a forca da mao
    # Escala com a densidade do range (polarizado vs denso)
    # SOTA v6.1: Lower density (polarized) amplifica o sinal da acao forte.
    likelihood = math.pow(action_strength, max(0.05, range_density))

    # Teorema de Bayes: Posterior = (Likelihood * Prior) / Normalizador
    numerator = likelihood * prior_equity
    denominator = (likelihood * prior_equity) + ((1.0 - action_strength) * (1.0 - prior_equity))

    posterior = numerator / max(0.0001, denominator)

    # Pressao de Pot Odds atua como um 'Prior Shift'
    posterior_with_pressure = posterior * (1.0 + (pot_odd_pressure * 0.05))

    return min(0.99, max(0.01, posterior_with_pressure))
