import math
from dataclasses import dataclass
from typing import Dict, Any

# === ONTOLOGIA VITOI SOTA v3.2 ===
# Modulo: Perspective Engine (Motor de Antevisao Semantica)
# Objetivo: Substituir a metrica de Pot Odds pelo Coeficiente de Insolvencia (Ci)
# Strict Rule: Friccao Zero, Pure ASCII, Rigor Matematico.

@dataclass
class SystemState:
    effective_stack: float      # Profundidade em BBs (S_eff)
    players_in_pot: int         # Fator de Entropia Multiway
    pot_odds: float             # Heuristica de 1a Ordem
    time_to_blind: float        # Tempo para subir o blind (em minutos)
    payjump_proximity: float    # Escala de 0.0 (Longe) a 1.0 (Bolha/Payjump iminente)
    risk_aversion: float        # Multiplicador ICM (1.0 = ChipEV, >1.5 = Alta Pressao)

class PerspectiveEngine:
    def __init__(self) -> None:
        self.base_antes = 0.125

    def calc_dynamic_ev_fold(self, state: SystemState) -> float:
        """Calcula o piso de comparacao dinâmico."""
        # ChipEV basico (perda passiva)
        base_fold = -self.base_antes

        # Efeito t-3 (Erosao Antecipada): Se < 3 mins, fold fica mais caro.
        time_penalty = 0.0
        if 0 < state.time_to_blind < 3.0:
            time_penalty = -0.05 * (3.0 - state.time_to_blind)

        # Efeito Payjump: Aumenta o valor financeiro da sobrevivencia passiva (EV positivo)
        survival_value = state.payjump_proximity * 0.5 * state.risk_aversion

        return base_fold + time_penalty + survival_value

    def calc_rio_penalty(self, state: SystemState) -> float:
        """As RIO punem exponencialmente cenarios Multiway sob pressao de ICM."""
        if state.players_in_pot < 2:
            return 0.0

        base_rio = 0.5
        # Crescimento exponencial (N^1.5) da vulnerabilidade estrutural
        return base_rio * (state.players_in_pot ** 1.5) * state.risk_aversion

    def calc_edge_amortization(self, state: SystemState) -> float:
        """Colapso mecanico da árvore de decisao. S_eff <= 15bb neutraliza o outplay."""
        if state.effective_stack <= 15.0:
            return 0.0
        if state.effective_stack >= 100.0:
            return 1.0

        # Curva logaritmica entre 15bb e 100bb
        return math.log(state.effective_stack - 14) / math.log(86)

    def evaluate_spot(self, state: SystemState) -> Dict[str, Any]:
        """Gera o tensor de perspectiva matematica final e o diagnostico."""
        ev_fold = self.calc_dynamic_ev_fold(state)
        rio = self.calc_rio_penalty(state)
        edge = self.calc_edge_amortization(state)

        # Base de utilidade assumindo um spot de equidade bruta de 1.0 (neutro)
        raw_utility = 1.0 + ev_fold - rio

        # A Edge Relativa atua como um multiplicador de retencao de utilidade
        perspectiva_final = raw_utility * (0.5 + 0.5 * edge)

        ci = perspectiva_final / state.pot_odds if state.pot_odds > 0 else 0.0

        return {
            "ev_fold_dinamico": round(ev_fold, 3),
            "rio_penalty": round(rio, 3),
            "edge_amortization": round(edge, 3),
            "perspectiva_final": round(perspectiva_final, 3),
            "coeficiente_insolvencia": round(ci, 3),
            "diagnostico": "INSOLVENTE" if ci < 1.0 else "OPERACIONAL"
        }
