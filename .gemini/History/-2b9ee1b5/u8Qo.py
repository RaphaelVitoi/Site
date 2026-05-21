# engine/math_rio.py
import math
from typing import Any


def calculate_rio_risk(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    active_players: int,
    human_noise_factor: float = 0.0,
) -> dict[str, Any]:
    """
    Calcula o risco de Reverse Implied Odds (RIO) usando a Lei Multiway SOTA.
    O risco cresce exponencialmente (x^(2+f)) com o numero de oponentes e o ruido humano (Table Draw).
    """
    opponents = max(1, active_players - 1)
    rio_mw = hero_invested * 0.15 * math.pow(opponents, 2.0 + human_noise_factor)

    bet_to_call = current_pot * 0.5
    pot_entrapment = (hero_invested + bet_to_call) / max(0.1, hero_raw_stack)
    downward_drift = 1.25 if hero_position in ["OOP", "BB", "SB"] else 0.85

    rio_tension = min(1.0, (rio_mw / 100.0) + (pot_entrapment * downward_drift))
    decision = "FOLD" if rio_tension > 0.6 else "CALL"

    return {
        "rio_risk_score": round(rio_tension, 3),
        "rio_factor": round(rio_mw, 3),
        "pot_entrapment": round(pot_entrapment, 3),
        "decision": decision,
        "rationale": f"Tensao RIO de {rio_tension:.3f} detectada (Entrapment: {pot_entrapment:.2f}, Multiway: {active_players}p).",
    }


def get_bb_vs_utg_rio_table() -> list[dict[str, Any]]:
    """
    Gera a tabela de perigos de RIO para BB vs UTG.
    Baseado nos axiomas VITOI de Passivo Estrutural.
    """
    scenarios = [
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
        },  # Multiway perigoso com Ruido Humano Ativo
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

    results = []
    for s in scenarios:
        risk = calculate_rio_risk(
            float(s["invested"]),
            float(s["pot"]),
            float(s["stack"]),
            str(s["pos"]),
            int(s["players"]),
            float(s.get("noise", 0.0)),
        )
        results.append({**s, **risk})

    return results
