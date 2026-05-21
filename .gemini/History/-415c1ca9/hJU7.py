import math
from typing import Optional, Dict, Any

class PerspectiveEngine:
    """
    SOTA v4.1 - Física Quântica do Poker (Motor de Perspectiva Matemática)
    Implementa a termodinâmica da Decisão: Piso Dinâmico (EV_fold),
    Amortização da Edge (Poda da Árvore) e Insolvência Multiway (RIO Exponencial).
    """

    @staticmethod
    def calculate_quantum_metrics(
        eq: float,
        delta_win_pct: float,
        delta_lose_pct: float,
        ev_fold_pct: float,
        r_factor: float,
        fgs_health: float,
        delta_habilidade: float,
        s_eff: float,
        active_players: int,
        hero_cost: float,
        pot_size: float,
        k: float = 0.05,
        base_rio_pct: float = 0.15
    ) -> Dict[str, Any]:
        """
        Processa o cruzamento entre as forças do solver e a entropia humana.
        """

        # 1. Amortização da Edge (Fator de Descompressão)
        # Habilidade bruta colapsa em stacks curtos devido à falta de ferramentas (Push/Fold)
        # e à proteção estatística da variância.
        amortized_edge_multiplier = 1.0 + ((delta_habilidade / 100.0) * (1.0 - math.exp(-k * s_eff)))
        adjusted_delta_win = delta_win_pct * amortized_edge_multiplier

        # 2. Matriz de Insolvência Multiway (Passivo Estrutural - RIO)
        # As Reverse Implied Odds crescem quadraticamente conforme a entropia (oponentes) aumenta.
        opponents = max(1, active_players - 1)
        mw_factor = float(opponents ** 2)
        base_rio = hero_cost * base_rio_pct
        rio_mw = base_rio * mw_factor

        # O EV_fold real afunda sob o peso do passivo de colisão.
        adjusted_ev_fold = ev_fold_pct - rio_mw

        # 3. Esperança (Lógica) e Expectativa (Preditiva)
        # Incorpora a antevisão de FGS e o Fator de Realização Posicional (R).
        e_val = (eq * adjusted_delta_win) + ((1.0 - eq) * delta_lose_pct)
        p_val = (eq * adjusted_delta_win * r_factor * fgs_health) + ((1.0 - eq) * delta_lose_pct)

        # 4. Perspectiva Matemática (A Síntese SOTA)
        pm_val = p_val - adjusted_ev_fold

        # 5. Break-even Equity (Limiar Real)
        denom = (adjusted_delta_win * r_factor * fgs_health) - delta_lose_pct
        thresh_eq = None
        if abs(denom) > 1e-6:
            thresh_eq = max(0.0, min(1.0, (adjusted_ev_fold - delta_lose_pct) / denom))

        # 6. Coeficiente de Insolvência (Ci)
        # Denuncia a armadilha das Pot Odds. Se < 1, o pote exige mais equidade
        # estrutural do que o "preço barato" sugere.
        ci = None
        pot_odds = 0.0
        if (pot_size + hero_cost) > 0:
            pot_odds = hero_cost / (pot_size + hero_cost)

        if thresh_eq is not None and thresh_eq > 0:
            ci = pot_odds / thresh_eq

        return {
            "amortizedEdgeMultiplier": amortized_edge_multiplier,
            "rioMw": rio_mw,
            "adjustedEvFold": adjusted_ev_fold,
            "esperanca": e_val,
            "expectativa": p_val,
            "perspectiva": pm_val,
            "threshEq": thresh_eq,
            "ci": ci,
            "isSolvent": ci is not None and ci >= 1.0,
            "isActionable": pm_val > 0
        }
