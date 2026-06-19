# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long

# engine/math_rio.py
from .math_sota import calculate_rio_risk_v2


def calculate_rio_risk(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    active_players: int,
    human_noise_factor: float = 0.0,
) -> dict[str, float | str]:
    """
    Legado: Wrapper para o motor SOTA v4.6 unificado.
    Mantem compatibilidade com assinaturas anteriores enquanto usa a fisica de elite.
    """

    return calculate_rio_risk_v2(
        hero_invested=hero_invested,
        current_pot=current_pot,
        hero_raw_stack=hero_raw_stack,
        hero_position=hero_position,
        active_players=active_players,
        human_noise_factor=human_noise_factor,
    )


def get_bb_vs_utg_rio_table() -> list[dict[str, float | str | int]]:
    """
    Gera a tabela de perigos de RIO para BB vs UTG.
    Baseado nos axiomas VITOI de Passivo Estrutural.
    """
    scenarios: list[dict[str, float | str | int]] = [
        {
            "hand": "KJo",
            "invested": 2.0,
            "pot": 5.5,
            "stack": 30.0,
            "pos": "OOP",
            "players": 2,
            "noise": 0.0,
        },
        {
            "hand": "ATo",
            "invested": 4.0,
            "pot": 12.0,
            "stack": 30.0,
            "pos": "OOP",
            "players": 3,
            "noise": 0.4,
        },
        {
            "hand": "76s",
            "invested": 1.0,
            "pot": 4.0,
            "stack": 40.0,
            "pos": "IP",
            "players": 2,
            "noise": 0.0,
        },
    ]

    results: list[dict[str, float | str | int]] = []
    for s in scenarios:
        risk = calculate_rio_risk(
            float(s["invested"]),
            float(s["pot"]),
            float(s["stack"]),
            str(s["pos"]),
            int(s["players"]),
            float(s["noise"]),
        )
        results.append({**s, **risk})

    return results
