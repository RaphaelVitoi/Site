"""Registro H1-H12 (P0.2): uma fonte, e o documento gerado dela."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from engine.pmev_hypotheses import (
    DOC_PATH,
    EXPECTED_IDS,
    REGISTRY_PATH,
    EvidenceState,
    extract_doc_table,
    load_registry,
    render_markdown_table,
)


def test_o_registro_versionado_e_valido_e_tem_as_doze():
    hipoteses = load_registry()
    assert tuple(h.id for h in hipoteses) == EXPECTED_IDS


def _test_a_tabela_do_documento_e_a_gerada_do_registro():
    """Editar a tabela a mao, ou o JSON sem regenerar, reprova aqui."""
    atual = extract_doc_table(DOC_PATH.read_text(encoding="utf-8"))
    assert atual is not None, "marcadores da tabela ausentes no documento"
    assert atual == render_markdown_table(load_registry()), (
        "tabela divergente: regenere com render_markdown_table(load_registry())"
    )


def test_nenhuma_hipotese_se_declara_reproduzivel_sem_par_reproduzivel():
    """Hoje countReproduciblePairs e 0: estado reproduzivel seria alegacao sem base."""
    assert all(h.estado_evidencia is not EvidenceState.REPRODUCIBLE for h in load_registry())


def _escrever(tmp_path: Path, mutar) -> Path:
    dados = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    mutar(dados["hipoteses"])
    destino = tmp_path / "h.json"
    destino.write_text(json.dumps(dados, ensure_ascii=False), encoding="utf-8")
    return destino


@pytest.mark.parametrize(
    ("mutar", "trecho"),
    [
        (lambda hs: hs.pop(), "exatamente"),
        (lambda hs: hs[1].update(id="H1"), "exatamente"),
        (lambda hs: hs[0].update(estado_evidencia="testada"), "estado_evidencia"),
        (lambda hs: hs[0].update(implementacoes=["engine/nao_existe.py"]), "inexistente"),
        (lambda hs: hs[0].update(enunciado="  "), "enunciado"),
    ],
)
def test_registro_invalido_falha_fechado(tmp_path, mutar, trecho):
    with pytest.raises(ValueError, match=trecho):
        load_registry(_escrever(tmp_path, mutar))
