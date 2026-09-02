"""Documento declarado no manifesto tem de existir, ou nao entra no prompt.

`agents/prompts.py` monta o system prompt dos 19 agentes a partir de
`docs/document_manifest.json`. A leitura e deliberadamente tolerante: caminho
que nao resolve e ignorado com `continue`, sem excecao e sem log. Isso protege
contra um documento faltando derrubar a pipeline inteira -- e e a mesma
tolerancia que faz a falha ser invisivel.

Medido em 2026-09-01, depois da fusao `.cerebro` -> `.claude`: **14 dos 21
documentos declarados apontavam para `.cerebro/`**, que deixou de existir.
103.204 bytes de governanca -- constituicao tecnica, cosmovisao, matriz de
lideranca, manifesto de coerencia, protocolo de roteamento -- silenciosamente
fora do prompt. O `@auditor` era instanciado sem saber que existiam.

Nenhum teste pegou porque nenhum media o manifesto: mediam o codigo que le, e o
codigo estava certo. O dado e que tinha apodrecido.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "docs" / "document_manifest.json"


def _documentos() -> list[dict]:
    return json.loads(MANIFESTO.read_text(encoding="utf-8")).get("documents", [])


@pytest.mark.unit
def test_manifesto_existe_e_nao_esta_vazio() -> None:
    """Manifesto ausente devolve {} e ZERA os documentos, sem ninguem reclamar."""
    assert MANIFESTO.is_file(), f"manifesto ausente: {MANIFESTO}"
    docs = _documentos()
    assert docs, "manifesto sem documentos -- o system prompt perde toda a camada C-Level"


@pytest.mark.unit
def test_todo_documento_declarado_resolve() -> None:
    """O caso real: caminho que aponta para arvore extinta e lido como vazio."""
    mortos = []
    for doc in _documentos():
        caminho = doc.get("path")
        if not caminho:
            mortos.append((doc.get("name"), "<sem campo path>"))
            continue
        if not (RAIZ / caminho).is_file():
            mortos.append((doc.get("name"), caminho))

    assert not mortos, (
        f"{len(mortos)} documento(s) declarado(s) no manifesto nao resolvem e serao "
        f"silenciosamente omitidos do system prompt dos agentes: {mortos}. "
        "Corrija o caminho no manifesto ou remova a declaracao -- leitura tolerante "
        "transforma caminho podre em ausencia invisivel."
    )


@pytest.mark.unit
def test_documento_filosofico_declarado_existe_entre_os_documentos() -> None:
    """`philosophical_docs` filtra por NOME; nome que nao casa nao filtra nada."""
    dados = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    nomes = {d.get("name") for d in dados.get("documents", [])}
    orfaos = [n for n in dados.get("philosophical_docs", []) if n not in nomes]
    assert not orfaos, (
        f"philosophical_docs cita nome(s) que nao existem em documents: {orfaos}. "
        "A otimizacao de tokens para agente tecnico nao excluiria nada, e o desvio "
        "seria silencioso -- campo sem consumidor apodrece, e nao avisa."
    )
