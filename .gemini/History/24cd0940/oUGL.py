"""
Motor de Leitura Bayesiana de Ranges (SOTA).
Calcula a contracao dos ranges oponentes aplicando o Teorema de Bayes a cada acao observada.
"""

from typing import List


def update_posterior(
    prior_matrix: List[List[float]], likelihood_matrix: List[List[float]]
) -> List[List[float]]:
    """
    Contracao Bayesiana pura.
    Multiplica o Prior (frequencia previa) pelo Likelihood (probabilidade da acao dada a mao)
    e normaliza (Marginal Likelihood) para obter o Posterior.
    """
    posterior = [[0.0 for _ in range(13)] for _ in range(13)]
    marginal = 0.0

    for r in range(13):
        for c in range(13):
            # Numerador: P(Acao|Mao) * P(Mao)
            posterior[r][c] = likelihood_matrix[r][c] * prior_matrix[r][c]
            marginal += posterior[r][c]

    # Normalizacao para garantir que a soma das probabilidades seja 1.0 (ou 100%)
    if marginal > 0:
        for r in range(13):
            for c in range(13):
                posterior[r][c] /= marginal

    return posterior


def build_likelihood_matrix(
    action: str, board: List[str], profile: str = "reg"
) -> List[List[float]]:
    """
    Constroi a matriz de Likelihood baseada na acao e na textura do board.
    Aqui serao injetadas as heuristicas taticas do motor (ex: Smart Sniper, RIO).
    """
    # Esqueleto: retorna distribuicao uniforme inicialmente
    return [[0.5 for _ in range(13)] for _ in range(13)]
