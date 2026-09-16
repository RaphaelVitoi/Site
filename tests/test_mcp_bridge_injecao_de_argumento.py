"""Injecao de argumento na tool execute_sota_task do mcp-bridge.

Medido em 2026-09-16: a tool validava so o `agent` e repassava `description` como
argumento de `powershell -File do.ps1`. Uma descricao que comeca com traco era
lida como parametro -- "-Obliterate:C:/x" virava Obliterate=C:/x, e meia-risca ou
travessao funcionavam igual. O chamador da tool e um LLM, entao o vetor e prompt
injection. Registro: reports/REGISTRO-2026-09-16-injecao-de-argumento-no-mcp-bridge.md
"""

from __future__ import annotations

import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys

import pytest

RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def bridge():
    spec = importlib.util.spec_from_file_location("mcp_bridge_sob_teste", RAIZ / "mcp-bridge" / "server.py")
    assert spec
    assert spec.loader
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


@pytest.mark.parametrize(
    "descricao",
    ["-Obliterate:C:/x", "-Execute", "\u2013Obliterate:C:/x", "\u2014Execute:Get-Date", "\u2015FixEPERM"],
)
def test_descricao_com_prefixo_de_parametro_e_recusada_sem_executar(bridge, monkeypatch, descricao):
    chamadas: list[list[str]] = []
    monkeypatch.setattr(bridge.subprocess, "run", lambda cmd, **_k: chamadas.append(cmd))
    resposta = bridge.execute_sota_task(descricao, "@dispatcher")
    assert "Erro de Seguranca" in resposta
    assert chamadas == [], "a descricao perigosa chegou ao powershell"


@pytest.mark.parametrize("descricao", ["tarefa normal", " -Obliterate:C:/x", "refatorar o modulo -x", "@chico revisar"])
def test_descricao_legitima_segue_para_o_do_ps1(bridge, monkeypatch, descricao):
    chamadas: list[list[str]] = []

    class _Resultado:
        returncode = 0
        stdout = "ok"
        stderr = ""

    def _run(cmd, **_k):
        chamadas.append(cmd)
        return _Resultado()

    monkeypatch.setattr(bridge.subprocess, "run", _run)
    assert bridge.execute_sota_task(descricao, "@dispatcher") == "ok"
    assert chamadas[0][-2:] == [descricao, "@dispatcher"]


@pytest.mark.skipif(sys.platform != "win32" or not shutil.which("powershell"), reason="exige Windows PowerShell")
@pytest.mark.parametrize(
    ("descricao", "recusada_pelo_guard"),
    [("-Obliterate:C:/x", True), ("\u2014Obliterate:C:/x", True), (" -Obliterate:C:/x", False)],
)
def test_o_predicado_bate_com_o_parser_real_do_powershell(bridge, tmp_path, descricao, recusada_pelo_guard):
    """Contraprova contra o parser real: o guard recusa exatamente o que o PowerShell leria como parametro."""
    sonda = tmp_path / "sonda.ps1"
    sonda.write_text(
        "[CmdletBinding(PositionalBinding = $false)]\n"
        "param([Parameter(Position = 0, ValueFromRemainingArguments = $true)][string[]]$Description,"
        " [string]$Obliterate)\n"
        "if ($Obliterate) { 'PARAMETRO' } else { 'DESCRICAO' }\n",
        encoding="utf-8-sig",
    )
    r = subprocess.run(  # noqa: S603, S607  # Record-Id: registro-2026-09-16-injecao-de-argumento-no-mcp-bridge
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(sonda), descricao, "@dispatcher"],
        capture_output=True,
        text=True,
        check=False,
        timeout=60,
    )
    lido_como_parametro = r.stdout.strip() == "PARAMETRO"
    assert lido_como_parametro is recusada_pelo_guard
    assert bridge.descricao_vira_parametro(descricao) is recusada_pelo_guard
