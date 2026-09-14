"""Baselines e reducao PMev-0 = ICMev (item 5), medidas com a cadeia inteira ligada."""

from __future__ import annotations

import json

import numpy as np
import pytest

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.math_sota import compute_quantum_metrics
from engine.pmev_aula12_evidence import CANONICAL_PAYOUTS
from engine.pmev_baselines import (
    ADDITIVE_BASELINE_VERSION,
    ADDITIVE_SNAPSHOT_PATH,
    BASELINES,
    BaselineState,
    chip_ev_dollars,
    evaluate_neutral_chain,
    resolve_implementation,
)
from engine.pmev_operators import OperatorF3Behavioral
from engine.pmev_spec import TournamentState

CASOS = [
    ((5000.0, 3000.0, 2000.0), (100.0, 60.0, 40.0)),
    ((40.0, 30.0, 20.0, 10.0), (50.0, 30.0, 20.0)),
    # Table Draw da Aula 1.2 no instante do open, com os payouts do ledger.
    ((9.25, 52.24, 22.08, 6.88, 44.16, 24.16, 39.88, 12.73, 53.88), CANONICAL_PAYOUTS),
]


@pytest.mark.parametrize(("stacks", "payouts"), CASOS)
def test_cadeia_completa_com_parametros_neutros_reduz_ao_icm(stacks, payouts):
    """A identidade de verdade: f1..f5 ligados, nao desligados por ablacao."""
    icm = calculate_malmuth_harville_icm(list(stacks), list(payouts))
    cadeia = evaluate_neutral_chain(TournamentState(stacks, payouts))
    assert np.max(np.abs(np.array(cadeia) - np.array(icm))) < 1e-9


@pytest.mark.parametrize(("stacks", "payouts"), CASOS)
def test_f3_no_default_nao_e_neutro_e_isso_fica_medido(stacks, payouts):
    """Medido em 2026-09-13: o prior Dirichlet 1,0 desloca de 5 a 22 T$. O default nao e PMev-0."""
    icm = np.array(calculate_malmuth_harville_icm(list(stacks), list(payouts)))
    desvio = np.max(np.abs(OperatorF3Behavioral(risk_aversion_factor=1.0).forward(icm) - icm))
    assert desvio > 1.0


def test_dirichlet_negativo_e_recusado():
    with pytest.raises(ValueError, match="dirichlet_alpha"):
        OperatorF3Behavioral(dirichlet_alpha=-0.1)


def test_icm_com_premio_unico_coincide_com_chipev():
    """Duas implementacoes independentes, um caso em que a teoria as iguala: winner-take-all."""
    stacks = [52.24, 9.25, 22.08, 6.88, 44.16]
    assert np.allclose(calculate_malmuth_harville_icm(stacks, [100.0]), chip_ev_dollars(stacks, [100.0]), atol=1e-9)


def test_chipev_e_icm_divergem_com_premiacao_escalonada():
    stacks, payouts = [60.0, 30.0, 10.0], [50.0, 30.0, 20.0]
    assert not np.allclose(calculate_malmuth_harville_icm(stacks, payouts), chip_ev_dollars(stacks, payouts))
    assert sum(chip_ev_dollars(stacks, payouts)) == pytest.approx(100.0)


@pytest.mark.parametrize("entrada", [([1.0, float("nan")], [1.0]), ([-1.0, 2.0], [1.0]), ([1.0], [float("inf")])])
def test_chipev_recusa_entrada_impossivel(entrada):
    with pytest.raises(ValueError):
        chip_ev_dollars(*entrada)


def test_fgs_fica_declarado_ausente_e_nao_resolve():
    fgs = next(b for b in BASELINES if b.id == "fgs")
    assert fgs.estado is BaselineState.NOT_IMPLEMENTED and fgs.implementacao is None
    with pytest.raises(LookupError):
        resolve_implementation(fgs)


def test_toda_implementacao_declarada_existe_e_e_chamavel():
    for baseline in BASELINES:
        if baseline.estado is BaselineState.IMPLEMENTED:
            assert callable(resolve_implementation(baseline)), baseline.id


def test_modelo_aditivo_bate_com_o_snapshot_da_versao_declarada():
    """Mudar a heuristica aditiva sem versionar reprova aqui. Se foi intencional, suba a versao e regenere."""
    snapshot = json.loads(ADDITIVE_SNAPSHOT_PATH.read_text(encoding="utf-8"))
    assert snapshot["versao"] == ADDITIVE_BASELINE_VERSION, "snapshot de outra versao do modelo aditivo"
    for caso in snapshot["casos"]:
        atual = compute_quantum_metrics(**caso["entrada"])
        for chave, esperado in caso["saida"].items():
            if esperado is None or isinstance(esperado, bool):
                assert atual[chave] == esperado, (caso["nome"], chave)
            else:
                assert atual[chave] == pytest.approx(esperado, rel=1e-12, abs=1e-12), (caso["nome"], chave)
