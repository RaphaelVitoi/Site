# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long, trailing-whitespace

# engine/math_rio.py
import math
from typing import Union


def calculate_rio_risk(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    active_players: int,
    human_noise_factor: float = 0.0,
) -> dict[str, Union[float, str]]:
    """
    Calcula o risco de Reverse Implied Odds (RIO) usando a Lei Multiway SOTA v4.2.
    Integra Gravidade do Pote, Downward Drift e Exponencial MW Noise.
    """
    # SOTA v4.2: Gravidade baseada em ln(pot/7.5)
    gravity = math.log(max(1.0, current_pot / 7.5)) if current_pot > 0 else 0.0

    opponents = max(1, active_players - 1)
    # RIO MW escala quadraticamente com o numero de oponentes
    rio_mw = hero_invested * 0.15 * math.pow(opponents, 2.0 + human_noise_factor)

    bet_to_call = current_pot * 0.5
    # Aprisionamento escala com o custo relativo e a gravidade acumulada
    pot_entrapment = ((hero_invested + bet_to_call) / max(0.1, hero_raw_stack)) * (1.0 + gravity * 0.1)

    downward_drift = 1.25 if hero_position in ["OOP", "BB", "SB"] else 0.85

    rio_tension = min(1.0, (rio_mw / 100.0) + (pot_entrapment * downward_drift))
    decision = "FOLD" if rio_tension > 0.6 else "CALL"

    return {
        "rio_risk_score": round(rio_tension, 3),
        "rio_factor": round(rio_mw, 3),
        "pot_entrapment": round(pot_entrapment, 3),
        "gravity": round(gravity, 3),
        "decision": decision,
        "rationale": f"Tensao RIO de {rio_tension:.3f} (G:{gravity:.2f}, E:{pot_entrapment:.2f}, MW:{active_players}p).",
    }


def get_bb_vs_utg_rio_table() -> list[dict[str, Union[float, str, int]]]:
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
        # Conversao segura de tipos
        invested = float(s["invested"])
        pot = float(s["pot"])
        stack = float(s["stack"])
        pos = str(s["pos"])
        players = int(s["players"])
        noise = float(s["noise"])

        risk = calculate_rio_risk(
            invested,
            pot,
            stack,
            pos,
            players,
            noise,
        )

        # Merge explícito
        entry: dict[str, float | str | int] = {**s, **risk}
        results.append(entry)

    return results
