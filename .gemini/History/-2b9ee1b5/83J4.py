# engine/math_rio.py


def calculate_rio_risk(
    hero_invested: float,
    current_pot: float,
    hero_raw_stack: float,
    hero_position: str,
    active_players: int,
) -> dict[str, any]:
    """
    Calcula o risco de Reverse Implied Odds (RIO) usando a Lei Multiway SOTA.
    O risco cresce quadraticamente com o numero de oponentes (Pot Entrapment).
    """
    opponents = max(1, active_players - 1)
    rio_mw = hero_invested * 0.15 * (opponents**2)

    bet_to_call = current_pot * 0.5
    pot_entrapment = (hero_invested + bet_to_call) / max(0.1, hero_raw_stack)
    downward_drift = 1.25 if hero_position == "OOP" else 0.85

    rio_tension = min(1.0, (rio_mw / 100.0) + (pot_entrapment * downward_drift))
    decision = "FOLD" if rio_tension > 0.6 else "CALL"

    return {
        "rio_risk_score": round(rio_tension, 3),
        "rio_factor": round(rio_mw, 3),
        "pot_entrapment": round(pot_entrapment, 3),
        "decision": decision,
        "rationale": f"Tensao RIO de {rio_tension:.3f} detectada (Entrapment: {pot_entrapment:.2f}, Multiway: {active_players}p).",
    }


def get_bb_vs_utg_rio_table() -> list[dict[str, any]]:
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
        },
        {
            "hand": "ATo",
            "invested": 4.0,
            "pot": 12.0,
            "stack": 30.0,
            "pos": "OOP",
            "players": 3,
        },  # Multiway perigoso
        {
            "hand": "76s",
            "invested": 1.0,
            "pot": 4.0,
            "stack": 40.0,
            "pos": "IP",
            "players": 2,
        },
    ]

    results = []
    for s in scenarios:
        risk = calculate_rio_risk(
            s["invested"], s["pot"], s["stack"], s["pos"], s["players"]
        )
        results.append({**s, **risk})

    return results
