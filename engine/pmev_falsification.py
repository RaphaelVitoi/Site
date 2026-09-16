"""Motor analitico de falsificacao empirica e testes de fronteira PMev.

Formalismo: Raphael Vitoi -- Ecossistema Nexus SOTA v8.0 GOLD.
Auditoria Integrada: Sol (Codex) x Hermes.

Implementa os testes algoritmicos formais para as quatro fronteiras criticas:
    - H4: Subversao do MDF no River sob assimetria de Risk Premium.
    - H7: Opcionalidade do SPR Omega(s) com quebra de monotonia em [20, 25] bb.
    - H9: Nao-conservacao contabil em espaco de utilidade T$ sob late registration.
    - H12: Parcimonia parametrica estrita via Criterio de Informacao Bayesiano (BIC).
"""

from __future__ import annotations

from dataclasses import dataclass
import math

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_spec import TournamentState

# ==============================================================================
# H4: SUBVERSAO DO MDF NO RIVER
# ==============================================================================


@dataclass(frozen=True, slots=True)
class RiverDefenseResult:
    """Resultado da avaliacao de defesa minima no river sob assimetria de risco."""

    pot: float
    bet: float
    delta_rp_def: float
    mdf_linear: float
    mdf_pmev: float
    spr_ratio: float
    is_decoupled: bool

    @property
    def defense_reduction_pct(self) -> float:
        """Reducao percentual de defesa exigida em relacao ao MDF linear."""
        if self.mdf_linear <= 0:
            return 0.0
        return ((self.mdf_linear - self.mdf_pmev) / self.mdf_linear) * 100.0


def evaluate_river_defense_mdf(
    pot: float,
    bet: float,
    delta_rp_def: float,
    s_eff: float | None = None,
) -> RiverDefenseResult:
    """Calcula o MDF desacoplado da PMev sob assimetria de Risk Premium.

    Formula Vitoi:
        MDF_PMev = (P - delta_rp_def * (P + B)) / ((P + B) * (1 - delta_rp_def))

    Falsificacao: Se para S_eff / P <= 1.5 a frequencia empirica divergir de MDF_PMev
    em direcao a MDF_linear (p > 0.01), H4 e rejeitada.
    """
    if pot <= 0 or bet <= 0:
        raise ValueError("Pote e aposta devem ser estritamente positivos.")
    if not 0.0 <= delta_rp_def < 1.0:
        raise ValueError(f"Delta RP do defensor deve estar em [0, 1), recebido: {delta_rp_def}.")

    mdf_linear = pot / (pot + bet)

    numerator = pot - (delta_rp_def * (pot + bet))
    denominator = (pot + bet) * (1.0 - delta_rp_def)

    mdf_pmev = 0.0 if denominator <= 0 else max(0.0, min(1.0, numerator / denominator))

    s_eff_val = s_eff if s_eff is not None else bet
    spr_ratio = s_eff_val / pot

    is_decoupled = abs(mdf_pmev - mdf_linear) > 1e-4

    return RiverDefenseResult(
        pot=pot,
        bet=bet,
        delta_rp_def=delta_rp_def,
        mdf_linear=mdf_linear,
        mdf_pmev=mdf_pmev,
        spr_ratio=spr_ratio,
        is_decoupled=is_decoupled,
    )


# ==============================================================================
# H7: OPCIONALIDADE DO SPR OMEGA(S)
# ==============================================================================


@dataclass(frozen=True, slots=True)
class SPROptionalityResult:
    """Resultado da avaliacao de opcionalidade de stack profundo Omega(s)."""

    s_eff_bb: float
    omega_value: float
    regime: str
    is_strictly_positive: bool
    monotonicity_broken: bool


def evaluate_spr_optionality(s_eff_bb: float) -> SPROptionalityResult:
    """Modela a funcao de opcionalidade Omega(s) e sua convexidade.

    Em stacks profundos (S_eff >= 40 bb), a preservacao do stack gera valor marginal
    crescente (Omega(s) > 0). Na zona de transicao [20, 25] bb, o colapso push/fold
    destroi a manobrabilidade pos-flop:
        d^2 U / ds^2 < 0 ==> Omega(s) <= 0.

    Falsificacao: Monotonicidade deve prevalecer fora de [20, 25] bb. Se Omega(s) <= 0
    for observado em S_eff >= 40 bb, H7 e rejeitada.
    """
    if s_eff_bb < 0:
        raise ValueError("Stack efetivo em bb nao pode ser negativo.")

    if 20.0 <= s_eff_bb <= 25.0:
        # Colapso na zona de transicao push/fold
        regime = "Transition-PushFold-Collapse"
        # Perda de manobrabilidade induz convexidade negativa
        omega_value = -0.05 * (25.0 - s_eff_bb) * (s_eff_bb - 20.0)
        monotonicity_broken = True
    elif s_eff_bb < 20.0:
        regime = "ShortStack-PushFold-Pure"
        omega_value = 0.0
        monotonicity_broken = False
    else:
        regime = "DeepStack-Maneuverability"
        # Opcionalidade marginal estritamente crescente
        omega_value = 0.15 * math.log(1.0 + ((s_eff_bb - 25.0) / 10.0))
        monotonicity_broken = False

    return SPROptionalityResult(
        s_eff_bb=s_eff_bb,
        omega_value=omega_value,
        regime=regime,
        is_strictly_positive=omega_value > 0.0,
        monotonicity_broken=monotonicity_broken,
    )


# ==============================================================================
# H9: NAO-CONSERVACAO EM LATE REGISTRATION NO ESPACO T$
# ==============================================================================


@dataclass(frozen=True, slots=True)
class LateRegistrationUtilityResult:
    """Resultado da avaliacao de conservacao no espaco de utilidade T$."""

    incumbent_icm_before: tuple[float, ...]
    incumbent_icm_after: tuple[float, ...]
    entrant_icm: float
    buy_in: float
    sum_delta_incumbents: float
    conservation_error_t_dollars: float
    is_non_conserved_in_utility: bool


def evaluate_late_registration_utility(
    before_state: TournamentState,
    entrant_stack: float,
    buy_in: float,
    rake_pct: float = 0.10,
) -> LateRegistrationUtilityResult:
    """Avalia o desacoplamento de conservacao de valor no espaco de torneio T$.

    Em fichas brutas, a massa e conservada. Em T$:
        sum_{i=1}^N Delta V_i(T$) + V_entrant(T$) != Buy-in
    devido a diluicao de ICM dos stacks medios e subsidio aos chip leaders.
    """
    if buy_in <= 0:
        raise ValueError("Buy-in deve ser positivo.")
    if entrant_stack <= 0:
        raise ValueError("Stack do entrante deve ser positivo.")

    # 1. Equidade ICM antes
    stacks_before = list(before_state.stacks)
    payouts_before = list(before_state.payouts)
    icm_before = calculate_malmuth_harville_icm(stacks_before, payouts_before)

    # 2. Expansao do prize pool liquido pelo buy-in descontado de rake
    net_entry = buy_in * (1.0 - rake_pct)
    pool_before = sum(payouts_before)
    scale = (pool_before + net_entry) / pool_before
    payouts_after = [p * scale for p in payouts_before]

    # 3. Equidade ICM apos a entrada
    stacks_after = [*stacks_before, entrant_stack]
    icm_after = calculate_malmuth_harville_icm(stacks_after, payouts_after)

    incumbents_after = icm_after[:-1]
    entrant_equity = icm_after[-1]

    sum_delta_incumbents = sum(after - before for after, before in zip(incumbents_after, icm_before, strict=True))

    # Erro de conservacao no espaco de utilidade contra o valor nominal do buy-in
    utility_total_change = sum_delta_incumbents + entrant_equity
    error_against_buyin = abs(utility_total_change - buy_in)

    is_non_conserved = error_against_buyin > 1e-4

    return LateRegistrationUtilityResult(
        incumbent_icm_before=tuple(icm_before),
        incumbent_icm_after=tuple(incumbents_after),
        entrant_icm=entrant_equity,
        buy_in=buy_in,
        sum_delta_incumbents=sum_delta_incumbents,
        conservation_error_t_dollars=error_against_buyin,
        is_non_conserved_in_utility=is_non_conserved,
    )


# ==============================================================================
# H12: PARCIMONIA PARAMETRICA VIA BIC
# ==============================================================================


@dataclass(frozen=True, slots=True)
class BICParsimonyResult:
    """Resultado do teste de parcimonia informacional entre PMev-D e PMev-F."""

    bic_dynamic: float
    bic_full: float
    delta_bic: float
    log_likelihood_gain: float
    complexity_penalty: float
    is_expansion_admissible: bool


def evaluate_bic_parsimony(
    log_lik_d: float,
    log_lik_f: float,
    k_d: int,
    k_f: int,
    n_samples: int,
) -> BICParsimonyResult:
    """Avalia se o acrescimo de complexidade de PMev-D para PMev-F e estatisticamente admissivel.

    Formula:
        BIC = k * ln(n) - 2 * ln(L)
    Admissibilidade:
        2 * (ln(L_F) - ln(L_D)) > (k_F - k_D) * ln(n)
    Caso contrario, a expansao configura overfitting sobre o ruido de Hand Histories.
    """
    if n_samples < 2:
        raise ValueError("n_samples deve ser pelo menos 2 para calculo de BIC.")
    if k_f <= k_d:
        raise ValueError(f"Modelo Full (k={k_f}) deve ter mais parametros que Dinamico (k={k_d}).")

    bic_d = (k_d * math.log(n_samples)) - (2.0 * log_lik_d)
    bic_f = (k_f * math.log(n_samples)) - (2.0 * log_lik_f)
    delta_bic = bic_f - bic_d

    log_lik_gain = 2.0 * (log_lik_f - log_lik_d)
    complexity_penalty = (k_f - k_d) * math.log(n_samples)

    is_admissible = log_lik_gain > complexity_penalty

    return BICParsimonyResult(
        bic_dynamic=bic_d,
        bic_full=bic_f,
        delta_bic=delta_bic,
        log_likelihood_gain=log_lik_gain,
        complexity_penalty=complexity_penalty,
        is_expansion_admissible=is_admissible,
    )
