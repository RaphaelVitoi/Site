"""O portao de registro num merge: obrigacao de ancora e do que o merge decidiu.

Contexto medido (2026-09-01): o merge da fusao `.cerebro` -> `.claude` fez o
portao recobrar 15 revisoes de ancora ja reconciliadas na branch de origem, em
12 caminhos cujo resultado era byte a byte identico ao lado remoto. A causa e
que `git diff --cached` compara o indice com HEAD -- o PRIMEIRO pai -- e num
merge isso varre tudo que veio do outro lado.

Estes testes fixam a regra: caminho que bate com QUALQUER pai foi herdado;
caminho que difere de TODOS os pais e o que a resolucao decidiu, e so esse
carrega obrigacao de ancora.
"""

from __future__ import annotations

import importlib
from pathlib import Path
import subprocess
import sys

import pytest

RAIZ = Path(__file__).resolve().parent.parent


def _git(repo: Path, *args: str) -> str:
    r = subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True, check=True)
    return r.stdout


@pytest.fixture
def repo_em_merge(tmp_path: Path):
    """Repositorio com um merge em curso, com as tres classes de caminho.

    - `herdado_do_outro.txt`  : so o outro lado mexeu -> herdado
    - `herdado_do_nosso.txt`  : so o nosso lado mexeu -> herdado
    - `resolvido.txt`         : ambos mexeram, resolucao inventa um terceiro
                                conteudo -> e do merge
    """
    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init", "-q", "-b", "main")
    _git(repo, "config", "user.email", "teste@exemplo.invalid")
    _git(repo, "config", "user.name", "Teste")

    for nome in ("herdado_do_outro.txt", "herdado_do_nosso.txt", "resolvido.txt"):
        (repo / nome).write_text("base\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "base")

    _git(repo, "checkout", "-q", "-b", "outro")
    (repo / "herdado_do_outro.txt").write_text("do outro lado\n", encoding="utf-8")
    (repo / "resolvido.txt").write_text("versao do outro\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "outro")

    _git(repo, "checkout", "-q", "main")
    (repo / "herdado_do_nosso.txt").write_text("do nosso lado\n", encoding="utf-8")
    (repo / "resolvido.txt").write_text("versao nossa\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "nosso")

    # Conflito esperado em resolvido.txt; o merge fica em curso.
    subprocess.run(["git", "merge", "outro"], cwd=repo, capture_output=True, check=False)
    (repo / "resolvido.txt").write_text("resolucao, diferente dos dois\n", encoding="utf-8")
    _git(repo, "add", "-A")
    return repo


def _modulo_com_raiz(repo: Path):
    """Carrega record_gate apontando RAIZ para o repositorio de teste."""
    sys.path.insert(0, str(RAIZ / "scripts" / "ops"))
    try:
        modulo = importlib.import_module("record_gate")
        modulo = importlib.reload(modulo)
    finally:
        sys.path.pop(0)
    modulo.RAIZ = repo
    return modulo


@pytest.mark.unit
def test_merge_em_curso_isola_o_que_a_resolucao_decidiu(repo_em_merge: Path) -> None:
    """So o caminho que difere de TODOS os pais conta como tocado pelo merge."""
    gate = _modulo_com_raiz(repo_em_merge)

    em_stage = set(gate.arquivos_em_stage())
    herdados = gate.caminhos_herdados_de_merge()

    # O diff --cached enxerga o que veio do outro lado, e e por isso que a
    # subtracao precisa existir.
    assert "herdado_do_outro.txt" in em_stage
    assert "herdado_do_outro.txt" in herdados, "conteudo identico ao pai 'outro' -- obrigacao e de la"

    # O que veio so do NOSSO lado ja e igual a HEAD, entao `git diff --cached`
    # nem o lista: ele nunca chegava a cobrar ancora, com ou sem esta correcao.
    # A assercao existe para fixar isso -- a primeira redacao deste teste supunha
    # o contrario e foi quebrada de proposito antes de ser aceita.
    assert "herdado_do_nosso.txt" not in em_stage

    assert "resolvido.txt" not in herdados, (
        "difere dos dois pais: foi a resolucao que decidiu, e a obrigacao de ancora e deste commit"
    )
    assert em_stage - herdados == {"resolvido.txt"}


@pytest.mark.unit
def test_fora_de_merge_nada_e_dispensado(tmp_path: Path) -> None:
    """Commit comum: o conjunto de herdados e vazio e o portao nao muda."""
    repo = tmp_path / "simples"
    repo.mkdir()
    _git(repo, "init", "-q", "-b", "main")
    _git(repo, "config", "user.email", "teste@exemplo.invalid")
    _git(repo, "config", "user.name", "Teste")
    (repo / "a.txt").write_text("um\n", encoding="utf-8")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-q", "-m", "base")
    (repo / "a.txt").write_text("dois\n", encoding="utf-8")
    _git(repo, "add", "-A")

    gate = _modulo_com_raiz(repo)

    assert gate.arquivos_em_stage() == ["a.txt"]
    assert gate.caminhos_herdados_de_merge() == set(), (
        "sem MERGE_HEAD nao ha pai alternativo: nenhuma dispensa pode existir"
    )


@pytest.mark.unit
def test_dispensa_nao_vale_para_caminho_ausente_no_indice(repo_em_merge: Path) -> None:
    """Caminho fora do indice nao entra em herdados por omissao de blob."""
    gate = _modulo_com_raiz(repo_em_merge)
    assert gate._blob(":inexistente.txt") is None
    assert "inexistente.txt" not in gate.caminhos_herdados_de_merge()
