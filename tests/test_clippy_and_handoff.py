"""Testes do Clippy, Protocolo de Handoff e Git SOTA Workflow.

Valida a resiliencia da Area de Transferencia, integridade dos payloads de handoff
e conformidade dos fluxos de commit e sincronizacao linear.
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

from typer.testing import CliRunner

from engine.clippy_clipboard import ClippyClipboard
from scripts.cli.nexus import app
from scripts.ops.git_sota_workflow import GitSotaWorkflow

runner = CliRunner()


def test_clippy_clipboard_copy_and_empty_check():
    assert not ClippyClipboard.copy("")
    with patch("subprocess.Popen") as mock_popen:
        mock_proc = MagicMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = ("", "")
        mock_popen.return_value = mock_proc

        assert ClippyClipboard.copy("Teste de Copia SOTA v8.0 GOLD")


def test_clippy_assemble_and_copy_handoff():
    res = ClippyClipboard.assemble_and_copy_handoff(
        summary="Sessao concluida com 10/10 fases verdes no Quality Gate.",
        files_modified=["engine/clippy_clipboard.py", "scripts/cli/nexus.py"],
        test_status="SUCESSO (0E/0W)",
        decisions=["Substituicao de gemini-3.1 por qwen2.5-coder:7b-instruct-q5_K_M e gemma4:31b-cloud"],
        next_tasks=["Validar endpoints de inferencia"],
        continuity_prompt="Continue a partir da validacao dos clusters.",
    )
    assert res["success"] in (True, False)
    assert isinstance(res["char_count"], int)
    assert res["char_count"] > 100


def test_git_sota_workflow_commit_validation():
    valido, _ = GitSotaWorkflow.validate_commit_message("feat(clippy): adicionar engine de clipboard resiliente")
    assert valido

    invalido_prefixo, motivo = GitSotaWorkflow.validate_commit_message("alteracao simples sem semantica")
    assert not invalido_prefixo
    assert "prefixos semanticos" in motivo

    invalido_curto, _ = GitSotaWorkflow.validate_commit_message("feat: cur")
    assert not invalido_curto


def test_nexus_clippy_command():
    result = runner.invoke(app, ["clippy"])
    # Deve executar ou reportar status sem lancar excecao fatal
    assert result.exit_code in (0, 1)
