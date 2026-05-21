"""
Testes para validacao da logica Bayesiana do motor SOTA.
"""

import sys
from pathlib import Path

# Adiciona o root ao path para imports
sys.path.append(str(Path(__file__).resolve().parent.parent))

from engine.math_sota import calculate_bayesian_win_prob


def test_bayesian_logic():
    """Valida se a inferencia Bayesiana atualiza a probabilidade de vitoria corretamente."""
    print("=== [TESTE SOTA] Validando Logica Bayesiana ===")

    # Caso 1: Equidade 50/50, Acao Forte (0.8), Densidade Media
    # Esperamos que a probabilidade posterior suba significativamente
    prior = 0.5
    action = 0.8
    posterior = calculate_bayesian_win_prob(prior, action)
    print(f"Prior: {prior} | Acao: {action} -> Posterior: {posterior:.4f}")
    assert posterior > prior, "Erro: Acao forte deve aumentar a win prob posterior"

    # Caso 2: Equidade 50/50, Acao Fraca (0.2)
    # Esperamos que a probabilidade posterior caia
    action_weak = 0.2
    posterior_weak = calculate_bayesian_win_prob(prior, action_weak)
    print(f"Prior: {prior} | Acao: {action_weak} -> Posterior: {posterior_weak:.4f}")
    assert posterior_weak < prior, "Erro: Acao fraca deve diminuir a win prob posterior"

    # Caso 3: Range Polarizado (density -> 0)
    # A acao forte deve ter impacto ainda maior
    posterior_polarized = calculate_bayesian_win_prob(prior, 0.8, range_density=0.1)
    print(f"Polarizado (Density 0.1) -> Posterior: {posterior_polarized:.4f}")
    assert posterior_polarized > posterior, (
        "Erro: Range polarizado deve amplificar o likelihood"
    )

    print("[OK] Logica Bayesiana validada com exito.")


if __name__ == "__main__":
    test_bayesian_logic()
