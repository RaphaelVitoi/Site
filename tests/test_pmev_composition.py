"""Composicao uma camada por vez (item 6): reducao, ablacao, incerteza e estados terminais."""

from __future__ import annotations

import numpy as np
import pytest

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_aula12_evidence import CANONICAL_PAYOUTS
from engine.pmev_composition import (
    Layer,
    all_in_branch_values,
    compose_one_at_a_time,
    global_radius_depends_on_stack_unit,
    terminal_payout_if_eliminated_now,
)
from engine.pmev_operators import OperatorF2Temporal, OperatorF3Behavioral, OperatorF4Absorption
from engine.pmev_pipeline import PMevCompositionalPipeline
from engine.pmev_spec import AbsorptionState, TournamentState

# Table Draw da Aula 1.2 com o BU no indice 0 e o BB no indice 1.
MESA = TournamentState((39.88, 53.88, 9.25, 52.24, 22.08, 6.88, 44.16, 24.16, 12.73), CANONICAL_PAYOUTS)
N = len(MESA.stacks)


def _neutras():
    return [
        (Layer.F2, OperatorF2Temporal(15.0, 0.0)),
        (Layer.F3, OperatorF3Behavioral(risk_aversion_factor=1.0, dirichlet_alpha=0.0)),
        (Layer.F4, OperatorF4Absorption((0.0,) * N, (AbsorptionState(N, 0.0),) * N)),
    ]


def _default():
    return [(Layer.F2, OperatorF2Temporal(15.0, 2.5)), (Layer.F3, OperatorF3Behavioral())]


def test_cada_camada_neutra_e_a_identidade_e_nao_mexe_na_incerteza():
    relatorio = compose_one_at_a_time(MESA, _neutras())
    for passo in relatorio.steps:
        assert np.max(np.abs(passo.delta)) < 1e-9, passo.layer
        assert abs(passo.redistribution_radius - 1.0) < 1e-3, passo.layer
        assert np.allclose(passo.standard_errors, relatorio.icm_standard_errors, rtol=1e-3), passo.layer


def test_composicao_incremental_bate_com_o_pipeline_sem_ruina():
    relatorio = compose_one_at_a_time(MESA, _default())
    pipeline = PMevCompositionalPipeline().evaluate(MESA, p_ruin_vector=(0.0,) * N).value
    assert np.allclose(relatorio.final, pipeline.decision_vector, atol=1e-9)


def test_ablacao_fecha_por_construcao_e_expoe_a_interacao():
    relatorio = compose_one_at_a_time(MESA, _default())
    total = np.array(relatorio.final) - np.array(relatorio.icm)
    soma_isoladas = np.sum([np.array(v) for v in relatorio.ablation.only_layer.values()], axis=0)
    assert np.allclose(total, soma_isoladas + np.array(relatorio.ablation.interaction), atol=1e-9)
    assert np.allclose(relatorio.ablation.leave_one_out[Layer.F3], relatorio.steps[0].after, atol=1e-9)


def test_f2_e_f3_conservam_o_prize_pool():
    for passo in compose_one_at_a_time(MESA, _default()).steps:
        assert passo.conserves_prize_pool, passo.layer


def test_raio_de_redistribuicao_do_default_contrai_e_nao_depende_da_unidade():
    """Medido: 0,45 no default da mesa. O mesmo estado em fichas x100 da o mesmo raio."""
    em_bb = compose_one_at_a_time(MESA, _default())
    em_fichas = compose_one_at_a_time(TournamentState(tuple(s * 100 for s in MESA.stacks), MESA.payouts), _default())
    raio = em_bb.steps[-1].redistribution_radius
    assert 0.3 < raio < 0.6
    assert raio == pytest.approx(em_fichas.steps[-1].redistribution_radius, rel=1e-4)
    assert not em_bb.steps[-1].expands_redistribution


def test_raio_de_j1_muda_com_a_unidade_e_por_isso_fica_fora_do_criterio():
    em_bb, em_fichas = global_radius_depends_on_stack_unit(MESA, 100.0)
    assert em_bb / em_fichas == pytest.approx(100.0, rel=1e-3)


def test_incerteza_propagada_pela_derivada_real_bate_com_monte_carlo():
    """E o Jacobiano regularizado de f3 subestima; por isso ele nao entra na propagacao."""
    x = np.array(calculate_malmuth_harville_icm(list(MESA.stacks), list(MESA.payouts)))
    f3 = OperatorF3Behavioral()
    sigma = np.diag((x * 0.02) ** 2)
    rng = np.random.default_rng(20260913)
    amostras = np.array([f3.forward(x + rng.multivariate_normal(np.zeros(N), sigma)) for _ in range(6000)])
    se_mc = float(np.std(amostras[:, 0], ddof=1))
    j_real, j_reg = f3.raw_jacobian(x), f3.jacobian(x)
    se_real = float(np.sqrt((j_real @ sigma @ j_real.T)[0, 0]))
    se_reg = float(np.sqrt((j_reg @ sigma @ j_reg.T)[0, 0]))
    assert se_real == pytest.approx(se_mc, rel=0.03)
    assert se_reg < se_real * 0.98


def test_premio_terminal_e_o_do_lugar_de_quem_quebra_agora():
    assert terminal_payout_if_eliminated_now(MESA) == CANONICAL_PAYOUTS[-1]
    menos_premios = TournamentState((10.0, 20.0, 30.0), (60.0, 40.0))
    assert terminal_payout_if_eliminated_now(menos_premios) == 0.0


def test_ramos_materializados_batem_com_f4_condicional_e_nao_com_o_incondicional():
    p_ganha = 0.55
    exato = all_in_branch_values(MESA, hero=0, villain=1, p_hero_wins=p_ganha)
    ganha = list(MESA.stacks)
    ganha[0] += 39.88
    ganha[1] -= 39.88
    f4 = OperatorF4Absorption(
        (1 - p_ganha,) + (0.0,) * (N - 1),
        (AbsorptionState(N, terminal_payout_if_eliminated_now(MESA)),) * N,
    )
    condicional = f4.forward(np.array(calculate_malmuth_harville_icm(ganha, list(MESA.payouts))))
    incondicional = f4.forward(np.array(calculate_malmuth_harville_icm(list(MESA.stacks), list(MESA.payouts))))
    assert exato[0] == pytest.approx(condicional[0], abs=1e-9)
    assert abs(exato[0] - incondicional[0]) > 10.0, "a dupla contagem medida era de ~20 T$"
    assert sum(exato) == pytest.approx(sum(MESA.payouts), abs=1e-9)


def test_composicao_recusa_ruina_sobre_equidade_incondicional():
    ruina = (Layer.F4, OperatorF4Absorption((0.3,) + (0.0,) * (N - 1), (AbsorptionState(N, 36.47),) * N))
    with pytest.raises(ValueError, match="CONDICIONAL"):
        compose_one_at_a_time(MESA, [ruina])


def test_pipeline_recusa_ruina_positiva_e_nao_premia_quem_quebra():
    """Antes: com p_ruin 0,3 o heroi subia de 127,01 para 160,11 T$ (payout terminal por indice)."""
    with pytest.raises(ValueError, match="CONDICIONAL"):
        PMevCompositionalPipeline().evaluate(MESA, p_ruin_vector=(0.3,) + (0.0,) * (N - 1))


def test_proveniencia_da_cadeia_nao_declara_solver_que_nao_rodou():
    medido = PMevCompositionalPipeline().evaluate(MESA)
    assert medido.provenance is not None
    assert medido.provenance.nash_distance_epsilon is None
    assert medido.provenance.iterations is None


@pytest.mark.parametrize(
    "erro",
    [{"hero": 0, "villain": 0, "p_hero_wins": 0.5}, {"hero": 0, "villain": 1, "p_hero_wins": 1.2}],
)
def test_ramos_recusam_entrada_impossivel(erro):
    with pytest.raises(ValueError):
        all_in_branch_values(MESA, **erro)
