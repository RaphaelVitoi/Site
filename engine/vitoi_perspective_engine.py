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

    @staticmethod
    def calculate_janda_vitoi_defense(pot_size: float, bet_size: float, bubble_factor: float = 1.0) -> dict[str, float]:
        """
        Ponte Janda-Vitoi Analitica Exata para defesa no River sob ICM/PMev.
        Calcula a equidade minima de indiferenca, o Risk Premium exato em p.p. e a MDF sob perspectiva.
        """
        if pot_size <= 0 or bet_size <= 0:
            return {
                "equity_required_pmev": 0.0,
                "equity_required_chipev": 0.0,
                "risk_premium_pp": 0.0,
                "mdf_pmev": 1.0,
                "mdf_chipev": 1.0,
            }
        bf = max(1.0, bubble_factor)
        e_chipev = bet_size / (pot_size + 2.0 * bet_size)
        mdf_chipev = pot_size / (pot_size + bet_size)

        denom = pot_size + bet_size + (bet_size * bf)
        e_pmev = (bet_size * bf) / denom if denom > 0 else 0.0
        mdf_pmev = (pot_size + bet_size) / denom if denom > 0 else 0.0
        rp_pp = max(0.0, e_pmev - e_chipev)

        return {
            "equity_required_pmev": round(e_pmev, 4),
            "equity_required_chipev": round(e_chipev, 4),
            "risk_premium_pp": round(rp_pp, 4),
            "mdf_pmev": round(mdf_pmev, 4),
            "mdf_chipev": round(mdf_chipev, 4),
        }

    @staticmethod
    def calculate_combinatorial_multiway_liability(
        active_players: int,
        base_rio: float,
        equity: float,
        bubble_factor_avg: float = 1.0,
    ) -> float:
        """
        Deducao Combinatoria Rigorosa do Passivo Estrutural Multiway K = n*(n-1)/2.
        """
        if active_players <= 2:
            return round(base_rio * (1.0 - max(0.0, min(1.0, equity))), 4)
        k_combinations = (active_players * (active_players - 1)) / 2.0
        liability = base_rio * k_combinations * (1.0 - max(0.0, min(1.0, equity))) * max(1.0, bubble_factor_avg)
        return round(liability, 4)

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


    @staticmethod
    def calculate_negative_risk_premium_river(
        pot_size: float,
        bet_size: float,
        residual_stack_bb: float,
        fold_survival_prob: float,
        call_win_survival_prob: float,
    ) -> dict[str, float]:
        """
        Teorema 2 (Vitoi): Inversao de Valuation e Risk Premium Negativo (RP menor que 0) no River.
        Quando a stack residual encolhe para zona de morte (<= 4bb) e o pote infla,
        a probabilidade de ressurgir com o Bluffcatcher supera a morte por inanicao com micro-stack.
        """
        chipev_equity = bet_size / (pot_size + 2.0 * bet_size)
        if fold_survival_prob <= 0:
            fold_survival_prob = 1e-6
        relative_survival_ratio = fold_survival_prob / max(call_win_survival_prob, 1e-6)
        pmev_required_equity = chipev_equity * relative_survival_ratio
        risk_premium = pmev_required_equity - chipev_equity
        is_negative_rp = risk_premium < 0.0 or residual_stack_bb <= 4.0

        return {
            "chipev_equity": round(chipev_equity, 4),
            "pmev_required_equity": round(pmev_required_equity, 4),
            "risk_premium": round(risk_premium, 4),
            "is_negative_rp": 1.0 if is_negative_rp else 0.0,
            "bluffcatcher_call_mandatory": 1.0 if (is_negative_rp or pmev_required_equity <= chipev_equity) else 0.0,
        }

    @staticmethod
    def calculate_symmetric_dissipation_vector(
        stacks: list[float],
        eliminated_idx: int,
        lost_perspective: float,
    ) -> list[float]:
        """
        Teorema 3 (Vitoi): 1a Lei da Termodinamica do Poker (Conservacao e Dissipacao).
        A soma das perspectivas no Simplex e constante (sum(Omega_i) == 1).
        A perspectiva perdida por um jogador e simetricamente dissipada para todos os outros sobreviventes.
        """
        n = len(stacks)
        if n <= 1:
            return [0.0] * n
        surviving_indices = [i for i in range(n) if i != eliminated_idx]
        total_surviving_stack = sum(stacks[i] for i in surviving_indices)
        if total_surviving_stack <= 0:
            share = lost_perspective / len(surviving_indices)
            return [round(-lost_perspective, 4) if i == eliminated_idx else round(share, 4) for i in range(n)]

        dissipation = [0.0] * n
        dissipation[eliminated_idx] = round(-lost_perspective, 4)
        for i in surviving_indices:
            weight = stacks[i] / total_surviving_stack
            dissipation[i] = round(lost_perspective * weight, 4)
        return dissipation

    @staticmethod
    def calculate_convex_speculation_ev(
        entry_cost_bb: float,
        prob_hit_cooler: float,
        current_title_prob: float,
        new_leader_title_prob: float,
    ) -> dict[str, float]:
        """
        Teorema 4 (Vitoi): Alavancagem Convexa Especulativa vs Chip Leader.
        Opcao de Black-Scholes no poker: custo marginal linear minusculo (-entry_cost) vs
        payoff exponencial quantico ao sequestrar o centro gravitacional da mesa.
        """
        linear_cost = (1.0 - prob_hit_cooler) * (-entry_cost_bb)
        perspective_jump = new_leader_title_prob - current_title_prob
        convex_payoff = prob_hit_cooler * perspective_jump
        net_ev_speculation = linear_cost + (convex_payoff * 100.0)

        return {
            "linear_cost": round(linear_cost, 4),
            "perspective_jump": round(perspective_jump, 4),
            "convex_payoff": round(convex_payoff, 4),
            "net_ev_speculation": round(net_ev_speculation, 4),
            "speculation_approved": 1.0 if net_ev_speculation > 0.0 else 0.0,
        }

    @staticmethod
    def calculate_static_overpair_decay(
        preflop_equity: float,
        street_idx: int,
        board_connectedness: float,
        active_opponents: int,
    ) -> float:
        """
        Teorema 9 (Vitoi): Decaimento Entropico Monotono do Par de As (AA).
        O AA e estatico com apenas 2 outs de trinca (~4.3%), sofrendo degradacao continua
        conforme o board avanca (Flop -> Turn -> River) contra ranges conectados vivos (8 a 15 outs).
        """
        if street_idx <= 0:
            return round(preflop_equity, 4)
        decay_rate = 0.08 * street_idx * (1.0 + board_connectedness * 0.5) * math.log2(max(active_opponents, 2))
        realized_equity = max(preflop_equity - decay_rate, 0.12)
        return round(realized_equity, 4)

    @staticmethod
    def calculate_utg_disguised_open_ev(
        hero_stack_bb: float,
        hero_open_size_bb: float,
        dead_money_bb: float,
        num_players_behind: int,
        short_stacks_behind_count: int,
        hero_equity_vs_bb: float,
        flop_cbet_fe: float = 0.50,
        realization_factor: float = 1.15,
    ) -> dict[str, float]:
        """
        Teorema 5 (Vitoi): O Open Disfarcado do UTG & O Escudo de Transito.
        Abrir de posicao inicial (UTG) com stack confortavel na presenca de short-stacks atras
        esteriliza 3-bets leves dos lideres e impede Check-Raises do Big Blind OOP.
        """
        base_3bet_threat = 0.08 * math.log2(max(num_players_behind, 2))
        transit_shield_suppression = 0.40 * min(short_stacks_behind_count, 3)
        prob_3bet_absorbed = max(0.01, base_3bet_threat * (1.0 - transit_shield_suppression))
        
        prob_fold_around = max(0.15, 0.50 * (1.0 - 0.04 * num_players_behind))
        prob_bb_call = max(0.20, 1.0 - prob_fold_around - prob_3bet_absorbed)
        
        pot_flop = dead_money_bb + (hero_open_size_bb * 2.0)
        r_eff = realization_factor * (1.0 + 0.10 * short_stacks_behind_count)
        postflop_ev = (flop_cbet_fe * pot_flop) + ((1.0 - flop_cbet_fe) * ((hero_equity_vs_bb * r_eff * pot_flop) - hero_open_size_bb))
        
        net_ev_open = (prob_fold_around * dead_money_bb) + (prob_bb_call * postflop_ev) - (prob_3bet_absorbed * hero_open_size_bb)
        
        return {
            "prob_fold_around": round(prob_fold_around, 4),
            "prob_3bet_absorbed": round(prob_3bet_absorbed, 4),
            "prob_bb_call": round(prob_bb_call, 4),
            "postflop_ev_bb": round(postflop_ev, 4),
            "net_ev_open": round(net_ev_open, 4),
            "transit_shield_active": 1.0 if short_stacks_behind_count >= 1 else 0.0,
            "open_approved": 1.0 if net_ev_open > 0.0 else 0.0,
        }

    @staticmethod
    def calculate_check_condensation_and_ip_aggression(
        oop_check_strategy_pct: float,
        is_multiway: bool,
        pot_size: float,
        board_texture_wetness: float = 0.5,
    ) -> dict[str, float]:
        """
        Teorema 8 (Vitoi): A Poda Bipolar do Check e o Teorema 'Quem Checa Tudo, Tem Tudo'.
        Quando o agressor OOP adota Check-100% de range no 3-way, o range permanece estritamente
        NAO-CAPADO ('quem checa tudo, tem tudo'). Checagens parciais condensam a meiuca.
        """
        clamped_check = max(0.0, min(1.0, oop_check_strategy_pct))
        is_pure_range_check = clamped_check >= 0.95
        
        if is_pure_range_check:
            uncapped_retention = 1.0
            condensed_middle_retention = 1.0
            oop_range_capped = 0.0
            recommended_ip_bet_frequency = 0.33 if is_multiway else 0.45
            ip_check_back_realization = 0.85
        else:
            uncapped_retention = max(0.05, clamped_check * 0.4)
            condensed_middle_retention = min(1.0, clamped_check * 1.5)
            oop_range_capped = 1.0
            wetness_mod = 1.0 + (board_texture_wetness * 0.25)
            recommended_ip_bet_frequency = min(0.85, (0.55 if not is_multiway else 0.42) * wetness_mod)
            ip_check_back_realization = 0.65
            
        return {
            "oop_check_strategy_pct": round(clamped_check, 4),
            "is_pure_range_check": 1.0 if is_pure_range_check else 0.0,
            "oop_range_capped": oop_range_capped,
            "uncapped_retention": round(uncapped_retention, 4),
            "condensed_middle_retention": round(condensed_middle_retention, 4),
            "recommended_ip_bet_frequency": round(recommended_ip_bet_frequency, 4),
            "ip_check_back_realization": round(ip_check_back_realization, 4),
        }

    @classmethod
    def evaluate_vitoi_theorems(
        cls,
        equity: float,
        pot_size: float,
        stack_eff_bb: float,
        active_players: int = 2,
        street_idx: int = 0,
        position: str = "BTN",
        bubble_factor: float = 1.30,
        time_to_blind_minutes: float = 10.0,
        payjump_proximity: float = 0.5,
        base_rio: float = 1.0,
        board_connectedness: float = 0.5,
    ) -> dict[str, Any]:
        """
        SOTA: Sintese Unificada dos 10 Teoremas Canonicos da Perspectiva Matematica (PMev).
        Executa uma auditoria multidimensional diacronica do cenario em tempo real.
        """
        ev_fold = cls.calculate_dynamic_ev_fold(
            base_antes=1.0,
            time_to_blind_minutes=time_to_blind_minutes,
            payjump_proximity_factor=payjump_proximity,
            position=position,
        )
        
        t2_res = cls.calculate_negative_risk_premium_river(
            pot_size=pot_size,
            bet_size=min(pot_size * 0.5, stack_eff_bb),
            residual_stack_bb=stack_eff_bb,
            fold_survival_prob=0.05,
            call_win_survival_prob=0.40,
        )
        
        t3_dissipation = cls.calculate_symmetric_dissipation_vector(
            stacks=[stack_eff_bb * 2.0, stack_eff_bb, stack_eff_bb * 0.7, stack_eff_bb * 0.4],
            eliminated_idx=3,
            lost_perspective=0.15,
        )
        
        t4_spec = cls.calculate_convex_speculation_ev(
            entry_cost_bb=2.0,
            prob_hit_cooler=0.12,
            current_title_prob=0.18,
            new_leader_title_prob=0.55,
        )
        
        t5_utg = cls.calculate_utg_disguised_open_ev(
            hero_stack_bb=stack_eff_bb,
            hero_open_size_bb=2.0,
            dead_money_bb=2.5,
            num_players_behind=7,
            short_stacks_behind_count=2 if stack_eff_bb >= 20 else 0,
            hero_equity_vs_bb=equity,
        )
        
        t6_janda = cls.calculate_janda_vitoi_defense(
            pot_size=pot_size,
            bet_size=min(pot_size * 0.5, stack_eff_bb),
            bubble_factor=bubble_factor,
        )
        
        t7_multiway = cls.calculate_combinatorial_multiway_liability(
            active_players=active_players,
            base_rio=base_rio,
            equity=equity,
            bubble_factor_avg=bubble_factor,
        )
        
        t8_check = cls.calculate_check_condensation_and_ip_aggression(
            oop_check_strategy_pct=1.0 if active_players >= 3 else 0.70,
            is_multiway=active_players >= 3,
            pot_size=pot_size,
            board_texture_wetness=board_connectedness,
        )
        
        t9_decay = cls.calculate_static_overpair_decay(
            preflop_equity=equity if equity > 0.70 else 0.85,
            street_idx=street_idx,
            board_connectedness=board_connectedness,
            active_opponents=active_players,
        )
        
        t10_vector = cls.calculate_dual_navigation_vector(
            alpha_attack=0.65 if stack_eff_bb > 25 else 0.25,
            expansion_title_value=0.75,
            conservation_survival_value=0.45,
        )
        
        tree_res = cls.simulate_decision_tree(
            equity=equity,
            pot_size=pot_size,
            stack_eff=stack_eff_bb,
            active_players=active_players,
            street_idx=street_idx,
            hero_invested=2.0,
            ev_fold_dynamic=ev_fold,
            structural_liability=t7_multiway,
            valuation_stack=1.0,
            amortized_edge=cls.calculate_edge_amortization(stack_eff_bb, 0.05, 1.5),
            aggression_factor=1.5,
            realization_factor=1.0,
        )
        
        return {
            "teorema_1_dynamic_ev_fold": ev_fold,
            "teorema_2_river_inversion": t2_res,
            "teorema_3_thermodynamic_dissipation": t3_dissipation,
            "teorema_4_convex_speculation": t4_spec,
            "teorema_5_utg_disguised_open": t5_utg,
            "teorema_6_janda_vitoi_defense": t6_janda,
            "teorema_7_multiway_liability": t7_multiway,
            "teorema_8_check_condensation": t8_check,
            "teorema_9_overpair_decay": t9_decay,
            "teorema_10_dual_navigation_vector": t10_vector,
            "decision_tree_synthesis": tree_res,
            "recommended_action": tree_res["best_action"],
            "pmev_value": tree_res["pm_best"],
        }

    @staticmethod
    def calculate_dual_navigation_vector(
        alpha_attack: float,
        expansion_title_value: float,
        conservation_survival_value: float,
    ) -> float:
        """
        Teorema 10 (Vitoi): O Vetor Duplo de Navegacao da PMev.
        Omega*(a|t) = alpha * Omega_Expansao(1o Lugar) + (1 - alpha) * Omega_Conservacao(Trajetoria)
        """
        clamped_alpha = max(0.0, min(1.0, alpha_attack))
        res = (clamped_alpha * expansion_title_value) + ((1.0 - clamped_alpha) * conservation_survival_value)
        return round(res, 4)

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
