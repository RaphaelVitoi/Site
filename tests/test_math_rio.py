"""
Testes unitarios para calculos de Reverse Implied Odds (RIO).
Cobre decisoes CALL/FOLD, posicoes IP/OOP, e cenarios multiway.
# ruff: noqa: I001
"""

import pytest

from engine.math_rio import calculate_rio_risk, get_bb_vs_utg_rio_table

# ==============================================================================
# calculate_rio_risk — cenarios canonicos
# ==============================================================================


@pytest.mark.unit
def test_rio_risk_call_decision_heads_up() -> None:
    """Valida o calculo basico de risco RIO para decisao CALL em HU (OOP)."""
    # Hero investiu 4bb, pot=8bb, stack=30bb, HU => rio_risk_score ~0.341 => CALL
    risk = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.341, abs=1e-3)


@pytest.mark.unit
def test_rio_risk_high_passivity_near_insolvency() -> None:
    """Valida risco RIO em cenario de alta passividade perto do teto de insolvencia."""
    # ATo com 15bb vs aposta de 5bb em pote de 10bb => ~0.563 => CALL (limiar)
    risk = calculate_rio_risk(1.5, 10.0, 15.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.563, abs=1e-3)


@pytest.mark.unit
def test_rio_risk_ip_position_lower_than_oop() -> None:
    """A posicao IP deve resultar em risk_score menor que OOP (drift reduzido)."""
    risk_oop = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=2)
    risk_ip = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BTN", active_players=2)
    assert float(risk_ip["rio_risk_score"]) < float(risk_oop["rio_risk_score"]), (
        "Posicao IP deve ter downward_drift menor => risk_score reduzido vs OOP"
    )


@pytest.mark.unit
def test_rio_risk_multiway_increases_score() -> None:
    """Cenario multiway (6 players) deve elevar o risk_score vs HU."""
    hu = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=2)
    multiway = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=6)
    assert float(multiway["rio_risk_score"]) >= float(hu["rio_risk_score"]), (
        "Mais oponentes aumentam o risco de RIO (rio_mw)"
    )


@pytest.mark.unit
def test_rio_risk_high_investment_triggers_fold() -> None:
    """Hero sobre-investido com stack curto deve acionar decisao FOLD."""
    # Investimento desproporcional: 20bb em pote de 10bb com stack de 25bb
    risk = calculate_rio_risk(20.0, 10.0, 25.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "FOLD", f"Sobre-investimento excessivo deve resultar em FOLD, obteve: {risk['decision']}"


@pytest.mark.unit
def test_rio_risk_score_is_non_negative() -> None:
    """O rio_risk_score deve ser sempre nao-negativo independente dos inputs."""
    risk = calculate_rio_risk(0.5, 1.0, 100.0, hero_position="BTN", active_players=2)
    assert float(risk["rio_risk_score"]) >= 0.0


# ==============================================================================
# get_bb_vs_utg_rio_table
# ==============================================================================


@pytest.mark.unit
def test_table_generation_structure() -> None:
    """Valida que a tabela RIO e gerada com 3 entradas e campos corretos."""
    table = get_bb_vs_utg_rio_table()
    assert len(table) == 3
    assert table[0]["hand"] == "KJo"


@pytest.mark.unit
def test_table_entries_have_required_keys() -> None:
    """Garante que cada entrada da tabela RIO possui os campos de metadados."""
    table = get_bb_vs_utg_rio_table()
    required_keys = {"hand"}
    for entry in table:
        assert required_keys.issubset(entry.keys()), f"Entrada ausente campos obrigatorios: {entry}"
