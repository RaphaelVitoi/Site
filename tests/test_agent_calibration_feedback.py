"""Regression tests for the agent-feedback ledger writer."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
WRITER = REPOSITORY_ROOT / "scripts" / "ops" / "Register-AgentCalibrationFeedback.ps1"


@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required for the PowerShell ledger writer")
def test_feedback_ledger_preserves_fractional_score(tmp_path: Path) -> None:
    """A human score of 7.5 must not be rounded before it reaches the ledger."""
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(WRITER),
            "-Score",
            "7.5",
            "-Feedback",
            "latencia e desalinho de prioridade",
            "-LedgerPath",
            str(ledger),
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    response = json.loads(result.stdout)
    rows = [json.loads(line) for line in ledger.read_text(encoding="utf-8").splitlines()]

    assert response["status"] == "appended"
    assert rows[-1]["score"] == 7.5


@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required for the PowerShell ledger writer")
def test_feedback_ledger_records_conductor_model_and_supervision_mode(tmp_path: Path) -> None:
    """Every session must be capable of registering its exact conducting model and supervision mode."""
    ledger = tmp_path / "feedback-ledger.jsonl"
    result = subprocess.run(
        [
            "pwsh",
            "-NoProfile",
            "-File",
            str(WRITER),
            "-Score",
            "9.5",
            "-Feedback",
            "execucao precisa e alinhada",
            "-SessionId",
            "gemini-3.8-flash-site-2026-09-03",
            "-ConductorModel",
            "gemini-3.8-flash",
            "-SupervisionMode",
            "assistida",
            "-LedgerPath",
            str(ledger),
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    response = json.loads(result.stdout)
    rows = [json.loads(line) for line in ledger.read_text(encoding="utf-8").splitlines()]

    assert response["status"] == "appended"
    assert rows[-1]["conductor_model"] == "gemini-3.8-flash"
    assert rows[-1]["supervision_mode"] == "assistida"

