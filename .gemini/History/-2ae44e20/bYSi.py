import json
import sys
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class ScenarioData:
    name: str
    oop_rp: float
    ip_rp: float
    hrc_defense: float
    hrc_bluff: float
    hrc_req_eq: float

class ParadigmVitoiValidator:
    """
    Motor Hibrido de Validacao de Coeficientes (Caminho C).
    Compara a regressao estrita linear do NashSolver vs. Baseline Real (HRC).
    """
    def __init__(self) -> None:
        # GABARITOS HRC (A serem preenchidos com exatidao por Raphael Vitoi)
        # Valores atuais sao placeholders para teste da pipeline de validacao.
        self.hrc_scenarios: List[ScenarioData] = [
            ScenarioData("Bolha FT (Alta Pressao)", 12.5, 8.0, 32.5, 43.3, 42.0),
            ScenarioData("Early Game (Baixa Pressao)", 2.0, 1.5, 47.5, 33.0, 34.7),
            ScenarioData("Multiway 3-handed (RIO Maximo)", 15.0, 10.0, 29.0, 32.3, 43.8)
        ]

    def calc_linear_approximation(self, oop_rp: float, ip_rp: float) -> Dict[str, float]:
        """Formulas extraidas de nashSolver.ts e HandSimulator.tsx"""
        defense = 50 - (oop_rp * 1.4) + (ip_rp * 0.2)
        bluff = 33.33 + (oop_rp * 0.8) - (ip_rp * 1.3)
        req_equity = 33.3 + (oop_rp * 0.7)
        return {"defense": round(defense, 2), "bluff": round(bluff, 2), "req_equity": round(req_equity, 2)}

    def execute_audit(self):
        print("=== [VALIDACAO SOTA] AUDITORIA DE COEFICIENTES (Caminho C) ===")
        print("Avaliando divergencia entre Paradigma Linear vs. HRC GTO...\n")

        for sc in self.hrc_scenarios:
            calc = self.calc_linear_approximation(sc.oop_rp, sc.ip_rp)

            delta_def = calc["defense"] - sc.hrc_defense
            delta_blf = calc["bluff"] - sc.hrc_bluff
            delta_req = calc["req_equity"] - sc.hrc_req_eq

            print(f"[*] Cenario: {sc.name}")
            print(f"    RP OOP: {sc.oop_rp}% | RP IP: {sc.ip_rp}%")
            print(f"    [Defense]  Linear: {calc['defense']:>5}% | HRC: {sc.hrc_defense:>5}% | Delta: {delta_def:>+6.2f}%")
            print(f"    [Bluff]    Linear: {calc['bluff']:>5}% | HRC: {sc.hrc_bluff:>5}% | Delta: {delta_blf:>+6.2f}%")
            print(f"    [Req Eq]   Linear: {calc['req_equity']:>5}% | HRC: {sc.hrc_req_eq:>5}% | Delta: {delta_req:>+6.2f}%")

            # Avaliacao Bayesiana/Sistemica de Falha:
            if abs(delta_def) > 2.0 or abs(delta_req) > 2.0:
                print("    [!] ALERTA DE DIVERGENCIA SEVERA: A progressao linear falha neste limite de entropia.")
                print("    [!] A curva verdadeira exige decaimento logaritmico ou penalizacao polinomial (RIO x^2).")
            else:
                print("    [OK] Regressao linear suporta o cenario.")
            print("-" * 60)

        print("\n[DIRETRIZ] Insira os valores exatos de 'hrc_defense', 'hrc_bluff' e 'hrc_req_eq'")
        print("diretamente na lista 'hrc_scenarios' deste script para validacao matematica rigorosa.")

if __name__ == "__main__":
    validator = ParadigmVitoiValidator()
    validator.execute_audit()
