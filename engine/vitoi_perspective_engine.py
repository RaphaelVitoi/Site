# pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-positional-arguments
"""Modulo de Perspectiva Matematica VITOI."""

import math
import sys
from pathlib import Path
from typing import Any

try:
    import numpy as np

    NUMPY_AVAILABLE: bool = True
except ImportError:
    np = None  # type: ignore
    NUMPY_AVAILABLE: bool = False

# SOTA: Bootstrap de Aceleracao Nativa C++ (AVX2 / Quantum Tensor Engine)
TENSOR_ENGINE_AVAILABLE: bool = False
QUANTUM_TENSOR_ENGINE: Any = None

try:
    import quantum_tensor_engine as _qte  # type: ignore

    QUANTUM_TENSOR_ENGINE = _qte
    TENSOR_ENGINE_AVAILABLE = True
except ImportError:
    _build_paths = [
        Path(__file__).resolve().parent.parent / "core" / "tensor_engine" / "build" / "Release",
        Path(__file__).resolve().parent.parent / "core" / "tensor_engine" / "build",
    ]
    for _bp in _build_paths:
        if _bp.exists() and str(_bp) not in sys.path:
            sys.path.insert(0, str(_bp))
    try:
        import quantum_tensor_engine as _qte  # type: ignore

        QUANTUM_TENSOR_ENGINE = _qte
        TENSOR_ENGINE_AVAILABLE = True
    except ImportError:
        QUANTUM_TENSOR_ENGINE = None
        TENSOR_ENGINE_AVAILABLE = False


class VitoiPerspectiveEngine:
    """
    SOTA: Motor Hibrido de Perspectiva Matematica (VITOI 3.2).
    Substitui a metrica estatica de Pot Odds e o FGS Limitado pela Antevisao de Fluxo.
    """

    @staticmethod
    def calculate_dynamic_ev_fold(
        base_antes: float,
        time_to_blind_minutes: float,
        payjump_proximity_factor: float,
        position: str,
    ) -> float:
        """
        Calcula o baseline dinamico (Custo de Existencia na Orbita).
        """
        positional_penalty = 0.5 if position.upper() == "UTG" else 0.0
        time_penalty = 0.0
        if 0 < time_to_blind_minutes <= 3.0:
            time_penalty = (3.0 - time_to_blind_minutes) * 0.25
        payjump_bonus = (1.0 - payjump_proximity_factor) * 2.5
        ev_fold = (-base_antes) - time_penalty - positional_penalty + payjump_bonus
        return round(ev_fold, 4)

    @staticmethod
    def calculate_structural_liability(multiway_opponents: int, base_rio: float) -> float:
        """
        O Passivo Estrutural de Colisao. Em Multiway, as Reverse Implied Odds
        crescem em coeficiente exponencial (x^2).
        """
        if multiway_opponents <= 1:
            return base_rio
        return round(base_rio * math.pow(multiway_opponents, 2), 4)

    @staticmethod
    def calculate_edge_amortization(stack_depth_bb: float, edge_base: float, aggression_factor: float) -> float:
        """
        Amortizacao de Edge pela Profundidade de Stack.
        A arvore de decisao colapsa logaritmicamente para a Invariancia de Nash em ~10bb.
        """
        if stack_depth_bb <= 0:
            return 0.0
        tree_complexity = math.log10(max(stack_depth_bb, 1.0))
        effective_edge = edge_base * tree_complexity
        capture_rate = aggression_factor * 0.15
        return round(effective_edge + capture_rate, 4)

    @classmethod
    def calculate_utility(cls, x: float, loss_aversion: float) -> float:
        """Funcao de Utilidade da Teoria do Prospecto (Kahneman-Tversky)."""
        alpha = 0.88
        beta = 0.88
        if x >= 0:
            return math.pow(x, alpha)
        return -loss_aversion * math.pow(abs(x), beta)

    @classmethod
    def simulate_decision_tree(
        cls,
        equity: float,
        pot_size: float,
        stack_eff: float,
        active_players: int,
        street_idx: int,
        hero_invested: float,
        ev_fold_dynamic: float,
        structural_liability: float,
        valuation_stack: float,
        amortized_edge: float,
        aggression_factor: float,
        realization_factor: float,
        **kwargs: float,
    ) -> dict[str, float | str]:
        """
        Simula recursivamente a arvore de decisoes situacionais com multiplos galhos.
        Mapeia a Analise Preditiva e Precursiva profunda de outcomes.
        Retorna as utilidades esperadas (PM) de cada acao, a probabilidade do melhor outcome e a PMev.
        """
        loss_aversion_base = kwargs.get("loss_aversion_base", 2.25)
        fgs_health = kwargs.get("fgs_health", 1.0)
        rp_opp = kwargs.get("rp_opp", 20.0)
        fold_equity = kwargs.get("fold_equity", 0.30)

        # Calcular aversao ao risco dinamica do Hero para a utilidade
        safe_stack = max(2.718, stack_eff)
        stack_modifier = math.log(100.0) / math.log(safe_stack)
        fgs_modifier = 1.0 / max(0.1, math.pow(fgs_health, 2.0))
        loss_aversion = loss_aversion_base * stack_modifier * fgs_modifier

        # Showdown Convergence (Short Stack physics): as stack gets shorter,
        # play collapses to all-in/showdown, forcing R to converge to 1.0.
        spr = stack_eff / (pot_size if pot_size > 0.0 else 1.0)
        showdown_force = math.exp(-spr / 1.5)
        r_eff = realization_factor * (1.0 - showdown_force) + 1.0 * showdown_force
        r_eff = max(0.1, min(2.0, r_eff))
        realized_eq = min(0.99, max(0.01, equity * r_eff))

        # 1. Opcao: FOLD (Saida deterministica de conservacao de stack)
        pm_fold = ev_fold_dynamic
        p_best_fold = 1.0 if ev_fold_dynamic >= 0 else 0.0

        # Determinar tamanho do bet/call do Hero (situacional)
        bet_to_call = min(pot_size * 0.5, stack_eff)
        raise_size = min(pot_size * 0.75, stack_eff)

        # 2. Opcao: CALL / CHECK (Progressao ou Showdown)
        if street_idx >= 2:  # River (Showdown)
            win_delta = pot_size - hero_invested
            lose_delta = -(hero_invested + bet_to_call)
            u_win = cls.calculate_utility(win_delta, loss_aversion) * valuation_stack
            u_lose = cls.calculate_utility(lose_delta, loss_aversion) * valuation_stack
            pm_call = (realized_eq * u_win) + ((1.0 - realized_eq) * u_lose) - structural_liability
            p_best_call = realized_eq
        else:  # Flop/Turn (Progressao)
            next_pot = pot_size + 2 * bet_to_call
            next_stack = max(0.1, stack_eff - bet_to_call)
            next_street = cls.simulate_decision_tree(
                equity=equity,
                pot_size=next_pot,
                stack_eff=next_stack,
                active_players=active_players,
                street_idx=street_idx + 1,
                hero_invested=hero_invested + bet_to_call,
                ev_fold_dynamic=ev_fold_dynamic,
                structural_liability=structural_liability,
                valuation_stack=valuation_stack,
                amortized_edge=amortized_edge,
                aggression_factor=aggression_factor,
                realization_factor=realization_factor,
                loss_aversion_base=loss_aversion_base,
                fgs_health=fgs_health,
                rp_opp=rp_opp,
                fold_equity=fold_equity,
            )
            pm_call = float(next_street["pm_best"]) * 0.9 - structural_liability
            p_best_call = float(next_street["p_best_outcome"]) * 0.9

        # 3. Opcao: BET / RAISE (Ramificacoes com reacoes do oponente)
        p_opp_fold = fold_equity
        remaining = max(0.0, 1.0 - p_opp_fold)
        if remaining <= 0.0:
            p_opp_raise = 0.0
            p_opp_call = 0.0
        elif remaining < 0.04:
            p_opp_raise = remaining * 0.5
            p_opp_call = remaining * 0.5
        else:
            p_opp_raise = max(0.02, min(remaining - 0.02, 0.15 * aggression_factor * (1.0 - 0.003 * rp_opp)))
            p_opp_call = max(0.0, remaining - p_opp_raise)

        # Ramo A: Oponente Folda
        u_opp_fold = cls.calculate_utility(pot_size - hero_invested, loss_aversion) * valuation_stack
        p_best_opp_fold = 1.0

        # Ramo B: Oponente da Call
        if street_idx >= 2:  # River (Showdown)
            win_delta = pot_size + raise_size - hero_invested
            lose_delta = -(hero_invested + raise_size)
            u_opp_call_win = cls.calculate_utility(win_delta, loss_aversion) * valuation_stack
            u_opp_call_lose = cls.calculate_utility(lose_delta, loss_aversion) * valuation_stack
            u_opp_call = (realized_eq * u_opp_call_win) + ((1.0 - realized_eq) * u_opp_call_lose)
            p_best_opp_call = realized_eq
        else:  # Flop/Turn (Progressao)
            next_pot = pot_size + 2 * raise_size
            next_stack = max(0.1, stack_eff - raise_size)
            next_street = cls.simulate_decision_tree(
                equity=equity,
                pot_size=next_pot,
                stack_eff=next_stack,
                active_players=active_players,
                street_idx=street_idx + 1,
                hero_invested=hero_invested + raise_size,
                ev_fold_dynamic=ev_fold_dynamic,
                structural_liability=structural_liability,
                valuation_stack=valuation_stack,
                amortized_edge=amortized_edge,
                aggression_factor=aggression_factor,
                realization_factor=realization_factor,
                loss_aversion_base=loss_aversion_base,
                fgs_health=fgs_health,
                rp_opp=rp_opp,
                fold_equity=fold_equity,
            )
            u_opp_call = float(next_street["pm_best"]) * 0.9
            p_best_opp_call = float(next_street["p_best_outcome"]) * 0.9

        # Ramo C: Oponente da Raise/Shove
        _shove_size = stack_eff - raise_size
        u_hero_fold_to_shove = cls.calculate_utility(-(hero_invested + raise_size), loss_aversion) * valuation_stack
        p_best_hero_fold_to_shove = 0.0

        win_delta = pot_size + stack_eff - hero_invested
        lose_delta = -(hero_invested + stack_eff)
        u_hero_call_shove_win = cls.calculate_utility(win_delta, loss_aversion) * valuation_stack
        u_hero_call_shove_lose = cls.calculate_utility(lose_delta, loss_aversion) * valuation_stack
        u_hero_call_shove = (realized_eq * u_hero_call_shove_win) + ((1.0 - realized_eq) * u_hero_call_shove_lose)
        p_best_hero_call_shove = realized_eq

        if u_hero_call_shove > u_hero_fold_to_shove:
            u_opp_raise = u_hero_call_shove
            p_best_opp_raise = p_best_hero_call_shove
        else:
            u_opp_raise = u_hero_fold_to_shove
            p_best_opp_raise = p_best_hero_fold_to_shove

        pm_raise = (
            (p_opp_fold * u_opp_fold) + (p_opp_call * u_opp_call) + (p_opp_raise * u_opp_raise)
        ) - structural_liability

        p_best_raise = (
            (p_opp_fold * p_best_opp_fold) + (p_opp_call * p_best_opp_call) + (p_opp_raise * p_best_opp_raise)
        )

        # 4. Selecionar o melhor outcome em Perspectiva (PM)
        decisions = {
            "FOLD": {"pm": pm_fold, "p_best": p_best_fold},
            "CALL": {"pm": pm_call, "p_best": p_best_call},
            "RAISE": {"pm": pm_raise, "p_best": p_best_raise},
        }

        best_action = max(decisions.keys(), key=lambda k: decisions[k]["pm"])
        pm_best = decisions[best_action]["pm"]
        p_best_outcome = decisions[best_action]["p_best"]

        return {
            "pm_fold": pm_fold,
            "pm_call": pm_call,
            "pm_raise": pm_raise,
            "pm_best": pm_best,
            "p_best_outcome": p_best_outcome,
            "best_action": best_action,
        }

    @classmethod
    def get_mathematical_perspective(
        cls,
        equity: float,
        realization_factor: float,
        valuation_stack: float,
        ev_fold_dynamic: float,
        structural_liability: float,
        stack_depth_bb: float = 30.0,
        active_players: int = 2,
        edge_base: float = 1.0,
        aggression_factor: float = 0.0,
        pot_size: float = 10.0,
    ) -> float:
        """
        Legado wrapper para manter retrocompatibilidade com o endpoint.
        Calcula a Perspectiva Matematica chamando a simulacao de arvore.
        """
        res = cls.simulate_decision_tree(
            equity=equity,
            pot_size=pot_size,
            stack_eff=stack_depth_bb,
            active_players=active_players,
            street_idx=0,
            hero_invested=2.0,
            ev_fold_dynamic=ev_fold_dynamic,
            structural_liability=structural_liability,
            valuation_stack=valuation_stack,
            amortized_edge=edge_base,
            aggression_factor=aggression_factor,
            realization_factor=realization_factor,
        )
        return round(float(res["pm_best"]), 4)

    @classmethod
    def calculate_perspective_vectorized(
        cls,
        equity: Any,
        pot: Any,
        human_noise_factor: float = 0.05,
    ) -> Any:
        """
        Executa calculo vetorizado de Perspectiva via Kernel C++ SIMD (AVX2)
        com fallback transparente para NumPy/Python puro.
        """
        if TENSOR_ENGINE_AVAILABLE and QUANTUM_TENSOR_ENGINE is not None and NUMPY_AVAILABLE and np is not None:
            try:
                eq_arr = np.ascontiguousarray(equity, dtype=np.float32)
                pot_arr = np.ascontiguousarray(pot, dtype=np.float32)
                simd_fn = getattr(QUANTUM_TENSOR_ENGINE, "calculate_perspective_simd", None)
                if simd_fn is not None:
                    return simd_fn(eq_arr, pot_arr, human_noise_factor)
            except Exception:
                pass

        # Fallback analitico deterministico
        if NUMPY_AVAILABLE and np is not None:
            try:
                eq_arr = np.asarray(equity, dtype=np.float32)
                pot_arr = np.asarray(pot, dtype=np.float32)
                return (eq_arr * pot_arr) * (1.0 - human_noise_factor)
            except Exception:
                pass

        if isinstance(equity, (int, float)):
            if isinstance(pot, (int, float)):
                return (equity * pot) * (1.0 - human_noise_factor)
            return [(equity * float(p)) * (1.0 - human_noise_factor) for p in pot]
        if isinstance(pot, (int, float)):
            return [(float(e) * pot) * (1.0 - human_noise_factor) for e in equity]

        return [(float(e) * float(p)) * (1.0 - human_noise_factor) for e, p in zip(equity, pot, strict=False)]
