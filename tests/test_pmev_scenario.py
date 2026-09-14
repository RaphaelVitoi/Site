"""Contrato de cenario PMev (P0.3): nao lido nunca vira zero, e valido nunca vira reproduzivel."""

from __future__ import annotations

import pytest

from engine.pmev_scenario import (
    ENashUnit,
    EvidencePairContract,
    Read,
    Regime,
    ScenarioContract,
    Seat,
    SolverProvenance,
    StackUnit,
    Unreadable,
    count_reproducible_pairs,
)

SHA = "a" * 64


def _proveniencia(completa: bool) -> SolverProvenance:
    if completa:
        return SolverProvenance(solver="HRC", build=Read("4.1.0"), e_nash=Read(0.3), e_nash_unit=Read(ENashUnit.PCT))
    return SolverProvenance(solver="HRC", build=Unreadable("fora do recorte"), e_nash=Unreadable("fora do recorte"))


def _cenario(regime: Regime, completa: bool = False, **extra: object) -> ScenarioContract:
    base: dict[str, object] = {
        "regime": regime,
        "stack_unit": StackUnit.BIG_BLINDS,
        "seats": (Seat("BTN", Read(40.0)), Seat("BB", Read(40.0))),
        "ranges": Read("simetricas"),
        "provenance": _proveniencia(completa),
        "horizon": Read("fim da mao"),
        "agent_policy": Read("equilibrio"),
    }
    if regime is Regime.ICM_EV:
        base["payouts"] = Read((60.0, 40.0))
    base.update(extra)
    return ScenarioContract(**base)  # type: ignore[arg-type]


def _par(chip_completa: bool, icm_completa: bool) -> EvidencePairContract:
    return EvidencePairContract(
        document_sha256=SHA,
        figure_index=0,
        node_label="no",
        chip_ev=_cenario(Regime.CHIP_EV, chip_completa),
        icm_ev=_cenario(Regime.ICM_EV, icm_completa),
    )


def test_unreadable_sem_motivo_e_recusado():
    with pytest.raises(ValueError, match="motivo"):
        Unreadable("   ")


def test_campos_faltando_usam_os_nomes_do_contrato_typescript():
    assert _proveniencia(False).missing_fields() == ["build", "eNash"]
    sem_unidade = SolverProvenance(solver="HRC", build=Read("4.1"), e_nash=Read(0.3))
    assert sem_unidade.missing_fields() == ["eNashUnit"]
    assert _proveniencia(True).missing_fields() == []


def test_par_so_e_reproduzivel_com_os_dois_lados_completos():
    assert _par(True, True).assess_reproducibility().reproducible is True
    parcial = _par(True, False).assess_reproducibility()
    assert parcial.reproducible is False
    assert parcial.missing_chip_ev == [] and parcial.missing_icm_ev == ["build", "eNash"]
    assert count_reproducible_pairs([_par(False, False), _par(True, True), _par(True, False)]) == 1


def test_sem_bloco_de_procedencia_falta_provenance_como_no_typescript():
    assert _cenario(Regime.CHIP_EV, provenance=None).missing_provenance == ["provenance"]


def test_chipev_nao_aceita_payouts_e_icmev_os_exige():
    with pytest.raises(ValueError, match="ChipEV nao usa payouts"):
        _cenario(Regime.CHIP_EV, payouts=Read((1.0,)))
    with pytest.raises(ValueError, match="ICMev exige payouts"):
        _cenario(Regime.ICM_EV, payouts=None)
    assert _cenario(Regime.ICM_EV, payouts=Unreadable("lobby nao capturado")).payouts is not None


@pytest.mark.parametrize(
    "extra",
    [
        {"seats": ()},
        {"seats": (Seat("BB", Read(1.0)), Seat("BB", Read(2.0)))},
        {"payouts": Read((float("nan"),))},
        {"payouts": Read((-1.0, 2.0))},
    ],
)
def test_estado_impossivel_falha_fechado(extra):
    with pytest.raises(ValueError):
        _cenario(Regime.ICM_EV, **extra)


@pytest.mark.parametrize("valor", [float("inf"), -0.1])
def test_enash_lido_impossivel_falha_fechado(valor):
    with pytest.raises(ValueError, match="e-Nash"):
        SolverProvenance(solver="HRC", build=Read("x"), e_nash=Read(valor))


def test_par_exige_regimes_nos_lados_certos_e_sha_valido():
    chip, icm = _cenario(Regime.CHIP_EV), _cenario(Regime.ICM_EV)
    with pytest.raises(ValueError, match="regimes|ChipEV e icm_ev"):
        EvidencePairContract(document_sha256=SHA, figure_index=0, node_label="n", chip_ev=icm, icm_ev=chip)
    with pytest.raises(ValueError, match="sha256"):
        EvidencePairContract(document_sha256="ABC", figure_index=0, node_label="n", chip_ev=chip, icm_ev=icm)
