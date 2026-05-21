import math


def calculate_geometric_sizing(current_pot: float, target_pot: float, remaining_streets: int) -> float:
    """
    Calcula a fracao do pote (f) necessaria para apostar nas streets restantes
    e atingir o target_pot (geralmente All-in no river).
    Formula: (1 + 2f)^n = target_pot / current_pot
    """
    if current_pot <= 0 or target_pot <= current_pot or remaining_streets <= 0:
        return 0.0

    growth_factor = target_pot / current_pot
    one_plus_two_f = math.pow(growth_factor, 1.0 / remaining_streets)
    f = (one_plus_two_f - 1.0) / 2.0
    return f

def cfr_mock_strategy(regrets: dict[str, float]) -> dict[str, float]:
    """
    Simula uma iteracao de Regret Matching.
    Converte regrets acumulados em uma mixed strategy baseada em pesos positivos.
    """
    positive_regrets = {action: max(0.0, r) for action, r in regrets.items()}
    total_positive_regret = sum(positive_regrets.values())

    if total_positive_regret > 0:
        return {action: r / total_positive_regret for action, r in positive_regrets.items()}

    n = len(regrets)
    return {action: 1.0 / n for action in regrets}
