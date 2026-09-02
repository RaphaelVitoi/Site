"""O portao tem de julgar o que vai para o COMMIT, nao o que esta na tela.

Ate 2026-08-29 `record_gate` pegava a LISTA de arquivos do indice
(`git diff --cached --name-only`) e depois lia o CONTEUDO do disco. Sao dois
estados diferentes: `git add` congela uma versao e a edicao seguinte nao entra
no commit, mas entrava na leitura.

Isso ja aprovou, nesta casa, conteudo que nao foi commitado -- pendencia 14. Os
dois testes abaixo encenam o desacordo nas duas direcoes, porque so uma delas e
perigosa e a outra e o falso positivo que a correcao nao pode criar.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name,protected-access

import subprocess

import pytest

from scripts.ops import record_gate

BOM = """---
id: registro-de-teste
tipo: registro
---

# corpo
"""


def _git(repo, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


@pytest.fixture
def repo(tmp_path, monkeypatch):
    """Repositorio de verdade, minusculo, com o portao apontado para ele."""
    _git(tmp_path, "init", "-q")
    _git(tmp_path, "config", "user.email", "t@t")
    _git(tmp_path, "config", "user.name", "t")
    (tmp_path / "reports").mkdir()
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    return tmp_path


def test_le_o_indice_e_nao_a_arvore(repo):
    """Direcao perigosa: STAGE quebrado, arvore consertada.

    Se o portao lesse a arvore, veria o conserto e aprovaria -- e o commit
    levaria o quebrado. Esta e a falha que a pendencia 14 nomeia.
    """
    alvo = repo / "reports" / "X.md"
    alvo.write_text("sem frontmatter nenhum\n", encoding="utf-8")
    _git(repo, "add", "reports/X.md")

    # a arvore muda DEPOIS do add: este conteudo nao vai para o commit
    alvo.write_text(BOM, encoding="utf-8")

    lido = record_gate.texto_como_vai_ao_commit("reports/X.md")
    assert lido == "sem frontmatter nenhum\n", (
        "o portao leu a arvore. O commit levaria o conteudo do indice, e o julgamento teria recaido sobre outro texto."
    )
    assert not record_gate._e_prescritivo("reports/X.md"), "classificou pelo frontmatter que so existe na arvore"


def test_stage_bom_e_arvore_quebrada_continua_bom(repo):
    """Direcao inversa: o conserto nao pode virar falso positivo.

    Rascunho quebrado no disco depois de um `git add` correto e rotina. O
    commit leva o que foi congelado, e o portao tem de concordar com ele.
    """
    alvo = repo / "reports" / "Y.md"
    alvo.write_text(BOM, encoding="utf-8")
    _git(repo, "add", "reports/Y.md")

    alvo.write_text("rascunho quebrado\n", encoding="utf-8")

    assert record_gate.texto_como_vai_ao_commit("reports/Y.md") == BOM
    assert record_gate._e_prescritivo("reports/Y.md")


def test_fora_do_indice_cai_para_a_arvore(repo):
    """A queda para a arvore existe e e deliberada.

    Os testes de `referencias_mortas` montam arvore sem `git add`, e caminho
    fora do indice nao tem outra fonte. Isso nao reabre o buraco: em
    `verificar()` os caminhos vem de `--cached`, entao estao sempre no indice.
    """
    (repo / "reports" / "Z.md").write_text(BOM, encoding="utf-8")
    assert record_gate.texto_como_vai_ao_commit("reports/Z.md") == BOM
    assert record_gate.texto_como_vai_ao_commit("reports/nao-existe.md") is None
