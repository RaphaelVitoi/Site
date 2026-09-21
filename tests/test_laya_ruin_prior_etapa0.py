"""Etapa 0 (laya S1) — testes de convergência da prior de ruína (Teorema 2).

Cobrem:
(a) bridge.ruin_priority_from_intencao — sinal System-1 (nao_latin_fraction_pct) -> prior.
(b) engine.calculate_negative_risk_premium_river — ruin_prior modula relative_survival_ratio
    (Teorema 2, BF<1); 1.0 = off (backward-compat); >1 conservador (aniquila variância, SOTA GOLD).
(c) consumidor handler — intencao_s1 -> ruin_priority -> premium de ruína no tree_result.
(d) backward-compat — default ruin_prior=1.0 equivale a omitir o argumento.

S1 não decide os 10 teoremas (invariante CLAUDE.md §§3, 6.6): apenas modula o prior de
sobrevivência. A paridade frontend (rpDeriver.ts) -> Phase 3 (opção B).
"""

from __future__ import annotations

import pytest

from engine.vitoi_perspective_engine import VitoiPerspectiveEngine
from llm.laya_bridge import ruin_priority_from_intencao


# --------------------------------------------------------------------------- (a)
def test_ruin_priority_from_intencao_mapping():
    """Paridade laya S1 -> ruin_priority (mesma regra do rpDeriver.ts)."""
    assert ruin_priority_from_intencao(None) == 1.0
    assert ruin_priority_from_intencao({}) == 1.0
    latim = {"idioma": "portugues", "script": "latin", "nao_latin_fraction_pct": 0.0}
    assert ruin_priority_from_intencao(latim) == 1.0
    misto = {"script": "latin", "nao_latin_fraction_pct": 50.0}
    assert ruin_priority_from_intencao(misto) == pytest.approx(1.15)
    nao_latim = {"script": "devanagari", "nao_latin_fraction_pct": 100.0}
    assert ruin_priority_from_intencao(nao_latim) == 1.30
    # clamping: 130% não ultrapassa o teto de modulação conservador (30%).
    exagerado = {"script": "han", "nao_latin_fraction_pct": 100.0}
    assert ruin_priority_from_intencao(exagerado) == 1.30


# --------------------------------------------------------------------------- (b)
def test_ruin_prior_modula_barreira_ruina():
    """ruin_prior multiplica relative_survival_ratio (Teorema 2); >1 = conservador."""
    kwargs = {
        "pot_size": 36,
        "bet_size": 4,
        "residual_stack_bb": 4,
        "fold_survival_prob": 0.025,
        "call_win_survival_prob": 0.380,
    }
    base = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(**kwargs)
    conservador = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
        **kwargs,
        ruin_prior=1.30,
    )
    # Convergência: pmev_required_equity escala linearmente pelo ruin_prior.
    assert conservador["pmev_required_equity"] == pytest.approx(
        1.30 * base["pmev_required_equity"],
        rel=1e-9,
    )
    # Conservador (ruin_prior>1) exige MAIS equidade -> menos variância (anihila).
    assert conservador["pmev_required_equity"] > base["pmev_required_equity"]
    # Teorema 2 preservado: is_negative_rp continua bem-definido (0/1).
    assert base["is_negative_rp"] in (0, 1)
    assert conservador["is_negative_rp"] in (0, 1)


# --------------------------------------------------------------------------- (d)
def test_ruin_prior_default_eh_1_backward_compat():
    """Omissão de ruin_prior ≡ ruin_prior=1.0 (não altera os 26 testes PMev existentes)."""
    kwargs = {
        "pot_size": 36,
        "bet_size": 4,
        "residual_stack_bb": 4,
        "fold_survival_prob": 0.025,
        "call_win_survival_prob": 0.380,
    }
    explicito = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
        **kwargs,
        ruin_prior=1.0,
    )
    default = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(**kwargs)
    assert explicito == default


# --------------------------------------------------------------------------- (c)
def test_consumidor_tree_result_ruin_prior():
    """Replica o fluxo do handler: req.intencao_s1 -> bridge -> ruin_prior -> premio."""
    # Input incerto (não-latim, devanagari) -> bridge fornece prior conservador.
    intencao_s1 = {"script": "devanagari", "nao_latin_fraction_pct": 100.0}
    ruin_prior_s1 = ruin_priority_from_intencao(intencao_s1)
    assert ruin_prior_s1 == 1.30

    on = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
        pot_size=36,
        bet_size=4,
        residual_stack_bb=4,
        fold_survival_prob=0.05,
        call_win_survival_prob=0.40,
        ruin_prior=ruin_prior_s1,
    )
    # Latin (off) -> prior 1.0 -> baseline.
    assert ruin_priority_from_intencao(None) == 1.0
    off = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
        pot_size=36,
        bet_size=4,
        residual_stack_bb=4,
        fold_survival_prob=0.05,
        call_win_survival_prob=0.40,
        ruin_prior=1.0,
    )
    assert on["pmev_required_equity"] > off["pmev_required_equity"]
