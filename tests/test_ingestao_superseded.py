"""Árvore que se declara superada não entra no índice.

Ao consolidar a memória agêntica em 2026-08-28, `.claude/AGENTS-MEMORY` ganhou um
`SUPERSEDED.md` apontando para a canônica. Medido depois: ela continuava
contribuindo **89 fragmentos (2,1% do índice)** — conteúdo que já está na
canônica, competindo com ela pelos mesmos três lugares de todo resultado.

O mecanismo **não é lista de caminhos**: é predicado estrutural. Um diretório que
contém `SUPERSEDED.md` marcou a si mesmo, e o marcador viaja junto com a árvore.
Lista literal envelhece e exige que alguém lembre de atualizá-la — foi assim que
`reports` como nome solto excluiu `docs/reports/` sem ninguém pedir, e é a mesma
armadilha.

## O defeito da primeira versão, que só a conferência pegou

Os diretórios superados vinham de `base_path.rglob(...)` sem `.resolve()`,
enquanto os alvos vêm de `source_path.resolve()`. Comparar caminho relativo com
absoluto é comparar grandezas diferentes: **a exclusão não excluiu nada**, e
nenhuma exceção foi levantada. Apareceu na contagem — 506 alvos com 23 que
deviam ter saído.
"""

from __future__ import annotations

import asyncio
import json
import warnings
from pathlib import Path

import pytest

warnings.filterwarnings("ignore")
RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def rag():
    from memory_rag import MemoryRAG  # noqa: PLC0415

    return MemoryRAG()


def _alvos(rag, base: Path) -> set[Path]:
    manifesto = json.loads((RAIZ / "rag_ingestion_manifest.json").read_text(encoding="utf-8"))
    return asyncio.run(rag._collect_target_files_async(manifesto, base))


def test_arvore_superada_do_repositorio_fica_fora(rag):
    """O caso real: `.claude/AGENTS-MEMORY`, superada na consolidação."""
    from memory_rag import MARCADOR_SUPERADO  # noqa: PLC0415

    marcadas = {m.parent.resolve() for m in RAIZ.rglob(MARCADOR_SUPERADO)}
    assert marcadas, "nenhuma arvore declarada superada -- este teste ficou sem alvo"

    alvos = _alvos(rag, RAIZ)
    dentro = [f for f in alvos if any(Path(f).resolve().is_relative_to(d) for d in marcadas)]
    assert not dentro, f"{len(dentro)} alvos vindos de arvore superada: {[str(x)[-50:] for x in dentro[:4]]}"


def test_o_marcador_e_o_que_exclui_e_nada_mais(rag, tmp_path):
    """Os DOIS estados, na mesma árvore sintética: sem marcador entra, com
    marcador sai. Sem isto, uma exclusão que não exclui nada passaria — foi
    exatamente o que aconteceu na primeira versão."""
    from memory_rag import MARCADOR_SUPERADO  # noqa: PLC0415

    viva = tmp_path / "viva"
    morta = tmp_path / "morta"
    for d in (viva, morta):
        d.mkdir()
        (d / "doc.md").write_text("# conteudo\n\nalgum texto de teste.\n", encoding="utf-8")
    (tmp_path / "rag_ingestion_manifest.json").write_text(
        json.dumps({"sources": [{"path": ".", "patterns": ["*.md"], "recursive": True}]}), encoding="utf-8"
    )
    manifesto = json.loads((tmp_path / "rag_ingestion_manifest.json").read_text(encoding="utf-8"))

    antes = asyncio.run(rag._collect_target_files_async(manifesto, tmp_path))
    assert any("morta" in str(f) for f in antes), "estado ANTES invalido: a arvore nem entrava"
    assert any("viva" in str(f) for f in antes)

    (morta / MARCADOR_SUPERADO).write_text("# Superseded\n", encoding="utf-8")

    depois = asyncio.run(rag._collect_target_files_async(manifesto, tmp_path))
    assert not any("morta" in str(f) for f in depois), "o marcador nao excluiu a arvore"
    assert any("viva" in str(f) for f in depois), "a exclusao alcancou a arvore viva -- excluiu demais"


def test_o_proprio_marcador_nao_e_indexado(rag, tmp_path):
    """`SUPERSEDED.md` é um `.md` dentro da árvore que ele exclui. Se entrasse,
    o índice ganharia um documento dizendo que aquele conteúdo não vale."""
    from memory_rag import MARCADOR_SUPERADO  # noqa: PLC0415

    d = tmp_path / "morta"
    d.mkdir()
    (d / "doc.md").write_text("# x\n", encoding="utf-8")
    (d / MARCADOR_SUPERADO).write_text("# Superseded\n", encoding="utf-8")
    manifesto = {"sources": [{"path": ".", "patterns": ["*.md"], "recursive": True}]}

    alvos = asyncio.run(rag._collect_target_files_async(manifesto, tmp_path))
    assert not any(Path(f).name == MARCADOR_SUPERADO for f in alvos)


def test_a_exclusao_funciona_com_base_path_relativo(rag, tmp_path, monkeypatch):
    """O defeito da primeira versão, travado -- e a primeira versão DESTE teste
    também não o pegava.

    Ela passava `Path(str(tmp_path)) / "." / ""`, que continua **absoluto**, e
    por isso a mutação que remove `base_path.resolve()` passava intacta. Nome
    prometendo uma grandeza que a medição não cobria. Agora o teste entra no
    diretório e passa `Path(".")` de verdade -- que é a forma que o chamador de
    produção usa, e a que quebrou."""
    from memory_rag import MARCADOR_SUPERADO  # noqa: PLC0415

    for nome in ("morta", "viva"):
        (tmp_path / nome).mkdir()
        (tmp_path / nome / "doc.md").write_text("# x\n\nconteudo de teste.\n", encoding="utf-8")
    (tmp_path / "morta" / MARCADOR_SUPERADO).write_text("# Superseded\n", encoding="utf-8")
    manifesto = {"sources": [{"path": ".", "patterns": ["*.md"], "recursive": True}]}

    monkeypatch.chdir(tmp_path)
    alvos = asyncio.run(rag._collect_target_files_async(manifesto, Path(".")))

    # CONTROLE POSITIVO, e ele nao e zelo: sem esta linha o teste passava VAZIO.
    # `not any(...)` sobre uma colecao sem elementos e verdadeiro, e foi assim
    # que a mutacao que remove o `.resolve()` atravessou o teste intacta.
    assert any("viva" in str(f) for f in alvos), (
        "nenhum alvo foi descoberto -- a assercao abaixo passaria por vacuidade"
    )
    assert not any("morta" in str(f) for f in alvos), (
        "a exclusao voltou a depender da FORMA do caminho, nao do caminho"
    )
