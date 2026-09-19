"""G6b: o commit que apaga ou move um arquivo citado por documento prescritivo e barrado no commit.

Medido em 2026-09-18: duas vezes num dia um push caiu na suite do pre-push porque um
commit ja aprovado tinha apagado ou movido arquivo que um registro citava. A G6 so
olhava documento em stage; o documento que cita nao estava. Estes testes fixam que a
cobranca acontece no commit, e que a saida legitima (referencias_nao_resolviveis) passa.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name
import importlib
from pathlib import Path
import subprocess
import sys

import pytest

RAIZ = Path(__file__).resolve().parent.parent


def _git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True, check=True)


def _gate(repo: Path):
    sys.path.insert(0, str(RAIZ / "scripts" / "ops"))
    try:
        modulo = importlib.reload(importlib.import_module("record_gate"))
    finally:
        sys.path.pop(0)
    modulo.RAIZ = repo  # pyright: ignore[reportAttributeAccessIssue]
    return modulo


@pytest.fixture(name="repo")
def fixture_repo(tmp_path: Path) -> Path:
    """README na raiz (sempre prescritivo) citando `scripts/alvo.py`, tudo commitado."""
    repo = tmp_path / "repo"
    (repo / "scripts").mkdir(parents=True)
    _git(repo, "init", "-q", "-b", "main")
    _git(repo, "config", "user.email", "teste@exemplo.invalid")
    _git(repo, "config", "user.name", "Teste")
    (repo / "scripts" / "alvo.py").write_text("x = 1\n", encoding="utf-8")
    (repo / "README.md").write_text("Rode `scripts/alvo.py` antes de tudo.\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "base")
    return repo


@pytest.mark.unit
def test_apagar_arquivo_citado_reprova_no_commit(repo: Path) -> None:
    _git(repo, "rm", "-q", "scripts/alvo.py")
    gate = _gate(repo)
    erros = gate.citacoes_ao_que_o_commit_remove(gate.arquivos_em_stage())
    assert len(erros) == 1
    assert "README.md" in erros[0]
    assert "scripts/alvo.py" in erros[0]


@pytest.mark.unit
def test_mover_arquivo_citado_reprova_pelo_nome_antigo(repo: Path) -> None:
    _git(repo, "mv", "scripts/alvo.py", "scripts/novo.py")
    gate = _gate(repo)
    assert gate.caminhos_removidos_em_stage() == ["scripts/alvo.py"]
    assert gate.citacoes_ao_que_o_commit_remove(gate.arquivos_em_stage())


@pytest.mark.unit
def test_commit_que_nao_remove_nada_nao_cobra(repo: Path) -> None:
    """Controle negativo: sem remocao, a G6b fica muda."""
    (repo / "scripts" / "alvo.py").write_text("x = 2\n", encoding="utf-8")
    _git(repo, "add", "-A")
    gate = _gate(repo)
    assert gate.citacoes_ao_que_o_commit_remove(gate.arquivos_em_stage()) == []


@pytest.mark.unit
def test_registro_historico_que_declara_o_caminho_passa(repo: Path) -> None:
    """A saida legitima para registro publicado: declarar, sem reescrever o corpo."""
    (repo / "reports").mkdir()
    (repo / "reports" / "REGISTRO-x.md").write_text(
        "---\nid: registro-x\nreferencias_nao_resolviveis:\n  - scripts/alvo.py\n---\n\nUsei `scripts/alvo.py`.\n",
        encoding="utf-8",
    )
    (repo / "README.md").write_text("Sem citacao.\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "registro")
    _git(repo, "rm", "-q", "scripts/alvo.py")
    gate = _gate(repo)
    assert gate.citacoes_ao_que_o_commit_remove(gate.arquivos_em_stage()) == []
