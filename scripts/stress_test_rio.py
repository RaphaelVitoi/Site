"""
Script de stress test para avaliar a métrica de RIO (Reverse Implied Odds) em diferentes cenários.
"""

import math
import sys
import os

# Adiciona o diretório atual ao path para importar o motor
sys.path.append(os.getcwd())

from engine.math_sota import calculate_rio_risk_v2

def run_rio_stress_test():
    """Executa a simulação de estresse para a tabela de perigos de RIO."""
    print("# SIMULAÇÃO DE ESTRESSE: TABELA DE PERIGOS DE RIO (SOTA v6)")
    print("-" * 80)
    print(
        f"{'Players':<8} | {'Stack':<8} | {'Pot':<8} | {'Invested':<10} | {'Ci':<8} | "
        f"{'Status':<12} | {'Rationale'}"
    )
    print("-" * 80)

    # Variáveis de controle baseadas na Derivação 2 (RIO O(N^2))
    player_counts = [2, 3, 4, 5, 6]
    stacks = [15.0, 30.0, 60.0]
    # Simula um cenário de call no flop/turn
    scenarios = [
        {"pot": 5.0, "invested": 2.5},   # Bet 1/2 pot
        {"pot": 10.0, "invested": 5.0},  # Bet 1/2 pot (pote maior)
        {"pot": 20.0, "invested": 10.0}, # Bet 1/2 pot (pote gigante)
    ]

    for n in player_counts:
        for s in stacks:
            for sc in scenarios:
                # SOTA v6.2.1: Cálculo de Gravidade e Damping
                gravity = math.log(max(1.0, sc["pot"] / 7.5))
                damping = 1.0 / (1.0 + gravity * 0.15)

                # Curvatura de Nash: Mede o "drift" da agressão
                nash_curvature = damping * (1.0 / (1.0 + (n - 1) * 0.2))

                # Usamos a função unificada de risco que já calcula a tensão RIO e o Ci
                risk_data = calculate_rio_risk_v2(
                    hero_invested=sc["invested"],
                    current_pot=sc["pot"],
                    hero_raw_stack=s,
                    hero_position="OOP", # BB vs UTG
                    active_players=n,
                    human_noise_factor=0.15 # SOTA v6.2.1 Harmony
                )

                ci = float(risk_data["ci"])
                status = "SOLVENTE" if ci >= 1.0 else "INSOLVENTE"

                rationale = risk_data["rationale"]
                print(
                    f"{n:<8} | {s:<8.1f} | {sc['pot']:<8.1f} | {sc['invested']:<10.1f} | "
                    f"{ci:<8.2f} | {status:<12} | NC: {nash_curvature:.2f} | {rationale}"
                )

    print("-" * 80)
    print("Fim da Simulação de Estresse.")

if __name__ == "__main__":
    run_rio_stress_test()
