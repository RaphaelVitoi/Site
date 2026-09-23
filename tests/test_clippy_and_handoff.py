"""Testes do Clippy, Protocolo de Handoff e Git SOTA Workflow.

Valida a resiliencia da Area de Transferencia, integridade dos payloads de handoff
e conformidade dos fluxos de commit e sincronizacao linear.
"""

from __future__ import annotations

from pathlib import Path
import sys
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from typer.testing import CliRunner

from engine.clippy_clipboard import ClippyClipboard
from scripts.cli import nexus
from scripts.cli.nexus import app
from scripts.ops.git_sota_workflow import GitSotaWorkflow

runner = CliRunner()


@pytest.fixture(autouse=True)
def isolate_cli_hygiene_spawn(monkeypatch: pytest.MonkeyPatch) -> None:
    """Nao inicia o processo de higiene nos testes de comando da CLI."""
    subprocess_proxy = SimpleNamespace(**vars(nexus.subprocess))
    subprocess_proxy.Popen = MagicMock()
    monkeypatch.setattr(nexus, "subprocess", subprocess_proxy)


def test_clippy_clipboard_copy_and_empty_check():
    assert not ClippyClipboard.copy("")
    with patch.object(sys, "platform", "win32"), patch("subprocess.Popen") as mock_popen:
        mock_proc = MagicMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = ("", "")
        mock_popen.return_value = mock_proc

        payload = "Teste de Copia SOTA v8.0 GOLD"
        assert ClippyClipboard.copy(payload) is True
        mock_proc.communicate.assert_called_once_with(input=payload)

    # Teste de falha quando todos os backends falham
    with (
        patch.object(sys, "platform", "linux"),
        patch("engine.clippy_clipboard.pyperclip", None),
    ):
        assert ClippyClipboard.copy("Texto sem backend disponivel") is False


def test_clippy_assemble_and_copy_handoff():
    with patch.object(ClippyClipboard, "copy", return_value=True) as mock_copy:
        res = ClippyClipboard.assemble_and_copy_handoff(
            summary="Sessao concluida com 10/10 fases verdes no Quality Gate.",
            files_modified=["engine/clippy_clipboard.py", "scripts/cli/nexus.py"],
            test_status="SUCESSO (0E/0W)",
            decisions=["Substituicao de gemini-3.1 por qwen2.5-coder:7b-instruct-q5_K_M e gemma4:31b-cloud"],
            next_tasks=["Validar endpoints de inferencia"],
            continuity_prompt="Continue a partir da validacao dos clusters.",
        )
        assert res["success"] is True
        assert isinstance(res["char_count"], int)
        assert res["char_count"] > 100
        mock_copy.assert_called_once()
        copied_text = mock_copy.call_args[0][0]
        assert "PROTOCOLO DE HANDOFF SOTA" in copied_text
        assert "RESUMO EXECUTIVO DA SESSAO:" in copied_text
        assert "engine/clippy_clipboard.py" in copied_text
        assert "PROMPT DE CONTINUACAO IMEDIATA" in copied_text


def test_git_sota_workflow_commit_validation():
    valido, _ = GitSotaWorkflow.validate_commit_message("feat(clippy): adicionar engine de clipboard resiliente")
    assert valido

    invalido_prefixo, motivo = GitSotaWorkflow.validate_commit_message("alteracao simples sem semantica")
    assert not invalido_prefixo
    assert "prefixos semanticos" in motivo

    invalido_curto, _ = GitSotaWorkflow.validate_commit_message("feat: cur")
    assert not invalido_curto


def test_nexus_clippy_command_success():
    with (
        patch.object(Path, "exists", return_value=True),
        patch.object(Path, "stat", return_value=MagicMock(st_size=256)),
        patch.object(Path, "read_text", return_value="# Handoff Mock Content"),
        patch("engine.clippy_clipboard.ClippyClipboard.copy", return_value=True) as mock_copy,
    ):
        result = runner.invoke(app, ["clippy"])
        assert result.exit_code == 0
        mock_copy.assert_called_once_with("# Handoff Mock Content")


def test_handoff_translitera_simbolos_e_declara_o_que_descarta(tmp_path):
    """Medido em 2026-09-14: o handoff gravava com `errors="ignore"` e apagava
    simbolos sem aviso -- "regra != fato" chegava ao proximo agente como
    "regra  fato". O arquivo continua ASCII (Blindagem ASCII); o que muda e que
    o simbolo semantico sobrevive e o que se perde aparece no console."""
    (tmp_path / ".claude").mkdir()
    (tmp_path / "CLAUDE.md").write_text(
        "Regra \u00a77: regra \u2260 fato \u2192 medir. Marca \U0001f600.\n", encoding="utf-8"
    )
    console_falso = MagicMock()
    with (
        patch.object(nexus, "BASE_DIR", tmp_path),
        patch.object(nexus, "console", console_falso),
        patch("engine.clippy_clipboard.ClippyClipboard.copy", return_value=True),
    ):
        assert nexus.execute_handoff(web=False, agent="chico") is True

    gravado = (tmp_path / ".claude" / "agent-memory" / "chico" / "HANDOFF_LATEST.md").read_bytes()
    assert all(b < 128 for b in gravado)
    assert b"Regra SS7: regra != fato -> medir." in gravado

    saida = " ".join(str(c.args[0]) for c in console_falso.print.call_args_list if c.args)
    assert "Handoff com perda" in saida, saida
    assert "U+1F600 x1" in saida, saida


def test_nexus_clippy_command_failure():
    with (
        patch.object(Path, "exists", return_value=True),
        patch.object(Path, "stat", return_value=MagicMock(st_size=256)),
        patch.object(Path, "read_text", return_value="# Handoff Mock Content"),
        patch("engine.clippy_clipboard.ClippyClipboard.copy", return_value=False),
    ):
        result = runner.invoke(app, ["clippy"])
        assert result.exit_code == 1
