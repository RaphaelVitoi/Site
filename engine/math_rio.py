# engine/math_rio.py
from typing import Dict, List

def calculate_rio_risk(pot_odds: float, hand_strength: float, structural_passivity: float) -> Dict[str, any]:
    """
    Calcula o risco de Reverse Implied Odds (RIO).
    RIO_Risk = Structural_Passivity * (1 - Hand_Strength) / Pot_Odds
    Se RIO_Risk > Threshold, a Perspectiva Matematica exige o Fold.
    """
    # Fator de punicao estrutural (passivo estrutural)
    rio_factor = structural_passivity * (1.0 - hand_strength)
    
    # Ajuste por Pot Odds (quanto maior a pot odds, mais 'toleravel' e o RIO, mas ate certo ponto)
    adjusted_risk = rio_factor / max(0.1, pot_odds)
    
    decision = "CALL" if adjusted_risk < 0.25 else "FOLD"
    
    return {
        "rio_risk_score": round(adjusted_risk, 3),
        "rio_factor": round(rio_factor, 3),
        "decision": decision,
        "rationale": f"Risco RIO de {adjusted_risk:.3f} detectado devido ao Passivo Estrutural."
    }

def get_bb_vs_utg_rio_table() -> List[Dict[str, any]]:
    """
    Gera a tabela de perigos de RIO para BB vs UTG.
    Baseado nos axiomas VITOI de Passivo Estrutural.
    """
    scenarios = [
        {"hand": "KJo", "strength": 0.45, "odds": 4.0, "passivity": 0.8}, # Alta passividade (UTG range forte)
        {"hand": "ATo", "strength": 0.52, "odds": 4.0, "passivity": 0.7},
        {"hand": "76s", "strength": 0.38, "odds": 4.0, "passivity": 0.4},  # Baixa passividade (Hand limpa/conectada)
    ]
    
    results = []
    for s in scenarios:
        risk = calculate_rio_risk(s["odds"], s["strength"], s["passivity"])
        results.append({**s, **risk})
        
    return results
