"""
SOTA Discovery Engine -- RL/ML-inspired stress testing of the PMev Theory.
Role: Busca anomalias, instabilidades e 'gaps' teóricos através de amostragem Monte Carlo.
"""

import random
from typing import Any, Dict, List
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine

class PmevDiscoveryAgent:
    """
    Agente de Descoberta SOTA.
    Não treina um modelo, mas utiliza a lógica de 'Exploração vs Explotação' para 
    encontrar pontos de instabilidade na Teoria PMev.
    """

    def __init__(self):
        self.engine = VitoiPerspectiveEngine()
        self.anomalies = []

    def generate_random_state(self) -> Dict[str, Any]:
        """Gera um estado de jogo aleatório dentro de limites realistas."""
        return {
            "equity": random.uniform(0.05, 0.95),
            "pot_size": random.uniform(10.0, 500.0),
            "stack_eff_bb": random.uniform(5.0, 200.0),
            "active_players": random.randint(2, 6),
            "street_idx": random.randint(0, 2),
            "position": random.choice(["UTG", "BTN", "SB", "BB"]),
            "bubble_factor": random.uniform(1.0, 5.0),
            "time_to_blind_minutes": random.uniform(0.5, 30.0),
            "payjump_proximity": random.uniform(0.0, 1.0),
            "base_rio": random.uniform(0.05, 0.2),
            "board_connectedness": random.uniform(0.0, 1.0),
        }

    def run_discovery_cycle(self, iterations: int = 1000):
        """
        Executa o ciclo de descoberta:
        1. Amostra um estado.
        2. Obtem a decisão teórica.
        3. Perturba o estado levemente.
        4. Verifica se a decisão mudou drasticamente (Instabilidade).
        """
        print(f"[SOTA Discovery] Iniciando ciclo de {iterations} iterações...")
        
        for _ in range(iterations):
            state = self.generate_random_state()
            
            # Decisão Original
            res_orig = self.engine.evaluate_vitoi_theorems(**state)
            action_orig = res_orig["recommended_action"]
            pmev_orig = res_orig["pmev_value"]

            # Perturbação (SOTA Noise)
            perturbed_state = state.copy()
            perturbed_state["equity"] += random.uniform(-0.01, 0.01)
            perturbed_state["bubble_factor"] += random.uniform(-0.05, 0.05)

            res_pert = self.engine.evaluate_vitoi_theorems(**perturbed_state)
            action_pert = res_pert["recommended_action"]
            pmev_pert = res_pert["pmev_value"]

            # Detecção de Anomalia: Mudança de ação com variação mínima de parâmetros
            if action_orig != action_pert:
                self.anomalies.append({
                    "state": state,
                    "orig_action": action_orig,
                    "pert_action": action_pert,
                    "delta_pmev": abs(pmev_orig - pmev_pert),
                    "type": "SENSITIVITY_SPIKE"
                })

        print(f"[SOTA Discovery] Ciclo completo. {len(self.anomalies)} anomalias detectadas.")

    def get_discovery_report(self) -> List[Dict[str, Any]]:
        return self.anomalies

if __name__ == "__main__":
    agent = PmevDiscoveryAgent()
    agent.run_discovery_cycle(500)
    report = agent.get_discovery_report()
    for a in report[:5]:
        print(f"Anomalia: {a}")
