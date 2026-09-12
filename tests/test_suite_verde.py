"""Guards do caminho de menos demora -- scripts/ops/suite_verde.py.

O risco de um cache de verificacao nao e ser lento: e servir um VERDE VENCIDO.
Cada teste aqui corresponde a uma forma concreta de isso acontecer, e as tres
primeiras foram achadas escrevendo o proprio script em 2026-09-12.
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM = RAIZ / "scripts" / "ops" / "suite_verde.py"


def _modulo():
    spec = importlib.util.spec_from_file_location("suite_verde", ORIGEM)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


sv = _modulo()


def test_a_chave_e_a_arvore_de_conteudo_e_nao_o_commit(tmp_path):
    """O ganho inteiro depende disto, e o primeiro desenho errava.

    Chaveando por HEAD, medir antes de commitar nunca ajudaria o push: commitar
    muda o HEAD. Mas o commit apenas REGISTRA a arvore que ja estava no disco, e
    e essa arvore que a suite mediu.

    HERMETICO de proposito. A primeira versao deste teste media o repositorio
    real e reprovou por haver um arquivo nao rastreado no momento -- resultado
    que depende do estado de trabalho de quem roda nao e assercao, e flaky em
    guard de cache e pior que ausencia de guard.
    """

    def g(*args: str) -> str:
        return subprocess.run(
            ["git", *args], cwd=str(tmp_path), capture_output=True, text=True, check=False
        ).stdout.strip()

    g("init", "-q")
    g("config", "user.email", "t@t")
    g("config", "user.name", "t")
    (tmp_path / "a.txt").write_text("um", encoding="utf-8")
    g("add", "-A")
    g("commit", "-qm", "base")

    (tmp_path / "a.txt").write_text("dois", encoding="utf-8")
    g("add", "-A")

    stash = g("stash", "create")
    arvore_do_conteudo = g("rev-parse", f"{stash}^{{tree}}")
    arvore_do_indice = g("write-tree")
    assert arvore_do_conteudo and arvore_do_indice
    assert arvore_do_conteudo == arvore_do_indice, (
        "a arvore do conteudo difere da que o commit teria; o cache nao sobreviveria ao commit"
    )

    g("commit", "-qm", "muda")
    assert g("rev-parse", "HEAD^{tree}") == arvore_do_conteudo, (
        "depois do commit a arvore mudou; a chave escolhida nao e estavel"
    )


def test_submodulo_sujo_nao_pode_passar_por_arvore_limpa(monkeypatch):
    """`ignore = dirty` esconde fonte modificada dentro dos oito submodulos.

    A suite LE o estado deles em tests/test_patches_skills.py. Se a checagem
    usasse o `git status` padrao, o cache diria verde sobre uma arvore que mudou
    onde ele nao olhou -- a classe de defeito que esta base passou 2026-09-12
    consertando.
    """
    monkeypatch.setattr(sv, "_git", lambda *a: " M skills/gemini-supermemory/src/x.js\n" if a[0] == "status" else "")
    pode, porque = sv.cacheavel()
    assert pode is False
    assert "submodulo" in porque


def test_a_checagem_enxerga_dentro_do_submodulo():
    """Nao basta o comportamento certo hoje: a flag tem de estar la.

    Sem `--ignore-submodules=none` o defeito acima volta em silencio, e ele nao
    produz falha -- produz verde.
    """
    fonte = ORIGEM.read_text(encoding="utf-8")
    assert "--ignore-submodules=none" in fonte


def test_nao_rastreado_torna_o_estado_nao_cacheavel(monkeypatch):
    """`git stash create` nao representa arquivo nao rastreado.

    Um `.py` novo em tests/ muda o resultado da suite e nao entra na arvore; usar
    essa arvore como chave seria afirmar sobre um estado que ela nao descreve.
    """
    monkeypatch.setattr(sv, "_git", lambda *a: "tests/test_novo.py\n" if a[0] == "ls-files" else "")
    pode, porque = sv.cacheavel()
    assert pode is False
    assert "nao rastreado" in porque


def test_marcador_de_contrato_antigo_nao_vale(monkeypatch, tmp_path):
    """Mudar o significado do marcador sem mudar a versao serviria verde vencido."""
    marcador = tmp_path / "marca"
    marcador.write_text(json.dumps({"contrato": 0, "arvore": "deadbeef"}), encoding="utf-8")
    monkeypatch.setattr(sv, "MARCADOR", marcador)
    monkeypatch.setattr(sv, "cacheavel", lambda: (True, ""))
    monkeypatch.setattr(sv, "arvore_de_conteudo", lambda: "deadbeef")
    vale, porque = sv.cache_valido()
    assert vale is False
    assert "contrato" in porque


def test_conteudo_diferente_invalida(monkeypatch, tmp_path):
    marcador = tmp_path / "marca"
    marcador.write_text(json.dumps({"contrato": sv.VERSAO_DO_CONTRATO, "arvore": "aaaa"}), encoding="utf-8")
    monkeypatch.setattr(sv, "MARCADOR", marcador)
    monkeypatch.setattr(sv, "cacheavel", lambda: (True, ""))
    monkeypatch.setattr(sv, "arvore_de_conteudo", lambda: "bbbb")
    vale, porque = sv.cache_valido()
    assert vale is False
    assert "conteudo mudou" in porque


def test_conteudo_igual_vale(monkeypatch, tmp_path):
    marcador = tmp_path / "marca"
    marcador.write_text(
        json.dumps({"contrato": sv.VERSAO_DO_CONTRATO, "arvore": "cafe", "em": "2026-09-12T18:00:00-03:00"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(sv, "MARCADOR", marcador)
    monkeypatch.setattr(sv, "cacheavel", lambda: (True, ""))
    monkeypatch.setattr(sv, "arvore_de_conteudo", lambda: "cafe")
    vale, porque = sv.cache_valido()
    assert vale is True
    assert "ja medido verde" in porque


def test_suite_reprovada_apaga_o_marcador(monkeypatch, tmp_path):
    """Verde vencido e pior que nenhum verde: ele descreve outro estado."""
    marcador = tmp_path / "marca"
    marcador.write_text(json.dumps({"contrato": sv.VERSAO_DO_CONTRATO, "arvore": "cafe"}), encoding="utf-8")
    monkeypatch.setattr(sv, "MARCADOR", marcador)
    monkeypatch.setattr(sv.subprocess, "run", lambda *a, **k: subprocess.CompletedProcess(a, 1))
    assert sv.rodar_suite([]) == 1
    assert not marcador.exists(), "a reprovacao deixou o marcador anterior no lugar"


@pytest.mark.parametrize("acao", ["check", "ensure", "run", "invalidate"])
def test_as_quatro_acoes_estao_documentadas_no_cabecalho(acao):
    """Horizontalidade: outro condutor tem de achar o caminho lendo o arquivo."""
    fonte = ORIGEM.read_text(encoding="utf-8")
    assert acao in fonte


def test_o_hook_de_pre_push_usa_o_mesmo_comando():
    """Um caminho so. Se o hook divergir do comando documentado, ha dois.

    Duas formas de medir a mesma coisa e o que a SS3 chama de fonte paralela, e
    aqui ela custaria justamente o ganho: o condutor rodaria uma e o hook, outra.
    """
    hook = (RAIZ / ".husky" / "pre-push").read_text(encoding="utf-8")
    assert "scripts/ops/suite_verde.py" in hook
    assert "-m pytest" not in hook, "o hook voltou a chamar pytest direto, contornando o cache"
