import sys
from perspective_engine import PerspectiveEngine, SystemState

# === ONTOLOGIA VITOI SOTA v3.2 ===
# Teste: Toy Game 5 - A Inversao de RIO
# Comprova a falencia das Pot Odds em cenarios de alta entropia.

def run_toy_game_5() -> None:
    engine = PerspectiveEngine()

    print("=== [SOTA] LABORATORIO DE PERSPECTIVA: TOY GAME 5 ===")
    print("Testando a Inversao de RIO sob Entropia Multiway e Pressao ICM\n")

    scenarios = [
        {
            "name": "Cenario 1: HU em ChipEV (Baseline Estavel)",
            "state": SystemState(effective_stack=50.0, players_in_pot=2, pot_odds=0.5, time_to_blind=15.0, payjump_proximity=0.0, risk_aversion=1.0)
        },
        {
            "name": "Cenario 2: MW em ChipEV (Sintoma de RIO)",
            "state": SystemState(effective_stack=50.0, players_in_pot=4, pot_odds=0.5, time_to_blind=15.0, payjump_proximity=0.0, risk_aversion=1.0)
        },
        {
            "name": "Cenario 3: Bolha MW (Insolvencia SOTA - Toy Game 5)",
            "state": SystemState(effective_stack=50.0, players_in_pot=4, pot_odds=0.5, time_to_blind=15.0, payjump_proximity=0.9, risk_aversion=2.5)
        },
        {
            "name": "Cenario 4: Colapso da Edge (SS em Bolha t-3)",
            "state": SystemState(effective_stack=12.0, players_in_pot=2, pot_odds=0.5, time_to_blind=1.5, payjump_proximity=0.9, risk_aversion=2.5)
        },
        {
            "name": "Cenario 5: O Fator Bobagem (Salvando a Insolvencia)",
            "state": SystemState(effective_stack=50.0, players_in_pot=4, pot_odds=0.5, time_to_blind=15.0, payjump_proximity=0.9, risk_aversion=2.5, human_nonsense_factor=12.0)
        }
    ]

    # Interface ASCII SOTA
    print(f"{'CENARIO':<50} | {'CI':<7} | {'DIAGNOSTICO':<12} | {'RIO':<6} | {'EDGE'}")
    print("-" * 95)

    for s in scenarios:
        state = s["state"]
        res = engine.evaluate_spot(state)

        name = s["name"]
        ci = res["coeficiente_insolvencia"]
        diag = res["diagnostico"]
        rio = res["rio_penalty"]
        edge = res["edge_amortization"]

        print(f"{name:<50} | {ci:<7.2f} | {diag:<12} | {rio:<6.2f} | {edge:<.2f}")

if __name__ == '__main__':
    run_toy_game_5()
