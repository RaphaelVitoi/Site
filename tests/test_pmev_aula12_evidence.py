"""Os sete pares da Aula 1.2 no contrato Python (P0 item 4): validos, e zero reproduziveis."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from engine.pmev_aula12_evidence import DATA_PATH, RAIZ, load_aula12_pairs
from engine.pmev_scenario import Read, Unreadable, count_reproducible_pairs

ORDEM_DO_DOCUMENTO = (
    "PAR_1_BB_LEADING",
    "PAR_2_IP_APOS_CHECK",
    "PAR_7_BB_VS_CBET_SMALL",
    "PAR_5_IP_VS_XR_FLOP",
    "PAR_6_BB_TURN_APOS_CALL",
    "PAR_3_IP_VS_CBET_TURN",
    "PAR_4_OOP_RIVER",
)


def test_os_sete_pares_carregam_na_ordem_do_documento():
    assert tuple(p.key for p in load_aula12_pairs()) == ORDEM_DO_DOCUMENTO


def test_zero_de_sete_reproduziveis_como_no_typescript():
    """Espelha countReproduciblePairs(AULA_1_2_PAIRS) = 0. E portao, nao teste a consertar."""
    pares = load_aula12_pairs()
    assert count_reproducible_pairs([p.contract for p in pares]) == 0


def test_todas_as_somas_de_frequencia_fecham_na_tolerancia_declarada():
    for par in load_aula12_pairs():
        for lado in (par.chip_ev, par.icm_ev):
            assert lado.frequency_sum_closes, (par.key, lado.solver, lado.frequency_sum_pct)


def test_combos_do_hrc_ficam_ilegiveis_e_nunca_viram_zero():
    for par in load_aula12_pairs():
        assert isinstance(par.icm_ev.total_combos, Unreadable), par.key
        assert all(isinstance(a.combos, Unreadable) for a in par.icm_ev.actions), par.key


def test_ambiguidade_de_nodelock_e_declarada_so_nos_pares_5_6_7():
    ambiguos = {p.key for p in load_aula12_pairs() if p.nodelock_ambiguous}
    assert ambiguos == {"PAR_5_IP_VS_XR_FLOP", "PAR_6_BB_TURN_APOS_CALL", "PAR_7_BB_VS_CBET_SMALL"}
    for par in load_aula12_pairs():
        politica = par.contract.chip_ev.agent_policy
        assert isinstance(politica, Unreadable)
        assert ("ambigua" in politica.reason) is par.nodelock_ambiguous


def test_cadeia_flop_turn_river_fecha_com_os_valores_carregados():
    """Mesma identidade de CADEIA_FLOP_TURN_RIVER no TS: um erro de digito quebraria ao menos uma."""
    pote = {p.key: p.pot_bb.value for p in load_aula12_pairs()}  # type: ignore[union-attr]
    assert pote["PAR_5_IP_VS_XR_FLOP"] + 3.9 == pytest.approx(pote["PAR_6_BB_TURN_APOS_CALL"])
    assert pote["PAR_6_BB_TURN_APOS_CALL"] + 7.8 == pytest.approx(pote["PAR_3_IP_VS_CBET_TURN"])
    assert pote["PAR_3_IP_VS_CBET_TURN"] + 7.8 == pytest.approx(pote["PAR_4_OOP_RIVER"])


FIXTURE_TS = RAIZ / "frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts"


def test_numeros_lidos_sao_os_do_fixture_typescript_em_todos_os_pares():
    """Guarda do lado Python: o pre-push so roda pytest, e o teste Jest do espelho so roda no CI."""
    fonte = FIXTURE_TS.read_text(encoding="utf-8")
    for par in load_aula12_pairs():
        inicio = fonte.index(f"export const {par.key}:")
        proximo = fonte.find("export const", inicio + 1)
        bloco = fonte[inicio : proximo if proximo > 0 else len(fonte)]
        freqs_ts = [float(v) for v in re.findall(r"frequencyPct: read\(\s*([\d.]+)\s*\)", bloco)]
        sizings_ts = [float(v) for v in re.findall(r"sizingBb: read\(\s*([\d.]+)\s*\)", bloco)]
        freqs_py, sizings_py = [], []
        for lado in (par.chip_ev, par.icm_ev):
            freqs_py += [a.frequency_pct.value for a in lado.actions if isinstance(a.frequency_pct, Read)]
            sizings_py += [a.sizing_bb.value for a in lado.actions if isinstance(a.sizing_bb, Read)]
        assert freqs_py == freqs_ts, par.key
        assert sizings_py == sizings_ts, par.key


def _espelho_alterado(tmp_path: Path, mutar) -> Path:
    dados = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    mutar(dados)
    destino = tmp_path / "pares.json"
    destino.write_text(json.dumps(dados, ensure_ascii=False), encoding="utf-8")
    return destino


@pytest.mark.parametrize(
    ("mutar", "trecho"),
    [
        (lambda d: d.update(documentSha256="0" * 64), "SHA-256"),
        (lambda d: d["pares"].pop(), "7 pares"),
        (
            lambda d: d["pares"][0]["par"]["chipEv"]["actions"][0].update(frequencyPct={"kind": "read", "value": 101}),
            "fora",
        ),
        (lambda d: d["pares"][0]["par"]["chipEv"].update(regime="icmEV"), "regime"),
        (lambda d: d["pares"][1].update(chave="PAR_1_BB_LEADING"), "repetidas"),
        (lambda d: d["pares"][0]["par"]["context"].update(potBb=0), "kind"),
    ],
)
def test_espelho_invalido_falha_fechado(tmp_path, mutar, trecho):
    with pytest.raises(ValueError, match=trecho):
        load_aula12_pairs(_espelho_alterado(tmp_path, mutar))
